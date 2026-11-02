import { ROLES } from '../../../shared/auth/roles.js';

/**
 * Roles que entran a la pantalla. Por ahora solo el administrador (la pantalla de consulta para
 * docente, estudiante y apoderado se desarrollará aparte). Si se amplía, hay que editar también
 * `roles` del ítem "Horarios" en `navegacion.config.js`.
 */
export const ROLES_QUE_VEN_HORARIOS = Object.freeze([ROLES.ADMIN]);

export const DIAS = Object.freeze([
  Object.freeze({ id: 'LUNES', etiqueta: 'Lunes' }),
  Object.freeze({ id: 'MARTES', etiqueta: 'Martes' }),
  Object.freeze({ id: 'MIERCOLES', etiqueta: 'Miércoles' }),
  Object.freeze({ id: 'JUEVES', etiqueta: 'Jueves' }),
  Object.freeze({ id: 'VIERNES', etiqueta: 'Viernes' })
]);

/**
 * Franjas de la jornada, en orden. Las de `tipo: 'recreo'` no se asignan.
 *
 * @type {ReadonlyArray<{ id: string, tipo: 'clase'|'recreo', inicio: string, fin: string }>}
 */
export const FRANJAS = Object.freeze([
  Object.freeze({ id: 'F1', tipo: 'clase', inicio: '08:00', fin: '09:00' }),
  Object.freeze({ id: 'F2', tipo: 'clase', inicio: '09:00', fin: '10:00' }),
  Object.freeze({ id: 'F3', tipo: 'clase', inicio: '10:00', fin: '11:00' }),
  Object.freeze({ id: 'R1', tipo: 'recreo', inicio: '11:00', fin: '11:30' }),
  Object.freeze({ id: 'F4', tipo: 'clase', inicio: '11:30', fin: '12:30' }),
  Object.freeze({ id: 'F5', tipo: 'clase', inicio: '12:30', fin: '13:30' })
]);

/** Clave de un bloque dentro del mapa del horario. */
export function claveBloque(dia, franjaId) {
  return `${dia}|${franjaId}`;
}

export function obtenerEtiquetaDia(diaId) {
  return DIAS.find((dia) => dia.id === diaId)?.etiqueta ?? diaId;
}
