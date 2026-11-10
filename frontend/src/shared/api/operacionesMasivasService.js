import { solicitar } from './clienteHttp.js';

export const ESTADOS_OPERACION_TERMINALES = Object.freeze([
  'COMPLETADO',
  'COMPLETADO_CON_ERRORES',
  'FALLIDO',
  'CANCELADO'
]);

const ESTADOS_TERMINALES = new Set(ESTADOS_OPERACION_TERMINALES);

export function esEstadoTerminal(estado) {
  return ESTADOS_TERMINALES.has(String(estado ?? '').toUpperCase());
}

export function crearClaveIdempotencia(prefijo = 'operacion') {
  const aleatorio = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefijo}-${aleatorio}`;
}

/** Consulta el estado de una operación masiva por su jobId. */
export async function consultarOperacionMasiva(jobId, { signal } = {}) {
  if (!jobId) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No se indicó el identificador de la operación.'
    };
  }

  return solicitar(`/operaciones-masivas/${encodeURIComponent(jobId)}`, {
    signal,
    tiempoEsperaMs: 15000
  });
}
