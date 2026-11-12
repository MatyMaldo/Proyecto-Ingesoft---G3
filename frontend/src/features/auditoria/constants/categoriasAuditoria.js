import { obtenerTonoModulo } from '../../../shared/constants/tonosModulo.js';
import { ROLES } from '../../../shared/auth/roles.js';

/**
 * Códigos alineados con el contrato del endpoint GET /auditorias.
 */
export const CATEGORIAS_AUDITORIA = Object.freeze([
  Object.freeze({ valor: 'TODOS', etiqueta: 'Todos' }),
  Object.freeze({ valor: 'NOTAS', etiqueta: 'Notas' }),
  Object.freeze({ valor: 'USUARIO', etiqueta: 'Usuarios' }),
  Object.freeze({ valor: 'MATRICULA', etiqueta: 'Matrícula' }),
  Object.freeze({ valor: 'ASISTENCIA', etiqueta: 'Asistencia' }),
  Object.freeze({ valor: 'PAGOS', etiqueta: 'Pagos' }),
  Object.freeze({ valor: 'HORARIOS', etiqueta: 'Horarios' }),
  Object.freeze({ valor: 'CONFIGURACION', etiqueta: 'Configuración' }),
  Object.freeze({ valor: 'ACADEMICO', etiqueta: 'Académico' }),
  Object.freeze({ valor: 'SEGURIDAD', etiqueta: 'Seguridad' }),
  Object.freeze({ valor: 'SISTEMA', etiqueta: 'Sistema' })
]);

const ALIASES_CATEGORIA = Object.freeze({
  USUARIOS: 'USUARIO',
  MATRICULAS: 'MATRICULA',
  EVALUACIONES: 'ACADEMICO'
});

const MAPA_ETIQUETAS_CATEGORIA = new Map(
  CATEGORIAS_AUDITORIA.map((categoria) => [categoria.valor, categoria.etiqueta])
);

export function normalizarCodigoCategoria(codigo) {
  return ALIASES_CATEGORIA[codigo] ?? codigo;
}

/**
 * Etiqueta visible de una categoría (módulo). Un código desconocido se muestra tal
 * cual, sin romper la pantalla (docs/planes/auditorias.md §6.2).
 *
 * @param {string} codigo
 * @returns {string}
 */
export function obtenerEtiquetaCategoria(codigo) {
  const normalizado = normalizarCodigoCategoria(codigo);
  return MAPA_ETIQUETAS_CATEGORIA.get(normalizado) ?? normalizado;
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
  [ROLES.ADMIN]: 'Administrador',
  DOCENTE: 'Docente',
  TUTOR: 'Tutor',
  ESTUDIANTE: 'Estudiante',
  APODERADO: 'Apoderado',
  SISTEMA: 'Sistema',
  // Intento fallido de inicio de sesión con un correo que no pertenece a ninguna cuenta (HU-SAT-04).
  NO_DETERMINADO: 'No determinado'
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
