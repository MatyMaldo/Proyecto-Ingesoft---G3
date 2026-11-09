import estilos from './SelectFiltro.module.css';

/**
 * Selector desplegable de filtro, con su etiqueta visible a la izquierda y asociada al campo.
 * Pensado para filtros de "todos o uno" que no necesitan estar siempre a la vista como chips.
 *
 * @param {Object} props
 * @param {string} props.id Identificador del `<select>` (une la etiqueta con el campo).
 * @param {string} props.etiqueta Texto de la etiqueta.
 * @param {string} props.valor Valor seleccionado.
 * @param {Array<{ valor: string, etiqueta: string }>} props.opciones
 * @param {(valor: string) => void} props.alCambiar Recibe el valor elegido.
 * @param {boolean} [props.apilado] Pone la etiqueta encima del selector en lugar de a su izquierda.
 * @param {boolean} [props.deshabilitado] Deshabilita el selector (p. ej. mientras otro filtro no está elegido).
 */
export default function SelectFiltro({ id, etiqueta, valor, opciones, alCambiar, apilado = false, deshabilitado = false }) {
  return (
    <div className={apilado ? `${estilos.campo} ${estilos.apilado}` : estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
      </label>
      <select
        id={id}
        className={estilos.selector}
        value={valor}
        disabled={deshabilitado}
        onChange={(evento) => alCambiar(evento.target.value)}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </div>
  );
}
