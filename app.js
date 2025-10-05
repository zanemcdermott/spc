// Smooth scroll for in-page anchor links in the nav
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const el = document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Tabs handler (only if menu tabs exist)
document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  const name = tab.getAttribute('data-tab');
  document.querySelectorAll('.tabs button').forEach(b => {
    b.classList.toggle('is-active', b === tab);
    b.setAttribute('aria-selected', b === tab ? 'true' : 'false');
  });
  document.querySelectorAll('.pane').forEach(p => {
    p.classList.toggle('is-active', p.id === `pane-${name}`);
  });
});

// ===== MENU RENDER: START (REPLACE THIS WHOLE BLOCK) =====
const $ = (s) => document.querySelector(s);

const formatPrice = (item) => {
  if (item.sizes && (item.sizes.small || item.sizes.large)) {
    const parts = [];
    if (item.sizes.small) parts.push(`S $${Number(item.sizes.small).toFixed(0)}`);
    if (item.sizes.large) parts.push(`L $${Number(item.sizes.large).toFixed(0)}`);
    return parts.join(' · ');
  }
  if (item.priceSmall || item.priceLarge) {
    const parts = [];
    if (item.priceSmall) parts.push(`S $${Number(item.priceSmall).toFixed(0)}`);
    if (item.priceLarge) parts.push(`L $${Number(item.priceLarge).toFixed(0)}`);
    return parts.join(' · ');
  }
  if (item.price || item.price === 0) return `$${Number(item.price).toFixed(0)}`;
  return '';
};

const card = (item) => `
  <article class="card--item">
    <img class="item__img" src="${item.image || 'images/placeholder-generic.jpg'}" alt="${item.name}">
    <div class="item__body">
      <div class="item__title">
        <h3>${item.name}</h3>
        <span class="item__price ${item.sizes || item.priceSmall || item.priceLarge ? 'item__price--multi' : ''}">
          ${formatPrice(item)}
        </span>
      </div>
      ${item.desc ? `<p class="item__desc">${item.desc}</p>` : ''}
      ${item.options ? `<ul class="list muted" style="margin-top:8px">${item.options.map(o=>`<li>${o.name} — $${o.price}</li>`).join('')}</ul>` : '' }
    </div>
  </article>
`;

const eggsCard = (eggs) => `
  <article class="card--item">
    <div class="item__body">
      <div class="item__title">
        <h3>${eggs.name}</h3>
        <span class="item__price">${formatPrice(eggs)}</span>
      </div>
      <p class="item__desc">${eggs.desc}</p>
      ${eggs.gfOption ? `<p class="muted" style="margin-top:8px">GF option — $${eggs.gfOption}</p>` : '' }
    </div>
  </article>
`;

const renderExtras = (title, items) => {
  $('#menu-extras').innerHTML = `
    <h3>${title}</h3>
    <ul>
      ${items.map(x => `
        <li><span>${x.name}</span><span class="price">${x.price < 1 ? `$${x.price.toFixed(2)}` : `$${Number(x.price).toFixed(0)}`}</span></li>
      `).join('')}
    </ul>
  `;
};

// Build-Your-Own groups
const byoGroup = (group) => `
  <section class="byo-group">
    <div class="byo-group__head"><h3>${group.title}</h3></div>
    <ul class="byo-list">
      ${group.items.map(i => `
        <li class="byo-item">
          <span class="byo-name">${i.name}</span>
          <span class="byo-price">$${Number(i.price).toFixed(0)}</span>
        </li>
      `).join('')}
    </ul>
  </section>
`;

document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  const name = tab.getAttribute('data-tab');

  document.querySelectorAll('.tabs button').forEach(b => {
    const active = b === tab;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  document.querySelectorAll('.pane').forEach(p => {
    p.classList.toggle('is-active', p.id === `pane-${name}`);
  });

  // ⬇️ NEW: hide/show the Extras aside
  const aside = document.getElementById('menu-extras');
  if (!window._MENU || !aside) return;
  if (name === 'food') {
    aside.style.display = 'block';
    renderExtras('Extras', window._MENU.food.extras);
  } else if (name === 'drinks') {
    aside.style.display = 'block';
    renderExtras('Add-ons', window._MENU.drinks.extras);
  } else if (name === 'build') {
    // Hide extras on Build Your Own
    aside.style.display = 'none';
  }
});


(async function(){
  const res = await fetch('data/menu.json', { cache: 'no-store' });
  const menu = await res.json();
  window._MENU = menu;

  // FOOD
  $('#grid-food-mains').innerHTML = (menu.food?.mains || []).map(card).join('');
  if (menu.food?.eggs) $('#grid-food-eggs').innerHTML = eggsCard(menu.food.eggs);

// BUILD
const groups = menu.build || [];
const buildEl = document.getElementById('build-groups');

// 1) Render the BYO groups (text cards)
buildEl.innerHTML = groups.map(byoGroup).join('');

// 2) Append the two BYO showcase image tiles (keeps the groups!)
const byoShowcase = [
  { src: 'images/byo.png',  alt: 'Two open-faced toasts with toppings', caption: 'Build your own' },
  { src: 'images/byo2.png', alt: 'Bagel and toast with different toppings', caption: 'Endless combos' }
];

const tilesHTML = byoShowcase.map(i => `
  <section class="byo-group byo-feature">
    <figure class="byo-figure">
      <img src="${i.src}" alt="${i.alt}" loading="lazy">
      <figcaption>${i.caption}</figcaption>
    </figure>
  </section>
`).join('');

buildEl.insertAdjacentHTML('beforeend', tilesHTML);

  // DRINKS
  $('#grid-drinks-hot').innerHTML  = (menu.drinks?.hot  || []).map(card).join('');
  $('#grid-drinks-tea').innerHTML  = (menu.drinks?.tea  || []).map(card).join('');
  $('#grid-drinks-cold').innerHTML = (menu.drinks?.cold || []).map(card).join('');

  // default: Food extras
  renderExtras('Extras', menu.food.extras);
  // Make sure Extras is visible by default on initial load
const aside = document.getElementById('menu-extras');
if (aside) aside.style.display = 'block';
})();
 // ===== MENU RENDER: END =====



// ===== Hide header on scroll down, show on scroll up =====
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;

    // Solid background after a tiny scroll
    if (y > 10) nav.classList.add('nav--solid');
    else nav.classList.remove('nav--solid');

    // Hide when scrolling down, show on up (after a small threshold)
    if (y > 120 && y > lastY + 2) {
      nav.classList.add('nav--hidden');
    } else if (y < lastY - 2) {
      nav.classList.remove('nav--hidden');
    }

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

// ===== Bench parallax (requestAnimationFrame + IntersectionObserver)
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
    if (inView) onScroll();                // position once when entering view
  }, { root: null, threshold: 0 });
  io.observe(section);

  const onScroll = () => {
    if (!inView || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight || 1;

      // progress: 0 at top entering, 1 at bottom leaving
      const progress = (viewH - rect.top) / (viewH + rect.height);

      // parallax amount in pixels (adjust 40 for stronger/weaker)
      const shift = (progress - 0.5) * 40; // move -20px..+20px

      // apply transform while keeping the base centering
      img.style.transform = `translate(-50%, calc(-50% + ${shift}px))`;
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
