import { CLAVE_PREFERENCIAS_LOGIN } from '../../../shared/auth/constantesSesion.js';

/**
 * Preferencias de "Recordar mi correo": solo el correo electrónico, guardado
 * en `localStorage` tras un inicio de sesión correcto con la casilla marcada.
 * Nunca se guarda la contraseña ni ningún token (decisión del usuario
 * 2026-11-01, docs/planes/login.md D26).
 *
 * Sin `console.*` en este archivo.
 */

/**
 * Lee las preferencias guardadas, si existen y tienen la forma esperada. Un
 * valor con el formato anterior (`{ identificador, perfil }`, sin `correo`)
 * se descarta y se borra la clave.
 *
 * @returns {{ correo: string } | null}
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
    borrarPreferenciasLogin();
    return null;
  }

  if (typeof datos?.correo !== 'string') {
    borrarPreferenciasLogin();
    return null;
  }

  return { correo: datos.correo };
}

/**
 * Guarda el correo electrónico tras un inicio de sesión correcto con
 * "Recordar mi correo" marcada. Nunca guarda la contraseña.
 *
 * @param {{ correo: string }} preferencias
 */
export function guardarPreferenciasLogin({ correo }) {
  try {
    window.localStorage.setItem(CLAVE_PREFERENCIAS_LOGIN, JSON.stringify({ correo }));
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
