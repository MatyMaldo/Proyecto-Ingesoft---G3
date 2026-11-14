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
 * @param {(info: { estado: number, codigo: string|null }) => void} [config.alSesionExpirada] - Se invoca ante una
 *   respuesta 401, con el código de invalidación si el backend lo envió (docs/planes/login.md §U2).
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
 * @property {FormData} [cuerpoFormulario] - Formulario multipart; el navegador asigna el boundary.
 * @property {boolean} [respuestaArchivo] - Devuelve el cuerpo exitoso como `Blob`.
 * @property {Object<string,string>} [cabeceras] - Cabeceras adicionales para esta solicitud.
 * @property {AbortSignal} [signal] - Señal externa para cancelar la solicitud.
 * @property {boolean} [sinVersionApi] - Usa `/api` en lugar de la ruta API versionada.
 * @property {number} [tiempoEsperaMs] - Tiempo máximo de espera para esta solicitud.
 */

/**
 * @typedef {Object} RespuestaSolicitud
 * @property {boolean} exitoso
 * @property {*} datos
 * @property {string} mensaje
 * @property {number} [estado] - Código HTTP de la respuesta, solo presente si `exitoso` es `false` por un error del servidor.
 * @property {string|null} [codigo] - Código de negocio del error (`json.codigo`), cuando `exitoso` es `false` (docs/planes/login.md §U2).
 * @property {boolean} [cancelada] - `true` si la solicitud se canceló por la señal externa.
 */

/**
 * Cliente HTTP único, basado en `fetch`, que nunca lanza excepciones: toda
 * solicitud se resuelve en un objeto `{ exitoso, datos, mensaje }`. Las
 * respuestas exitosas pueden envolver el contenido en `datos`/`data` o
 * devolver directamente el objeto raíz.
 *
 * @param {string} ruta - Ruta relativa a `URL_BASE_API` (por ejemplo, `/auditorias`).
 * @param {OpcionesSolicitud} [opciones]
 * @returns {Promise<RespuestaSolicitud>}
 */
async function ejecutarSolicitud(ruta, opciones = {}) {
  const {
    metodo = 'GET',
    parametros,
    cuerpo,
    cuerpoFormulario,
    respuestaArchivo = false,
    cabeceras: cabecerasAdicionales = {},
    signal: signalExterno,
    sinVersionApi = false,
    tiempoEsperaMs = TIEMPO_ESPERA_MS
  } = opciones;

  const base = sinVersionApi ? URL_BASE_API.replace(/\/v\d+$/, '') : URL_BASE_API;
  const url = construirUrl(ruta, parametros).replace(URL_BASE_API, base);
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), tiempoEsperaMs);

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

  const cabeceras = { ...cabecerasAdicionales };
  if (cuerpo !== undefined && cabeceras['Content-Type'] === undefined) {
    cabeceras['Content-Type'] = 'application/json';
  }
  const token = obtenerToken();
  if (token && cabeceras.Authorization === undefined) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: cabeceras,
      body: cuerpoFormulario ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
      signal: controlador.signal
    });

    const archivo = respuestaArchivo && respuesta.ok ? await respuesta.blob() : null;
    const json = respuestaArchivo && respuesta.ok ? null : await analizarJson(respuesta);

    if (!respuesta.ok) {
      const codigo = json?.codigo ?? null;
      if (respuesta.status === 401) {
        alSesionExpirada({ estado: respuesta.status, codigo });
      }
      return {
        exitoso: false,
        // Algunos endpoints (p. ej. la carga masiva de horarios) responden 4xx con el detalle por fila en `datos`.
        datos: json?.datos ?? json?.data ?? null,
        mensaje: json?.message ?? json?.error ?? json?.mensaje ?? 'No se pudo completar la operación.',
        estado: respuesta.status,
        codigo
      };
    }

    return {
      exitoso: true,
      datos: archivo ?? json?.datos ?? json?.data ?? json ?? null,
      mensaje: json?.error ?? json?.mensaje ?? ''
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

/** Consultas GET en curso, por clave (URL + token + cabeceras), para compartir una sola petición entre llamadas idénticas. */
const consultasEnCurso = new Map();

function copiarRespuesta(respuesta) {
  if (respuesta.datos === null || typeof respuesta.datos !== 'object') {
    return { ...respuesta };
  }
  try {
    return { ...respuesta, datos: structuredClone(respuesta.datos) };
  } catch {
    return { ...respuesta };
  }
}

/**
 * Punto de entrada del cliente HTTP. Igual que `ejecutarSolicitud` (ver arriba), pero comparte una sola petición
 * entre consultas GET idénticas que están en curso al mismo tiempo (misma URL, token y cabeceras): así no se
 * duplican las llamadas cuando varios componentes o el doble efecto de `React.StrictMode` piden lo mismo a la vez.
 * Cada llamador recibe su propia copia de los datos y puede cancelar con su propia señal: la petición real solo se
 * aborta cuando todos los que la esperan cancelaron. Las demás solicitudes (POST, PUT, descargas...) no se comparten.
 *
 * @param {string} ruta - Ruta relativa a `URL_BASE_API` (por ejemplo, `/auditorias`).
 * @param {OpcionesSolicitud} [opciones]
 * @returns {Promise<RespuestaSolicitud>}
 */
export function solicitar(ruta, opciones = {}) {
  const { metodo = 'GET', respuestaArchivo = false, signal, cabeceras, parametros, sinVersionApi = false } = opciones;
  const compartible = metodo === 'GET' && !respuestaArchivo && opciones.cuerpo === undefined
    && opciones.cuerpoFormulario === undefined;

  if (!compartible) {
    return ejecutarSolicitud(ruta, opciones);
  }

  const clave = JSON.stringify([ruta, parametros ?? null, sinVersionApi, cabeceras ?? null, obtenerToken()]);
  let consulta = consultasEnCurso.get(clave);

  if (!consulta) {
    const controlador = new AbortController();
    consulta = { controlador, suscriptores: 0, promesa: null };
    consulta.promesa = ejecutarSolicitud(ruta, { ...opciones, signal: controlador.signal }).finally(() => {
      if (consultasEnCurso.get(clave) === consulta) {
        consultasEnCurso.delete(clave);
      }
    });
    consultasEnCurso.set(clave, consulta);
  }

  const compartida = consulta;
  compartida.suscriptores += 1;

  return new Promise((resolver) => {
    let terminado = false;

    const alCancelar = () => {
      if (terminado) {
        return;
      }
      terminado = true;
      compartida.suscriptores -= 1;
      if (compartida.suscriptores === 0) {
        if (consultasEnCurso.get(clave) === compartida) {
          consultasEnCurso.delete(clave);
        }
        compartida.controlador.abort();
      }
      resolver({ exitoso: false, datos: null, mensaje: '', cancelada: true });
    };

    if (signal) {
      if (signal.aborted) {
        alCancelar();
        return;
      }
      signal.addEventListener('abort', alCancelar, { once: true });
    }

    compartida.promesa.then((respuesta) => {
      if (terminado) {
        return;
      }
      terminado = true;
      signal?.removeEventListener('abort', alCancelar);
      resolver(copiarRespuesta(respuesta));
    });
  });
}
