/* ============================================================
   NOCTURNE — Collections: filter + sort + Pandora-style PDP
   ============================================================ */
(function () {
  'use strict';
  const grid = document.getElementById('productsGrid');
  if (!grid || !window.NOCTURNE) return;
  const { PRODUCTS, IMG, COLOURS, TYPES } = window.NOCTURNE;
  const $ = (id) => document.getElementById(id);

  const METAL_HEX = { gold: COLOURS.gold, silver: COLOURS.silver, rose: COLOURS.rose, platinum: '#d8d8de', white: COLOURS.white };
  const METAL_LABEL = { gold: 'Gold', silver: 'Silver', rose: 'Rose Gold', platinum: 'Platinum', white: 'White Gold' };

  const store = window.NOCTURNE_STORE;
  const params = new URLSearchParams(location.search);
  const Q = (params.get('q') || '').toLowerCase();
  const FAV = params.get('fav') === '1';

  const prices = PRODUCTS.filter(p => p.priceNum).map(p => p.priceNum);
  const PMIN = Math.min(...prices), PMAX = Math.max(...prices);

  const state = { types: new Set(), materials: new Set(), sizes: new Set(),
                  min: PMIN, max: PMAX, sort: 'featured' };

  /* ---------- build filter controls ---------- */
  const uniq = (arr) => [...new Set(arr)];
  const materials = uniq(PRODUCTS.map(p => p.material));
  const sizes = uniq(PRODUCTS.flatMap(p => p.sizes));

  $('fType').innerHTML = Object.entries(TYPES).map(([k, v]) =>
    `<label><input type="checkbox" data-grp="types" value="${k}" data-cursor>${v}</label>`).join('');
  $('fMaterial').innerHTML = materials.map(m =>
    `<label><input type="checkbox" data-grp="materials" value="${m}" data-cursor>${m}</label>`).join('');
  $('fSize').innerHTML = sizes.map(s =>
    `<button class="fp-chip" data-grp="sizes" data-val="${s}" aria-pressed="false" data-cursor>${s}</button>`).join('');

  const pminEl = $('priceMin'), pmaxEl = $('priceMax');
  [pminEl, pmaxEl].forEach(el => { el.min = PMIN; el.max = PMAX; el.step = 50; });
  pminEl.value = PMIN; pmaxEl.value = PMAX;
  const fmt = (n) => '$' + (+n).toLocaleString();
  function syncPriceLabels() { $('priceMinVal').textContent = fmt(state.min); $('priceMaxVal').textContent = fmt(state.max); }

  /* ---------- card ---------- */
  function card(p, i) {
    const a = document.createElement('article');
    a.className = 'product-card reveal'; a.dataset.id = p.id; a.dataset.delay = (i % 4) * 60;
    a.innerHTML = `
      <div class="product-card__img" role="button" tabindex="0" aria-label="View ${p.name}" data-cursor>
        <div class="pic" style="background-image:linear-gradient(160deg, rgba(201,168,76,0.08), rgba(7,7,7,0.5)), url('${IMG(p.id, 600)}');"></div>
        <button class="wishlist${store.isFav(p.id) ? ' active' : ''}" aria-label="Add to favourites" aria-pressed="${store.isFav(p.id)}" data-cursor><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z"/></svg></button>
      </div>
      <div class="product-card__name">${p.name}</div>
      <div class="product-card__mat">${p.mat}</div>
      <div class="product-card__price">${p.price}</div>`;
    return a;
  }

  /* ---------- filter + sort + render ---------- */
  function compute() {
    let list = PRODUCTS.filter(p => {
      if (FAV && !store.isFav(p.id)) return false;
      if (Q && !(p.name + ' ' + p.mat + ' ' + p.type + ' ' + p.story).toLowerCase().includes(Q)) return false;
      if (state.types.size && !state.types.has(p.cat)) return false;
      if (state.materials.size && !state.materials.has(p.material)) return false;
      if (state.sizes.size && !p.sizes.some(s => state.sizes.has(s))) return false;
      if (p.priceNum && (p.priceNum < state.min || p.priceNum > state.max)) return false;
      return true;
    });
    const byName = (a, b) => a.name.localeCompare(b.name);
    const pv = (p) => p.priceNum || Infinity;
    if (state.sort === 'az') list.sort(byName);
    else if (state.sort === 'za') list.sort((a, b) => byName(b, a));
    else if (state.sort === 'plow') list.sort((a, b) => pv(a) - pv(b));
    else if (state.sort === 'phigh') list.sort((a, b) => pv(b) - pv(a));
    else if (state.sort === 'new') list.sort((a, b) => (b.isNew | 0) - (a.isNew | 0));
    return list;
  }
  function render() {
    const list = compute();
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = `<p class="shop-empty">${FAV ? 'No favourites yet — tap the heart on a piece to save it.' : 'Nothing matches those filters.'}</p>`;
    } else list.forEach((p, i) => grid.appendChild(card(p, i)));
    const ctx = FAV ? 'Favourites · ' : (Q ? `“${Q}” · ` : '');
    $('resultCount').textContent = ctx + list.length + ' piece' + (list.length === 1 ? '' : 's');
    if (window.NOCTURNE_observe) window.NOCTURNE_observe();
  }

  /* ---------- filter panel interactions ---------- */
  const panel = $('filterPanel'), scrim = $('filterScrim');
  const openPanel = () => { panel.hidden = false; scrim.hidden = false; $('filterToggle').setAttribute('aria-expanded', 'true'); };
  const closePanel = () => { panel.hidden = true; scrim.hidden = true; $('filterToggle').setAttribute('aria-expanded', 'false'); };
  $('filterToggle').addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
  $('filterClose').addEventListener('click', closePanel);
  scrim.addEventListener('click', closePanel);

  panel.addEventListener('change', (e) => {
    const cb = e.target.closest('input[type=checkbox]'); if (!cb) return;
    state[cb.dataset.grp][cb.checked ? 'add' : 'delete'](cb.value); render();
  });
  panel.addEventListener('click', (e) => {
    const t = e.target.closest('[data-grp][data-val]'); if (!t) return;
    const on = t.getAttribute('aria-pressed') === 'true';
    t.setAttribute('aria-pressed', String(!on));
    state[t.dataset.grp][on ? 'delete' : 'add'](t.dataset.val); render();
  });
  function onPrice() {
    let lo = +pminEl.value, hi = +pmaxEl.value;
    if (lo > hi) { [lo, hi] = [hi, lo]; }
    state.min = lo; state.max = hi; syncPriceLabels(); render();
  }
  pminEl.addEventListener('input', onPrice); pmaxEl.addEventListener('input', onPrice);
  $('filterApply').addEventListener('click', closePanel);
  $('filterClear').addEventListener('click', () => {
    ['types', 'materials', 'sizes'].forEach(g => state[g].clear());
    state.min = PMIN; state.max = PMAX; pminEl.value = PMIN; pmaxEl.value = PMAX; syncPriceLabels();
    panel.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
    panel.querySelectorAll('[aria-pressed]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    render();
  });
  $('sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

  /* ---------- PDP (Pandora-style) ---------- */
  const pdp = document.createElement('div');
  pdp.className = 'pdp'; pdp.setAttribute('role', 'dialog'); pdp.setAttribute('aria-modal', 'true'); pdp.hidden = true;
  pdp.innerHTML = `
    <div class="pdp__backdrop" data-close></div>
    <div class="pdp__panel">
      <button class="pdp__close" aria-label="Close" data-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      <div class="pdp__img" id="pdpImg"><div class="pdp__lens" id="pdpLens"></div></div>
      <div class="pdp__body">
        <div class="pdp__new" id="pdpNew"></div>
        <h2 class="pdp__name" id="pdpName"></h2>
        <div class="pdp__mat" id="pdpMatSub"></div>
        <div class="pdp__price" id="pdpPrice"></div>
        <div class="pdp__opt"><div class="lbl" id="pdpMetalLbl">Metal</div><div class="pdp__row" id="pdpMetals"></div></div>
        <button class="pdp__details" id="pdpToggle" aria-expanded="false">View product details</button>
        <div class="pdp__story" id="pdpStory"></div>
        <button class="pdp__size" id="pdpSizeBtn" aria-expanded="false">Find your size <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m9 6 6 6-6 6"/></svg></button>
        <div class="pdp__sizes hidden" id="pdpSizes"></div>
        <button class="pdp__bag" id="pdpBag"><span id="pdpBagPrice"></span><span id="pdpBagLabel">Add to Bag</span></button>
      </div>
    </div>`;
  document.body.appendChild(pdp);

  // lens zoom: small box follows cursor, magnifies area under it
  const imgEl = $('pdpImg'), lens = $('pdpLens');
  const noHover = matchMedia('(hover: none)').matches;
  const ZOOM = 2.4, LENS = 150;
  let lensUrl = '';
  if (!noHover) {
    imgEl.addEventListener('mousemove', (e) => {
      const r = imgEl.getBoundingClientRect();
      let x = e.clientX - r.left, y = e.clientY - r.top;
      const half = LENS / 2;
      const lx = Math.max(half, Math.min(x, r.width - half));
      const ly = Math.max(half, Math.min(y, r.height - half));
      lens.style.left = lx + 'px'; lens.style.top = ly + 'px';
      lens.style.backgroundImage = `url('${lensUrl}')`;
      lens.style.backgroundSize = (r.width * ZOOM) + 'px ' + (r.height * ZOOM) + 'px';
      lens.style.backgroundPosition = `-${x * ZOOM - half}px -${y * ZOOM - half}px`;
      lens.style.opacity = '1';
    });
    imgEl.addEventListener('mouseleave', () => { lens.style.opacity = '0'; });
  }

  let curP = null;
  function open(p) {
    curP = p;
    pdp.hidden = false;
    imgEl.style.backgroundSize = 'cover'; imgEl.style.backgroundPosition = 'center';
    $('pdpImg').style.backgroundImage = `linear-gradient(160deg, rgba(201,168,76,0.06), rgba(7,7,7,0.35)), url('${IMG(p.id, 1000)}')`;
    lensUrl = IMG(p.id, 1200); lens.style.opacity = '0';
    $('pdpNew').textContent = p.isNew ? 'New' : '';
    $('pdpName').textContent = p.name;
    $('pdpMatSub').textContent = p.material;
    $('pdpPrice').textContent = p.price;
    $('pdpBagPrice').textContent = p.priceNum ? p.price : '';
    $('pdpBagLabel').textContent = p.priceNum ? 'Add to Bag' : 'Enquire';
    $('pdpMetals').innerHTML = p.metals.map((m, i) =>
      `<button class="pdp__metal" data-cursor aria-pressed="${i === 0}" title="${METAL_LABEL[m]}" style="background:${METAL_HEX[m]}"></button>`).join('');
    $('pdpMetalLbl').textContent = METAL_LABEL[p.metals[0]];
    $('pdpStory').innerHTML = `<p>${p.story}</p><p>${p.mat} · hand-finished in the NOCTURNE atelier.</p>`;
    $('pdpStory').classList.remove('show'); $('pdpToggle').setAttribute('aria-expanded', 'false'); $('pdpToggle').textContent = 'View product details';
    $('pdpSizes').innerHTML = p.sizes.map((s, i) => `<button class="pdp__sizebtn" data-cursor aria-pressed="false">${s}</button>`).join('');
    $('pdpSizes').classList.add('hidden'); $('pdpSizeBtn').setAttribute('aria-expanded', 'false');
    void pdp.offsetWidth; pdp.classList.add('open'); document.body.classList.add('menu-open');
  }
  function close() { pdp.classList.remove('open'); document.body.classList.remove('menu-open'); setTimeout(() => { pdp.hidden = true; }, 520); }

  pdp.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return close();
    const swatch = e.target.closest('.pdp__metal');
    if (swatch) { swatch.parentElement.querySelectorAll('[aria-pressed]').forEach(b => b.setAttribute('aria-pressed', 'false')); swatch.setAttribute('aria-pressed', 'true'); $('pdpMetalLbl').textContent = swatch.title; return; }
    if (e.target.closest('#pdpToggle')) {
      const s = $('pdpStory').classList.toggle('show');
      $('pdpToggle').setAttribute('aria-expanded', String(s));
      $('pdpToggle').textContent = s ? 'Hide product details' : 'View product details'; return;
    }
    if (e.target.closest('#pdpSizeBtn')) { const h = $('pdpSizes').classList.toggle('hidden'); $('pdpSizeBtn').setAttribute('aria-expanded', String(!h)); return; }
    const sz = e.target.closest('.pdp__sizebtn');
    if (sz) { $('pdpSizes').querySelectorAll('[aria-pressed]').forEach(b => b.setAttribute('aria-pressed', 'false')); sz.setAttribute('aria-pressed', 'true'); return; }
    if (e.target.closest('#pdpBag')) {
      const enquire = !(curP && curP.priceNum);
      const metal = $('pdpMetalLbl').textContent;
      const sizeBtn = $('pdpSizes').querySelector('[aria-pressed="true"]');
      const size = sizeBtn && sizeBtn.textContent !== 'One Size' ? sizeBtn.textContent : '';
      if (!enquire) store.addItem({ id: curP.id, name: curP.name, price: curP.price, priceNum: curP.priceNum, metal, size, img: IMG(curP.id, 200) });
      $('pdpBagLabel').textContent = enquire ? 'Enquiry sent ✦' : 'Added to Bag ✦';
      setTimeout(() => $('pdpBagLabel').textContent = enquire ? 'Enquire' : 'Add to Bag', 1500);
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pdp.classList.contains('open')) close(); });

  /* ---------- grid interactions ---------- */
  const byId = (id) => PRODUCTS.find(p => p.id === id);
  grid.addEventListener('click', (e) => {
    const w = e.target.closest('.wishlist');
    if (w) { e.preventDefault(); const id = e.target.closest('.product-card').dataset.id;
      const on = store.toggleFav(id); w.classList.toggle('active', on); w.setAttribute('aria-pressed', on);
      if (FAV) render(); return; }
    const c = e.target.closest('.product-card'); if (c) open(byId(c.dataset.id));
  });
  grid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.product-card__img')) { e.preventDefault(); open(byId(e.target.closest('.product-card').dataset.id)); }
  });

  syncPriceLabels();
  render();
})();
