/**
 * Ruta pública de inicio de sesión. Único lugar donde se define: toda redirección
 * hacia el login (guards, cierre de sesión, cliente HTTP) importa esta constante.
 *
 * @type {string}
 */
export const RUTA_LOGIN = '/iniciar-sesion';

/**
 * Clave de `sessionStorage` donde se guarda la sesión (`{ token, usuario }`).
 * No existen más claves de almacenamiento para esta pantalla (docs/planes/login.md §6.2).
 *
 * @type {string}
 */
export const CLAVE_SESION = 'educoders.sesion';
