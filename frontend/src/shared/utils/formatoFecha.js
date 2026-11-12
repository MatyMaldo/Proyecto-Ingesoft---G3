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

/**
 * Convierte una fecha `AAAA-MM-DD` en `DD/MM/AAAA` para mostrarla. Solo
 * presentación: los filtros y el backend siguen usando `AAAA-MM-DD`.
 *
 * @param {string} fecha
 * @returns {string} La misma cadena si no tiene el formato esperado.
 */
export function formatearFechaVisible(fecha) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha ?? '');
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : fecha;
}

/**
 * Fecha corta para listados: `DD/MM` si la fecha es del año en curso (zona America/Lima) y
 * `DD/MM/AAAA` si es de otro año, para que los registros antiguos no se confundan.
 *
 * @param {string} fecha Fecha `AAAA-MM-DD`.
 * @param {Date} [hoy] Fecha de referencia; por defecto, la actual.
 * @returns {string} La misma cadena si no tiene el formato esperado.
 */
export function formatearFechaCompacta(fecha, hoy = new Date()) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha ?? '');
  if (!partes) {
    return fecha;
  }

  const anioActual = FORMATEADOR_FECHA.format(hoy).slice(0, 4);
  const diaMes = `${partes[3]}/${partes[2]}`;
  return partes[1] === anioActual ? diaMes : `${diaMes}/${partes[1]}`;
}
