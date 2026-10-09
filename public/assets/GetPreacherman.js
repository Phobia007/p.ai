import {d as defineComponent,V as h,A as ref,I as onMounted,a5 as onUnmounted} from '../_nuxt/B5B1E9Dr.js';
import markup from './get-preacherman-markup.js';
import downloads from './get-preacherman-config.js';

export default defineComponent({
  name:'GetPreacherman',
  setup(){
    const root=ref(null);
    const lifetime=new AbortController();
    onMounted(()=>{
      const el=root.value,mac=el.querySelector('.hero__platform-download'),trigger=mac.querySelector('.hero__platform-menu-trigger');
      const menu=mac.querySelector('[role="menu"]'),options=[...menu.querySelectorAll('[role="menuitem"]')];
      const status=el.querySelector('[role="status"]');
      const website=el.querySelector('[data-platform="website"]');
      website.href=downloads.website;
      const setOpen=(open,focus=false)=>{
        if(!open&&menu.contains(document.activeElement))trigger.focus({preventScroll:true});
        mac.classList.toggle('is-open',open);trigger.setAttribute('aria-expanded',String(open));
        menu.setAttribute('aria-hidden',String(!open));menu.inert=!open;
        if(focus)(open?options[0]:trigger).focus({preventScroll:true});
      };
      const choose=button=>{
        const platform=button.dataset.platform,url=downloads[platform];
        const label={windows:'Windows',macArm:'Apple Silicon',macIntel:'Intel Mac'}[platform];
        setOpen(false);
        if(!url){status.textContent=`${label} download is not available yet.`;return;}
        status.textContent='';
        const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.click();
      };
      el.addEventListener('click',event=>{
        if(event.target.closest('.hero__platform-menu-trigger')){status.textContent='';setOpen(trigger.getAttribute('aria-expanded')!=='true',event.detail===0);return;}
        const button=event.target.closest('button[data-platform]');if(button)choose(button);
      },{signal:lifetime.signal});
      el.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&trigger.getAttribute('aria-expanded')==='true'){event.preventDefault();event.stopPropagation();setOpen(false,true);}
        else if(event.key==='ArrowDown'&&event.target===trigger){event.preventDefault();setOpen(true,true);}
        else if(menu.contains(event.target)&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
          event.preventDefault();let i=options.indexOf(document.activeElement);
          i=event.key==='Home'?0:event.key==='End'?options.length-1:(i+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[i].focus();
        }
      },{signal:lifetime.signal});
      document.addEventListener('pointerdown',event=>{if(!mac.contains(event.target))setOpen(false);},{signal:lifetime.signal});
      mac.addEventListener('focusout',event=>{if(!mac.contains(event.relatedTarget))setOpen(false);},{signal:lifetime.signal});
    });
    onUnmounted(()=>lifetime.abort());
    return()=>h('section',{class:'get-preacherman panel-grid',ref:root},[
      h('div',{class:'panel-full'},[
        h('p',{class:'eyebrow ts-b'},'Get Preacherman'),
        h('div',{class:'get-preacherman__content',innerHTML:markup})
      ])
    ]);
  }
});
