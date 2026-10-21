/**
 * Textos de la pantalla de inicio de sesión (HU-SAT-07). Solo
 * `MENSAJE_CREDENCIALES_INCORRECTAS` y `MENSAJE_ERROR_INESPERADO` son literales
 * de la HU/EAC-13; el resto son textos propuestos (docs/planes/login.md D4).
 */

/** Campo "Correo electrónico o DNI" vacío. */
export const IDENTIFICADOR_OBLIGATORIO = 'Ingresa tu correo electrónico o DNI.';

/** Campo "Correo electrónico o DNI" con formato inválido. */
export const IDENTIFICADOR_FORMATO = 'Ingresa un correo electrónico válido o un DNI de 8 dígitos.';

/** Campo "Contraseña" vacío. */
export const CONTRASENA_OBLIGATORIA = 'Ingresa tu contraseña.';

/** Literal de la HU (Esc. 3: credenciales o perfil incorrectos), sin indicar cuál dato falló. */
export const MENSAJE_CREDENCIALES_INCORRECTAS = 'Correo/DNI o contraseña incorrectos';

/** Propuesto a partir del Esc. 5 (cuenta desactivada). */
export const MENSAJE_CUENTA_INACTIVA = 'Tu cuenta está inactiva. Comunícate con el administrador.';

/** Literal de EAC-13: error no controlado, sin detalles técnicos. */
export const MENSAJE_ERROR_INESPERADO = 'Se registró un error inesperado';

/**
 * Mapa `motivo de rechazo del servicio → texto final` para la alerta general.
 * `DATOS_INVALIDOS` no tiene un texto fijo aquí: el hook usa el `mensaje` que
 * devuelve el servicio (y, si viene vacío, `MENSAJE_ERROR_INESPERADO`).
 */
export const MENSAJES_RECHAZO = Object.freeze({
  CREDENCIALES_INVALIDAS: MENSAJE_CREDENCIALES_INCORRECTAS,
  CUENTA_INACTIVA: MENSAJE_CUENTA_INACTIVA,
  ERROR_INESPERADO: MENSAJE_ERROR_INESPERADO
});
