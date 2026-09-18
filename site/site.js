'use strict';
const themeButtons = document.querySelectorAll('[data-theme-button]');
function syncTheme(){
  const mode = document.documentElement.dataset.themeMode || 'auto';
  document.querySelector('.theme-switch').dataset.mode = mode;
  themeButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.themeButton === mode)));
}
themeButtons.forEach(button => button.addEventListener('click',() => window.dispatchEvent(new CustomEvent('worldforge:set-theme',{detail:button.dataset.themeButton}))));
window.addEventListener('worldforge:theme-changed',syncTheme);
syncTheme();
const accessDialog = document.getElementById('access');
const localPreview = ['127.0.0.1','localhost'].includes(location.hostname);
document.querySelectorAll('[data-app-link]').forEach(link => {
  // Never point public visitors at their own localhost.
  if(localPreview){link.href = 'http://127.0.0.1:3000/' + (link.dataset.appLink === 'lab' ? 'lab?scenario=crossdock' : '');}
  else link.addEventListener('click',event => {event.preventDefault();accessDialog.showModal();});
});
