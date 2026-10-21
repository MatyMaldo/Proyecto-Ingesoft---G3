// TODO(pregunta): los grados los define la feature "grado-seccion" (Año escolar → creación de grado).
// Mientras no exista su servicio, se usan los cinco grados de secundaria en duro.

/**
 * Grados de secundaria, en orden. `valor` es el número de grado que viaja al backend.
 *
 * @type {ReadonlyArray<{ valor: string, etiqueta: string }>}
 */
export const GRADOS_ACADEMICOS = Object.freeze([
  Object.freeze({ valor: '1', etiqueta: '1ro Secundaria' }),
  Object.freeze({ valor: '2', etiqueta: '2do Secundaria' }),
  Object.freeze({ valor: '3', etiqueta: '3ro Secundaria' }),
  Object.freeze({ valor: '4', etiqueta: '4to Secundaria' }),
  Object.freeze({ valor: '5', etiqueta: '5to Secundaria' })
]);

/** Grado seleccionado al abrir la pantalla (según el prototipo). */
export const GRADO_INICIAL = '4';

const MAPA_ETIQUETAS_GRADO = new Map(GRADOS_ACADEMICOS.map((grado) => [grado.valor, grado.etiqueta]));

/**
 * Etiqueta visible de un grado. Un valor desconocido se muestra tal cual.
 *
 * @param {string} valor
 * @returns {string}
 */
export function obtenerEtiquetaGrado(valor) {
  return MAPA_ETIQUETAS_GRADO.get(valor) ?? valor;
}
