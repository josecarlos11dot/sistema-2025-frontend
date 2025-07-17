
document.addEventListener('DOMContentLoaded', () => {
// === ELEMENTOS GLOBALES ===
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
// === cerrar formulario ===
btnCerrarFormulario.addEventListener('click', () => {
  formulario.classList.remove('activo');
  overlayRegistro.classList.remove('activo');
  btnNuevo.textContent = '+ Registro'; // ✅ Esto actualiza el botón de nuevo
});


// === BASES Y LOCALSTORAGE ===
let basePlacas = [];
let registrosGuardados = []; // ahora los datos se cargan desde el servidor
let filaEditando = null;

let opciones = JSON.parse(localStorage.getItem('opciones')) || {
  Mazda: ['CX-30', 'CX-5', 'Mazda 3'],
  Toyota: ['Corolla', 'Hilux', 'Yaris'],
  Nissan: ['Sentra', 'Versa', 'NP300'],
};
let coloresBase = JSON.parse(localStorage.getItem('coloresBase')) || ['Blanco', 'Negro', 'Rojo'];
let preciosBase = JSON.parse(localStorage.getItem('preciosBase')) || ['100', '120', '200'];
let lavadoresBase = JSON.parse(localStorage.getItem('lavadoresBase')) || ['Luis', 'Ana', 'Pedro'];

// === UTILIDADES ===
const abrirFormulario = () => {
  formulario.classList.add('activo');
  overlayRegistro.classList.add('activo');
  btnNuevo.textContent = '✕ Cerrar';
};
const cerrarFormulario = () => {
  formulario.classList.remove('activo');
  overlayRegistro.classList.remove('activo');
  btnNuevo.textContent = '+ Registro';
  registroForm.reset();
  filaEditando = null;
};
const activarBoton = (contenedor, valor) => {
  [...contenedor.children].forEach(b => b.classList.toggle('activo', b.textContent === valor || b.textContent === `$${valor}`));
};
const guardarLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const parseFecha = (texto) => {
  const partes = texto.split('/');
  return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
};

// === FUNCION PARA SABER SI UN REGISTRO ES DE HOY ===
const esDeHoy = (fechaStr) => {
  const hoy = new Date();
  const fecha = new Date(fechaStr);
  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
};
// === GUARDAR REGISTRO EN BACKEND ===
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

  // Si estás editando, usa PUT y la URL con ID
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



// === RENDERIZAR OPCIONES COMO BOTONES ===
const renderBotones = (arr, contenedor, inputHidden, prefijo = '') => {
  contenedor.innerHTML = '';
  arr.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';  
    btn.textContent = prefijo + item;
    btn.className = 'btn-opcion';
    btn.addEventListener('click', () => {
      inputHidden.value = item;
      activarBoton(contenedor, btn.textContent);
    });
    contenedor.appendChild(btn);
  });
};

renderBotones(Object.keys(opciones), marcasDiv, inputMarca);
renderBotones(coloresBase, coloresDiv, inputColor);
renderBotones(preciosBase, preciosDiv, inputPrecio, '$');
renderBotones(lavadoresBase, lavadoresDiv, inputLavador);

inputMarca.addEventListener('change', () => {
  const modelos = opciones[inputMarca.value] || [];
  renderBotones(modelos, modelosDiv, inputModelo);
});

marcasDiv.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const marca = e.target.textContent;
    inputMarca.value = marca;
    activarBoton(marcasDiv, marca);
    renderBotones(opciones[marca] || [], modelosDiv, inputModelo);
    btnAgregarModelo.disabled = false;
    btnEditarModelo.disabled = false;
  }
});
// === AGREGAR Y EDITAR MARCAS ===
document.getElementById('btnAgregarMarca').addEventListener('click', () => {
  const nuevaMarca = prompt('Escribe el nombre de la nueva marca:');
  if (nuevaMarca && nuevaMarca.trim() !== '') {
    if (opciones[nuevaMarca]) {
      alert('Esa marca ya existe.');
    } else {
      opciones[nuevaMarca] = []; // sin modelos por ahora
      guardarLocal('opciones', opciones); // guarda en localStorage
      renderBotones(Object.keys(opciones), marcasDiv, inputMarca); // refresca
    }
  }
});

