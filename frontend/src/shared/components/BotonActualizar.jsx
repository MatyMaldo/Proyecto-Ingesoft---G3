import Icono from './Icono.jsx';
import estilos from './BotonActualizar.module.css';

/**
 * Botón de solo ícono "Actualizar": vuelve a pedir los datos del listado con los filtros vigentes, sin tocar la
 * página ni los filtros. Sirve para ver los cambios que otros usuarios o procesos hicieron con la pantalla abierta.
 *
 * Sin texto visible: el nombre accesible y el tooltip son "Actualizar" (no cambia mientras carga, para que un lector de
 * pantalla no lo anuncie como otro botón). Mientras `actualizando` es `true` queda desactivado y el ícono gira
 * (sin movimiento si el usuario pidió reducirlo).
 *
 * @param {Object} props
 * @param {() => void} props.alActualizar
 * @param {boolean} [props.actualizando] `true` mientras se recargan los datos.
 * @param {boolean} [props.deshabilitado]
 */
export default function BotonActualizar({ alActualizar, actualizando = false, deshabilitado = false }) {
  return (
    <button
      type="button"
      className={estilos.boton}
      onClick={alActualizar}
      disabled={actualizando || deshabilitado}
      aria-label="Actualizar"
      aria-busy={actualizando || undefined}
      title={actualizando ? 'Actualizando…' : 'Actualizar'}
    >
      <span className={actualizando ? estilos.girando : estilos.icono}>
        <Icono nombre="reintentar" tamano={18} />
      </span>
    </button>
  );
}
