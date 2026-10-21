import { useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import estilos from './CampoContrasena.module.css';

/**
 * Campo "Contraseña" del formulario de inicio de sesión, con botón para
 * mostrar/ocultar el valor (docs/planes/login.md §4.5).
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.valor Controlado.
 * @param {string} [props.error] Mensaje del campo; ausente = sin error.
 * @param {'current-password'|'off'} props.autoComplete
 * @param {import('react').RefObject<HTMLInputElement>} props.refInput
 * @param {(valor: string) => void} props.alCambiar
 * @param {() => void} props.alSalir Validación al perder el foco.
 */
export default function CampoContrasena({ id, valor, error, autoComplete, refInput, alCambiar, alSalir }) {
  const [visible, establecerVisible] = useState(false);
  const idError = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className={estilos.etiqueta}>
        Contraseña
      </label>
      <div className={estilos.contenedor}>
        <input
          ref={refInput}
          id={id}
          name="contrasena"
          type={visible ? 'text' : 'password'}
          className={estilos.campo}
          value={valor}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? idError : undefined}
          onChange={(evento) => alCambiar(evento.target.value)}
          onBlur={alSalir}
        />
        <button
          type="button"
          className={estilos.botonOjo}
          aria-controls={id}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => establecerVisible((anterior) => !anterior)}
        >
          <Icono nombre={visible ? 'ojo-tachado' : 'ojo'} tamano={18} />
        </button>
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