document.getElementById('btnEditarMarca').addEventListener('click', () => {
  const marcaEditar = prompt('¿Qué marca quieres editar?');
  if (marcaEditar && opciones[marcaEditar]) {
    const nuevoNombre = prompt(`Nuevo nombre para ${marcaEditar}:`);
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      opciones[nuevoNombre] = opciones[marcaEditar]; // transfiere modelos
      delete opciones[marcaEditar]; // elimina la anterior
      guardarLocal('opciones', opciones); // guarda cambios
      renderBotones(Object.keys(opciones), marcasDiv, inputMarca); // refresca
    }
  } else {
    alert('Esa marca no existe.');
  }
});
// === AGREGAR Y EDITAR MODELOS ===
document.getElementById('btnAgregarModelo').addEventListener('click', () => {
  const marcaActual = inputMarca.value;
  if (!marcaActual) {
    return alert('Selecciona primero una marca antes de agregar un modelo.');
  }

  const nuevoModelo = prompt(`Escribe el nombre del nuevo modelo para ${marcaActual}:`);
  if (nuevoModelo && nuevoModelo.trim() !== '') {
    if (opciones[marcaActual].includes(nuevoModelo)) {
      return alert('Ese modelo ya existe para esta marca.');
    }
    opciones[marcaActual].push(nuevoModelo);
    guardarLocal('opciones', opciones); // guarda cambios
    renderBotones(opciones[marcaActual], modelosDiv, inputModelo); // refresca botones de modelos
  }
});

document.getElementById('btnEditarModelo').addEventListener('click', () => {
  const marcaActual = inputMarca.value;
  if (!marcaActual) {
    return alert('Selecciona primero una marca antes de editar un modelo.');
  }

  const modeloEditar = prompt(`¿Qué modelo de ${marcaActual} quieres editar?`);
  if (modeloEditar && opciones[marcaActual].includes(modeloEditar)) {
    const nuevoNombre = prompt(`Nuevo nombre para el modelo ${modeloEditar}:`);
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      const index = opciones[marcaActual].indexOf(modeloEditar);
      opciones[marcaActual][index] = nuevoNombre;
      guardarLocal('opciones', opciones); // guarda cambios
      renderBotones(opciones[marcaActual], modelosDiv, inputModelo); // refresca botones
    }
  } else {
    alert('Ese modelo no existe.');
  }
});
// === AGREGAR Y EDITAR COLORES ===
document.getElementById('btnAgregarColor').addEventListener('click', () => {
  const nuevoColor = prompt('Escribe el nombre del nuevo color:');
  if (nuevoColor && nuevoColor.trim() !== '') {
    if (coloresBase.includes(nuevoColor)) {
      return alert('Ese color ya existe.');
    }
    coloresBase.push(nuevoColor);
    guardarLocal('coloresBase', coloresBase); // guarda cambios
    renderBotones(coloresBase, coloresDiv, inputColor); // refresca botones
  }
});

document.getElementById('btnEditarColores').addEventListener('click', () => {
  const colorEditar = prompt('¿Qué color quieres editar?');
  if (colorEditar && coloresBase.includes(colorEditar)) {
    const nuevoNombre = prompt(`Nuevo nombre para ${colorEditar}:`);
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      const index = coloresBase.indexOf(colorEditar);
      coloresBase[index] = nuevoNombre;
      guardarLocal('coloresBase', coloresBase); // guarda cambios
      renderBotones(coloresBase, coloresDiv, inputColor); // refresca botones
    }
  } else {
    alert('Ese color no existe.');
  }
});
// === AGREGAR Y EDITAR PRECIOS ===
document.getElementById('btnAgregarPrecio').addEventListener('click', () => {
  const nuevoPrecio = prompt('Escribe el nuevo precio:');
  if (nuevoPrecio && nuevoPrecio.trim() !== '') {
    if (preciosBase.includes(nuevoPrecio)) {
      return alert('Ese precio ya existe.');
    }
    preciosBase.push(nuevoPrecio);
    guardarLocal('preciosBase', preciosBase); // guarda cambios
    renderBotones(preciosBase, preciosDiv, inputPrecio, '$'); // refresca botones
  }
});

