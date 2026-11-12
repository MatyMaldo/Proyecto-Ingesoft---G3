/**
 * Formatos de presentación de la consulta de cursos del estudiante (HU-EVAL-03).
 */

/**
 * Acorta el nombre del grado como en el prototipo: "1er Grado de Secundaria" → "1er Grado".
 *
 * @param {string|null|undefined} gradoNombre
 * @returns {string}
 */
export function abreviarGrado(gradoNombre) {
  return String(gradoNombre ?? '').replace(/\s+de\s+secundaria\s*$/i, '').trim();
}

/**
 * Texto del docente de una tarjeta: "Prof. Juan Perez". No repite el prefijo si el nombre ya lo trae.
 *
 * @param {string|null|undefined} docenteNombre
 * @returns {string} Cadena vacía si no hay docente.
 */
export function textoDocente(docenteNombre) {
  const nombre = String(docenteNombre ?? '').trim();
  if (!nombre) {
    return '';
  }
  return /^prof(\.|esor|esora)?\s/i.test(nombre) ? nombre : `Prof. ${nombre}`;
}

/**
 * Fecha corta en español ("20 mar 2027") a partir de una fecha ISO `AAAA-MM-DD`. Si no se puede
 * interpretar, devuelve el texto recibido sin cambios.
 *
 * @param {string|null|undefined} fechaIso
 * @returns {string}
 */
export function formatearFecha(fechaIso) {
  const texto = String(fechaIso ?? '');
  const fecha = new Date(`${texto.slice(0, 10)}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}/.test(texto) || Number.isNaN(fecha.getTime())) {
    return texto;
  }
  return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '');
}

/** Insignia (tono de `Insignia`) de cada nota de la escala CNEB. */
export const TONO_NOTA = Object.freeze({ AD: 'turquesa', A: 'verde', B: 'ambar', C: 'rojo' });

/**
 * Texto de la pestaña de asistencia: "Hoy 19 Sep".
 *
 * @param {Date} [fecha] Por defecto, hoy.
 * @returns {string}
 */
export function textoHoy(fecha = new Date()) {
  const dia = fecha.getDate();
  const mes = fecha.toLocaleDateString('es-PE', { month: 'short' }).replace(/\./g, '');
  return `Hoy ${dia} ${mes.charAt(0).toUpperCase()}${mes.slice(1)}`;
}
