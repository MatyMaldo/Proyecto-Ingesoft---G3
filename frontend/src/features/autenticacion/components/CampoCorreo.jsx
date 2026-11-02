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
 */
export default function CampoCorreo({ id, valor, error, refInput, alCambiar, alSalir }) {
  const idError = `${id}-error`;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        Correo electrónico
      </label>
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
