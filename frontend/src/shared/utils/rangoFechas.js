/**
 * Regla de validación del rango de fechas "Desde"/"Hasta", compartida por
 * Auditorías (HU-SAT-04, LAB05) y Log de errores (HU-SAT-05/06). Antes vivía
 * solo dentro de `features/log-errores/hooks/useLogErrores.js`; se movió aquí
 * para que ambas features usen el mismo texto (docs/planes/auditorias.md §3.2).
 */

// TODO(pregunta): texto propuesto, confirmar con la HU (docs/planes/log-errores.md §7).
export const MENSAJE_RANGO_FECHAS_INVALIDO =
  'La fecha «Desde» no puede ser posterior a la fecha «Hasta».';

/**
 * Valida un rango de fechas `'AAAA-MM-DD'`. Un rango con uno o los dos extremos
 * vacíos siempre es válido. Compara las cadenas directamente (orden lexicográfico
 * equivalente al cronológico en formato `AAAA-MM-DD`).
 *
 * @param {string} fechaDesde `'AAAA-MM-DD'` o `''`.
 * @param {string} fechaHasta `'AAAA-MM-DD'` o `''`.
 * @returns {string} `''` si el rango es válido; si no, `MENSAJE_RANGO_FECHAS_INVALIDO`.
 */
export function obtenerMensajeRangoFechas(fechaDesde, fechaHasta) {
  if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
    return MENSAJE_RANGO_FECHAS_INVALIDO;
  }
  return '';
}
