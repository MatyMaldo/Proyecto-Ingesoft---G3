import { ROLES } from '../../../shared/auth/roles.js';

// TODO(pregunta): habilitar Docente, Estudiante y Apoderado cuando existan sus pantallas.

/**
 * @typedef {Object} PerfilAcceso
 * @property {string} valor Uno de `ROLES`.
 * @property {string} etiqueta Texto visible.
 * @property {string} icono Clave del catálogo de `Icono`.
 * @property {boolean} habilitado `false`: radio `disabled`, no seleccionable ni enfocable.
 */

/**
 * Perfiles del selector de la pantalla de inicio de sesión, en el orden del
 * prototipo y de la HU. Solo Administrador está habilitado en esta iteración
 * (docs/planes/login.md §0, §6.6).
 *
 * @type {PerfilAcceso[]}
 */
export const PERFILES_ACCESO = Object.freeze([
  Object.freeze({ valor: ROLES.ADMIN, etiqueta: 'Administrador', icono: 'escudo', habilitado: true }),
  Object.freeze({ valor: ROLES.DOCENTE, etiqueta: 'Docente', icono: 'monitor', habilitado: false }),
  Object.freeze({ valor: ROLES.ESTUDIANTE, etiqueta: 'Estudiante', icono: 'birrete', habilitado: false }),
  Object.freeze({ valor: ROLES.APODERADO, etiqueta: 'Apoderado', icono: 'usuarios', habilitado: false })
]);
