import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { RUTA_LOGIN } from '../../../shared/auth/constantesSesion.js';
import { MENSAJE_ERROR_INESPERADO } from '../constants/mensajesLogin.js';
import { ESPERA_REENVIO_SEGUNDOS } from '../constants/reglasRestablecimiento.js';
import {
  MENSAJE_CODIGO_INVALIDO,
  MENSAJE_CONTRASENAS_NO_COINCIDEN,
  MENSAJES_POLITICA_CONTRASENA,
  ORDEN_REQUISITOS_POLITICA
} from '../constants/mensajesRestablecimiento.js';
import { validarCorreo } from '../utils/validacionLogin.js';
import {
  validarCodigo,
  validarNuevaContrasena,
  validarConfirmacion,
  validarRestablecimiento,
  evaluarPoliticaContrasena
} from '../utils/validacionRestablecimiento.js';
import { leerInstanteUltimaSolicitud, guardarInstanteUltimaSolicitud } from '../utils/esperaSolicitudCodigo.js';
import { solicitarCodigo, restablecerContrasena, MOTIVOS_RECHAZO_RESTABLECIMIENTO } from '../services/restablecimientoService.js';
import useCuentaRegresiva from './useCuentaRegresiva.js';

const VALORES_INICIALES = Object.freeze({
  correo: '',
  codigo: '',
  nuevaContrasena: '',
  confirmacionContrasena: ''
});

/**
 * Convierte las claves de requisitos incumplidos que devuelve el backend en
 * los textos literales de la política, en el orden de la HU. Las claves
 * desconocidas se ignoran; si no queda ninguna conocida, se recalcula la
 * política localmente a partir del valor ya escrito (docs/planes/
 * restablecer-contrasena.md §7.4).
 *
 * @param {string[]} requisitosIncumplidos
 * @param {string} nuevaContrasena
 * @returns {string[]}
 */
function mapearRequisitosATextos(requisitosIncumplidos, nuevaContrasena) {
  const clavesOrdenadas = ORDEN_REQUISITOS_POLITICA.filter((clave) => requisitosIncumplidos.includes(clave));
  const claves = clavesOrdenadas.length > 0 ? clavesOrdenadas : evaluarPoliticaContrasena(nuevaContrasena);

  return claves.map((clave) => MENSAJES_POLITICA_CONTRASENA[clave]);
}

/**
 * Valida el formato de un campo individual (sin la regla de "confirmación
 * vacía primero", que ya cubre `validarConfirmacion`).
 */
function validarCampo(nombre, valores) {
  switch (nombre) {
    case 'correo':
      return validarCorreo(valores.correo);
    case 'codigo':
      return validarCodigo(valores.codigo);
    case 'nuevaContrasena':
      return validarNuevaContrasena(valores.nuevaContrasena);
    case 'confirmacionContrasena':
      return validarConfirmacion(valores.nuevaContrasena, valores.confirmacionContrasena);
    default:
      return null;
  }
}

/**
 * Estado y lógica de la pantalla "Restablecer contraseña" (HU-SAT-03,
 * pantalla (b)): valores de los cuatro campos, validación en cliente, llamada
 * a `restablecerContrasena` / `solicitarCodigo` y el aviso del Esc. 2
 * (docs/planes/restablecer-contrasena.md §7.4).
 */
