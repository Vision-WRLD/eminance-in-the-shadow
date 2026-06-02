/* ============================================================
   NOCTURNE — Checkout page
   ============================================================ */
(function () {
  'use strict';
  const store = window.NOCTURNE_STORE; if (!store) return;
  const $ = (id) => document.getElementById(id);

  function render() {
    const items = store.items();
    const wrap = $('checkoutWrap'), empty = $('coEmpty');
    if (!items.length) { wrap.hidden = true; empty.hidden = false; return; }
    const total = items.reduce((s, it) => s + (it.priceNum || 0), 0);
    $('coItems').innerHTML = items.map((it, i) => `
      <div class="co-item">
        <div class="co-thumb" style="background-image:url('${it.img}')"></div>
        <div class="co-meta"><div class="co-name">${it.name}</div><div class="co-sub">${it.metal || ''}${it.size ? ' · Size ' + it.size : ''}</div></div>
        <div class="co-price">${it.price}</div>
        <button class="co-rm" data-rm="${i}" aria-label="Remove">✕</button>
      </div>`).join('');
    const money = '$' + total.toLocaleString();
    $('coSub').textContent = money; $('coTotal').textContent = money;
  }

  $('coItems') && document.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm]'); if (!rm) return;
    store.removeItem(+rm.dataset.rm); render();
  });

  $('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const no = 'NOC-' + String(Math.floor(performance.now() % 100000)).padStart(5, '0');
    store.clearBag();
    $('checkoutWrap').hidden = true;
    $('coOrderNo').textContent = no;
    $('coDone').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  render();
})();
