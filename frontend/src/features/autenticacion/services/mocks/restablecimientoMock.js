// TEMPORAL — TODO(backend): mock de HU-SAT-03. Eliminar al integrar POST /auth/codigos-verificacion y
// POST /auth/restablecimientos-contrasena (docs/planes/restablecer-contrasena.md §9). Ningún componente debe
// importarlo directamente: solo lo usa `restablecimientoService.js` cuando `USAR_MOCK` está activo.
//
// Estado en memoria del módulo (se reinicia al recargar la página), **separado** del mock de
// `autenticacionMock.js`: restablecer una contraseña aquí no cambia la contraseña con la que entra el login
// simulado (docs/planes/restablecer-contrasena.md §9.3, R13).
//
// Prohibido registrar en consola correos, códigos, contraseñas o cuerpos de petición.

import { MOTIVOS_RECHAZO_RESTABLECIMIENTO } from '../restablecimientoService.js';
import { esCorreoValido } from '../../utils/validacionLogin.js';
import { esCodigoValido, evaluarPoliticaContrasena } from '../../utils/validacionRestablecimiento.js';

const ESPERA_SIMULADA_MS = 400;
const ESPERA_REENVIO_MS = 60 * 1000;
const LIMITE_SOLICITUDES_POR_HORA = 5;
const VIGENCIA_CODIGO_MS = 30 * 60 * 1000;
const MAX_INTENTOS_FALLIDOS = 5;

const CORREO_ERROR_INESPERADO = 'error500@sanmarcos.edu.pe';

/**
 * Secuencia determinista de códigos: cada cuenta la recorre en orden al
 * aceptarse una nueva solicitud, para poder probar a mano sin ver el correo
 * (docs/planes/restablecer-contrasena.md §9.3).
 */
const SECUENCIA_CODIGOS = ['123456', '234567', '345678', '456789', '567890'];

/**
 * Cuentas ficticias de desarrollo. `ultimaSolicitudEn` y `historialSolicitudes`
 * arrancan vacíos a propósito: el código precargado de cada cuenta simula el
 * que ya se envió (por ejemplo, al registrarse) pero no cuenta como una
 * solicitud hecha desde esta pestaña, así que la primera solicitud manual no
 * tiene espera previa.
 */
function crearCuentasIniciales() {
  const ahora = Date.now();

  return new Map(
    Object.entries({
      'admin@sanmarcos.edu.pe': {
        activa: true,
        tieneContrasena: true,
        secuenciaIndice: 1,
        codigoActual: '123456',
        codigoEmitidoEn: ahora,
        codigoUsado: false,
        intentosFallidos: 0,
        bloqueado: false,
        ultimaSolicitudEn: null,
        historialSolicitudes: []
      },
      'sincontrasena@sanmarcos.edu.pe': {
        activa: true,
        tieneContrasena: false,
        secuenciaIndice: 1,
        codigoActual: '123456',
        codigoEmitidoEn: ahora,
        codigoUsado: false,
        intentosFallidos: 0,
        bloqueado: false,
        ultimaSolicitudEn: null,
        historialSolicitudes: []
      },
      'vencido@sanmarcos.edu.pe': {
        activa: true,
        tieneContrasena: true,
        secuenciaIndice: 1,
        codigoActual: '123456',
        codigoEmitidoEn: ahora - 31 * 60 * 1000,
        codigoUsado: false,
        intentosFallidos: 0,
        bloqueado: false,
        ultimaSolicitudEn: null,
        historialSolicitudes: []
      },
      'usado@sanmarcos.edu.pe': {
        activa: true,
        tieneContrasena: true,
        secuenciaIndice: 1,
        codigoActual: '123456',
        codigoEmitidoEn: ahora,
        codigoUsado: true,
        intentosFallidos: 0,
        bloqueado: false,
        ultimaSolicitudEn: null,
        historialSolicitudes: []
      },
      'desactivada@sanmarcos.edu.pe': {
        activa: false,
        tieneContrasena: true,
        secuenciaIndice: 1,
        codigoActual: '123456',
        codigoEmitidoEn: ahora,
        codigoUsado: false,
        intentosFallidos: 0,
        bloqueado: false,
        ultimaSolicitudEn: null,
        historialSolicitudes: []
      },
      'inactivo@sanmarcos.edu.pe': {
        activa: false,
        tieneContrasena: true,
        secuenciaIndice: 0,
        codigoActual: null,
        codigoEmitidoEn: null,
        codigoUsado: false,
        intentosFallidos: 0,
        bloqueado: false,
        ultimaSolicitudEn: null,
        historialSolicitudes: []
      },
      'fallacorreo@sanmarcos.edu.pe': {
        activa: true,
        tieneContrasena: true,
        secuenciaIndice: 1,
        codigoActual: '123456',
        codigoEmitidoEn: ahora,
        codigoUsado: false,
        intentosFallidos: 0,
        bloqueado: false,
        ultimaSolicitudEn: null,
        historialSolicitudes: []
      }
    })
  );
}

const cuentas = crearCuentasIniciales();

function simularLatencia(calcularResultado) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(calcularResultado()), ESPERA_SIMULADA_MS);
  });
}

function normalizarCorreo(correo) {
  return correo.trim().toLowerCase();
}

function estaEnEsperaDeReenvio(cuenta) {
  return cuenta.ultimaSolicitudEn !== null && Date.now() - cuenta.ultimaSolicitudEn < ESPERA_REENVIO_MS;
}

