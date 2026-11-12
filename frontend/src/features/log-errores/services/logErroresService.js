import { solicitar } from '../../../shared/api/clienteHttp.js';

/** Errores por página: 10 en 10, igual que el resto de listados del panel (antes 15). */
export const TAMANIO_PAGINA_LOG_ERRORES = 10;

/**
 * Indica si el origen de datos soporta el filtro de módulo y el buscador.
 * El backend (`GET /admin/logs-error`) acepta `modulo` y `busqueda`, y devuelve `modulo` y
 * `moduloEtiqueta`. Se conserva por si algún origen no los admite.
 */
export const SOPORTA_FILTRO_MODULO_Y_BUSQUEDA = true;

/**
 * El front usa los códigos de módulo de su selector; el backend usa los del enum
 * `Modulo`. Solo difieren estos dos (el resto coincide).
 */
const MODULO_FRONT_A_BACKEND = Object.freeze({
  MATRICULAS: 'MATRICULA',
  CONFIGURACION: 'ESTRUCTURA_ACADEMICA'
});
const MODULO_BACKEND_A_FRONT = Object.freeze(
  Object.fromEntries(Object.entries(MODULO_FRONT_A_BACKEND).map(([front, backend]) => [backend, front]))
);

function normalizarRegistro(registro) {
  return {
    ...registro,
    modulo: MODULO_BACKEND_A_FRONT[registro.modulo] ?? registro.modulo ?? null,
    nombreUsuario: registro.nombreUsuario ?? null,
    detalle: registro.detalle ?? ''
  };
}

function normalizarPagina(datos) {
  if (
    !datos ||
    !Array.isArray(datos.content) ||
    typeof datos.number !== 'number' ||
    typeof datos.totalPages !== 'number' ||
    typeof datos.totalElements !== 'number'
  ) {
    return null;
  }

  return {
    registros: datos.content.map(normalizarRegistro),
    pagina: datos.number,
    totalPaginas: datos.totalPages,
    totalElementos: datos.totalElements
  };
}

/**
 * Lista logs de errores con el contrato GET /api/admin/logs-error. Este módulo siempre consulta
 * al backend: no tiene datos simulados en memoria.
 * Las fechas recibidas son inclusivas y se convierten al inicio/final del día.
 */
export async function obtenerErrores(filtros = {}, opciones = {}) {
  const respuesta = await solicitar('/admin/logs-error', {
    sinVersionApi: true,
    parametros: {
      fechaInicio: filtros.fechaDesde ? `${filtros.fechaDesde}T00:00:00` : undefined,
      fechaFin: filtros.fechaHasta ? `${filtros.fechaHasta}T23:59:59` : undefined,
      modulo: filtros.modulo ? (MODULO_FRONT_A_BACKEND[filtros.modulo] ?? filtros.modulo) : undefined,
      busqueda: filtros.busqueda || undefined,
      page: filtros.page ?? 0,
      size: TAMANIO_PAGINA_LOG_ERRORES,
      sortBy: 'fechaHora',
      sortDirection: 'DESC'
    },
    signal: opciones.signal
  });

  if (!respuesta.exitoso) {
    return respuesta;
  }

  const pagina = normalizarPagina(respuesta.datos);
  if (!pagina) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió un formato de logs de errores no válido.'
    };
  }

  return { exitoso: true, datos: pagina, mensaje: '' };
}
