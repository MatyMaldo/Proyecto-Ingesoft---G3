import { useId } from 'react';

import Icono from './Icono.jsx';
import estilosUtil from '../styles/utilidades.module.css';
import estilos from './FiltroRangoFechas.module.css';

/**
 * Dos campos de fecha controlados ("Desde" / "Hasta") con el mensaje de
 * validación del rango. Es presentacional: no valida ni filtra, solo muestra
 * lo que recibe. Compartido por Auditorías y Log de errores
 * (docs/planes/auditorias.md §3.2; antes vivía en `features/log-errores/components`).
 *
 * @param {Object} props
 * @param {string} props.fechaDesde `'YYYY-MM-DD'` o `''`.
 * @param {string} props.fechaHasta `'YYYY-MM-DD'` o `''`.
 * @param {(valor: string) => void} props.alCambiarFechaDesde
 * @param {(valor: string) => void} props.alCambiarFechaHasta
 * @param {string} props.mensajeError `''` si el rango es válido.
 */
export default function FiltroRangoFechas({
  fechaDesde,
  fechaHasta,
  alCambiarFechaDesde,
  alCambiarFechaHasta,
  mensajeError = ''
}) {
  const idDesde = useId();
  const idHasta = useId();
  const idMensaje = useId();
  const esInvalido = mensajeError !== '';

  return (
    <fieldset className={estilos.grupo}>
      <legend className={estilosUtil.ocultoVisualmente}>Rango de fechas</legend>

      <div className={estilos.campo}>
        <label htmlFor={idDesde} className={estilos.etiqueta}>
          Desde
        </label>
        <input
          id={idDesde}
          type="date"
          className={estilos.input}
          value={fechaDesde}
          onChange={(evento) => alCambiarFechaDesde(evento.target.value)}
          aria-invalid={esInvalido || undefined}
          aria-describedby={esInvalido ? idMensaje : undefined}
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor={idHasta} className={estilos.etiqueta}>
          Hasta
        </label>
        <input
          id={idHasta}
          type="date"
          className={estilos.input}
          value={fechaHasta}
          onChange={(evento) => alCambiarFechaHasta(evento.target.value)}
          aria-invalid={esInvalido || undefined}
          aria-describedby={esInvalido ? idMensaje : undefined}
        />
      </div>

      {esInvalido && (
        <p id={idMensaje} className={estilos.mensajeError}>
          <Icono nombre="alerta" tamano={16} />
          {mensajeError}
        </p>
      )}
    </fieldset>
  );
}
