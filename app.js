/* app.js — Side Piece Coffee (polished) */

const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

/* ---------- Smooth scroll for in-page anchor links ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const el = document.querySelector(id);
  if (!el) return; // only intercept if target exists
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ---------- Price formatting (AU-style) ---------- */
const formatPrice = (n) => {
  const cents = Math.round((n - Math.trunc(n)) * 100);
  if (cents === 0) return `$${Math.trunc(n)}`;
  return `$${n.toFixed(2)}`;
};

const formatPriceFromItem = (item) => {
  if (item.sizes && (item.sizes.small || item.sizes.large)) {
    const parts = [];
    if (item.sizes.small != null) parts.push(`S ${formatPrice(Number(item.sizes.small))}`);
    if (item.sizes.large != null) parts.push(`L ${formatPrice(Number(item.sizes.large))}`);
    return parts.join(' · ');
  }
  if (item.priceSmall != null || item.priceLarge != null) {
    const parts = [];
    if (item.priceSmall != null) parts.push(`S ${formatPrice(Number(item.priceSmall))}`);
    if (item.priceLarge != null) parts.push(`L ${formatPrice(Number(item.priceLarge))}`);
    return parts.join(' · ');
  }
  if (item.price != null) return formatPrice(Number(item.price));
  return '';
};

/* ---------- Images & Badges helpers ---------- */

// Map of normalized item names → image path in /images
const imageMap = {
  'bne toastie': 'images/bne-toastie.png',
  'peach + nduja tartine': 'images/tartine.png', 
  'avo toast': 'images/avo-toast.png',
  'sp fruit salad': 'images/fruit.png',
  'salmon bagel': 'images/salmon-bagel.png',
  'nduja chilli scrambled eggs': 'images/chilli-eggs.png',
  'chicken sandwich': 'images/chicken-sandwich.png',
  'salad sandwich': 'images/salad-sandwich.png',
  'beef sandwich': 'images/beef-sandwich.png',
  'ham + double cheese': 'images/ham-cheese.png',
};

