import { useId } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import SelectorFecha from '../../horarios/components/SelectorFecha.jsx';
import estilos from './CampoUsuario.module.css';

/** Fecha local de ayer en formato ISO (la fecha de nacimiento debe ser anterior a hoy). */
function fechaAyerISO() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - 1);
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/**
 * Fecha de nacimiento con el calendario en español usado en horarios. Incluye
 * selectores de mes y año para no tener que retroceder mes a mes, y reutiliza
 * la etiqueta y el mensaje de error de los demás campos del formulario.
 */
export default function CampoFechaNacimiento({
  etiqueta,
  valor,
  alCambiar,
  error = '',
  requerido = false
}) {
  const id = useId();
  const idMensaje = `${id}-mensaje`;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
        {requerido && <span className={estilos.asterisco} aria-hidden="true"> *</span>}
      </label>
      <SelectorFecha
        id={id}
        etiqueta={etiqueta}
        valor={valor}
        max={fechaAyerISO()}
        alCambiar={alCambiar}
        enDialogo
        conSelectorMesAnio
        invalido={Boolean(error)}
        descritoPor={error ? idMensaje : undefined}
      />
      {error && (
        <p id={idMensaje} className={estilos.error}>
          <Icono nombre="alerta" tamano={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
