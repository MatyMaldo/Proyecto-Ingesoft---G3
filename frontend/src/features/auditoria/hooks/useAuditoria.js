import { useEffect, useRef, useState } from 'react';

import { formatearFechaHora, formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import { obtenerMensajeRangoFechas } from '../../../shared/utils/rangoFechas.js';
import {
  listarRegistrosAuditoria,
  obtenerHistorialAuditoria,
  obtenerRegistroAuditoria
} from '../services/auditoriaService.js';
import {
  normalizarCodigoCategoria,
  obtenerEtiquetaCategoria,
  obtenerEtiquetaRol
} from '../constants/categoriasAuditoria.js';
import { obtenerEtiquetaAccion, obtenerTonoAccion } from '../constants/tiposAccionAuditoria.js';

const CATEGORIA_TODOS = 'TODOS';
const RANGO_VACIO = Object.freeze({ fechaDesde: '', fechaHasta: '' });
const RETRASO_BUSQUEDA_MS = 300;

const FORMATEADOR_HORA_SEGUNDOS = new Intl.DateTimeFormat('es-PE', {
  // TODO(pregunta): confirmar zona horaria con backend (igual que shared/utils/formatoFecha.js).
  timeZone: 'America/Lima',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

function normalizarFechaHoraApi(fechaHora) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(fechaHora) ? fechaHora : `${fechaHora}-05:00`;
}

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
  const fechaHoraIso = normalizarFechaHoraApi(registroApi.fechaHora);
  const { fecha, hora } = formatearFechaHora(fechaHoraIso);
  const horaConSegundos = FORMATEADOR_HORA_SEGUNDOS.format(new Date(fechaHoraIso));
  const usuarioApi = registroApi.usuario ?? {};
  const usuarioId = usuarioApi.id ?? registroApi.usuarioId;
  const nombreApi = typeof usuarioApi.nombre === 'string' ? usuarioApi.nombre.trim() : '';
  const nombreUsuario = nombreApi
    || (usuarioId === undefined || usuarioId === null
      ? 'Sistema'
      : `Usuario #${usuarioId}`);
  const rolUsuario = usuarioApi.rol
    ?? (usuarioId === undefined || usuarioId === null ? 'SISTEMA' : null);
  const detalles = Array.isArray(registroApi.detalles) ? registroApi.detalles : [];
  const convertirDetalles = (campo) => detalles
    .map((detalle) => {
      const valor = detalle[campo];
      return {
        campo: detalle.campo,
        valor: valor === null || valor === undefined
          ? '—'
          : typeof valor === 'string'
            ? valor
            : JSON.stringify(valor)
      };
    });
  const valoresAntes = registroApi.valoresAntes ?? (detalles.length ? convertirDetalles('valorAnterior') : null);
  const valoresDespues = registroApi.valoresDespues ?? (detalles.length ? convertirDetalles('valorNuevo') : null);
  const entidad = registroApi.entidad;
  const entidadId = registroApi.entidadId;

  return {
    id: registroApi.id,
    idElemento: registroApi.idElemento ?? `${entidad ?? ''}-${entidadId ?? ''}`,
    entidad,
    entidadId,
    fechaHoraIso,
    fecha,
    hora,
    // Mismo formato de fecha que el listado (DD/MM/AAAA); en el detalle se añaden los segundos.
    fechaHoraCompleta: `${formatearFechaVisible(fecha)} ${horaConSegundos}`,
    usuario: {
      nombre: nombreUsuario,
      rol: rolUsuario ? obtenerEtiquetaRol(rolUsuario) : '',
      iniciales: derivarIniciales(nombreUsuario)
    },
    // El módulo es neutro (gris): el color de la tabla se reserva para la acción.
    modulo: {
      codigo: normalizarCodigoCategoria(registroApi.categoria),
      etiqueta: obtenerEtiquetaCategoria(registroApi.categoria),
      tono: 'gris'
    },
    accion: {
      codigo: registroApi.tipoAccion ?? registroApi.accion,
      etiqueta: obtenerEtiquetaAccion(registroApi.tipoAccion ?? registroApi.accion),
      tono: obtenerTonoAccion(registroApi.tipoAccion ?? registroApi.accion)
    },
    tipoTransaccion: registroApi.tipoTransaccion ?? registroApi.descripcion,
    valoresAntes,
    valoresDespues
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
 * Lógica de la página de Auditorías: carga el listado aplicando los filtros y la
 * búsqueda por usuario o descripción en el API, y gestiona el panel de detalle con
 * el historial del elemento afectado.
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
  const [tipoAccion, establecerTipoAccionEstado] = useState('');
  const [fechaDesde, establecerFechaDesdeEstado] = useState('');
  const [fechaHasta, establecerFechaHastaEstado] = useState('');
  // Último rango válido aplicado (puede diferir de lo escrito en los campos mientras el rango es inválido).
  const [rangoVigente, establecerRangoVigente] = useState(RANGO_VACIO);
  const [pagina, establecerPaginaEstado] = useState(0);
  const [paginacion, establecerPaginacion] = useState({ totalPaginas: 0, totalElementos: 0, cantidadPagina: 0 });

  const [detalleRegistro, establecerDetalleRegistro] = useState(null);
  const [estadoDetalle, establecerEstadoDetalle] = useState('listo');
  const [mensajeErrorDetalle, establecerMensajeErrorDetalle] = useState('');
  const [historial, establecerHistorial] = useState({ estado: 'listo', registros: [] });

  const secuenciaListadoRef = useRef(0);
  const temporizadorBusquedaRef = useRef(null);
  const secuenciaHistorialRef = useRef(0);
  const secuenciaDetalleRef = useRef(0);
  const elementoOrigenRef = useRef(null);
  // (LAB05) Último rango de fechas válido aplicado: chip, búsqueda y `reintentar`
  // siempre consultan con este rango, nunca con uno inválido (docs/planes/auditorias.md §6.3).
  const rangoAplicadoRef = useRef(RANGO_VACIO);
  const paginaRef = useRef(0);
  // Filtro por tipo de acción: se aplica de inmediato, como el de categoría, y es independiente de ella.
  const tipoAccionRef = useRef('');

  const mensajeErrorRango = obtenerMensajeRangoFechas(fechaDesde, fechaHasta);

  /**
   * Pide el listado con los filtros indicados. Descarta la respuesta si ya no
   * es la última solicitud en curso
   * (docs/planes/auditorias.md §6.3, pasos 1, 5 y 6).
   */
  async function cargarListado(categoriaActual, busquedaActual, rangoActual, tipoAccionActual, paginaActual = 0) {
    const idSolicitud = (secuenciaListadoRef.current += 1);

    if (estado === 'cargando' || estado === 'error') {
      establecerEstado('cargando');
    } else {
      establecerActualizando(true);
    }

    const filtros = {
      categoria: categoriaActual === CATEGORIA_TODOS ? null : categoriaActual,
      busqueda: busquedaActual,
      fechaDesde: rangoActual.fechaDesde,
      fechaHasta: rangoActual.fechaHasta,
      tipoAccion: tipoAccionActual || '',
      // El backend pagina de 10 en 10; cualquier cambio de filtro vuelve a la primera página.
      pagina: paginaActual
    };
    paginaRef.current = paginaActual;
    establecerPaginaEstado(paginaActual);

    const resultadoListado = await listarRegistrosAuditoria(filtros);

    if (idSolicitud !== secuenciaListadoRef.current) {
      return;
    }

    if (!resultadoListado.exitoso) {
      establecerEstado('error');
      establecerActualizando(false);
      return;
    }

    const registrosPagina = ordenarDescendentePorFecha(
      (resultadoListado.datos?.registros ?? []).map(transformarRegistro)
    );
    establecerRegistros(registrosPagina);
    establecerResumen({ totalAcciones: resultadoListado.datos?.totalElementos ?? 0 });
    // La búsqueda de texto la resuelve el backend sobre todos los registros, así que los totales y
    // la paginación ya reflejan el filtro.
    establecerPaginacion({
      totalPaginas: resultadoListado.datos?.totalPaginas ?? 0,
      totalElementos: resultadoListado.datos?.totalElementos ?? 0,
      cantidadPagina: registrosPagina.length
    });

    establecerEstado('listo');
    establecerActualizando(false);
  }

  useEffect(() => {
    cargarListado(CATEGORIA_TODOS, '', rangoAplicadoRef.current, tipoAccionRef.current);

    return () => {
      if (temporizadorBusquedaRef.current) {
        clearTimeout(temporizadorBusquedaRef.current);
      }
    };
    // Carga inicial: se ejecuta una sola vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Cambia la categoría activa y refiltra de inmediato (sin debounce). Se combina con Y
   * con el tipo de acción y los demás filtros.
   *
   * @param {string} valor
   */
  function establecerCategoria(valor) {
    establecerCategoriaEstado(valor);
    cargarListado(valor, busqueda.trim(), rangoAplicadoRef.current, tipoAccionRef.current);
  }

  /**
   * Cambia el tipo de acción activo y refiltra de inmediato (sin debounce), igual que la
   * categoría. Se combina con Y con los demás filtros.
   *
   * @param {string} valor Código del tipo de acción (por ejemplo `'CREAR'`), o `''` para "Todas las acciones".
   */
  function establecerTipoAccion(valor) {
    establecerTipoAccionEstado(valor);
    tipoAccionRef.current = valor;
    cargarListado(categoria, busqueda.trim(), rangoAplicadoRef.current, valor);
  }

  /**
   * Actualiza el texto de búsqueda en cada tecla (campo controlado) y consulta al API
   * 300 ms después de que el usuario deja de escribir, volviendo a la primera página.
   *
   * @param {string} texto
   */
  function establecerBusqueda(texto) {
    establecerBusquedaEstado(texto);

    if (temporizadorBusquedaRef.current) {
      clearTimeout(temporizadorBusquedaRef.current);
    }

    temporizadorBusquedaRef.current = setTimeout(() => {
      cargarListado(categoria, texto.trim(), rangoAplicadoRef.current, tipoAccionRef.current);
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
      establecerRangoVigente(rango);
      cargarListado(categoria, busqueda.trim(), rango, tipoAccionRef.current);
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
      establecerRangoVigente(rango);
      cargarListado(categoria, busqueda.trim(), rango, tipoAccionRef.current);
    }
  }

  /**
   * Aplica de una vez los dos extremos del rango (chip de filtro activo). Los extremos
   * recibidos son siempre válidos, así que se aplican sin pasar por el mensaje de error.
   *
   * @param {string} desde `'AAAA-MM-DD'` o `''`.
   * @param {string} hasta `'AAAA-MM-DD'` o `''`.
   */
  function establecerRango(desde, hasta) {
    const rango = { fechaDesde: desde, fechaHasta: hasta };
    establecerFechaDesdeEstado(desde);
    establecerFechaHastaEstado(hasta);
    rangoAplicadoRef.current = rango;
    establecerRangoVigente(rango);
    cargarListado(categoria, busqueda.trim(), rango, tipoAccionRef.current);
  }

  /** Quita todos los filtros (módulo, acción, fechas y búsqueda) y vuelve a la primera página. */
  function limpiarFiltros() {
    if (temporizadorBusquedaRef.current) {
      clearTimeout(temporizadorBusquedaRef.current);
    }
    establecerCategoriaEstado(CATEGORIA_TODOS);
    establecerBusquedaEstado('');
    establecerTipoAccionEstado('');
    tipoAccionRef.current = '';
    establecerFechaDesdeEstado('');
    establecerFechaHastaEstado('');
    rangoAplicadoRef.current = RANGO_VACIO;
    establecerRangoVigente(RANGO_VACIO);
    cargarListado(CATEGORIA_TODOS, '', RANGO_VACIO, '');
  }

  /**
   * Cambia de página conservando todos los filtros vigentes.
   *
   * @param {number} nuevaPagina Base 0.
   */
  function cambiarPagina(nuevaPagina) {
    cargarListado(categoria, busqueda.trim(), rangoAplicadoRef.current, tipoAccionRef.current, nuevaPagina);
  }

  /**
   * Repite la consulta con los filtros vigentes (incluido el último rango de
   * fechas válido).
   */
  function reintentar() {
    cargarListado(categoria, busqueda.trim(), rangoAplicadoRef.current, tipoAccionRef.current, paginaRef.current);
  }

  /**
   * Pide el historial del mismo elemento (LAB05). El historial se pide siempre al
   * servicio, sin reutilizar el listado, porque este puede estar filtrado
   * (docs/planes/auditorias.md §6.3, paso 7), y no aplica los filtros del listado.
   */
  async function cargarDetalle(registro) {
    const idSolicitud = (secuenciaDetalleRef.current += 1);
    establecerEstadoDetalle('cargando');
    establecerMensajeErrorDetalle('');

    const resultado = await obtenerRegistroAuditoria(registro.id);

    if (idSolicitud !== secuenciaDetalleRef.current) {
      return;
    }

    if (!resultado.exitoso || !resultado.datos) {
      establecerEstadoDetalle('error');
      establecerMensajeErrorDetalle(resultado.mensaje || 'No se pudo cargar el detalle de auditoría.');
      return;
    }

    establecerDetalleRegistro(transformarRegistro(resultado.datos));
    establecerEstadoDetalle('listo');
  }

  async function cargarHistorial(registro) {
    const idSolicitud = (secuenciaHistorialRef.current += 1);
    establecerHistorial({ estado: 'cargando', registros: [] });

    const resultado = await obtenerHistorialAuditoria(registro);

    if (idSolicitud !== secuenciaHistorialRef.current) {
      return;
    }

    if (!resultado.exitoso) {
      establecerHistorial({ estado: 'error', registros: [] });
      return;
    }

    const registrosVista = ordenarAscendentePorFecha(
      (resultado.datos?.registros ?? []).map(transformarRegistro)
    );
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
    cargarDetalle(registro);
    cargarHistorial(registro);
  }

  /**
   * Cierra el panel de detalle, descarta cualquier respuesta pendiente del
   * historial y devuelve el foco al elemento de origen si sigue en el DOM.
   */
  function cerrar() {
    secuenciaHistorialRef.current += 1;
    secuenciaDetalleRef.current += 1;
    establecerDetalleRegistro(null);
    establecerEstadoDetalle('listo');
    establecerMensajeErrorDetalle('');

    const elementoOrigen = elementoOrigenRef.current;
    if (elementoOrigen && document.contains(elementoOrigen)) {
      elementoOrigen.focus();
    }
    elementoOrigenRef.current = null;
  }

  function reintentarHistorial() {
    if (detalleRegistro) {
      cargarHistorial(detalleRegistro);
    }
  }

  function reintentarDetalle() {
    if (detalleRegistro) {
      cargarDetalle(detalleRegistro);
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
    tipoAccion,
    establecerTipoAccion,
    fechaDesde,
    establecerFechaDesde,
    fechaHasta,
    establecerFechaHasta,
    mensajeErrorRango,
    rangoVigente,
    establecerRango,
    limpiarFiltros,
    pagina,
    totalPaginas: paginacion.totalPaginas,
    totalElementos: paginacion.totalElementos,
    cantidadPagina: paginacion.cantidadPagina,
    cambiarPagina,
    reintentar,
    detalle: {
      registro: detalleRegistro,
      estado: estadoDetalle,
      mensajeError: mensajeErrorDetalle,
      historial,
      abrir,
      cerrar,
      reintentarDetalle,
      reintentarHistorial
    }
  };
}
