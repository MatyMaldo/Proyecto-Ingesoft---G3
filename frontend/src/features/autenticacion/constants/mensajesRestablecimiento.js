import { ESPERA_REENVIO_SEGUNDOS } from './reglasRestablecimiento.js';

/**
 * Textos de las pantallas "Solicitar código" y "Restablecer contraseña"
 * (HU-SAT-03). Algunos son **literales de la HU** (se citan tal cual en la
 * historia o en su lista de verificación); el resto es **redacción
 * definitiva confirmada por el usuario (2026-11-01, docs/planes/
 * restablecer-contrasena.md §18, R2)**: ninguno lleva `TODO(pregunta)` ni la
 * etiqueta "Propuesto".
 *
 * `MENSAJE_ERROR_INESPERADO`, `CORREO_OBLIGATORIO` y `CORREO_FORMATO` se
 * importan de `mensajesLogin.js` (no se duplican); el placeholder del correo
 * también se toma igual que en `FormularioLogin.jsx`.
 */

/** Título de la pantalla (a). Confirmado (R2). */
export const TITULO_SOLICITUD = 'Recuperar contraseña';

/** Subtítulo de la pantalla (a). Confirmado (R2). */
export const SUBTITULO_SOLICITUD =
  'Ingresa el correo electrónico de tu cuenta y te enviaremos un código de verificación.';

/** Título de la pantalla (b): nombre literal de la pantalla en la HU. */
export const TITULO_RESTABLECER = 'Restablecer contraseña';

/** Subtítulo de la pantalla (b). Confirmado (R2). */
export const SUBTITULO_RESTABLECER = 'Ingresa el código que recibiste en tu correo y define tu nueva contraseña.';

/** `document.title` de la pantalla (a). Confirmado (R2). */
export const TITULO_DOCUMENTO_SOLICITUD = 'Solicitar código · Colegio San Marcos';

/** `document.title` de la pantalla (b). Confirmado (R2). */
export const TITULO_DOCUMENTO_RESTABLECER = 'Restablecer contraseña · Colegio San Marcos';

/** Texto del botón de la pantalla (a). Literal HU. */
export const TEXTO_ENVIAR_CODIGO = 'Enviar código';

/** Texto del enlace de la pantalla (a) hacia la pantalla (b). Literal HU. */
export const TEXTO_YA_TENGO_CODIGO = 'Ya tengo un código';

/** Texto del botón de envío de la pantalla (b). Literal HU. */
export const TEXTO_ACEPTAR = 'Aceptar';

/** Texto del botón secundario de reenvío de la pantalla (b). Confirmado (R2). */
export const TEXTO_SOLICITAR_NUEVO_CODIGO = 'Solicitar un nuevo código';

/** Texto del enlace de vuelta al login, en ambas pantallas. Confirmado (R2). */
export const TEXTO_VOLVER_LOGIN = 'Volver a iniciar sesión';

/** Texto del botón mientras se envía la solicitud de código. Confirmado (R2). */
export const TEXTO_ENVIANDO = 'Enviando…';

/** Texto del botón "Aceptar" mientras se envía el restablecimiento. Confirmado (R2). */
export const TEXTO_GUARDANDO = 'Guardando…';

/** Placeholder del campo "Código de verificación". Confirmado (R2). */
export const PLACEHOLDER_CODIGO = 'Ingresa el código de 6 dígitos';

/** Placeholder del campo "Nueva contraseña". Confirmado (R2). */
export const PLACEHOLDER_NUEVA_CONTRASENA = 'Ingresa tu nueva contraseña';

/** Placeholder del campo "Confirmar contraseña". Confirmado (R2). */
export const PLACEHOLDER_CONFIRMACION = 'Vuelve a escribir la nueva contraseña';

/** `aria-describedby` del botón de reenvío mientras corre la cuenta regresiva. Confirmado (R2). */
export const DESCRIPCION_ESPERA = 'Disponible cuando termine la cuenta regresiva.';

