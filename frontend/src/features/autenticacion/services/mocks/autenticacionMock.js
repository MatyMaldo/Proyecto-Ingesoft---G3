// TEMPORAL — TODO(backend): mock del inicio de sesión. Eliminar al integrar POST /auth/login (docs/planes/login.md §8.2).
// Usuarios y contraseñas ficticios SOLO para desarrollo. Ningún componente debe importarlos.

import { ROLES } from '../../../../shared/auth/roles.js';

const ESPERA_SIMULADA_MS = 400;

const IDENTIFICADOR_ERROR_INESPERADO = '00000000';

/**
 * Usuarios ficticios para desarrollar sin backend (docs/planes/login.md §8.5).
 * Los DNI son obviamente falsos (empiezan en `0000000x`) para que no se
 * confundan con DNI peruanos reales. El usuario 4 (Ana Torres) comparte DNI
 * con el usuario 1 (Admin) mostrando perfiles distintos, para probar la regla
 * "la cuenta se identifica por DNI + perfil" (HU-GEMAP-01) y va primero en el
 * arreglo para que una búsqueda que ignorara el perfil la encontrara antes.
 */
const USUARIOS = Object.freeze([
  Object.freeze({
    id: 4,
    nombre: 'Ana Torres',
    rol: ROLES.DOCENTE,
    activo: true,
    correo: 'docente.ana@sanmarcos.edu.pe',
    dni: '00000001',
    contrasena: 'DocenteAna2026!'
  }),
  Object.freeze({
    id: 1,
    nombre: 'Admin',
    rol: ROLES.ADMIN,
    activo: true,
    correo: 'admin@sanmarcos.edu.pe',
    dni: '00000001',
    contrasena: 'Admin2026!'
  }),
  Object.freeze({
    id: 2,
    nombre: 'Luis Paredes',
    rol: ROLES.ADMIN,
    activo: false,
    correo: 'inactivo@sanmarcos.edu.pe',
    dni: '00000002',
    contrasena: 'Inactivo2026!'
  }),
  Object.freeze({
    id: 3,
    nombre: 'Prof. Quispe',
    rol: ROLES.DOCENTE,
    activo: true,
    correo: 'docente@sanmarcos.edu.pe',
    dni: '00000003',
    contrasena: 'Docente2026!'
  })
]);

function simularLatencia(calcularResultado) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(calcularResultado()), ESPERA_SIMULADA_MS);
  });
}

/**
 * Busca la cuenta por identificador **y** perfil (docs/planes/login.md §8.5,
 * corregido 2026-10-20): con DNI, la cuenta se identifica por el par
 * DNI + perfil, porque un mismo DNI puede tener cuentas de roles distintos
 * (HU-GEMAP-01); con correo (único en el sistema), se busca por correo y se
 * exige que el rol de la cuenta coincida con el perfil elegido. Nunca toma el
 * primer usuario que coincida solo por identificador.
 *
 * @param {string} identificador
 * @param {string} perfil
 * @returns {Object | undefined}
 */
function buscarCuentaPorIdentificadorYPerfil(identificador, perfil) {
  const recortado = identificador.trim();

  if (/^\d{8}$/.test(recortado)) {
    return USUARIOS.find((usuario) => usuario.dni === recortado && usuario.rol === perfil);
  }

  const normalizado = recortado.toLowerCase();
  return USUARIOS.find((usuario) => usuario.correo.toLowerCase() === normalizado && usuario.rol === perfil);
}

/**
 * Simula `POST /auth/login`. Devuelve la misma forma que `solicitar`: éxito
 * `{ exitoso: true, datos, mensaje: '' }`; fallo `{ exitoso: false, datos: null, mensaje, estado }`.
 * Nunca devuelve la contraseña.
 *
 * Orden de verificación, igual al de la HU: cuenta (identificador + perfil) →
 * contraseña coincide → cuenta activa → éxito. Los tres motivos de rechazo de
 * la cuenta (identificador no registrado para ese perfil, contraseña
 * incorrecta o perfil que no corresponde) devuelven la **misma** respuesta
 * 401, sin distinguirse ni siquiera internamente (Esc. 3).
 *
 * @param {{ perfil: string, identificador: string, password: string }} credenciales
 * @returns {Promise<{ exitoso: boolean, datos: Object|null, mensaje: string, estado?: number }>}
 */
export function iniciarSesionMock({ perfil, identificador, password }) {
  return simularLatencia(() => {
    if (identificador.trim() === IDENTIFICADOR_ERROR_INESPERADO) {
      return { exitoso: false, datos: null, mensaje: 'Error simulado.', estado: 500 };
    }

    const usuario = buscarCuentaPorIdentificadorYPerfil(identificador, perfil);

    if (!usuario || usuario.contrasena !== password) {
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
