/* RestoBar Ivan - navegación multipágina y funciones del sitio */
const $ = (id) => document.getElementById(id);
const menuToggle = $("menuToggle");
const navLinks = $("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = menuToggle.querySelector("i");
    if (icon) icon.className = navLinks.classList.contains("active") ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  });
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("active")));
}

const formatoPrecio = precio => "Bs " + Number(precio).toFixed(2);
let platos = [];
let productoActual = null;

async function cargarProductos() {
  try {
    const respuesta = await fetch("menu.json");
    if (!respuesta.ok) throw new Error("No se pudo cargar menu.json");
    platos = await respuesta.json();
    if (!Array.isArray(platos)) throw new Error("El menú no tiene un formato válido.");
    return platos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function crearElemento(tag, className, texto) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

/* ANIMACIONES DE APARICIÓN AL DESPLAZARSE */
const observadorEntrada = "IntersectionObserver" in window
  ? new IntersectionObserver((entradas, observador) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("is-visible");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" })
  : null;

function observarEntrada(elemento) {
  if (!elemento) return;
  if (observadorEntrada) {
    elemento.classList.add("reveal-on-scroll");
    observadorEntrada.observe(elemento);
  } else {
    elemento.classList.add("is-visible");
  }
}

document.querySelectorAll("main .section-heading, main .featured-card, main .contact-info-panel, main .contact-form, main .about-container, main .reservation-container")
  .forEach(observarEntrada);

/* MENÚ: búsqueda, filtros y selección de productos */
const menuGrid = $("menuGrid");
if (menuGrid) {
  const buscador = $("buscador");
  const filtros = document.querySelectorAll(".filter-btn");
  let categoriaActual = menuGrid.dataset.categoryPage || "Todos";
  const coincideCategoria = p => categoriaActual === "Todos" || (categoriaActual === "Bebidas" ? String(p.categoria).startsWith("Bebidas") : p.categoria === categoriaActual);

  function mostrarPlatos(lista) {
    menuGrid.replaceChildren();
    if (!lista.length) {
      menuGrid.appendChild(crearElemento("p", "no-results", "No se encontraron productos."));
      return;
    }
    lista.forEach(plato => {
      const tarjeta = crearElemento("article", "menu-card");
      const contenedorImagen = crearElemento("div", "menu-card-image");
      const img = document.createElement("img");
      img.src = plato.imagen;
      img.alt = plato.nombre;
      img.loading = "lazy";
      img.onerror = function () { this.onerror = null; this.src = "https://placehold.co/700x450?text=RestoBar+Ivan"; };
      contenedorImagen.appendChild(img);

      const contenido = crearElemento("div", "menu-card-content");
      contenido.appendChild(crearElemento("span", "menu-category", plato.categoria));
      contenido.appendChild(crearElemento("h3", "", plato.nombre));
      contenido.appendChild(crearElemento("p", "", plato.descripcion));
      if (plato.ingredientes) contenido.appendChild(crearElemento("p", "menu-ingredients", "Ingredientes: " + plato.ingredientes));
      const pie = crearElemento("div", "menu-card-bottom");
      pie.appendChild(crearElemento("span", "menu-price", formatoPrecio(plato.precio)));
      contenido.appendChild(pie);

      const boton = crearElemento("button", "btn btn-order", "Pedir este producto");
      boton.type = "button";
      boton.dataset.id = String(plato.id);
      const icono = document.createElement("i");
      icono.className = "fa-solid fa-cart-shopping";
      boton.appendChild(icono);
      contenido.appendChild(boton);
      tarjeta.append(contenedorImagen, contenido);
      menuGrid.appendChild(tarjeta);
      observarEntrada(tarjeta);
    });
  }

  function filtrar() {
    const texto = buscador ? buscador.value.toLowerCase().trim() : "";
    mostrarPlatos(platos.filter(p =>
      coincideCategoria(p) &&
      (p.nombre.toLowerCase().includes(texto) || p.descripcion.toLowerCase().includes(texto) || (p.ingredientes || "").toLowerCase().includes(texto))
    ));
  }

  cargarProductos().then(datos => {
    if (!datos.length) {
      menuGrid.replaceChildren(crearElemento("p", "no-results", "No se pudo cargar el menú. Comprueba que menu.json esté junto a los archivos HTML."));
    } else {
      // Respeta la categoría indicada por cada página (Sopas o Almuerzos).
      // En menu.html categoriaActual comienza en "Todos".
      filtrar();
    }
  });

  if (buscador) buscador.addEventListener("input", filtrar);
  filtros.forEach(boton => boton.addEventListener("click", () => {
    categoriaActual = boton.dataset.category;
    filtros.forEach(b => b.classList.toggle("active", b === boton));
    filtrar();
  }));

  menuGrid.addEventListener("click", async evento => {
    const boton = evento.target.closest(".btn-order");
    if (!boton) return;
    sessionStorage.setItem("productoSeleccionado", boton.dataset.id);
    window.location.href = "pedidos.html";
  });
}

/* GALERÍA: tarjetas dinámicas con ingredientes del catálogo */
const galleryGrid = $("galleryGrid");
if (galleryGrid) {
  cargarProductos().then(datos => {
    galleryGrid.replaceChildren();
    datos.forEach(plato => {
      const card = crearElemento("article", "gallery-card");
      const imageWrap = crearElemento("div", "gallery-item");
      const img = document.createElement("img"); img.src = plato.imagen; img.alt = plato.nombre; img.loading = "lazy";
      img.onerror = function(){ this.onerror=null; this.src="https://placehold.co/700x450?text=RestoBar+Ivan"; };
      imageWrap.appendChild(img);
      const body = crearElemento("div", "gallery-card-content");
      body.append(crearElemento("span", "menu-category", plato.categoria), crearElemento("h3", "", plato.nombre), crearElemento("p", "", "Ingredientes: " + (plato.ingredientes || plato.descripcion)));
      card.append(imageWrap, body); galleryGrid.appendChild(card);
    });
  });
}

/* PEDIDOS: cargar producto seleccionado y registrar */
const reservationForm = $("reservationForm");
if (reservationForm) {
  const formMessage = $("formMessage");
  const pedidoSeleccionado = $("pedidoSeleccionado");
  const precioSeleccionado = $("precioSeleccionado");
  const productoPedido = $("productoPedido");
  const cantidadPedido = $("cantidadPedido");
  const totalPedido = $("totalPedido");
  const nombre = $("nombre");
  const correo = $("correo");
  const telefono = $("telefono");
  const fecha = $("fecha");
  const mensaje = $("mensaje");
  const avisoAlcohol = document.createElement("label");
  avisoAlcohol.className = "age-confirmation";
  avisoAlcohol.hidden = true;
  avisoAlcohol.innerHTML = '<input type="checkbox" id="confirmarEdad"> Confirmo que tengo 18 años o más y que la compra es para una persona adulta.';
  const botonConfirmar = reservationForm.querySelector('[type="submit"]');
  if (botonConfirmar) reservationForm.insertBefore(avisoAlcohol, botonConfirmar);
  const confirmarEdad = avisoAlcohol.querySelector("input");

  function calcularTotal() {
    if (!productoActual) { totalPedido.textContent = formatoPrecio(0); return; }
    let cantidad = Number(cantidadPedido.value);
    if (!Number.isFinite(cantidad) || cantidad < 1) cantidad = 1;
    if (cantidad > 50) cantidad = 50;
    totalPedido.textContent = formatoPrecio(productoActual.precio * cantidad);
  }

  cargarProductos().then(datos => {
    const idGuardado = sessionStorage.getItem("productoSeleccionado");
    if (idGuardado && datos.length) {
      productoActual = datos.find(p => String(p.id) === idGuardado) || null;
      sessionStorage.removeItem("productoSeleccionado");
      if (productoActual) {
        productoPedido.value = productoActual.id;
        pedidoSeleccionado.textContent = productoActual.nombre;
        precioSeleccionado.textContent = "Precio unitario: " + formatoPrecio(productoActual.precio);
        calcularTotal();
        avisoAlcohol.hidden = !productoActual.alcoholico;
        if (confirmarEdad) confirmarEdad.checked = false;
      }
    }
  });

  cantidadPedido.addEventListener("input", calcularTotal);
  const hoy = new Date();
  fecha.min = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;

  reservationForm.addEventListener("submit", evento => {
    evento.preventDefault();
    const mostrarError = texto => { formMessage.textContent = texto; formMessage.className = "form-message error"; };
    if (!productoActual) return mostrarError("Primero selecciona un producto desde la página Menú.");
    if (productoActual.alcoholico && (!confirmarEdad || !confirmarEdad.checked)) return mostrarError("Debes confirmar que tienes 18 años o más para solicitar esta bebida.");
    const cantidad = Number(cantidadPedido.value);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) return mostrarError("La cantidad debe estar entre 1 y 50.");
    const tel = telefono.value.trim();
    if (!/^[0-9+\s()-]{7,20}$/.test(tel)) return mostrarError("Introduce un número de teléfono válido.");
    if (!fecha.value) return mostrarError("Debes seleccionar una fecha.");
    const fechaSel = new Date(fecha.value + "T00:00:00");
    const hoyFecha = new Date(); hoyFecha.setHours(0,0,0,0);
    if (fechaSel < hoyFecha) return mostrarError("La fecha no puede ser anterior al día de hoy.");

    const pedido = {
      id: Date.now(), cliente: nombre.value.trim(), correo: correo.value.trim(),
      telefono: tel, producto: productoActual.nombre, precioUnitario: productoActual.precio,
      cantidad, total: productoActual.precio * cantidad, fecha: fecha.value,
      indicaciones: mensaje.value.trim(), estado: "Pendiente"
    };
    try {
      const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
      pedidos.push(pedido);
      localStorage.setItem("pedidos", JSON.stringify(pedidos));
      formMessage.textContent = `¡Pedido registrado correctamente! Tu número de pedido es ${pedido.id}.`;
      formMessage.className = "form-message success";
      reservationForm.reset();
      productoActual = null;
      productoPedido.value = "";
      pedidoSeleccionado.textContent = "Todavía no seleccionaste ningún producto.";
      precioSeleccionado.textContent = "";
      totalPedido.textContent = formatoPrecio(0);
      cantidadPedido.value = 1;
      avisoAlcohol.hidden = true;
      if (confirmarEdad) confirmarEdad.checked = false;
    } catch (error) {
      console.error(error);
      mostrarError("No se pudo guardar el pedido en este navegador.");
    }
  });
}

/* ADMINISTRACIÓN: pedidos guardados en el navegador actual */
const listaPedidos = $("listaPedidos");
if (listaPedidos) {
  const totalPedidos = $("totalPedidos");
  const pedidosPendientes = $("pedidosPendientes");
  const pedidosCompletados = $("pedidosCompletados");
  const ventasTotales = $("ventasTotales");
  const buscarPedido = $("buscarPedido");
  const actualizarPedidos = $("actualizarPedidos");
  const cantidadPedidos = $("cantidadPedidos");
  let productosAdmin = [];
  cargarProductos().then(datos => { productosAdmin = datos; });

  const obtenerPedidos = () => {
    try {
      const datos = JSON.parse(localStorage.getItem("pedidos") || "[]");
      return Array.isArray(datos) ? datos : [];
    } catch { return []; }
  };
  const guardarPedidos = datos => localStorage.setItem("pedidos", JSON.stringify(datos));
  const claseEstado = estado => ({
    "Pendiente":"status-pendiente", "En preparación":"status-preparacion",
    "Completado":"status-completado", "Cancelado":"status-cancelado"
  }[estado] || "status-pendiente");

  function mostrarPedidos() {
    const pedidos = obtenerPedidos();
    totalPedidos.textContent = pedidos.length;
    pedidosPendientes.textContent = pedidos.filter(p => p.estado === "Pendiente").length;
    pedidosCompletados.textContent = pedidos.filter(p => p.estado === "Completado").length;
    ventasTotales.textContent = formatoPrecio(pedidos.reduce((s,p) => s + (p.estado === "Cancelado" ? 0 : Number(p.total || 0)), 0));
    const texto = buscarPedido.value.toLowerCase().trim();
    const filtrados = pedidos.filter(p => (p.cliente || "").toLowerCase().includes(texto) || (p.producto || "").toLowerCase().includes(texto));
    cantidadPedidos.textContent = `${filtrados.length} ${filtrados.length === 1 ? "pedido" : "pedidos"}`;
    listaPedidos.replaceChildren();
    if (!filtrados.length) {
      listaPedidos.appendChild(crearElemento("p","no-orders", texto ? "No se encontraron pedidos con esa búsqueda." : "Todavía no hay pedidos registrados."));
      return;
    }
    filtrados.slice().reverse().forEach(p => {
      const tarjeta = crearElemento("article","order-card");
      const encabezado = crearElemento("div","order-card-header");
      encabezado.append(crearElemento("span","order-id","Pedido #"+p.id), crearElemento("span","order-status "+claseEstado(p.estado),p.estado));
      const info = crearElemento("div","order-information");
      [["Cliente",p.cliente],["Correo",p.correo],["Teléfono",p.telefono],["Producto(s)",p.producto],["Precio unitario inicial",formatoPrecio(p.precioUnitario)],["Cantidad inicial",p.cantidad],["Fecha de entrega",p.fecha],["Indicaciones",p.indicaciones || "Sin indicaciones"]].forEach(([k,v]) => {
        const par = crearElemento("p"); par.append(crearElemento("strong","",k+": "),document.createTextNode(String(v ?? ""))); info.appendChild(par);
      });
      if (Array.isArray(p.productos) && p.productos.length) {
        const detalle = crearElemento("div","order-added-items");
        detalle.appendChild(crearElemento("strong","","Detalle de productos:"));
        p.productos.forEach(item => detalle.appendChild(crearElemento("p","","• "+item.nombre+" × "+item.cantidad+" — "+formatoPrecio(item.precio*item.cantidad))));
        info.appendChild(detalle);
      }
      const formAgregar = crearElemento("form","add-product-form");
      formAgregar.hidden = true;
      formAgregar.dataset.id = p.id;
      const selectProducto = document.createElement("select");
      selectProducto.name = "producto";
      selectProducto.required = true;
      selectProducto.setAttribute("aria-label","Producto para agregar");
      const opcionInicial = document.createElement("option"); opcionInicial.value=""; opcionInicial.textContent="Selecciona un producto"; selectProducto.appendChild(opcionInicial);
      productosAdmin.forEach(prod => { const op=document.createElement("option"); op.value=prod.id; op.textContent=prod.nombre+" — "+formatoPrecio(prod.precio); selectProducto.appendChild(op); });
      const cantidadNueva = document.createElement("input"); cantidadNueva.type="number"; cantidadNueva.name="cantidad"; cantidadNueva.min="1"; cantidadNueva.max="50"; cantidadNueva.value="1"; cantidadNueva.required=true; cantidadNueva.setAttribute("aria-label","Cantidad a agregar");
      const guardarNuevo = crearElemento("button","btn","Confirmar agregado"); guardarNuevo.type="submit";
      formAgregar.append(selectProducto,cantidadNueva,guardarNuevo);
      const pie = crearElemento("div","order-card-footer");
      pie.appendChild(crearElemento("span","order-total-admin","Total: "+formatoPrecio(p.total)));
      const acciones = crearElemento("div","order-actions");
      const select = document.createElement("select"); select.dataset.id = p.id; select.setAttribute("aria-label","Cambiar estado del pedido");
      ["Pendiente","En preparación","Completado","Cancelado"].forEach(e => { const op = document.createElement("option"); op.value=e; op.textContent=e; op.selected=p.estado===e; select.appendChild(op); });
      const agregar = crearElemento("button","btn btn-add-product","Agregar producto"); agregar.type="button"; agregar.dataset.id=p.id;
      const eliminar = crearElemento("button","btn-delete","Eliminar"); eliminar.type="button"; eliminar.dataset.id=p.id;
      acciones.append(select,agregar,eliminar); pie.appendChild(acciones); tarjeta.append(encabezado,info,formAgregar,pie); listaPedidos.appendChild(tarjeta);
    });
  }
  listaPedidos.addEventListener("change", e => {
    if (e.target.tagName !== "SELECT") return;
    const pedidos=obtenerPedidos(), pedido=pedidos.find(p=>String(p.id)===e.target.dataset.id);
    if (pedido) { pedido.estado=e.target.value; guardarPedidos(pedidos); mostrarPedidos(); }
  });
  listaPedidos.addEventListener("click", e => {
    const abrir=e.target.closest(".btn-add-product");
    if (abrir) {
      const form=listaPedidos.querySelector(`.add-product-form[data-id="${abrir.dataset.id}"]`);
      if (form) { form.hidden=!form.hidden; if (!productosAdmin.length) cargarProductos().then(datos=>{productosAdmin=datos; mostrarPedidos();}); }
      return;
    }
    const boton=e.target.closest(".btn-delete"); if (!boton) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este pedido?")) return;
    guardarPedidos(obtenerPedidos().filter(p=>String(p.id)!==boton.dataset.id)); mostrarPedidos();
  });
  listaPedidos.addEventListener("submit", e => {
    const form=e.target.closest(".add-product-form");
    if (!form) return;
    e.preventDefault();
    const producto=productosAdmin.find(item=>String(item.id)===form.elements.producto.value);
    const cantidad=Number(form.elements.cantidad.value);
    if (!producto || !Number.isInteger(cantidad) || cantidad<1 || cantidad>50) { alert("Selecciona un producto y una cantidad válida (1 a 50)."); return; }
    const pedidos=obtenerPedidos();
    const pedido=pedidos.find(item=>String(item.id)===form.dataset.id);
    if (!pedido) return;
    if (!Array.isArray(pedido.productos) || !pedido.productos.length) {
      pedido.productos=[{nombre:pedido.producto,precio:Number(pedido.precioUnitario)||0,cantidad:Number(pedido.cantidad)||1}];
    }
    const existente=pedido.productos.find(item=>String(item.nombre)===producto.nombre);
    if (existente) existente.cantidad+=cantidad;
    else pedido.productos.push({nombre:producto.nombre,precio:Number(producto.precio),cantidad});
    pedido.total=pedido.productos.reduce((s,item)=>s+(Number(item.precio)*Number(item.cantidad)),0);
    pedido.producto=pedido.productos.map(item=>item.nombre+" (x"+item.cantidad+")").join(", ");
    guardarPedidos(pedidos);
    mostrarPedidos();
  });
  buscarPedido.addEventListener("input",mostrarPedidos);
  actualizarPedidos.addEventListener("click",mostrarPedidos);
  mostrarPedidos();
}


/* CONTACTO: prepara el mensaje y lo abre en WhatsApp */
const contactForm = $("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", evento => {
    evento.preventDefault();
    const nombre = $("contactNombre").value.trim();
    const correo = $("contactCorreo").value.trim();
    const asunto = $("contactAsunto").value;
    const mensaje = $("contactMensaje").value.trim();
    const aviso = $("contactMessage");
    if (!nombre || !correo || !asunto || !mensaje) {
      aviso.textContent = "Completa todos los campos para continuar.";
      aviso.className = "form-message error";
      return;
    }
    aviso.textContent = "Se abrirá WhatsApp para que puedas enviar tu consulta.";
    aviso.className = "form-message success";
    window.open("https://wa.me/59165852461?text=" + encodeURIComponent(`Hola, soy ${nombre}.\nCorreo: ${correo}\nAsunto: ${asunto}\nMensaje: ${mensaje}`), "_blank", "noopener");
  });
}
