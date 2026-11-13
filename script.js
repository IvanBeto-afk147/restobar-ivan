
/* =========================================
   REFERENCIAS A ELEMENTOS DEL HTML
========================================= */

// Elementos del menú
const menuGrid = document.getElementById("menuGrid");
const buscador = document.getElementById("buscador");
const botonesFiltro = document.querySelectorAll(".filter-btn");

// Elementos del formulario
const reservationForm = document.getElementById("reservationForm");
const formMessage = document.getElementById("formMessage");

const pedidoSeleccionado = document.getElementById("pedidoSeleccionado");
const precioSeleccionado = document.getElementById("precioSeleccionado");
const productoPedido = document.getElementById("productoPedido");
const cantidadPedido = document.getElementById("cantidadPedido");
const totalPedido = document.getElementById("totalPedido");

const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");
const fecha = document.getElementById("fecha");
const mensaje = document.getElementById("mensaje");

// Navegación
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

// Elementos del panel de administración
const totalPedidos = document.getElementById("totalPedidos");
const pedidosPendientes = document.getElementById("pedidosPendientes");
const pedidosCompletados = document.getElementById("pedidosCompletados");
const ventasTotales = document.getElementById("ventasTotales");

const buscarPedido = document.getElementById("buscarPedido");
const actualizarPedidos = document.getElementById("actualizarPedidos");
const cantidadPedidos = document.getElementById("cantidadPedidos");
const listaPedidos = document.getElementById("listaPedidos");


/* =========================================
   VARIABLES DEL PROGRAMA
========================================= */

let platos = [];
let categoriaActual = "Todos";
let productoActual = null;


/* =========================================
   FUNCIONES AUXILIARES
========================================= */

// Formato de precios
function formatoPrecio(precio) {
    return "Bs " + Number(precio).toFixed(2);
}

// Crear un elemento con texto
function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);

    if (clase) {
        elemento.className = clase;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}


/* =========================================
   CARGAR PRODUCTOS DESDE JSON
========================================= */

async function cargarMenu() {
    try {
        const respuesta = await fetch("menu.json");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el archivo menu.json.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
            throw new Error("El archivo JSON no contiene una lista válida.");
        }

        platos = datos;
        mostrarPlatos(platos);

    } catch (error) {
        console.error("Error al cargar el menú:", error);

        menuGrid.replaceChildren();

        const mensajeError = crearElemento(
            "p",
            "no-results",
            "No se pudo cargar el menú. Comprueba que menu.json esté en la carpeta del proyecto y abre la página con Live Server."
        );

        menuGrid.appendChild(mensajeError);
    }
}


/* =========================================
   MOSTRAR PRODUCTOS EN EL HTML
========================================= */

function mostrarPlatos(listaPlatos) {
    menuGrid.replaceChildren();

    if (listaPlatos.length === 0) {
        menuGrid.appendChild(
            crearElemento("p", "no-results", "No se encontraron productos.")
        );

        return;
    }

    listaPlatos.forEach((plato) => {

        // Tarjeta del producto
        const tarjeta = crearElemento("article", "menu-card");

        // Imagen
        const contenedorImagen = crearElemento("div", "menu-card-image");
        const imagen = document.createElement("img");

        imagen.src = plato.imagen;
        imagen.alt = plato.nombre;
        imagen.loading = "lazy";

        imagen.onerror = function () {
            this.onerror = null;
            this.src = "https://placehold.co/700x450?text=RestoBar+Ivan";
        };

        contenedorImagen.appendChild(imagen);

        // Contenido
        const contenido = crearElemento("div", "menu-card-content");

        const categoria = crearElemento(
            "span",
            "menu-category",
            plato.categoria
        );

        const titulo = crearElemento("h3", "", plato.nombre);

        const descripcion = crearElemento(
            "p",
            "",
            plato.descripcion
        );

        const parteInferior = crearElemento("div", "menu-card-bottom");

        const precio = crearElemento(
            "span",
            "menu-price",
            formatoPrecio(plato.precio)
        );

        parteInferior.appendChild(precio);

        // Botón para seleccionar el producto
        const boton = crearElemento(
            "button",
            "btn btn-order",
            "Seleccionar producto"
        );

        boton.type = "button";
        boton.dataset.id = String(plato.id);

        const icono = document.createElement("i");
        icono.className = "fa-solid fa-cart-shopping";

        boton.appendChild(icono);

        // Organizar tarjeta
        contenido.appendChild(categoria);
        contenido.appendChild(titulo);
        contenido.appendChild(descripcion);
        contenido.appendChild(parteInferior);
        contenido.appendChild(boton);

        tarjeta.appendChild(contenedorImagen);
        tarjeta.appendChild(contenido);

        menuGrid.appendChild(tarjeta);
    });
}


