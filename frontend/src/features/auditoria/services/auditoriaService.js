import {
  listarRegistrosAuditoriaMock,
  obtenerResumenAuditoriaMock,
  obtenerHistorialTransaccionMock
} from './mocks/auditoriaMock.js';

const URL_BASE_API = import.meta.env.VITE_URL_BASE_API ?? 'http://localhost:8080/api/v1';
const URL_AUDITORIAS = `${URL_BASE_API}/auditorias`;

// TODO(backend): cambiar a HTTP cuando existan los endpoints de docs/planes/auditorias.md §8.
const USAR_MOCK = true;

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

/**
 * Lista los registros de auditoría que cumplen los filtros indicados, en orden
 * descendente por fecha y hora.
 *
 * @param {{ categoria: string|null, busqueda: string }} filtros
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function listarRegistrosAuditoria(filtros) {
  if (USAR_MOCK) {
    return listarRegistrosAuditoriaMock(filtros);
  }

  try {
    const parametros = new URLSearchParams();
    if (filtros?.categoria) {
      parametros.set('categoria', filtros.categoria);
    }
    if (filtros?.busqueda) {
      parametros.set('busqueda', filtros.busqueda);
    }

    const respuesta = await fetch(`${URL_AUDITORIAS}?${parametros.toString()}`);
    // TODO(backend): agregar la cabecera Authorization con el JWT cuando exista el cliente HTTP del shell.
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
 * Obtiene el resumen global de auditorías (no depende de los filtros).
 *
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string}>}
 */
export async function obtenerResumenAuditoria() {
  if (USAR_MOCK) {
    return obtenerResumenAuditoriaMock();
  }

  try {
    const respuesta = await fetch(`${URL_AUDITORIAS}/resumen`);
    // TODO(backend): agregar la cabecera Authorization con el JWT cuando exista el cliente HTTP del shell.
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
 * Obtiene el historial de una transacción, en orden ascendente por fecha y hora.
 *
 * @param {string} idTransaccion
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function obtenerHistorialTransaccion(idTransaccion) {
  if (USAR_MOCK) {
    return obtenerHistorialTransaccionMock(idTransaccion);
  }

  try {
    const respuesta = await fetch(`${URL_AUDITORIAS}/transacciones/${idTransaccion}/historial`);
    // TODO(backend): agregar la cabecera Authorization con el JWT cuando exista el cliente HTTP del shell.
    return await procesarRespuesta(respuesta);
  } catch (error) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No fue posible comunicarse con el backend.'
    };
  }
}
