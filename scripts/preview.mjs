import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
export function startPreview(port=Number(process.env.PORT||8124)){
 if(!fs.existsSync(path.join(root,'index.html')))throw Error('Run npm run build first.');
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.gltf':'model/gltf+json','.glb':'model/gltf-binary','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.opus':'audio/ogg','.webm':'audio/webm','.mp4':'video/mp4','.ico':'image/x-icon','.wasm':'application/wasm','.webmanifest':'application/manifest+json'};
 const server=http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){if(!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'});return res.end();}file=path.join(file,'index.html');}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found');}
  const size=fs.statSync(file).size,headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);let start=0,end=size-1,code=200;
  if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),size-1):size-1;if(start>=size||start>end){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}code=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
  headers['Content-Length']=end-start+1;res.writeHead(code,headers);if(req.method==='HEAD')return res.end();const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
 });
 return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>resolve(server));});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=await startPreview();console.log(`Preacherman website: http://127.0.0.1:${server.address().port}/ (stop with Ctrl+C)`);
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.closeAllConnections();server.close(()=>process.exit(0));});
}
