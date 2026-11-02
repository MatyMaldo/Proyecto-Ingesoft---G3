// El backend es el único responsable de: generar el código de verificación, guardarlo (nunca en texto plano),
// invalidarlo y bloquearlo, aplicar los límites de 60 s y 5 solicitudes por hora, enviar el correo, validar la
// política de contraseñas y la coincidencia, guardar la contraseña como hash BCrypt, cerrar las sesiones abiertas de
// la cuenta y registrar la auditoría y el log de errores. El mock de `mocks/restablecimientoMock.js` solo **simula**
// esas reglas para desarrollar sin backend.
//
// Prohibido registrar en consola el correo, el código o las contraseñas (ni aquí ni en el mock).

import { solicitarCodigoMock, restablecerContrasenaMock } from './mocks/restablecimientoMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

/**
 * Motivos de rechazo que pueden devolver `solicitarCodigo` y `restablecerContrasena`.
 */
export const MOTIVOS_RECHAZO_RESTABLECIMIENTO = Object.freeze({
  CODIGO_INVALIDO: 'CODIGO_INVALIDO',
  POLITICA_CONTRASENA: 'POLITICA_CONTRASENA',
  CONTRASENAS_NO_COINCIDEN: 'CONTRASENAS_NO_COINCIDEN',
  DATOS_INVALIDOS: 'DATOS_INVALIDOS',
  ERROR_INESPERADO: 'ERROR_INESPERADO'
});

const CODIGOS_CONOCIDOS = new Set(Object.values(MOTIVOS_RECHAZO_RESTABLECIMIENTO));
const CLAVES_POLITICA_CONOCIDAS = new Set(['LONGITUD', 'CARACTERES', 'LETRA', 'NUMERO']);

/**
 * Interpreta la respuesta cruda del adaptador (mock o HTTP) y la lleva a una
 * forma única para los hooks. `estado 400` con un `codigo` conocido devuelve
 * ese motivo; `estado 400` sin código conocido se trata como `DATOS_INVALIDOS`;
 * el resto (5xx, red, tiempo agotado, cancelada) se trata como `ERROR_INESPERADO`.
 *
 * @param {{ exitoso: boolean, datos: *, mensaje: string, estado?: number, codigo?: string|null }} respuesta
 * @returns {{ exitoso: boolean, mensaje: string, motivo: string|null, requisitosIncumplidos: string[] }}
 */
function interpretarRespuesta(respuesta) {
  if (respuesta.exitoso) {
    return { exitoso: true, mensaje: respuesta.mensaje ?? '', motivo: null, requisitosIncumplidos: [] };
  }

  if (respuesta.estado === 400 && CODIGOS_CONOCIDOS.has(respuesta.codigo)) {
    const requisitosIncumplidos = Array.isArray(respuesta.datos?.requisitosIncumplidos)
      ? respuesta.datos.requisitosIncumplidos.filter((clave) => CLAVES_POLITICA_CONOCIDAS.has(clave))
      : [];

    return {
      exitoso: false,
      mensaje: respuesta.mensaje ?? '',
      motivo: respuesta.codigo,
      requisitosIncumplidos
    };
  }

  if (respuesta.estado === 400) {
    return {
      exitoso: false,
      mensaje: respuesta.mensaje ?? '',
      motivo: MOTIVOS_RECHAZO_RESTABLECIMIENTO.DATOS_INVALIDOS,
      requisitosIncumplidos: []
    };
  }

  return {
    exitoso: false,
    mensaje: respuesta.mensaje ?? '',
    motivo: MOTIVOS_RECHAZO_RESTABLECIMIENTO.ERROR_INESPERADO,
    requisitosIncumplidos: []
  };
}

/**
 * Solicita el envío de un código de verificación al correo indicado
 * (HU-SAT-03, Esc. 2-5, 13). El backend responde siempre 200 para un correo
 * con formato válido, exista o no la cuenta; el texto que ve el usuario lo
 * decide el hook con `MENSAJE_SOLICITUD_CODIGO`, no el `mensaje` de la API.
 * Nunca lanza.
 *
 * @param {{ correo: string }} datos
 * @returns {Promise<{ exitoso: boolean, mensaje: string, motivo: string|null }>}
 */
export async function solicitarCodigo({ correo }) {
  const respuesta = USAR_MOCK
    ? await solicitarCodigoMock({ correo })
    : await solicitar('/auth/codigos-verificacion', { metodo: 'POST', cuerpo: { correo } });

  const { exitoso, mensaje, motivo } = interpretarRespuesta(respuesta);
  return { exitoso, mensaje, motivo };
}

/**
 * Restablece (o define, si la cuenta no tenía) la contraseña de una cuenta a
 * partir de un código de verificación vigente (HU-SAT-03, Esc. 1, 6-12).
 * Nunca lanza.
 *
 * Prohibido registrar en consola el cuerpo de esta solicitud.
 *
 * @param {{ correo: string, codigo: string, nuevaContrasena: string, confirmacionContrasena: string }} datos
 * @returns {Promise<{ exitoso: boolean, mensaje: string, motivo: string|null, requisitosIncumplidos: string[] }>}
 */
export async function restablecerContrasena({ correo, codigo, nuevaContrasena, confirmacionContrasena }) {
  const respuesta = USAR_MOCK
    ? await restablecerContrasenaMock({ correo, codigo, nuevaContrasena, confirmacionContrasena })
    : await solicitar('/auth/restablecimientos-contrasena', {
        metodo: 'POST',
        cuerpo: { correo, codigo, nuevaContrasena, confirmacionContrasena }
      });

  return interpretarRespuesta(respuesta);
}
