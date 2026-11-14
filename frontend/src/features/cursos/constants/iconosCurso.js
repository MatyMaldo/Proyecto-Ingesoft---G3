/**
 * Ícono de cada curso. Todos usan el mismo estilo de línea del catálogo de `Icono`, para no mezclar
 * trazos con emojis. Es solo presentación (no viaja en la API).
 */
export const ICONO_CURSO_POR_DEFECTO = 'libro';

/**
 * @param {string} _nombreCurso
 * @returns {string} Nombre del ícono en el catálogo de `Icono`.
 */
export function obtenerIconoCurso(_nombreCurso) {
  return ICONO_CURSO_POR_DEFECTO;
}
