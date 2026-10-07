// El backend es el único responsable de: comparar la contraseña contra su hash BCrypt; emitir y validar el JWT;
// verificar que el perfil elegido coincide con el rol real de la cuenta (el perfil no otorga permisos por sí mismo);
// rechazar cuentas desactivadas; y autorizar cada solicitud según el rol. El mock de `mocks/autenticacionMock.js` solo
// simula esas reglas para desarrollar sin backend. El guard de rutas del frontend (`RutaProtegida`) mejora la
// experiencia de uso, pero no reemplaza la autorización del backend.

import { iniciarSesionMock } from './mocks/autenticacionMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { ROLES } from '../../../shared/auth/roles.js';
import { MENSAJE_ERROR_INESPERADO } from '../constants/mensajesLogin.js';

/**
 * Motivos de rechazo que puede devolver `iniciarSesion`.
 */
export const MOTIVOS_RECHAZO = Object.freeze({
  CREDENCIALES_INVALIDAS: 'CREDENCIALES_INVALIDAS',
  CUENTA_INACTIVA: 'CUENTA_INACTIVA',
  DATOS_INVALIDOS: 'DATOS_INVALIDOS',
  ERROR_INESPERADO: 'ERROR_INESPERADO'
});

/**
 * Interpreta la respuesta cruda del adaptador (mock o HTTP) y la lleva a una
 * forma única, para que la UI se comporte igual en ambos casos.
 *
 * @param {{ exitoso: boolean, datos: *, mensaje: string, estado?: number }} respuesta
 * @param {string} perfil Perfil elegido en el formulario, para la comprobación defensiva.
 * @returns {{ exitoso: boolean, datos: Object|null, mensaje: string, motivo: string|null }}
 */
function interpretarRespuestaLogin(respuesta, perfil) {
  if (respuesta.exitoso) {
    const datos = respuesta.datos;
    const token = datos?.token;
    const usuario = datos?.usuario;

    const formaValida =
      typeof token === 'string' &&
      token.length > 0 &&
      usuario &&
      usuario.id !== undefined &&
      usuario.id !== null &&
      typeof usuario.nombre === 'string' &&
      Object.values(ROLES).includes(usuario.rol) &&
      usuario.rol === perfil;

    if (!formaValida) {
      // Comprobación defensiva: nunca se crea una sesión incoherente. La regla
      // real (que el rol coincida con el perfil) la aplica el backend.
      return {
        exitoso: false,
        datos: null,
        mensaje: MENSAJE_ERROR_INESPERADO,
        motivo: MOTIVOS_RECHAZO.ERROR_INESPERADO
      };
    }

    return {
      exitoso: true,
      datos: {
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
      },
      mensaje: '',
      motivo: null
    };
  }

  if (respuesta.estado === 401) {
    return { exitoso: false, datos: null, mensaje: respuesta.mensaje, motivo: MOTIVOS_RECHAZO.CREDENCIALES_INVALIDAS };
  }

  if (respuesta.estado === 403) {
    return { exitoso: false, datos: null, mensaje: respuesta.mensaje, motivo: MOTIVOS_RECHAZO.CUENTA_INACTIVA };
  }

  if (respuesta.estado === 400) {
    return { exitoso: false, datos: null, mensaje: respuesta.mensaje, motivo: MOTIVOS_RECHAZO.DATOS_INVALIDOS };
  }

  return { exitoso: false, datos: null, mensaje: respuesta.mensaje, motivo: MOTIVOS_RECHAZO.ERROR_INESPERADO };
}

/**
 * Inicia sesión con el perfil, identificador (correo o DNI) y contraseña
 * indicados. Nunca lanza.
 *
 * Prohibido: registrar en consola la contraseña, el token o el cuerpo de la
 * petición o de la respuesta.
 *
 * @param {{ perfil: string, identificador: string, password: string }} credenciales
 * @returns {Promise<{
 *   exitoso: boolean,
 *   datos: { token: string, usuario: { id: *, nombre: string, rol: string } } | null,
 *   mensaje: string,
 *   motivo: string | null
 * }>}
 */
export async function iniciarSesion({ perfil, identificador, password }) {
  const respuesta = USAR_MOCK
    ? await iniciarSesionMock({ perfil, identificador, password })
    : await solicitar('/auth/login', {
        metodo: 'POST',
        cuerpo: { perfil, identificador, password }
      });

  return interpretarRespuestaLogin(respuesta, perfil);
}
