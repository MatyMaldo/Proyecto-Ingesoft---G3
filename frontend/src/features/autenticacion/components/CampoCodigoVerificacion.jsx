import Icono from '../../../shared/components/Icono.jsx';
import { PLACEHOLDER_CODIGO } from '../constants/mensajesRestablecimiento.js';
import estilos from './CampoCodigoVerificacion.module.css';

/**
 * Campo "Código de verificación" de la pantalla "Restablecer contraseña"
 * (HU-SAT-03). No lleva `maxLength`: quien lo usa conserva solo los dígitos
 * (hasta 6), para que se pueda pegar un código con espacios o guiones.
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
