import { useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import estilos from './CampoContrasena.module.css';

/**
 * Campo "Contraseña" compartido por el inicio de sesión y HU-SAT-03
 * (restablecimiento), con botón opcional para mostrar/ocultar el valor. Por
 * defecto se comporta exactamente como el campo del login: etiqueta
 * "Contraseña", `name="contrasena"` y ojo visible (docs/planes/
 * restablecer-contrasena.md §4.4).
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.valor Controlado.
 * @param {string|string[]} [props.error] Mensaje del campo, o una lista de requisitos incumplidos.
 * @param {'current-password'|'new-password'|'off'} props.autoComplete
 * @param {import('react').RefObject<HTMLInputElement>} props.refInput
 * @param {(valor: string) => void} props.alCambiar
 * @param {() => void} props.alSalir Validación al perder el foco.
 * @param {string} [props.etiqueta] Texto de la etiqueta. Por defecto, `'Contraseña'`.
 * @param {string} [props.nombre] Atributo `name` del input. Por defecto, `'contrasena'`.
 * @param {boolean} [props.conOjo] Muestra el botón de mostrar/ocultar. Por defecto, `true`.
 * @param {string} [props.placeholder]
 * @param {string} [props.ayuda] Texto auxiliar bajo la etiqueta (por ejemplo, los requisitos de la política).
 */
export default function CampoContrasena({
  id,
  valor,
  error,
  autoComplete,
  refInput,
  alCambiar,
  alSalir,
  etiqueta = 'Contraseña',
  nombre = 'contrasena',
  conOjo = true,
  placeholder,
  ayuda
}) {
  const [visible, establecerVisible] = useState(false);
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const errores = Array.isArray(error) ? error : error ? [error] : [];
  const tieneError = errores.length > 0;

  const idsDescriptores = [ayuda ? idAyuda : null, tieneError ? idError : null].filter(Boolean);
  const ariaDescribedBy = idsDescriptores.length > 0 ? idsDescriptores.join(' ') : undefined;

  return (
    <div>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
      </label>
      {ayuda && (
        <p id={idAyuda} className={estilos.ayuda}>
          {ayuda}
        </p>
      )}
      <div className={estilos.contenedor}>
        <input
          ref={refInput}
          id={id}
          name={nombre}
          type={visible ? 'text' : 'password'}
          className={conOjo ? estilos.campo : estilos.campoSinOjo}
          value={valor}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={tieneError ? 'true' : undefined}
          aria-describedby={ariaDescribedBy}
          onChange={(evento) => alCambiar(evento.target.value)}
          onBlur={alSalir}
        />
        {conOjo && (
          <button
            type="button"
            className={estilos.botonOjo}
            aria-controls={id}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => establecerVisible((anterior) => !anterior)}
          >
            <Icono nombre={visible ? 'ojo-tachado' : 'ojo'} tamano={18} />
          </button>
        )}
      </div>
      {tieneError && (
        <ul id={idError} className={estilos.listaErrores}>
          {errores.map((mensaje) => (
            <li key={mensaje} className={estilos.mensajeError}>
              <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
              {mensaje}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
