// Array de productos disponibles (se cargará desde JSON)
let productos = [];

// Array del carrito de compras
let carrito = [];

// Variable para controlar el estado de sesión
let usuarioLogueado = false;

// Referencias a elementos del DOM
const productosContainer = document.getElementById('products-container');
const cartSection = document.getElementById('cart-section');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartContainer = document.getElementById('cart-container');
const emptyCart = document.getElementById('empty-cart');
const totalAmount = document.getElementById('total-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const loginBtn = document.querySelector('.login-btn');
const logoutBtn = document.querySelector('.logout-btn');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    await cargarProductos();
    mostrarProductos();
    actualizarCarrito();

    checkoutBtn.addEventListener('click', procederPago);
    clearCartBtn.addEventListener('click', mostrarModalVaciarCarrito);
    if (loginBtn) loginBtn.addEventListener('click', mostrarModalLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', mostrarModalLogout);

    actualizarBotonesSesion();
});

// Función para cargar productos desde JSON
async function cargarProductos() {
    try {
        const response = await fetch('./productos.json');
        productos = await response.json();
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Productos de respaldo en caso de error
        productos = [
            {
                id: 1,
                nombre: "Producto de ejemplo",
                precio: 99.99,
                descripcion: "Error cargando productos desde JSON",
                imagen: "📦"
            }
        ];
    }
}

// Función para mostrar los productos en la página
function mostrarProductos() {
    productosContainer.innerHTML = '';
    
    productos.forEach(producto => {
        const productoCard = document.createElement('div');
        productoCard.className = 'product-card';
        
        productoCard.innerHTML = `
            <div class="product-image">${crearImagenProducto(producto)}</div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-price">$${producto.precio.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="agregarAlCarrito(${producto.id})">
                    Agregar al Carrito
                </button>
            </div>
        `;
        
        productosContainer.appendChild(productoCard);
    });
}

// TODO: Función para agregar un producto al carrito
    function agregarAlCarrito(productoId) {
    // Buscar el producto en el array 'productos' usando el productoId
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
        mostrarMensaje('Producto no encontrado');
        return;
    }

    // Verifica si el producto ya existe en el carrito
    const itemCarrito = carrito.find(item => item.id === productoId);

    if (itemCarrito) {
        // Si existe, incrementa la cantidad
        itemCarrito.cantidad += 1;
        mostrarMensaje(`Se agregó otra unidad de "${producto.nombre}"`);
    } else {
        // Si no existe, agrégalo con cantidad 1
        carrito.push({
            ...producto,
            cantidad: 1
        });
        mostrarMensaje(`"${producto.nombre}" agregado al carrito`);
    }

    // No olvides llamar actualizarCarrito() al final
    actualizarCarrito();
}

// Función para actualizar la visualización del carrito
function actualizarCarrito() {
    // TODO: Actualizar contador del carrito en el header
    // PISTA: Calcula el total de items sumando todas las cantidades
    // PISTA: Actualiza el textContent del elemento cartCount
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
cartCount.textContent = totalItems;


    // TODO: Actualizar el total del precio
    actualizarTotal();
    
    // Limpiar contenido anterior
    cartItems.innerHTML = '';
    
    // TODO: Mostrar mensaje de carrito vacío o los productos
    // PISTA: Si carrito.length === 0, mostrar emptyCart y ocultar cartContainer
    // PISTA: Si hay productos, hacer lo contrario
    if (carrito.length === 0) {
        emptyCart.style.display = 'block'; 
        cartContainer.style.display = 'none';
        checkoutBtn.disabled = true;
        clearCartBtn.disabled = true;
        return;
    } else {
        emptyCart.style.display = 'none';       
        cartContainer.style.display = 'block';
        checkoutBtn.disabled = false;
        clearCartBtn.disabled = false;
    }
    
    // TODO: Mostrar items del carrito
    // PISTA: Recorre el array carrito con forEach
    // PISTA: Para cada item, crea un div con clase 'cart-item'
    // PISTA: Incluye botones para cambiar cantidad y eliminar
    carrito.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="cart-item-header">
                <div class="cart-item-image">${crearImagenCarrito(item)}</div>
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <div class="cart-item-price">$${item.precio.toFixed(2)}</div>
                </div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.cantidad}" 
                       onchange="actualizarCantidad(${item.id}, this.value)" min="1">
                <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
            </div>
            <div class="item-total">
                Total: $${(item.precio * item.cantidad).toFixed(2)}
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
}

