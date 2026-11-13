import { solicitar } from '../api/clienteHttp.js';
import { USAR_MOCK } from '../api/configuracionApi.js';

/**
 * Avisa al backend del cierre de sesión voluntario para que quede en la auditoría (HU-SAT-04 / HU-SAT-07, Esc. 7).
 * Debe llamarse ANTES de borrar el token: la petición toma el token al construirse. Nunca lanza, y el cierre local
 * de la sesión no depende de su resultado (si el backend no responde, el usuario igual sale de la aplicación).
 *
 * @returns {Promise<void>}
 */
export async function registrarCierreSesion() {
  if (USAR_MOCK) {
    return;
  }
  await solicitar('/auth/logout', { metodo: 'POST' });
}
