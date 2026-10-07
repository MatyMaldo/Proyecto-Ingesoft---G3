import { URL_BASE_API, TIEMPO_ESPERA_MS } from './configuracionApi.js';

let obtenerToken = () => null;
let alSesionExpirada = () => {};

/**
 * Construye la URL final de una solicitud a partir de la ruta y los parámetros
 * de consulta, omitiendo las claves con valor `null`, `undefined` o cadena vacía.
 *
 * @param {string} ruta - Ruta relativa a `URL_BASE_API` (por ejemplo, `/auditorias`).
 * @param {Object<string, *>|undefined} parametros - Parámetros de consulta.
 * @returns {string} URL completa de la solicitud.
 */
function construirUrl(ruta, parametros) {
  const base = `${URL_BASE_API}${ruta}`;

  if (!parametros) {
    return base;
  }

  const busqueda = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor === null || valor === undefined || valor === '') {
      continue;
    }
    busqueda.set(clave, valor);
  }

  const cadena = busqueda.toString();
  return cadena ? `${base}?${cadena}` : base;
}

/**
 * Analiza el cuerpo de una respuesta como JSON de forma tolerante: una
 * respuesta sin cuerpo (204), vacía o que no sea JSON válido (por ejemplo,
 * el HTML de un proxy ante un error 502) nunca lanza una excepción.
 *
 * @param {Response} respuesta
 * @returns {Promise<*>} El JSON analizado, o `null` si no se pudo analizar.
 */
async function analizarJson(respuesta) {
  if (respuesta.status === 204) {
    return null;
  }

  const texto = await respuesta.text();
  if (!texto) {
    return null;
  }

  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

/**
 * Permite inyectar de dónde sale el token de sesión y qué hacer cuando una
 * solicitud responde 401 (sesión expirada o inválida).
 *
 * @param {Object} [config]
 * @param {() => (string|null)} [config.obtenerToken] - Devuelve el JWT vigente, o `null` si no hay sesión.
 * @param {() => void} [config.alSesionExpirada] - Se invoca ante una respuesta 401.
 */
export function configurarCliente({
  obtenerToken: fnObtenerToken = () => null,
  alSesionExpirada: fnAlSesionExpirada = () => {}
} = {}) {
  obtenerToken = fnObtenerToken;
  alSesionExpirada = fnAlSesionExpirada;
}

/**
 * @typedef {Object} OpcionesSolicitud
 * @property {string} [metodo] - Método HTTP. Por defecto, `'GET'`.
 * @property {Object<string, *>} [parametros] - Parámetros de consulta (query string).
 * @property {*} [cuerpo] - Cuerpo de la solicitud; se envía como JSON si está presente.
 * @property {AbortSignal} [signal] - Señal externa para cancelar la solicitud.
 */

/**
 * @typedef {Object} RespuestaSolicitud
 * @property {boolean} exitoso
 * @property {*} datos
 * @property {string} mensaje
 * @property {number} [estado] - Código HTTP de la respuesta, solo presente si `exitoso` es `false` por un error del servidor.
 * @property {boolean} [cancelada] - `true` si la solicitud se canceló por la señal externa.
 */

/**
 * Cliente HTTP único, basado en `fetch`, que nunca lanza excepciones: toda
 * solicitud se resuelve en un objeto `{ exitoso, datos, mensaje }`.
 *
 * @param {string} ruta - Ruta relativa a `URL_BASE_API` (por ejemplo, `/auditorias`).
 * @param {OpcionesSolicitud} [opciones]
 * @returns {Promise<RespuestaSolicitud>}
 */
export async function solicitar(ruta, opciones = {}) {
  const { metodo = 'GET', parametros, cuerpo, signal: signalExterno } = opciones;

  const url = construirUrl(ruta, parametros);
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_ESPERA_MS);

  let canceladaPorExterno = false;
  const manejarAbortExterno = () => {
    canceladaPorExterno = true;
    controlador.abort();
  };

  if (signalExterno) {
    if (signalExterno.aborted) {
      manejarAbortExterno();
    } else {
      signalExterno.addEventListener('abort', manejarAbortExterno);
    }
  }

  const cabeceras = {};
  if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json';
  }
  const token = obtenerToken();
  if (token) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: controlador.signal
    });

    const json = await analizarJson(respuesta);

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        alSesionExpirada();
      }
      return {
        exitoso: false,
        datos: null,
        mensaje: json?.error ?? 'No se pudo completar la operación.',
        estado: respuesta.status
      };
    }

    return {
      exitoso: true,
      datos: json?.datos ?? null,
      mensaje: ''
    };
  } catch (error) {
    if (canceladaPorExterno) {
      return { exitoso: false, datos: null, mensaje: '', cancelada: true };
    }
    if (error?.name === 'AbortError') {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'La solicitud tardó demasiado. Inténtalo de nuevo.'
      };
    }
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No fue posible comunicarse con el backend.'
    };
  } finally {
    clearTimeout(temporizador);
    if (signalExterno) {
      signalExterno.removeEventListener('abort', manejarAbortExterno);
    }
  }
}