document.getElementById('btnEditarPrecios').addEventListener('click', () => {
  const precioEditar = prompt('¿Qué precio quieres editar? (sin el $)');
  if (precioEditar && preciosBase.includes(precioEditar)) {
    const nuevoNombre = prompt(`Nuevo valor para el precio ${precioEditar}:`);
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      const index = preciosBase.indexOf(precioEditar);
      preciosBase[index] = nuevoNombre;
      guardarLocal('preciosBase', preciosBase); // guarda cambios
      renderBotones(preciosBase, preciosDiv, inputPrecio, '$'); // refresca botones
    }
  } else {
    alert('Ese precio no existe.');
  }
});
// === AGREGAR Y EDITAR LAVADORES ===
document.getElementById('btnAgregarLavador').addEventListener('click', () => {
  const nuevoLavador = prompt('Escribe el nombre del nuevo lavador:');
  if (nuevoLavador && nuevoLavador.trim() !== '') {
    if (lavadoresBase.includes(nuevoLavador)) {
      return alert('Ese lavador ya existe.');
    }
    lavadoresBase.push(nuevoLavador);
    guardarLocal('lavadoresBase', lavadoresBase); // guarda cambios
    renderBotones(lavadoresBase, lavadoresDiv, inputLavador); // refresca botones
  }
});

document.getElementById('btnEditarLavadores').addEventListener('click', () => {
  const lavadorEditar = prompt('¿Qué lavador quieres editar?');
  if (lavadorEditar && lavadoresBase.includes(lavadorEditar)) {
    const nuevoNombre = prompt(`Nuevo nombre para ${lavadorEditar}:`);
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      const index = lavadoresBase.indexOf(lavadorEditar);
      lavadoresBase[index] = nuevoNombre;
      guardarLocal('lavadoresBase', lavadoresBase); // guarda cambios
      renderBotones(lavadoresBase, lavadoresDiv, inputLavador); // refresca botones
    }
  } else {
    alert('Ese lavador no existe.');
  }
});


// === CARGAR JSON DE PLACAS ===
fetch('placas.json')
  .then(res => res.json())
  .then(data => (basePlacas = data))
  .catch(err => console.error('Error cargando placas:', err));

