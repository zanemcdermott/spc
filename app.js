/* app.js — Side Piece Coffee (cart-ready build) */

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/* ---------- Smooth scroll for in-page anchor links ---------- */
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('a[href^="#"]');
  if (!trigger) return;
  const targetId = trigger.getAttribute('href');
  const dest = document.querySelector(targetId);
  if (!dest) return;
  event.preventDefault();
  dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ---------- Formatting helpers ---------- */
const isNumber = (value) => typeof value === 'number' && !Number.isNaN(value);

const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0';
  const cents = Math.round((n - Math.trunc(n)) * 100);
  if (cents === 0) return `$${Math.trunc(n)}`;
  return `$${n.toFixed(2)}`;
};

const formatPriceFromItem = (item) => {
  if (!item) return '';
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

const slug = (value = '') => value
  .toString()
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');

const dedupeBy = (list, keyFn) => {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
};

/* ---------- Images & badges ---------- */
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

const normaliseName = (value = '') => value
  .toLowerCase()
  .replace(/[’']/g, '')
  .replace(/\(v\)/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const getImageFor = (item) => {
  if (!item) return 'images/logo.png';
  if (item.image) return item.image;
  const key = normaliseName(item.name);
  if (imageMap[key]) return imageMap[key];
  const stripped = key.replace(/[^a-z0-9+ ]/g, '').trim();
  const match = Object.keys(imageMap).find((slugKey) => slugKey.replace(/[^a-z0-9+ ]/g, '') === stripped);
  return match ? imageMap[match] : 'images/logo.png';
};

const getBadgesFor = (item) => {
  if (!item) return [];
  if (Array.isArray(item.badges) && item.badges.length) return item.badges;
  const name = (item.name || '').toLowerCase();
  const desc = (item.desc || '').toLowerCase();
  const badges = [];
  if (/\(v\)/i.test(item.name)) badges.push('V');
  if (/gluten|gf option/i.test(desc)) badges.push('GF');
  if (/nduja|chilli|chili|spicy|jalapeñ|jalapeno/.test(name + desc)) badges.push('Spicy');
  return badges;
};

const badgeClass = (badge) => {
  const key = String(badge).toLowerCase();
  if (key === 'v' || key === 'veg' || key === 'vegetarian') return 'badge v';
  if (key === 'gf' || key === 'gluten free') return 'badge gf';
  if (key === 'spicy' || key === 'hot') return 'badge spicy';
  return 'badge';
};

const buildDataset = (ctx = {}) => [
  ctx.kind ? `data-kind="${ctx.kind}"` : '',
  ctx.category ? `data-category="${ctx.category}"` : '',
  ctx.index != null ? `data-index="${ctx.index}"` : '',
  ctx.itemKey ? `data-item="${ctx.itemKey}"` : '',
].filter(Boolean).join(' ');

/* ---------- Card templates ---------- */
const card = (item, ctx = {}) => {
  const badges = getBadgesFor(item);
  const imgSrc = getImageFor(item);
  const dataset = buildDataset(ctx);
  const cleanedName = item.name.replace(/\s*\(V\)\s*/i, '');

  return `
    <article class="card--item">
      <div class="item__media">
        <img class="item__img" src="${imgSrc}" alt="${cleanedName}">
        ${badges.length ? `
          <div class="badges badges--overlay">
            ${badges.map((badge) => `<span class="${badgeClass(badge)}">${badge}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="item__body">
        <div class="item__title">
          <h3>${cleanedName}</h3>
          <span class="item__price ${item.sizes || item.priceSmall || item.priceLarge ? 'item__price--multi' : ''}">
            ${formatPriceFromItem(item)}
          </span>
        </div>
        ${item.desc ? `<p class="item__desc">${item.desc}</p>` : ''}
        ${item.options ? `<ul class="list muted" style="margin-top:8px">
          ${item.options.map((o) => `<li>${o.name} — ${formatPrice(o.price)}</li>`).join('')}
        </ul>` : ''}
        <div class="item__actions">
          <button type="button" class="btn btn--cream item__add" ${dataset}>Add to cart</button>
        </div>
      </div>
    </article>
  `;
};

const eggsCard = (eggs, ctx = {}) => {
  const dataset = buildDataset(ctx);
  return `
    <article class="card--item">
      <div class="item__body">
        <div class="item__title">
          <h3>${eggs.name}</h3>
          <span class="item__price">${formatPriceFromItem(eggs)}</span>
        </div>
        ${eggs.desc ? `<p class="item__desc">${eggs.desc}</p>` : ''}
        ${eggs.gfOption ? `<p class="muted" style="margin-top:8px">GF option — ${formatPrice(eggs.gfOption)}</p>` : ''}
        <div class="item__actions">
          <button type="button" class="btn btn--cream item__add" ${dataset}>Add to cart</button>
        </div>
      </div>
    </article>
  `;
};

const byoGroup = (group) => `
  <section class="byo-group">
    <div class="byo-group__head"><h3>${group.title}</h3></div>
    <ul class="byo-list">
      ${group.items.map((i) => `
        <li class="byo-item">
          <span class="byo-name">${i.name}</span>
          <span class="byo-price">${formatPrice(i.price)}</span>
        </li>
      `).join('')}
    </ul>
  </section>
`;

const renderByoShowcase = (item) => `
  <button type="button" class="byo-group byo-feature" data-build-start>
    <figure class="byo-figure">
      <img src="${item.src}" alt="${item.alt}" loading="lazy">
      <figcaption>${item.caption}</figcaption>
    </figure>
  </button>
`;

/* ---------- Menu extras sidebar ---------- */
const renderExtras = (title, items) => {
  const aside = $('#menu-extras');
  if (!aside) return;
  aside.innerHTML = `
    <h3>${title}</h3>
    <ul>
      ${items.map((entry) => `
        <li><span>${entry.name}</span><span class="price">${formatPrice(entry.price)}</span></li>
      `).join('')}
    </ul>
  `;
};

/* ---------- Global DOM hooks ---------- */
const overlay = $('#overlay');
const itemModal = $('#item-modal');
const itemModalBody = $('#item-modal-body');
const itemModalTitle = $('#item-modal-title');
const cartDrawer = $('#cart-drawer');
const cartItemsEl = $('#cart-items');
const cartTotalEl = $('#cart-total');
const cartCountEl = $('#cart-count');
const cartToggleBtn = $('#cart-toggle');

const cartState = { items: [], seq: 0 };
let menuData = null;
let activeConfig = null;

const flattenExtras = (config) => {
  if (!config?.extraGroups) return [];
  return config.extraGroups.flatMap((group) => group.items.map((item) => ({ ...item, groupId: group.id, groupTitle: group.title })));
};

const selectedExtras = (config) => {
  if (!config) return [];
  const all = flattenExtras(config);
  return all.filter((extra) => config.selectedExtras?.has(extra.id));
};

const getUnitBasePrice = (config) => {
  if (!config) return 0;
  if (config.mode === 'item') {
    if (config.sizes && config.selectedSize && isNumber(config.sizes[config.selectedSize])) {
      return Number(config.sizes[config.selectedSize]);
    }
    if (isNumber(config.basePrice)) return Number(config.basePrice);
    return 0;
  }
  if (config.mode === 'build') {
    return config.groups.reduce((total, group, index) => {
      const choices = config.selections[index];
      if (!choices) return total;
      return total + [...choices].reduce((sum, choiceId) => {
        const match = group.items.find((item) => item.id === choiceId);
        return sum + (match ? Number(match.price) : 0);
      }, 0);
    }, 0);
  }
  return 0;
};

const getExtrasTotal = (config) => selectedExtras(config).reduce((sum, extra) => sum + Number(extra.price || 0), 0);

const getConfigSubtotal = (config) => (getUnitBasePrice(config) + getExtrasTotal(config)) * (config.quantity || 1);

const showOverlay = () => {
  if (!overlay) return;
  overlay.hidden = false;
};

const hideOverlay = () => {
  if (!overlay) return;
  overlay.hidden = true;
};

const openItemModal = (config) => {
  activeConfig = config;
  renderItemModal();
  if (itemModal) itemModal.hidden = false;
  document.body.classList.add('modal-open');
  showOverlay();
  const closeBtn = itemModal?.querySelector('[data-item-close]');
  if (closeBtn) closeBtn.focus({ preventScroll: true });
};

const closeItemModal = () => {
  activeConfig = null;
  if (itemModal) itemModal.hidden = true;
  document.body.classList.remove('modal-open');
  hideOverlay();
};

const renderExtraGroup = (config, group) => {
  if (!group.items.length) return '';
  const extrasMarkup = group.items.map((extra) => {
    const checked = config.selectedExtras?.has(extra.id);
    return `
      <label class="option-tile ${checked ? 'is-selected' : ''}" data-extra="${extra.id}">
        <input type="checkbox" data-extra-input="${extra.id}" ${checked ? 'checked' : ''}>
        <span class="option-tile__name">${extra.label || extra.name}</span>
        <span class="option-tile__meta">
          <span>${extra.price ? formatPrice(extra.price) : 'Included'}</span>
          ${extra.popular ? '<span class="option-tile__tag">Popular</span>' : ''}
        </span>
      </label>
    `;
  }).join('');

  return `
    <section class="item-section" data-extra-group="${group.id}">
      <h3 class="item-section__title">${group.title}</h3>
      <div class="option-list">${extrasMarkup}</div>
    </section>
  `;
};

const renderBuildGroup = (config, group, index) => {
  if (!group.items.length) return '';
  const selection = config.selections[index] || new Set();
  const type = group.selection;
  const controls = group.items.map((item) => {
    const checked = selection.has(item.id);
    const inputType = type === 'single' ? 'radio' : 'checkbox';
    const name = `build-group-${index}`;
    return `
      <label class="option-tile ${checked ? 'is-selected' : ''}" data-build-option="${item.id}" data-build-group="${index}">
        <input type="${inputType}" name="${name}" value="${item.id}" data-build-input="${item.id}" ${checked ? 'checked' : ''}>
        <span class="option-tile__name">${item.name}</span>
        <span class="option-tile__meta">
          <span>${formatPrice(item.price)}</span>
          ${item.popular ? '<span class="option-tile__tag">Popular</span>' : ''}
        </span>
      </label>
    `;
  }).join('');

  const error = config.errors?.[`group-${index}`];

  return `
    <section class="item-section" data-build-group="${index}">
      <h3 class="item-section__title">${group.title}</h3>
      <div class="option-list">${controls}</div>
      ${error ? `<p class="option-tile__note">${error}</p>` : ''}
    </section>
  `;
};

const renderItemModal = () => {
  if (!activeConfig || !itemModalBody || !itemModalTitle) return;
  itemModalTitle.textContent = activeConfig.name;

  const summary = `
    <section class="item-summary">
      ${activeConfig.desc ? `<p class="item-summary__desc">${activeConfig.desc}</p>` : ''}
      ${activeConfig.mode === 'item' && activeConfig.baseLabel ? `<p class="item-summary__price">${activeConfig.baseLabel}</p>` : ''}
    </section>
  `;

  const quantity = `
    <section class="item-section" data-qty>
      <h3 class="item-section__title">Quantity</h3>
      <div class="quantity-picker">
        <button type="button" class="quantity-picker__btn" data-qty-action="dec" aria-label="Decrease quantity">−</button>
        <span class="quantity-picker__value">${activeConfig.quantity}</span>
        <button type="button" class="quantity-picker__btn" data-qty-action="inc" aria-label="Increase quantity">+</button>
      </div>
    </section>
  `;

  const sizeSection = (() => {
    if (activeConfig.mode !== 'item' || !activeConfig.sizes) return '';
    const entries = Object.entries(activeConfig.sizes).filter(([, price]) => price != null);
    if (!entries.length) return '';
    const pills = entries.map(([key, price]) => {
      const label = key === 'small' ? 'Small' : key === 'large' ? 'Large' : key;
      const selected = activeConfig.selectedSize === key;
      return `
        <label class="choice-pill ${selected ? 'is-selected' : ''}" data-size="${key}">
          <input type="radio" name="size" value="${key}" ${selected ? 'checked' : ''}>
          <span>${label}</span>
          <span class="choice-pill__meta">${formatPrice(price)}</span>
        </label>
      `;
    }).join('');
    return `
      <section class="item-section" data-size>
        <h3 class="item-section__title">Choose a size</h3>
        <div class="choice-pills">${pills}</div>
      </section>
    `;
  })();

  const extras = (() => {
    if (activeConfig.mode !== 'item' || !activeConfig.extraGroups?.length) return '';
    return activeConfig.extraGroups.map((group) => renderExtraGroup(activeConfig, group)).join('');
  })();

  const buildGroups = (() => {
    if (activeConfig.mode !== 'build') return '';
    return activeConfig.groups.map((group, index) => renderBuildGroup(activeConfig, group, index)).join('');
  })();

  const subtotal = formatPrice(getUnitBasePrice(activeConfig) + getExtrasTotal(activeConfig));
  const total = formatPrice(getConfigSubtotal(activeConfig));
  const submitLabel = activeConfig.cartId ? 'Save changes' : 'Add to cart';

  const footer = `
    <div class="item-modal__footer">
      <div>
        <div class="item-modal__subtotal">Subtotal ${total}</div>
        ${activeConfig.quantity > 1 ? `<p class="muted" style="margin:4px 0 0;font-size:0.85rem">${activeConfig.quantity} × ${subtotal}</p>` : ''}
      </div>
      <button type="submit" class="btn btn--cream">${submitLabel}</button>
    </div>
  `;

  itemModalBody.innerHTML = `
    <form class="item-form" data-mode="${activeConfig.mode}">
      ${summary}
      ${quantity}
      ${sizeSection}
      ${extras}
      ${buildGroups}
      ${footer}
    </form>
  `;
};

/* ---------- Config builders ---------- */
const basePriceLabel = (item) => {
  if (!item) return '';
  if (item.sizes && (item.sizes.small || item.sizes.large)) return 'Select a size';
  if (item.price != null) return `Base price ${formatPrice(item.price)}`;
  return '';
};

const buildExtraGroups = (kind, item) => {
  if (!menuData) return [];
  const groups = [];
  const seen = new Set();

  if (Array.isArray(item?.options) && item.options.length) {
    const items = item.options.map((opt, index) => ({
      id: `opt-${slug(opt.name)}-${index}`,
      name: opt.name.replace(/^\+\s*/, ''),
      label: opt.name,
      price: Number(opt.price || 0),
      popular: Boolean(opt.popular),
    }));
    items.sort((a, b) => Number(b.popular) - Number(a.popular));
    items.forEach((entry) => seen.add(slug(entry.name)));
    groups.push({ id: 'item-options', title: 'Extras', items });
  }

  const categoryExtras = (() => {
    if (kind === 'food') return menuData.food?.extras || [];
    if (kind === 'drinks') return menuData.drinks?.extras || [];
    return [];
  })();

  if (categoryExtras.length) {
    const items = categoryExtras
      .map((opt, index) => ({
        id: `cat-${slug(opt.name)}-${index}`,
        name: opt.name,
        label: opt.name,
        price: Number(opt.price || 0),
        popular: Boolean(opt.popular),
      }))
      .filter((opt) => !seen.has(slug(opt.name)));
    items.sort((a, b) => Number(b.popular) - Number(a.popular));
    if (items.length) groups.push({ id: 'category-extras', title: 'More add-ons', items });
  }

  return groups;
};

const createItemConfig = ({ kind, category, index, itemKey }) => {
  if (!menuData) return null;
  let item = null;
  if (kind === 'food') {
    if (category === 'mains') item = menuData.food?.mains?.[Number(index)] || null;
    if (category === 'eggs') item = menuData.food?.eggs || null;
  }
  if (kind === 'drinks') {
    item = menuData.drinks?.[category]?.[Number(index)] || null;
  }
  if (!item) return null;

  const config = {
    mode: 'item',
    key: [kind, category, index ?? itemKey].filter(Boolean).join(':'),
    kind,
    category,
    index: index != null ? Number(index) : null,
    itemKey: itemKey || null,
    name: item.name.replace(/\s*\(V\)\s*/i, ''),
    desc: item.desc || '',
    basePrice: item.price != null ? Number(item.price) : null,
    baseLabel: basePriceLabel(item),
    sizes: null,
    selectedSize: null,
    quantity: 1,
    extraGroups: buildExtraGroups(kind, item),
    selectedExtras: new Set(),
  };

  if (item.sizes || item.priceSmall != null || item.priceLarge != null) {
    const sizes = {};
    if (item.sizes) {
      if (item.sizes.small != null) sizes.small = Number(item.sizes.small);
      if (item.sizes.large != null) sizes.large = Number(item.sizes.large);
    } else {
      if (item.priceSmall != null) sizes.small = Number(item.priceSmall);
      if (item.priceLarge != null) sizes.large = Number(item.priceLarge);
    }
    const defaultSize = sizes.small != null ? 'small' : Object.keys(sizes)[0];
    config.sizes = sizes;
    config.selectedSize = defaultSize;
    config.baseLabel = 'Select a size';
    config.basePrice = null;
  }

  return config;
};

const createBuildConfig = () => {
  if (!menuData?.build) return null;
  const groups = menuData.build.map((group, groupIndex) => ({
    id: `group-${groupIndex}`,
    title: group.title,
    selection: group.title.toLowerCase() === 'base' ? 'single' : 'multi',
    items: group.items.map((entry, itemIndex) => ({
      id: `${groupIndex}-${slug(entry.name)}-${itemIndex}`,
      name: entry.name,
      price: Number(entry.price || 0),
      popular: Boolean(entry.popular),
    })),
  }));

  const config = {
    mode: 'build',
    key: 'build',
    name: 'Build Your Own',
    desc: 'Pick a base, stack it with proteins, cheeses and add-ons.',
    quantity: 1,
    groups,
    selections: groups.map(() => new Set()),
    errors: {},
  };

  return config;
};

const applyCartItemToConfig = (item) => {
  if (!item) return null;
  if (item.mode === 'build') {
    const config = createBuildConfig();
    if (!config) return null;
    config.quantity = item.quantity;
    config.cartId = item.id;
    config.selections = config.groups.map((group, groupIndex) => {
      const matchGroup = item.groups?.find((g) => g.index === groupIndex || g.title === group.title);
      const selected = new Set();
      if (matchGroup) {
        matchGroup.items.forEach((choice) => selected.add(choice.id));
      }
      return selected;
    });
    return config;
  }

  const config = createItemConfig({ kind: item.kind, category: item.category, index: item.index, itemKey: item.itemKey });
  if (!config) return null;
  config.quantity = item.quantity;
  config.cartId = item.id;
  if (config.sizes && item.size && config.sizes[item.size] != null) {
    config.selectedSize = item.size;
  }
  const extraIds = item.extras?.map((extra) => extra.id) || [];
  config.selectedExtras = new Set(extraIds);
  return config;
};

/* ---------- Cart helpers ---------- */
const serializeConfigToCartItem = (config) => {
  if (!config) return null;
  if (config.mode === 'build') {
    const groups = config.groups.map((group, index) => ({
      index,
      title: group.title,
      items: [...config.selections[index]].map((choiceId) => {
        const option = group.items.find((item) => item.id === choiceId);
        return option ? { id: option.id, name: option.name, price: Number(option.price) } : null;
      }).filter(Boolean),
    })).filter((group) => group.items.length);

    return {
      id: config.cartId || `c${++cartState.seq}`,
      mode: 'build',
      key: 'build',
      name: 'Build Your Own',
      quantity: config.quantity,
      groups,
    };
  }

  const extras = selectedExtras(config).map((extra) => ({
    id: extra.id,
    name: extra.name,
    label: extra.label,
    price: Number(extra.price || 0),
    popular: Boolean(extra.popular),
    groupTitle: extra.groupTitle,
  }));

  return {
    id: config.cartId || `c${++cartState.seq}`,
    mode: 'item',
    key: config.key,
    kind: config.kind,
    category: config.category,
    index: config.index,
    itemKey: config.itemKey,
    name: config.name,
    quantity: config.quantity,
    size: config.selectedSize || null,
    basePrice: getUnitBasePrice(config),
    extras,
  };
};

const getCartItemUnitTotal = (item) => {
  if (!item) return 0;
  if (item.mode === 'build') {
    return item.groups.reduce((sum, group) => sum + group.items.reduce((inner, current) => inner + Number(current.price || 0), 0), 0);
  }
  const base = Number(item.basePrice || 0);
  const extras = item.extras?.reduce((sum, extra) => sum + Number(extra.price || 0), 0) || 0;
  return base + extras;
};

const getCartItemTotal = (item) => getCartItemUnitTotal(item) * (item.quantity || 1);

const renderCartItem = (item) => {
  const unit = formatPrice(getCartItemUnitTotal(item));
  const total = formatPrice(getCartItemTotal(item));
  const sizeLabel = item.size === 'small' ? 'Small' : item.size === 'large' ? 'Large' : item.size;

  const extrasList = (() => {
    if (item.mode === 'build') {
      if (!item.groups?.length) return '';
      const lines = item.groups.map((group) => `
        <li>${group.title}: ${group.items.map((choice) => `${choice.name} (${formatPrice(choice.price)})`).join(', ')}</li>
      `).join('');
      return `<ul class="cart-item__extras">${lines}</ul>`;
    }
    if (!item.extras?.length) return '';
    const lines = item.extras.map((extra) => `
      <li>${extra.label || extra.name} ${extra.price ? `(${formatPrice(extra.price)})` : ''}</li>
    `).join('');
    return `<ul class="cart-item__extras">${lines}</ul>`;
  })();

  return `
    <article class="cart-item" data-cart-id="${item.id}">
      <div class="cart-item__top">
        <div>
          <h3 class="cart-item__title">${item.name}${sizeLabel ? ` — ${sizeLabel}` : ''}</h3>
          <p class="cart-item__meta">${unit} each</p>
          ${extrasList}
        </div>
        <button type="button" class="cart-item__remove" data-cart-action="remove">Remove</button>
      </div>
      <div class="cart-item__controls">
        <div class="cart-item__qty">
          <button type="button" data-cart-action="decrement" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-action="increment" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="btn btn--ghost" data-cart-action="edit">Edit</button>
        <span style="margin-left:auto;font-weight:700">${total}</span>
      </div>
    </article>
  `;
};

const renderCart = () => {
  if (!cartItemsEl || !cartTotalEl || !cartCountEl) return;
  if (!cartState.items.length) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
  } else {
    cartItemsEl.innerHTML = cartState.items.map((item) => renderCartItem(item)).join('');
  }
  const total = cartState.items.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const count = cartState.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  cartTotalEl.textContent = formatPrice(total);
  cartCountEl.textContent = String(count);
};

const addToCart = (config) => {
  const item = serializeConfigToCartItem(config);
  if (!item) return;
  cartState.items.push(item);
  renderCart();
};

const updateCartItem = (config) => {
  const item = serializeConfigToCartItem(config);
  if (!item) return;
  const index = cartState.items.findIndex((entry) => entry.id === item.id);
  if (index === -1) return;
  cartState.items[index] = item;
  renderCart();
};

const removeCartItem = (id) => {
  cartState.items = cartState.items.filter((item) => item.id !== id);
  renderCart();
};

/* ---------- Cart drawer ---------- */
const openCartDrawer = () => {
  if (cartDrawer) cartDrawer.hidden = false;
  document.body.classList.add('cart-open');
};

const closeCartDrawer = () => {
  if (cartDrawer) cartDrawer.hidden = true;
  document.body.classList.remove('cart-open');
};

/* ---------- Menu renderers ---------- */
const renderFood = (food) => {
  if (!food) return;
  const mainsHtml = (food.mains || []).map((item, index) => card(item, { kind: 'food', category: 'mains', index })).join('');
  $('#grid-food-mains').innerHTML = mainsHtml;
  if (food.eggs) $('#grid-food-eggs').innerHTML = eggsCard(food.eggs, { kind: 'food', category: 'eggs', itemKey: 'eggs' });
};

const renderDrinks = (drinks) => {
  if (!drinks) return;
  $('#grid-drinks-hot').innerHTML = (drinks.hot || []).map((item, index) => card(item, { kind: 'drinks', category: 'hot', index })).join('');
  $('#grid-drinks-tea').innerHTML = (drinks.tea || []).map((item, index) => card(item, { kind: 'drinks', category: 'tea', index })).join('');
  $('#grid-drinks-cold').innerHTML = (drinks.cold || []).map((item, index) => card(item, { kind: 'drinks', category: 'cold', index })).join('');
};

const renderBuild = (groups) => {
  const container = $('#build-groups');
  if (!container) return;
  const cta = `
    <section class="byo-group byo-cta">
      <div class="byo-cta__body">
        <h3>Build your order</h3>
        <p class="muted">Pick a base, stack proteins, cheeses and add-ons, then add it straight to your cart.</p>
        <button type="button" class="btn btn--cream" data-build-start>Start building</button>
      </div>
    </section>
  `;
  const groupsHtml = (groups || []).map(byoGroup).join('');
  const showcase = [
    { src: 'images/byo.png',  alt: 'Two open-faced toasts with toppings', caption: 'Build your own' },
    { src: 'images/byo2.png', alt: 'Bagel and toast with different toppings', caption: 'Endless combos' },
  ];
  const firstShowcase = showcase[0] ? renderByoShowcase(showcase[0]) : '';
  const trailingShowcase = showcase.slice(1).map(renderByoShowcase).join('');
  container.innerHTML = firstShowcase + cta + groupsHtml + trailingShowcase;
};

/* ---------- Tabs ---------- */
const setupTabs = () => {
  const tabs = $$('.tabs [data-tab]');
  const panes = $$('.pane');

  const setActive = (id) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === id;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panes.forEach((pane) => {
      const show = pane.id === `pane-${id}`;
      pane.classList.toggle('is-active', show);
      pane.hidden = !show;
    });

    if (!menuData) return;
    const aside = $('#menu-extras');
    if (!aside) return;
    if (id === 'food') {
      aside.style.display = 'block';
      renderExtras('Extras', menuData.food?.extras || []);
    } else if (id === 'drinks') {
      aside.style.display = 'block';
      renderExtras('Add-ons', menuData.drinks?.extras || []);
    } else {
      aside.style.display = 'none';
    }
  };

  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab]');
    if (!tab || !tabs.includes(tab)) return;
    const id = tab.dataset.tab;
    const desiredHash = `#pane-${id}`;
    if (location.hash !== desiredHash) history.replaceState(null, '', desiredHash);
    setActive(id);
  });

  const initial = (location.hash && location.hash.startsWith('#pane-'))
    ? location.hash.replace('#pane-', '')
    : 'food';
  setActive(initial);

  window.__tabsController = { setActive };
  return window.__tabsController;
};

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
    if (ticking) return;
    window.requestAnimationFrame(onScroll);
    ticking = true;
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
  });
  io.observe(section);
  const onScroll = () => {
    if (!inView || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const progress = (viewH - rect.top) / (viewH + rect.height);
      const shift = (progress - 0.5) * 40;
      img.style.transform = `translate(-50%, calc(-50% + ${shift}px))`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();

/* ---------- Event wiring ---------- */
document.addEventListener('click', (event) => {
  const closeItem = event.target.closest('[data-item-close]');
  if (closeItem) {
    closeItemModal();
    return;
  }

  const addBtn = event.target.closest('.item__add');
  if (addBtn) {
    const config = createItemConfig(addBtn.dataset);
    if (config) openItemModal(config);
    return;
  }

  const buildStart = event.target.closest('[data-build-start]');
  if (buildStart) {
    const config = createBuildConfig();
    if (config) openItemModal(config);
    return;
  }

  if (event.target === overlay) {
    if (!itemModal?.hidden) closeItemModal();
    else if (!cartDrawer?.hidden) closeCartDrawer();
  }
});

itemModalBody?.addEventListener('click', (event) => {
  if (!activeConfig) return;
  const qtyBtn = event.target.closest('[data-qty-action]');
  if (qtyBtn) {
    const direction = qtyBtn.dataset.qtyAction;
    if (direction === 'inc') activeConfig.quantity += 1;
    if (direction === 'dec') activeConfig.quantity = Math.max(1, activeConfig.quantity - 1);
    renderItemModal();
    return;
  }

  const sizePill = event.target.closest('[data-size]');
  if (sizePill && activeConfig.mode === 'item') {
    const size = sizePill.dataset.size;
    if (size && activeConfig.sizes?.[size] != null) {
      activeConfig.selectedSize = size;
      activeConfig.baseLabel = `Base price ${formatPrice(activeConfig.sizes[size])}`;
      renderItemModal();
    }
    return;
  }

  const extraTile = event.target.closest('.option-tile[data-extra]');
  if (extraTile && activeConfig.mode === 'item') {
    const id = extraTile.dataset.extra;
    if (!activeConfig.selectedExtras) activeConfig.selectedExtras = new Set();
    if (activeConfig.selectedExtras.has(id)) activeConfig.selectedExtras.delete(id);
    else activeConfig.selectedExtras.add(id);
    renderItemModal();
    return;
  }

  const buildTile = event.target.closest('.option-tile[data-build-option]');
  if (buildTile && activeConfig.mode === 'build') {
    const groupIndex = Number(buildTile.dataset.buildGroup);
    const optionId = buildTile.dataset.buildOption;
    const type = activeConfig.groups[groupIndex]?.selection;
    const selection = activeConfig.selections[groupIndex];
    if (type === 'single') {
      activeConfig.selections[groupIndex] = new Set([optionId]);
      activeConfig.errors[`group-${groupIndex}`] = '';
    } else {
      if (selection.has(optionId)) selection.delete(optionId);
      else selection.add(optionId);
    }
    renderItemModal();
  }
});

itemModalBody?.addEventListener('change', (event) => {
  if (!activeConfig) return;
  const input = event.target;
  if (input.matches('[data-extra-input]') && activeConfig.mode === 'item') {
    const id = input.dataset.extraInput;
    if (!activeConfig.selectedExtras) activeConfig.selectedExtras = new Set();
    if (input.checked) activeConfig.selectedExtras.add(id);
    else activeConfig.selectedExtras.delete(id);
    renderItemModal();
  }
  if (input.matches('[data-build-input]') && activeConfig.mode === 'build') {
    const groupIndex = Number(input.closest('[data-build-group]')?.dataset.buildGroup);
    if (Number.isNaN(groupIndex)) return;
    const type = activeConfig.groups[groupIndex]?.selection;
    const optionId = input.dataset.buildInput;
    const selection = activeConfig.selections[groupIndex];
    if (type === 'single') {
      activeConfig.selections[groupIndex] = new Set([optionId]);
    } else {
      if (input.checked) selection.add(optionId);
      else selection.delete(optionId);
    }
    activeConfig.errors[`group-${groupIndex}`] = '';
    renderItemModal();
  }
});

itemModalBody?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activeConfig) return;

  if (activeConfig.mode === 'build') {
    const baseGroupIndex = activeConfig.groups.findIndex((group) => group.selection === 'single');
    if (baseGroupIndex >= 0 && !activeConfig.selections[baseGroupIndex].size) {
      activeConfig.errors[`group-${baseGroupIndex}`] = 'Choose a base to continue.';
      renderItemModal();
      return;
    }
  }

  if (activeConfig.cartId) updateCartItem(activeConfig);
  else addToCart(activeConfig);
  closeItemModal();
  openCartDrawer();
});

