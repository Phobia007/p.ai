import {d as defineComponent,V as h,A as ref,h as useApp,I as onMounted,m as onBeforeUnmount,v as Button} from './B5B1E9Dr.js';
import {u as useMetadata,A as BackArrow} from './B2Em7_D3.js';

export default defineComponent({
  name:'VirtualHumanTest',
  setup(){
    const app=useApp(),frame=ref(null),ready=ref(false),playing=ref(false),pending=ref(false),error=ref('');
    let appearanceObserver=null,commandTimeout=0;
    useMetadata();
    const send=message=>frame.value?.contentWindow?.postMessage(message,window.location.origin);
    const syncAppearance=()=>send({type:'preacherman-appearance',appearance:document.documentElement.dataset.appearance==='dark'?'dark':'light'});
    function onMessage(event){
      if(event.origin!==window.location.origin||event.source!==frame.value?.contentWindow||event.data?.type!=='preacherman-experiment')return;
      const firstReady=!ready.value&&event.data.ready===true;
      ready.value=event.data.ready===true;
      playing.value=event.data.playing===true;
      error.value=typeof event.data.error==='string'?event.data.error:'';
      pending.value=false;
      clearTimeout(commandTimeout);
      if(firstReady)syncAppearance();
    }
    function toggleMusic(){
      if(!ready.value||pending.value)return;
      pending.value=true;error.value='';
      send({type:'preacherman-audio',playing:!playing.value});
      commandTimeout=window.setTimeout(()=>{pending.value=false;error.value='Music could not start. Please try again.';},6000);
    }
    onMounted(()=>{
      window.addEventListener('message',onMessage);
      appearanceObserver=new MutationObserver(syncAppearance);
      appearanceObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-appearance']});
    });
    onBeforeUnmount(()=>{
      send({type:'preacherman-audio',playing:false});
      window.removeEventListener('message',onMessage);
      appearanceObserver?.disconnect();
      clearTimeout(commandTimeout);
    });
    const soundIcon=()=>h('svg',{viewBox:'0 0 24 24',width:18,height:18,fill:'none',stroke:'currentColor','stroke-width':1.25,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'},[
      h('path',{d:'M11 5 6 9H3v6h3l5 4V5Z'}),
      playing.value?h('path',{d:'M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14'}):h('path',{d:'m16 9 6 6m0-6-6 6'})
    ]);
    return()=>h('section',{class:['virtual-human-test','page',{'page-visible':app.pageReady}],'aria-labelledby':'virtual-human-title'},[
      h('h1',{id:'virtual-human-title',class:'virtual-human-test__title'},'virtual human test'),
      app.pageReady?h('iframe',{ref:frame,class:'virtual-human-test__frame',src:'/experiments/virtual-human/index.html',title:'Virtual human motion experiment',allow:'autoplay',onLoad:syncAppearance}):null,
      h('p',{class:['virtual-human-test__status',{'is-error':!!error.value}],role:'status','aria-live':'polite'},error.value||(!ready.value?'Loading virtual human…':'')),
      h(Button,{text:'To overview',to:'/avatars',class:'virtual-human-test__back','icon-placement':'left','icon-hover':'',sound:'to-overview'},{default:()=>h(BackArrow)}),
      h('button',{class:'virtual-human-test__music',type:'button',disabled:!ready.value||pending.value,'aria-label':playing.value?'Turn music off':'Play music','aria-pressed':playing.value,'aria-busy':pending.value,onClick:toggleMusic},[
        soundIcon(),h('span',playing.value?'Music on':'Music off')
      ])
    ]);
  }
});
