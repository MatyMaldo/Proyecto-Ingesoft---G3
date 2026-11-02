import Icono from '../../../shared/components/Icono.jsx';
import estilos from './CampoSelect.module.css';

/**
 * Selector nativo con etiqueta y mensaje de error.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.etiqueta
 * @param {string} props.valor
 * @param {Array<{ valor: string, etiqueta: string }>} props.opciones
 * @param {string} props.placeholder Texto de la opción vacía.
 * @param {boolean} [props.requerido] Muestra el asterisco en la etiqueta.
 * @param {boolean} [props.deshabilitado]
 * @param {string} [props.error]
 * @param {boolean} [props.enfoqueInicial]
 * @param {(valor: string) => void} props.alCambiar
 */
export default function CampoSelect({
  id,
  etiqueta,
  valor,
  opciones,
  placeholder,
  requerido = false,
  deshabilitado = false,
  error,
  enfoqueInicial = false,
  alCambiar
}) {
  const idError = `${id}-error`;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
        {requerido && (
          <span className={estilos.asterisco} aria-hidden="true">
            {' '}*
          </span>
        )}
      </label>
      <select
        id={id}
        className={estilos.select}
        value={valor}
        disabled={deshabilitado}
        aria-required={requerido ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? idError : undefined}
        data-enfoque-inicial={enfoqueInicial ? '' : undefined}
        onChange={(evento) => alCambiar(evento.target.value)}
      >
        <option value="">{placeholder}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error && (
        <p id={idError} className={estilos.mensajeError}>
          <Icono nombre="alerta" tamano={14} />
          {error}
        </p>
      )}
    </div>
  );
}
