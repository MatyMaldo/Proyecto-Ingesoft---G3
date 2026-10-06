import estilos from './FiltroChips.module.css';

const TONOS_VALIDOS = new Set([
  'verde', 'azul', 'violeta', 'ambar', 'turquesa', 'indigo', 'gris', 'rosa', 'rojo', 'cian'
]);

/**
 * Grupo de chips de filtro de selección única.
 *
 * @param {Object} props
 * @param {string} props.etiquetaGrupo `aria-label` del contenedor `role="group"`.
 * @param {Array<{ valor: string, etiqueta: string, tono?: string }>} props.opciones
 * @param {string} props.valorSeleccionado Valor activo.
 * @param {(valor: string) => void} props.alSeleccionar Se llama al pulsar un chip no activo.
 */
export default function FiltroChips({ etiquetaGrupo, opciones, valorSeleccionado, alSeleccionar }) {
  const manejarClic = (valor) => {
    if (valor === valorSeleccionado) {
      return;
    }
    alSeleccionar?.(valor);
  };

  return (
    <div className={estilos.grupo} role="group" aria-label={etiquetaGrupo}>
      {opciones.map((opcion) => {
        const tono = TONOS_VALIDOS.has(opcion.tono) ? opcion.tono : 'gris';
        const activo = opcion.valor === valorSeleccionado;

        return (
          <button
            key={opcion.valor}
            type="button"
            className={estilos.chip}
            aria-pressed={activo}
            onClick={() => manejarClic(opcion.valor)}
            style={{
              '--tono-fondo': `var(--tono-${tono}-fondo)`,
              '--tono-borde': `var(--tono-${tono}-borde)`,
              '--tono-texto': `var(--tono-${tono}-texto)`
            }}
          >
            {opcion.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
