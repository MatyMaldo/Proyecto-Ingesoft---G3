import { CLAVE_PREFERENCIAS_LOGIN } from '../../../shared/auth/constantesSesion.js';

/**
 * Preferencias de "Recordar mi sesión": identificador (correo o DNI) y perfil
 * elegidos, guardados en `localStorage` tras un inicio de sesión correcto con
 * la casilla marcada. Nunca se guarda la contraseña ni ningún token (decisión
 * del usuario 2026-10-20, docs/planes/login.md D19, opción B).
 *
 * Sin `console.*` en este archivo.
 */

/**
 * Lee las preferencias guardadas, si existen y tienen la forma esperada.
 *
 * @returns {{ identificador: string, perfil: string } | null}
 */
export function leerPreferenciasLogin() {
  let crudo = null;

  try {
    crudo = window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN);
  } catch {
    return null;
  }

  if (!crudo) {
    return null;
  }

  let datos = null;
  try {
    datos = JSON.parse(crudo);
  } catch {
    return null;
  }

  if (typeof datos?.identificador !== 'string' || typeof datos?.perfil !== 'string') {
    return null;
  }

  return { identificador: datos.identificador, perfil: datos.perfil };
}

/**
 * Guarda el identificador y el perfil tras un inicio de sesión correcto con
 * "Recordar mi sesión" marcada. Nunca guarda la contraseña.
 *
 * @param {{ identificador: string, perfil: string }} preferencias
 */
export function guardarPreferenciasLogin({ identificador, perfil }) {
  try {
    window.localStorage.setItem(CLAVE_PREFERENCIAS_LOGIN, JSON.stringify({ identificador, perfil }));
  } catch {
    // Sin almacenamiento disponible (modo privado, cuota excedida): se ignora.
  }
}

/**
 * Borra las preferencias guardadas. Se llama al desmarcar la casilla, en el
 * momento en que el usuario la desmarca (no se espera a un nuevo envío).
 */
export function borrarPreferenciasLogin() {
  try {
    window.localStorage.removeItem(CLAVE_PREFERENCIAS_LOGIN);
  } catch {
    // Nada que hacer si el almacenamiento no está disponible.
  }
}
