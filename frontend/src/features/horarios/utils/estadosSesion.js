const ETIQUETAS = {
  PROGRAMADA: 'Programada',
  ACTIVA: 'Activa',
  FINALIZADA: 'Finalizada',
  OMITIDA: 'Omitida',
  REALIZADA: 'Realizada',
  COMPLETADA: 'Completada',
  DICTADA: 'Dictada',
  EN_CURSO: 'En curso',
  CANCELADA: 'Cancelada',
  SUSPENDIDA: 'Suspendida'
};

export function normalizarEstadoSesion(estado) {
  return String(estado ?? '').toUpperCase();
}

export function etiquetaEstadoSesion(estado) {
  const normalizado = normalizarEstadoSesion(estado);
  if (ETIQUETAS[normalizado]) return ETIQUETAS[normalizado];
  return normalizado
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letra) => letra.toUpperCase());
}

export function tonoEstadoSesion(estado) {
  const normalizado = normalizarEstadoSesion(estado);
  if (normalizado === 'CANCELADA' || normalizado === 'SUSPENDIDA') return 'rojo';
  if (normalizado === 'OMITIDA') return 'ambar';
  if (['REALIZADA', 'COMPLETADA', 'DICTADA'].includes(normalizado)) return 'verde';
  if (['PROGRAMADA', 'ACTIVA', 'EN_CURSO'].includes(normalizado)) return 'azul';
  return 'gris';
}

/**
 * Solo las sesiones programadas u omitidas pueden cambiar de omisión mientras
 * todavía no hayan comenzado. El backend valida la misma regla.
 */
export function puedeCambiarOmisionSesion(sesion, ahora = new Date()) {
  const estado = normalizarEstadoSesion(sesion?.estado);
  if (estado !== 'PROGRAMADA' && estado !== 'OMITIDA') return false;
  if (!sesion?.fecha || !sesion?.horaInicio) return false;

  const inicio = new Date(`${sesion.fecha}T${String(sesion.horaInicio).slice(0, 8)}`);
  if (Number.isNaN(inicio.getTime())) return false;
  return inicio > ahora;
}
