import {
  listarRegistrosAuditoriaMock,
  obtenerResumenAuditoriaMock,
  obtenerHistorialTransaccionMock
} from './mocks/auditoriaMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

/**
 * Lista los registros de auditoría que cumplen los filtros indicados, en orden
 * descendente por fecha y hora.
 *
 * @param {{ categoria: string|null, busqueda: string }} filtros
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function listarRegistrosAuditoria(filtros, opciones = {}) {
  if (USAR_MOCK) {
    return listarRegistrosAuditoriaMock(filtros);
  }

  return solicitar('/auditorias', {
    parametros: {
      categoria: filtros?.categoria,
      busqueda: filtros?.busqueda
    },
    signal: opciones.signal
  });
}

/**
 * Obtiene el resumen global de auditorías (no depende de los filtros).
 *
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string}>}
 */
export async function obtenerResumenAuditoria(opciones = {}) {
  if (USAR_MOCK) {
    return obtenerResumenAuditoriaMock();
  }

  return solicitar('/auditorias/resumen', { signal: opciones.signal });
}

/**
 * Obtiene el historial de una transacción, en orden ascendente por fecha y hora.
 *
 * @param {string} idTransaccion
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function obtenerHistorialTransaccion(idTransaccion, opciones = {}) {
  if (USAR_MOCK) {
    return obtenerHistorialTransaccionMock(idTransaccion);
  }

  return solicitar(`/auditorias/transacciones/${encodeURIComponent(idTransaccion)}/historial`, {
    signal: opciones.signal
  });
}
