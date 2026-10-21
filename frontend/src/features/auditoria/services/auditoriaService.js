import {
  listarRegistrosAuditoriaMock,
  obtenerResumenAuditoriaMock,
  obtenerHistorialElementoMock
} from './mocks/auditoriaMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

/**
 * Lista los registros de auditoría que cumplen los filtros indicados, en orden
 * descendente por fecha y hora.
 *
 * @param {{ categoria: string|null, busqueda: string, fechaDesde?: string, fechaHasta?: string, tipoTransaccion?: string }} filtros
 *   `fechaDesde` y `fechaHasta` en `'AAAA-MM-DD'` (LAB05); vacías, no se envían. `tipoTransaccion`
 *   (D2/D14, decisión del dueño del producto): filtro explícito y separado de la búsqueda libre.
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
      busqueda: filtros?.busqueda,
      fechaDesde: filtros?.fechaDesde,
      fechaHasta: filtros?.fechaHasta,
      tipoTransaccion: filtros?.tipoTransaccion
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
 * Obtiene el historial del mismo elemento (el mismo pago, nota, bloque horario,
 * usuario…), en orden ascendente por fecha y hora (LAB05; reemplaza a
 * `obtenerHistorialTransaccion`, docs/planes/auditorias.md §8.3 y §8.5).
 *
 * @param {string} idElemento
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function obtenerHistorialElemento(idElemento, opciones = {}) {
  if (USAR_MOCK) {
    return obtenerHistorialElementoMock(idElemento);
  }

  return solicitar(`/auditorias/elementos/${encodeURIComponent(idElemento)}/historial`, {
    signal: opciones.signal
  });
}
