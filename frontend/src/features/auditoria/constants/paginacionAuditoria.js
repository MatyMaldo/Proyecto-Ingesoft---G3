/**
 * Tamaño de página del listado de auditorías: 10 en 10, igual que Usuarios, Pagos, Matrículas y Log de errores
 * (decisión del usuario, 2026-11-09; antes 15 según HU-SAT-04, Esc. 4).
 * Se envía al backend como `size` y el mock lo respeta.
 */
export const TAMANIO_PAGINA_AUDITORIA = 10;

/**
 * Máximo de registros que se piden para el historial de una transacción (no se pagina: la HU solo pagina
 * la búsqueda general, HU-SAT-04 L8).
 */
export const TAMANIO_HISTORIAL_AUDITORIA = 20;
