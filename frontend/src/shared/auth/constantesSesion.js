/**
 * Ruta pública de inicio de sesión. Único lugar donde se define: toda redirección
 * hacia el login (guards, cierre de sesión, cliente HTTP) importa esta constante.
 *
 * @type {string}
 */
export const RUTA_LOGIN = '/iniciar-sesion';

/**
 * Ruta pública de solicitud del código de verificación (HU-SAT-03). Único
 * lugar donde se define: toda redirección hacia esta pantalla (el enlace
 * "¿Olvidaste tu contraseña?" del login, el índice de rutas) importa esta
 * constante (docs/planes/restablecer-contrasena.md §2).
 *
 * @type {string}
 */
export const RUTA_SOLICITAR_CODIGO = '/solicitar-codigo';

/**
 * Ruta pública de la pantalla "Restablecer contraseña" (HU-SAT-03). Sirve
 * tanto para la definición inicial de contraseña (cuenta nueva) como para el
 * olvido de contraseña (docs/planes/restablecer-contrasena.md §2).
 *
 * @type {string}
 */
export const RUTA_RESTABLECER_CONTRASENA = '/restablecer-contrasena';

/**
 * Clave de `sessionStorage` donde se guarda la sesión (`{ token, usuario }`).
 * No existen más claves de almacenamiento para esta pantalla (docs/planes/login.md §6.2).
 *
 * @type {string}
 */
export const CLAVE_SESION = 'educoders.sesion';

/**
 * Clave de `localStorage` para las preferencias de "Recordar mi correo" (solo
 * el correo electrónico). Nunca se guarda aquí la contraseña ni ningún token
 * (decisión del usuario 2026-11-01, docs/planes/login.md D26).
 *
 * @type {string}
 */
export const CLAVE_PREFERENCIAS_LOGIN = 'educoders.preferenciasLogin';

/**
 * Códigos de cierre de sesión por invalidación (Esc. 9-11 de HU-SAT-07): la
 * cuenta se desactivó, la contraseña se restableció o el rol cambió mientras
 * la sesión seguía abierta. Un 401 con uno de estos códigos cierra la sesión y
 * muestra el mensaje correspondiente en el login; un 401 sin código (o con uno
 * desconocido) cierra la sesión sin mensaje, como antes (docs/planes/login.md §U2).
 *
 * @type {string[]}
 */
export const MOTIVOS_CIERRE_SESION = Object.freeze([
  'SESION_CUENTA_INACTIVA',
  'SESION_CONTRASENA_RESTABLECIDA',
  'SESION_ROL_MODIFICADO'
]);
