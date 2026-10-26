import { NOMBRE_OBLIGATORIO, DESCRIPCION_OBLIGATORIA } from '../constants/mensajesCursos.js';

export const LONGITUD_MAXIMA_NOMBRE = 60;
export const LONGITUD_MAXIMA_DESCRIPCION = 160;

/**
 * @param {string} valor
 * @returns {string | null} Mensaje de error, o `null` si es válido.
 */
export function validarDescripcionCurso(valor) {
  return valor.trim().length === 0 ? DESCRIPCION_OBLIGATORIA : null;
}

/**
 * Valida los campos obligatorios del curso antes de llamar al servicio.
 *
 * @param {{ nombre: string, descripcion: string }} valores
 * @returns {{ nombre?: string, descripcion?: string }} Objeto vacío si todo es válido.
 */
export function validarCurso({ nombre, descripcion }) {
  const errores = {};

  if (nombre.trim().length === 0) {
    errores.nombre = NOMBRE_OBLIGATORIO;
  }

  const errorDescripcion = validarDescripcionCurso(descripcion);
  if (errorDescripcion) {
    errores.descripcion = errorDescripcion;
  }

  return errores;
}
