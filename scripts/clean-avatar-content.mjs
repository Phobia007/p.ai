import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

// The exported site stores FJ as JSON.parse(<JSON string literal>). Parsing both
// JSON layers avoids evaluating the rest of the bundled application.
function cleanCatalog(source, avatars) {
  const pattern = /\bFJ=JSON\.parse\(("(?:[^"\\]|\\.)*")\)/;
  const match = pattern.exec(source);
  assert.ok(match, 'Expected the FJ JSON catalog in the application bundle');
  assert.equal(source.match(/\bFJ=JSON\.parse\(/g)?.length, 1);
  const projects = JSON.parse(JSON.parse(match[1]));
  assert.ok(Array.isArray(projects), 'Expected an array of avatar records');

  const bySlug = new Map();
  for (const avatar of avatars) {
    bySlug.set(avatar.key, avatar);
    if (avatar.legacySlug) bySlug.set(avatar.legacySlug, avatar);
  }
  const found = new Set();
  const cleaned = projects.flatMap((project) => {
    const avatar = bySlug.get(project.slug?.current);
    if (!avatar) return [];
    assert.ok(!found.has(avatar.key), `Duplicate avatar: ${avatar.key}`);
    found.add(avatar.key);
    return [{
      ...project,
      title: avatar.title,
      year: avatar.year,
      client: avatar.client,
      hidden: false,
      description: `${avatar.title} in the Preacherman avatar collection.`,
      tagline: `${avatar.title} in the Preacherman avatar collection.`,
      content: [],
      role: [],
      seo: null,
      slug: { ...project.slug, current: avatar.key },
    }];
  });
  assert.equal(cleaned.length, avatars.length, 'All current avatars must be retained');
  assert.deepEqual([...found].sort(), avatars.map((avatar) => avatar.key).sort());
  const replacement = `FJ=JSON.parse(${JSON.stringify(JSON.stringify(cleaned))})`;
  return source.slice(0, match.index) + replacement + source.slice(match.index + match[0].length);
}

// Restrict structural edits to known compiled component containers. Count div
// tags instead of using a lazy regex that stops at the first nested closing tag.
function divRange(source, className) {
  const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`<div\\b[^>]*class="${escapedClass}"[^>]*>`).exec(source);
  if (!match) return null;
  const tags = /<!--[^]*?-->|<\/?div\b[^>]*>/g;
  tags.lastIndex = match.index + match[0].length;
  let depth = 1;
  for (let tag; (tag = tags.exec(source));) {
    if (tag[0].startsWith('<!--')) continue;
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return { start: match.index, end: tags.lastIndex, opening: match[0] };
  }
  throw new Error(`Unclosed ${className} container`);
}

function cleanHtml(source, avatar, nextAvatar) {
  const hero = divRange(source, 'hero__text');
  assert.ok(hero, `Expected the detail text for ${avatar.key}`);
  const scope = hero.opening.match(/\sdata-v-[\w-]+(?=[\s>])/g)?.join('') ?? '';
  const meta = (label, value) => value
    ? `<div class="meta__part"${scope}><dt class="meta__label ts-a"${scope}>${label}</dt><dd class="meta__value ts-c"${scope}>${escapeHtml(value)}</dd></div>`
    : '<!---->';
  const text = `${hero.opening}<p class="cms-text"${scope} data-v-11d40530>${escapeHtml(avatar.title)} in the Preacherman avatar collection.</p><dl class="meta"${scope}><div class="meta__col"${scope}>${meta('Year', avatar.year)}${meta('Source', avatar.client)}</div><div class="meta__col"${scope}><!----></div></dl></div>`;
  source = source.slice(0, hero.start) + text + source.slice(hero.end);
  const blocks = divRange(source, 'blocks content');
  if (blocks) source = source.slice(0, blocks.start) + '<!---->' + source.slice(blocks.end);
  source = source.replace(/(<span\b[^>]*class="next__eyebrow ts-b"[^>]*>)Next project(<\/span>)/g, '$1Next avatar$2');
  let nextLinks = 0;
  source = source.replace(/<a\b[^>]*class="next"[^>]*>[\s\S]*?<\/a>/g, (link) => {
    nextLinks++;
    return link.replace(/\bhref="[^"]*"/, `href="/avatars/${nextAvatar.key}"`)
      .replace(/(<span\b[^>]*class="next__title h2"[^>]*>)[\s\S]*?(<\/span>)/,
        (_, opening, closing) => opening + escapeHtml(nextAvatar.title) + closing);
  });
  assert.equal(nextLinks, 1, `Expected one next-avatar link for ${avatar.key}`);
  assert.ok(!source.includes('class="blocks content"'), `Legacy blocks remain for ${avatar.key}`);
  assert.ok(!/<dt[^>]*>Role<\/dt>/.test(source), `Legacy role remains for ${avatar.key}`);
  return source;
}

