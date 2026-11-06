// TEMPORAL — TODO(backend): mock del inicio de sesión. Eliminar al integrar POST /auth/login (docs/planes/login.md §8.2).
// Usuarios y contraseñas ficticios SOLO para desarrollo. Ningún componente debe importarlos.

import { ROLES } from '../../../../shared/auth/roles.js';

const ESPERA_SIMULADA_MS = 400;

const CORREO_ERROR_INESPERADO = 'error500@sanmarcos.edu.pe';

/**
 * Usuarios ficticios para desarrollar sin backend (docs/planes/login.md §8.5,
 * actualizado 2026-11-01, §U7): el login es solo con correo electrónico, sin
 * DNI ni perfil elegido; el rol lo determina la cuenta.
 */
const USUARIOS = Object.freeze([
  Object.freeze({
    id: 1,
    nombre: 'Admin',
    rol: ROLES.ADMIN,
    activo: true,
    correo: 'admin@sanmarcos.edu.pe',
    contrasena: 'Admin2026!'
  }),
  Object.freeze({
    id: 2,
    nombre: 'Luis Paredes',
    rol: ROLES.ADMIN,
    activo: false,
    correo: 'inactivo@sanmarcos.edu.pe',
    contrasena: 'Inactivo2026!'
  }),
  Object.freeze({
    id: 3,
    nombre: 'Prof. Quispe',
    rol: ROLES.DOCENTE,
    activo: true,
    correo: 'docente@sanmarcos.edu.pe',
    contrasena: 'Docente2026!'
  }),
  Object.freeze({
    id: 5,
    nombre: 'Cuenta Nueva',
    rol: ROLES.ADMIN,
    activo: true,
    correo: 'sincontrasena@sanmarcos.edu.pe',
    // Cuenta recién registrada que aún no definió su contraseña (HU-SAT-03):
    // responde el mismo 401 que una contraseña incorrecta, sin revelar el motivo.
    contrasena: null
  })
]);

function simularLatencia(calcularResultado) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(calcularResultado()), ESPERA_SIMULADA_MS);
  });
}

/**
 * Busca la cuenta por correo electrónico, sin distinguir mayúsculas.
 *
 * @param {string} correo
 * @returns {Object | undefined}
 */
function buscarCuentaPorCorreo(correo) {
  const normalizado = correo.trim().toLowerCase();
  return USUARIOS.find((usuario) => usuario.correo.toLowerCase() === normalizado);
}

/**
 * Simula `POST /auth/login`. Devuelve la misma forma que `solicitar`: éxito
 * `{ exitoso: true, datos, mensaje: '' }`; fallo
 * `{ exitoso: false, datos: null, mensaje, estado, codigo? }`. Nunca devuelve la contraseña.
 *
 * Orden de verificación (HU-SAT-07 vigente, §U7): cuenta (por correo) →
 * contraseña coincide → cuenta activa → rol habilitado → éxito. El correo no
 * registrado, la contraseña incorrecta y una cuenta activa sin contraseña
 * (HU-SAT-03) devuelven la **misma** respuesta 401, sin distinguirse ni
 * siquiera internamente (Esc. 3).
 *
 * @param {{ correo: string, password: string }} credenciales
 * @returns {Promise<{ exitoso: boolean, datos: Object|null, mensaje: string, estado?: number, codigo?: string }>}
 */
export function iniciarSesionMock({ correo, password }) {
  return simularLatencia(() => {
    if (correo.trim().toLowerCase() === CORREO_ERROR_INESPERADO) {
      return { exitoso: false, datos: null, mensaje: 'Error simulado.', estado: 500 };
    }

    const usuario = buscarCuentaPorCorreo(correo);

    if (!usuario || usuario.contrasena === null || usuario.contrasena !== password) {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'Correo o contraseña incorrectos.',
        estado: 401
      };
    }

    if (!usuario.activo) {
      return { exitoso: false, datos: null, mensaje: 'Cuenta inactiva.', estado: 403, codigo: 'CUENTA_INACTIVA' };
    }

    // No es un JWT: con el mock activo ningún servicio llama al backend real,
    // así que este valor nunca sale del navegador.
    const token = `mock-token.${usuario.rol}.${usuario.id}`;

    return {
      exitoso: true,
      datos: {
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
      },
      mensaje: ''
    };
  });
}