// TODO: Función para cambiar la cantidad de un producto
function cambiarCantidad(productoId, cambio) {
    // Busca el item en el carrito usando find()
    const item = carrito.find(item => item.id === productoId);
    if (item) {
        // Suma el cambio a la cantidad actual
        item.cantidad += cambio;
        // Si la cantidad queda <= 0, elimina el producto del carrito
        if (item.cantidad <= 0) {
            eliminarDelCarrito(productoId);
        }
    }
    // PISTA: Busca el item en el carrito usando find()
    // PISTA: Suma el cambio a la cantidad actual
    // PISTA: Si la cantidad queda <= 0, elimina el producto del carrito
    // PISTA: Llama a actualizarCarrito() para refrescar la vista
    actualizarCarrito();
}
// TODO: Función para actualizar cantidad directamente desde el input
function actualizarCantidad(productoId, nuevaCantidad) {
    // PISTA: Busca el item en el carrito usando find()
    const item = carrito.find(item => item.id === productoId);
    if (item) {
        // PISTA: Convierte nuevaCantidad a entero with parseInt()
        const cantidad = parseInt(nuevaCantidad);
        // PISTA: Busca el item y actualiza su cantidad
        if (cantidad > 0) {
            item.cantidad = cantidad;
        } else {
            // PISTA: Si la cantidad es <= 0, elimina el producto
            eliminarDelCarrito(productoId);
        }
    }
}

// TODO: Función para eliminar un producto del carrito
function eliminarDelCarrito(productoId) {
    // PISTA: Busca el item en el carrito usando find()
    const item = carrito.find(item => item.id === productoId);
    if (item) {
        // PISTA: Usa filter() para crear un nuevo array sin el producto a eliminar
        carrito = carrito.filter(item => item.id !== productoId);
        // PISTA: Actualiza el array carrito con el resultado del filter
        // PISTA: Llama a actualizarCarrito()
        actualizarCarrito();
    }
}

// Función para actualizar el total del carrito
function actualizarTotal() {

    // TODO: Calcular el total sumando precio * cantidad de cada item
    // PISTA: Usa reduce() para sumar todos los subtotales
    // PISTA: Actualiza el textContent de totalAmount con el resultado
    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    totalAmount.textContent = total.toFixed(2);
}

// TODO: Función para proceder al pago (básica)
function procederPago() {
    // Verifica que el carrito no esté vacío
    if (carrito.length === 0) {
        mostrarMensaje('El carrito está vacío. Agrega productos antes de comprar.');
        return;
    }

    // Calcula el total de la compra
    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    // Muestra modal de confirmación de compra
    mostrarModal({
        icono: '🛒',
        titulo: 'Confirmar compra',
        mensaje: `¿Deseas confirmar tu compra por $${total.toFixed(2)}?\n\nProductos: ${carrito.length}`,
        textoConfirmar: 'Sí, comprar',
        textoCancel: 'Cancelar',
        onConfirmar: () => {
            vaciarCarrito();
            mostrarMensaje('¡Compra realizada con éxito!');
        }
    });
}

// TODO: Función para vaciar todo el carrito
function vaciarCarrito() {
    mostrarModal({
        icono: '🗑️',
        titulo: 'Vaciar carrito',
        mensaje: 'Esta acción eliminará todos los productos del carrito. No se puede deshacer.',
        textoConfirmar: 'Sí, vaciar',
        textoCancel: 'Cancelar',
        onConfirmar: () => {
            carrito = [];
            actualizarCarrito();
        }
    });
}

