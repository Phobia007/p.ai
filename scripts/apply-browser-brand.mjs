import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function applyBrowserBrand(root){
 const iconSource=path.join(root,'assets/browser-brand');
 if(fs.existsSync(iconSource))for(const name of fs.readdirSync(iconSource))fs.copyFileSync(path.join(iconSource,name),path.join(root,name));
 const runtime=path.join(root,'_nuxt/B5B1E9Dr.js');
 let source=fs.readFileSync(runtime,'utf8');
 source=source.replace('kne=og?.siteName,Nne=og?.siteTitle','kne="preacherman",Nne="preacherman"');
 source=source.replace('titleTemplate:e=>e?`${e} — ${kne}`:Nne','titleTemplate:()=>"preacherman"');
 if(!source.includes('titleTemplate:()=>"preacherman"'))throw Error('Browser title template missing');
 fs.writeFileSync(runtime,source);
 const entries=['index.html','overworld-audio.html','accessories','contact','get-app','pillars','studio','technical-specifications','vision','whitepaper','work'];
 const walk=p=>fs.statSync(p).isDirectory()?fs.readdirSync(p).flatMap(n=>walk(path.join(p,n))):[p];
 const files=entries.flatMap(name=>walk(path.join(root,name))).filter(f=>f.endsWith('.html'));
 for(const file of files){
  let html=fs.readFileSync(file,'utf8').replace(/<title>[\s\S]*?<\/title>/i,'<title>preacherman</title>');
  html=html.replace(/(<link\b[^>]*href=["'][^"']*(?:favicon\.svg|favicon\.ico|favicon-96x96\.png|apple-touch-icon\.png|site\.webmanifest))(?:\?[^"']*)?(["'])/g,'$1?v=preacherman-20261009$2');
  html=html.replace(/(<meta\b[^>]*(?:property|name)=["'](?:og:site_name|application-name|apple-mobile-web-app-title)["'][^>]*content=["'])[^"']*(["'])/g,'$1preacherman$2');
  fs.writeFileSync(file,html);
 }
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'site.webmanifest'),'utf8'));
 Object.assign(manifest,{name:'preacherman',short_name:'preacherman',icons:[{src:'/web-app-manifest-192x192.png?v=preacherman-20261009',sizes:'192x192',type:'image/png',purpose:'any'},{src:'/web-app-manifest-512x512.png?v=preacherman-20261009',sizes:'512x512',type:'image/png',purpose:'any'}]});
 fs.writeFileSync(path.join(root,'site.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
 console.log(`Updated browser branding on ${files.length} pages.`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))applyBrowserBrand(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public'));
