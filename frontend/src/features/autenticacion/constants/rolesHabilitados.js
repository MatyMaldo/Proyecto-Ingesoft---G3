import { ROLES } from '../../../shared/auth/roles.js';

/**
 * Roles habilitados para iniciar sesión en esta iteración (HU-SAT-07, alcance
 * Sprint 1: "indica que el acceso para su rol aún no está habilitado"). Se
 * amplía con cada rol a medida que se desarrollan sus módulos (Docente,
 * Estudiante, Apoderado). Es una comprobación defensiva de UX
 * (docs/planes/login.md §U3): la regla real la aplica el backend.
 *
 * @type {string[]}
 */
export const ROLES_HABILITADOS_LOGIN = Object.freeze([ROLES.ADMIN, ROLES.DOCENTE]);
