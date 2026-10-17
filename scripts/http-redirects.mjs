import fs from 'node:fs';
import path from 'node:path';

// Match the exact/wildcard rules used by Cloudflare Static Assets in local previews.
export function redirectFor(root, pathname) {
  const file=path.join(root,'_redirects');
  if(!fs.existsSync(file))return null;
  for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)) {
    if(!line.trim()||line.trim().startsWith('#'))continue;
    const [source,destination,code='302']=line.trim().split(/\s+/);
    if(source===pathname)return {location:destination,status:Number(code)};
    if(source.endsWith('/*')&&pathname.startsWith(source.slice(0,-1)))return {location:destination.replace(':splat',pathname.slice(source.length-1)),status:Number(code)};
  }
  return null;
}
