import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';

const defaultRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

// The catalog is the shared source for the browser component and crawlable HTML.
export function applyPillarDetails(root=defaultRoot){
  const file=name=>path.join(root,name);
  const catalog=JSON.parse(fs.readFileSync(file('assets/pillar-catalog.json'),'utf8'));
  assert.equal(catalog.pillars.length,6);
  const details=catalog.pillars.map(({key,detail})=>{
    assert.equal(detail.slug.current,key);
    assert.ok(detail.title&&detail.lead&&Array.isArray(detail.paragraphs)&&detail.paragraphs.length,`Missing pillar copy: ${key}`);
    assert.ok(detail.paragraphs.every(paragraph=>typeof paragraph==='string'&&paragraph.trim()),`Empty pillar paragraph: ${key}`);
    return detail;
  });
  for(const detail of details){
    const htmlFile=file(`pillars/${detail.slug.current}/index.html`);
    let html=fs.readFileSync(htmlFile,'utf8');
    const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/);
    assert.ok(main,`Missing page shell: ${detail.slug.current}`);
    let back=main[1].match(/<a\b(?=[^>]*class="[^"]*\b(?:back|pillar-detail__back)\b)[^>]*>[\s\S]*?<\/a>/)?.[0];
    assert.ok(back,`Missing overview button: ${detail.slug.current}`);
    back=back.replaceAll(' data-v-87cc8506','').replace(/class="([^"]*)"/,(_,classes)=>'class="'+classes.split(/\s+/).filter(value=>value!=='back'&&value!=='pillar-detail__back').concat('pillar-detail__back').join(' ')+'"')
      .replace(/style="[^"]*"/,'style="--cloud-x:100%;"');
    let indicator=main[1].match(/<div class="scroll-indicator [\s\S]*?<\/div><\/div><\/div>/)?.[0];
    assert.ok(indicator,`Missing scroll indicator: ${detail.slug.current}`);
    indicator=indicator.replaceAll(' data-v-87cc8506','');
    const content=`<div class="pillar-detail"><!--[--><article class="page pillar-detail-page" aria-labelledby="pillar-title"><div class="pillar-detail__content" data-pillar="${escapeHtml(detail.slug.current)}"><h1 id="pillar-title" class="pillar-detail__title">${escapeHtml(detail.title)}</h1><p class="pillar-detail__lead">${escapeHtml(detail.lead)}</p>${detail.paragraphs.map(paragraph=>`<p class="pillar-detail__paragraph">${escapeHtml(paragraph)}</p>`).join('')}</div>${back}${indicator}</article><!--]--></div>`;
    html=html.replace(main[0],main[0].replace(main[1],content));
    // The persistent site stylesheet imports page styles before any route mounts.
    html=html.replace(/<link\b[^>]*href="\/assets\/pillar-detail\.css"[^>]*>/g,'');
    fs.writeFileSync(htmlFile,html);
  }
  fs.writeFileSync(file('_nuxt/pillars-data.js'),'export const pillarDetails='+JSON.stringify(details)+';\n');
  console.log('Rendered six pillar descriptions from the shared catalog.');
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)applyPillarDetails(process.argv[2]??defaultRoot);
