import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SITE = 'https://preacherman.ai';
const BRAND = 'preacherman';
const CONTACT = 'For product questions, feedback or collaboration, write to us. We welcome conversations with creators, developers, IP partners and investors.';
const IMAGE = `${SITE}/web-app-manifest-512x512.png`;
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c');

export function createSiteMetadata(root) {
  const navigation = JSON.parse(fs.readFileSync(path.join(root, 'assets/navigation-pages.json'), 'utf8'));
  const avatars = JSON.parse(fs.readFileSync(path.join(root, 'assets/avatar-catalog.json'), 'utf8')).avatars;
  const pillars = JSON.parse(fs.readFileSync(path.join(root, 'assets/pillar-catalog.json'), 'utf8')).pillars;
  const vision = navigation.find(page => page.slug === 'vision');
  const description = clean(vision?.intro || 'Find and Build a Second You Here.');
  const records = {};
  const add = (route, label, text, noindex = false, type = 'WebPage') => {
    records[route] = {route, label, title: BRAND, socialTitle: label === 'Preacherman' ? BRAND : `${label} — Preacherman`, description: clean(text), canonical: SITE + (route === '/' ? '/' : route), robots: noindex ? 'noindex, follow' : 'index, follow', image: IMAGE, type};
  };
  add('/', 'Preacherman', description);
  for (const page of navigation) {
    const slug = page.slug === 'get-app' ? 'get-preacherman' : page.slug;
    const text = slug === 'get-preacherman'
      ? `${clean(page.heading)} Explore Windows, macOS and web options for Preacherman.`
      : page.intro;
    add(`/${slug}`, page.title, text);
  }
  add('/contact', 'Contact', CONTACT, false, 'ContactPage');
  add('/avatars', 'Avatars', 'Explore the Preacherman avatar gallery.', false, 'CollectionPage');
  add('/avatars/virtual-human-test', 'virtual human test', 'An animated virtual human experiment with optional music in the Preacherman gallery.');
  for (const avatar of avatars) add(`/avatars/${avatar.key}`, avatar.title, `Explore ${avatar.title} in the Preacherman avatar gallery.`);
  for (const pillar of pillars) {
    const key = pillar.preview.pillarKey || pillar.key;
    const detail = pillar.detail;
    const blank = !detail.title && !detail.description && !detail.content?.length;
    const text = blank ? '' : detail.description;
    add(`/pillars/${key}`, pillar.preview.title, text, blank);
  }
  return records;
}

export function metadataGraph(record, homeDescription) {
  return {'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':`${SITE}/#website`,name:BRAND,url:`${SITE}/`,description:homeDescription,inLanguage:'en'},
    {'@type':record.type,'@id':`${record.canonical}#webpage`,url:record.canonical,name:record.socialTitle,...(record.description ? {description:record.description} : {}),isPartOf:{'@id':`${SITE}/#website`},inLanguage:'en'}
  ]};
}

function stripMetadata(html) {
  return html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*>/gi, tag => /\b(?:name|property)\s*=\s*["'](?:description|keywords|robots|googlebot|author|application-name|og:[^"']*|twitter:[^"']*)["']/i.test(tag) ? '' : tag)
    .replace(/<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
}

function renderMetadata(record, homeDescription) {
  const named = (name, value) => `<meta name="${name}" content="${escapeHtml(value)}">`;
  const property = (name, value) => `<meta property="${name}" content="${escapeHtml(value)}">`;
  return `<title>${BRAND}</title>` + named('description', record.description) + named('robots', record.robots)
    + property('og:title', record.socialTitle) + property('og:description', record.description)
    + property('og:url', record.canonical) + property('og:site_name', BRAND) + property('og:type', 'website')
    + property('og:image', IMAGE) + property('og:image:width', '512') + property('og:image:height', '512')
    + property('og:image:type', 'image/png') + property('og:image:alt', 'Preacherman logo')
    + named('twitter:card', 'summary') + named('twitter:title', record.socialTitle)
    + named('twitter:description', record.description) + named('twitter:image', IMAGE) + named('twitter:image:alt', 'Preacherman logo')
    + `<link rel="canonical" href="${escapeHtml(record.canonical)}">`
    + `<script id="preacherman-schema" data-preman-ssr type="application/ld+json">${safeJson(metadataGraph(record, homeDescription))}</script>`;
}

function replaceSiteIdentity(value) {
  if (typeof value === 'string') {
    if (value === 'Overworld' || value === 'Overworld Audio') return BRAND;
    return value.replaceAll('https://overworldaudio.com', SITE);
  }
  if (Array.isArray(value)) return value.map(replaceSiteIdentity);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceSiteIdentity(item)]));
  return value;
}

