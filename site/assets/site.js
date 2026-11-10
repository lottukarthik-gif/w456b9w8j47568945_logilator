(function () {
  var C = window.LOGILATOR || {};
  document.querySelectorAll('[data-buy]').forEach(function (a) {
    if (!C.buyUrl) return;
    a.href = C.buyUrl;
    if (/^https?:/.test(C.buyUrl)) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  var pa = document.getElementById('priceAmt'), pn = document.getElementById('priceNote');
  if (pa && C.price) pa.textContent = C.price;
  if (pn && C.priceNote) pn.textContent = C.priceNote;
  if (C.version) document.querySelectorAll('[data-version]').forEach(function (e) { e.textContent = 'v' + C.version; });

  // ---- payment page ----
  var card = document.getElementById('payCard');
  if (card) {
    var ok = /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(C.wallet || '') && /^\d+(\.\d+)?$/.test(C.payAmount || '');
    var ready = document.getElementById('payReady'), wait = document.getElementById('payWait');
    if (C.deliveryTime) document.querySelectorAll('[data-deliver]').forEach(function (e) { e.textContent = C.deliveryTime; });
    if (ok) {
      ready.hidden = false; wait.hidden = true;
      document.getElementById('payAmount').textContent = C.payAmount;
      document.getElementById('payAddr').textContent = C.wallet;
      if (C.network) document.getElementById('payNet').textContent = C.network;
      var ref = '';
      try { ref = sessionStorage.getItem('lgRef') || ''; } catch (e) {}
      if (!ref) {
        var a = new Uint8Array(4); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; });
        ref = 'LGL-' + Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('').toUpperCase();
        try { sessionStorage.setItem('lgRef', ref); } catch (e) {}
      }
      document.getElementById('payRef').textContent = ref;
      var mb2 = document.getElementById('mailBtn');
      mb2.href = 'mailto:' + mb2.getAttribute('href').replace('mailto:', '') + '?subject=' + encodeURIComponent('Logilator payment proof ' + ref) +
        '&body=' + encodeURIComponent('Reference: ' + ref + '\nAmount sent: ' + C.payAmount + ' USDT (TRC20)\nTransaction ID (TXID): \nEmail for delivery: \n');
      var cb = document.getElementById('copyBtn');
      cb.addEventListener('click', function () {
        var done = function () { cb.textContent = 'Copied'; setTimeout(function () { cb.textContent = 'Copy address'; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(C.wallet).then(done, function () { selectAddr(); });
        else selectAddr();
      });
      function selectAddr() { var r = document.createRange(); r.selectNodeContents(document.getElementById('payAddr')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); cb.textContent = 'Press Ctrl+C'; }
    }
  }

  // ---- image viewer (click a screenshot to enlarge) ----
  var shots = Array.prototype.slice.call(document.querySelectorAll('.frame img, .shot img'));
  if (shots.length) {
    var lb = document.createElement('div');
    lb.className = 'lb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<div class="lb-bar"><span class="lb-cap" id="lbCap"></span><div class="lb-tools">' +
      '<button type="button" id="lbOut" aria-label="Zoom out">−</button><button type="button" id="lbFit" aria-label="Reset zoom">Fit</button><button type="button" id="lbIn" aria-label="Zoom in">+</button>' +
      '<button type="button" id="lbX" aria-label="Close">✕</button></div></div>' +
      '<button type="button" class="lb-nav prev" id="lbPrev" aria-label="Previous image">‹</button>' +
      '<button type="button" class="lb-nav next" id="lbNext" aria-label="Next image">›</button>' +
      '<div class="lb-stage" id="lbStage"><img id="lbImg" alt="" draggable="false"></div><div class="lb-hint">Scroll to zoom, drag to move, double-click to zoom in. Esc to close.</div>';
    document.body.appendChild(lb);
    var stage = lb.querySelector('#lbStage'), big = lb.querySelector('#lbImg'), cap = lb.querySelector('#lbCap'), fitBtn = lb.querySelector('#lbFit');
    var idx = 0, s = 1, tx = 0, ty = 0, last = null, MAX = 4, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    var EASE = reduce ? 'none' : 'transform .28s cubic-bezier(.22,.8,.24,1)';
    var big2x = function (img) {
      var ss = img.getAttribute('srcset'); if (!ss) return img.currentSrc || img.src;
      var parts = ss.split(',').map(function (x) { return x.trim().split(/\s+/); });
      parts.sort(function (p, q) { return parseInt(q[1], 10) - parseInt(p[1], 10); });
      return parts[0][0];
    };
    var clamp = function () {
      var w = big.offsetWidth * s, h = big.offsetHeight * s, sw = stage.clientWidth, sh = stage.clientHeight;
      var mx = Math.max(0, (w - sw) / 2), my = Math.max(0, (h - sh) / 2);
      tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
    };
    var paint = function (anim) {
      big.style.transition = anim ? anim : 'none';
      big.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + s + ')';
      stage.classList.toggle('zoomed', s > 1.001);
      fitBtn.textContent = s <= 1.001 ? 'Fit' : Math.round(s * 100) + '%';
    };
    // zoom to ns keeping the point (cx, cy), measured from the stage centre, under the cursor
    var zoomAt = function (ns, cx, cy, anim) {
      ns = Math.max(1, Math.min(MAX, ns));
      var k = ns / s; tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; s = ns;
      if (s <= 1.001) { s = 1; tx = 0; ty = 0; } else clamp();
      paint(anim);
    };
    var centre = function (e) { var r = stage.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; };
    var show = function (i) {
      idx = (i + shots.length) % shots.length; s = 1; tx = 0; ty = 0; paint();
      var im = shots[idx]; big.src = big2x(im); big.alt = im.alt || ''; cap.textContent = im.alt || '';
      var many = shots.length > 1; lb.querySelector('#lbPrev').hidden = !many; lb.querySelector('#lbNext').hidden = !many;
    };
    var open = function (i) { last = document.activeElement; show(i); lb.hidden = false; document.documentElement.classList.add('lb-open'); lb.querySelector('#lbX').focus(); };
    var close = function () { lb.hidden = true; document.documentElement.classList.remove('lb-open'); if (last && last.focus) last.focus(); };
    shots.forEach(function (im, i) {
      im.classList.add('zoomable'); im.setAttribute('tabindex', '0'); im.setAttribute('role', 'button'); im.setAttribute('aria-label', 'Enlarge image: ' + (im.alt || 'screenshot'));
      im.addEventListener('click', function () { open(i); });
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    lb.querySelector('#lbX').addEventListener('click', close);
    lb.querySelector('#lbIn').addEventListener('click', function () { zoomAt(s * 1.5, 0, 0, EASE); });
    lb.querySelector('#lbOut').addEventListener('click', function () { zoomAt(s / 1.5, 0, 0, EASE); });
    fitBtn.addEventListener('click', function () { zoomAt(1, 0, 0, EASE); });
    lb.querySelector('#lbPrev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('#lbNext').addEventListener('click', function () { show(idx + 1); });

    // wheel / trackpad pinch: smooth, centred on the cursor
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      var c = centre(e), d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      var f = Math.exp(-d * (e.ctrlKey ? 0.012 : 0.0022));
      zoomAt(s * f, c[0], c[1], reduce ? 'none' : 'transform .12s ease-out');
    }, { passive: false });

    // drag to pan, two fingers to pinch, double click/tap to zoom
    var ptr = {}, drag = null, pinch = null, moved = false, lastTap = 0, downOn = null;
    var count = function () { return Object.keys(ptr).length; };
    stage.addEventListener('pointerdown', function (e) {
      ptr[e.pointerId] = { x: e.clientX, y: e.clientY }; downOn = e.target; moved = false;
      if (s > 1 || count() === 2) { try { stage.setPointerCapture(e.pointerId); } catch (err) {} }
      if (count() === 2) {
        var k = Object.keys(ptr).map(function (id) { return ptr[id]; });
        pinch = { d: Math.hypot(k[0].x - k[1].x, k[0].y - k[1].y), s: s }; drag = null;
      } else if (s > 1) drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
    });
    stage.addEventListener('pointermove', function (e) {
      if (!ptr[e.pointerId]) return; ptr[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (pinch && count() === 2) {
        var k = Object.keys(ptr).map(function (id) { return ptr[id]; });
        var r = stage.getBoundingClientRect();
        var mx = (k[0].x + k[1].x) / 2 - r.left - r.width / 2, my = (k[0].y + k[1].y) / 2 - r.top - r.height / 2;
        zoomAt(pinch.s * Math.hypot(k[0].x - k[1].x, k[0].y - k[1].y) / pinch.d, mx, my, 'none'); moved = true;
      } else if (drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
        tx = drag.tx + dx; ty = drag.ty + dy; clamp(); paint();
      }
    });
    var up = function (e) {
      delete ptr[e.pointerId]; pinch = null; drag = null;
      if (count() === 1 && s > 1) { var id = Object.keys(ptr)[0]; drag = { x: ptr[id].x, y: ptr[id].y, tx: tx, ty: ty }; }
    };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('click', function (e) {
      if (moved) { moved = false; return; }
      if (downOn !== big && e.target !== big) { close(); return; }
      var now = Date.now(), c = centre(e);
      if (now - lastTap < 320) { lastTap = 0; if (s > 1.001) zoomAt(1, 0, 0, EASE); else zoomAt(2.5, c[0], c[1], EASE); }
      else lastTap = now;
    });
    stage.addEventListener('dblclick', function (e) { e.preventDefault(); });
    addEventListener('resize', function () { if (!lb.hidden) { clamp(); paint(); } });
    addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') { if (s > 1.001) { tx += 80; clamp(); paint(EASE); } else show(idx - 1); }
      else if (e.key === 'ArrowRight') { if (s > 1.001) { tx -= 80; clamp(); paint(EASE); } else show(idx + 1); }
      else if (e.key === 'ArrowUp' && s > 1.001) { ty += 80; clamp(); paint(EASE); }
      else if (e.key === 'ArrowDown' && s > 1.001) { ty -= 80; clamp(); paint(EASE); }
      else if (e.key === '+' || e.key === '=') zoomAt(s * 1.5, 0, 0, EASE);
      else if (e.key === '-') zoomAt(s / 1.5, 0, 0, EASE);
      else if (e.key === '0') zoomAt(1, 0, 0, EASE);
      else if (e.key === 'Tab') { var f = lb.querySelectorAll('button:not([hidden])'); var a = document.activeElement; if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
    });
  }

  var dv = document.getElementById('demoVid');
  if (dv) {
    var srcs = dv.querySelectorAll('source'), fail = 0;
    var bad = function () { var e = document.getElementById('vidErr'); if (e) e.hidden = false; };
    srcs.forEach(function (s) { s.addEventListener('error', function () { if (++fail >= srcs.length) bad(); }); });
    dv.addEventListener('error', bad);
  }
  var mb = document.getElementById('menuBtn'), nav = document.getElementById('mainNav');
  if (mb && nav) {
    mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
  }

  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .1, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  var g = document.getElementById('glow');
  if (g && matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var x = 0, y = 0, p = false;
    addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; if (!p) { p = true; requestAnimationFrame(function () { g.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; p = false; }); } }, { passive: true });
  }
})();
