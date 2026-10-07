// TEMPORAL — TODO(backend): mock del inicio de sesión. Eliminar al integrar POST /auth/login (docs/planes/login.md §8.2).
// Usuarios y contraseñas ficticios SOLO para desarrollo. Ningún componente debe importarlos.

import { ROLES } from '../../../../shared/auth/roles.js';

const ESPERA_SIMULADA_MS = 400;

const IDENTIFICADOR_ERROR_INESPERADO = '00000000';

/**
 * Usuarios ficticios para desarrollar sin backend (docs/planes/login.md §8.5).
 */
const USUARIOS = Object.freeze([
  Object.freeze({
    id: 1,
    nombre: 'Admin',
    rol: ROLES.ADMIN,
    activo: true,
    correo: 'admin@sanmarcos.edu.pe',
    dni: '40000001',
    contrasena: 'Admin2026!'
  }),
  Object.freeze({
    id: 2,
    nombre: 'Luis Paredes',
    rol: ROLES.ADMIN,
    activo: false,
    correo: 'inactivo@sanmarcos.edu.pe',
    dni: '40000002',
    contrasena: 'Inactivo2026!'
  }),
  Object.freeze({
    id: 3,
    nombre: 'Prof. Quispe',
    rol: ROLES.DOCENTE,
    activo: true,
    correo: 'docente@sanmarcos.edu.pe',
    dni: '40000003',
    contrasena: 'Docente2026!'
  })
]);

function simularLatencia(calcularResultado) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(calcularResultado()), ESPERA_SIMULADA_MS);
  });
}

function buscarUsuarioPorIdentificador(identificador) {
  const normalizado = identificador.trim().toLowerCase();
  return USUARIOS.find(
    (usuario) => usuario.correo.toLowerCase() === normalizado || usuario.dni === identificador.trim()
  );
}

/**
 * Simula `POST /auth/login`. Devuelve la misma forma que `solicitar`: éxito
 * `{ exitoso: true, datos, mensaje: '' }`; fallo `{ exitoso: false, datos: null, mensaje, estado }`.
 * Nunca devuelve la contraseña.
 *
 * Orden de verificación, igual al de la HU: identificador existe → contraseña
 * coincide → perfil coincide con el rol → cuenta activa → éxito.
 *
 * @param {{ perfil: string, identificador: string, password: string }} credenciales
 * @returns {Promise<{ exitoso: boolean, datos: Object|null, mensaje: string, estado?: number }>}
 */
export function iniciarSesionMock({ perfil, identificador, password }) {
  return simularLatencia(() => {
    if (identificador.trim() === IDENTIFICADOR_ERROR_INESPERADO) {
      return { exitoso: false, datos: null, mensaje: 'Error simulado.', estado: 500 };
    }

    const usuario = buscarUsuarioPorIdentificador(identificador);

    if (!usuario || usuario.contrasena !== password || usuario.rol !== perfil) {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'Credenciales o perfil incorrectos.',
        estado: 401
      };
    }

    if (!usuario.activo) {
      return { exitoso: false, datos: null, mensaje: 'Cuenta inactiva.', estado: 403 };
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
