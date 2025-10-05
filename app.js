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

// Render menu if the grids exist on this page
(async function () {
  const foodGrid  = document.getElementById('grid-food');
  const buildGrid = document.getElementById('grid-build');
  const drinkGrid = document.getElementById('grid-drinks');
  if (!foodGrid || !buildGrid || !drinkGrid) return; // not on this page

  const res = await fetch('data/menu.json', { cache: 'no-store' });
  const menu = await res.json();

  const card = (item) => `
    <article class="card--item">
      <img class="item__img" src="${item.image || 'images/placeholder-generic.jpg'}" alt="${item.name}">
      <div class="item__body">
        <div class="item__title">
          <h3>${item.name}</h3>
          <span class="item__price">${item.price ? '$'+item.price : ''}</span>
        </div>
        ${item.desc ? `<p class="item__desc">${item.desc}</p>` : ''}
      </div>
    </article>
  `;

  // Food
  foodGrid.innerHTML = menu.food.map(card).join('');

  // Build-your-own — compact grouped lists + showcase tile
  const byGroup = menu.build.reduce((acc, item) => {
    (acc[item.group || 'Other'] ??= []).push(item);
    return acc;
  }, {});

  buildGrid.outerHTML = `<div id="grid-build" class="byogroups">
    ${Object.entries(byGroup).map(([groupName, items]) => `
      <section class="byo-group">
        <header class="byo-group__head"><h3>${groupName}</h3></header>
        <ul class="byo-list">
          ${items.map(i => `
            <li class="byo-item">
              <span class="byo-name">${i.name}</span>
              <span class="byo-price">$${i.price}</span>
            </li>`).join('')}
        </ul>
      </section>
    `).join('')}
    <section class="byo-group byo-feature" aria-hidden="true">
      <figure class="byo-figure">
        <img src="images/byo.png" alt="Build-your-own toast ideas">
        <figcaption>Build Your Own</figcaption>
      </figure>
    </section>
  </div>`;

  // Drinks
  document.getElementById('grid-drinks').innerHTML = menu.drinks.map(card).join('');
})();

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
