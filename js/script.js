/* Modular Office Sales & Marketing: minimal behaviour (menu, form). No animation. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $('#year').textContent = new Date().getFullYear();

  /* Mobile menu */
  var toggle = $('#navToggle'), nav = $('#primaryNav');
  function setMenu(open) { nav.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('#primaryNav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Active link while scrolling (simple, no observers needed) */
  var links = $$('#primaryNav a');
  var targets = links.map(function (a) { return $(a.getAttribute('href')); });
  function markActive() {
    var y = window.scrollY + 120, idx = 0;
    targets.forEach(function (t, i) { if (t && t.offsetTop <= y) idx = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === idx); });
  }
  markActive();
  window.addEventListener('scroll', markActive, { passive: true });

  /* Enquiry form: validation, then opens the visitor's email app (frontend only).
     To use a real form service later, replace the mailto code in the submit handler. */
  var form = $('#enquiryForm'), status = $('#formStatus');
  var EMAIL_TO = 'Modofficesales@gmail.com';
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var rules = {
    name: function (v) { return v.trim() ? '' : 'Please enter your full name.'; },
    email: function (v) {
      if (!v.trim()) return 'Please enter your email address.';
      return emailRe.test(v.trim()) ? '' : 'Please enter a valid email address, for example name@company.com.';
    },
    subject: function (v) { return v.trim() ? '' : 'Please enter a subject.'; },
    message: function (v) {
      if (!v.trim()) return 'Please enter a message.';
      return v.trim().length >= 10 ? '' : 'Please write a little more (at least 10 characters).';
    }
  };
  function check(n) {
    var f = form.elements[n], msg = rules[n](f.value);
    $('#e-' + n).textContent = msg;
    if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid');
    return !msg;
  }
  Object.keys(rules).forEach(function (n) {
    form.elements[n].addEventListener('blur', function () { check(n); });
    form.elements[n].addEventListener('input', function () { if (form.elements[n].getAttribute('aria-invalid')) check(n); });
  });
  function validate() {
    var bad = null;
    Object.keys(rules).forEach(function (n) { if (!check(n) && !bad) bad = form.elements[n]; });
    if (bad) bad.focus();
    return !bad;
  }
  function body() {
    var f = form.elements;
    return 'Name: ' + f.name.value.trim() + '\nBusiness: ' + (f.business.value.trim() || '(not given)') +
      '\nEmail: ' + f.email.value.trim() + '\n\n' + f.message.value.trim();
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); status.textContent = '';
    if (!validate()) { status.textContent = 'Please fix the highlighted fields.'; return; }
    window.location.href = 'mailto:' + EMAIL_TO + '?subject=' + encodeURIComponent(form.elements.subject.value.trim()) +
      '&body=' + encodeURIComponent(body());
    status.textContent = 'Your email app should now open with your message ready. Nothing has been sent until you press send there. If it did not open, use "Copy message" or WhatsApp.';
  });
  $('#copyMsg').addEventListener('click', function () {
    status.textContent = '';
    if (!validate()) { status.textContent = 'Please complete the form first.'; return; }
    var text = 'To: ' + EMAIL_TO + '\nSubject: ' + form.elements.subject.value.trim() + '\n\n' + body();
    var ok = function () { status.textContent = 'Message copied. Paste it into an email to ' + EMAIL_TO + '.'; };
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var good = false; try { good = document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(ta);
      if (good) ok(); else status.textContent = 'Could not copy automatically. Please copy the message manually.';
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  });
})();