/* 
 * EJERCICIOS PARA LOS ALUMNOS:
 * 
 * 1. Implementar la función agregarAlCarrito()
 * 2. Completar la función actualizarCarrito()
 * 3. Implementar cambiarCantidad() y actualizarCantidad()
 * 4. Crear la función eliminarDelCarrito()
 * 5. Completar la función actualizarTotal()
 * 6. Implementar procederPago() con confirmación
 * 7. Agregar la función vaciarCarrito()
 * 8. Conectar los event listeners en la inicialización
 * 
 * FUNCIONALIDADES ADICIONALES (OPCIONALES):
 * - Agregar funcionalidad de búsqueda de productos
 * - Implementar persistencia con localStorage
 * - Agregar animaciones y mensajes de confirmación
 * - Validaciones de entrada del usuario
 */

// FUNCIONES AUXILIARES PARA MODALES Y MENSAJES (YA IMPLEMENTADAS)

// Funciones auxiliares para manejo de imágenes

// Función para crear imagen de producto con fallback
function crearImagenProducto(producto) {
    // Si tiene imagen de archivo, intentar cargarla
    if (producto.imagen && producto.imagen.startsWith('./public/images/')) {
        return `<img src="${producto.imagen}" alt="${producto.nombre}" onerror="mostrarFallbackProducto(this, '${producto.imagenFallback || '📦'}')">`;
    }
    // Si no, mostrar el fallback (emoji o imagen original)
    return `<div class="product-image-fallback">${producto.imagenFallback || producto.imagen || '📦'}</div>`;
}

// Función para crear imagen de carrito con fallback
function crearImagenCarrito(item) {
    // Si tiene imagen de archivo, intentar cargarla
    if (item.imagen && item.imagen.startsWith('./public/images/')) {
        return `<img src="${item.imagen}" alt="${item.nombre}" onerror="mostrarFallbackCarrito(this, '${item.imagenFallback || '📦'}')">`;
    }
    // Si no, mostrar el fallback (emoji o imagen original)
    return `<div class="cart-item-image-fallback">${item.imagenFallback || item.imagen || '📦'}</div>`;
}

// Función auxiliar para manejar error de imagen de producto
function mostrarFallbackProducto(imgElement, fallback) {
    imgElement.parentElement.innerHTML = `<div class="product-image-fallback">${fallback}</div>`;
}

// Función auxiliar para manejar error de imagen de carrito
function mostrarFallbackCarrito(imgElement, fallback) {
    imgElement.parentElement.innerHTML = `<div class="cart-item-image-fallback">${fallback}</div>`;
}

