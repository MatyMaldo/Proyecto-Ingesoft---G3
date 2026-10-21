import {
  IDENTIFICADOR_OBLIGATORIO,
  IDENTIFICADOR_FORMATO,
  CONTRASENA_OBLIGATORIA
} from '../constants/mensajesLogin.js';

const PATRON_DNI = /^\d{8}$/;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida que el texto sea un DNI peruano (exactamente 8 dígitos).
 *
 * @param {string} texto
 * @returns {boolean}
 */
export function esDniValido(texto) {
  return PATRON_DNI.test(texto);
}

/**
 * Valida que el texto sea un correo electrónico con formato válido, sin
 * restringir el dominio.
 *
 * @param {string} texto
 * @returns {boolean}
 */
export function esCorreoValido(texto) {
  return PATRON_CORREO.test(texto);
}

/**
 * Valida el campo "Correo electrónico o DNI".
 *
 * @param {string} valor
 * @returns {string | null} Mensaje de error, o `null` si es válido.
 */
export function validarIdentificador(valor) {
  const recortado = valor.trim();

  if (recortado.length === 0) {
    return IDENTIFICADOR_OBLIGATORIO;
  }

  if (!esCorreoValido(recortado) && !esDniValido(recortado)) {
    return IDENTIFICADOR_FORMATO;
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
 * @param {{ identificador: string, contrasena: string }} valores
 * @returns {{ identificador?: string, contrasena?: string }} Objeto vacío si todo es válido.
 */
export function validarCredenciales({ identificador, contrasena }) {
  const errores = {};

  const errorIdentificador = validarIdentificador(identificador);
  if (errorIdentificador) {
    errores.identificador = errorIdentificador;
  }

  const errorContrasena = validarContrasena(contrasena);
  if (errorContrasena) {
    errores.contrasena = errorContrasena;
  }

  return errores;
}
