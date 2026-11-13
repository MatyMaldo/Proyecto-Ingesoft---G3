import { Link } from 'react-router-dom';

import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import { RUTA_SOLICITAR_CODIGO } from '../../../shared/auth/constantesSesion.js';
import { esCorreoValido } from '../utils/validacionLogin.js';
import CampoContrasena from './CampoContrasena.jsx';
import estilos from './FormularioLogin.module.css';

const ID_CORREO = 'login-correo';
const ID_CORREO_ERROR = `${ID_CORREO}-error`;
const ID_CONTRASENA = 'login-contrasena';

/**
 * Formulario de inicio de sesión: pinta los campos y delega todo en las
 * props. No valida ni llama servicios (docs/planes/login.md §4.3, §U7). Sin
 * selector de perfil: el login es solo con correo electrónico y contraseña,
 * el rol lo determina el sistema a partir de la cuenta.
 *
 * @param {Object} props
 * @param {{ correo: string, contrasena: string, recordar: boolean }} props.valores
 * @param {{ correo?: string, contrasena?: string }} props.errores
 * @param {string|null} props.errorGeneral
 * @param {string|null} [props.avisoExito] Confirmación (p. ej. contraseña actualizada) sobre los campos.
 * @param {boolean} props.enviando
 * @param {import('react').RefObject<HTMLInputElement>} props.refCorreo
 * @param {import('react').RefObject<HTMLInputElement>} props.refContrasena
 * @param {(nombre: string, valor: *) => void} props.alCambiarCampo
 * @param {(nombre: string) => void} props.alSalirDeCampo
 * @param {(evento: SubmitEvent) => void} props.alEnviar
 */
export default function FormularioLogin({
  valores,
  errores,
  errorGeneral,
  avisoExito = null,
  enviando,
  refCorreo,
  refContrasena,
  alCambiarCampo,
  alSalirDeCampo,
  alEnviar
}) {
  const autoCompleteCorreo = valores.recordar ? 'username' : 'off';
  const autoCompleteContrasena = valores.recordar ? 'current-password' : 'off';

  return (
    <form noValidate onSubmit={alEnviar} aria-busy={enviando} aria-labelledby="login-titulo" className={estilos.formulario}>
      <div role="status" className={avisoExito ? estilos.avisoExito : estilos.avisoVacio}>
        {avisoExito && (
          <>
            <Icono nombre="verificar" tamano={18} />
            <span>{avisoExito}</span>
          </>
        )}
      </div>

      <div className={estilos.campo}>
        <label htmlFor={ID_CORREO} className={estilos.etiquetaCampo}>
          Correo electrónico
        </label>
        <div className={estilos.contenedorCorreo}>
          <Icono nombre="usuario" tamano={18} className={estilos.iconoCorreo} />
          <input
            ref={refCorreo}
            id={ID_CORREO}
            name="correo"
            type="email"
            inputMode="email"
            placeholder="Ingresa tu correo electrónico"
            className={estilos.campoCorreo}
            value={valores.correo}
            autoComplete={autoCompleteCorreo}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={errores.correo ? 'true' : undefined}
            aria-describedby={errores.correo ? ID_CORREO_ERROR : undefined}
            onChange={(evento) => alCambiarCampo('correo', evento.target.value)}
            onBlur={() => alSalirDeCampo('correo')}
          />
        </div>
        {errores.correo && (
          <p id={ID_CORREO_ERROR} className={estilos.mensajeError}>
            <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
            {errores.correo}
          </p>
        )}
      </div>

      <CampoContrasena
        id={ID_CONTRASENA}
        valor={valores.contrasena}
        error={errores.contrasena}
        autoComplete={autoCompleteContrasena}
        refInput={refContrasena}
        alCambiar={(valor) => alCambiarCampo('contrasena', valor)}
        alSalir={() => alSalirDeCampo('contrasena')}
        placeholder="Ingresa tu contraseña"
      />

      <div className={estilos.filaOpciones}>
        <label className={estilos.opcionRecordar}>
          <input
            type="checkbox"
            id="login-recordar"
            name="recordar"
            className={estilos.casilla}
            checked={valores.recordar}
            onChange={(evento) => alCambiarCampo('recordar', evento.target.checked)}
          />
          Recordar mi correo
        </label>
        <Link
          to={RUTA_SOLICITAR_CODIGO}
          state={esCorreoValido(valores.correo.trim()) ? { correo: valores.correo.trim() } : undefined}
          className={estilos.enlace}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <div role="alert" className={errorGeneral ? estilos.alertaGeneral : undefined}>
        {errorGeneral && (
          <>
            <Icono nombre="alerta" tamano={18} />
            <span>{errorGeneral}</span>
          </>
        )}
      </div>

      <button type="submit" className={estilos.botonEnviar} aria-disabled={enviando ? 'true' : undefined}>
        {enviando ? (
          <>
            <Icono nombre="cargando" tamano={18} className={estilos.iconoCargando} />
            Ingresando…
          </>
        ) : (
          <>
            Iniciar sesión
            <Icono nombre="flecha-derecha" tamano={18} />
          </>
        )}
      </button>

      <span role="status" className={estilosUtil.ocultoVisualmente}>
        {enviando ? 'Ingresando…' : ''}
      </span>
    </form>
  );
}
