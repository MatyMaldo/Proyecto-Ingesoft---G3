/**
 * Mapa de código de módulo → tono visual (uno de los 10 tonos de MASTER.md).
 * Lo usan la insignia de módulo de las tablas y el chip de filtro activo.
 * Los tonos de tipo de error son propios de la feature log-errores (no viven aquí).
 */
export const TONOS_MODULO = Object.freeze({
  NOTAS: 'azul',
  USUARIOS: 'violeta',
  ASISTENCIA: 'verde',
  MATRICULAS: 'ambar',
  PAGOS: 'turquesa',
  HORARIOS: 'indigo',
  SISTEMA: 'gris',
  EVALUACIONES: 'rosa',
  AUTENTICACION: 'rojo',
  REPORTES: 'cian'
});

/**
 * Obtiene el tono de un código de módulo.
 *
 * @param {string} codigo
 * @returns {string} El tono correspondiente, o `'gris'` si el código no existe.
 */
export function obtenerTonoModulo(codigo) {
  return TONOS_MODULO[codigo] ?? 'gris';
}
