import Icono from '../../../shared/components/Icono.jsx';
import { LONGITUD_CODIGO } from '../constants/reglasRestablecimiento.js';
import { PLACEHOLDER_CODIGO } from '../constants/mensajesRestablecimiento.js';
import estilos from './CampoCodigoVerificacion.module.css';

/**
 * Campo "Código de verificación" de la pantalla "Restablecer contraseña"
 * (HU-SAT-03). No filtra caracteres mientras el usuario escribe: la
 * validación de formato (6 dígitos) da el mensaje correspondiente (docs/
 * planes/restablecer-contrasena.md §4.3).
 *
 * @param {Object} props
 * @param {string} props.id `id` del input; el error usa `${id}-error`.
 * @param {string} props.valor Controlado.
 * @param {string} [props.error] Mensaje del campo.
 * @param {import('react').RefObject<HTMLInputElement>} props.refInput
 * @param {(valor: string) => void} props.alCambiar
 * @param {() => void} props.alSalir Validación de formato al perder el foco.
 */
export default function CampoCodigoVerificacion({ id, valor, error, refInput, alCambiar, alSalir }) {
  const idError = `${id}-error`;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        Código de verificación
      </label>
      <input
        ref={refInput}
        id={id}
        name="codigo"
        type="text"
        inputMode="numeric"
        maxLength={LONGITUD_CODIGO}
        placeholder={PLACEHOLDER_CODIGO}
        className={estilos.entrada}
        value={valor}
        autoComplete="one-time-code"
        spellCheck={false}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? idError : undefined}
        onChange={(evento) => alCambiar(evento.target.value)}
        onBlur={alSalir}
      />
      {error && (
        <p id={idError} className={estilos.mensajeError}>
          <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
          {error}
        </p>
      )}
    </div>
  );
}
