// TODO(backend): confirmar si el parámetro `tipoTransaccion` del filtro (Esc. 4) lleva el
// nombre literal del tipo o un código propio (D24, docs/planes/auditorias.md §C).

/**
 * Catálogo cerrado de tipos de transacción de HU-SAT-04 (lista de verificación: "lista
 * cerrada; las demás historias usan estos nombres"), agrupado por categoría en el orden
 * de la HU (docs/planes/auditorias.md §C, 2026-11-01). Reemplaza al catálogo plano e
 * ilustrativo de la pasada anterior (D2/D14).
 *
 * Los grupos `SISTEMA` y `EVALUACIONES` no están en el catálogo de la HU: existen solo
 * para que los registros de ejemplo que D9 mantiene sin cambios (AUD-0004 y AUD-0009,
 * docs/planes/auditorias.md §15, D9/D22) sigan pudiendo filtrarse por tipo. Si D9 o D22
 * los retiran, estos dos grupos se borran junto con esos registros.
 */
export const GRUPOS_TIPOS_TRANSACCION_AUDITORIA = Object.freeze([
  Object.freeze({
    categoria: 'USUARIOS',
    tipos: Object.freeze([
      'Registro de usuario',
      'Edición de usuario',
      'Desactivación de usuario',
      'Reactivación de usuario',
      'Definición inicial de contraseña',
      'Restablecimiento de contraseña',
      'Designación de tutor',
      'Cambio de tutor',
      'Retiro de designación de tutor',
      'Cambio de rol de usuario'
    ])
  }),
  Object.freeze({
    categoria: 'MATRICULAS',
    tipos: Object.freeze(['Registro de matrícula', 'Cancelación automática de matrícula'])
  }),
  Object.freeze({
    categoria: 'PAGOS',
    tipos: Object.freeze([
      'Emisión de compromiso de matrícula',
      'Emisión de compromiso de pensión',
      'Registro de pago',
      'Validación de pago',
      'Rechazo de pago',
      'Registro de devolución'
    ])
  }),
  Object.freeze({
    categoria: 'ASISTENCIA',
    tipos: Object.freeze([
      'Registro de asistencia de estudiantes',
      'Modificación de asistencia de estudiantes',
      'Registro de asistencia de docente',
      'Asignación automática de Falta a estudiante',
      'Asignación automática de Falta a docente'
    ])
  }),
  Object.freeze({
    categoria: 'NOTAS',
    tipos: Object.freeze([
      'Registro de nota de evaluación',
      'Modificación de nota de evaluación',
      'Registro de nota de competencia',
      'Modificación de nota de competencia',
      'Registro de nota final del curso',
      'Modificación de nota final del curso',
      'Generación de libreta'
    ])
  }),
  Object.freeze({
    categoria: 'HORARIOS',
    tipos: Object.freeze([
      'Creación de bloque horario',
      'Edición de bloque horario',
      'Eliminación de bloque horario',
      'Cambio de docente de un curso',
      'Carga masiva de bloques'
    ])
  }),
  Object.freeze({
    categoria: 'CONFIGURACION',
    tipos: Object.freeze([
      'Registro de secciones de un año académico',
      'Creación de curso',
      'Modificación de curso',
      'Eliminación de curso'
    ])
  }),
  // D9: no está en el catálogo de la HU-SAT-04.
  Object.freeze({ categoria: 'SISTEMA', tipos: Object.freeze(['Cambió estado de sesión de clase']) }),
  // D9: no está en el catálogo de la HU-SAT-04.
  Object.freeze({ categoria: 'EVALUACIONES', tipos: Object.freeze(['Generó libreta']) })
]);
