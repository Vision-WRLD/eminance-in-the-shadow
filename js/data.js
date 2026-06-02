/* ============================================================
   NOCTURNE — shared catalog (real jewelry imagery, Unsplash CDN)
   window.NOCTURNE { IMG, COLOURS, COLLECTIONS, PRODUCTS, TYPES }
   Renders the featured grid on the home page.
   ============================================================ */
(function () {
  'use strict';

  const IMG = (id, w = 800) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

  // colour key -> swatch hex
  const COLOURS = {
    blue: '#3b6fd4', aqua: '#6fb3c9', white: '#e9e9ec', pink: '#e0589b',
    purple: '#7a2f8a', gold: '#c9a84c', silver: '#c9ccd2', black: '#161616',
    green: '#3f7d5f', rose: '#d8a08a', champagne: '#e8c97a'
  };

  const TYPES = { rings: 'Rings', necklaces: 'Necklaces', earrings: 'Earrings', high: 'High Jewelry' };

  const RING_SIZES = ['4.5', '5', '6', '7', '7.5', '8.5', '9'];
  const LEN_SIZES  = ['16"', '18"', '20"'];
  const ONE        = ['One Size'];

  // p() builds a product compactly. metals = selectable finishes.
  const P = (cat, name, material, gem, priceNum, colours, sizes, id, story, isNew) =>
    ({ cat, type: TYPES[cat], name, material, gem,
       mat: gem ? `${material} · ${gem}` : material,
       price: priceNum ? '$' + priceNum.toLocaleString() : 'On Request', priceNum,
       colours, sizes, id, story, isNew: !!isNew,
       metals: cat === 'rings' || cat === 'high' ? ['silver', 'gold', 'rose'] : ['gold', 'silver'] });

  const PRODUCTS = [
    P('rings','Crescent Solitaire','18K Gold','Diamond',7400,['white','champagne'],RING_SIZES,'1605100804763-247f67b3557e','Cut from a single waxing moon, the Crescent holds one brilliant stone aloft — a vow made to the night sky.',true),
    P('rings','Void Signet','Platinum','Sapphire',5800,['blue','black'],RING_SIZES,'1603561591411-07134e71a2a9','A signet for those who keep their own counsel — a deep blue sapphire set flush, like a window onto deep space.'),
    P('rings','Ember Band','Rose Gold','',2150,['rose','pink'],RING_SIZES,'1605100804567-1ffe942b5cd6','Warm as the last coal of the evening fire, the Ember is a quiet promise you can wear every day.'),
    P('rings','Halo Noir','18K Gold','Onyx',3900,['black','gold'],RING_SIZES,'1543294001-f7cd5d7fb516','Black onyx ringed in gold — an eclipse rendered small enough to slip onto a finger.'),
    P('rings','Eclipse Trinity','Platinum','Diamond',8600,['white','silver'],RING_SIZES,'1607703829739-c05b7beddf60','Three stones for the three phases of a single night: dusk, deep dark, and the first grey of dawn.'),
    P('rings','Vesper','Sterling Silver','',1980,['silver','white'],RING_SIZES,'1589674668791-4889d2bba4c6','Named for the evening star, the Vesper is the first light you see and the last you take off.'),
    P('necklaces','Midnight Veil','18K Gold','Diamond',6200,['white','gold'],LEN_SIZES,'1601121141461-9d6647bca1ed','A fall of diamonds like a veil drawn across midnight — meant to catch candlelight and turn heads slowly.',true),
    P('necklaces','Nightfall Pendant','Platinum','Pearl',4300,['white','silver'],LEN_SIZES,'1611107683227-e9060eccd846','A single pearl held at the hollow of the throat, pale as the moon over a still sea.'),
    P('necklaces','Constellation','18K Gold','',3100,['gold','champagne'],LEN_SIZES,'1620656798579-1984d9e87df7','Seven gold points mapped from the sky the night the house was founded — your own private constellation.'),
    P('necklaces','Aurora Chain','Rose Gold','',2700,['rose','pink'],LEN_SIZES,'1569397288884-4d43d6738fbd','A ribbon of rose gold that shifts colour as you move, like the northern lights over snow.'),
    P('earrings','Starless Drops','Platinum','Diamond',5100,['white','blue'],ONE,'1615197419962-90f21da0956d','Long diamond drops for the darkest, starless nights — you become the only light in the room.',true),
    P('earrings','Lunar Studs','Sterling Silver','Pearl',3300,['white','silver'],ONE,'1535632787350-4e68ef0ac584','Two small full moons, set to sit just below the ear and glow against the skin.'),
    P('earrings','Cascade','18K Gold','Diamond',4800,['white','champagne'],ONE,'1638854254875-a2416fe0fec2','A cascade of graduated stones, like a meteor shower frozen at the moment of its fall.'),
    P('high','The Obsidian Parure','Platinum','14ct Diamond',0,['white','black','purple'],ONE,'1623321673989-830eff0fd59f','Our masterwork — a matched suite carved around a 14-carat stone, shown only by private appointment after dark.'),
    P('high','Nocturne Tiara','18K Gold','Diamond',0,['white','gold'],ONE,'1518370265276-f22b706aeac8','One hundred and forty-two stones for one hundred and forty-two years of the house — a crown for the small hours.')
  ];

  // Scatter the metal options so pieces don't all share the same set.
  const MSET = [['silver','gold'],['platinum','silver'],['rose','gold','silver'],['gold','silver','white'],
    ['platinum','white','silver'],['silver','white'],['gold','white','silver'],['platinum','silver'],
    ['gold','silver','rose'],['rose','silver'],['silver','white'],['platinum','white'],
    ['gold','rose','silver','white'],['platinum','white','silver','gold'],['gold','platinum','silver']];
  PRODUCTS.forEach((p, i) => { p.metals = MSET[i] || ['gold', 'silver']; });

  window.NOCTURNE = { IMG, COLOURS, TYPES, PRODUCTS };

  // Featured collections (home)
  const COLLECTIONS = [
    { tag: 'Rings', name: 'Crescent Solitaire', count: '24 Pieces', id: '1605100804763-247f67b3557e' },
    { tag: 'Necklaces', name: 'Midnight Veil', count: '18 Pieces', id: '1601121141461-9d6647bca1ed' },
    { tag: 'Earrings', name: 'Starless Drops', count: '31 Pieces', id: '1615197419962-90f21da0956d' },
    { tag: 'High Jewelry', name: 'The Obsidian', count: '9 Pieces', id: '1603561591411-07134e71a2a9' },
    { tag: 'Necklaces', name: 'Nightfall', count: '15 Pieces', id: '1611107683227-e9060eccd846' },
    { tag: 'Bespoke', name: 'One of One', count: '∞ Pieces', id: '1598560917807-1bae44bd2be8' }
  ];
  const grid = document.getElementById('featuredGrid');
  if (grid) {
    COLLECTIONS.forEach((c, i) => {
      const a = document.createElement('a');
      a.href = 'collections.html'; a.className = 'collection-card reveal';
      a.setAttribute('data-cursor', ''); a.dataset.delay = (i % 3) * 90;
      a.innerHTML = `
        <div class="collection-card__img" style="background-image:linear-gradient(180deg, rgba(7,7,7,0.15), rgba(7,7,7,0.55)), url('${IMG(c.id, 700)}');"></div>
        <div class="collection-card__overlay"></div><div class="collection-card__border"></div>
        <div class="collection-card__body">
          <div class="collection-card__tag">${c.tag}</div>
          <div class="collection-card__name">${c.name}</div>
          <div class="collection-card__count">${c.count}</div>
          <div class="collection-card__discover">Discover <span class="arrow">→</span></div>
        </div>`;
      grid.appendChild(a);
    });
    if (window.NOCTURNE_observe) window.NOCTURNE_observe();
  }
})();
