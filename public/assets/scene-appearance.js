/* Shared by the UI and the authored Three.js scene. Loaded before the app. */
(() => {
  const storageKey = 'preacherman.landing.appearance';
  let mode = 'light';
  try { if (localStorage.getItem(storageKey) === 'dark') mode = 'dark'; } catch {}
  const listeners = new Set();
  const scenes = new Set();
  const nightUniform = { value: mode === 'dark' ? 1 : 0 };
  const introUniform = { value: 1 };
  const gray = v => ({ r: v, g: v, b: v, a: 1 });
  const luminance = c => c.r * .2126 + c.g * .7152 + c.b * .0722;
  function values(name, authored) {
    if (name === 'Panel') return { ...authored, color: mode === 'dark' ? gray(.09) : { r:.86, g:.835, b:.78, a:1 } };
    if (name === 'PostProcessing') {
      // The existing reveal track is the sole clock: no new animation loop.
      const t = Math.max(0, Math.min(1, (authored.reveal.factor - .69) / .30));
      introUniform.value = 1 - t * t * (3 - 2 * t);
      authored = { ...authored, grain: { ...authored.grain, intensity: authored.grain.intensity + introUniform.value * (mode === 'dark' ? .039 : .022) } };
    }
    if (name === 'LogoOutline') return { ...authored, color: mode === 'dark' ? gray(.52) : { r:.03, g:.025, b:.020, a:1 } };
    if (mode === 'light') return authored;
    // Theatre colors carry a toString method; copy their plain data only.
    const v = JSON.parse(JSON.stringify(authored));
    switch (name) {
      case 'Terrain':
        v.color = gray(luminance(authored.color) * 1.50);
        v.fog.color = gray(luminance(authored.fog.color) * .75);
        break;
      case 'Water': v.color = gray(.25 + Math.max(0, luminance(authored.color) - .285) * 2.5); break;
      case 'Fog': v.color = gray(.070 + luminance(authored.color) * .38); break;
      case 'Background': v.color = gray(.065); break;
      case 'Sky': v.background = gray(.22); v.lightning.color = gray(.82); break;
      case 'SkySphere': v.horizon.color = gray(.28); break;
      case 'GroundPlane': v.color = gray(.17); break;
      case 'Lights':
        v.point.color = gray(1); v.directional.color = gray(1);
        v.point.intensity *= .95; v.directional.intensity *= .90; v.ambient.intensity *= .85;
        break;
      case 'GodRay': v.color = gray(.65); break;
      case 'Vegetation': v.material.emissive = gray(.08); break;
      case 'Birds': v.color = gray(luminance(authored.color)); break;
      case 'RevealPlane': v.color = gray(.14); break;
      case 'PostProcessing':
        v.reveal.color = gray(.06); v.contrast = 1.02; v.exposure = 1; v.rgbShiftAmount = 0;
        break;
    }
    return v;
  }
  function recolorMarkers(scene) {
    const marker = scene.marker;
    if (!marker?.mesh?.instanceColor) return;
    const rgb = mode === 'dark' ? [.91, .845, .70] : [.115, .080, .155];
    marker._items.forEach((item, index) => {
      item.color.setRGB(...rgb);
      for (const mesh of [marker.mesh, marker.spiralMesh, scene.markerSpheres?.mesh]) {
        if (!mesh?.instanceColor) continue;
        mesh.setColorAt(index, item.color);
        mesh.instanceColor.needsUpdate = true;
      }
      marker._emitters[index]?.material.uniforms.uColor.value.copy(item.color);
      scene.terrain?.setMarkerColor(index, item.color);
    });
    const active = marker._items[marker._activeIndex];
    if (active) for (const key of ['_portalMat', '_particlesMat', '_stormMat']) {
      marker.portal[key]?.uniforms.uColor?.value.copy(active.color);
    }
  }
  function syncDocument() {
    document.documentElement.dataset.appearance = mode;
    const button = document.querySelector('.appearance-toggle');
    if (button) {
      const label = mode === 'dark' ? 'Switch to day mode' : 'Switch to night mode';
      button.setAttribute('aria-pressed', String(mode === 'dark'));
      button.setAttribute('aria-label', label);
      button.title = label;
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#141414' : '#eee5d2');
  }
  function apply(next, persist = true) {
    if (next !== 'light' && next !== 'dark') return;
    mode = next;
    nightUniform.value = mode === 'dark' ? 1 : 0;
    syncDocument();
    if (persist) try { localStorage.setItem(storageKey, mode); } catch {}
    for (const refresh of listeners) refresh();
    for (const scene of scenes) recolorMarkers(scene);
  }
  window.__PREMAN_APPEARANCE__ = {
    get mode() { return mode; },
    nightUniform,
    introUniform,
    apply,
    // Always keep the authored values; switching never feeds recolored values back
    // into Theatre or changes its sequence, easing, camera, masks or geometry.
    observe(name, object, callback, driver) {
      let authored;
      const refresh = () => { if (authored) callback(values(name, authored)); };
      listeners.add(refresh);
      const stop = object.onValuesChange(v => { authored = v; refresh(); }, driver);
      return () => { listeners.delete(refresh); stop(); };
    },
    attach(scene) { scenes.add(scene); recolorMarkers(scene); },
  };
  syncDocument();
  const bind = () => {
    syncDocument();
    const button = document.querySelector('.appearance-toggle');
    if (!button) return;
    button.addEventListener('pointerdown', e => e.stopPropagation());
    button.addEventListener('click', e => { e.stopPropagation(); apply(mode === 'dark' ? 'light' : 'dark'); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  window.addEventListener('storage', e => { if (e.key === storageKey) apply(e.newValue === 'dark' ? 'dark' : 'light', false); });
})();
