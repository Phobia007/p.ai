(() => {
  const root=document.querySelector('#preacherman-account');
  if(!root||root.dataset.ready)return;
  root.dataset.ready='true';
  const trigger=root.querySelector('.site-utility-button--login');
  const panel=root.querySelector('#site-login-panel');
  panel.setAttribute('data-lenis-prevent','');
  // Same 60-frame mask, .7s reveal and .35s retreat as the scene's BtnToggle.
  const label=trigger.querySelector('.btn-toggle__text');
  const measureLabel=()=>label.style.setProperty('--text-width',`${label.scrollWidth+1}px`);
  measureLabel();document.fonts?.ready.then(measureLabel);
  const borders=[trigger.querySelector('.btn-toggle__border rect'),trigger.querySelector('.btn-toggle__hover rect')];
  const borderObserver=new ResizeObserver(()=>{
    const {width,height}=trigger.getBoundingClientRect();
    borders.forEach((rect,index)=>{rect.setAttribute('width',String(width+(index?7:-1)));rect.setAttribute('height',String(height+(index?7:-1)));});
  });
  borderObserver.observe(trigger);
  let progress=0,animation=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const paint=()=>trigger.style.setProperty('--cloud-x',`${Math.round((1-progress)*59)/59*100}%`);
  const reveal=target=>{
    cancelAnimationFrame(animation);
    const from=progress,duration=(target>from?700:350)*Math.abs(target-from),start=performance.now();
    if(reduced.matches||!duration){progress=target;paint();return;}
    const tick=now=>{const t=Math.min(1,(now-start)/duration);progress=from+(target-from)*t;paint();if(t<1)animation=requestAnimationFrame(tick);};
    animation=requestAnimationFrame(tick);
  };
  trigger.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')reveal(1);});
  trigger.addEventListener('pointerleave',()=>{if(!trigger.matches(':focus-visible'))reveal(0);});
  trigger.addEventListener('focus',()=>{if(trigger.matches(':focus-visible'))reveal(1);});
  trigger.addEventListener('blur',()=>{if(!trigger.matches(':hover'))reveal(0);});
  const accountLabel=new MutationObserver(()=>{label.textContent=trigger.dataset.authenticated==='true'?'Account':'Log in';measureLabel();});
  accountLabel.observe(trigger,{attributes:true,attributeFilter:['data-authenticated']});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(animation);borderObserver.disconnect();accountLabel.disconnect();},{once:true});

  const paths={
    'at-sign':'<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
    'lock-keyhole':'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
    'eye':'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off':'<path d="m3 3 18 18M10.5 5.1 12 5c6.5 0 10 7 10 7a19 19 0 0 1-3 4M6 6.5A24 24 0 0 0 2 12s3.5 7 10 7a13 13 0 0 0 5.5-1.3M10 10a3 3 0 0 0 4 4"/>'
  };
  for(const icon of root.querySelectorAll('[data-lucide]')) {
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    for(const attr of icon.attributes)if(attr.name!=='data-lucide')svg.setAttribute(attr.name,attr.value);
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.5');
    svg.innerHTML=paths[icon.dataset.lucide]||'';icon.replaceWith(svg);
  }
  const focusable=()=>[...panel.querySelectorAll('button,input,select,a[href],[tabindex="0"]')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length);
  const setOpen=open=>{
    if(!open&&panel.contains(document.activeElement))trigger.focus({preventScroll:true});
    panel.inert=!open;
    panel.setAttribute('aria-hidden',String(!open));
    trigger.setAttribute('aria-expanded',String(open));
    panel.classList.toggle('is-open',open);
    if(open)requestAnimationFrame(()=>{if(panel.classList.contains('is-open'))(focusable().find(el=>el.tagName==='INPUT')||focusable()[0])?.focus({preventScroll:true});});
  };
  trigger.addEventListener('click',()=>setOpen(!panel.classList.contains('is-open')));
  document.addEventListener('pointerdown',event=>{if(panel.classList.contains('is-open')&&!root.contains(event.target))setOpen(false);});
  window.addEventListener('keydown',event=>{
    if(!panel.classList.contains('is-open'))return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();setOpen(false);return;}
    if(event.key==='Tab') {
      const items=focusable(),first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
    if(root.contains(event.target))event.stopImmediatePropagation();
  },true);
  for(const type of ['pointerdown','pointerup','click','wheel','touchstart','touchmove','touchend'])root.addEventListener(type,event=>event.stopPropagation(),{passive:true});
  root.querySelector('.login-form__visibility').addEventListener('click',event=>{
    const password=root.querySelector('#login-password'),show=password.type==='password';
    password.type=show?'text':'password';
    event.currentTarget.setAttribute('aria-label',show?'Hide password':'Show password');
    root.querySelector('[data-login-icon="show"]').toggleAttribute('hidden',show);
    root.querySelector('[data-login-icon="hide"]').toggleAttribute('hidden',!show);
  });
})();