/* =========================================
   SELECCIONAR UN PRODUCTO
========================================= */

// Evento delegado: detecta los clics en los botones del menú
menuGrid.addEventListener("click", function (evento) {

    const boton = evento.target.closest(".btn-order");

    if (!boton) {
        return;
    }

    const idProducto = Number(boton.dataset.id);

    const productoEncontrado = platos.find(
        (plato) => Number(plato.id) === idProducto
    );

    if (!productoEncontrado) {
        return;
    }

    productoActual = productoEncontrado;

    // Mostrar el producto seleccionado
    productoPedido.value = productoActual.id;
    pedidoSeleccionado.textContent = productoActual.nombre;

    precioSeleccionado.textContent =
        "Precio unitario: " + formatoPrecio(productoActual.precio);

    cantidadPedido.value = 1;

    calcularTotal();

    // Llevar al usuario al formulario
    document.getElementById("reservas").scrollIntoView({
        behavior: "smooth"
    });

});


/* =========================================
   CALCULAR TOTAL DEL PEDIDO
========================================= */

function calcularTotal() {

    if (!productoActual) {
        totalPedido.textContent = formatoPrecio(0);
        return;
    }

    let cantidad = Number(cantidadPedido.value);

    if (!Number.isFinite(cantidad) || cantidad < 1) {
        cantidad = 1;
    }

    if (cantidad > 50) {
        cantidad = 50;
    }

    const total = productoActual.precio * cantidad;

    totalPedido.textContent = formatoPrecio(total);
}

// Recalcular cuando cambia la cantidad
cantidadPedido.addEventListener("input", calcularTotal);


/* =========================================
   BUSCADOR DE PRODUCTOS
========================================= */

buscador.addEventListener("input", function () {

    const textoBusqueda = buscador.value.toLowerCase().trim();

    const productosFiltrados = platos.filter((plato) => {

        const coincideTexto =
            plato.nombre.toLowerCase().includes(textoBusqueda) ||
            plato.descripcion.toLowerCase().includes(textoBusqueda);

        const coincideCategoria =
            categoriaActual === "Todos" ||
            plato.categoria === categoriaActual;

        return coincideTexto && coincideCategoria;
    });

    mostrarPlatos(productosFiltrados);
});


/* =========================================
   FILTRAR POR CATEGORÍA
========================================= */

botonesFiltro.forEach((boton) => {

    boton.addEventListener("click", function () {

        categoriaActual = boton.dataset.category;

        // Cambiar el botón activo
        botonesFiltro.forEach((otroBoton) => {
            otroBoton.classList.remove("active");
        });

        boton.classList.add("active");

        // Aplicar filtro y búsqueda
        const textoBusqueda = buscador.value.toLowerCase().trim();

        const productosFiltrados = platos.filter((plato) => {

            const coincideCategoria =
                categoriaActual === "Todos" ||
                plato.categoria === categoriaActual;

            const coincideTexto =
                plato.nombre.toLowerCase().includes(textoBusqueda) ||
                plato.descripcion.toLowerCase().includes(textoBusqueda);

            return coincideCategoria && coincideTexto;
        });

        mostrarPlatos(productosFiltrados);
    });

});


