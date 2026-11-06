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

/**
 * Opciones del filtro de estado del listado (HU-SAT-02, escenario 13). `'Todos'` es la opción sin
 * filtro. Los textos coinciden con los de la insignia de estado de la tabla.
 */
export const OPCIONES_FILTRO_ESTADO = Object.freeze([
  { valor: 'Todos', etiqueta: 'Cualquier estado', tono: 'gris' },
  { valor: 'activo', etiqueta: 'Activos', tono: 'verde' },
  { valor: 'inactivo', etiqueta: 'Desactivados', tono: 'gris' }
]);

/** Usuarios por página del listado (HU-SAT-02, escenario 12). */
export const TAMANIO_PAGINA_USUARIOS = 15;

/** Rol que se asigna a cada tipo de registro (formulario y carga masiva). */
export const ROL_POR_TIPO_REGISTRO = Object.freeze({
  apoderado: 'Apoderado',
  estudiante: 'Estudiante',
  docente: 'Docente'
});
