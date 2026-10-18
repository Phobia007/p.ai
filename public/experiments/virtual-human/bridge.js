/* The experiment runs in its own document so its renderer cannot alter the site. */
(() => {
  function setAppearance(appearance) {
    if (!['light', 'dark'].includes(appearance)) return;
    document.documentElement.dataset.appearance = appearance;
    // The iframe and its transparent document both opt out of automatic recoloring.
    document.documentElement.style.colorScheme = 'normal';
  }
  try { setAppearance(parent.document.documentElement.dataset.appearance || 'dark'); } catch (_) { setAppearance('dark'); }
  const nativeInterval = window.setInterval.bind(window);
  const nativeClearInterval = window.clearInterval.bind(window);
  const workers = new Set();
  const NativeWorker = window.Worker;
  if (NativeWorker) {
    window.Worker = class extends NativeWorker {
      constructor(...args) { super(...args); workers.add(this); }
      terminate() { workers.delete(this); return super.terminate(); }
    };
  }

  let source, ready = false, disposed = false, requestedMusic = false;
  let timer, stateKey = '', error = '';
  const started = performance.now();
  const state = () => ({
    type: 'preacherman-experiment', ready,
    playing: Boolean(source && !source.paused && !source.muted && source.volume > 0),
    ...(error ? {error} : {})
  });
  function report(force = false) {
    if (disposed) return;
    const value = state(), key = JSON.stringify(value);
    if (force || key !== stateKey) {
      stateKey = key;
      if (parent !== window) parent.postMessage(value, location.origin);
    }
  }
  async function setMusic(playing) {
    requestedMusic = Boolean(playing);
    if (!source || disposed) return report();
    error = '';
    source.muted = !requestedMusic;
    if (document.hidden) { source.pause(); return report(); }
    try {
      await source.play();
    } catch (failure) {
      source.muted = true;
      requestedMusic = false;
      error = 'Music could not start. Please select the music button again.';
      // Muted playback keeps the volumetric animation available after a denied gesture.
      try { await source.play(); } catch (_) { /* Report the original playback failure. */ }
    }
    report();
  }
  function visibility() {
    if (disposed) return;
    if (document.hidden) {
      source?.pause();
      window.Render?.pause();
    } else {
      window.Render?.resume();
      if (source) setMusic(requestedMusic);
    }
    report();
  }
  function receive(event) {
    if (event.source !== parent || event.origin !== location.origin || !event.data) return;
    if (event.data.type === 'preacherman-audio') setMusic(event.data.playing);
    if (event.data.type === 'preacherman-appearance' && ['light', 'dark'].includes(event.data.appearance)) {
      setAppearance(event.data.appearance);
    }
    if (event.data.type === 'preacherman-dispose') dispose();
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    nativeClearInterval(timer);
    window.removeEventListener('message', receive);
    document.removeEventListener('visibilitychange', visibility);
    window.Render?.pause();
    if (source) {
      source.muted = true;
      source.pause();
      source.removeAttribute('src');
      source.load();
    }
    for (const worker of [...workers]) worker.terminate();
    window.World?.RENDERER?.context?.getExtension('WEBGL_lose_context')?.loseContext();
  }
  function inspect() {
    if (disposed) return;
    const layers = window.__preachermanOriginalLayers;
    const video = layers?.character?.videoTexture?.video;
    const element = video?.video || video?.element?.div;
    if (!source && element instanceof HTMLVideoElement) {
      source = element;
      source.muted = true;
      source.playsInline = true;
      for (const event of ['playing', 'pause', 'volumechange', 'ended']) source.addEventListener(event, () => report());
      source.addEventListener('error', () => {
        error = 'The virtual human media could not load. Please try again.';
        report();
      });
      if (requestedMusic) setMusic(true);
    }
    const canvas = window.World?.RENDERER?.domElement;
    const canvasVisible = canvas && canvas.getBoundingClientRect().width > 0 &&
      (typeof canvas.checkVisibility !== 'function' || canvas.checkVisibility({checkVisibilityCSS: true, checkOpacity: true}));
    if (canvasVisible && source?.readyState >= 2 && source.currentTime > 0 && layers?.character?.mesh?.visible) {
      ready = true;
      if (!error.includes('Music')) error = '';
    } else if (!ready && performance.now() - started > 60000) {
      error = 'The virtual human is taking longer to load. Please try again.';
    }
    report();
  }
  window.addEventListener('message', receive);
  window.addEventListener('pagehide', dispose, {once: true});
  window.addEventListener('unload', dispose, {once: true});
  document.addEventListener('visibilitychange', visibility);
  window.__preachermanExperiment = {state, setMusic, dispose, get source() { return source; }};
  timer = nativeInterval(inspect, 150);
  report(true);
})();