// Función para crear y mostrar modal personalizado
function mostrarModal({ icono, titulo, mensaje, textoConfirmar, textoCancel, onConfirmar }) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Preparar botones
    const botones = textoCancel ? 
        `<button class="modal-btn modal-btn-cancel">${textoCancel}</button>
         <button class="modal-btn modal-btn-confirm">${textoConfirmar}</button>` :
        `<button class="modal-btn modal-btn-confirm" style="flex: none; margin: 0 auto;">${textoConfirmar}</button>`;
    
    modal.innerHTML = `
        <div class="modal-header">
            <div class="modal-icon">${icono}</div>
            <h3>${titulo}</h3>
            <p style="white-space: pre-line;">${mensaje}</p>
        </div>
        <div class="modal-actions">
            ${botones}
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Event listeners
    const btnCancel = modal.querySelector('.modal-btn-cancel');
    const btnConfirm = modal.querySelector('.modal-btn-confirm');
    
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            cerrarModal(overlay);
        });
    }
    
    btnConfirm.addEventListener('click', () => {
        if (onConfirmar) onConfirmar();
        cerrarModal(overlay);
    });
    
    // Cerrar al hacer click en el overlay (solo si no es modal de información)
    if (textoCancel) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cerrarModal(overlay);
            }
        });
    }
    
    // Cerrar con Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            cerrarModal(overlay);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Función para cerrar modal
function cerrarModal(overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 300);
}

// Función para mostrar mensajes temporales
function mostrarMensaje(mensaje) {
    // Crear elemento de mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #27ae60, #2ecc71);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    
    // Agregar animación CSS
    if (!document.querySelector('#message-styles')) {
        const style = document.createElement('style');
        style.id = 'message-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(mensajeDiv);
    
    // Eliminar mensaje después de 3 segundos
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.remove();
        }
    }, 3000);
}

// Función para mostrar modal de confirmación para vaciar carrito
function mostrarModalVaciarCarrito() {
    if (carrito.length === 0) {
        mostrarMensaje('El carrito ya está vacío');
        return;
    }
    
    mostrarModal({
        icono: '🗑️',
        titulo: '¿Vaciar carrito?',
        mensaje: 'Esta acción eliminará todos los productos del carrito. No se puede deshacer.',
        textoConfirmar: 'Sí, vaciar',
        textoCancel: 'Cancelar',
        onConfirmar: vaciarCarrito
    });
}

// Función para mostrar modal de login (placeholder)
function mostrarModalLogin() {
    mostrarModal({
        icono: '👤',
        titulo: 'Iniciar Sesión',
        mensaje: `
            <form id="login-form" style="display: flex; flex-direction: column; gap: 10px;">
                <input type="email" id="login-email" placeholder="Email" required style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                <input type="password" id="login-password" placeholder="Contraseña" required style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                <button type="button" id="show-register" style="margin-top:10px; background: none; border: none; color: #2980b9; cursor: pointer;">¿No tienes cuenta? Regístrate</button>
            </form>
        `,
        textoConfirmar: 'Iniciar',
        textoCancel: 'Cancelar',
        onConfirmar: async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            if (!email || !password) {
                mostrarMensaje('Completa ambos campos');
                return;
            }
            try {
                const response = await fetch('https://xp8qpg8w-3000.brs.devtunnels.ms/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (response.ok) {
                    mostrarMensaje('¡Login exitoso!');
                    usuarioLogueado = true;
                    actualizarBotonesSesion();
                } else {
                    mostrarMensaje('Email o contraseña incorrectos');
                }
            } catch (error) {
                mostrarMensaje('Error de conexión');
            }
        }
    });

    setTimeout(() => {
        const btnRegister = document.getElementById('show-register');
        if (btnRegister) {
            btnRegister.addEventListener('click', () => {
                mostrarModalRegistro();
            });
        }
    }, 100);
}

// Modal de registro
function mostrarModalRegistro() {
    mostrarModal({
        icono: '📝',
        titulo: 'Registrarse',
        mensaje: `
            <form id="register-form" style="display: flex; flex-direction: column; gap: 10px;">
                <input type="text" id="register-name" placeholder="Nombre" required style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                <input type="email" id="register-email" placeholder="Email" required style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                <input type="password" id="register-password" placeholder="Contraseña" required style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
            </form>
        `,
        textoConfirmar: 'Registrar',
        textoCancel: 'Cancelar',
        onConfirmar: async () => {
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            if (!name || !email || !password) {
                mostrarMensaje('Completa todos los campos');
                return;
            }
            try {
                const response = await fetch('https://xp8qpg8w-3000.brs.devtunnels.ms/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                if (response.ok) {
                    mostrarMensaje('¡Registro exitoso! Ahora puedes iniciar sesión.');
                    usuarioLogueado = true;
                    actualizarBotonesSesion();
                } else {
                    mostrarMensaje('Error al registrar. Intenta con otro email.');
                }
            } catch (error) {
                mostrarMensaje('Error de conexión');
            }
        }
    });
}

// Modifica mostrarModalLogout para mostrar el botón de login y ocultar logout al cerrar sesión
function mostrarModalLogout() {
    mostrarModal({
        icono: '🚪',
        titulo: 'Cerrar sesión',
        mensaje: '¿Seguro que deseas cerrar sesión?',
        textoConfirmar: 'Cerrar sesión',
        textoCancel: 'Cancelar',
        onConfirmar: async () => {
            // Si tu backend tiene endpoint de logout, puedes hacer la petición aquí
            // await fetch('https://xp8qpg8w-3000.brs.devtunnels.ms/auth/logout', { method: 'POST' });

            usuarioLogueado = false;
            actualizarBotonesSesion();
            mostrarMensaje('Sesión cerrada');
        }
    });
}

// Función para actualizar la visibilidad de los botones de sesión
function actualizarBotonesSesion() {
    if (usuarioLogueado) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}
