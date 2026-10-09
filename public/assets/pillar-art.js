// Approved six pillar motions, rendered only for the active marker.
export function createPillarOverlay(getScene){
const root=document.createElement('div');root.className='pillar-art';
root.innerHTML="<div class=\"pillar-art__mist\" aria-hidden=\"true\"></div><svg class=\"pillar-stage\" viewBox=\"115 25 490 370\" role=\"img\" aria-labelledby=\"pillar-svg-title pillar-svg-desc\">\r\n    <title id=\"pillar-svg-title\">Presence · 存在</title>\r\n    <desc id=\"pillar-svg-desc\">沿本地 ZIMA 模型的长头型、宽肩和屈臂轮廓描光，末段减速。</desc>\r\n    <defs>\r\n      <filter id=\"pillar-soft-glow\" x=\"-100%\" y=\"-100%\" width=\"300%\" height=\"300%\"><feGaussianBlur stdDeviation=\"3\"/></filter>\r\n      <radialGradient id=\"pillar-space\"><stop stop-color=\"var(--wash)\"/><stop offset=\"1\" stop-color=\"var(--paper)\"/></radialGradient>\r\n      <linearGradient id=\"pillar-floor\"><stop stop-color=\"var(--ink)\" stop-opacity=\"0\"/><stop offset=\".5\" stop-color=\"var(--ink)\" stop-opacity=\".26\"/><stop offset=\"1\" stop-color=\"var(--ink)\" stop-opacity=\"0\"/></linearGradient>\r\n      <linearGradient id=\"pillar-id-metal\" x1=\"0\" y1=\"1\" x2=\".3\" y2=\"0\"><stop stop-color=\"var(--ink)\"/><stop offset=\".38\" stop-color=\"var(--glint)\"/><stop offset=\".48\" stop-color=\"var(--ink)\"/><stop offset=\".66\" stop-color=\"var(--faint)\"/><stop offset=\"1\" stop-color=\"var(--ink)\"/></linearGradient>\r\n      <clipPath id=\"pillar-month-clip\"><rect x=\"70\" y=\"188\" width=\"218\" height=\"44\"/></clipPath>\r\n      <clipPath id=\"pillar-year-clip\"><rect x=\"442\" y=\"188\" width=\"185\" height=\"44\"/></clipPath>\r\n    </defs>\r\n    \r\n    <g data-scene=\"presence\">\r\n      <g transform=\"translate(230 40) scale(.43)\">\r\n        <g data-presence-glow class=\"glow\"></g><g data-presence-lines></g><g data-presence-tips></g>\r\n        <g data-zima-structure></g>\r\n      </g>\r\n    </g>\r\n    <g data-scene=\"identity\" hidden>\r\n      <g data-id-plane transform=\"matrix(1 -.15 -.32 .94 66.24 66.42)\">\r\n      <path data-badge-glow class=\"line glow hot\" pathLength=\"1\" d=\"M350 118 H496 Q502 118 502 124 V290 Q502 296 496 296 H224 Q218 296 218 290 V124 Q218 118 224 118 H350\"/>\r\n      <path data-badge class=\"line\" pathLength=\"1\" d=\"M350 118 H496 Q502 118 502 124 V290 Q502 296 496 296 H224 Q218 296 218 290 V124 Q218 118 224 118 H350\"/>\r\n      <g data-id-letters></g>\r\n      <circle data-badge-tip class=\"lightdot\" r=\"2\"/>\r\n      </g>\r\n    </g>\r\n    <g data-scene=\"continuity\" hidden>\r\n      <g data-time-ticks></g>\r\n      <g clip-path=\"url(#pillar-month-clip)\"><g data-month-roll><text data-month class=\"label\" x=\"273\" y=\"219\" text-anchor=\"end\" font-size=\"26\">September</text><text data-month-next class=\"label\" x=\"273\" y=\"177\" text-anchor=\"end\" font-size=\"26\">October</text></g></g>\r\n      <g clip-path=\"url(#pillar-year-clip)\"><g data-year-roll><text data-year class=\"label\" x=\"449\" y=\"219\" font-size=\"28\">2026</text><text data-year-next class=\"label\" x=\"449\" y=\"177\" font-size=\"28\">2027</text></g></g>\r\n    </g>\r\n    <g data-scene=\"autonomy\" hidden>\r\n      <line x1=\"158\" y1=\"305\" x2=\"570\" y2=\"305\" stroke=\"url(#pillar-floor)\"/>\r\n      <path data-rear-arm class=\"line\" opacity=\".26\"/>\r\n      <path data-athlete-body-glow class=\"line hot glow\"/>\r\n      <path data-athlete-body class=\"line bodyfill\"/>\r\n      <path data-athlete-neck class=\"line bodyfill\"/>\r\n      <path data-athlete-head class=\"line bodyfill\" d=\"M15 12 Q21 0 17 -15 Q10 -27 -4 -24 Q-19 -24 -23 -10 L-25 0 L-30 6 Q-30 8 -24 9 L-23 17 Q-20 24 -12 24 L-2 21 L4 27\"/>\r\n      <path data-athlete-arm class=\"line bodyfill\"/>\r\n      <path data-athlete-seam class=\"line fine\"/>\r\n    </g>\r\n    <g data-scene=\"expression\" hidden>\r\n      <g data-expression-ribbons></g>\r\n      <path data-expression-wave class=\"line hot\"/>\r\n      <path data-expression-wave-glow class=\"line hot glow\"/>\r\n      <g data-expression-glyphs>\r\n        <text class=\"label\" font-size=\"31\" text-anchor=\"middle\">A</text>\r\n        <text class=\"label\" font-size=\"24\" text-anchor=\"middle\">a</text>\r\n        <text class=\"label\" font-size=\"23\" text-anchor=\"middle\">…</text>\r\n      </g>\r\n    </g>\r\n    <g data-scene=\"connection\" hidden>\r\n      <g data-grid-lines></g><g data-grid-nodes></g>\r\n      <circle cx=\"360\" cy=\"216\" r=\"6\" fill=\"var(--glint)\" class=\"glow\"/>\r\n      <circle cx=\"360\" cy=\"216\" r=\"2.4\" fill=\"var(--glint)\"/>\r\n    </g>\r\n  </svg>";
document.body.appendChild(root);
if(!document.querySelector('link[data-pillar-art]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./pillar-art.css',import.meta.url).href;css.dataset.pillarArt='';document.head.appendChild(css);}
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const ns = 'http://www.w3.org/2000/svg';
  function node(tag, attrs, parent) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([name,value])=>el.setAttribute(name,String(value)));
    parent.appendChild(el); return el;
  }
  const clamp = n=>Math.max(0,Math.min(1,n));
  const smooth = n=>{n=clamp(n);return n*n*(3-2*n);};
  const lerp = (a,b,t)=>a+(b-a)*t;
  const f = n=>n.toFixed(2);
  const point = p=>`${f(p.x)} ${f(p.y)}`;
  function reveal(el,p) {el.style.strokeDasharray=p>=1?'none':'1';el.style.strokeDashoffset=String(1-clamp(p));el.style.opacity=p>0?'1':'0';}
  function endPoint(path,p,dot){const q=path.getPointAtLength(path.getTotalLength()*clamp(p));dot.setAttribute('cx',q.x);dot.setAttribute('cy',q.y);dot.style.opacity=p>0&&p<1?'1':'0';}

  // Silhouette traced from the project's authored ZIMA model portrait.
  const zima={"main": ["M301 25 L282 26 L265 35 L256 44 L248 60 L245 85 L250 134 L236 135 L240 153 L254 179 L261 185 L269 207 L272 223 L270 258 L265 271 L261 275 L160 300 L138 291 L109 288 L98 292 L89 301 L75 330 L72 357 L76 383 L52 436 L46 460 L41 517 L24 594 L26 602 L44 632 L67 634 L167 666 L178 675 L198 682 L210 689 L219 689 L231 686 L224 734", "M301 25 L311 28 L328 38 L337 52 L341 66 L347 125 L349 126 L359 122 L364 123 L364 142 L354 170 L345 179 L344 184 L345 209 L351 250 L359 268 L363 272 L481 300 L530 303 L542 308 L551 317 L562 347 L561 372 L553 398 L560 417 L569 454 L569 551 L579 613 L579 660 L572 734"], "extra": ["M394 621 L397 539 L405 495 L419 465 L476 399 L486 487 L504 589 L493 612 L490 645", "M155 405 L218 467 L234 494 L243 541 L244 595 L239 598 L226 599 L214 603 L205 617 L199 617 L197 619 L145 582 L109 565 L124 527 L146 448"], "source": "public/asset-characters/busts/zima.png"};
  const bustD=zima.main;
  const bust=bustD.map(d=>{
    const glow=node('path',{d,pathLength:1,class:'line hot'},$('[data-presence-glow]'));
    const line=node('path',{d,pathLength:1,class:'line'},$('[data-presence-lines]'));
    const tip=node('circle',{r:3.3,class:'lightdot'},$('[data-presence-tips]'));
    return {line,glow,tip};
  });
  const zimaDetails=[...zima.extra,
    'M255 97 L264 157 L288 180 L321 171 L336 113',
    'M265 170 L285 180 L293 190 M313 181 L334 168',
    'M267 179 L281 182 L275 185 Z M315 179 L330 175 L324 181 Z',
    'M294 188 L290 221 L305 224 L310 201 M279 239 L301 260 L324 235',
    'M274 248 L267 270 L231 292 L183 308 M337 248 L350 273 L397 287 L472 305',
    'M178 329 L229 345 L268 358 L292 386 M329 383 L353 349 L427 330 L467 316',
    'M184 366 Q198 416 236 438 L294 448 M324 445 L368 451 Q432 432 457 384',
    'M247 473 L292 484 L357 476 L410 456 M250 518 L290 529 L352 522 L400 504',
    'M252 561 L294 572 L347 568 L395 552 M305 478 L308 599',
    'M82 355 Q70 321 98 300 Q133 280 161 303 Q186 330 163 363 Q120 397 82 355',
    'M483 321 Q505 291 537 310 Q571 326 566 367 Q555 397 518 397 Q478 382 483 321',
    'M100 407 L72 556 L153 605 M149 402 L121 551 L189 599',
    'M525 421 L537 569 L521 609 M558 413 L575 580 L562 610',
    'M185 632 L216 610 L241 603 L281 639 L297 670 M202 637 L233 662 L244 686 M222 621 L254 651 L264 682 M242 616 L274 647 L286 678'
  ].map(d=>{const el=node('path',{d,pathLength:1,class:'line'},$('[data-zima-structure]'));const b=el.getBBox();return{el,top:b.y,height:b.height};});
  function presence(t){
    const u=clamp((t-.15)/3.9);
    const p=u<.62?u/.81:1-Math.pow(1-u,2)/(.76*.81);
    bust.forEach(({line,glow,tip})=>{reveal(line,p);reveal(glow,p);endPoint(line,p,tip);});
    const scanY=25+710*p;
    zimaDetails.forEach(({el,top,height})=>{const q=clamp((scanY-top)/(height+42));reveal(el,q);el.style.opacity=String(q>0?.48:0);});
  }

  const glyphData={"paths": ["M111 0H66V670H111Z", "M523 0H244V670H523Q671 670 758.0 579.0Q845 488 845.0 335.0Q845 182 758.0 91.0Q671 0 523 0ZM523 629H289V41H523Q659 41 729.0 116.5Q799 192 799.0 335.0Q799 478 729.0 553.5Q659 629 523 629Z"], "width": 883, "capHeight": 670};
  const glyphBox=$('[data-id-letters]');
  const glyphScale=.12;
  glyphBox.setAttribute('transform',`translate(${360-glyphData.width*glyphScale/2} ${207+glyphData.capHeight*glyphScale/2}) scale(${glyphScale} ${-glyphScale})`);
  const glyphs=glyphData.paths.map(d=>node('path',{d,pathLength:1,fill:'none',stroke:'var(--ink)','stroke-width':6.5,'stroke-linecap':'round','stroke-linejoin':'round'},glyphBox));
  const glyphDepth=glyphData.paths.map(d=>node('path',{d,transform:'translate(12 -17)',fill:'var(--faint)',opacity:0},glyphBox));
  glyphs.forEach(el=>glyphBox.appendChild(el));
  const glyphBevel=glyphData.paths.map(d=>node('path',{d,transform:'translate(-3 4)',fill:'none',stroke:'var(--glint)','stroke-width':3,opacity:0},glyphBox));
  const badge=$('[data-badge]'),badgeGlow=$('[data-badge-glow]'),badgeTip=$('[data-badge-tip]');
  function identity(t){
    const p=clamp((t-.1)/1.15);reveal(badge,p);reveal(badgeGlow,p);badgeGlow.style.opacity=p>0?'.24':'0';endPoint(badge,p,badgeTip);
    glyphs.forEach((el,i)=>{const q=clamp((t-1.3-i*.10)/.22);reveal(el,q);el.setAttribute('fill',q===1?'url(#pillar-id-metal)':'none');glyphDepth[i].style.opacity=String(smooth((q-.78)/.22)*.42);glyphBevel[i].style.opacity=String(smooth((q-.8)/.2)*.58);});
  }

  // The reference's vertical, bulging tick dial is retained; labels are calendar values.
  const ticks=Array.from({length:45},()=>node('line',{class:'line'},$('[data-time-ticks]')));
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function continuity(t){
    const travel=t*140;
    ticks.forEach((el,i)=>{
      const y=60+((i*7+travel)%315);
      const z=(y-210)/157.5;
      const w=15+67*Math.pow(Math.max(0,1-z*z),2.7);
      el.setAttribute('x1',360-w/2);el.setAttribute('x2',360+w/2);el.setAttribute('y1',y);el.setAttribute('y2',y);
      el.style.opacity=String(Math.pow(Math.max(0,1-Math.abs(z)),.55)*.36);
    });
    const step=t/.22,index=Math.floor(step),phase=step-index,offset=smooth((phase-.60)/.4)*42;
    const n=index+8,year=2026+Math.floor(n/12),nextYear=2026+Math.floor((n+1)/12);
    $('[data-month]').textContent=months[n%12];$('[data-month-next]').textContent=months[(n+1)%12];
    $('[data-month-roll]').setAttribute('transform',`translate(0 ${offset})`);
    $('[data-year]').textContent=String(year);$('[data-year-next]').textContent=String(nextYear);
    $('[data-year-roll]').setAttribute('transform',`translate(0 ${year===nextYear?0:offset})`);
  }

  function elbow(s,h,a=65,b=68){
    const dx=h.x-s.x,dy=h.y-s.y,dist=Math.hypot(dx,dy),d=Math.min(dist,a+b-.01);
    const along=(a*a-b*b+d*d)/(2*d),out=Math.sqrt(Math.max(0,a*a-along*along));
    return {x:s.x+dx/dist*along+dy/dist*out,y:s.y+dy/dist*along-dx/dist*out};
  }
  function tube(s,e,h){
    const normal=(a,b)=>{const d=Math.hypot(b.x-a.x,b.y-a.y);return{x:-(b.y-a.y)/d,y:(b.x-a.x)/d};};
    const n=normal(s,e),m=normal(e,h),mid={x:(n.x+m.x)/2,y:(n.y+m.y)/2};
    const p=(a,v,w)=>({x:a.x+v.x*w,y:a.y+v.y*w});
    return `M${point(p(s,n,10))} L${point(p(e,mid,9))} L${point(p(h,m,4.5))} L${f(h.x-9)} ${f(h.y+1)} Q${f(h.x-12)} ${f(h.y+5)} ${f(h.x-4)} ${f(h.y+5)} L${f(h.x+11)} ${f(h.y+5)} Q${f(h.x+15)} ${f(h.y+4)} ${point(p(h,m,-4.5))} L${point(p(e,mid,-9))} L${point(p(s,n,-10))} Z`;
  }
  function autonomy(t){
    const d=(1-Math.cos(t*2*Math.PI/3.65))/2;
    const s={x:266+12*d,y:176+59*d},toe={x:523,y:298};
    const dist=Math.hypot(toe.x-s.x,toe.y-s.y),u={x:(toe.x-s.x)/dist,y:(toe.y-s.y)/dist},n={x:-u.y,y:u.x};
    const hip={x:lerp(s.x,toe.x,.49),y:lerp(s.y,toe.y,.49)};
    const p=(a,w)=>({x:a.x+n.x*w,y:a.y+n.y*w});
    const shoulderTop=p(s,-18),hipTop=p(hip,-13),ankleTop=p(toe,-7),ankleBottom=p(toe,1),hipBottom=p(hip,11),shoulderBottom=p(s,17);
    const at=(a,w)=>p({x:lerp(s.x,toe.x,a),y:lerp(s.y,toe.y,a)},w);
    const body=`M${point(shoulderTop)} Q${point(at(.24,-18))} ${point(hipTop)} Q${point(at(.58,-15))} ${point(at(.72,-8))} Q${point(at(.79,-14))} ${point(at(.91,-6))} L${point(at(.965,-4))} L${f(toe.x+10)} 300 Q${f(toe.x+11)} 305 ${f(toe.x+2)} 303 L${point(ankleBottom)} Q${point(at(.86,3))} ${point(at(.79,8))} Q${point(at(.74,9))} ${point(at(.70,5))} Q${point(at(.60,12))} ${point(hipBottom)} Q${point(at(.31,8))} ${point(at(.16,18))} Q${point(at(.05,23))} ${point(shoulderBottom)} Q${f(s.x-14)} ${f(s.y)} ${point(shoulderTop)} Z`;
    $('[data-athlete-body]').setAttribute('d',body);$('[data-athlete-body-glow]').setAttribute('d',body);
    const hc={x:s.x-u.x*36,y:s.y-u.y*36-4};
    $('[data-athlete-head]').setAttribute('transform',`translate(${f(hc.x)} ${f(hc.y)}) rotate(-8)`);
    $('[data-athlete-neck]').setAttribute('d',`M${f(hc.x+10)} ${f(hc.y+12)} L${f(s.x+5)} ${f(s.y-12)} L${f(s.x+10)} ${f(s.y+8)} L${f(hc.x+1)} ${f(hc.y+20)}`);
    const hand={x:249,y:297},e=elbow(s,hand);
    $('[data-athlete-arm]').setAttribute('d',tube(s,e,hand));
    const rearS={x:s.x+11,y:s.y-3},rearH={x:267,y:293};
    $('[data-rear-arm]').setAttribute('d',tube(rearS,elbow(rearS,rearH),rearH));
    $('[data-athlete-seam]').setAttribute('d',`M${point(at(.48,7))} Q${point(at(.66,0))} ${point(at(.75,1))} Q${point(at(.88,-2))} ${point(at(.96,0))}`);
  }

  const ribbons=Array.from({length:13},(_,i)=>node('path',{class:'line',opacity:.15+i*.025},$('[data-expression-ribbons]')));
  const chars=[...$('[data-expression-glyphs]').children];
  function expression(t){
    const time=t*.64;
    ribbons.forEach((el,i)=>{
      let d='';const k=(i-6)/6;
      for(let j=0;j<=100;j++){
        const a=j/100*Math.PI*2;
        const x=360+Math.cos(a)*(104+17*Math.sin(time+a*2+k))*(1-.19*k*k)+Math.sin(a)*k*26;
        const y=210+Math.sin(a)*(68+21*Math.sin(time*.9+k*2))+k*35+Math.cos(a*3-time)*11;
        d+=(j?'L':'M')+f(x)+' '+f(y);
      }
      el.setAttribute('d',d+'Z');el.style.opacity=String(.13+.27*(.5+.5*Math.sin(i*.43+time)));
    });
    let wave='';
    for(let i=0;i<=190;i++){
      const x=190+i*1.78,n=(x-360)/169,envelope=Math.pow(Math.max(0,1-n*n),2);
      const y=210+envelope*(Math.sin(n*20-time*6)*18+Math.sin(n*9+time*3)*19)*(1+.2*Math.sin(time*2));
      wave+=(i?'L':'M')+f(x)+' '+f(y);
    }
    $('[data-expression-wave]').setAttribute('d',wave);$('[data-expression-wave-glow]').setAttribute('d',wave);
    chars.forEach((el,i)=>{
      const a=time*.36+i*2.094;
      el.setAttribute('x',360+Math.cos(a)*139);el.setAttribute('y',217+Math.sin(a)*84);
      el.style.opacity=String(.32+.30*(.5+.5*Math.sin(a)));
    });
  }

  // A finite expanding plane: distance controls each edge's delayed reveal.
  const project=(x,y)=>({x:360+(x-y)*19,y:216+(x+y)*9});
  const gridEdges=[],gridNodes=[];
  for(let i=-6;i<=6;i++)for(let j=-6;j<=6;j++){
    const a=project(i,j),dist=Math.max(Math.abs(i),Math.abs(j));
    if((i+j)%2===0){const el=node('circle',{cx:a.x,cy:a.y,r:dist===0?0:1.25,fill:'var(--ink)'},$('[data-grid-nodes]'));gridNodes.push({el,dist});}
    for(const [di,dj]of [[1,0],[0,1]]){
      if(i+di>6||j+dj>6)continue;
      const b=project(i+di,j+dj),other=Math.max(Math.abs(i+di),Math.abs(j+dj));
      const start=dist<=other?a:b,end=dist<=other?b:a;
      const el=node('line',{x1:start.x,y1:start.y,x2:start.x,y2:start.y,class:'line'},$('[data-grid-lines]'));
      gridEdges.push({el,start,end,delay:Math.min(dist,other)*.52,dist:Math.max(dist,other)});
    }
  }
  function connection(t){
    gridEdges.forEach(({el,start,end,delay,dist})=>{
      const p=smooth((t-.22-delay)/.62);
      el.setAttribute('x2',lerp(start.x,end.x,p));el.setAttribute('y2',lerp(start.y,end.y,p));
      el.style.opacity=String(p>0?.66-dist*.065:0);
    });
    gridNodes.forEach(({el,dist})=>el.style.opacity=String(smooth((t-.3-dist*.52)/.55)*(.7-dist*.055)));
  }

  const renderers={presence,identity,continuity,autonomy,expression,connection};
  const order=['presence','identity','continuity','autonomy','expression','connection'];
  const names=['Presence','Identity','Continuity','Autonomy','Expression','Connection'];
  const finite={presence:4.15,identity:1.85,connection:4.2};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let active=null,elapsed=0,age=0,wait=0,drawClock=0,complete=false,portal=null,projected=null,disposed=false;
  root.hidden=true;
  const api={
    set(event){
      if(disposed)return;
      if(!event?.project){active=null;root.hidden=true;root.style.opacity='0';return;}
      const key=event.project.pillarKey||order[event.index];
      if(!renderers[key])return;
      wait=active?.5:0;active=key;elapsed=0;age=0;drawClock=0;complete=false;
      const scene=getScene();portal=scene?.marker?.portal;
      if(!portal)return;
      portal._pillarOverlay=api;portal._portalMesh.visible=false;
      projected??=portal._center.clone();
      root.hidden=false;root.style.opacity='0';root.dataset.pillar=key;
      $$('g[data-scene]').forEach(el=>el.toggleAttribute('hidden',el.dataset.scene!==key));
      $('#pillar-svg-title').textContent=names[order.indexOf(key)];
      $('#pillar-svg-desc').textContent=event.project.pillarDescription||names[order.indexOf(key)];
      renderers[key](motion.matches?5:0);
    },
    update(time,dt,currentPortal){
      if(disposed||!active||document.hidden||!root.isConnected)return;
      const scene=getScene();if(!scene||currentPortal!==portal)return;
      const delta=Math.min(Math.max(dt,0),.05);age+=delta;
      if(age<wait)return;
      projected.copy(portal._portalMat.uniforms.uCenter.value).project(scene.camera);
      const lens=window.__PREMAN_PLANET_LENS__;
      const display=lens?lens.toDisplay(projected.x,projected.y):projected;
      const x=(display.x+1)*innerWidth/2,y=(1-display.y)*innerHeight/2;
      root.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%)`;
      const opacity=Math.min(1,portal._a.open*2.4);
      root.style.opacity=String(opacity);
      if(opacity<.08)return;
      if(motion.matches){if(elapsed!==5){elapsed=5;renderers[active](5);}return;}
      if(complete)return;
      elapsed+=delta;drawClock+=delta;
      if(drawClock<1/30)return;
      drawClock=0;renderers[active](elapsed);
      if(finite[active]&&elapsed>=finite[active])complete=true;
    },
    destroy(){
      disposed=true;active=null;
      if(portal?._pillarOverlay===api){portal._pillarOverlay=null;portal._portalMesh.visible=true;}
      root.remove();
    }
  };
  return api;
}