/** Literal HU (Esc. 2, 3, 4; lista de verificación "Mensajes"). */
export const MENSAJE_SOLICITUD_CODIGO =
  'Si el correo corresponde a una cuenta activa, enviamos un código de verificación a ese correo.';

/** Literal HU (Esc. 11, 12; lista de verificación "Mensajes"). */
export const MENSAJE_CODIGO_INVALIDO = 'Código inválido o vencido. Solicita uno nuevo.';

/** Literal HU (Esc. 8), sin punto final. */
export const MENSAJE_CONTRASENAS_NO_COINCIDEN = 'Las contraseñas no coinciden';

/** Campo "Código de verificación" vacío. Confirmado (R2). */
export const CODIGO_OBLIGATORIO = 'Ingresa el código de verificación.';

/** Campo "Código de verificación" con formato inválido. Confirmado (R2, R5). */
export const CODIGO_FORMATO = 'El código debe tener 6 dígitos.';

/** Campo "Nueva contraseña" vacío. Confirmado (R2). */
export const NUEVA_CONTRASENA_OBLIGATORIA = 'Ingresa la nueva contraseña.';

/** Campo "Confirmar contraseña" vacío. Confirmado (R2). */
export const CONFIRMACION_OBLIGATORIA = 'Confirma la nueva contraseña.';

/** Texto de ayuda permanente bajo la etiqueta "Nueva contraseña". Confirmado (R2). */
export const AYUDA_POLITICA_CONTRASENA = 'Entre 9 y 15 letras y números, con al menos una letra y un número.';

/** Anuncio para lector de pantalla al empezar la cuenta regresiva. Confirmado (R2). */
export const ANUNCIO_ESPERA_INICIO = `Podrás solicitar un nuevo código en ${ESPERA_REENVIO_SEGUNDOS} segundos.`;

/** Anuncio para lector de pantalla al terminar la cuenta regresiva. Confirmado (R2). */
export const ANUNCIO_ESPERA_FIN = 'Ya puedes solicitar un nuevo código.';

/**
 * Mapa congelado `clave de requisito → texto literal` de la política de
 * contraseñas (lista de verificación "Política"). Literales de la HU.
 */
export const MENSAJES_POLITICA_CONTRASENA = Object.freeze({
  LONGITUD: 'Debe tener entre 9 y 15 caracteres.',
  CARACTERES: 'Solo puede contener letras (A-Z, a-z) y números (0-9), sin tildes, ñ, espacios ni símbolos.',
  LETRA: 'Debe incluir al menos una letra.',
  NUMERO: 'Debe incluir al menos un número.'
});

/** Orden en que se muestran los requisitos incumplidos (orden de la HU). */
export const ORDEN_REQUISITOS_POLITICA = Object.freeze(['LONGITUD', 'CARACTERES', 'LETRA', 'NUMERO']);

/** Botón del paso 1 de "Restablecer contraseña". */
export const TEXTO_CONTINUAR = 'Continuar';

/** Botón del paso 2 para regresar al paso 1. */
export const TEXTO_VOLVER_PASO_1 = 'Volver al paso anterior';

/** Indicador de paso de la pantalla (b). */
export const TEXTO_PASO_1 = 'Paso 1 de 2: verifica tu correo';
export const TEXTO_PASO_2 = 'Paso 2 de 2: define tu nueva contraseña';

/** Rótulo de la lista de requisitos de la nueva contraseña. */
export const TEXTO_REQUISITOS_CONTRASENA = 'Tu contraseña debe cumplir:';

/** Versión corta de la política, solo para la lista que se marca al escribir. */
export const REQUISITOS_CORTOS_CONTRASENA = Object.freeze({
  LONGITUD: 'Entre 9 y 15 caracteres',
  CARACTERES: 'Solo letras y números, sin tildes, ñ, espacios ni símbolos',
  LETRA: 'Al menos una letra',
  NUMERO: 'Al menos un número'
});

export const TEXTO_REQUISITO_CUMPLIDO = 'Cumplido';
export const TEXTO_REQUISITO_PENDIENTE = 'Pendiente';