cartToggleBtn?.addEventListener('click', () => {
  if (cartDrawer?.hidden) openCartDrawer();
  else closeCartDrawer();
});

cartDrawer?.addEventListener('click', (event) => {
  if (event.target.matches('[data-cart-close]')) {
    closeCartDrawer();
  }
});


$('#cart-more')?.addEventListener('click', () => {
  closeCartDrawer();
  const tabs = window.__tabsController;
  if (tabs && typeof tabs.setActive === 'function') tabs.setActive('food');
  document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});


cartItemsEl?.addEventListener('click', (event) => {
  const holder = event.target.closest('[data-cart-id]');
  if (!holder) return;
  const id = holder.dataset.cartId;
  const item = cartState.items.find((entry) => entry.id === id);
  if (!item) return;

  if (event.target.matches('[data-cart-action="remove"]')) {
    removeCartItem(id);
    return;
  }
  if (event.target.matches('[data-cart-action="increment"]')) {
    item.quantity += 1;
    renderCart();
    return;
  }
  if (event.target.matches('[data-cart-action="decrement"]')) {
    item.quantity = Math.max(1, item.quantity - 1);
    renderCart();
    return;
  }
  if (event.target.matches('[data-cart-action="edit"]')) {
    const config = applyCartItemToConfig(item);
    if (config) openItemModal(config);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!itemModal?.hidden) {
    closeItemModal();
    return;
  }
  if (!cartDrawer?.hidden) {
    closeCartDrawer();
  }
});

/* ---------- Boot ---------- */
(async function boot() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  try {
    const response = await fetch('data/menu.json', { cache: 'no-store' });
    menuData = await response.json();

    if (menuData.food) renderFood(menuData.food);
    if (menuData.drinks) renderDrinks(menuData.drinks);
    if (menuData.build) renderBuild(menuData.build);

    setupTabs();
    renderCart();
  } catch (error) {
    console.error('Menu load failed:', error);
    $('#menu')?.insertAdjacentHTML('beforeend', '<p class="muted">Menu is currently unavailable. Please try again later.</p>');
  }
})();
