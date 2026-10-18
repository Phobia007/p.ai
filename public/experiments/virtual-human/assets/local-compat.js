// Local preview support; all scene geometry, shaders and motion stay upstream.
window.HYDRA_BASE_PATH = new URL('.', location.href).pathname.replace(/\/$/, '');
(function () {
  let gpu;
  Object.defineProperty(window, 'GPU', {
    configurable: true,
    get: function () { return gpu; },
    set: function (value) {
      gpu = value;
      if (!value || typeof value !== 'object') return;
      let blocked = false;
      Object.defineProperty(value, 'BLOCKLIST', {
        configurable: true,
        get: function () {
          const renderer = window.Device?.graphics?.gpu?.identifier || '';
          return /swiftshader|basic render driver|generic renderer/i.test(renderer) && window.Device?.graphics?.webgl ? false : blocked;
        },
        set: function (value) { blocked = value; }
      });
    }
  });
  const observer = new MutationObserver(function () {
    const canvas = document.querySelector('#Stage canvas');
    if (canvas) {
      canvas.setAttribute('data-od-id', 'yoom-webgl-scene');
      canvas.setAttribute('aria-label', 'Virtual human test — move the pointer to change the viewing angle');
      canvas.setAttribute('role', 'img');
    }
    const logo = document.querySelector('.HubLogo .logo');
    if (logo) {
      logo.setAttribute('data-od-id', 'active-theory-logo');
      logo.setAttribute('aria-label', '访问 Active Theory 实验室');
      const link = logo.querySelector('a');
      if (link) link.setAttribute('aria-label', '访问 Active Theory 实验室');
    }
    if (canvas) observer.disconnect();
  });
  addEventListener('DOMContentLoaded', function () { observer.observe(document.body, { childList: true, subtree: true }); });
})();
