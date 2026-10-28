// Salchidaniela - interacciones de la landing page
const products = {
  hamburguesa: { name: "Hamburguesa Salchi", price: 18900 },
  salchipapa: { name: "Salchipapa Explosiva", price: 16900 },
  perro: { name: "Perro Caliente Especial", price: 14900 },
  doble: { name: "Doble Queso", price: 24900 },
  mixta: { name: "Salchipapa Mixta", price: 22900 },
  papas: { name: "Papas Crocantes", price: 7900 }
};
const cart = {};
const money = value => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0
}).format(value);

const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const drawerCount = document.getElementById("drawerCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function addToCart(id) {
  if (!products[id]) return;
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  showToast(`${products[id].name} agregado a tu pedido ♥`);
}

function changeQuantity(id, amount) {
  if (!cart[id]) return;
  cart[id] += amount;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart);
  const quantity = entries.reduce((sum, [, count]) => sum + count, 0);
  const total = entries.reduce((sum, [id, count]) => sum + products[id].price * count, 0);
  cartCount.textContent = quantity;
  drawerCount.textContent = `(${quantity})`;
  cartTotal.textContent = money(total);

  if (!entries.length) {
    cartItems.innerHTML = `<div class="empty-cart"><span>🛍️</span><strong>Tu pedido está esperando</strong><p>Agrega algo rico desde nuestro menú.</p><button class="btn btn-primary" id="goToMenu">Explorar menú</button></div>`;
    document.getElementById("goToMenu").addEventListener("click", () => {
      closeCart();
      document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
    });
    return;
  }

  cartItems.innerHTML = entries.map(([id, count]) => `
    <article class="cart-row">
      <div>
        <h4>${products[id].name}</h4>
        <small>${money(products[id].price)} unidad</small>
        <div class="quantity-control">
          <button type="button" data-quantity="${id}" data-amount="-1" aria-label="Restar uno">−</button>
          <span>${count}</span>
          <button type="button" data-quantity="${id}" data-amount="1" aria-label="Agregar uno">+</button>
        </div>
      </div>
      <div class="cart-row-price">${money(products[id].price * count)}</div>
    </article>`).join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartOverlay.hidden = false;
  document.body.classList.add("cart-open");
  document.getElementById("closeCart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartOverlay.hidden = true;
  document.body.classList.remove("cart-open");
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-quantity]");
  if (button) changeQuantity(button.dataset.quantity, Number(button.dataset.amount));
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    filterProducts();
  });
});

document.getElementById("productSearch").addEventListener("input", filterProducts);

function filterProducts() {
  const activeCategory = document.querySelector(".filter-btn.active").dataset.filter;
  const search = document.getElementById("productSearch").value.trim().toLocaleLowerCase("es");
  document.querySelectorAll(".product-card").forEach(card => {
    const categoryMatches = activeCategory === "todos" || card.dataset.category === activeCategory;
    const searchMatches = card.dataset.name.toLocaleLowerCase("es").includes(search);
    card.hidden = !(categoryMatches && searchMatches);
  });
}

document.getElementById("menuToggle").addEventListener("click", () => {
  const nav = document.getElementById("navLinks");
  const isOpen = nav.classList.toggle("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", String(isOpen));
  document.getElementById("menuToggle").setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("navLinks").classList.remove("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
  });
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  const entries = Object.entries(cart);
  if (!entries.length) {
    showToast("Agrega al menos un producto antes de pedir.");
    return;
  }

  // IMPORTANTE: reemplaza este número por el WhatsApp real del negocio.
  const whatsappNumber = "573000000000";
  const lines = entries.map(([id, count]) =>
    `• ${products[id].name} x${count} — ${money(products[id].price * count)}`
  );
  const total = entries.reduce((sum, [id, count]) => sum + products[id].price * count, 0);
  const message = `¡Hola, Salchidaniela! Quiero hacer este pedido:\n\n${lines.join("\n")}\n\n*Total estimado: ${money(total)}*\n¿Me confirman disponibilidad y domicilio?`;
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim().slice(0, 150);
  const feedback = document.getElementById("formFeedback");

  if (!name || !phone || !email || !message) {
    feedback.textContent = "Completa todos los campos para preparar tu mensaje.";
    return;
  }

  // Este formulario prepara un correo en la aplicación de correo del usuario.
  const subject = encodeURIComponent(`Mensaje para Salchidaniela de ${name}`);
  const body = encodeURIComponent(`Nombre: ${name}\nTeléfono: ${phone}\nCorreo: ${email}\n\nMensaje (${message.length}/150 caracteres):\n${message}`);
  feedback.textContent = "Abriendo tu aplicación de correo para que puedas enviar el mensaje…";
  window.location.href = `mailto:contacto@salchidaniela.com?subject=${subject}&body=${body}`;
});

const messageField = document.getElementById("message");
const messageCount = document.getElementById("messageCount");
messageField.addEventListener("input", () => { messageCount.textContent = messageField.value.length; });

document.getElementById("year").textContent = new Date().getFullYear();
if (window.lucide) window.lucide.createIcons();
renderCart();
