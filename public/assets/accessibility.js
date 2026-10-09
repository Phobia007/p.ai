(() => {
  const names = {'SOUND':'声音','OFF':'关','ON':'开','Drag or scroll to navigate.':'拖动或滚动，探索世界。','Click markers to explore.':'点击光点，了解作品。','Drag to navigate.':'滑动，探索世界。','Tap markers to explore.':'轻触光点，了解作品。','Menu':'菜单','All rights reserved.':'保留所有权利。'};
  function enhance(root=document.body){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('script,style')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    while(walker.nextNode()){const n=walker.currentNode,t=n.nodeValue.trim();if(names[t])n.nodeValue=n.nodeValue.replace(t,names[t]);}
    const regions=[['nav','navigation'],['main','main-content'],['.hero','hero'],['.loader','entry-screen'],['canvas','world-scene']];
    regions.forEach(([s,id])=>document.querySelector(s)?.setAttribute('data-od-id',id));
    document.querySelectorAll('h1,h2,h3,a,button').forEach((el,i)=>{if(!el.dataset.odId)el.dataset.odId=(el.tagName.toLowerCase())+'-'+i;});
  }
  let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{observer.disconnect();enhance();observer.observe(document.body,{childList:true,subtree:true,characterData:true});queued=false;});});
  enhance();observer.observe(document.body,{childList:true,subtree:true,characterData:true});
})();
