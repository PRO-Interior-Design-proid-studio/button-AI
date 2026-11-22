// ==UserScript==
// @name         Open WebUI — блокировка свайпа
// @namespace    proid.studio
// @version      1.0
// @description  Блокирует свайп-жест открытия панели и скрывает выезжающую панель
// @match        http://*/*
// @match        https://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var STYLE_ID = 'owui-swipe-block';
  var CSS =
    'div[data-panel-group="default"][style*="width: 50%"]{display:none!important;}' +
    'div[data-panel-group="default"][style*="width: 100%"]{width:100%!important;left:0%!important;}';

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function isOWUI() {
    return !!(document.getElementById('sidebar-toggle-button') ||
              document.querySelector('nav.drag-region') ||
              document.getElementById('chat-input'));
  }

  var IGNORE = 'pre, code, textarea, input, [contenteditable="true"], ' +
               '.panel-tab-strip, [data-swipe-no-gesture], .overflow-x-auto, .overflow-x-scroll';

  var sx = 0, sy = 0, lock = false, active = false;

  function start(x, y) { sx = x; sy = y; lock = false; active = true; }
  function end() { active = false; lock = false; }

  function move(e, x, y) {
    if (!active) return;
    var dx = x - sx, dy = y - sy;
    if (!lock && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (e.target && e.target.closest && e.target.closest(IGNORE)) return;
      lock = true;
    }
    if (lock) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.cancelable) e.preventDefault();
    }
  }

  var blocking = { capture: true, passive: false };
  var passive = { capture: true, passive: true };

  window.addEventListener('touchstart', function (e) {
    var t = e.touches[0]; if (t) start(t.clientX, t.clientY);
  }, passive);
  window.addEventListener('touchmove', function (e) {
    var t = e.touches[0]; if (t) move(e, t.clientX, t.clientY);
  }, blocking);
  window.addEventListener('touchend', end, passive);
  window.addEventListener('touchcancel', end, passive);

  window.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') start(e.clientX, e.clientY);
  }, passive);
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') move(e, e.clientX, e.clientY);
  }, blocking);
  window.addEventListener('pointerup', end, passive);
  window.addEventListener('pointercancel', end, passive);

  injectCSS();
  document.addEventListener('DOMContentLoaded', function () { if (isOWUI()) injectCSS(); });
  if (document.head) new MutationObserver(injectCSS).observe(document.head, { childList: true });
})();
