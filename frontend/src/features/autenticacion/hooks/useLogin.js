import { useRef, useState } from 'react';

import useAuth from '../../../shared/auth/useAuth.js';
import { PERFILES_ACCESO } from '../constants/perfilesAcceso.js';
import { MENSAJES_RECHAZO, MENSAJE_ERROR_INESPERADO } from '../constants/mensajesLogin.js';
import { validarCredenciales, validarIdentificador, validarContrasena } from '../utils/validacionLogin.js';
import { iniciarSesion, MOTIVOS_RECHAZO } from '../services/autenticacionService.js';

const PERFIL_INICIAL = (PERFILES_ACCESO.find((perfil) => perfil.habilitado) ?? PERFILES_ACCESO[0]).valor;

const VALORES_INICIALES = Object.freeze({
  perfil: PERFIL_INICIAL,
  identificador: '',
  contrasena: '',
  recordar: false
});

/**
 * Devuelve el validador de formato de un campo (sin la regla de obligatoriedad,
 * que solo se aplica al enviar).
 */
function obtenerValidadorFormato(nombre) {
  return nombre === 'identificador' ? validarIdentificador : validarContrasena;
}

/**
 * Estado y lógica de la pantalla de inicio de sesión (HU-SAT-07): valores del
 * formulario, validación en cliente y llamada a `autenticacionService`.
 *
 * @returns {{
 *   valores: { perfil: string, identificador: string, contrasena: string, recordar: boolean },
 *   errores: { identificador?: string, contrasena?: string },
 *   errorGeneral: string | null,
 *   enviando: boolean,
 *   perfiles: Array,
 *   refIdentificador: import('react').RefObject<HTMLInputElement>,
 *   refContrasena: import('react').RefObject<HTMLInputElement>,
 *   manejarCambioCampo: (nombre: 'perfil'|'identificador'|'contrasena'|'recordar', valor: *) => void,
 *   manejarSalidaCampo: (nombre: 'identificador'|'contrasena') => void,
 *   manejarEnvio: (evento: SubmitEvent) => void
 * }}
 */
export default function useLogin() {
  const { establecerSesion } = useAuth();

  const [valores, establecerValores] = useState(VALORES_INICIALES);
  const [errores, establecerErrores] = useState({});
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [enviando, establecerEnviando] = useState(false);

  const refIdentificador = useRef(null);
  const refContrasena = useRef(null);

  function manejarCambioCampo(nombre, valor) {
    establecerErrorGeneral(null);

    if (nombre === 'perfil') {
      const perfil = PERFILES_ACCESO.find((candidato) => candidato.valor === valor);
      if (!perfil || !perfil.habilitado) {
        return;
      }
    }

    establecerValores((anteriores) => ({ ...anteriores, [nombre]: valor }));

    // Revalida en cada cambio solo si el campo ya mostró un error, y lo quita
    // en cuanto el valor pasa a ser válido.
    if ((nombre === 'identificador' || nombre === 'contrasena') && errores[nombre]) {
      const error = obtenerValidadorFormato(nombre)(valor);
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
  }

  function manejarSalidaCampo(nombre) {
    if (nombre !== 'identificador' && nombre !== 'contrasena') {
      return;
    }

    const valor = valores[nombre];
    // Nunca se muestra "es obligatorio" al pasar con Tab por un campo vacío.
    if (valor.length === 0) {
      return;
    }

    const error = obtenerValidadorFormato(nombre)(valor);
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

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    establecerErrorGeneral(null);

    const erroresEncontrados = validarCredenciales(valores);

    if (Object.keys(erroresEncontrados).length > 0) {
      establecerErrores(erroresEncontrados);

      if (erroresEncontrados.identificador) {
        refIdentificador.current?.focus();
      } else if (erroresEncontrados.contrasena) {
        refContrasena.current?.focus();
      }

      return;
    }

    establecerErrores({});
    establecerEnviando(true);

    const resultado = await iniciarSesion({
      perfil: valores.perfil,
      identificador: valores.identificador.trim(),
      password: valores.contrasena
    });

    if (resultado.exitoso) {
      // El componente se desmonta con la redirección de `RutaPublica`: no se
      // actualiza más estado local.
      establecerSesion(resultado.datos);
      return;
    }

    establecerEnviando(false);

    if (resultado.motivo === MOTIVOS_RECHAZO.DATOS_INVALIDOS) {
      establecerErrorGeneral(resultado.mensaje || MENSAJE_ERROR_INESPERADO);
    } else {
      establecerErrorGeneral(MENSAJES_RECHAZO[resultado.motivo] ?? MENSAJE_ERROR_INESPERADO);
    }
  }

  return {
    valores,
    errores,
    errorGeneral,
    enviando,
    perfiles: PERFILES_ACCESO,
    refIdentificador,
    refContrasena,
    manejarCambioCampo,
    manejarSalidaCampo,
    manejarEnvio
  };
}
