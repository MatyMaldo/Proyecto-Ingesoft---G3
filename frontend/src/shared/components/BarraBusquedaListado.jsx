import BotonActualizar from './BotonActualizar.jsx';
import Icono from './Icono.jsx';
import estilos from './BarraBusquedaListado.module.css';

/**
 * Primera línea de los listados del panel de administración: el buscador con el botón de solo ícono "Actualizar"
 * pegado a su costado y, solo con algún criterio activo, "Limpiar filtros". Es presentacional: la página decide qué
 * buscar y qué recargar.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children El campo de búsqueda (un `CampoBusqueda`).
 * @param {() => void} props.alActualizar
 * @param {boolean} [props.actualizando] `true` mientras se recargan los datos.
 * @param {boolean} [props.hayFiltros] `true` si hay algún criterio activo: muestra "Limpiar filtros".
 * @param {() => void} [props.alLimpiar]
 */
export default function BarraBusquedaListado({
  children,
  alActualizar,
  actualizando = false,
  hayFiltros = false,
  alLimpiar
}) {
  return (
    <div className={estilos.barra}>
      <div className={estilos.grupoBusqueda}>
        <div className={estilos.campoBusqueda}>{children}</div>
        <BotonActualizar alActualizar={alActualizar} actualizando={actualizando} />
      </div>

      {hayFiltros && alLimpiar && (
        <button type="button" className={estilos.limpiarFiltros} onClick={alLimpiar}>
          <Icono nombre="cerrar" tamano={14} />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
