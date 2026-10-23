/**
 * Catálogo de roles de usuario reconocidos por el frontend.
 */
export const ROLES = Object.freeze({
  ADMIN: 'ADMINISTRADOR',
  DOCENTE: 'DOCENTE',
  ESTUDIANTE: 'ESTUDIANTE',
  APODERADO: 'APODERADO'
});

/**
 * Etiqueta visible de cada rol (pie de la barra lateral, barra superior,
 * recuadro "Ingresando como" del login). Un código de rol desconocido se
 * muestra tal cual (docs/planes/login.md §6.1).
 */
export const ETIQUETAS_ROL = Object.freeze({
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.DOCENTE]: 'Docente',
  [ROLES.ESTUDIANTE]: 'Estudiante',
  [ROLES.APODERADO]: 'Apoderado'
});
