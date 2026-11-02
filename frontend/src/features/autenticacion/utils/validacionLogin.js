import { CORREO_OBLIGATORIO, CORREO_FORMATO, CONTRASENA_OBLIGATORIA } from '../constants/mensajesLogin.js';

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida que el texto sea un correo electrónico con formato válido, sin
 * restringir el dominio (docs/planes/login.md D31: formato genérico).
 *
 * @param {string} texto
 * @returns {boolean}
 */
export function esCorreoValido(texto) {
  return PATRON_CORREO.test(texto);
}

/**
 * Valida el campo "Correo electrónico".
 *
 * @param {string} valor
 * @returns {string | null} Mensaje de error, o `null` si es válido.
 */
export function validarCorreo(valor) {
  const recortado = valor.trim();

  if (recortado.length === 0) {
    return CORREO_OBLIGATORIO;
  }

  if (!esCorreoValido(recortado)) {
    return CORREO_FORMATO;
  }

  return null;
}

/**
 * Valida el campo "Contraseña". No se recorta ni se le exige longitud o
 * complejidad: esas reglas son del backend.
 *
 * @param {string} valor
 * @returns {string | null} Mensaje de error, o `null` si es válido.
 */
export function validarContrasena(valor) {
  if (valor.length === 0) {
    return CONTRASENA_OBLIGATORIA;
  }

  return null;
}

/**
 * Valida los campos de credenciales antes de llamar al servicio.
 *
 * @param {{ correo: string, contrasena: string }} valores
 * @returns {{ correo?: string, contrasena?: string }} Objeto vacío si todo es válido.
 */
export function validarCredenciales({ correo, contrasena }) {
  const errores = {};

  const errorCorreo = validarCorreo(correo);
  if (errorCorreo) {
    errores.correo = errorCorreo;
  }

  const errorContrasena = validarContrasena(contrasena);
  if (errorContrasena) {
    errores.contrasena = errorContrasena;
  }

  return errores;
}
