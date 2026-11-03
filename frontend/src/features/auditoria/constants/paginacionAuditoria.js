/**
 * Tamaño de página del API de auditorías (contrato backend, default 20).
 * Constante local a la feature: por decisión del
 * usuario (D20, docs/planes/auditorias.md §A), la paginación se implementa en
 * el backend y el frontend no construye ningún paginador visible, así que no
 * hay nada que compartir con otras features.
 */
export const TAMANIO_PAGINA_AUDITORIA = 20;
