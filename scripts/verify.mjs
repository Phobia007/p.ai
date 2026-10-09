import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export function verify(root){
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{assert.ok(!e.isSymbolicLink(),'Symlink not allowed');return e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)];});
 const files=walk(root),errors=[];let bytes=0,htmlCount=0;
 for(const file of files){const rel=path.relative(root,file).replaceAll('\\','/'),data=fs.readFileSync(file);bytes+=data.length;
  if(data.length>25*1024*1024)errors.push(`${rel}: exceeds Cloudflare static asset size limit`);
  if(/(^|\/)(?:node_modules|RECON|\.git|\.env|\.file-versions)(?:\/|$)|\.artifact\.json$/.test(rel))errors.push(`${rel}: development-only file`);
  if(/\.(?:html|js|css|json|svg|glsl)$/.test(rel)){
   const text=data.toString('utf8');
   if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp|github_pat|sb_secret)_[A-Za-z0-9_]{16,}|\bsk-(?:proj-)?[A-Za-z0-9_-]{30,}/.test(text))errors.push(`${rel}: possible private credential`);
   if(/(?:[CD]:[\\/]Users[\\/]|[CD]:[\\/]preacherman[\\/]|file:\/\/\/)/i.test(text))errors.push(`${rel}: workstation path`);
   if(rel.endsWith('.html')){htmlCount++;
    const title=text.match(/<title>([\s\S]*?)<\/title>/i);if(title&&title[1]!=='preacherman')errors.push(`${rel}: unexpected browser title`);
    for(const match of text.matchAll(/<(?:script|link|img|source)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)){
     const value=match[1];if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value))continue;
     const pathname=decodeURIComponent(value.split(/[?#]/)[0]);if(!pathname)continue;
     const target=pathname.startsWith('/')?path.join(root,pathname):path.resolve(path.dirname(file),pathname);
     if(!fs.existsSync(target))errors.push(`${rel}: missing ${value}`);
    }
   }
  }
 }
 for(const route of ['index.html','vision/index.html','accessories/index.html','whitepaper/index.html','contact/index.html','get-app/index.html'])assert.ok(fs.existsSync(path.join(root,route)),`Missing route ${route}`);
 const get=fs.readFileSync(path.join(root,'get-app/index.html'),'utf8');assert.ok(get.includes('Get Preacherman')&&get.includes('data-platform="website"'),'Get Preacherman content missing');
 assert.ok(fs.readFileSync(path.join(root,'contact/index.html'),'utf8').includes('Preachermanai@outlook.com'),'Contact email missing');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'site.webmanifest'),'utf8'));assert.equal(manifest.name,'preacherman');
 for(const icon of manifest.icons)assert.ok(fs.existsSync(path.join(root,icon.src.split('?')[0])),`Missing manifest icon ${icon.src}`);
 const icon=fs.readFileSync(path.join(root,'favicon.svg'));
 assert.equal(createHash('sha256').update(icon).digest('hex'),'2d3547187f3e85dedeaf33b59d7a90f78b1c21d43486ca441158bc59403ff91c','Favicon must match preachermanai.com exactly');
 const faviconHref='data:image/svg+xml;base64,'+icon.toString('base64');
 for(const file of files.filter(f=>f.endsWith('.html'))){const text=fs.readFileSync(file,'utf8');if(text.includes('<title>'))assert.ok(text.includes(`href="${faviconHref}"`),`Source-site favicon missing: ${file}`);}
 assert.equal(errors.length,0,errors.join('\n'));const report={files:files.length,htmlRoutes:htmlCount,bytes};console.log(JSON.stringify(report));return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))verify(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist'));