/* =========================================
   ALMACENAMIENTO DE PEDIDOS
========================================= */

function obtenerPedidos() {

    try {
        const pedidosGuardados = localStorage.getItem("pedidos");

        if (!pedidosGuardados) {
            return [];
        }

        const pedidos = JSON.parse(pedidosGuardados);

        return Array.isArray(pedidos) ? pedidos : [];

    } catch (error) {
        console.error("Error al leer los pedidos:", error);
        return [];
    }
}

function guardarPedidos(pedidos) {
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
}


/* =========================================
   REGISTRAR UN NUEVO PEDIDO
========================================= */

reservationForm.addEventListener("submit", function (evento) {

    evento.preventDefault();

    // Comprobar que se seleccionó un producto
    if (!productoActual) {
        formMessage.textContent =
            "Primero debes seleccionar un producto del menú.";

        formMessage.className = "form-message error";
        return;
    }

    // Validar cantidad
    const cantidad = Number(cantidadPedido.value);

    if (
        !Number.isInteger(cantidad) ||
        cantidad < 1 ||
        cantidad > 50
    ) {
        formMessage.textContent =
            "La cantidad debe estar entre 1 y 50.";

        formMessage.className = "form-message error";
        return;
    }

    // Validar teléfono
    const telefonoLimpio = telefono.value.trim();

    if (!/^[0-9+\s()-]{7,20}$/.test(telefonoLimpio)) {
        formMessage.textContent =
            "Introduce un número de teléfono válido.";

        formMessage.className = "form-message error";
        return;
    }

    // Validar fecha
    if (!fecha.value) {
        formMessage.textContent =
            "Debes seleccionar una fecha.";

        formMessage.className = "form-message error";
        return;
    }

    const fechaSeleccionada = new Date(fecha.value + "T00:00:00");
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
        formMessage.textContent =
            "La fecha no puede ser anterior al día de hoy.";

        formMessage.className = "form-message error";
        return;
    }

    // Calcular total
    const total = productoActual.precio * cantidad;

    // Crear objeto del pedido
    const nuevoPedido = {

        id: Date.now(),

        cliente: nombre.value.trim(),
        correo: correo.value.trim(),
        telefono: telefonoLimpio,

        producto: productoActual.nombre,
        precioUnitario: productoActual.precio,
        cantidad: cantidad,
        total: total,

        fecha: fecha.value,
        indicaciones: mensaje.value.trim(),

        estado: "Pendiente"
    };

    try {

        // Recuperar pedidos anteriores
        const pedidos = obtenerPedidos();

        // Agregar el nuevo pedido
        pedidos.push(nuevoPedido);

        // Guardar en localStorage
        guardarPedidos(pedidos);

        // Mostrar mensaje
        formMessage.textContent =
            "¡Pedido registrado correctamente! Tu número de pedido es " +
            nuevoPedido.id + ".";

        formMessage.className = "form-message success";

        // Actualizar panel
        mostrarPedidos();

        // Limpiar formulario
        reservationForm.reset();

        // Limpiar producto seleccionado
        productoActual = null;

        productoPedido.value = "";

        pedidoSeleccionado.textContent =
            "Todavía no seleccionaste ningún producto.";

        precioSeleccionado.textContent = "";

        totalPedido.textContent = formatoPrecio(0);

        cantidadPedido.value = 1;

    } catch (error) {

        console.error("No se pudo guardar el pedido:", error);

        formMessage.textContent =
            "No se pudo guardar el pedido. Comprueba el almacenamiento del navegador.";

        formMessage.className = "form-message error";
    }

});


/* =========================================
   PANEL DE ADMINISTRACIÓN
========================================= */

// Obtener la clase visual según el estado
function obtenerClaseEstado(estado) {

    switch (estado) {

        case "Pendiente":
            return "status-pendiente";

        case "En preparación":
            return "status-preparacion";

        case "Completado":
            return "status-completado";

        case "Cancelado":
            return "status-cancelado";

        default:
            return "status-pendiente";
    }
}


