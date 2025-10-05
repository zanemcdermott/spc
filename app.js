// Simple tabs
document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  const name = tab.getAttribute('data-tab');
  document.querySelectorAll('.tabs button').forEach(b=>{
    b.classList.toggle('is-active', b===tab);
    b.setAttribute('aria-selected', b===tab ? 'true':'false');
  });
  document.querySelectorAll('.pane').forEach(p=>{
    p.classList.toggle('is-active', p.id === `pane-${name}`);
  });
});

// Render menu
(async function(){
  const res = await fetch('data/menu.json', { cache: 'no-store' });
  const menu = await res.json();

  const foodGrid  = document.getElementById('grid-food');
  const buildGrid = document.getElementById('grid-build');
  const drinkGrid = document.getElementById('grid-drinks');

  const card = (item) => `
    <article class="card--item">
      <img class="item__img" src="${item.image || 'images/placeholder-generic.jpg'}" alt="${item.name}">
      <div class="item__body">
        <div class="item__title">
          <h3>${item.name}</h3>
          <span class="item__price">$${item.price}</span>
        </div>
        ${item.desc ? `<p class="item__desc">${item.desc}</p>` : ''}
      </div>
    </article>
  `;

  // Food
  foodGrid.innerHTML = menu.food.map(card).join('');

// Build-your-own — compact list view (no images, aligned prices)
const byGroup = menu.build.reduce((acc, item) => {
  (acc[item.group || 'Other'] ??= []).push(item);
  return acc;
}, {});

buildGrid.outerHTML = `<div id="grid-build" class="byogroups">
  ${Object.entries(byGroup).map(([groupName, items]) => `
    <section class="byo-group">
      <header class="byo-group__head">
        <h3>${groupName}</h3>
      </header>
      <ul class="byo-list">
        ${items.map(i => `
          <li class="byo-item">
            <span class="byo-name">${i.name}</span>
            <span class="byo-price">$${i.price}</span>
          </li>
        `).join('')}
      </ul>
    </section>
  `).join('')}
</div>`;

// --- Add a showcase image tile to fill the 6th grid slot ---
const buildContainer = document.getElementById('grid-build'); // new node created by our outerHTML
const featureHTML = `
  <section class="byo-group byo-feature" aria-hidden="true">
    <figure class="byo-figure">
      <img src="images/byo.png" alt="Build-your-own toast ideas at Side Piece Coffee">
      <figcaption>Build Your Own</figcaption>
    </figure>
  </section>
`;
buildContainer.insertAdjacentHTML('beforeend', featureHTML);


  // Drinks
  drinkGrid.innerHTML = menu.drinks.map(card).join('');
})();
