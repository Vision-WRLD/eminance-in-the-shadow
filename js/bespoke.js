/* ============================================================
   NOCTURNE — Bespoke configurator
   Swaps the live product image as the metal finish changes.
   ============================================================ */
(function () {
  'use strict';
  const stage = document.getElementById('bespokeProduct');
  if (!stage) return;

  const IMG = (id, w = 900) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

  // Real jewelry photos chosen to read as each finish.
  const FINISH = {
    gold:     '1605100804763-247f67b3557e',
    platinum: '1607703829739-c05b7beddf60',
    rose:     '1605100804567-1ffe942b5cd6'
  };

  function setFinish(metal) {
    const url = IMG(FINISH[metal] || FINISH.gold);
    // preload then fade for a clean swap
    const pre = new Image();
    pre.onload = () => {
      stage.style.opacity = '0';
      setTimeout(() => {
        stage.style.backgroundImage = `url('${url}')`;
        stage.style.opacity = '1';
      }, 180);
    };
    pre.src = url;
  }

  stage.style.transition = 'opacity 420ms var(--ease-luxury)';
  setFinish('gold');

  document.querySelectorAll('.metal-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.metal-swatch').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      setFinish(btn.dataset.metal);
    });
  });
})();
