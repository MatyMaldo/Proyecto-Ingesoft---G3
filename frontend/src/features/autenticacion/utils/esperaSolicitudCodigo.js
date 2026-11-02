import { CLAVE_ESPERA_SOLICITUD_CODIGO } from '../constants/reglasRestablecimiento.js';

/**
 * Lee el instante (epoch ms) de la última solicitud de código hecha desde
 * esta pestaña. Es una guarda de UX, **por pestaña y sin importar el
 * correo** (docs/planes/restablecer-contrasena.md §7.2, R4); el límite real
 * (60 s y 5/hora por correo electrónico) lo aplica el backend, que responde
 * igual aunque se exceda.
 *
 * Un valor ausente, no numérico o futuro se considera inválido y se borra.
 * Los errores de `sessionStorage` (por ejemplo, en modo privado) se capturan
 * y se tratan como ausencia de espera.
 *
 * @returns {number | null}
 */
export function leerInstanteUltimaSolicitud() {
  try {
    const valor = sessionStorage.getItem(CLAVE_ESPERA_SOLICITUD_CODIGO);

    if (valor === null) {
      return null;
    }

    const instante = Number(valor);

    if (!Number.isFinite(instante) || instante > Date.now()) {
      sessionStorage.removeItem(CLAVE_ESPERA_SOLICITUD_CODIGO);
      return null;
    }

    return instante;
  } catch {
    return null;
  }
}

/**
 * Guarda el instante (epoch ms) de una solicitud de código recién aceptada,
 * para calcular la cuenta regresiva de reenvío de esta pestaña. Solo guarda
 * un número: nunca el correo ni el código.
 *
 * @param {number} instante
 */
export function guardarInstanteUltimaSolicitud(instante) {
  try {
    sessionStorage.setItem(CLAVE_ESPERA_SOLICITUD_CODIGO, String(instante));
  } catch {
    // Modo privado u otra restricción del navegador: sin cuenta regresiva
    // visible, pero la solicitud ya se hizo; no es un error para el usuario.
  }
}
