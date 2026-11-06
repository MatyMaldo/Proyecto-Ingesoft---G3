/**
 * Tamaño de página del listado de auditorías: 15 en 15 (HU-SAT-04, Esc. 4; igual que HU-SAT-02 y HU-SAT-05).
 * Se envía al backend como `size` y el mock lo respeta.
 */
export const TAMANIO_PAGINA_AUDITORIA = 15;

/**
 * Máximo de registros que se piden para el historial de una transacción (no se pagina: la HU solo pagina
 * la búsqueda general, HU-SAT-04 L8).
 */
export const TAMANIO_HISTORIAL_AUDITORIA = 20;
