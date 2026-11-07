import { ROLES } from '../../../shared/auth/roles.js';

/**
 * Roles habilitados para iniciar sesión en esta iteración (HU-SAT-07).
 * Las reglas reales de acceso las aplica el backend; esto es una comprobación defensiva de UX
 * (docs/planes/login.md §U3): la regla real la aplica el backend.
 *
 * @type {string[]}
 */

export const ROLES_HABILITADOS_LOGIN = Object.freeze([
  ROLES.ADMIN,
  ROLES.DOCENTE,
  ROLES.ESTUDIANTE,
  ROLES.APODERADO
]);

