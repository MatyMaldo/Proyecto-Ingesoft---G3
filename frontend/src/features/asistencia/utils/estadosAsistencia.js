/** Estados de asistencia admitidos por el contrato propuesto. */
export const ESTADOS_ASISTENCIA = Object.freeze([
  'PRESENTE',
  'TARDANZA',
  'FALTA',
  'JUSTIFICADA'
]);

const ETIQUETAS = Object.freeze({
  PRESENTE: 'Asistió',
  TARDANZA: 'Tardanza',
  FALTA: 'Falta',
  JUSTIFICADA: 'Justificada'
});

export function normalizarEstadoAsistencia(estado) {
  return String(estado ?? '').toUpperCase();
}

export function etiquetaEstadoAsistencia(estado) {
  const normalizado = normalizarEstadoAsistencia(estado);
  return ETIQUETAS[normalizado] ?? normalizado;
}

export function tonoEstadoAsistencia(estado) {
  const normalizado = normalizarEstadoAsistencia(estado);
  if (normalizado === 'PRESENTE') return 'verde';
  if (normalizado === 'TARDANZA') return 'ambar';
  if (normalizado === 'FALTA') return 'rojo';
  if (normalizado === 'JUSTIFICADA') return 'azul';
  return 'gris';
}

/**
 * Resume los registros de una consulta. La asistencia general se calcula sobre
 * las sesiones con registro, usando solo PRESENTE como asistencia efectiva.
 */
export function resumirAsistencia(registros = []) {
  const resumen = {
    total: registros.length,
    presentes: 0,
    tardanzas: 0,
    faltas: 0,
    justificadas: 0,
    porcentaje: 0
  };

  registros.forEach((registro) => {
    const estado = normalizarEstadoAsistencia(registro.estado);
    if (estado === 'PRESENTE') resumen.presentes += 1;
    else if (estado === 'TARDANZA') resumen.tardanzas += 1;
    else if (estado === 'FALTA') resumen.faltas += 1;
    else if (estado === 'JUSTIFICADA') resumen.justificadas += 1;
  });

  resumen.porcentaje = resumen.total > 0
    ? Number((((resumen.presentes + resumen.tardanzas) / resumen.total) * 100).toFixed(2))
    : 0;

  return resumen;
}

/** Porcentaje con dos decimales, tal como lo devuelve backend. */
export function formatearPorcentajeAsistencia(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero.toFixed(2) : '0.00';
}