/* =========================================
   MOSTRAR PEDIDOS Y ESTADÍSTICAS
========================================= */

function mostrarPedidos() {

    const pedidos = obtenerPedidos();

    // Calcular estadísticas
    const pendientes = pedidos.filter(
        (pedido) => pedido.estado === "Pendiente"
    ).length;

    const completados = pedidos.filter(
        (pedido) => pedido.estado === "Completado"
    ).length;

    const ventas = pedidos.reduce((acumulado, pedido) => {

        if (pedido.estado !== "Cancelado") {
            return acumulado + Number(pedido.total || 0);
        }

        return acumulado;

    }, 0);

    // Actualizar estadísticas
    totalPedidos.textContent = pedidos.length;
    pedidosPendientes.textContent = pendientes;
    pedidosCompletados.textContent = completados;
    ventasTotales.textContent = formatoPrecio(ventas);

    // Filtrar pedidos por búsqueda
    const textoBusqueda = buscarPedido.value.toLowerCase().trim();

    const pedidosFiltrados = pedidos.filter((pedido) => {

        const coincideCliente =
            pedido.cliente.toLowerCase().includes(textoBusqueda);

        const coincideProducto =
            pedido.producto.toLowerCase().includes(textoBusqueda);

        return coincideCliente || coincideProducto;
    });

    // Mostrar cantidad de resultados
    cantidadPedidos.textContent =
        pedidosFiltrados.length +
        (pedidosFiltrados.length === 1 ? " pedido" : " pedidos");

    // Limpiar lista
    listaPedidos.replaceChildren();

    // Mensaje si no existen pedidos
    if (pedidosFiltrados.length === 0) {

        listaPedidos.appendChild(
            crearElemento(
                "p",
                "no-orders",
                textoBusqueda
                    ? "No se encontraron pedidos con esa búsqueda."
                    : "Todavía no hay pedidos registrados."
            )
        );

        return;
    }

    // Mostrar primero los pedidos más recientes
    pedidosFiltrados.reverse().forEach((pedido) => {

        const tarjeta = crearElemento("article", "order-card");

        // Encabezado
        const encabezado = crearElemento("div", "order-card-header");

        const numeroPedido = crearElemento(
            "span",
            "order-id",
            "Pedido #" + pedido.id
        );

        const estado = crearElemento(
            "span",
            "order-status " + obtenerClaseEstado(pedido.estado),
            pedido.estado
        );

        encabezado.appendChild(numeroPedido);
        encabezado.appendChild(estado);

        // Información del pedido
        const informacion = crearElemento("div", "order-information");

        const datos = [
            ["Cliente", pedido.cliente],
            ["Correo", pedido.correo],
            ["Teléfono", pedido.telefono],
            ["Producto", pedido.producto],
            ["Precio unitario", formatoPrecio(pedido.precioUnitario)],
            ["Cantidad", pedido.cantidad],
            ["Fecha de entrega", pedido.fecha],
            ["Indicaciones", pedido.indicaciones || "Sin indicaciones"]
        ];

        datos.forEach(([etiqueta, valor]) => {

            const parrafo = crearElemento("p");

            const fuerte = crearElemento("strong", "", etiqueta + ": ");

            parrafo.appendChild(fuerte);
            parrafo.appendChild(
                document.createTextNode(String(valor))
            );

            informacion.appendChild(parrafo);
        });

        // Pie de tarjeta
        const pie = crearElemento("div", "order-card-footer");

        const total = crearElemento(
            "span",
            "order-total-admin",
            "Total: " + formatoPrecio(pedido.total)
        );

        const acciones = crearElemento("div", "order-actions");

        // Selector de estado
        const selectorEstado = document.createElement("select");

        selectorEstado.dataset.id = String(pedido.id);
        selectorEstado.setAttribute(
            "aria-label",
            "Cambiar estado del pedido " + pedido.id
        );

        const estadosDisponibles = [
            "Pendiente",
            "En preparación",
            "Completado",
            "Cancelado"
        ];

        estadosDisponibles.forEach((nombreEstado) => {

            const opcion = document.createElement("option");

            opcion.value = nombreEstado;
            opcion.textContent = nombreEstado;

            if (pedido.estado === nombreEstado) {
                opcion.selected = true;
            }

            selectorEstado.appendChild(opcion);
        });

        // Botón eliminar
        const botonEliminar = crearElemento(
            "button",
            "btn-delete",
            "Eliminar"
        );

        botonEliminar.type = "button";
        botonEliminar.dataset.id = String(pedido.id);

        const iconoEliminar = document.createElement("i");
        iconoEliminar.className = "fa-solid fa-trash";

        botonEliminar.prepend(iconoEliminar);
        botonEliminar.appendChild(document.createTextNode(" "));

        acciones.appendChild(selectorEstado);
        acciones.appendChild(botonEliminar);

        pie.appendChild(total);
        pie.appendChild(acciones);

        // Unir todos los elementos
        tarjeta.appendChild(encabezado);
        tarjeta.appendChild(informacion);
        tarjeta.appendChild(pie);

        listaPedidos.appendChild(tarjeta);
    });

}


