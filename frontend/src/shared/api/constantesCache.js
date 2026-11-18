/**
 * Vigencia sugerida para catálogos que casi no cambian (años académicos, grados, aulas): se pasa como `cacheMs` en las
 * opciones de `solicitar`. Corta a propósito, porque lo que cambie otro usuario se verá al vencer.
 */
export const CACHE_CATALOGO_MS = 60000;
