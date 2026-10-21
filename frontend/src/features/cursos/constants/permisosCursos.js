import { ROLES } from '../../../shared/auth/roles.js';

/**
 * Permisos de la feature Cursos. Es el ÚNICO lugar donde se decide quién ve y quién gestiona;
 * para cambiar la regla más adelante basta con editar estas dos listas.
 *
 * Esto solo controla qué muestra la interfaz. La autorización real la valida el backend
 * (EAC-01 del documento de arquitectura).
 */

/**
 * Roles que pueden entrar a la pantalla. `routes.jsx` los usa en `rolesPermitidos` y el ítem de
 * navegación "Cursos" del shell debe usar la misma lista. Por ahora, todos.
 */
export const ROLES_QUE_VEN_CURSOS = Object.freeze([
  ROLES.ADMIN,
  ROLES.DOCENTE,
  ROLES.ESTUDIANTE,
  ROLES.APODERADO
]);

/**
 * Roles que pueden crear cursos y añadir competencias. Por ahora, solo el administrador
 * (HU-EVAL-08). // TODO(pregunta): la sección 2.3 del documento de arquitectura dice que las
 * competencias las configura el docente tutor; confirmar con el equipo antes de ampliar la lista.
 */
export const ROLES_QUE_GESTIONAN_CURSOS = Object.freeze([ROLES.ADMIN]);

/**
 * @param {string|null|undefined} rol
 * @returns {boolean}
 */
export function puedeGestionarCursos(rol) {
  return ROLES_QUE_GESTIONAN_CURSOS.includes(rol);
}
