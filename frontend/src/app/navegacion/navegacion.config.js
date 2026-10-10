import { ROLES } from '../../shared/auth/roles.js';

/**
 * Único árbol de navegación de la barra lateral. El orden de las secciones y de
 * sus ítems coincide con el prototipo.
 */
export const SECCIONES_NAVEGACION = Object.freeze([
  Object.freeze({
    id: 'gestion',
    titulo: 'Gestión',
    items: Object.freeze([
      // TODO(pregunta): roles por ítem de Gestión (Usuarios, Matrículas, Cursos, Pagos, Horarios).
      Object.freeze({ id: 'usuarios', etiqueta: 'Usuarios', ruta: '/usuarios', icono: 'usuario' }),
      Object.freeze({ id: 'matriculas', etiqueta: 'Matrículas', ruta: '/matriculas', icono: 'usuarios' }),
      Object.freeze({ id: 'cursos', etiqueta: 'Cursos', ruta: '/cursos', icono: 'libro' }),
      Object.freeze({ id: 'pagos', etiqueta: 'Pagos', ruta: '/pagos', icono: 'tarjeta' }),
      Object.freeze({ id: 'horarios', etiqueta: 'Horarios', ruta: '/horarios', icono: 'reloj' })
    ])
  }),
  Object.freeze({
    id: 'administracion',
    titulo: 'Administración',
    items: Object.freeze([
      Object.freeze({
        id: 'anio-escolar',
        etiqueta: 'Año escolar',
        ruta: '/administracion/anio-escolar',
        icono: 'libro',
        roles: Object.freeze([ROLES.ADMIN])
      }),
      Object.freeze({
        id: 'auditorias',
        etiqueta: 'Auditorías',
        ruta: '/administracion/auditorias',
        icono: 'archivo',
        roles: Object.freeze([ROLES.ADMIN])
      }),
      Object.freeze({
        id: 'log-errores',
        etiqueta: 'Log de errores',
        ruta: '/administracion/log-errores',
        icono: 'panel',
        roles: Object.freeze([ROLES.ADMIN])
      })
    ])
  })
]);

/**
 * Lista plana de todos los ítems de navegación, cada uno con su sección.
 *
 * @returns {Array<{ id: string, etiqueta: string, ruta: string, icono: string, roles?: string[], seccion: { id: string, titulo: string } }>}
 */
export function obtenerItemsNavegacion() {
  return SECCIONES_NAVEGACION.flatMap((seccion) =>
    seccion.items.map((item) => ({
      ...item,
      seccion: { id: seccion.id, titulo: seccion.titulo }
    }))
  );
}

/**
 * Pantalla principal de cada rol, a la que redirige la ruta `/` (docs/planes/login.md §6.6).
 * Un rol sin entrada aquí no tiene pantalla principal en esta iteración y ve
 * `ModuloEnConstruccion nombre="Inicio"`.
 */
export const RUTA_INICIO_POR_ROL = Object.freeze({
  [ROLES.ADMIN]: '/administracion/auditorias'
});
