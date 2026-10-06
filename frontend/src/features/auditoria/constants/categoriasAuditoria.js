import { obtenerTonoModulo } from '../../../shared/constants/tonosModulo.js';

/**
 * Catálogo de categorías (módulos) de auditoría, en el orden del prototipo.
 * Fuente: docs/planes/auditorias.md §4.1 (opciones de `FiltroChips`) y §6.2 (etiquetas de categoría).
 * "Sistema" y "Evaluaciones" no están en las categorías de la HU-SAT-04; se incluyen por decisión
 * del usuario y porque aparecen en el prototipo (docs/planes/auditorias.md §14).
 */
export const CATEGORIAS_AUDITORIA = Object.freeze([
  Object.freeze({ valor: 'TODOS', etiqueta: 'Todos' }),
  Object.freeze({ valor: 'NOTAS', etiqueta: 'Notas' }),
  Object.freeze({ valor: 'USUARIOS', etiqueta: 'Usuarios' }),
  Object.freeze({ valor: 'ASISTENCIA', etiqueta: 'Asistencia' }),
  Object.freeze({ valor: 'MATRICULAS', etiqueta: 'Matrículas' }),
  Object.freeze({ valor: 'PAGOS', etiqueta: 'Pagos' }),
  Object.freeze({ valor: 'HORARIOS', etiqueta: 'Horarios' }),
  Object.freeze({ valor: 'SISTEMA', etiqueta: 'Sistema' }),
  Object.freeze({ valor: 'EVALUACIONES', etiqueta: 'Evaluaciones' })
]);

const MAPA_ETIQUETAS_CATEGORIA = new Map(
  CATEGORIAS_AUDITORIA.map((categoria) => [categoria.valor, categoria.etiqueta])
);

/**
 * Etiqueta visible de una categoría (módulo). Un código desconocido se muestra tal
 * cual, sin romper la pantalla (docs/planes/auditorias.md §6.2).
 *
 * @param {string} codigo
 * @returns {string}
 */
export function obtenerEtiquetaCategoria(codigo) {
  return MAPA_ETIQUETAS_CATEGORIA.get(codigo) ?? codigo;
}

/**
 * Opciones listas para `FiltroChips`, con el tono de MASTER.md ya resuelto
 * (código desconocido → `gris`, igual que `obtenerTonoModulo`).
 *
 * @returns {Array<{ valor: string, etiqueta: string, tono: string }>}
 */
export function obtenerOpcionesFiltroCategoria() {
  return CATEGORIAS_AUDITORIA.map((categoria) => ({
    ...categoria,
    tono: obtenerTonoModulo(categoria.valor)
  }));
}

/**
 * Etiquetas visibles de rol de usuario para la columna ROL del listado y del detalle
 * (docs/planes/auditorias.md §6.2). `TUTOR` no está en `shared/auth/roles.js` (ver
 * Observaciones §14 del plan); se mapea aquí porque el backend sí lo envía en los registros.
 */
const MAPA_ETIQUETAS_ROL = Object.freeze({
  ADMIN: 'Administrador',
  DOCENTE: 'Docente',
  TUTOR: 'Tutor',
  ESTUDIANTE: 'Estudiante',
  APODERADO: 'Apoderado',
  SISTEMA: 'Sistema'
});

/**
 * Etiqueta visible de un código de rol. Un código desconocido se muestra tal cual.
 *
 * @param {string} codigo
 * @returns {string}
 */
export function obtenerEtiquetaRol(codigo) {
  return MAPA_ETIQUETAS_ROL[codigo] ?? codigo;
}
