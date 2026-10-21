import { ROLES } from './roles.js';
import { CLAVE_SESION } from './constantesSesion.js';

// Sin console.* en este archivo (docs/planes/login.md §6.2): nunca se registra
// el token ni los datos de la sesión.

/** Copia en memoria de la sesión vigente, para esta pestaña. */
let sesionEnMemoria = null;

/**
 * Valida que un valor tenga la forma exacta de una sesión guardada.
 *
 * @param {*} valor
 * @returns {boolean}
 */
function esSesionValida(valor) {
  if (!valor || typeof valor !== 'object') {
    return false;
  }

  const { token, usuario } = valor;

  if (typeof token !== 'string' || token.length === 0) {
    return false;
  }

  if (!usuario || typeof usuario !== 'object') {
    return false;
  }

  if (usuario.id === undefined || usuario.id === null) {
    return false;
  }

  if (typeof usuario.nombre !== 'string') {
    return false;
  }

  if (!Object.values(ROLES).includes(usuario.rol)) {
    return false;
  }

  return true;
}

/**
 * Lee la sesión vigente. Primero mira la copia en memoria; si no hay, intenta
 * leerla de `sessionStorage`. Si el contenido no tiene la forma esperada, se
 * borra y se devuelve `null`.
 *
 * @returns {{ token: string, usuario: { id: *, nombre: string, rol: string } } | null}
 */
export function leerSesionAlmacenada() {
  if (sesionEnMemoria) {
    return sesionEnMemoria;
  }

  let crudo = null;
  try {
    crudo = window.sessionStorage.getItem(CLAVE_SESION);
  } catch {
    return null;
  }

  if (!crudo) {
    return null;
  }

  let analizado = null;
  try {
    analizado = JSON.parse(crudo);
  } catch {
    borrarSesionAlmacenada();
    return null;
  }

  if (!esSesionValida(analizado)) {
    borrarSesionAlmacenada();
    return null;
  }

  sesionEnMemoria = {
    token: analizado.token,
    usuario: {
      id: analizado.usuario.id,
      nombre: analizado.usuario.nombre,
      rol: analizado.usuario.rol
    }
  };

  return sesionEnMemoria;
}

/**
 * Guarda la sesión en memoria y, de ser posible, en `sessionStorage`. Si el
 * almacenamiento falla (modo privado, cuota excedida), la sesión sigue
 * disponible en memoria para esta pestaña.
 *
 * @param {{ token: string, usuario: { id: *, nombre: string, rol: string } }} sesion
 */
export function guardarSesionAlmacenada(sesion) {
  sesionEnMemoria = sesion;

  try {
    window.sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Sin almacenamiento persistente disponible: la sesión sigue en memoria.
  }
}

/**
 * Borra la sesión de memoria y de `sessionStorage`.
 */
export function borrarSesionAlmacenada() {
  sesionEnMemoria = null;

  try {
    window.sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Nada que hacer si el almacenamiento no está disponible.
  }
}

/**
 * Devuelve el token vigente, o `null` si no hay sesión. Lo usa el cliente HTTP
 * para adjuntar `Authorization` en cada solicitud.
 *
 * @returns {string | null}
 */
export function obtenerTokenAlmacenado() {
  return leerSesionAlmacenada()?.token ?? null;
}
