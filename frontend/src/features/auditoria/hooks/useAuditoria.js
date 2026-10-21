import { useEffect, useRef, useState } from 'react';

import { formatearFechaHora, calcularDiasAbarcados } from '../../../shared/utils/formatoFecha.js';
import { obtenerTonoModulo } from '../../../shared/constants/tonosModulo.js';
import { obtenerMensajeRangoFechas } from '../../../shared/utils/rangoFechas.js';
import {
  listarRegistrosAuditoria,
  obtenerResumenAuditoria,
  obtenerHistorialElemento
} from '../services/auditoriaService.js';
import { obtenerEtiquetaCategoria, obtenerEtiquetaRol } from '../constants/categoriasAuditoria.js';

const CATEGORIA_TODOS = 'TODOS';
const RETRASO_BUSQUEDA_MS = 300;

const FORMATEADOR_HORA_SEGUNDOS = new Intl.DateTimeFormat('es-PE', {
  // TODO(pregunta): confirmar zona horaria con backend (igual que shared/utils/formatoFecha.js).
  timeZone: 'America/Lima',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

/**
 * Primera letra de cada una de las dos primeras palabras del nombre, en mayúsculas.
 * Con una sola palabra, solo su primera letra (docs/planes/auditorias.md §6.2).
 *
 * @param {string} nombre
 * @returns {string}
 */
function derivarIniciales(nombre) {
  const palabras = (nombre ?? '').trim().split(/\s+/).filter(Boolean);

  if (palabras.length === 0) {
    return '';
  }
  if (palabras.length === 1) {
    return palabras[0].charAt(0).toUpperCase();
  }
  return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
}

/**
 * Transforma un registro de la API (§8 del plan) en el modelo de vista `RegistroVista`
 * que consumen los componentes (§6.2 del plan). Los componentes no formatean nada.
 *
 * @param {Object} registroApi
 * @returns {Object} RegistroVista
 */
function transformarRegistro(registroApi) {
  const { fecha, hora } = formatearFechaHora(registroApi.fechaHora);
  const horaConSegundos = FORMATEADOR_HORA_SEGUNDOS.format(new Date(registroApi.fechaHora));

  return {
    id: registroApi.id,
    // LAB05: reemplaza a `idTransaccion`. Clave opaca del elemento afectado (el mismo
    // pago, nota, bloque horario, usuario…), con la que se pide el historial (§6.2, §8.3).
    idElemento: registroApi.idElemento,
    fechaHoraIso: registroApi.fechaHora,
    fecha,
    hora,
    fechaHoraCompleta: `${fecha} ${horaConSegundos}`,
    usuario: {
      nombre: registroApi.usuario.nombre,
      rol: obtenerEtiquetaRol(registroApi.usuario.rol),
      iniciales: derivarIniciales(registroApi.usuario.nombre)
    },
    modulo: {
      codigo: registroApi.categoria,
      etiqueta: obtenerEtiquetaCategoria(registroApi.categoria),
      tono: obtenerTonoModulo(registroApi.categoria)
    },
    tipoTransaccion: registroApi.tipoTransaccion,
    valoresAntes: registroApi.valoresAntes,
    valoresDespues: registroApi.valoresDespues
  };
}

/**
 * Orden defensivo y estable por `fechaHoraIso` (docs/planes/auditorias.md §6.2):
 * aunque el backend ya ordena, el hook no asume que siempre lo haga bien.
 */
function ordenarDescendentePorFecha(lista) {
  return [...lista].sort((a, b) => new Date(b.fechaHoraIso) - new Date(a.fechaHoraIso));
}

function ordenarAscendentePorFecha(lista) {
  return [...lista].sort((a, b) => new Date(a.fechaHoraIso) - new Date(b.fechaHoraIso));
}

/**
 * Lógica de la página de Auditorías: carga el listado y el resumen, aplica
 * filtro por categoría, búsqueda y rango de fechas (en servidor, LAB05), y
 * gestiona el panel de detalle con el historial del elemento afectado.
 * Ver docs/planes/auditorias.md §6.
 *
 * @returns {Object} Ver docs/planes/auditorias.md §6.1 para la forma completa.
 */
export default function useAuditoria() {
  const [registros, establecerRegistros] = useState([]);
  const [estado, establecerEstado] = useState('cargando');
  const [actualizando, establecerActualizando] = useState(false);
  const [resumen, establecerResumen] = useState(null);
  const [categoria, establecerCategoriaEstado] = useState(CATEGORIA_TODOS);
  const [busqueda, establecerBusquedaEstado] = useState('');
  const [tipoTransaccion, establecerTipoTransaccionEstado] = useState('');
  const [fechaDesde, establecerFechaDesdeEstado] = useState('');
  const [fechaHasta, establecerFechaHastaEstado] = useState('');

  const [detalleRegistro, establecerDetalleRegistro] = useState(null);
  const [historial, establecerHistorial] = useState({ estado: 'listo', registros: [] });

  const secuenciaListadoRef = useRef(0);
  const cargaInicialCompletaRef = useRef(false);
  const temporizadorBusquedaRef = useRef(null);
  const secuenciaHistorialRef = useRef(0);
  const elementoOrigenRef = useRef(null);
  // (LAB05) Último rango de fechas válido aplicado: chip, búsqueda y `reintentar`
  // siempre consultan con este rango, nunca con uno inválido (docs/planes/auditorias.md §6.3).
  const rangoAplicadoRef = useRef({ fechaDesde: '', fechaHasta: '' });
  // Filtro explícito por tipo de transacción (D2/D14): se aplica de inmediato, como el chip.
  const tipoTransaccionRef = useRef('');

  const mensajeErrorRango = obtenerMensajeRangoFechas(fechaDesde, fechaHasta);

  /**
   * Pide el listado (y el resumen, si aún no se cargó con éxito) con los filtros
   * indicados. Descarta la respuesta si ya no es la última solicitud en curso
   * (docs/planes/auditorias.md §6.3, pasos 1, 5 y 6).
   *
   * El resumen se pide mientras `cargaInicialCompletaRef` siga en `false` (en vez de
   * depender de "es la primera llamada"), para que si el usuario cambia el filtro
   * antes de que la carga inicial responda, la siguiente llamada que gane la carrera
   * siga trayendo el resumen y no se quede sin él.
   */
  async function cargarListado(categoriaActual, busquedaActual, rangoActual, tipoTransaccionActual) {
    const idSolicitud = (secuenciaListadoRef.current += 1);
    const necesitaResumen = !cargaInicialCompletaRef.current;

    if (necesitaResumen) {
      establecerEstado('cargando');
    } else {
      establecerActualizando(true);
    }

    const filtros = {
      categoria: categoriaActual === CATEGORIA_TODOS ? null : categoriaActual,
      busqueda: busquedaActual,
      fechaDesde: rangoActual.fechaDesde,
      fechaHasta: rangoActual.fechaHasta,
      tipoTransaccion: tipoTransaccionActual || ''
    };

    const [resultadoListado, resultadoResumen] = await Promise.all([
      listarRegistrosAuditoria(filtros),
      necesitaResumen ? obtenerResumenAuditoria() : Promise.resolve(null)
    ]);

    if (idSolicitud !== secuenciaListadoRef.current) {
      return;
    }

    if (!resultadoListado.exitoso || (necesitaResumen && !resultadoResumen.exitoso)) {
      establecerEstado('error');
      establecerActualizando(false);
      return;
    }

    const registrosVista = ordenarDescendentePorFecha(
      (resultadoListado.datos ?? []).map(transformarRegistro)
    );
    establecerRegistros(registrosVista);

    if (necesitaResumen) {
      const datosResumen = resultadoResumen.datos;
      establecerResumen({
        totalAcciones: datosResumen.totalAcciones,
        modulosActivos: datosResumen.modulosActivos,
        usuariosUnicos: datosResumen.usuariosUnicos,
        diasCubiertos: calcularDiasAbarcados([
          datosResumen.fechaPrimerRegistro,
          datosResumen.fechaUltimoRegistro
        ])
      });
      cargaInicialCompletaRef.current = true;
    }

    establecerEstado('listo');
    establecerActualizando(false);
  }

  useEffect(() => {
    cargarListado(CATEGORIA_TODOS, '', rangoAplicadoRef.current, tipoTransaccionRef.current);

    return () => {
      if (temporizadorBusquedaRef.current) {
        clearTimeout(temporizadorBusquedaRef.current);
      }
    };
    // Carga inicial: se ejecuta una sola vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Cambia la categoría activa y refiltra de inmediato (sin debounce).
   *
   * @param {string} valor
   */
  function establecerCategoria(valor) {
    establecerCategoriaEstado(valor);
    cargarListado(valor, busqueda.trim(), rangoAplicadoRef.current, tipoTransaccionRef.current);
  }

  /**
   * (D2/D14) Cambia el tipo de transacción activo y refiltra de inmediato (sin
   * debounce), igual que el chip de categoría. Se combina con Y con los demás filtros.
   *
   * @param {string} valor Tipo de transacción exacto, o `''` para "Todos los tipos".
   */
  function establecerTipoTransaccion(valor) {
    establecerTipoTransaccionEstado(valor);
    tipoTransaccionRef.current = valor;
    cargarListado(categoria, busqueda.trim(), rangoAplicadoRef.current, valor);
  }

  /**
   * Actualiza el texto de búsqueda en cada tecla (campo controlado) y refiltra
   * 300 ms después de que el usuario deja de escribir (docs/planes/auditorias.md §6.3).
   *
   * @param {string} texto
   */
  function establecerBusqueda(texto) {
    establecerBusquedaEstado(texto);

    if (temporizadorBusquedaRef.current) {
      clearTimeout(temporizadorBusquedaRef.current);
    }

    temporizadorBusquedaRef.current = setTimeout(() => {
      cargarListado(categoria, texto.trim(), rangoAplicadoRef.current, tipoTransaccionRef.current);
    }, RETRASO_BUSQUEDA_MS);
  }

  /**
   * (LAB05) Actualiza el input "Desde" y, si el rango resultante es válido, lo
   * aplica y refiltra de inmediato (docs/planes/auditorias.md §6.3, paso 3b).
   *
   * @param {string} valor `'AAAA-MM-DD'` o `''`.
   */
  function establecerFechaDesde(valor) {
    establecerFechaDesdeEstado(valor);

    const mensaje = obtenerMensajeRangoFechas(valor, fechaHasta);
    if (mensaje === '') {
      const rango = { fechaDesde: valor, fechaHasta };
      rangoAplicadoRef.current = rango;
      cargarListado(categoria, busqueda.trim(), rango, tipoTransaccionRef.current);
    }
  }

  /**
   * (LAB05) Actualiza el input "Hasta" y, si el rango resultante es válido, lo
   * aplica y refiltra de inmediato (docs/planes/auditorias.md §6.3, paso 3b).
   *
   * @param {string} valor `'AAAA-MM-DD'` o `''`.
   */
  function establecerFechaHasta(valor) {
    establecerFechaHastaEstado(valor);

    const mensaje = obtenerMensajeRangoFechas(fechaDesde, valor);
    if (mensaje === '') {
      const rango = { fechaDesde, fechaHasta: valor };
      rangoAplicadoRef.current = rango;
      cargarListado(categoria, busqueda.trim(), rango, tipoTransaccionRef.current);
    }
  }

  /**
   * Repite la consulta con los filtros vigentes (incluido el último rango de
   * fechas válido). Si el resumen nunca llegó a cargarse con éxito, `cargarListado`
   * lo vuelve a pedir también.
   */
  function reintentar() {
    cargarListado(categoria, busqueda.trim(), rangoAplicadoRef.current, tipoTransaccionRef.current);
  }

  /**
   * Pide el historial del mismo elemento (LAB05). El historial se pide siempre al
   * servicio, sin reutilizar el listado, porque este puede estar filtrado
   * (docs/planes/auditorias.md §6.3, paso 7), y no aplica los filtros del listado.
   */
  async function cargarHistorial(idElemento) {
    const idSolicitud = (secuenciaHistorialRef.current += 1);
    establecerHistorial({ estado: 'cargando', registros: [] });

    const resultado = await obtenerHistorialElemento(idElemento);

    if (idSolicitud !== secuenciaHistorialRef.current) {
      return;
    }

    if (!resultado.exitoso) {
      establecerHistorial({ estado: 'error', registros: [] });
      return;
    }

    const registrosVista = ordenarAscendentePorFecha((resultado.datos ?? []).map(transformarRegistro));
    establecerHistorial({ estado: 'listo', registros: registrosVista });
  }

  /**
   * Abre el panel de detalle de un registro y pide el historial de su elemento.
   *
   * @param {Object} registro RegistroVista.
   * @param {HTMLElement} elementoOrigen Elemento al que se devuelve el foco al cerrar.
   */
  function abrir(registro, elementoOrigen) {
    elementoOrigenRef.current = elementoOrigen ?? null;
    establecerDetalleRegistro(registro);
    cargarHistorial(registro.idElemento);
  }

  /**
   * Cierra el panel de detalle, descarta cualquier respuesta pendiente del
   * historial y devuelve el foco al elemento de origen si sigue en el DOM.
   */
  function cerrar() {
    secuenciaHistorialRef.current += 1;
    establecerDetalleRegistro(null);

    const elementoOrigen = elementoOrigenRef.current;
    if (elementoOrigen && document.contains(elementoOrigen)) {
      elementoOrigen.focus();
    }
    elementoOrigenRef.current = null;
  }

  function reintentarHistorial() {
    if (detalleRegistro) {
      cargarHistorial(detalleRegistro.idElemento);
    }
  }

  return {
    registros,
    estado,
    actualizando,
    resumen,
    mostrandoAhora: registros.length,
    categoria,
    establecerCategoria,
    busqueda,
    establecerBusqueda,
    tipoTransaccion,
    establecerTipoTransaccion,
    fechaDesde,
    establecerFechaDesde,
    fechaHasta,
    establecerFechaHasta,
    mensajeErrorRango,
    reintentar,
    detalle: {
      registro: detalleRegistro,
      historial,
      abrir,
      cerrar,
      reintentarHistorial
    }
  };
}
