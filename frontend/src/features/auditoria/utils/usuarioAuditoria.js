function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

/**
 * Indica si conviene mostrar el rol junto al nombre del usuario. Con "Administrador / Administrador" o
 * "Sistema / Sistema" el segundo dato no aporta nada y se omite.
 *
 * @param {{ nombre: string, rol: string }} usuario
 * @returns {boolean}
 */
export function debeMostrarRol(usuario) {
  return Boolean(usuario?.rol) && normalizar(usuario.nombre) !== normalizar(usuario.rol);
}

/**
 * Texto de una sola línea para el usuario: `Nombre (Rol)` o solo `Nombre` si el rol es redundante.
 *
 * @param {{ nombre: string, rol: string }} usuario
 * @returns {string}
 */
export function describirUsuario(usuario) {
  return debeMostrarRol(usuario) ? `${usuario.nombre} (${usuario.rol})` : usuario.nombre;
}
