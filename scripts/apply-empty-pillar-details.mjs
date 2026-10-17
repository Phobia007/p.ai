import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

// The six scene pillars have their own content. Never fall back to avatar projects.
// Keep this after applyPillars in the editor's preparation pipeline.
export function applyEmptyPillarDetails(root = process.cwd()) {
  const file = name => path.join(root, name);
  const catalog = JSON.parse(fs.readFileSync(file('assets/pillar-catalog.json'), 'utf8'));
  assert.equal(catalog.pillars.length, 6);
  for (const {detail} of catalog.pillars) {
    assert.ok(!detail.title && !detail.description && !detail.content?.length,
      'New pillar content requires updating its prerendered detail page.');
  }
  fs.writeFileSync(file('_nuxt/pillars-data.js'),
    'export const pillarDetails=' + JSON.stringify(catalog.pillars.map(p => p.detail)) + ';\n');

  const componentFile = file('_nuxt/PillarDetail.js');
  let component = fs.readFileSync(componentFile, 'utf8');
  if (!component.startsWith('/* empty-pillar-details */')) {
    const replace = (before, after) => {
      assert.equal(component.split(before).length, 2, 'Pillar detail anchor: ' + before);
      component = component.replace(before, after);
    };
    replace('M=pillarDetails,E=pillarDetails', 'M=pillarDetails,E=[]');
    const start = component.indexOf('a("header",{class:G(["hero",');
    const end = component.indexOf(',t(u).content?.length?', start);
    assert.ok(start > 0 && end > start);
    const header = component.slice(start, end);
    component = component.slice(0, start)
      + '(t(u).title||t(u).description||t(S)||t(Z)?' + header + ':_("",!0))'
      + component.slice(end);
    replace('class:G(["page",{"page-visible":t(o).pageReady}])',
      'class:G(["page","pillar-detail-page",{"page-visible":t(o).pageReady}]),style:{minHeight:"100svh"}');
    replace('class:"back","icon-placement"',
      'class:"back",style:{position:"fixed",left:"var(--grid-margin)",bottom:"var(--chrome-bottom)"},"icon-placement"');
    replace('a("footer",pt,[', 'a("footer",{...pt,style:{margin:0}},[');
    // Avoid inheriting the old game's SEO or its default audio-company description.
    replace('D as z}from', 'D as z,ab as pillarHead,ak as pillarSeo}from');
    const seo = 'ke({seo:()=>u.value?.seo,title:()=>u.value?.title??"Project not found",description:()=>u.value?.description??u.value?.tagline,image:()=>S.value?.local?.og??null,noindex:()=>!!u.value?.hidden});';
    replace(seo, 'pillarHead({title:"preacherman",link:[{rel:"canonical",href:()=>"https://preacherman.ai"+c.path}]});pillarSeo({description:"",ogTitle:"preacherman",ogDescription:"",ogImage:null,ogImageAlt:null,twitterTitle:"preacherman",twitterDescription:"",twitterImage:null,twitterImageAlt:null,ogUrl:()=>"https://preacherman.ai"+c.path});');
    component = '/* empty-pillar-details */\n' + component;
    fs.writeFileSync(componentFile, component);
  }

  for (const {detail} of catalog.pillars) {
    const htmlFile = file('pillars/' + detail.slug.current + '/index.html');
    let html = fs.readFileSync(htmlFile, 'utf8');
    if (!html.includes('class="page pillar-detail-page"')) {
      const start = html.indexOf('<header class="hero"');
      const end = html.indexOf('<footer class="footer"', start);
      assert.ok(start > 0 && end > start, 'Missing pillar page content: ' + htmlFile);
      html = html.slice(0, start) + '<!----><!----><!---->' + html.slice(end);
      html = html.replace('class="page" data-v-87cc8506',
        'class="page pillar-detail-page" style="min-height:100svh;" data-v-87cc8506');
      html = html.replace('<footer class="footer"', '<footer style="margin:0;" class="footer"');
      html = html.replace('style="--cloud-x:100%;" data-v-87cc8506',
        'style="--cloud-x:100%;position:fixed;left:var(--grid-margin);bottom:var(--chrome-bottom);" data-v-87cc8506');
    }
    html = html.replace(/<meta\b[^>]*(?:name|property)="(?:description|og:(?:title|description|image(?::[^" ]+)?|url)|twitter:(?:title|description|image(?::[^" ]+)?))"[^>]*>/g, '');
    html = html.replace(/<link rel="canonical"[^>]*>/g, '');
    html = html.replace('</head>', '<meta name="description" content=""><meta property="og:title" content="preacherman"><link rel="canonical" href="https://preacherman.ai/pillars/' + detail.slug.current + '"></head>');
    fs.writeFileSync(htmlFile, html);
  }
  console.log('Six pillar detail pages are empty; scene entries and overview controls remain available.');
}
