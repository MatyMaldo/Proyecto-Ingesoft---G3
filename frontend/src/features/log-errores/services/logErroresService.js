import { obtenerErroresMock, obtenerResumenErroresMock } from './mocks/logErroresMock.js';

// TODO(backend): cambiar a false cuando existan los endpoints `GET /log-errores`
// y `GET /log-errores/resumen` (contrato propuesto en docs/planes/log-errores.md §6.5).
const USAR_MOCK = true;

const URL_BASE_API = import.meta.env.VITE_URL_BASE_API ?? 'http://localhost:8080/api/v1';
const URL_LOG_ERRORES = `${URL_BASE_API}/log-errores`;

async function procesarRespuesta(respuesta) {
  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    return {
      exitoso: false,
      datos: null,
      mensaje: cuerpo?.error ?? 'No se pudo completar la operación.'
    };
  }

  return {
    exitoso: true,
    datos: cuerpo?.datos ?? null,
    mensaje: ''
  };
}

function construirParametros(filtros) {
  const parametros = new URLSearchParams();

  if (filtros.modulo) {
    parametros.set('modulo', filtros.modulo);
  }
  if (filtros.fechaDesde) {
    parametros.set('fechaDesde', filtros.fechaDesde);
  }
  if (filtros.fechaHasta) {
    parametros.set('fechaHasta', filtros.fechaHasta);
  }
  if (filtros.busqueda) {
    parametros.set('busqueda', filtros.busqueda);
  }

  return parametros;
}

/**
 * Obtiene los errores registrados, filtrados y ordenados por fecha descendente.
 *
 * @param {{modulo?: string, fechaDesde?: string, fechaHasta?: string, busqueda?: string}} filtros
 *        fechas en formato 'YYYY-MM-DD', ambas inclusive; claves vacías se omiten.
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function obtenerErrores(filtros = {}) {
  if (USAR_MOCK) {
    return obtenerErroresMock(filtros);
  }

  try {
    // TODO(pregunta): mecanismo exacto para adjuntar el JWT (`Authorization: Bearer <token>`).
    // Lo define el cliente HTTP compartido del shell, que aún no existe.
    const parametros = construirParametros(filtros);
    const respuesta = await fetch(`${URL_LOG_ERRORES}?${parametros.toString()}`);
    return await procesarRespuesta(respuesta);
  } catch (error) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No fue posible comunicarse con el backend.'
    };
  }
}

/**
 * Obtiene las métricas globales del log (no dependen de los filtros).
 *
 * @returns {Promise<{exitoso: boolean,
 *   datos: {totalErrores: number, modulosAfectados: number, usuariosInvolucrados: number,
 *           fechaPrimerError: string|null, fechaUltimoError: string|null}|null,
 *   mensaje: string}>}
 */
export async function obtenerResumenErrores() {
  if (USAR_MOCK) {
    return obtenerResumenErroresMock();
  }

  try {
    // TODO(pregunta): mecanismo exacto para adjuntar el JWT. Ver nota de `obtenerErrores`.
    const respuesta = await fetch(`${URL_LOG_ERRORES}/resumen`);
    return await procesarRespuesta(respuesta);
  } catch (error) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No fue posible comunicarse con el backend.'
    };
  }
}
