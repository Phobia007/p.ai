/* Enter once per page load; only a reload returns to the intro. */
window.__PREMAN_INSTALL_SCROLL_ENTRY__ = ({isReady, enter}) => {
  let phase = 'intro';
  let disposed = false;
  let wheelDistance = 0;
  let lastWheel = 0;
  let touchStart = null;
  let gestureTime = 0;
  const options = {capture: true, passive: false};
  const busy = () => phase === 'entering';
  const publish = value => {
    phase = value;
    document.documentElement.dataset.sceneStage = value;
    wheelDistance = 0;
  };
  const consume = event => {
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
  };
  const editable = target => target?.closest?.('input,textarea,select,[contenteditable="true"],#preacherman-account');
  const transition = async () => {
    if (disposed || phase !== 'intro' || !isReady()) return;
    publish('entering');
    try {
      await enter();
      if (!disposed) {
        publish('scene');
        gestureTime = performance.now();
      }
    } catch (error) {
      publish('intro');
      console.error('Scene transition failed', error);
    }
  };
  const wheel = event => {
    if (disposed || event.ctrlKey || editable(event.target)) return;
    if (busy()) { consume(event); return; }
    if (phase === 'scene') return;
    consume(event);
    if (!isReady() || performance.now() - gestureTime < 350) return;
    const now = performance.now();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (now - lastWheel > 300 || Math.sign(delta) !== Math.sign(wheelDistance)) wheelDistance = 0;
    lastWheel = now;
    wheelDistance += delta;
    if (wheelDistance >= 48) transition();
  };
  const touchstart = event => {
    touchStart = event.touches.length === 1
      ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;
  };
  const touchmove = event => {
    if (editable(event.target) || disposed || phase === 'scene' || !touchStart || event.touches.length !== 1) return;
    if (busy()) { consume(event); return; }
    const dx = event.touches[0].clientX - touchStart.x;
    const dy = touchStart.y - event.touches[0].clientY;
    consume(event);
    if (performance.now() - gestureTime < 350 || Math.abs(dy) < 48 || Math.abs(dy) <= Math.abs(dx)*1.2) return;
    if (dy > 0) transition();
  };
  const touchend = () => { touchStart = null; };
  const keydown = event => {
    if (disposed || phase === 'scene') return;
    if (event.altKey || event.ctrlKey || event.metaKey || editable(event.target) || event.target?.closest?.(".appearance-toggle,#preacherman-account")) return;
    if (busy() && ['ArrowDown','PageDown','ArrowUp','PageUp',' '].includes(event.key)) { consume(event); return; }
    if (event.repeat) return;
    const forward = ['ArrowDown','PageDown',' '].includes(event.key) && !event.shiftKey;
    if (phase === 'intro' && forward) { consume(event); transition(); }
  };
  const pointerdown = event => { if (busy() && !event.target?.closest?.(".appearance-toggle,#preacherman-account")) consume(event); };
  const handlers = [['wheel',wheel],['touchstart',touchstart],['touchmove',touchmove],['touchend',touchend],['touchcancel',touchend],['keydown',keydown],['pointerdown',pointerdown]];
  publish('intro');
  for (const [type, handler] of handlers) window.addEventListener(type, handler, options);
  return () => {
    disposed = true;
    for (const [type, handler] of handlers) window.removeEventListener(type, handler, options);
    delete document.documentElement.dataset.sceneStage;
  };
};
