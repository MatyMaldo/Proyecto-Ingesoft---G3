/** Meses en que se emite la pensión (el año escolar empieza en marzo). */
export const MESES_PENSION = [
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SETIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE'
];

/** Mes de pensión que corresponde a hoy, o cadena vacía si hoy no cae en un mes de pensión (enero y febrero). */
export function mesActual() {
  const numeroMes = new Date().getMonth() + 1;
  return MESES_PENSION[numeroMes - 3] ?? '';
}

/**
 * Indica si el año académico incluye la fecha de hoy.
 *
 * @param {{ fechaInicio?: string, fechaFin?: string }|undefined} anio
 * @returns {boolean|null} `null` si el año no trae fechas (no se puede saber).
 */
export function anioEstaVigente(anio) {
  if (!anio?.fechaInicio || !anio?.fechaFin) return null;
  const hoy = new Date().toLocaleDateString('en-CA');
  const inicio = String(anio.fechaInicio).slice(0, 10);
  const fin = String(anio.fechaFin).slice(0, 10);
  return hoy >= inicio && hoy <= fin;
}
