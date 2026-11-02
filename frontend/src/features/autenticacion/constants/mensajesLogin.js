/**
 * Textos de la pantalla de inicio de sesión (HU-SAT-07). Son literales de la
 * HU: `MENSAJE_CREDENCIALES_INCORRECTAS`, `MENSAJE_ERROR_INESPERADO`,
 * `MENSAJE_SESION_CONTRASENA_RESTABLECIDA` y `MENSAJE_SESION_ROL_MODIFICADO`.
 * El resto son textos propuestos (docs/planes/login.md D4, D28).
 */

/** Campo "Correo electrónico" vacío. */
export const CORREO_OBLIGATORIO = 'Ingresa tu correo electrónico.';

/** Campo "Correo electrónico" con formato inválido. */
export const CORREO_FORMATO = 'Ingresa un correo electrónico válido.';

/** Campo "Contraseña" vacío. */
export const CONTRASENA_OBLIGATORIA = 'Ingresa tu contraseña.';

/**
 * Literal de la HU (Esc. 3): correo no registrado, contraseña incorrecta o
 * cuenta activa que aún no definió su contraseña (HU-SAT-03), sin indicar cuál
 * de los tres casos ocurrió.
 */
export const MENSAJE_CREDENCIALES_INCORRECTAS = 'Correo o contraseña incorrectos';

/**
 * Propuesto a partir del Esc. 5 (cuenta desactivada). Se reutiliza en el
 * Esc. 9 (cierre de sesión por desactivación de la cuenta, HU-SAT-02).
 */
export const MENSAJE_CUENTA_INACTIVA = 'Tu cuenta está inactiva. Comunícate con el administrador.';

/** Literal de HU-SAT-07 Esc. 10: cierre de sesión por restablecimiento de contraseña (HU-SAT-03). */
export const MENSAJE_SESION_CONTRASENA_RESTABLECIDA = 'Tu contraseña fue restablecida. Inicia sesión nuevamente.';

/** Literal de HU-SAT-07 Esc. 11 y HU-SAT-08: cierre de sesión por cambio de rol de la cuenta. */
export const MENSAJE_SESION_ROL_MODIFICADO = 'Tu rol fue modificado. Inicia sesión nuevamente.';

/** Propuesto (D28): acceso de un rol aún no habilitado en esta iteración (alcance Sprint 1). */
export const MENSAJE_ROL_NO_HABILITADO = 'El acceso para tu rol aún no está habilitado.';

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
  ROL_NO_HABILITADO: MENSAJE_ROL_NO_HABILITADO,
  ERROR_INESPERADO: MENSAJE_ERROR_INESPERADO
});

/**
 * Mapa `código de cierre de sesión → texto` para los Esc. 9-11 (cuenta
 * desactivada, contraseña restablecida o rol modificado con sesión abierta;
 * docs/planes/login.md §U2). Un código ausente o desconocido no muestra
 * ningún mensaje: la sesión se cierra en silencio, como hoy.
 */
export const MENSAJES_CIERRE_SESION = Object.freeze({
  SESION_CUENTA_INACTIVA: MENSAJE_CUENTA_INACTIVA,
  SESION_CONTRASENA_RESTABLECIDA: MENSAJE_SESION_CONTRASENA_RESTABLECIDA,
  SESION_ROL_MODIFICADO: MENSAJE_SESION_ROL_MODIFICADO
});
