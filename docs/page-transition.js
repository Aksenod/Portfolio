(() => {
  const BASE = '/Portfolio';

  function normalizeUrl(href) {
    try {
      const url = new URL(href, window.location.href);
      return url;
    } catch {
      return null;
    }
  }

  function isSameOrigin(url) {
    return url && url.origin === window.location.origin;
  }

  function isInternalNavigation(url) {
    if (!url) return false;
    if (!isSameOrigin(url)) return false;

    const path = url.pathname || '/';
    const currentPath = window.location.pathname || '/';

    // Only animate within the same site base (GitHub Pages subfolder)
    const inBase = path === BASE || path.startsWith(BASE + '/');
    const currentInBase = currentPath === BASE || currentPath.startsWith(BASE + '/');
    if (inBase !== currentInBase) return false;

    return true;
  }

  function shouldHandleClick(e, a) {
    if (!a) return false;
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.hasAttribute('download')) return false;
    if ((a.getAttribute('target') || '').toLowerCase() === '_blank') return false;

    const href = a.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;

    return true;
  }

  function buildOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'pt-overlay is-exit';
    overlay.setAttribute('aria-hidden', 'true');

    const wipe = document.createElement('div');
    wipe.className = 'pt-wipe';

    const bands = document.createElement('div');
    bands.className = 'pt-bands';
    for (let i = 0; i < 10; i++) {
      const b = document.createElement('div');
      b.className = 'pt-band';
      bands.appendChild(b);
    }

    const grain = document.createElement('div');
    grain.className = 'pt-grain';

    const vignette = document.createElement('div');
    vignette.className = 'pt-vignette';

    wipe.appendChild(bands);
    wipe.appendChild(grain);
    wipe.appendChild(vignette);
    overlay.appendChild(wipe);

    return overlay;
  }

  function nextFrame() {
    return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  async function playExit(overlay) {
    overlay.classList.add('is-active');
    overlay.classList.remove('is-enter');
    overlay.classList.add('is-exit');
    overlay.classList.remove('is-visible');
    await nextFrame();
    overlay.classList.add('is-visible');

    const dur = getComputedStyle(document.documentElement).getPropertyValue('--pt-dur-in').trim() || '520ms';
    const ms = dur.endsWith('ms') ? parseFloat(dur) : parseFloat(dur) * 1000;
    await new Promise((r) => setTimeout(r, ms + 60));
  }

  async function playEnter(overlay) {
    overlay.classList.add('is-active');
    overlay.classList.remove('is-exit');
    overlay.classList.add('is-enter');
    overlay.classList.add('is-visible');

    await nextFrame();
    overlay.classList.remove('is-visible');

    const dur = getComputedStyle(document.documentElement).getPropertyValue('--pt-dur-out').trim() || '520ms';
    const ms = dur.endsWith('ms') ? parseFloat(dur) : parseFloat(dur) * 1000;
    await new Promise((r) => setTimeout(r, ms + 80));

    overlay.classList.remove('is-active');
  }

  function init() {
    const overlay = buildOverlay();
    document.addEventListener('DOMContentLoaded', async () => {
      document.body.appendChild(overlay);
      await playEnter(overlay);
    }, { once: true });

    // Click interception
    document.addEventListener('click', async (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!shouldHandleClick(e, a)) return;

      const url = normalizeUrl(a.getAttribute('href'));
      if (!isInternalNavigation(url)) return;

      // Anchor-only within same page: do not animate
      const samePath = (url.pathname || '') === (window.location.pathname || '');
      const sameSearch = (url.search || '') === (window.location.search || '');
      if (samePath && sameSearch && url.hash) return;

      e.preventDefault();

      // Avoid double triggers
      if (window.__ptNavigating) return;
      window.__ptNavigating = true;

      try {
        await playExit(overlay);
        window.location.assign(url.href);
      } finally {
        setTimeout(() => { window.__ptNavigating = false; }, 1500);
      }
    }, true);

    // Back/forward: show quick overlay to keep feel consistent
    window.addEventListener('pageshow', () => {
      // if page restored from bfcache, ensure overlay not stuck
      overlay.classList.remove('is-active', 'is-visible');
    });
  }

  // Prefer reduced motion: do nothing
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  init();
})();