export default function useRestablecerContrasena() {
  const location = useLocation();
  const navigate = useNavigate();

  const [valores, establecerValores] = useState(() => ({
    ...VALORES_INICIALES,
    correo: typeof location.state?.correo === 'string' ? location.state.correo : ''
  }));
  const [errores, establecerErrores] = useState({});
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [codigoRechazado, establecerCodigoRechazado] = useState(false);
  const [avisoSolicitud, establecerAvisoSolicitud] = useState(() => location.state?.avisoSolicitud === true);
  const [enviando, establecerEnviando] = useState(false);
  const [solicitandoCodigo, establecerSolicitandoCodigo] = useState(false);
  const [instanteUltimaSolicitud, establecerInstanteUltimaSolicitud] = useState(leerInstanteUltimaSolicitud);

  const refCorreo = useRef(null);
  const refCodigo = useRef(null);
  const refNuevaContrasena = useRef(null);
  const refConfirmacionContrasena = useRef(null);
  const refs = {
    correo: refCorreo,
    codigo: refCodigo,
    nuevaContrasena: refNuevaContrasena,
    confirmacionContrasena: refConfirmacionContrasena
  };

  const segundosEspera = useCuentaRegresiva(instanteUltimaSolicitud, ESPERA_REENVIO_SEGUNDOS);

  // Limpia el `state` de navegación al montar (recargar no debe repetir el
  // aviso) y enfoca "Código de verificación" cuando llegó un correo precargado.
  useEffect(() => {
    const estadoLlegada = location.state;

    if (estadoLlegada) {
      navigate(location.pathname, { replace: true, state: null });
    }

    if (typeof estadoLlegada?.correo === 'string' && estadoLlegada.correo.length > 0) {
      refCodigo.current?.focus();
    }
    // Solo al montar: el efecto limpia el `state`, así que no debe repetirse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function manejarCambioCampo(nombre, valorCrudo) {
    establecerErrorGeneral(null);
    establecerCodigoRechazado(false);

    const valor = nombre === 'codigo' ? valorCrudo.trim() : valorCrudo;
    const valoresActualizados = { ...valores, [nombre]: valor };
    establecerValores(valoresActualizados);

    establecerErrores((anteriores) => {
      if (!anteriores[nombre] && !(nombre === 'nuevaContrasena' && anteriores.confirmacionContrasena)) {
        return anteriores;
      }

      const siguientes = { ...anteriores };

      if (anteriores[nombre]) {
        const error = validarCampo(nombre, valoresActualizados);
        if (error) {
          siguientes[nombre] = error;
        } else {
          delete siguientes[nombre];
        }
      }

      if (nombre === 'nuevaContrasena' && anteriores.confirmacionContrasena) {
        const errorConfirmacion = validarCampo('confirmacionContrasena', valoresActualizados);
        if (errorConfirmacion) {
          siguientes.confirmacionContrasena = errorConfirmacion;
        } else {
          delete siguientes.confirmacionContrasena;
        }
      }

      return siguientes;
    });
  }

  function manejarSalidaCampo(nombre) {
    const valor = valores[nombre];
    if (valor.length === 0) {
      return;
    }

    const error = validarCampo(nombre, valores);
    establecerErrores((anteriores) => {
      const siguientes = { ...anteriores };
      if (error) {
        siguientes[nombre] = error;
      } else {
        delete siguientes[nombre];
      }
      return siguientes;
    });
  }

  function enfocarPrimerCampoInvalido(erroresEncontrados) {
    if (erroresEncontrados.correo) {
      refCorreo.current?.focus();
    } else if (erroresEncontrados.codigo) {
      refCodigo.current?.focus();
    } else if (erroresEncontrados.nuevaContrasena) {
      refNuevaContrasena.current?.focus();
    } else if (erroresEncontrados.confirmacionContrasena) {
      refConfirmacionContrasena.current?.focus();
    }
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    establecerErrorGeneral(null);
    establecerCodigoRechazado(false);
    establecerAvisoSolicitud(false);

    const erroresEncontrados = validarRestablecimiento(valores);

    if (Object.keys(erroresEncontrados).length > 0) {
      establecerErrores(erroresEncontrados);
      enfocarPrimerCampoInvalido(erroresEncontrados);
      return;
    }

    establecerErrores({});
    establecerEnviando(true);

    const resultado = await restablecerContrasena({
      correo: valores.correo.trim(),
      codigo: valores.codigo.trim(),
      nuevaContrasena: valores.nuevaContrasena,
      confirmacionContrasena: valores.confirmacionContrasena
    });

    if (resultado.exitoso) {
      // El componente se desmonta con la redirección: no se actualiza más estado.
      navigate(RUTA_LOGIN, { replace: true });
      return;
    }

    establecerEnviando(false);

    switch (resultado.motivo) {
      case MOTIVOS_RECHAZO_RESTABLECIMIENTO.CODIGO_INVALIDO:
        establecerErrorGeneral(MENSAJE_CODIGO_INVALIDO);
        establecerCodigoRechazado(true);
        refCodigo.current?.focus();
        break;

      case MOTIVOS_RECHAZO_RESTABLECIMIENTO.POLITICA_CONTRASENA:
        establecerErrores((anteriores) => ({
          ...anteriores,
          nuevaContrasena: mapearRequisitosATextos(resultado.requisitosIncumplidos ?? [], valores.nuevaContrasena)
        }));
        refNuevaContrasena.current?.focus();
        break;

      case MOTIVOS_RECHAZO_RESTABLECIMIENTO.CONTRASENAS_NO_COINCIDEN:
        establecerErrores((anteriores) => ({ ...anteriores, confirmacionContrasena: MENSAJE_CONTRASENAS_NO_COINCIDEN }));
        refConfirmacionContrasena.current?.focus();
        break;

      case MOTIVOS_RECHAZO_RESTABLECIMIENTO.DATOS_INVALIDOS:
        establecerErrorGeneral(resultado.mensaje || MENSAJE_ERROR_INESPERADO);
        break;

      default:
        establecerErrorGeneral(MENSAJE_ERROR_INESPERADO);
    }
  }

  async function manejarSolicitudNuevoCodigo() {
    if (solicitandoCodigo || segundosEspera > 0) {
      return;
    }

    const errorCorreo = validarCorreo(valores.correo);
    if (errorCorreo) {
      establecerErrores((anteriores) => ({ ...anteriores, correo: errorCorreo }));
      refCorreo.current?.focus();
      return;
    }

    establecerSolicitandoCodigo(true);

    const resultado = await solicitarCodigo({ correo: valores.correo.trim() });

    establecerSolicitandoCodigo(false);

    if (resultado.exitoso) {
      const ahora = Date.now();
      guardarInstanteUltimaSolicitud(ahora);
      establecerInstanteUltimaSolicitud(ahora);
      establecerAvisoSolicitud(true);
      establecerErrorGeneral(null);
      establecerCodigoRechazado(false);
      establecerValores((anteriores) => ({ ...anteriores, codigo: '' }));
      establecerErrores((anteriores) => {
        const siguientes = { ...anteriores };
        delete siguientes.codigo;
        return siguientes;
      });
      refCodigo.current?.focus();
      return;
    }

    if (resultado.motivo === MOTIVOS_RECHAZO_RESTABLECIMIENTO.DATOS_INVALIDOS) {
      establecerErrorGeneral(resultado.mensaje || MENSAJE_ERROR_INESPERADO);
    } else {
      establecerErrorGeneral(MENSAJE_ERROR_INESPERADO);
    }
  }

  return {
    valores,
    errores,
    errorGeneral,
    codigoRechazado,
    avisoSolicitud,
    enviando,
    solicitandoCodigo,
    segundosEspera,
    refs,
    manejarCambioCampo,
    manejarSalidaCampo,
    manejarEnvio,
    manejarSolicitudNuevoCodigo
  };
}