function superoLimitePorHora(cuenta) {
  const haceUnaHora = Date.now() - 60 * 60 * 1000;
  const solicitudesRecientes = cuenta.historialSolicitudes.filter((instante) => instante > haceUnaHora);
  return solicitudesRecientes.length >= LIMITE_SOLICITUDES_POR_HORA;
}

/**
 * Simula `POST /auth/codigos-verificacion`. Responde siempre 200 con el mismo
 * cuerpo para cualquier correo con formato válido (Esc. 2, 3, 4, 13); solo
 * emite un código nuevo cuando la cuenta existe, está activa y no excede los
 * límites de reenvío.
 *
 * @param {{ correo: string }} datos
 * @returns {Promise<{ exitoso: boolean, datos: Object|null, mensaje: string, estado?: number, codigo?: string }>}
 */
export function solicitarCodigoMock({ correo }) {
  return simularLatencia(() => {
    const normalizado = normalizarCorreo(correo);

    if (!esCorreoValido(normalizado)) {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'Ingresa un correo electrónico válido.',
        estado: 400,
        codigo: MOTIVOS_RECHAZO_RESTABLECIMIENTO.DATOS_INVALIDOS
      };
    }

    if (normalizado === CORREO_ERROR_INESPERADO) {
      return { exitoso: false, datos: null, mensaje: 'Error simulado.', estado: 500 };
    }

    const respuestaExitosa = {
      exitoso: true,
      datos: { mensaje: 'Si tu cuenta está activa, recibirás un código de verificación en tu correo.' },
      mensaje: ''
    };

    const cuenta = cuentas.get(normalizado);

    if (!cuenta || !cuenta.activa) {
      // Correo no registrado (Esc. 3) o cuenta inactiva: mismo mensaje, sin estado que cambiar.
      return respuestaExitosa;
    }

    if (estaEnEsperaDeReenvio(cuenta) || superoLimitePorHora(cuenta)) {
      // Esc. 4: no se envía correo ni se cambia el código vigente.
      return respuestaExitosa;
    }

    const ahora = Date.now();
    const siguienteCodigo = SECUENCIA_CODIGOS[cuenta.secuenciaIndice % SECUENCIA_CODIGOS.length];

    cuenta.codigoActual = siguienteCodigo;
    cuenta.codigoEmitidoEn = ahora;
    cuenta.codigoUsado = false;
    cuenta.intentosFallidos = 0;
    cuenta.bloqueado = false;
    cuenta.secuenciaIndice += 1;
    cuenta.ultimaSolicitudEn = ahora;
    cuenta.historialSolicitudes.push(ahora);

    return respuestaExitosa;
  });
}

function evaluarCodigo(cuenta, codigo) {
  if (!cuenta || !cuenta.activa || !cuenta.codigoActual) {
    return false;
  }

  if (cuenta.bloqueado || cuenta.codigoUsado) {
    return false;
  }

  if (Date.now() - cuenta.codigoEmitidoEn > VIGENCIA_CODIGO_MS) {
    return false;
  }

  if (codigo !== cuenta.codigoActual) {
    cuenta.intentosFallidos += 1;
    if (cuenta.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
      cuenta.bloqueado = true;
    }
    return false;
  }

  return true;
}

/**
 * Simula `POST /auth/restablecimientos-contrasena`. Valida en este orden:
 * datos obligatorios y formato, política de contraseña, coincidencia y,
 * solo al final, el código (para que los Esc. 8 y 9 no consuman intentos,
 * R9 del plan).
 *
 * @param {{ correo: string, codigo: string, nuevaContrasena: string, confirmacionContrasena: string }} datos
 * @returns {Promise<{ exitoso: boolean, datos: Object|null, mensaje: string, estado?: number, codigo?: string }>}
 */
export function restablecerContrasenaMock({ correo, codigo, nuevaContrasena, confirmacionContrasena }) {
  return simularLatencia(() => {
    const normalizado = normalizarCorreo(correo);
    const codigoRecortado = codigo.trim();

    if (normalizado === CORREO_ERROR_INESPERADO) {
      return { exitoso: false, datos: null, mensaje: 'Error simulado.', estado: 500 };
    }

    if (
      !esCorreoValido(normalizado) ||
      !esCodigoValido(codigoRecortado) ||
      nuevaContrasena.length === 0 ||
      confirmacionContrasena.length === 0
    ) {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'Revisa los datos ingresados.',
        estado: 400,
        codigo: MOTIVOS_RECHAZO_RESTABLECIMIENTO.DATOS_INVALIDOS
      };
    }

    const requisitosIncumplidos = evaluarPoliticaContrasena(nuevaContrasena);
    if (requisitosIncumplidos.length > 0) {
      return {
        exitoso: false,
        datos: { requisitosIncumplidos },
        mensaje: '',
        estado: 400,
        codigo: MOTIVOS_RECHAZO_RESTABLECIMIENTO.POLITICA_CONTRASENA
      };
    }

    if (nuevaContrasena !== confirmacionContrasena) {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'Las contraseñas no coinciden',
        estado: 400,
        codigo: MOTIVOS_RECHAZO_RESTABLECIMIENTO.CONTRASENAS_NO_COINCIDEN
      };
    }

    const cuenta = cuentas.get(normalizado);

    if (!evaluarCodigo(cuenta, codigoRecortado)) {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'Código inválido o vencido. Solicita uno nuevo.',
        estado: 400,
        codigo: MOTIVOS_RECHAZO_RESTABLECIMIENTO.CODIGO_INVALIDO
      };
    }

    cuenta.codigoUsado = true;
    cuenta.tieneContrasena = true;
    cuenta.intentosFallidos = 0;

    return { exitoso: true, datos: null, mensaje: '' };
  });
}
