/**
 * Valores numéricos y claves de HU-SAT-03 (lista de verificación). La vigencia
 * del código (30 min), el máximo de 5 intentos fallidos y el límite de 5
 * solicitudes por hora **no** se declaran aquí: los aplica el backend; el
 * cliente solo necesita la longitud del código y la espera de reenvío para
 * dar retroalimentación inmediata (docs/planes/restablecer-contrasena.md §8.2).
 */

/** Cantidad de dígitos del código de verificación. */
export const LONGITUD_CODIGO = 6;

/** Longitud mínima de la nueva contraseña (política de HU-SAT-03). */
export const CONTRASENA_LONGITUD_MIN = 9;

/** Longitud máxima de la nueva contraseña (política de HU-SAT-03). */
export const CONTRASENA_LONGITUD_MAX = 15;

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
