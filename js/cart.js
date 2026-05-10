// ── Cart state ──────────────────────────────────────────────────
const CART_KEY = 'arte_en_conserva_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(productId, qty = 1, variant = null) {
  const product = getProductById(productId);
  if (!product) return;

  // Auto-seleccionar primera variante si el producto tiene variantes
  if (!variant && product.variants) variant = product.variants[0];

  const cartId = variant ? `${productId}__${variant.label.replace(/\s/g, '')}` : productId;
  const price  = variant ? variant.price : product.price;
  const name   = variant ? `${product.name} (${variant.label})` : product.name;

  const cart = getCart();
  const existing = cart.find(i => i.id === cartId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: cartId, productId, name, price, oldPrice: product.oldPrice || null, icon: product.icon, image: product.image || null, qty });
  }
  saveCart(cart);
  showCartToast(name);
  openCartDrawer();
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
}

function setQty(productId, val) {
  const qty = parseInt(val, 10);
  if (isNaN(qty) || qty < 1) return;
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) { item.qty = qty; saveCart(cart); }
}

function clearCart() {
  saveCart([]);
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

// ── Badge ────────────────────────────────────────────────────────
function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(b => {
    const n = cartCount();
    b.textContent = n;
    b.style.display = n > 0 ? 'flex' : 'none';
  });
}

// ── Toast notification ───────────────────────────────────────────
function showCartToast(name) {
  const existing = document.getElementById('cart-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'cart-toast';
  t.innerHTML = `<span>🛒</span> <strong>${name}</strong> agregado al carrito`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2800);
}

// ── Drawer ───────────────────────────────────────────────────────
function buildCartDrawer() {
  if (document.getElementById('cart-drawer')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  overlay.onclick = closeCartDrawer;

  const drawer = document.createElement('div');
  drawer.id = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-drawer-header">
      <h3>🛒 Tu Carrito</h3>
      <button class="cart-close-btn" onclick="closeCartDrawer()" aria-label="Cerrar carrito">✕</button>
    </div>
    <div class="cart-drawer-items" id="cart-drawer-items"></div>
    <div class="cart-drawer-footer" id="cart-drawer-footer"></div>
  `;
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  renderCartDrawer();
}

function renderCartDrawer() {
  const itemsEl = document.getElementById('cart-drawer-items');
  const footerEl = document.getElementById('cart-drawer-footer');
  if (!itemsEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🫙</span>
        <p>Tu carrito está vacío</p>
        <a href="productos.html" class="btn btn-primary" onclick="closeCartDrawer()" style="margin-top:1rem;">Ver productos</a>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-icon">${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;border-radius:6px;">` : item.icon}</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="updateQty('${item.id}', -1); return false;">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.id}', 1); return false;">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Eliminar">✕</button>
    </div>
  `).join('');

  footerEl.innerHTML = `
    <div class="cart-total">
      <span>Total</span>
      <strong>${formatPrice(cartTotal())}</strong>
    </div>
    <a href="carrito.html" class="btn btn-primary" style="width:100%; justify-content:center;" onclick="closeCartDrawer()">
      Ver carrito completo →
    </a>
    <button onclick="clearCart()" class="cart-clear-btn">Vaciar carrito</button>
  `;
}

function openCartDrawer() {
  buildCartDrawer();
  document.getElementById('cart-overlay').classList.add('active');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const d = document.getElementById('cart-drawer');
  const o = document.getElementById('cart-overlay');
  if (d) d.classList.remove('open');
  if (o) o.classList.remove('active');
  document.body.style.overflow = '';
}

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildCartDrawer();
  updateCartBadge();
});
