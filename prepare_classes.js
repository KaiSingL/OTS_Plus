(function () {
  var scheduled = false;

  function closestTable(el) {
    while (el && el.nodeType === 1) {
      if (el.tagName && el.tagName.toLowerCase() === 'table') return el;
      el = el.parentNode;
    }
    return null;
  }

  function closestRow(el) {
    while (el && el.nodeType === 1) {
      if (el.tagName && el.tagName.toLowerCase() === 'tr') return el;
      el = el.parentNode;
    }
    return null;
  }

  function tag() {
    if (scheduled) return;
    scheduled = true;
    (window.requestAnimationFrame || setTimeout)(function () {
      scheduled = false;
      var el, t;

      el = document.querySelector('table[width="760"], table[width="780"]');
      if (el) el.classList.add('azots-page-wrapper');

      el = document.querySelector('td.lblTitle');
      if (el) { t = closestTable(el); if (t) t.classList.add('azots-user-header'); }

      el = document.querySelector('a[href*="index.jsp"]');
      if (el) { t = closestTable(el); if (t) t.classList.add('azots-navigation'); }

      el = document.querySelector('input[name="TIMENOW"]');
      if (el) { t = closestTable(el); if (t) t.classList.add('azots-date-card'); }

      el = document.getElementById('preset-container') || document.getElementById('azots-plus-container');
      if (el) {
        el.classList.add('azots-plus-container');
        t = closestTable(el);
        if (t) t.classList.add('azots-editor-card');
      }

      el = document.querySelector(
        'select[name="LOC_ID"], select[name="LOC_FR"], ' +
        'input[name="CLAIM_DATE"], input[name="DATE_FROM"]'
      );
      if (el) { t = closestTable(el); if (t) t.classList.add('azots-entry-form'); }

      el = document.querySelector('input[name="SUBMIT"]');
      if (el) { t = closestRow(el); if (t) t.classList.add('azots-action-row'); }

      if (document.querySelector('input[name="SCREEN_NAME"]')) {
        if (document.body) document.body.classList.add('azots-login-page');
      }
    });
  }

  tag();

  var observer = new MutationObserver(tag);
  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    tag();
    observer.disconnect();
  });
})();
