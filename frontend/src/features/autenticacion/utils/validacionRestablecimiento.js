import { validarCorreo } from './validacionLogin.js';
import { LONGITUD_CODIGO, CONTRASENA_LONGITUD_MIN, CONTRASENA_LONGITUD_MAX } from '../constants/reglasRestablecimiento.js';
import {
  CODIGO_OBLIGATORIO,
  CODIGO_FORMATO,
  NUEVA_CONTRASENA_OBLIGATORIA,
  CONFIRMACION_OBLIGATORIA,
  MENSAJE_CONTRASENAS_NO_COINCIDEN,
  MENSAJES_POLITICA_CONTRASENA,
  ORDEN_REQUISITOS_POLITICA
} from '../constants/mensajesRestablecimiento.js';

const PATRON_CODIGO = new RegExp(`^\\d{${LONGITUD_CODIGO}}$`);
const PATRON_SOLO_ALFANUMERICO = /^[A-Za-z0-9]+$/;
const PATRON_LETRA = /[A-Za-z]/;
const PATRON_NUMERO = /[0-9]/;

/**
 * Valida que el texto tenga exactamente `LONGITUD_CODIGO` dígitos numéricos.
 *
 * @param {string} texto
 * @returns {boolean}
 */
export function esCodigoValido(texto) {
  return PATRON_CODIGO.test(texto);
}

/**
 * Valida el campo "Código de verificación": obligatorio y formato de
 * `LONGITUD_CODIGO` dígitos (docs/planes/restablecer-contrasena.md §6.2, §7.5).
 *
 * @param {string} valor
 * @returns {string | null} Mensaje de error, o `null` si es válido.
 */
export function validarCodigo(valor) {
  const recortado = valor.trim();

  if (recortado.length === 0) {
    return CODIGO_OBLIGATORIO;
  }

  if (!esCodigoValido(recortado)) {
    return CODIGO_FORMATO;
  }

  return null;
}

/**
 * Evalúa la política de contraseñas de HU-SAT-03 y devuelve las claves de los
 * requisitos incumplidos, en el orden de la HU. No recorta el valor: un
 * espacio es en sí mismo un incumplimiento de "solo alfanumérico".
 *
 * @param {string} valor
 * @returns {string[]} Claves incumplidas (`LONGITUD`, `CARACTERES`, `LETRA`, `NUMERO`). Vacío si cumple todo.
 */
export function evaluarPoliticaContrasena(valor) {
  const incumplidos = [];
  const longitud = Array.from(valor).length;

  if (longitud < CONTRASENA_LONGITUD_MIN || longitud > CONTRASENA_LONGITUD_MAX) {
    incumplidos.push('LONGITUD');
  }

  if (!PATRON_SOLO_ALFANUMERICO.test(valor)) {
    incumplidos.push('CARACTERES');
  }

  if (!PATRON_LETRA.test(valor)) {
    incumplidos.push('LETRA');
  }

  if (!PATRON_NUMERO.test(valor)) {
    incumplidos.push('NUMERO');
  }

  // Se reordena según ORDEN_REQUISITOS_POLITICA para mantener un único lugar
  // de verdad sobre el orden en que se muestran los requisitos.
  return ORDEN_REQUISITOS_POLITICA.filter((clave) => incumplidos.includes(clave));
}

/**
 * Valida el campo "Nueva contraseña": obligatorio o lista de textos literales
 * de los requisitos incumplidos.
 *
 * @param {string} valor
 * @returns {string | string[] | null}
 */
export function validarNuevaContrasena(valor) {
  if (valor.length === 0) {
    return NUEVA_CONTRASENA_OBLIGATORIA;
  }

  const incumplidos = evaluarPoliticaContrasena(valor);

  if (incumplidos.length === 0) {
    return null;
  }

  return incumplidos.map((clave) => MENSAJES_POLITICA_CONTRASENA[clave]);
}

/**
 * Valida el campo "Confirmar contraseña": obligatorio, y luego comparado
 * carácter por carácter contra la nueva contraseña (aunque esta incumpla la
 * política, para poder mostrar los Esc. 8 y 9 a la vez).
 *
 * @param {string} nueva
 * @param {string} confirmacion
 * @returns {string | null}
 */
export function validarConfirmacion(nueva, confirmacion) {
  if (confirmacion.length === 0) {
    return CONFIRMACION_OBLIGATORIA;
  }

  if (confirmacion !== nueva) {
    return MENSAJE_CONTRASENAS_NO_COINCIDEN;
  }

  return null;
}

/**
 * Valida los cuatro campos de la pantalla "Restablecer contraseña" antes de
 * llamar al servicio (docs/planes/restablecer-contrasena.md §7.5).
 *
 * @param {{ correo: string, codigo: string, nuevaContrasena: string, confirmacionContrasena: string }} valores
 * @returns {{ correo?: string, codigo?: string, nuevaContrasena?: string|string[], confirmacionContrasena?: string }}
 */
export function validarRestablecimiento({ correo, codigo, nuevaContrasena, confirmacionContrasena }) {
  const errores = {};

  const errorCorreo = validarCorreo(correo);
  if (errorCorreo) {
    errores.correo = errorCorreo;
  }

  const errorCodigo = validarCodigo(codigo);
  if (errorCodigo) {
    errores.codigo = errorCodigo;
  }

  const errorNuevaContrasena = validarNuevaContrasena(nuevaContrasena);
  if (errorNuevaContrasena) {
    errores.nuevaContrasena = errorNuevaContrasena;
  }

  const errorConfirmacion = validarConfirmacion(nuevaContrasena, confirmacionContrasena);
  if (errorConfirmacion) {
    errores.confirmacionContrasena = errorConfirmacion;
  }

  return errores;
}
