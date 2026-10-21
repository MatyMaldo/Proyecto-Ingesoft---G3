import {
  NOMBRE_OBLIGATORIO,
  DESCRIPCION_OBLIGATORIA,
  mensajeNombreDuplicado
} from '../constants/mensajesCursos.js';

export const LONGITUD_MAXIMA_NOMBRE = 60;
export const LONGITUD_MAXIMA_DESCRIPCION = 160;

/**
 * Quita tildes y pasa a minúsculas, para comparar nombres sin distinguir mayúsculas ni tildes.
 *
 * @param {string} texto
 * @returns {string}
 */
export function normalizarNombre(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * @param {string} valor
 * @param {string[]} nombresExistentes Nombres de los cursos del grado seleccionado.
 * @param {string} etiquetaGrado
 * @returns {string | null} Mensaje de error, o `null` si es válido.
 */
export function validarNombreCurso(valor, nombresExistentes, etiquetaGrado) {
  const recortado = valor.trim();

  if (recortado.length === 0) {
    return NOMBRE_OBLIGATORIO;
  }

  const normalizado = normalizarNombre(recortado);
  if (nombresExistentes.some((nombre) => normalizarNombre(nombre) === normalizado)) {
    return mensajeNombreDuplicado(recortado, etiquetaGrado);
  }

  return null;
}

/**
 * @param {string} valor
 * @returns {string | null} Mensaje de error, o `null` si es válido.
 */
export function validarDescripcionCurso(valor) {
  return valor.trim().length === 0 ? DESCRIPCION_OBLIGATORIA : null;
}

/**
 * Valida el formulario "Crear curso" antes de llamar al servicio. El backend repite estas reglas.
 *
 * @param {{ nombre: string, descripcion: string }} valores
 * @param {string[]} nombresExistentes
 * @param {string} etiquetaGrado
 * @returns {{ nombre?: string, descripcion?: string }} Objeto vacío si todo es válido.
 */
export function validarCurso({ nombre, descripcion }, nombresExistentes, etiquetaGrado) {
  const errores = {};

  const errorNombre = validarNombreCurso(nombre, nombresExistentes, etiquetaGrado);
  if (errorNombre) {
    errores.nombre = errorNombre;
  }

  const errorDescripcion = validarDescripcionCurso(descripcion);
  if (errorDescripcion) {
    errores.descripcion = errorDescripcion;
  }

  return errores;
}
