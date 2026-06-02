/* ============================================================
   NOCTURNE — shared behaviour
   No Three.js, no GSAP. Pure CSS + IntersectionObserver +
   minimal rAF (cursor, light canvases). Built for zero jank.
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches || innerWidth < 768;
  const lerp = (a, b, t) => a + (b - a) * t;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  let hidden = false;
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; });

  /* ---------- Custom cursor removed (was laggy) — native cursor only ---------- */
  function initCursor() { /* intentionally disabled */ }

  /* ---------- Loader (brief, non-blocking) ---------- */
  function initLoader() {
    const loader = $('#loader');
    if (!loader) return;
    const finish = () => {
      loader.style.transition = 'opacity 320ms var(--ease-luxury)';
      loader.style.opacity = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 330);
    };
    if (prefersReduced) { loader.style.display = 'none'; return; }
    const brand = loader.querySelector('.brand');
    const line  = loader.querySelector('.load-line');
    requestAnimationFrame(() => {
      brand.style.transition = 'opacity 280ms var(--ease-luxury)';
      brand.style.opacity = '1';
      line.style.transition = 'width 360ms var(--ease-luxury)';
      line.style.width = '180px';
    });
    setTimeout(finish, 480);
    setTimeout(() => { if (loader.style.display !== 'none') finish(); }, 1500);
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const nav = $('.nav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', scrollY > 50);
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
    const burger = $('#hamburger'), menu = $('#mobileMenu');
    if (burger && menu) {
      burger.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('menu-open', open);
      });
      $$('a', menu).forEach(a => a.addEventListener('click', () => {
        menu.classList.remove('open'); burger.classList.remove('open');
        document.body.classList.remove('menu-open');
      }));
    }
  }

  /* ---------- Scroll reveals (IntersectionObserver) ---------- */
  function initReveals() {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      $$('.reveal').forEach(e => e.classList.add('in'));
      window.NOCTURNE_observe = () => $$('.reveal').forEach(e => e.classList.add('in'));
      return;
    }
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = (en.target.dataset.delay || 0) + 'ms';
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    const observe = () => $$('.reveal').forEach(e => { if (!seen.has(e)) { seen.add(e); io.observe(e); } });
    observe();
    window.NOCTURNE_observe = observe;   // re-scan after dynamic content is injected
  }

  /* ---------- Hero video: guarantee playback + seamless loop ---------- */
  function initHeroVideo() {
    const v = $('.hero__video, .bespoke__video');
    $$('.hero__video, .bespoke__video').forEach(vid => {
      vid.muted = true; vid.playsInline = true; vid.loop = true;
      const tryPlay = () => { const p = vid.play(); if (p) p.catch(() => {}); };
      tryPlay();
      // re-arm on first interaction in case autoplay was blocked
      const arm = () => { tryPlay(); removeEventListener('pointerdown', arm); removeEventListener('scroll', arm); };
      addEventListener('pointerdown', arm, { once: true });
      addEventListener('scroll', arm, { once: true, passive: true });
      // pause when offscreen / tab hidden (perf)
      document.addEventListener('visibilitychange', () => { document.hidden ? vid.pause() : tryPlay(); });
    });
  }

  /* ---------- Light parallax on hero media (subtle, ~0.25x) ---------- */
  function initParallax() {
    if (prefersReduced) return;
    const media = $('.hero__media');
    if (!media) return;
    media.style.transform = 'translateY(0) scale(1.16)';   // buffer both edges so no gap appears
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight) * 0.06;     // small travel, stays within the scale buffer
        media.style.transform = `translateY(${y}px) scale(1.16)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Testimonial carousel ---------- */
  function initCarousel() {
    const slides = $$('.quote-slide'); const dotsWrap = $('#quoteDots');
    if (!slides.length || !dotsWrap) return;
    let idx = 0, timer;
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'quote-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Show quote ${i + 1}`); d.setAttribute('data-cursor', '');
      d.addEventListener('click', () => { go(i); reset(); });
      dotsWrap.appendChild(d);
    });
    const dots = Array.from(dotsWrap.children);
    function go(i) { slides[idx].classList.remove('active'); dots[idx].classList.remove('active'); idx = i; slides[idx].classList.add('active'); dots[idx].classList.add('active'); }
    function reset() { clearInterval(timer); timer = setInterval(() => go((idx + 1) % slides.length), 5000); }
    reset();
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    const form = $('#newsletterForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      input.value = ''; input.placeholder = 'Welcome to the Inner Circle  ✦';
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    const btn = $('#backToTop'); if (!btn) return;
    addEventListener('scroll', () => btn.classList.toggle('show', scrollY > 500), { passive: true });
    btn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Craft canvas: rotating hexagonal wireframe (cheap 2D) ---------- */
  function initCraftCanvas() {
    const canvas = $('#craft-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); let w, h, dpr;
    function resize() { dpr = Math.min(devicePixelRatio, 2); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    resize(); addEventListener('resize', resize);
    let reveal = prefersReduced ? 1 : 0, vis = false, started = false;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((e) => {
        vis = e[0].isIntersecting;
        if (vis && !started && !prefersReduced) { started = true; const s = performance.now(); (function r(t){ reveal = Math.min(1, (t - s) / 1500); if (reveal < 1) requestAnimationFrame(r); })(s); }
      }, { threshold: 0.1 });
      io.observe(canvas);
    } else { vis = true; }
    let t = 0;
    (function draw() {
      if (!hidden && vis) {
        t += 0.005; ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2, rings = 5, maxR = Math.min(w, h) * 0.42;
        for (let ri = 1; ri <= rings; ri++) {
          const rr = (ri / rings) * maxR * reveal, rot = t * (ri % 2 ? 1 : -1) + ri * 0.4;
          ctx.beginPath();
          for (let s = 0; s <= 6; s++) { const a = (s / 6) * Math.PI * 2 + rot; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.strokeStyle = `rgba(201,168,76,${(0.28 + (ri / rings) * 0.5) * reveal})`; ctx.lineWidth = 1; ctx.stroke();
        }
        for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + t; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * maxR * reveal, cy + Math.sin(a) * maxR * reveal); ctx.strokeStyle = `rgba(201,168,76,${0.14 * reveal})`; ctx.stroke(); }
      }
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- Celestial canvas: drifting gold stars + mouse repel ---------- */
  function initCelestial() {
    const canvas = $('#celestial-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); let w, h, dpr, pts = [];
    const COUNT = isTouch ? 1200 : 2400;
    let vis = false;
    function build() {
      dpr = Math.min(devicePixelRatio, 2); w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      const cols = Math.ceil(Math.sqrt(COUNT * (w / h))), rows = Math.ceil(COUNT / cols);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++)
        pts.push({ hx: (i / (cols - 1)) * w, hy: (j / (rows - 1)) * h, x: Math.random() * w, y: Math.random() * h, ph: Math.random() * Math.PI * 2 });
    }
    build(); addEventListener('resize', build);
    let assemble = prefersReduced ? 1 : 0;
    // persistent observer: only animate while the section is on screen
    if ('IntersectionObserver' in window) {
      let started = false;
      const io = new IntersectionObserver((e) => {
        vis = e[0].isIntersecting;
        if (vis && !started && !prefersReduced) { started = true; const s = performance.now(); (function r(t){ assemble = Math.min(1, (t - s) / 1500); if (assemble < 1) requestAnimationFrame(r); })(s); }
        else if (vis && prefersReduced) assemble = 1;
      }, { threshold: 0.05 });
      io.observe(canvas);
    } else { vis = true; assemble = 1; }
    let mx = -9999, my = -9999;
    canvas.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    canvas.addEventListener('mouseleave', () => { mx = my = -9999; });
    let t = 0;
    (function draw() {
      if (!hidden && vis) {
        t += 0.016; ctx.clearRect(0, 0, w, h);
        for (let k = 0; k < pts.length; k++) {
          const p = pts[k], wave = Math.sin(t + p.ph) * 6;
          const ax = lerp(p.x, p.hx, assemble), ay = lerp(p.y, p.hy + wave, assemble);
          let dx = ax, dy = ay; const ddx = ax - mx, ddy = ay - my, dist = Math.hypot(ddx, ddy);
          if (dist < 100) { const f = (1 - dist / 100) * 28; dx += (ddx / (dist || 1)) * f; dy += (ddy / (dist || 1)) * f; }
          const tn = 1 - ay / h, g = 168 + (tn * 70 | 0), b = 76 + (tn * 150 | 0);
          ctx.fillStyle = `rgba(${201 + (tn * 40 | 0)},${g},${b},${0.45 + tn * 0.4})`;
          ctx.fillRect(dx, dy, 1.5, 1.5);
        }
      }
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- Newsletter noise texture ---------- */
  function initNoise() {
    const canvas = $('#noise-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function render() {
      const w = canvas.width = canvas.clientWidth, h = canvas.height = canvas.clientHeight;
      if (!w || !h) return;
      const img = ctx.createImageData(w, h), d = img.data;
      for (let i = 0; i < d.length; i += 4) { d[i] = 201; d[i+1] = 168; d[i+2] = 76; d[i+3] = Math.random() * 128; }
      ctx.putImageData(img, 0, 0);
    }
    render(); addEventListener('resize', render);
  }

  /* ---------- Shared store: bag + favourites (localStorage) ---------- */
  const store = {
    favs() { try { return JSON.parse(localStorage.getItem('noct_favs') || '[]'); } catch (e) { return []; } },
    isFav(id) { return store.favs().includes(id); },
    toggleFav(id) { const f = store.favs(); const i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1);
      localStorage.setItem('noct_favs', JSON.stringify(f)); paintFav(); return i < 0; },
    items() { try { return JSON.parse(localStorage.getItem('noct_bag') || '[]'); } catch (e) { return []; } },
    count() { return store.items().length; },
    addItem(it) { const a = store.items(); a.push(it); localStorage.setItem('noct_bag', JSON.stringify(a)); paintBag(); renderBag(); },
    removeItem(i) { const a = store.items(); a.splice(i, 1); localStorage.setItem('noct_bag', JSON.stringify(a)); paintBag(); renderBag(); },
    clearBag() { localStorage.removeItem('noct_bag'); paintBag(); renderBag(); }
  };
  window.NOCTURNE_STORE = store;
  function paintBag() { const el = $('.icon-btn[aria-label="Shopping bag"] .bag-count'); if (el) { const n = store.count(); el.textContent = n; el.style.display = n ? '' : 'none'; } }
  function paintFav() { const el = $('#favCount'); if (el) { const n = store.favs().length; el.textContent = n; el.style.display = n ? '' : 'none'; } document.dispatchEvent(new CustomEvent('noct:favs')); }

  /* ---------- Nav: inject Favourites icon before the bag ---------- */
  function initFavNav() {
    const right = $('.nav__right'); const bag = right && right.querySelector('.icon-btn[aria-label="Shopping bag"]');
    if (!bag || $('#favBtn')) return;
    const a = document.createElement('a');
    a.id = 'favBtn'; a.className = 'icon-btn'; a.href = 'collections.html?fav=1'; a.setAttribute('aria-label', 'Favourites'); a.setAttribute('data-cursor', '');
    a.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z"/></svg><span class="bag-count" id="favCount"></span>`;
    right.insertBefore(a, bag);
    paintFav();
  }

  /* ---------- Search overlay ---------- */
  function initSearch() {
    const trigger = $('.icon-btn[aria-label="Search"]'); if (!trigger) return;
    const ov = document.createElement('div'); ov.className = 'search-ov'; ov.hidden = true;
    ov.innerHTML = `<button class="search-ov__close" aria-label="Close search" data-cursor>✕</button>
      <form class="search-ov__form" id="searchForm"><input type="search" id="searchInput" placeholder="Search the maison…" autocomplete="off" /><button type="submit" aria-label="Search" data-cursor>→</button></form>
      <p class="search-ov__hint">Press enter to search the collection</p>`;
    document.body.appendChild(ov);
    const open = () => { ov.hidden = false; void ov.offsetWidth; ov.classList.add('open'); document.body.classList.add('menu-open'); setTimeout(() => $('#searchInput').focus(), 60); };
    const close = () => { ov.classList.remove('open'); document.body.classList.remove('menu-open'); setTimeout(() => ov.hidden = true, 400); };
    trigger.addEventListener('click', open);
    ov.querySelector('.search-ov__close').addEventListener('click', close);
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });
    $('#searchForm', ov).addEventListener('submit', (e) => {
      e.preventDefault(); const q = $('#searchInput').value.trim();
      location.href = 'collections.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  /* ---------- Bag drawer + checkout ---------- */
  let bagEl = null;
  function renderBag() {
    if (!bagEl) return;
    const items = store.items();
    const list = bagEl.querySelector('#bagList');
    const total = items.reduce((s, it) => s + (it.priceNum || 0), 0);
    if (!items.length) list.innerHTML = '<p class="bag-empty">Your bag is empty.</p>';
    else list.innerHTML = items.map((it, i) => `
      <div class="bag-item">
        <div class="bag-thumb" style="background-image:url('${it.img}')"></div>
        <div class="bag-meta"><div class="bag-name">${it.name}</div><div class="bag-sub">${it.metal || ''}${it.size ? ' · Size ' + it.size : ''}</div><div class="bag-price">${it.price}</div></div>
        <button class="bag-remove" data-rm="${i}" aria-label="Remove">✕</button>
      </div>`).join('');
    bagEl.querySelector('#bagTotal').textContent = total ? '$' + total.toLocaleString() : '—';
    bagEl.querySelector('#bagCheckout').classList.toggle('disabled', !items.length);
  }
  function initBag() {
    const trigger = $('.icon-btn[aria-label="Shopping bag"]'); if (!trigger) return;
    bagEl = document.createElement('div'); bagEl.className = 'bag-drawer'; bagEl.hidden = true;
    bagEl.innerHTML = `
      <div class="bag-scrim" data-bagclose></div>
      <aside class="bag-panel" role="dialog" aria-modal="true" aria-label="Shopping bag">
        <div class="bag-head"><h3>Your Bag</h3><button data-bagclose aria-label="Close">✕</button></div>
        <div class="bag-list" id="bagList"></div>
        <div class="bag-foot">
          <div class="bag-total"><span>Subtotal</span><span id="bagTotal"></span></div>
          <a class="btn btn--solid bag-checkout" id="bagCheckout" href="checkout.html">Checkout</a>
          <button class="btn--text" data-bagclose data-cursor>Continue shopping</button>
        </div>
      </aside>`;
    document.body.appendChild(bagEl);
    const open = () => { renderBag(); bagEl.hidden = false; void bagEl.offsetWidth; bagEl.classList.add('open'); document.body.classList.add('menu-open'); };
    const close = () => { bagEl.classList.remove('open'); document.body.classList.remove('menu-open'); setTimeout(() => bagEl.hidden = true, 400); };
    trigger.addEventListener('click', (e) => { e.preventDefault(); open(); });
    bagEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-bagclose]')) return close();
      const rm = e.target.closest('[data-rm]'); if (rm) store.removeItem(+rm.dataset.rm);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && bagEl.classList.contains('open')) close(); });
  }

  /* ---------- Boot ---------- */
  function boot() {
    document.documentElement.classList.remove('no-js');
    initCursor(); initLoader(); initNav(); initReveals();
    initHeroVideo(); initParallax(); initCarousel(); initNewsletter(); initBackToTop();
    initFavNav(); initSearch(); initBag(); paintBag();
    // heavy canvases off the critical path so first paint + scroll stay smooth
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
    idle(() => { initCraftCanvas(); initCelestial(); initNoise(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