export function applySiteMetadata(root) {
  const records = createSiteMetadata(root), homeDescription = records['/'].description;
  fs.writeFileSync(path.join(root, 'assets/site-metadata.json'), JSON.stringify({siteUrl:SITE,brand:BRAND,pages:records}, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'assets/site-metadata.js'), `// Generated from current navigation and avatar/pillar catalogs.\nexport const siteMetadata=${safeJson(records)};\nexport function metadataForPath(pathname){const key=pathname.replace(/\\/+$/,"")||"/";return siteMetadata[key]||{...siteMetadata["/"],route:key,canonical:${JSON.stringify(SITE)}+key,robots:"noindex, follow"};}\nexport function graphForMetadata(record){return ${metadataGraph.toString().replace('export ', '').replaceAll('SITE', JSON.stringify(SITE)).replaceAll('BRAND', JSON.stringify(BRAND))}(record,${JSON.stringify(homeDescription)});}\n`);

  let htmlCount = 0;
  for (const [route, record] of Object.entries(records)) {
    const directory = route === '/' ? root : path.join(root, route.slice(1));
    const file = path.join(directory, 'index.html');
    if (!fs.existsSync(file)) throw new Error(`Canonical route missing before metadata generation: ${route}`);
    let html = fs.readFileSync(file, 'utf8');
    html = stripMetadata(html).replace('</head>', renderMetadata(record, homeDescription) + '</head>');
    html = html.replaceAll('https://overworldaudio.com', SITE).replaceAll('https:\\u002F\\u002Foverworldaudio.com', 'https:\\u002F\\u002Fpreacherman.ai');
    html = html.replace(/(<script\b[^>]*\bid="__NUXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, open, body, close) => open + safeJson(replaceSiteIdentity(JSON.parse(body))) + close);
    fs.writeFileSync(file, html); htmlCount++;
    const payload = path.join(directory, '_payload.json');
    if (fs.existsSync(payload)) fs.writeFileSync(payload, JSON.stringify(replaceSiteIdentity(JSON.parse(fs.readFileSync(payload, 'utf8')))));
  }

  // Every route's existing SEO composable now reads the same generated metadata as SSR.
  // Keep the arrow component and its public export unchanged.
  const seoPath = path.join(root, '_nuxt/B2Em7_D3.js');
  let seo = fs.readFileSync(seoPath, 'utf8');
  seo = seo.replace(/^import\{metadataForPath,graphForMetadata\}from"\.\.\/assets\/site-metadata\.js";\n?/, '');
  const functionAt = seo.indexOf('function b(');
  if (functionAt < 0) throw new Error('Cannot locate the shared route SEO composable');
  const prefix = seo.slice(0, functionAt).replace('document.querySelector("script[data-preman-ssr]")?.remove();\n','');
  seo = 'import{metadataForPath,graphForMetadata}from"../assets/site-metadata.js";\n' + prefix
    + 'document.querySelector("script[data-preman-ssr]")?.remove();\n'
    + 'function b(e={}){const route=T(),record=a(()=>metadataForPath(route.path));w({title:"preacherman",description:()=>record.value.description,robots:()=>record.value.robots,ogTitle:()=>record.value.socialTitle,ogDescription:()=>record.value.description,ogImage:()=>record.value.image,ogImageWidth:512,ogImageHeight:512,ogImageType:"image/png",ogImageAlt:"Preacherman logo",ogUrl:()=>record.value.canonical,ogSiteName:"preacherman",ogType:"website",twitterCard:"summary",twitterTitle:()=>record.value.socialTitle,twitterDescription:()=>record.value.description,twitterImage:()=>record.value.image,twitterImageAlt:"Preacherman logo"});E(()=>({link:[{key:"canonical",rel:"canonical",href:record.value.canonical}],script:[{key:"preacherman-schema",id:"preacherman-schema",type:"application/ld+json",innerHTML:JSON.stringify(graphForMetadata(record.value))}]}))}export{M as A,b as u};\n';
  fs.writeFileSync(seoPath, seo);

  const indexable = Object.values(records).filter(record => !record.robots.startsWith('noindex'));
  const buildMetadata=path.join(root,'_nuxt/builds/meta');
  if(fs.existsSync(buildMetadata))for(const name of fs.readdirSync(buildMetadata).filter(name=>name.endsWith('.json'))){
    const file=path.join(buildMetadata,name),data=JSON.parse(fs.readFileSync(file,'utf8'));
    if(Array.isArray(data.prerendered)){data.prerendered=Object.keys(records);fs.writeFileSync(file,JSON.stringify(data)+'\n');}
  }
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + indexable.map(record => `  <url><loc>${escapeHtml(record.canonical)}</loc></url>`).join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  return {htmlCount, indexableRoutes:indexable.length, blankPillarRoutes:Object.values(records).filter(record => record.route.startsWith('/pillars/') && record.robots.startsWith('noindex')).length};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(applySiteMetadata(path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '../public')))));
}
