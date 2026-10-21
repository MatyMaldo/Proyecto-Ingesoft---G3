import { useRef, useState } from 'react';

import useAuth from '../../../shared/auth/useAuth.js';
import { PERFILES_ACCESO } from '../constants/perfilesAcceso.js';
import { MENSAJES_RECHAZO, MENSAJE_ERROR_INESPERADO } from '../constants/mensajesLogin.js';
import { validarCredenciales, validarIdentificador, validarContrasena } from '../utils/validacionLogin.js';
import { iniciarSesion, MOTIVOS_RECHAZO } from '../services/autenticacionService.js';
import {
  leerPreferenciasLogin,
  guardarPreferenciasLogin,
  borrarPreferenciasLogin
} from '../utils/preferenciasLogin.js';

const PERFIL_INICIAL = (PERFILES_ACCESO.find((perfil) => perfil.habilitado) ?? PERFILES_ACCESO[0]).valor;

// La casilla "Recordar mi sesión" arranca desmarcada por defecto; solo
// aparece marcada cuando hay preferencias guardadas (`calcularValoresIniciales`).
const VALORES_INICIALES = Object.freeze({
  perfil: PERFIL_INICIAL,
  identificador: '',
  contrasena: '',
  recordar: false
});

/**
 * Valores iniciales del formulario: si hay preferencias guardadas de
 * "Recordar mi sesión" (identificador y perfil, nunca la contraseña), se
 * precargan y la casilla aparece marcada (docs/planes/login.md D19, opción B,
 * decisión del usuario 2026-10-20). Un perfil guardado que ya no esté
 * habilitado se ignora y se usa el perfil inicial.
 */
function calcularValoresIniciales() {
  const preferencias = leerPreferenciasLogin();

  if (!preferencias) {
    return VALORES_INICIALES;
  }

  const perfilGuardadoHabilitado = PERFILES_ACCESO.find(
    (perfil) => perfil.valor === preferencias.perfil && perfil.habilitado
  );

  return {
    perfil: perfilGuardadoHabilitado ? preferencias.perfil : PERFIL_INICIAL,
    identificador: preferencias.identificador,
    contrasena: '',
    recordar: true
  };
}

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

  const [valores, establecerValores] = useState(calcularValoresIniciales);
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

    // Si el usuario desmarca la casilla, se borra lo guardado en ese mismo
    // momento (no se espera a un nuevo envío). Decisión del usuario
    // 2026-10-20, docs/planes/login.md D19, opción B.
    if (nombre === 'recordar' && valor === false) {
      borrarPreferenciasLogin();
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
      // "Recordar mi sesión" marcada: guarda identificador y perfil (nunca la
      // contraseña ni el token) tras un login correcto (D19, opción B).
      if (valores.recordar) {
        guardarPreferenciasLogin({ identificador: valores.identificador.trim(), perfil: valores.perfil });
      }

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
