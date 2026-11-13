/**
 * Valores numéricos y claves de HU-SAT-03 (lista de verificación). La vigencia
 * del código, el máximo de intentos fallidos y el límite de solicitudes los
 * aplica el backend; el cliente declara la vigencia y el máximo de intentos
 * solo para informar al usuario, y la longitud del código y la espera de
 * reenvío para dar retroalimentación inmediata.
 */

/** Cantidad de dígitos del código de verificación. */
export const LONGITUD_CODIGO = 6;

/** Minutos de vigencia del código. La aplica el backend; aquí solo se informa al usuario. */
export const VIGENCIA_CODIGO_MINUTOS = 15;

/**
 * Intentos fallidos tras los que el backend bloquea el código. El cliente los cuenta solo para avisar antes de
 * seguir intentando; el conteo real es del backend.
 */
export const MAX_INTENTOS_CODIGO = 5;

/** Longitud mínima de la nueva contraseña. Igual a la que valida el backend (decisión del usuario, 2026-11-12). */
export const CONTRASENA_LONGITUD_MIN = 8;

/** Longitud máxima de la nueva contraseña. Igual a la que valida el backend (decisión del usuario, 2026-11-12). */
export const CONTRASENA_LONGITUD_MAX = 72;

/** Segundos de espera, por pestaña, antes de permitir una nueva solicitud de código. */
export const ESPERA_REENVIO_SEGUNDOS = 60;

/**
 * Clave de `sessionStorage` con el instante (epoch ms) de la última solicitud
 * de código hecha desde esta pestaña. Solo guarda un número: nunca el correo
 * ni el código (docs/planes/restablecer-contrasena.md §7.2).
 *
 * @type {string}
 */
export const CLAVE_ESPERA_SOLICITUD_CODIGO = 'educoders.esperaSolicitudCodigo';
