import {
  listarRegistrosAuditoriaMock,
  obtenerResumenAuditoriaMock,
  obtenerHistorialElementoMock
} from './mocks/auditoriaMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { TAMANIO_PAGINA_AUDITORIA } from '../constants/paginacionAuditoria.js';

/**
 * Normaliza la página de Spring (`content`, `number`, `totalPages`, `totalElements`)
 * al modelo que consume el hook (docs/planes/auditorias.md §A.4). Se aplica tanto a la
 * respuesta del mock como a la del backend real, para que el hook no distinga entre
 * las dos ramas.
 *
 * @param {Object} datos
 * @returns {{ registros: Array, pagina: number, totalPaginas: number, totalElementos: number }|null}
 *   `null` si la forma no es la esperada (mismo criterio que `usuariosService.js` con `content`).
 */
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
    registros: datos.content,
    pagina: datos.number,
    totalPaginas: datos.totalPages,
    totalElementos: datos.totalElements
  };
}

/**
 * Lista los registros de auditoría que cumplen los filtros indicados, en orden
 * descendente por fecha y hora y paginados de 15 en 15 (HU-SAT-04 Esc. 4; D20: la
 * paginación la resuelve el backend, sin paginador visible en el frontend).
 *
 * @param {{ categoria: string|null, busqueda: string, fechaDesde?: string, fechaHasta?: string, tipoAccion?: string, pagina?: number }} filtros
 *   `fechaDesde` y `fechaHasta` en `'AAAA-MM-DD'` (LAB05); vacías, no se envían. `tipoAccion`
 *   (CREAR, ACTUALIZAR, ELIMINAR, LOGIN o CAMBIO_ESTADO): filtro explícito, independiente del módulo
 *   y separado de la búsqueda libre.
 *   `pagina` es base 0; por defecto 0 (hoy el hook siempre envía 0).
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: {registros: Array, pagina: number, totalPaginas: number, totalElementos: number}|null, mensaje: string}>}
 */
export async function listarRegistrosAuditoria(filtros, opciones = {}) {
  const respuesta = USAR_MOCK
    ? await listarRegistrosAuditoriaMock(filtros)
    : await solicitar('/auditorias', {
      parametros: {
        categoria: filtros?.categoria,
        busqueda: filtros?.busqueda,
        fechaDesde: filtros?.fechaDesde,
        fechaHasta: filtros?.fechaHasta,
        tipoAccion: filtros?.tipoAccion,
        page: filtros?.pagina ?? 0,
        size: TAMANIO_PAGINA_AUDITORIA
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
      mensaje: 'El backend devolvió un formato de listado de auditorías no válido.'
    };
  }

  return { exitoso: true, datos: pagina, mensaje: '' };
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
