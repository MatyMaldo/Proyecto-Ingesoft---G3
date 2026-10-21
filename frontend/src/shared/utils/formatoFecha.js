// TODO(pregunta): confirmar zona horaria con backend.
const ZONA_HORARIA = 'America/Lima';

const FORMATEADOR_FECHA = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const FORMATEADOR_HORA = new Intl.DateTimeFormat('es-PE', {
  timeZone: ZONA_HORARIA,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

/**
 * Separa una fecha-hora ISO en fecha (AAAA-MM-DD) y hora (HH:mm), en zona America/Lima.
 *
 * @param {string} fechaIso Fecha-hora en formato ISO 8601.
 * @returns {{ fecha: string, hora: string }}
 */
export function formatearFechaHora(fechaIso) {
  const fecha = new Date(fechaIso);

  return {
    fecha: FORMATEADOR_FECHA.format(fecha),
    hora: FORMATEADOR_HORA.format(fecha)
  };
}

/**
 * Calcula cuántos días calendario abarca una lista de fechas ISO (desde la más
 * antigua hasta la más reciente, ambas incluidas). Útil para la insignia
 * "Últimos N días" de las cabeceras de Auditorías y Log de errores.
 *
 * @param {string[]} fechasIso
 * @returns {number} 0 si la lista está vacía.
 */
export function calcularDiasAbarcados(fechasIso) {
  if (!fechasIso || fechasIso.length === 0) {
    return 0;
  }

  const tiempos = fechasIso.map((fechaIso) => new Date(fechaIso).getTime());
  const milisegundosPorDia = 24 * 60 * 60 * 1000;
  const diferencia = Math.max(...tiempos) - Math.min(...tiempos);

  return Math.floor(diferencia / milisegundosPorDia) + 1;
}
