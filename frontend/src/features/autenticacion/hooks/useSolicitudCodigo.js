import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { RUTA_RESTABLECER_CONTRASENA } from '../../../shared/auth/constantesSesion.js';
import { MENSAJE_ERROR_INESPERADO } from '../constants/mensajesLogin.js';
import { ESPERA_REENVIO_SEGUNDOS } from '../constants/reglasRestablecimiento.js';
import { validarCorreo, esCorreoValido } from '../utils/validacionLogin.js';
import { leerInstanteUltimaSolicitud, guardarInstanteUltimaSolicitud } from '../utils/esperaSolicitudCodigo.js';
import { solicitarCodigo, MOTIVOS_RECHAZO_RESTABLECIMIENTO } from '../services/restablecimientoService.js';
import useCuentaRegresiva from './useCuentaRegresiva.js';

/**
 * Valor inicial del campo "Correo electrónico": el que llegó desde el login
 * (solo si tiene formato de cadena), o vacío.
 *
 * @param {*} correoState
 * @returns {string}
 */
function calcularCorreoInicial(correoState) {
  return typeof correoState === 'string' ? correoState : '';
}

/**
 * Estado y lógica de la pantalla "Solicitar código" (HU-SAT-03, pantalla (a)):
 * valida el correo, llama a `solicitarCodigo` y navega a "Restablecer
 * contraseña" con el correo ya ingresado (docs/planes/restablecer-contrasena.md §7.3).
 *
 * @returns {{
 *   correo: string,
 *   errorCorreo: string|undefined,
 *   errorGeneral: string|null,
 *   enviando: boolean,
 *   segundosEspera: number,
 *   refCorreo: import('react').RefObject<HTMLInputElement>,
 *   estadoEnlaceCodigo: { correo: string } | null,
 *   manejarCambioCorreo: (valor: string) => void,
 *   manejarSalidaCorreo: () => void,
 *   manejarEnvio: (evento: SubmitEvent) => void
 * }}
 */
export default function useSolicitudCodigo() {
  const location = useLocation();
  const navigate = useNavigate();

  const [correo, establecerCorreo] = useState(() => calcularCorreoInicial(location.state?.correo));
  const [errorCorreo, establecerErrorCorreo] = useState(undefined);
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [enviando, establecerEnviando] = useState(false);
  const [instanteUltimaSolicitud, establecerInstanteUltimaSolicitud] = useState(leerInstanteUltimaSolicitud);

  const refCorreo = useRef(null);

  const segundosEspera = useCuentaRegresiva(instanteUltimaSolicitud, ESPERA_REENVIO_SEGUNDOS);
  const correoRecortado = correo.trim();
  const estadoEnlaceCodigo = esCorreoValido(correoRecortado) ? { correo: correoRecortado } : null;

  function manejarCambioCorreo(valor) {
    establecerErrorGeneral(null);
    establecerCorreo(valor);

    if (errorCorreo) {
      establecerErrorCorreo(validarCorreo(valor) ?? undefined);
    }
  }

  function manejarSalidaCorreo() {
    if (correo.length === 0) {
      return;
    }
    establecerErrorCorreo(validarCorreo(correo) ?? undefined);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (enviando || segundosEspera > 0) {
      return;
    }

    establecerErrorGeneral(null);

    const error = validarCorreo(correo);
    if (error) {
      establecerErrorCorreo(error);
      refCorreo.current?.focus();
      return;
    }

    establecerErrorCorreo(undefined);
    establecerEnviando(true);

    const resultado = await solicitarCodigo({ correo: correoRecortado });

    if (resultado.exitoso) {
      const ahora = Date.now();
      guardarInstanteUltimaSolicitud(ahora);
      establecerInstanteUltimaSolicitud(ahora);
      // El componente se desmonta al navegar: no se actualiza más estado local.
      navigate(RUTA_RESTABLECER_CONTRASENA, { state: { correo: correoRecortado, avisoSolicitud: true } });
      return;
    }

    establecerEnviando(false);

    if (resultado.motivo === MOTIVOS_RECHAZO_RESTABLECIMIENTO.DATOS_INVALIDOS) {
      establecerErrorGeneral(resultado.mensaje || MENSAJE_ERROR_INESPERADO);
    } else {
      establecerErrorGeneral(MENSAJE_ERROR_INESPERADO);
    }
  }

  return {
    correo,
    errorCorreo,
    errorGeneral,
    enviando,
    segundosEspera,
    refCorreo,
    estadoEnlaceCodigo,
    manejarCambioCorreo,
    manejarSalidaCorreo,
    manejarEnvio
  };
}
