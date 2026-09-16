// Shared preference protocol for the static page and simulator (separate origins).
(function () {
  const key = 'worldforge.theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let mode = 'auto';
  try { mode = localStorage.getItem(key) || 'auto'; } catch {}
  function apply(value) {
    mode = ['light', 'dark', 'auto'].includes(value) ? value : 'auto';
    const root = document.documentElement;
    root.dataset.themeMode = mode;
    root.dataset.theme = mode === 'auto' ? (media.matches ? 'dark' : 'light') : mode;
    root.style.colorScheme = root.dataset.theme;
    document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = mode; });
    window.dispatchEvent(new Event('worldforge:theme-changed'));
  }
  window.addEventListener('worldforge:set-theme', event => {
    apply(event.detail);
    try { localStorage.setItem(key, mode); } catch {}
  });
  media.addEventListener('change', () => apply(mode));
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) apply(event.newValue || 'auto'); });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-select]').forEach(select => {
      select.value = mode;
      select.addEventListener('change', () => window.dispatchEvent(new CustomEvent('worldforge:set-theme', {detail: select.value})));
    });
  });
  apply(mode);
})();
