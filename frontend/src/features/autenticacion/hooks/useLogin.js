import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useAuth from '../../../shared/auth/useAuth.js';
import {
  MENSAJES_RECHAZO,
  MENSAJES_CIERRE_SESION,
  MENSAJE_ERROR_INESPERADO,
  MENSAJE_CONTRASENA_ACTUALIZADA
} from '../constants/mensajesLogin.js';
import { validarCredenciales, validarCorreo, validarContrasena } from '../utils/validacionLogin.js';
import { iniciarSesion, MOTIVOS_RECHAZO } from '../services/autenticacionService.js';
import {
  leerPreferenciasLogin,
  guardarPreferenciasLogin,
  borrarPreferenciasLogin
} from '../utils/preferenciasLogin.js';

// La casilla "Recordar mi correo" arranca desmarcada por defecto; solo
// aparece marcada cuando hay preferencias guardadas (`calcularValoresIniciales`).
const VALORES_INICIALES = Object.freeze({
  correo: '',
  contrasena: '',
  recordar: false
});

/**
 * Valores iniciales del formulario: si hay preferencias guardadas de
 * "Recordar mi correo" (solo el correo electrónico, nunca la contraseña), se
 * precargan y la casilla aparece marcada (docs/planes/login.md §U7, D26,
 * decisión del usuario 2026-11-01).
 */
function calcularValoresIniciales(correoLlegada) {
  const preferencias = leerPreferenciasLogin();
  const base = preferencias ? { correo: preferencias.correo, contrasena: '', recordar: true } : VALORES_INICIALES;

  // Tras restablecer la contraseña se precarga el correo con el que se hizo.
  if (typeof correoLlegada === 'string' && correoLlegada.length > 0) {
    return { ...base, correo: correoLlegada };
  }

  return base;
}

/**
 * Devuelve el validador de formato de un campo (sin la regla de obligatoriedad,
 * que solo se aplica al enviar).
 */
function obtenerValidadorFormato(nombre) {
  return nombre === 'correo' ? validarCorreo : validarContrasena;
}

/**
 * Estado y lógica de la pantalla de inicio de sesión (HU-SAT-07): valores del
 * formulario, validación en cliente, llamada a `autenticacionService` y aviso
 * de cierre de sesión por cuenta desactivada, contraseña restablecida o rol
 * modificado (Esc. 9-11, docs/planes/login.md §U2).
 *
 * @returns {{
 *   valores: { correo: string, contrasena: string, recordar: boolean },
 *   errores: { correo?: string, contrasena?: string },
 *   errorGeneral: string | null,
 *   avisoExito: string | null,
 *   enviando: boolean,
 *   refCorreo: import('react').RefObject<HTMLInputElement>,
 *   refContrasena: import('react').RefObject<HTMLInputElement>,
 *   manejarCambioCampo: (nombre: 'correo'|'contrasena'|'recordar', valor: *) => void,
 *   manejarSalidaCampo: (nombre: 'correo'|'contrasena') => void,
 *   manejarEnvio: (evento: SubmitEvent) => void
 * }}
 */
export default function useLogin() {
  const { establecerSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [valores, establecerValores] = useState(() => calcularValoresIniciales(location.state?.correo));
  const [errores, establecerErrores] = useState({});
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [avisoExito, establecerAvisoExito] = useState(null);
  const [enviando, establecerEnviando] = useState(false);

  const refCorreo = useRef(null);
  const refContrasena = useRef(null);

  // Aviso de cierre de sesión (Esc. 9-11): se muestra en un efecto de montaje
  // (no en el estado inicial) para que el `role="alert"` siempre montado lo
  // anuncie, y se limpia el `state` de la ruta para que recargar o volver a
  // `/iniciar-sesion` no repita el aviso (docs/planes/login.md §U2.5).
  useEffect(() => {
    const motivoCierre = location.state?.motivoCierre;
    const texto = motivoCierre ? MENSAJES_CIERRE_SESION[motivoCierre] : undefined;

    if (texto) {
      establecerErrorGeneral(texto);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    // Llegada desde "Restablecer contraseña": confirma el cambio y deja el foco en la contraseña.
    if (location.state?.contrasenaRestablecida === true) {
      establecerAvisoExito(MENSAJE_CONTRASENA_ACTUALIZADA);
      navigate(location.pathname, { replace: true, state: null });
      refContrasena.current?.focus();
    }
    // Solo al montar: el efecto limpia el `state`, así que no debe repetirse
    // ante cambios posteriores de `location`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function manejarCambioCampo(nombre, valor) {
    establecerErrorGeneral(null);

    // Si el usuario desmarca la casilla, se borra lo guardado en ese mismo
    // momento (no se espera a un nuevo envío). Decisión del usuario
    // 2026-11-01, docs/planes/login.md D26.
    if (nombre === 'recordar' && valor === false) {
      borrarPreferenciasLogin();
    }

    establecerValores((anteriores) => ({ ...anteriores, [nombre]: valor }));

    // Revalida en cada cambio solo si el campo ya mostró un error, y lo quita
    // en cuanto el valor pasa a ser válido.
    if ((nombre === 'correo' || nombre === 'contrasena') && errores[nombre]) {
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
    if (nombre !== 'correo' && nombre !== 'contrasena') {
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
    establecerAvisoExito(null);

    const erroresEncontrados = validarCredenciales(valores);

    if (Object.keys(erroresEncontrados).length > 0) {
      establecerErrores(erroresEncontrados);

      if (erroresEncontrados.correo) {
        refCorreo.current?.focus();
      } else if (erroresEncontrados.contrasena) {
        refContrasena.current?.focus();
      }

      return;
    }

    establecerErrores({});
    establecerEnviando(true);

    const resultado = await iniciarSesion({
      correo: valores.correo.trim(),
      password: valores.contrasena
    });

    if (resultado.exitoso) {
      // "Recordar mi correo" marcada: guarda el correo (nunca la contraseña ni
      // el token) tras un login correcto (D26).
      if (valores.recordar) {
        guardarPreferenciasLogin({ correo: valores.correo.trim() });
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
    avisoExito,
    enviando,
    refCorreo,
    refContrasena,
    manejarCambioCampo,
    manejarSalidaCampo,
    manejarEnvio
  };
}
