import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import SelectorPerfil from './SelectorPerfil.jsx';
import CampoContrasena from './CampoContrasena.jsx';
import estilos from './FormularioLogin.module.css';

const ID_IDENTIFICADOR = 'login-identificador';
const ID_IDENTIFICADOR_ERROR = `${ID_IDENTIFICADOR}-error`;
const ID_CONTRASENA = 'login-contrasena';
const ID_AVISO_NO_DISPONIBLE = 'login-aviso-no-disponible';

/**
 * Formulario de inicio de sesión: pinta los campos y delega todo en las
 * props. No valida ni llama servicios (docs/planes/login.md §4.3).
 *
 * @param {Object} props
 * @param {{ perfil: string, identificador: string, contrasena: string, recordar: boolean }} props.valores
 * @param {{ identificador?: string, contrasena?: string }} props.errores
 * @param {string|null} props.errorGeneral
 * @param {boolean} props.enviando
 * @param {Array} props.perfiles
 * @param {import('react').RefObject<HTMLInputElement>} props.refIdentificador
 * @param {import('react').RefObject<HTMLInputElement>} props.refContrasena
 * @param {(nombre: string, valor: *) => void} props.alCambiarCampo
 * @param {(nombre: string) => void} props.alSalirDeCampo
 * @param {(evento: SubmitEvent) => void} props.alEnviar
 */
export default function FormularioLogin({
  valores,
  errores,
  errorGeneral,
  enviando,
  perfiles,
  refIdentificador,
  refContrasena,
  alCambiarCampo,
  alSalirDeCampo,
  alEnviar
}) {
  const perfilSeleccionado = perfiles.find((perfil) => perfil.valor === valores.perfil);
  const autoCompleteIdentificador = valores.recordar ? 'username' : 'off';
  const autoCompleteContrasena = valores.recordar ? 'current-password' : 'off';

  return (
    <form noValidate onSubmit={alEnviar} aria-busy={enviando} aria-labelledby="login-titulo" className={estilos.formulario}>
      <SelectorPerfil
        perfiles={perfiles}
        valorSeleccionado={valores.perfil}
        alSeleccionar={(valor) => alCambiarCampo('perfil', valor)}
      />

      <div className={estilos.separador} aria-hidden="true">
        <span className={estilos.lineaSeparador} />
        <span className={estilos.textoSeparador}>Credenciales</span>
        <span className={estilos.lineaSeparador} />
      </div>

      <div className={estilos.campo}>
        <label htmlFor={ID_IDENTIFICADOR} className={estilos.etiquetaCampo}>
          Correo electrónico o DNI
        </label>
        <div className={estilos.contenedorIdentificador}>
          <Icono nombre="usuario" tamano={18} className={estilos.iconoIdentificador} />
          <input
            ref={refIdentificador}
            id={ID_IDENTIFICADOR}
            name="identificador"
            type="text"
            className={estilos.campoIdentificador}
            value={valores.identificador}
            autoComplete={autoCompleteIdentificador}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={errores.identificador ? 'true' : undefined}
            aria-describedby={errores.identificador ? ID_IDENTIFICADOR_ERROR : undefined}
            onChange={(evento) => alCambiarCampo('identificador', evento.target.value)}
            onBlur={() => alSalirDeCampo('identificador')}
          />
        </div>
        {errores.identificador && (
          <p id={ID_IDENTIFICADOR_ERROR} className={estilos.mensajeError}>
            <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
            {errores.identificador}
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
          Recordar mi sesión
        </label>
        <button
          type="button"
          className={estilos.enlaceNoDisponible}
          aria-disabled="true"
          aria-describedby={ID_AVISO_NO_DISPONIBLE}
          title="Función no disponible por ahora"
          // TODO(pregunta): enlazar a la pantalla de HU-SAT-03 cuando exista.
          onClick={(evento) => evento.preventDefault()}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      <span id={ID_AVISO_NO_DISPONIBLE} className={estilosUtil.ocultoVisualmente}>
        Función no disponible por ahora.
      </span>

      <div role="alert" className={errorGeneral ? estilos.alertaGeneral : undefined}>
        {errorGeneral && (
          <>
            <Icono nombre="alerta" tamano={18} />
            <span>{errorGeneral}</span>
          </>
        )}
      </div>

      <div className={estilos.recuadroIngresandoComo}>
        <span className={estilos.iconoIngresandoComo}>
          <Icono nombre="escudo" tamano={18} />
        </span>
        <div>
          <p className={estilos.rotuloIngresandoComo}>Ingresando como</p>
          <p className={estilos.valorIngresandoComo}>
            {perfilSeleccionado?.etiqueta ?? ''} — Colegio San Marcos
          </p>
        </div>
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