// === MOSTRAR REGISTROS EN LA TABLA ===
const mostrarRegistros = (datos) => {
  registroBody.innerHTML = '';

  datos.forEach((r, index) => {
    // Buscar el índice real por objeto (no por comparación exacta de texto)
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
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })} hrs</td>
      <td><button class="btn-editar">Editar</button><button class="btn-eliminar">Eliminar</button></td>
    `;

    fila.dataset.id = r._id; 
    registroBody.appendChild(fila);
  });
};

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
      if (!opciones[registro.marca]) {
        opciones[registro.marca] = [];
      }
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
});



// === APLICAR FILTROS ===
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


// === AUTOCOMPLETAR POR PLACA ===
inputPlaca.addEventListener('change', () => {
  const entrada = inputPlaca.value.trim().toUpperCase();

  // 1. Buscar en registros guardados por el usuario (último registro con esa placa)
  const coincidencia = [...registrosGuardados].reverse().find(r => r.placa === entrada);

  if (coincidencia) {
    inputMarca.value = coincidencia.marca;
    inputModelo.value = coincidencia.modelo;
    inputColor.value = coincidencia.color;

    activarBoton(marcasDiv, coincidencia.marca);
    renderBotones(opciones[coincidencia.marca] || [], modelosDiv, inputModelo);
    activarBoton(modelosDiv, coincidencia.modelo);
    activarBoton(coloresDiv, coincidencia.color);
  } else {
    // 2. Si no se encontró, buscar en basePlacas (placas.json)
    const existente = basePlacas.find(p => p.placa === entrada);
    if (existente) {
      inputMarca.value = existente.marca;
      inputModelo.value = existente.modelo;
      inputColor.value = existente.color;

      activarBoton(marcasDiv, existente.marca);
      renderBotones(opciones[existente.marca] || [], modelosDiv, inputModelo);
      activarBoton(modelosDiv, existente.modelo);
      activarBoton(coloresDiv, existente.color);
    }
  }
});
// === AUTOCOMPLETADO TIPO SUGERENCIAS PARA PLACAS ===
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
inputPlaca.addEventListener('change', () => {
  const placa = inputPlaca.value.toLowerCase().trim();

  fetch('placas.json')
    .then(response => response.json())
    .then(data => {
      const encontrado = data.find(auto => auto.placa === placa);
      if (encontrado) {
        seleccionarBoton('marca', encontrado.marca);
        seleccionarBoton('modelo', encontrado.modelo);
        seleccionarBoton('color', encontrado.color);
        console.log('Asociación encontrada:', encontrado);
      } else {
        console.log('Placa no encontrada en base');
      }
    })
    .catch(error => {
      console.error('Error al cargar placas.json:', error);
    });
});


// === ABRIR Y CERRAR PANELES ===
btnNuevo.addEventListener('click', () => {
  const abierto = formulario.classList.contains('activo');
  abierto ? cerrarFormulario() : abrirFormulario();
});
overlayRegistro.addEventListener('click', cerrarFormulario);

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


function actualizarResumen(registros) {
  const resumen = document.getElementById('resumenDia');

  if (!resumen || registros.length === 0) {
    resumen.innerHTML = '';
    return;
  }

  const filas = registros.map(r => {
    const hora = new Date(r.fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
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
      const soloHoy = datos.filter(r => esDeHoy(r.fecha));
      mostrarRegistros(soloHoy);
      actualizarResumen(soloHoy); // ✅ Aquí pasas los datos directamente
    })
    .catch(err => console.error('Error al cargar registros:', err));
}





// ✅ Mostrar solo registros del día al cargar la app
mostrarRegistrosDelServidor();

// ✅ Limpiar filtros y volver a mostrar solo los de hoy
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
function seleccionarBoton(grupo, valor) {
  const contenedor = document.getElementById(grupo + 's');
  const inputOculto = document.getElementById('input' + capitalizar(grupo));
  const valorNormalizado = valor.toLowerCase().trim();

  // Validar si el contenedor existe
  if (!contenedor || !inputOculto) {
    console.warn(`No se encontró el grupo: ${grupo}`);
    return;
  }

  let boton = [...contenedor.querySelectorAll('button')].find(
    b => b.textContent.toLowerCase().trim() === valorNormalizado
  );

  if (!boton) {
    // Crear botón si no existe
    boton = document.createElement('button');
    boton.classList.add('btn');
    boton.textContent = valor;

    // Estilo especial (opcional)
    if (grupo === 'color') boton.style.backgroundColor = valor;
    if (grupo === 'modelo') boton.classList.add('modelo-dinamico');

    contenedor.appendChild(boton);

    boton.addEventListener('click', () => {
      [...contenedor.querySelectorAll('button')].forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');
      inputOculto.value = valor;
    });
  }

  // Activar botón
  [...contenedor.querySelectorAll('button')].forEach(b => b.classList.remove('activo'));
  boton.classList.add('activo');
  inputOculto.value = valor;
}


function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}



});


