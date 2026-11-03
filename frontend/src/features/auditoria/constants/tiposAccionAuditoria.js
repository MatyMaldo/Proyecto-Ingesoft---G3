// TODO(backend): confirmar los códigos de `tipoAccion` (CREAR, ACTUALIZAR, ELIMINAR, LOGIN,
// CAMBIO_ESTADO), que el backend los envíe en cada registro y que el listado acepte el
// parámetro `tipoAccion` para filtrar.
// 2026-11-03: "Login" se mantiene en el filtro por decisión del usuario: el inicio de sesión SÍ se
// audita en Auditorías (lo que no se registra son los errores controlados de login en el log de
// errores, HU-SAT-05).

/**
 * Catálogo cerrado de tipos de acción de un registro de auditoría, en el orden del filtro.
 * Reemplaza al filtro por tipo de transacción (dependiente del módulo): ahora el tipo de
 * acción es independiente del módulo y el nombre de la transacción se muestra como
 * descripción. Los tonos evitan los de los módulos de `shared/constants/tonosModulo.js`
 * (azul, violeta, cian, marino, acero, turquesa, índigo, ciruela).
 */
export const TIPOS_ACCION_AUDITORIA = Object.freeze([
  Object.freeze({ valor: 'CREAR', etiqueta: 'Crear', tono: 'verde' }),
  Object.freeze({ valor: 'ACTUALIZAR', etiqueta: 'Actualizar', tono: 'ambar' }),
  Object.freeze({ valor: 'ELIMINAR', etiqueta: 'Eliminar', tono: 'rojo' }),
  Object.freeze({ valor: 'LOGIN', etiqueta: 'Login', tono: 'gris' }),
  Object.freeze({ valor: 'CAMBIO_ESTADO', etiqueta: 'Cambio de estado', tono: 'rosa' })
]);

const MAPA_TIPOS_ACCION = new Map(TIPOS_ACCION_AUDITORIA.map((tipo) => [tipo.valor, tipo]));

/**
 * Etiqueta visible de un tipo de acción. Un código desconocido se muestra tal cual,
 * sin romper la pantalla.
 *
 * @param {string} codigo
 * @returns {string}
 */
export function obtenerEtiquetaAccion(codigo) {
  return MAPA_TIPOS_ACCION.get(codigo)?.etiqueta ?? codigo;
}

/**
 * Tono de la insignia de un tipo de acción (uno de los tonos de `tokens.css`).
 *
 * @param {string} codigo
 * @returns {string} El tono correspondiente, o `'gris'` si el código no existe.
 */
export function obtenerTonoAccion(codigo) {
  return MAPA_TIPOS_ACCION.get(codigo)?.tono ?? 'gris';
}
