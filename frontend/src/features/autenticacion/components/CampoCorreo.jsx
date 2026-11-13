import Icono from '../../../shared/components/Icono.jsx';
import estilos from './CampoCorreo.module.css';

/**
 * Campo "Correo electrónico" compartido por las pantallas de HU-SAT-03, con
 * el mismo ícono y placeholder que el campo de correo del login (docs/planes/
 * restablecer-contrasena.md §4.2).
 *
 * @param {Object} props
 * @param {string} props.id `id` del input; el error usa `${id}-error`.
 * @param {string} props.valor Controlado.
 * @param {string} [props.error] Mensaje del campo.
 * @param {import('react').RefObject<HTMLInputElement>} props.refInput
 * @param {(valor: string) => void} props.alCambiar
 * @param {() => void} props.alSalir Validación de formato al perder el foco.
 * @param {boolean} [props.soloLectura] Muestra el correo fijo, sin edición.
 * @param {string} [props.textoAccion] Texto de la acción junto a la etiqueta (p. ej. "Cambiar correo").
 * @param {() => void} [props.alAccion] Se llama al pulsar esa acción. Sin ambos, no se muestra.
 */
export default function CampoCorreo({
  id,
  valor,
  error,
  refInput,
  alCambiar,
  alSalir,
  soloLectura = false,
  textoAccion,
  alAccion
}) {
  const idError = `${id}-error`;

  return (
    <div className={estilos.campo}>
      <div className={estilos.filaEtiqueta}>
        <label htmlFor={id} className={estilos.etiqueta}>
          Correo electrónico
        </label>
        {textoAccion && alAccion && (
          <button type="button" className={estilos.accion} onClick={alAccion}>
            {textoAccion}
          </button>
        )}
      </div>
      <div className={estilos.contenedor}>
        <Icono nombre="usuario" tamano={18} className={estilos.icono} />
        <input
          ref={refInput}
          id={id}
          name="correo"
          type="email"
          inputMode="email"
          placeholder="Ingresa tu correo electrónico"
          className={estilos.entrada}
          value={valor}
          readOnly={soloLectura}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? idError : undefined}
          onChange={(evento) => alCambiar(evento.target.value)}
          onBlur={alSalir}
        />
      </div>
      {error && (
        <p id={idError} className={estilos.mensajeError}>
          <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
          {error}
        </p>
      )}
    </div>
  );
}
