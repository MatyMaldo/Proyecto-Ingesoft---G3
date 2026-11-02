/**
 * Mapa de código de módulo → tono visual (uno de los tonos de `tokens.css`).
 * Lo usan la insignia de módulo de las tablas y el chip de filtro activo.
 * Paleta neutra (shell.md §20.4, 2026-11-01): verde, ámbar y rojo quedan reservados
 * para estados de negocio (Pagado/Pendiente/Vencido, Presente/Tardanza/Falta, etc.).
 * `AUTENTICACION` y `REPORTES` se conservan en gris (decisión del usuario, G-3,
 * 2026-11-01): no están en los chips de filtro vigentes, pero el log puede seguir
 * recibiendo registros con esos códigos. Los tonos de tipo de error son propios de
 * la feature log-errores (no viven aquí).
 */
export const TONOS_MODULO = Object.freeze({
  NOTAS: 'azul',
  USUARIOS: 'violeta',
  ASISTENCIA: 'cian',
  MATRICULAS: 'marino',
  CONFIGURACION: 'acero',
  PAGOS: 'turquesa',
  HORARIOS: 'indigo',
  SISTEMA: 'gris',
  EVALUACIONES: 'ciruela',
  AUTENTICACION: 'gris',
  REPORTES: 'gris'
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