function cleanListing(source, avatars) {
  const byKey = new Map(avatars.map((avatar) => [avatar.key, avatar]));
  let buttons = 0;
  source = source.replace(/<li\b[^>]*class="row"[^>]*>[\s\S]*?<\/li>/g, (row) => {
    const key = row.match(/href="\/avatars\/([^"/]+)\/?"/)?.[1];
    const avatar = byKey.get(key);
    assert.ok(avatar, `Unknown avatar listing row: ${key}`);
    return row.replace(/<button\b[^>]*class="[^"]*\brow__reel\b[^"]*"[^>]*>/g, (button) => {
      buttons++;
      button = button.replace(/\s(?:disabled|aria-disabled|aria-label)(?:="[^"]*")?/g, '')
        .replace(/class="([^"]*)"/, (_, classes) => {
          const names = classes.split(/\s+/).filter((name) => name !== 'btn-link--disabled');
          names.splice(names.indexOf('row__reel'), 0, 'btn-link--disabled');
          return `class="${names.join(' ')}"`;
        });
      return button.replace(/>$/, ` disabled aria-disabled="true" aria-label="Check unavailable for ${escapeHtml(avatar.title)}">`);
    });
  });
  assert.equal(buttons, avatars.length, 'Expected one disabled Check button per avatar');
  return source;
}

/** Clean the migrated static site's avatars; root is the public/export root. */
export function cleanAvatarContent(root) {
  const { avatars } = JSON.parse(fs.readFileSync(path.join(root, 'assets/avatar-catalog.json'), 'utf8'));
  assert.equal(avatars.length, 12, 'Expected the twelve authored avatars');
  const coreFile = path.join(root, '_nuxt/B5B1E9Dr.js');
  const detailFile = path.join(root, '_nuxt/Bx_VpDl2.js');
  const writes = new Map();
  writes.set(coreFile, cleanCatalog(fs.readFileSync(coreFile, 'utf8'), avatars));

  let detail = fs.readFileSync(detailFile, 'utf8');
  assert.ok(detail.includes('label:"Client"') || detail.includes('label:"Source"'), 'Expected avatar source label');
  detail = detail.replaceAll('label:"Client"', 'label:"Source"')
    .replaceAll('"Next project"', '"Next avatar"')
    .replaceAll('"Project not found"', '"Avatar not found"')
    .replaceAll('" This project has drifted off the map "', '" This avatar has drifted off the map "')
    .replaceAll('" The link may be outdated, or the project no longer exists. "', '" The link may be outdated, or the avatar no longer exists. "');
  writes.set(detailFile, detail);

  const listingFile = path.join(root, 'avatars/index.html');
  writes.set(listingFile, cleanListing(fs.readFileSync(listingFile, 'utf8'), avatars));

  for (const [index, avatar] of avatars.entries()) {
    const file = path.join(root, 'avatars', avatar.key, 'index.html');
    assert.ok(fs.existsSync(file), `Migrate the avatar route before cleaning: ${file}`);
    writes.set(file, cleanHtml(fs.readFileSync(file, 'utf8'), avatar, avatars[(index + 1) % avatars.length]));
  }
  // Validate every input before writing, so a changed build format fails before
  // any part of this content cleanup reaches the output.
  let changed = 0;
  for (const [file, output] of writes) {
    if (fs.readFileSync(file, 'utf8') === output) continue;
    fs.writeFileSync(file, output);
    changed++;
  }
  return { avatars: avatars.length, filesChanged: changed };
}
