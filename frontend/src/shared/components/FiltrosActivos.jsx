import Icono from './Icono.jsx';
import estilos from './FiltrosActivos.module.css';

/**
 * Fila con los filtros aplicados (cada uno se quita por separado) y el botón "Limpiar filtros".
 * Es presentacional: quien lo usa decide qué filtros hay y cómo se quitan. No pinta nada si no hay filtros.
 *
 * @param {Object} props
 * @param {Array<{ id: string, etiqueta: string, alQuitar: () => void }>} props.filtros Filtros que se muestran como chip.
 * @param {boolean} props.hayFiltros `true` si hay algún criterio activo (incluidos los que no tienen chip,
 *   como el texto de búsqueda): muestra "Limpiar filtros".
 * @param {() => void} props.alLimpiar
 */
export default function FiltrosActivos({ filtros, hayFiltros, alLimpiar }) {
  if (!hayFiltros) {
    return null;
  }

  return (
    <div className={estilos.fila}>
      {filtros.length > 0 && (
        <ul className={estilos.lista} aria-label="Filtros aplicados">
          {filtros.map((filtro) => (
            <li key={filtro.id} className={estilos.chip}>
              <span>{filtro.etiqueta}</span>
              <button
                type="button"
                className={estilos.quitar}
                aria-label={`Quitar filtro ${filtro.etiqueta}`}
                onClick={filtro.alQuitar}
              >
                <Icono nombre="cerrar" tamano={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={estilos.limpiar} onClick={alLimpiar}>
        <Icono nombre="cerrar" tamano={14} />
        Limpiar filtros
      </button>
    </div>
  );
}
