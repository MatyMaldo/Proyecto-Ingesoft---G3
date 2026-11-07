import { ROLES } from '../../../shared/auth/roles.js';

/**
 * Roles que entran a la pantalla. Por ahora solo el administrador.
 */
export const ROLES_QUE_VEN_HORARIOS = Object.freeze([ROLES.ADMIN]);

export const DIAS = Object.freeze([
  Object.freeze({ id: 'LUNES', etiqueta: 'Lunes' }),
  Object.freeze({ id: 'MARTES', etiqueta: 'Martes' }),
  Object.freeze({ id: 'MIERCOLES', etiqueta: 'Miércoles' }),
  Object.freeze({ id: 'JUEVES', etiqueta: 'Jueves' }),
  Object.freeze({ id: 'VIERNES', etiqueta: 'Viernes' })
]);

export function obtenerEtiquetaDia(diaId) {
  return DIAS.find((dia) => dia.id === diaId)?.etiqueta ?? diaId;
}