const norm = s => (s||'')
  .toLowerCase()
  .replace(/[’']/g,'')            // normalize curly quotes
  .replace(/\(v\)/g,'')           // strip (V)
  .replace(/\s+/g,' ')            // collapse spaces
  .trim();

function getImageFor(item){
  if (item.image) return item.image;              // allow explicit JSON image
  const key = norm(item.name);
  if (imageMap[key]) return imageMap[key];

  // loose fallback: strip punctuation and look again
  const loose = key.replace(/[^a-z0-9+ ]/g,'').trim();
  const hit = Object.keys(imageMap).find(k => k.replace(/[^a-z0-9+ ]/g,'') === loose);
  return hit ? imageMap[hit] : 'images/placeholder-generic.jpg';
}

function getBadgesFor(item){
  // 1) explicit badges in JSON
  if (Array.isArray(item.badges) && item.badges.length) return item.badges;

  // 2) infer from name/desc
  const name = (item.name||'').toLowerCase();
  const desc = (item.desc||'').toLowerCase();
  const b = [];

  if (/\(v\)/i.test(item.name)) b.push('V');                    // Vegetarian
  if (/gluten|gf option/i.test(desc)) b.push('GF');             // Gluten-free option
  if (/nduja|chilli|chili|spicy|jalapeñ|jalapeno/i.test(name+desc)) b.push('Spicy');

  return b;
}


/* ---------- Card templates ---------- */
const badgeClass = (b) => {
  const k = String(b).toLowerCase();
  if (k === 'v' || k === 'veg' || k === 'vegetarian') return 'badge v';
  if (k === 'gf' || k === 'gluten free') return 'badge gf';
  if (k === 'spicy' || k === 'hot') return 'badge spicy';
  return 'badge';
};

const card = (item) => {
  const badges = getBadgesFor(item);
  const imgSrc = getImageFor(item);

  return `
    <article class="card--item">
      <div class="item__media">
        <img class="item__img" src="${imgSrc}" alt="${item.name}">
        ${badges.length ? `
          <div class="badges badges--overlay">
            ${badges.map(b => `<span class="${badgeClass(b)}">${b}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <div class="item__body">
        <div class="item__title">
          <h3>${item.name.replace(/\s*\(V\)\s*/i,'')}</h3>
          <span class="item__price ${item.sizes || item.priceSmall || item.priceLarge ? 'item__price--multi' : ''}">
            ${formatPriceFromItem(item)}
          </span>
        </div>

        ${item.desc ? `<p class="item__desc">${item.desc}</p>` : ''}

        ${item.options ? `<ul class="list muted" style="margin-top:8px">
          ${item.options.map(o=>`<li>${o.name} — ${formatPrice(o.price)}</li>`).join('')}
        </ul>` : '' }
      </div>
    </article>
  `;
};


const eggsCard = (eggs) => `
  <article class="card--item">
    <div class="item__body">
      <div class="item__title">
        <h3>${eggs.name}</h3>
        <span class="item__price">${formatPriceFromItem(eggs)}</span>
      </div>
      ${eggs.desc ? `<p class="item__desc">${eggs.desc}</p>` : '' }
      ${eggs.gfOption ? `<p class="muted" style="margin-top:8px">GF option — ${formatPrice(eggs.gfOption)}</p>` : '' }
    </div>
  </article>
`;

const byoGroup = (group) => `
  <section class="byo-group">
    <div class="byo-group__head"><h3>${group.title}</h3></div>
    <ul class="byo-list">
      ${group.items.map(i => `
        <li class="byo-item">
          <span class="byo-name">${i.name}</span>
          <span class="byo-price">${formatPrice(i.price)}</span>
        </li>
      `).join('')}
    </ul>
  </section>
`;

function renderExtras(title, items) {
  const aside = $('#menu-extras');
  if (!aside) return;
  aside.innerHTML = `
    <h3>${title}</h3>
    <ul>
      ${items.map(x => `
        <li><span>${x.name}</span><span class="price">${formatPrice(x.price)}</span></li>
      `).join('')}
    </ul>
  `;
}

/* ---------- Single, deduped Tabs handler + ARIA + hash ---------- */
function setupTabs() {
  const tabs = $$('.tabs [data-tab]');
  const panes = $$('.pane');

  function setActive(id) {
    // buttons
    tabs.forEach(btn => {
      const active = btn.dataset.tab === id;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    // panes (class + hidden for a11y/future proof)
    panes.forEach(p => {
      const show = p.id === `pane-${id}`;
      p.classList.toggle('is-active', show);
      p.hidden = !show;
    });

    // Extras
    if (!window._MENU) return;
    const aside = $('#menu-extras');
    if (!aside) return;
    if (id === 'food') {
      aside.style.display = 'block';
      renderExtras('Extras', window._MENU.food.extras || []);
    } else if (id === 'drinks') {
      aside.style.display = 'block';
      renderExtras('Add-ons', window._MENU.drinks.extras || []);
    } else {
      aside.style.display = 'none'; // hide on Build
    }
  }

  // Event delegation (single listener)
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (!tab || !tabs.includes(tab)) return;
    const id = tab.dataset.tab;
    // update hash to make state linkable
    const desiredHash = `#pane-${id}`;
    if (location.hash !== desiredHash) history.replaceState(null, '', desiredHash);
    setActive(id);
  });

  // Initial state from hash or default to food
  const initial =
    (location.hash && location.hash.startsWith('#pane-'))
      ? location.hash.replace('#pane-', '')
      : 'food';
  setActive(initial);

  // Public (used by BYO CTA if needed)
  return { setActive };
}

/* ---------- Renderers ---------- */
function renderFood(food) {
  $('#grid-food-mains').innerHTML = (food.mains || []).map(card).join('');
  if (food.eggs) $('#grid-food-eggs').innerHTML = eggsCard(food.eggs);
}

function renderDrinks(drinks) {
  $('#grid-drinks-hot').innerHTML  = (drinks.hot  || []).map(card).join('');
  $('#grid-drinks-tea').innerHTML  = (drinks.tea  || []).map(card).join('');
  $('#grid-drinks-cold').innerHTML = (drinks.cold || []).map(card).join('');
}

function renderBuild(groups) {
  const buildEl = $('#build-groups');
  buildEl.innerHTML = groups.map(byoGroup).join('');

  // Append BYO showcase tiles (keep your images)
  const showcase = [
    { src: 'images/byo.png',  alt: 'Two open-faced toasts with toppings', caption: 'Build your own' },
    { src: 'images/byo2.png', alt: 'Bagel and toast with different toppings', caption: 'Endless combos' }
  ];
  buildEl.insertAdjacentHTML('beforeend', showcase.map(i => `
    <section class="byo-group byo-feature">
      <figure class="byo-figure">
        <img src="${i.src}" alt="${i.alt}" loading="lazy">
        <figcaption>${i.caption}</figcaption>
      </figure>
    </section>
  `).join(''));
}

/* ---------- Nav hide / reveal on scroll ---------- */
(() => {
  const nav = $('.nav');
  if (!nav) return;

  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    if (y > 10) nav.classList.add('nav--solid');
    else nav.classList.remove('nav--solid');

    if (y > 120 && y > lastY + 2) nav.classList.add('nav--hidden');
    else if (y < lastY - 2) nav.classList.remove('nav--hidden');

    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})();

/* ---------- Bench parallax (IO + rAF) ---------- */
(() => {
  const section = document.querySelector('.bench-section[data-parallax]');
  if (!section) return;

  const img = section.querySelector('.parallax-img');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !img) return;

  let ticking = false;
  let inView = false;

  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) onScroll();
  }, { root: null, threshold: 0 });
  io.observe(section);

  function onScroll() {
    if (!inView || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const progress = (viewH - rect.top) / (viewH + rect.height);
      const shift = (progress - 0.5) * 40; // -20..+20px
      img.style.transform = `translate(-50%, calc(-50% + ${shift}px))`;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();

/* ---------- Boot ---------- */
(async function boot(){
  // Year in footer (in case not set elsewhere)
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Load menu
  try {
    const res = await fetch('data/menu.json', { cache: 'no-store' });
    const menu = await res.json();
    window._MENU = menu;

    if (menu.food)   renderFood(menu.food);
    if (menu.drinks) renderDrinks(menu.drinks);
    if (menu.build)  renderBuild(menu.build);

    // Tabs (also sets initial Extras based on active tab/hash)
    setupTabs();

  } catch (err) {
    console.error('Menu load failed:', err);
    $('#menu')?.insertAdjacentHTML('beforeend', `<p class="muted">Menu is currently unavailable. Please try again later.</p>`);
  }
})();
