/** Líneas de la traza que se muestran antes de pulsar «Ver traza completa». */
export const LINEAS_TRAZA_RESUMIDA = 12;

const PATRON_CAUSA = /^\s*Caused by:/;

/**
 * Recorta una traza técnica a sus primeras líneas, conservando las líneas «Caused by:» que queden
 * fuera del recorte (con la línea que las sigue), porque suelen explicar el origen real del error.
 *
 * @param {string} traza Texto completo del detalle técnico.
 * @param {number} [maxLineas] Líneas iniciales que se conservan.
 * @returns {{ texto: string, lineasOcultas: number, totalLineas: number }}
 *   `texto` es la traza resumida (o la completa si no hace falta recortar) y `lineasOcultas`
 *   cuántas líneas quedaron fuera del resumen.
 */
export function resumirTraza(traza, maxLineas = LINEAS_TRAZA_RESUMIDA) {
  const lineas = (traza ?? '').replace(/\s+$/, '').split('\n');
  const totalLineas = lineas.length;

  if (totalLineas <= maxLineas) {
    return { texto: lineas.join('\n'), lineasOcultas: 0, totalLineas };
  }

  const visibles = lineas.slice(0, maxLineas);
  const resto = lineas.slice(maxLineas);
  const causas = [];
  resto.forEach((linea, indice) => {
    if (PATRON_CAUSA.test(linea)) {
      causas.push(linea);
      if (resto[indice + 1] !== undefined && !PATRON_CAUSA.test(resto[indice + 1])) {
        causas.push(resto[indice + 1]);
      }
    }
  });

  const lineasOcultas = totalLineas - maxLineas - causas.length;
  const marca = lineasOcultas > 0 ? [`\t… ${lineasOcultas} ${lineasOcultas === 1 ? 'línea omitida' : 'líneas omitidas'}`] : [];

  return { texto: [...visibles, ...marca, ...causas].join('\n'), lineasOcultas, totalLineas };
}
