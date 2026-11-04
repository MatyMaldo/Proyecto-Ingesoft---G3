/**
 * Tono de la insignia de cada rol. Se evitan verde, ámbar y rojo: la GUI los reserva para
 * estados (positivo, preventivo, crítico) y un mismo color debe significar lo mismo en todo el sistema.
 */
export const TONO_ROL = Object.freeze({
  Apoderado: 'azul',
  Estudiante: 'cian',
  Docente: 'violeta',
  Administrador: 'marino'
});

/**
 * Opciones del filtro de rol del listado (chips). `'Todos'` es la opción sin filtro; el resto
 * coincide con el campo `rol` de los usuarios. El tono es el mismo de la insignia de la tabla.
 */
export const OPCIONES_FILTRO_ROL = Object.freeze([
  { valor: 'Todos', etiqueta: 'Todos', tono: 'gris' },
  { valor: 'Apoderado', etiqueta: 'Apoderados', tono: TONO_ROL.Apoderado },
  { valor: 'Docente', etiqueta: 'Docentes', tono: TONO_ROL.Docente },
  { valor: 'Estudiante', etiqueta: 'Estudiantes', tono: TONO_ROL.Estudiante }
]);
