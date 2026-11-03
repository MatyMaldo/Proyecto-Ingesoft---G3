// El backend es el único responsable de: comparar la contraseña contra su hash BCrypt; emitir y validar el JWT;
// determinar el rol de la cuenta a partir de su identificador (el rol no lo elige el usuario); rechazar cuentas
// desactivadas y cuentas cuyo rol aún no está habilitado; y autorizar cada solicitud según el rol. El mock de
// `mocks/autenticacionMock.js` solo **simula** esas reglas para desarrollar sin backend. El guard de rutas del
// frontend (`RutaProtegida`) mejora la experiencia de uso, pero no reemplaza la autorización del backend.

import { iniciarSesionMock } from './mocks/autenticacionMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { ROLES } from '../../../shared/auth/roles.js';
import { ROLES_HABILITADOS_LOGIN } from '../constants/rolesHabilitados.js';
import { MENSAJE_ERROR_INESPERADO } from '../constants/mensajesLogin.js';

/**
 * Motivos de rechazo que puede devolver `iniciarSesion`.
 */
export const MOTIVOS_RECHAZO = Object.freeze({
  CREDENCIALES_INVALIDAS: 'CREDENCIALES_INVALIDAS',
  CUENTA_INACTIVA: 'CUENTA_INACTIVA',
  ROL_NO_HABILITADO: 'ROL_NO_HABILITADO',
  DATOS_INVALIDOS: 'DATOS_INVALIDOS',
  ERROR_INESPERADO: 'ERROR_INESPERADO'
});

/**
 * Interpreta la respuesta cruda del adaptador (mock o HTTP) y la lleva a una
 * forma única, para que la UI se comporte igual en ambos casos.
 *
 * @param {{ exitoso: boolean, datos: *, mensaje: string, estado?: number, codigo?: string|null }} respuesta
 * @returns {{ exitoso: boolean, datos: Object|null, mensaje: string, motivo: string|null }}
 */
function interpretarRespuestaLogin(respuesta) {
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
      Object.values(ROLES).includes(usuario.rol);

    if (!formaValida) {
      // Comprobación defensiva: nunca se crea una sesión con una forma inesperada.
      return {
        exitoso: false,
        datos: null,
        mensaje: MENSAJE_ERROR_INESPERADO,
        motivo: MOTIVOS_RECHAZO.ERROR_INESPERADO
      };
    }

    if (!ROLES_HABILITADOS_LOGIN.includes(usuario.rol)) {
      // Comprobación defensiva de UX (docs/planes/login.md §U3): no se crea
      // sesión para un rol sin pantallas en esta iteración. La regla real
      // (qué roles pueden iniciar sesión) la aplica el backend.
      return {
        exitoso: false,
        datos: null,
        mensaje: MENSAJE_ERROR_INESPERADO,
        motivo: MOTIVOS_RECHAZO.ROL_NO_HABILITADO
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
    // 403 con `codigo: 'ROL_NO_HABILITADO'` distingue el aviso de rol no
    // habilitado del de cuenta inactiva (docs/planes/login.md §U3). Un 403
    // sin código o con uno desconocido se trata como cuenta inactiva.
    const motivo =
      respuesta.codigo === MOTIVOS_RECHAZO.ROL_NO_HABILITADO
        ? MOTIVOS_RECHAZO.ROL_NO_HABILITADO
        : MOTIVOS_RECHAZO.CUENTA_INACTIVA;
    return { exitoso: false, datos: null, mensaje: respuesta.mensaje, motivo };
  }

  if (respuesta.estado === 400) {
    return { exitoso: false, datos: null, mensaje: respuesta.mensaje, motivo: MOTIVOS_RECHAZO.DATOS_INVALIDOS };
  }

  return { exitoso: false, datos: null, mensaje: respuesta.mensaje, motivo: MOTIVOS_RECHAZO.ERROR_INESPERADO };
}

/**
 * Inicia sesión con el correo electrónico (o DNI) y la contraseña indicados.
 * El rol lo determina el sistema a partir de la cuenta; no se elige en el
 * formulario (docs/planes/login.md §U7). Nunca lanza.
 *
 * Prohibido: registrar en consola la contraseña, el token o el cuerpo de la
 * petición o de la respuesta.
 *
 * @param {{ correo: string, password: string }} credenciales
 * @returns {Promise<{
 *   exitoso: boolean,
 *   datos: { token: string, usuario: { id: *, nombre: string, rol: string } } | null,
 *   mensaje: string,
 *   motivo: string | null
 * }>}
 */
export async function iniciarSesion({ correo, password }) {
  const respuesta = USAR_MOCK
    ? await iniciarSesionMock({ correo, password })
    : await solicitar('/auth/login', {
        metodo: 'POST',
        cuerpo: { identificador: correo, password }
      });

  return interpretarRespuestaLogin(respuesta);
}
