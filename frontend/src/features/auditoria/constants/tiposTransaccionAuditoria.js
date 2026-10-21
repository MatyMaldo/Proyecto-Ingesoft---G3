// TODO(backend): catálogo ilustrativo de tipos de transacción (D2/D14 resueltas por decisión
// del dueño del producto, 2026-10-20: la HU exige un filtro explícito y separado por tipo de
// transacción, además de la búsqueda de texto libre). La lista real y si se agrupa por
// categoría la define el backend; aquí solo se listan los tipos que ya aparecen en el mock
// (docs/planes/auditorias.md §8.7), en orden alfabético.

/**
 * Catálogo de tipos de transacción para el filtro explícito de Esc. 4
 * (docs/planes/auditorias.md, §4.1 y §6.3). Lista plana: no se agrupa por categoría
 * porque el backend aún no define esa estructura.
 */
export const TIPOS_TRANSACCION_AUDITORIA = Object.freeze(
  [
    'Cambió estado de sesión de clase',
    'Canceló matrícula al finalizar el periodo de matrícula',
    'Confirmó matrícula',
    'Creó usuario',
    'Generó libreta',
    'Modificó bloque de horario',
    'Modificó calificación',
    'Observó pago',
    'Registró asistencia',
    'Registró calificación',
    'Registró comprobante de pago',
    'Registró notas de evaluación',
    'Registró sección',
    'Reenvió comprobante de pago',
    'Validó pago'
  ].sort((a, b) => a.localeCompare(b, 'es'))
);
