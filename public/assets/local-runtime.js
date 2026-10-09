/* Local path adapter. Original Overworld rendering and audio remain unchanged. */
(() => {
  const root = new URL('../', document.currentScript.src);
  window.__OVERWORLD_BASE__ = root.pathname;
  const folders = /^\/(?:_nuxt|fonts|images|textures|models|sound|cms|videos|assets)(?:\/|$)|^\/(?:_payload\.json|favicon[^/]*|apple-touch-icon\.png|site\.webmanifest)/;
  const local = value => typeof value === 'string' && folders.test(value) ? new URL(value.slice(1), root).href : value;
  if (/\/(?:index|overworld-audio)\.html$/.test(location.pathname)) {
    const pathname = location.pathname.replace(/(?:index|overworld-audio)\.html$/, '');
    history.replaceState(history.state, '', pathname + location.search + location.hash);
  }
  if (root.pathname !== '/') {
    const fetchOriginal = window.fetch;
    window.fetch = function(input, init) {
      if (typeof input === 'string') input = local(input);
      else if (input instanceof Request && new URL(input.url).origin === location.origin) {
        const url = new URL(input.url); const mapped = local(url.pathname + url.search);
        if (mapped !== url.pathname + url.search) input = new Request(mapped, input);
      }
      return fetchOriginal.call(this, input, init);
    };
    const xhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) { return xhrOpen.call(this, method, local(url), ...args); };
    const attribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) { return attribute.call(this, name, ['src','href','poster'].includes(name) ? local(value) : value); };
    const attributeNS = Element.prototype.setAttributeNS;
    Element.prototype.setAttributeNS = function(ns, name, value) { return attributeNS.call(this, ns, name, ['src','href','xlink:href'].includes(name) ? local(value) : value); };
    for (const [type, prop] of [[HTMLImageElement,'src'],[HTMLMediaElement,'src'],[HTMLSourceElement,'src'],[HTMLVideoElement,'poster']]) {
      const descriptor = Object.getOwnPropertyDescriptor(type.prototype, prop);
      if (descriptor?.set) Object.defineProperty(type.prototype, prop, {...descriptor,set(value){descriptor.set.call(this,local(value));}});
    }
  }
  function annotate() {
    for (const [selector, id] of [['.loader','entry-screen'],['canvas','interactive-world'],['main','main-content'],['nav','main-navigation']]) {
      document.querySelector(selector)?.setAttribute('data-od-id',id);
    }
    document.querySelectorAll('a,button,h1,h2').forEach((node,index)=>{
      if(!node.hasAttribute('data-od-id'))node.setAttribute('data-od-id',(node.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)||node.tagName.toLowerCase())+'-'+index);
    });
  }
  addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]').forEach(link=>{link.href=link.href;});
    annotate();new MutationObserver(annotate).observe(document.body,{childList:true,subtree:true});});
})();
