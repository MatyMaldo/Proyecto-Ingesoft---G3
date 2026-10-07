import { obtenerErroresMock, obtenerResumenErroresMock } from './mocks/logErroresMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

/**
 * Construye el objeto de parámetros de consulta a partir de los filtros,
 * para mantener la legibilidad en el punto de llamada.
 *
 * @param {{modulo?: string, fechaDesde?: string, fechaHasta?: string, busqueda?: string}} filtros
 * @returns {Object<string, string|undefined>}
 */
function construirParametros(filtros) {
  return {
    modulo: filtros.modulo,
    fechaDesde: filtros.fechaDesde,
    fechaHasta: filtros.fechaHasta,
    busqueda: filtros.busqueda
  };
}

/**
 * Obtiene los errores registrados, filtrados y ordenados por fecha descendente.
 *
 * @param {{modulo?: string, fechaDesde?: string, fechaHasta?: string, busqueda?: string}} filtros
 *        fechas en formato 'YYYY-MM-DD', ambas inclusive; claves vacías se omiten.
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function obtenerErrores(filtros = {}, opciones = {}) {
  if (USAR_MOCK) {
    return obtenerErroresMock(filtros);
  }

  return solicitar('/log-errores', {
    parametros: construirParametros(filtros),
    signal: opciones.signal
  });
}

/**
 * Obtiene las métricas globales del log (no dependen de los filtros).
 *
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean,
 *   datos: {totalErrores: number, modulosAfectados: number, usuariosInvolucrados: number,
 *           fechaPrimerError: string|null, fechaUltimoError: string|null}|null,
 *   mensaje: string}>}
 */
export async function obtenerResumenErrores(opciones = {}) {
  if (USAR_MOCK) {
    return obtenerResumenErroresMock();
  }

  return solicitar('/log-errores/resumen', { signal: opciones.signal });
}