/* =========================================
   CAMBIAR ESTADO DE UN PEDIDO
========================================= */

listaPedidos.addEventListener("change", function (evento) {

    if (evento.target.tagName !== "SELECT") {
        return;
    }

    const idPedido = Number(evento.target.dataset.id);
    const nuevoEstado = evento.target.value;

    const pedidos = obtenerPedidos();

    const pedidoEncontrado = pedidos.find(
        (pedido) => Number(pedido.id) === idPedido
    );

    if (!pedidoEncontrado) {
        return;
    }

    pedidoEncontrado.estado = nuevoEstado;

    guardarPedidos(pedidos);

    mostrarPedidos();
});


/* =========================================
   ELIMINAR UN PEDIDO
========================================= */

listaPedidos.addEventListener("click", function (evento) {

    const boton = evento.target.closest(".btn-delete");

    if (!boton) {
        return;
    }

    const idPedido = Number(boton.dataset.id);

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este pedido?"
    );

    if (!confirmar) {
        return;
    }

    const pedidos = obtenerPedidos();

    const pedidosActualizados = pedidos.filter(
        (pedido) => Number(pedido.id) !== idPedido
    );

    guardarPedidos(pedidosActualizados);

    mostrarPedidos();
});


/* =========================================
   BUSCAR PEDIDOS
========================================= */

buscarPedido.addEventListener("input", function () {
    mostrarPedidos();
});


/* =========================================
   ACTUALIZAR PANEL
========================================= */

actualizarPedidos.addEventListener("click", function () {
    mostrarPedidos();
});


/* =========================================
   MENÚ DE NAVEGACIÓN PARA CELULARES
========================================= */

menuToggle.addEventListener("click", function () {

    navLinks.classList.toggle("active");

    const icono = menuToggle.querySelector("i");

    if (navLinks.classList.contains("active")) {
        icono.className = "fa-solid fa-xmark";
    } else {
        icono.className = "fa-solid fa-bars";
    }
});

// Cerrar menú al seleccionar una sección
navLinks.querySelectorAll("a").forEach((enlace) => {

    enlace.addEventListener("click", function () {

        navLinks.classList.remove("active");

        const icono = menuToggle.querySelector("i");
        icono.className = "fa-solid fa-bars";
    });

});


/* =========================================
   CONFIGURAR FECHA MÍNIMA
========================================= */

const fechaActual = new Date();

const anio = fechaActual.getFullYear();
const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
const dia = String(fechaActual.getDate()).padStart(2, "0");

fecha.min = `${anio}-${mes}-${dia}`;


/* =========================================
   INICIAR EL SITIO WEB
========================================= */

// Cargar productos del archivo JSON
cargarMenu();

// Mostrar los pedidos guardados
mostrarPedidos();
