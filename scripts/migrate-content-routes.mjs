import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const pillars = {alekon:'presence',multiversus:'identity','star-wars-survivor':'continuity','omega-strikers':'autonomy','retail-mage':'expression',unrooted:'connection'};
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
function initializer(source,name) {
  const match = new RegExp('\\b'+name+'=').exec(source);
  assert.ok(match,'Missing data declaration '+name);
  const start=match.index+match[0].length;
  let quote='',depth=0,end=start;
  for(;end<source.length;end++) {
    const c=source[end];
    if(quote){if(c==='\\'){end++;continue;}if(c===quote)quote='';continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if('[{('.includes(c))depth++;
    if(']})'.includes(c)){if(depth===0)break;depth--;}
    if(depth===0&&(c===','||c===';'))break;
  }
  return {start,end,text:source.slice(start,end)};
}
function replaceData(source,name,value){const {start,end}=initializer(source,name);return source.slice(0,start)+JSON.stringify(value)+source.slice(end);}

export function migrateContentRoutes(root) {
  root=path.resolve(root);
  const file = p => path.join(root,p);
  if(fs.readFileSync(file('_nuxt/B5B1E9Dr.js'),'utf8').includes('/* preman-route-aliases */'))return;
  const avatars=JSON.parse(fs.readFileSync(file('assets/avatar-catalog.json'),'utf8')).avatars;
  const aliases={...Object.fromEntries(Object.entries(pillars).map(([a,b])=>['/pillars/'+a,'/pillars/'+b])),
    ...Object.fromEntries(avatars.map(a=>['/work/'+a.legacySlug,'/avatars/'+a.key])),
    '/work/alekon':'/avatars','/work/star-wars-jedi-fallen-order':'/avatars','/work/league-of-legends':'/avatars','/work/bioshock-4':'/avatars',
    '/work':'/avatars','/get-app':'/get-preacherman','/studio':'/vision','/technical-specifications':'/whitepaper','/overworld-audio.html':'/'};
  const moves=Object.entries(aliases).filter(([a,b])=>a.startsWith('/pillars/')||a.startsWith('/work/')&&b!=='/avatars'||a==='/work'||a==='/get-app');
  // Copy only each route's own files; never copy child legacy routes into the new listing.
  for(const [oldRoute,newRoute] of moves){
    if(fs.existsSync(file(newRoute+'/index.html')))continue;
    const source=file(oldRoute),target=file(newRoute);assert.ok(fs.existsSync(source),'Missing source route '+oldRoute);
    fs.mkdirSync(target,{recursive:true});
    for(const name of fs.readdirSync(source))if(fs.statSync(path.join(source,name)).isFile())fs.copyFileSync(path.join(source,name),path.join(target,name));
  }
  const catalog=JSON.parse(fs.readFileSync(file('assets/pillar-catalog.json'),'utf8'));
  for(const p of catalog.pillars){p.key=p.preview.pillarKey;p.preview.slug.current=p.key;p.preview.tagline='';p.detail.slug.current=p.key;}
  fs.writeFileSync(file('assets/pillar-catalog.json'),JSON.stringify(catalog,null,2)+'\n');
  fs.writeFileSync(file('_nuxt/pillars-data.js'),'export const pillarDetails='+JSON.stringify(catalog.pillars.map(p=>p.detail))+';\n');
  let core=fs.readFileSync(file('_nuxt/B5B1E9Dr.js'),'utf8');
  core=replaceData(core,'DJ',catalog.pillars.map(p=>p.preview));
  // NJ is a static object/array literal exported by the original build.
  const pages=vm.runInNewContext('('+initializer(core,'NJ').text+')',Object.create(null),{timeout:1000});
  core=replaceData(core,'NJ',pages.filter(p=>p.slug?.current!=='technical-specifications'));
  for(const [name,value] of Object.entries({GJ:[],AJ:[],UJ:'Our vision for Preacherman is a digital world shaped by presence, individuality and connection. Six pillars guide what we are building.',BJ:{local:{og:'/web-app-manifest-512x512.png'}},zJ:'preacherman',HJ:'preacherman',jJ:'Vision'}))core=replaceData(core,name,value);
  core=core.replace(/\{name:"studio",path:"\/studio",component:[\s\S]*?import\.meta\.url\)\}/,'{name:"studio",path:"/studio",redirect:"/vision"}');
  fs.writeFileSync(file('_nuxt/B5B1E9Dr.js'),core);
  const direct=Object.entries(aliases).filter(([a])=>!['/studio','/technical-specifications','/overworld-audio.html'].includes(a)).sort((a,b)=>b[0].length-a[0].length);
  for(const name of walk(root).filter(f=>/\.(html|js|json)$/.test(f))){
    // Redirect documents are regenerated below. Patch canonical links and Nuxt's escaped paths alike.
    let text=fs.readFileSync(name,'utf8');
    for(const [oldRoute,newRoute] of direct){
      const escaped=oldRoute.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      text=text.replace(new RegExp(escaped+'(?=[/"\'`?#\\\\]|$)','g'),newRoute);
      text=text.replaceAll(oldRoute.replaceAll('/','\\u002F'),newRoute.replaceAll('/','\\u002F'));
    }
    text=text.replaceAll('get-app','get-preacherman').replaceAll('© Overworld','© Preacherman');
    text=text.replace('Selected game audio projects by Overworld.','Explore the Preacherman avatar collection.').replace('title:"Projects"','title:"Avatars"');
    if(name.endsWith('DTYQ_954.js'))text=text.replace('"/studio"','"/vision"');
    fs.writeFileSync(name,text);
  }
  core=fs.readFileSync(file('_nuxt/B5B1E9Dr.js'),'utf8');
  if(!core.includes('/* preman-route-aliases */')){
    const redirects=Object.entries(aliases).map(([from,to])=>({path:from,redirect:to}));
    core=core.replace('Q0=[','Q0=[/* preman-route-aliases */...'+JSON.stringify(redirects)+',');
    fs.writeFileSync(file('_nuxt/B5B1E9Dr.js'),core);
  }
  let component=fs.readFileSync(file('_nuxt/PillarDetail.js'),'utf8');
  component=component.replace(/pillarHead\(\{title:"preacherman"[\s\S]*?ogUrl:\(\)=>"https:\/\/preacherman.ai"\+c.path\}\);/,'ke({});');
  fs.writeFileSync(file('_nuxt/PillarDetail.js'),component);
  const homeFile=file('_nuxt/BRgeLmVy.js');
  fs.writeFileSync(homeFile,fs.readFileSync(homeFile,'utf8').replace(/const L=Ce\(\)\.public.siteUrl[\s\S]*?j\?\.services;/,''));
  const icon='data:image/svg+xml;base64,'+fs.readFileSync(file('favicon.svg')).toString('base64');
  const rules=[];
  for(const [from,to] of Object.entries(aliases)){
    const targets=from.endsWith('.html')?[from]:[from,from+'/',from+'/index.html'];
    for(const source of targets)rules.push(`${source} ${to} 301`);
    if(!from.endsWith('.html'))rules.push(`${from}/* ${to==='/'?'':to}/:splat 301`);
    const targetFile=file(from.endsWith('.html')?from:from+'/index.html');fs.mkdirSync(path.dirname(targetFile),{recursive:true});
    fs.writeFileSync(targetFile,`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>preacherman</title><meta name="robots" content="noindex,follow"><link rel="icon" type="image/svg+xml" href="${icon}"><link rel="canonical" href="https://preacherman.ai${to}"><meta http-equiv="refresh" content="0;url=${to}"><script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script></head><body><a href="${to}">Continue to Preacherman</a></body></html>`);
  }
  // Exact redirects precede catch-all aliases so detail addresses retain their destination.
  rules.sort((a,b)=>Number(a.split(' ')[0].includes('*'))-Number(b.split(' ')[0].includes('*')));
  fs.writeFileSync(file('_redirects'),rules.join('\n')+'\n');
  fs.writeFileSync(file('assets/route-aliases.json'),JSON.stringify(aliases,null,2)+'\n');
  console.log(`Migrated six pillars, twelve avatars and Get Preacherman; ${Object.keys(aliases).length} old addresses redirect.`);
}
