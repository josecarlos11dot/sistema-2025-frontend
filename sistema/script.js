// script.js - Versión segmentada y comentada para mantenimiento

document.addEventListener('DOMContentLoaded', () => {

  // ==================================================
  // 📦 1. ELEMENTOS DOM Y VARIABLES GLOBALES
  // ==================================================
  const btnNuevo = document.getElementById('btnNuevo');
  const btnCerrarFormulario = document.getElementById('btnCerrarFormulario');
  const formulario = document.getElementById('formulario');
  const overlayRegistro = document.getElementById('overlayRegistro');
  const registroForm = document.getElementById('registroForm');
  const registroBody = document.getElementById('registroBody');
  const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
  const marcasDiv = document.getElementById('marcas');
  const modelosDiv = document.getElementById('modelos');
  const coloresDiv = document.getElementById('colores');
  const preciosDiv = document.getElementById('precios');
  const lavadoresDiv = document.getElementById('lavadores');
  const inputMarca = document.getElementById('inputMarca');
  const inputModelo = document.getElementById('inputModelo');
  const inputColor = document.getElementById('inputColor');
  const inputPrecio = document.getElementById('inputPrecio');
  const inputLavador = document.getElementById('inputLavador');
  const inputPlaca = document.getElementById('inputPlaca');
  const filtroPlaca = document.getElementById('filtroPlaca');
  const filtroFechaInicio = document.getElementById('filtroFechaInicio');
  const filtroFechaFin = document.getElementById('filtroFechaFin');
  const filtroLavador = document.getElementById('filtroLavador');
  const filtroMarca = document.getElementById('filtroMarca');
  const filtroModelo = document.getElementById('filtroModelo');
  const filtroColor = document.getElementById('filtroColor');
  const filtroPrecioMin = document.getElementById('filtroPrecioMin');
  const filtroPrecioMax = document.getElementById('filtroPrecioMax');
  const resultadoFiltros = document.getElementById('resultadoFiltros');
  const btnToggleFiltros = document.getElementById('btnToggleFiltros');
  const btnCerrarFiltros = document.getElementById('btnCerrarFiltros');
  const panelFiltros = document.getElementById('panelFiltros');
  const overlay = document.getElementById('overlay');
  
  // Bases
  let basePlacas = [];
  let registrosGuardados = [];
  let filaEditando = null;
  let opciones = JSON.parse(localStorage.getItem('opciones')) || {};
  let coloresBase = JSON.parse(localStorage.getItem('coloresBase')) || [];
  let preciosBase = JSON.parse(localStorage.getItem('preciosBase')) || [];
  let lavadoresBase = JSON.parse(localStorage.getItem('lavadoresBase')) || [];
  
  
  // ==================================================
  // ⚙️ 2. UTILIDADES GENERALES
  // ==================================================
  function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  
  function guardarLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  function parseFecha(texto) {
    const partes = texto.split('/');
    return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
  }
  
  function esDeHoy(fechaStr) {
    const hoy = new Date();
    const fecha = new Date(fechaStr);
    return (
      fecha.getFullYear() === hoy.getFullYear() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getDate() === hoy.getDate()
    );
  }
  
  function activarBoton(contenedor, valor) {
    [...contenedor.children].forEach(b => {
      const texto = b.textContent.replace('$', '').trim();
      b.classList.toggle('activo', texto === valor || b.textContent === `$${valor}`);
    });
  }
  
  function seleccionarBoton(grupo, valor) {
    const idContenedor = (grupo === 'color') ? 'colores' : grupo + 's';
    const contenedor = document.getElementById(idContenedor);
    const inputOculto = document.getElementById('input' + capitalizar(grupo));
    const valorNormalizado = valor.toLowerCase().trim();
  
    if (!contenedor || !inputOculto) return;
  
    let boton = [...contenedor.querySelectorAll('button')].find(
      b => b.textContent.toLowerCase().trim() === valorNormalizado
    );
  
    if (!boton) {
      boton = document.createElement('button');
      boton.classList.add('btn');
      boton.textContent = valor;
  
      if (grupo === 'color') boton.style.backgroundColor = valor;
      if (grupo === 'modelo') boton.classList.add('modelo-dinamico');
      if (grupo === 'modelo') {
        const marcaSeleccionada = inputMarca.value;
        if (marcaSeleccionada) {
          if (!opciones[marcaSeleccionada]) {
            opciones[marcaSeleccionada] = [];
          }
          if (!opciones[marcaSeleccionada].includes(valor)) {
            opciones[marcaSeleccionada].push(valor);
            guardarLocal('opciones', opciones);
          }
        }
      }
    
  
      contenedor.appendChild(boton);
  
      boton.addEventListener('click', () => {
        [...contenedor.querySelectorAll('button')].forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');
        inputOculto.value = valor;
      
        // Si se seleccionó una marca, mostrar sus modelos
        if (contenedor.id === 'marcas' && opciones[valor]) {
          renderBotones(opciones[valor], modelosDiv, inputModelo);
        } else if (contenedor.id === 'marcas') {
          modelosDiv.innerHTML = '';
          inputModelo.value = '';
        }
      });
      
    }
  
    [...contenedor.querySelectorAll('button')].forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');
    inputOculto.value = valor;
  }
  function desactivarBotonesActivos() {
    document.querySelectorAll('.btn.activo').forEach(b => b.classList.remove('activo'));
  }
  
  
  // ==================================================
// 🧱 3. CARGA INICIAL DE OPCIONES DINÁMICAS
// ==================================================

function renderBotones(lista, contenedor, inputOculto, prefijo = '') {
  contenedor.innerHTML = '';
  lista.forEach(valor => {
    const boton = document.createElement('button');
    boton.type = 'button'; // Previene que se envíe el formulario por accidente
    boton.classList.add('btn');
    boton.textContent = prefijo + valor;

    if (contenedor.id === 'colores') {
      boton.style.backgroundColor = valor;
    }
    if (contenedor.id === 'modelos') {
      boton.classList.add('modelo-dinamico');
    }

    boton.addEventListener('click', () => {
      [...contenedor.querySelectorAll('button')].forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');
      inputOculto.value = valor;

      // Si es selección de marca, actualizamos los modelos
      if (contenedor.id === 'marcas') {
        if (opciones[valor]) {
          renderBotones(opciones[valor], modelosDiv, inputModelo);
        } else {
          modelosDiv.innerHTML = '';
          inputModelo.value = '';
        }
      }
    });

    contenedor.appendChild(boton);
  });
}


function cargarTodoDesdeStorage() {
  opciones = JSON.parse(localStorage.getItem('opciones')) || {};
  coloresBase = JSON.parse(localStorage.getItem('coloresBase')) || [];
  preciosBase = JSON.parse(localStorage.getItem('preciosBase')) || [];
  lavadoresBase = JSON.parse(localStorage.getItem('lavadoresBase')) || [];

  // Renderizar marcas
  renderBotones(Object.keys(opciones), marcasDiv, inputMarca);

  // Renderizar modelos si hay una marca seleccionada
  if (inputMarca.value && opciones[inputMarca.value]) {
    renderBotones(opciones[inputMarca.value], modelosDiv, inputModelo);
  }

  // Renderizar colores, precios, lavadores
  renderBotones(coloresBase, coloresDiv, inputColor);
  renderBotones(preciosBase, preciosDiv, inputPrecio, '$');
  renderBotones(lavadoresBase, lavadoresDiv, inputLavador);
}

// Llamar una vez al cargar la página
cargarTodoDesdeStorage();

 
  
  // ==================================================
  // 🛠️ 4. GESTIÓN DE FORMULARIO
  // ==================================================
  function abrirFormulario() {
    formulario.classList.add('activo');
    overlayRegistro.classList.add('activo');
    btnNuevo.textContent = '✕ Cerrar';
  }
  
  function cerrarFormulario() {
    formulario.classList.remove('activo');
    overlayRegistro.classList.remove('activo');
    btnNuevo.textContent = '+ Registro';
    registroForm.reset();
    filaEditando = null;
    desactivarBotonesActivos();
  }
  
  btnNuevo.addEventListener('click', () => {
    const abierto = formulario.classList.contains('activo');
    abierto ? cerrarFormulario() : abrirFormulario();
  });
  
  btnCerrarFormulario.addEventListener('click', cerrarFormulario);
  overlayRegistro.addEventListener('click', cerrarFormulario);
  
  
  // ==================================================
  // 📤 5. ENVÍO DE REGISTRO AL BACKEND
  // ==================================================
  registroForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const nuevoRegistro = {
      placa: inputPlaca.value.trim().toUpperCase(),
      marca: inputMarca.value,
      modelo: inputModelo.value,
      color: inputColor.value,
      precio: inputPrecio.value,
      lavador: inputLavador.value
    };
  
    const url = filaEditando
      ? `https://sistema-2025-backend.onrender.com/api/registros/${filaEditando}`
      : 'https://sistema-2025-backend.onrender.com/api/registros';
  
    const metodo = filaEditando ? 'PUT' : 'POST';
  
    fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoRegistro)
    })
    .then(res => res.json())
    .then(() => {
      mostrarRegistrosDelServidor();
      cerrarFormulario();
    })
    .catch(err => {
      console.error('Error al guardar en backend:', err);
    });
  });
  
  
  // ==================================================
  // 🧩 6. AGREGAR Y EDITAR OPCIONES (MARCAS, MODELOS, COLORES, PRECIOS, LAVADORES)
  // ==================================================
  
  // === Marcas ===
  document.getElementById('btnAgregarMarca').addEventListener('click', () => {
    const nuevaMarca = prompt('Escribe el nombre de la nueva marca:');
    if (nuevaMarca && nuevaMarca.trim() !== '') {
      if (opciones[nuevaMarca]) {
        alert('Esa marca ya existe.');
      } else {
        opciones[nuevaMarca] = [];
        guardarLocal('opciones', opciones);
        renderBotones(Object.keys(opciones), marcasDiv, inputMarca);
      }
    }
  });
  
  document.getElementById('btnEditarMarca').addEventListener('click', () => {
    const marcaEditar = prompt('¿Qué marca quieres editar?');
    if (marcaEditar && opciones[marcaEditar]) {
      const nuevoNombre = prompt(`Nuevo nombre para ${marcaEditar}:`);
      if (nuevoNombre && nuevoNombre.trim() !== '') {
        opciones[nuevoNombre] = opciones[marcaEditar];
        delete opciones[marcaEditar];
        guardarLocal('opciones', opciones);
        renderBotones(Object.keys(opciones), marcasDiv, inputMarca);
      }
    } else {
      alert('Esa marca no existe.');
    }
  });
  
  // === Modelos ===
  document.getElementById('btnAgregarModelo').addEventListener('click', () => {
    const botonActivo = marcasDiv.querySelector('button.activo');
    const marcaSeleccionada = botonActivo ? botonActivo.textContent.trim() : '';
  
    if (!marcaSeleccionada) {
      alert('Primero selecciona una marca antes de agregar un modelo.');
      return;
    }
  
    const nuevoModelo = prompt(`Nuevo modelo para ${marcaSeleccionada}:`);
    if (!nuevoModelo || nuevoModelo.trim() === '') return;
  
    const modeloLimpio = nuevoModelo.trim();
  
    if (!opciones[marcaSeleccionada]) {
      opciones[marcaSeleccionada] = [];
    }
  
    if (!opciones[marcaSeleccionada].includes(modeloLimpio)) {
      opciones[marcaSeleccionada].push(modeloLimpio);
      guardarLocal('opciones', opciones);
      renderBotones(opciones[marcaSeleccionada], modelosDiv, inputModelo);
    } else {
      alert('Ese modelo ya existe.');
    }
  });
  
  
  
  
  // === Colores ===
  document.getElementById('btnAgregarColor').addEventListener('click', () => {
    const nuevoColor = prompt('Nuevo color:');
    if (nuevoColor && nuevoColor.trim() !== '') {
      if (coloresBase.includes(nuevoColor)) {
        return alert('Ese color ya existe.');
      }
      coloresBase.push(nuevoColor);
      guardarLocal('coloresBase', coloresBase);
      renderBotones(coloresBase, coloresDiv, inputColor);
    }
  });
  
  document.getElementById('btnEditarColores').addEventListener('click', () => {
    const colorEditar = prompt('¿Qué color quieres editar?');
    if (colorEditar && coloresBase.includes(colorEditar)) {
      const nuevoNombre = prompt(`Nuevo nombre para ${colorEditar}:`);
      if (nuevoNombre && nuevoNombre.trim() !== '') {
        const index = coloresBase.indexOf(colorEditar);
        coloresBase[index] = nuevoNombre;
        guardarLocal('coloresBase', coloresBase);
        renderBotones(coloresBase, coloresDiv, inputColor);
      }
    } else {
      alert('Ese color no existe.');
    }
  });
  
  // === Precios ===
  document.getElementById('btnAgregarPrecio').addEventListener('click', () => {
    const nuevoPrecio = prompt('Nuevo precio:');
    if (nuevoPrecio && nuevoPrecio.trim() !== '') {
      if (preciosBase.includes(nuevoPrecio)) {
        return alert('Ese precio ya existe.');
      }
      preciosBase.push(nuevoPrecio);
      guardarLocal('preciosBase', preciosBase);
      renderBotones(preciosBase, preciosDiv, inputPrecio, '$');
    }
  });
  
  document.getElementById('btnEditarPrecios').addEventListener('click', () => {
    const precioEditar = prompt('¿Qué precio quieres editar? (sin el $)');
    if (precioEditar && preciosBase.includes(precioEditar)) {
      const nuevoValor = prompt(`Nuevo valor para ${precioEditar}:`);
      if (nuevoValor && nuevoValor.trim() !== '') {
        const index = preciosBase.indexOf(precioEditar);
        preciosBase[index] = nuevoValor;
        guardarLocal('preciosBase', preciosBase);
        renderBotones(preciosBase, preciosDiv, inputPrecio, '$');
      }
    } else {
      alert('Ese precio no existe.');
    }
  });
  
  // === Lavadores ===
  document.getElementById('btnAgregarLavador').addEventListener('click', () => {
    const nuevoLavador = prompt('Nuevo lavador:');
    if (nuevoLavador && nuevoLavador.trim() !== '') {
      if (lavadoresBase.includes(nuevoLavador)) {
        return alert('Ese lavador ya existe.');
      }
      lavadoresBase.push(nuevoLavador);
      guardarLocal('lavadoresBase', lavadoresBase);
      renderBotones(lavadoresBase, lavadoresDiv, inputLavador);
    }
  });
  
  document.getElementById('btnEditarLavadores').addEventListener('click', () => {
    const lavadorEditar = prompt('¿Qué lavador quieres editar?');
    if (lavadorEditar && lavadoresBase.includes(lavadorEditar)) {
      const nuevoNombre = prompt(`Nuevo nombre para ${lavadorEditar}:`);
      if (nuevoNombre && nuevoNombre.trim() !== '') {
        const index = lavadoresBase.indexOf(lavadorEditar);
        lavadoresBase[index] = nuevoNombre;
        guardarLocal('lavadoresBase', lavadoresBase);
        renderBotones(lavadoresBase, lavadoresDiv, inputLavador);
      }
    } else {
      alert('Ese lavador no existe.');
    }
  });
  
  // ==================================================
  // 🗂️ 7. TABLA DE REGISTROS Y EDICIÓN/ELIMINACIÓN
  // ==================================================
  
  function mostrarRegistros(datos) {
    registroBody.innerHTML = '';
  
    datos.forEach((r, index) => {
      const indexReal = registrosGuardados.indexOf(r);
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${index + 1}</td>
        <td>${r.placa}</td>
        <td>${r.marca}</td>
        <td>${r.modelo}</td>
        <td>${r.color}</td>
        <td>$${r.precio}</td>
        <td>${r.lavador}</td>
        <td>${new Date(r.fecha).toLocaleString('es-MX', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        })} hrs</td>
        <td><button class="btn-editar">Editar</button><button class="btn-eliminar">Eliminar</button></td>
      `;
      fila.dataset.id = r._id;
      registroBody.appendChild(fila);
    });
  }
  
  registroBody.addEventListener('click', async (e) => {
    const fila = e.target.closest('tr');
    const id = fila.dataset.id;
  
    if (e.target.classList.contains('btn-editar')) {
      try {
        const res = await fetch(`https://sistema-2025-backend.onrender.com/api/registros`);
        const registros = await res.json();
        const registro = registros.find(r => r._id === id);
  
        inputPlaca.value = registro.placa;
        inputMarca.value = registro.marca;
        inputModelo.value = registro.modelo;
        inputColor.value = registro.color;
        inputPrecio.value = registro.precio;
        inputLavador.value = registro.lavador;
  
        activarBoton(marcasDiv, registro.marca);
        if (!opciones[registro.marca]) opciones[registro.marca] = [];
        renderBotones(opciones[registro.marca], modelosDiv, inputModelo);
        activarBoton(modelosDiv, registro.modelo);
        activarBoton(coloresDiv, registro.color);
        activarBoton(preciosDiv, `$${registro.precio}`);
        activarBoton(lavadoresDiv, registro.lavador);
  
        filaEditando = id;
        abrirFormulario();
      } catch (error) {
        console.error('Error al cargar registro para editar:', error);
      }
    }
  
    if (e.target.classList.contains('btn-eliminar')) {
      if (confirm('¿Eliminar este registro?')) {
        try {
          await fetch(`https://sistema-2025-backend.onrender.com/api/registros/${id}`, {
            method: 'DELETE'
          });
          mostrarRegistrosDelServidor();
        } catch (error) {
          console.error('Error al eliminar registro:', error);
        }
      }
    }
  }
  );
  
  // ==================================================
  // 🔍 8. FILTROS AVANZADOS
  // ==================================================
  
  btnAplicarFiltros.addEventListener('click', () => {
    fetch('https://sistema-2025-backend.onrender.com/api/registros')
      .then(res => res.json())
      .then(registros => {
        const placa = filtroPlaca.value.trim().toLowerCase();
        const desde = filtroFechaInicio.value ? new Date(filtroFechaInicio.value) : null;
        const hasta = filtroFechaFin.value ? new Date(filtroFechaFin.value) : null;
        if (hasta) hasta.setHours(23, 59, 59, 999);
  
        const lavador = filtroLavador.value.trim().toLowerCase();
        const marca = filtroMarca.value.trim().toLowerCase();
        const modelo = filtroModelo.value.trim().toLowerCase();
        const color = filtroColor.value.trim().toLowerCase();
        const precioMin = filtroPrecioMin.value ? parseFloat(filtroPrecioMin.value) : null;
        const precioMax = filtroPrecioMax.value ? parseFloat(filtroPrecioMax.value) : null;
  
        const filtrados = registros.filter(reg => {
          const fecha = new Date(reg.fecha);
          return (
            (!placa || reg.placa.toLowerCase().includes(placa)) &&
            (!desde || fecha >= desde) &&
            (!hasta || fecha <= hasta) &&
            (!lavador || reg.lavador.toLowerCase().includes(lavador)) &&
            (!marca || reg.marca.toLowerCase().includes(marca)) &&
            (!modelo || reg.modelo.toLowerCase().includes(modelo)) &&
            (!color || reg.color.toLowerCase().includes(color)) &&
            (!precioMin || parseFloat(reg.precio) >= precioMin) &&
            (!precioMax || parseFloat(reg.precio) <= precioMax)
          );
        });
  
        resultadoFiltros.textContent = `${filtrados.length} resultado(s)`;
        mostrarRegistros(filtrados);
      })
      .catch(err => {
        console.error('Error al aplicar filtros:', err);
      });
  });
  
  // ✅ Limpiar filtros y mostrar todos los de hoy
  document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
    filtroPlaca.value = '';
    filtroFechaInicio.value = '';
    filtroFechaFin.value = '';
    filtroLavador.value = '';
    filtroMarca.value = '';
    filtroModelo.value = '';
    filtroColor.value = '';
    filtroPrecioMin.value = '';
    filtroPrecioMax.value = '';
    resultadoFiltros.textContent = '';
    mostrarRegistrosDelServidor();
  });
  
  btnToggleFiltros.addEventListener('click', () => {
    panelFiltros.classList.add('activo');
    overlay.classList.add('activo');
  });
  
  btnCerrarFiltros.addEventListener('click', () => {
    panelFiltros.classList.remove('activo');
    overlay.classList.remove('activo');
  });
  
  overlay.addEventListener('click', () => {
    panelFiltros.classList.remove('activo');
    overlay.classList.remove('activo');
  });
  
  // ==================================================
  // 🚘 9. AUTOCOMPLETADO DE PLACAS
  // ==================================================
  
  inputPlaca.addEventListener('change', () => {
    const entrada = inputPlaca.value.trim().toUpperCase();
    const coincidencia = [...registrosGuardados].reverse().find(r => r.placa === entrada);
  
    if (coincidencia) {
      inputMarca.value = coincidencia.marca;
      inputModelo.value = coincidencia.modelo;
      inputColor.value = coincidencia.color;
  
      seleccionarBoton('marca', coincidencia.marca);
      seleccionarBoton('modelo', coincidencia.modelo);
      seleccionarBoton('color', coincidencia.color);
    } else {
      const existente = basePlacas.find(p => p.placa === entrada);
      if (existente) {
        inputMarca.value = existente.marca;
        inputModelo.value = existente.modelo;
        inputColor.value = existente.color;
  
        seleccionarBoton('marca', existente.marca);
        seleccionarBoton('modelo', existente.modelo);
        seleccionarBoton('color', existente.color);
      }
    }
  });
  
  const sugerenciasPlaca = document.getElementById('sugerenciasPlaca');
  
  inputPlaca.addEventListener('input', () => {
    const texto = inputPlaca.value.trim().toUpperCase();
    sugerenciasPlaca.innerHTML = '';
  
    if (texto.length < 2) return;
  
    const sugerencias = [...new Set(registrosGuardados.map(r => r.placa))].filter(placa =>
      placa.startsWith(texto)
    );
  
    sugerencias.forEach(placa => {
      const li = document.createElement('li');
      li.textContent = placa;
      li.addEventListener('click', () => {
        inputPlaca.value = placa;
        sugerenciasPlaca.innerHTML = '';
        inputPlaca.dispatchEvent(new Event('change'));
      });
      sugerenciasPlaca.appendChild(li);
    });
  });
  
  document.addEventListener('click', (e) => {
    if (!sugerenciasPlaca.contains(e.target) && e.target !== inputPlaca) {
      sugerenciasPlaca.innerHTML = '';
    }
  });
  
  // ==================================================
  // 🧠 10. RESUMEN DEL DÍA Y CARGA INICIAL
  // ==================================================
  
  function actualizarResumen(registros) {
    const resumen = document.getElementById('resumenDia');
    if (!resumen || registros.length === 0) {
      resumen.innerHTML = '';
      return;
    }
    const filas = registros.map(r => {
      const hora = new Date(r.fecha).toLocaleTimeString('es-MX', {
        hour: '2-digit', minute: '2-digit'
      });
      return `
        <tr>
          <td>${r.marca} ${r.modelo}</td>
          <td>${r.color}</td>
          <td>$${r.precio}</td>
          <td>${hora}</td>
        </tr>
      `;
    }).join('');
    resumen.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Auto</th>
            <th>Color</th>
            <th>Precio</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
        </tbody>
      </table>
    `;
  }
  
  function mostrarRegistrosDelServidor() {
    fetch('https://sistema-2025-backend.onrender.com/api/registros')
      .then(res => res.json())
      .then(datos => {
        registrosGuardados = datos;
        const soloHoy = datos.filter(r => esDeHoy(r.fecha));
        mostrarRegistros(soloHoy);
        actualizarResumen(soloHoy);
      })
      .catch(err => console.error('Error al cargar registros:', err));
  }
  

    // ✅ Mostrar solo registros del día al iniciar
    mostrarRegistrosDelServidor();
  
    // ✅ Leer placa enviada desde OCR
    const placaOCR = localStorage.getItem('placaDetectadaOCR');
    if (placaOCR) {
      agregarPlacaPendiente(placaOCR);
      localStorage.removeItem('placaDetectadaOCR');
    }
  
  }); // ← Aquí se cierra correctamente el DOMContentLoaded
  
  // 🧩 Función global (fuera del DOMContentLoaded)
  function agregarPlacaPendiente(placaDetectada) {
    let contenedor = document.getElementById('pendientesRegistro');
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = "pendientesRegistro";
      contenedor.innerHTML = `<h3>🚗 Pendientes por registrar</h3>`;
      document.querySelector(".contenido-principal").prepend(contenedor);
    }
  
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('grupo');
    tarjeta.innerHTML = `
      <strong>${placaDetectada.toUpperCase()}</strong><br>
      <small>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small><br>
      <button class="btn-primario" data-placa="${placaDetectada}">Registrar</button>
    `;
    contenedor.appendChild(tarjeta);
  
    tarjeta.querySelector('button').addEventListener('click', () => {
      inputPlaca.value = placaDetectada.toUpperCase();
  
      fetch('placas.json')
        .then(res => res.json())
        .then(data => {
          const encontrado = data.find(p => p.placa.toLowerCase() === placaDetectada.toLowerCase());
          if (encontrado) {
            seleccionarBoton('marca', encontrado.marca);
            seleccionarBoton('modelo', encontrado.modelo);
            seleccionarBoton('color', encontrado.color);
          }
        });
  
      abrirFormulario();
    });
  }
  
  
  
  