const productos = [
    { id: 1, nombre: "Tostado", precio: 18800 },
    { id: 2, nombre: "Café", precio: 2500 },
    { id: 3, nombre: "Té", precio: 1500 },
    { id: 4, nombre: "Muffin", precio: 3000 }
];

const state = {
    carrito: JSON.parse(localStorage.getItem("carrito")) || []
};

const DOM = {
    menu: document.getElementById("menu"),
    cartItems: document.getElementById("cart-items"),
    cartCount: document.getElementById("cart-count"),
    cartTotal: document.getElementById("cart-total"),
    cartPanel: document.getElementById("cart-panel"),
    overlay: document.getElementById("overlay"),
    modal: document.getElementById("checkout-modal"),
    cartBtn: document.getElementById("cart-button")
};

const formatPrice = num => `$${num.toLocaleString()}`;

function saveState() {
    localStorage.setItem("carrito", JSON.stringify(state.carrito));
}

function render() {
    renderProductos();
    renderCarrito();
    saveState();
}

function renderProductos() {
    DOM.menu.innerHTML = productos.map(p => {
        const item = state.carrito.find(i => i.id === p.id);

        return `
        <div class="card">
            <h4>${p.nombre}</h4>
            <p>${formatPrice(p.precio)}</p>
            ${item ? `
                <div class="qty-controls">
                    <button data-action="restar" data-id="${p.id}">-</button>
                    <span>${item.cantidad}</span>
                    <button data-action="sumar" data-id="${p.id}">+</button>
                </div>
            ` : `
                <button data-action="agregar" data-id="${p.id}">
                    Agregar
                </button>
            `}
        </div>
        `;
    }).join("");
}

function renderCarrito() {
    if (state.carrito.length === 0) {
        DOM.cartItems.innerHTML = `<p class="empty-cart">Tu carrito está vacío 🛒</p>`;
        DOM.cartCount.textContent = 0;
        DOM.cartTotal.textContent = "$0";
        return;
    }

    DOM.cartItems.innerHTML = state.carrito.map(item => `
        <div class="cart-item">
            <div class="cart-top">
                <span>${item.nombre}</span>
                <span>${formatPrice(item.precio * item.cantidad)}</span>
            </div>
            <div class="cart-controls">
                <div class="qty-controls">
                    <button data-action="restar" data-id="${item.id}">-</button>
                    <span>${item.cantidad}</span>
                    <button data-action="sumar" data-id="${item.id}">+</button>
                </div>
                <button class="remove-btn" data-action="eliminar" data-id="${item.id}">✖</button>
            </div>
        </div>
    `).join("");

    DOM.cartCount.textContent = state.carrito.reduce((acc, i) => acc + i.cantidad, 0);
    DOM.cartTotal.textContent = formatPrice(
        state.carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    );
}

function agregarProducto(id) {
    const existe = state.carrito.find(p => p.id === id);

    DOM.cartBtn.classList.add("shake");
    setTimeout(() => DOM.cartBtn.classList.remove("shake"), 300);

    if (existe) {
        existe.cantidad++;
    } else {
        const producto = productos.find(p => p.id === id);
        state.carrito.push({ ...producto, cantidad: 1 });
    }

    render();
}

function cambiarCantidad(id, accion) {
    const item = state.carrito.find(p => p.id === id);
    if (!item) return;

    if (accion === "sumar") item.cantidad++;
    if (accion === "restar") item.cantidad--;

    if (item.cantidad <= 0) {
        state.carrito = state.carrito.filter(p => p.id !== id);
    }

    render();
}

function eliminarProducto(id) {
    state.carrito = state.carrito.filter(p => p.id !== id);
    render();
}

DOM.menu.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === "agregar") agregarProducto(id);
    if (action === "sumar") cambiarCantidad(id, "sumar");
    if (action === "restar") cambiarCantidad(id, "restar");
});

DOM.cartItems.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === "sumar") cambiarCantidad(id, "sumar");
    if (action === "restar") cambiarCantidad(id, "restar");
    if (action === "eliminar") eliminarProducto(id);
});

DOM.cartBtn.onclick = () => {
    DOM.cartPanel.classList.add("active");
    DOM.overlay.classList.add("active");
};

DOM.overlay.onclick = cerrar;
document.getElementById("close-cart").onclick = cerrar;

function cerrar() {
    DOM.cartPanel.classList.remove("active");
    DOM.overlay.classList.remove("active");
}

document.getElementById("pay-btn").onclick = () => {
    state.carrito = [];
    render();
    DOM.modal.classList.add("active");
};

document.getElementById("close-modal").onclick = () => {
    DOM.modal.classList.remove("active");
};

render();