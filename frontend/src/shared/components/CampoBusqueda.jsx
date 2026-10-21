import Icono from './Icono.jsx';
import estilos from './CampoBusqueda.module.css';
import estilosUtil from '../styles/utilidades.module.css';

/**
 * Campo de búsqueda con ícono de lupa, reutilizado por la barra superior y por
 * los filtros de las páginas que lo necesiten.
 *
 * @param {Object} props
 * @param {string} props.id `id` del input (enlaza el `label`).
 * @param {string} props.etiqueta Texto del `<label>`.
 * @param {boolean} [props.etiquetaVisible] `false`: label oculto visualmente.
 * @param {string} [props.placeholder]
 * @param {string} [props.valor] Controlado.
 * @param {(valor: string) => void} [props.alCambiar] Recibe el texto, no el evento.
 * @param {'borde'|'relleno'} [props.variante]
 * @param {boolean} [props.noDisponible] `readOnly`, `aria-disabled`, ignora `alCambiar`.
 * @param {number} [props.maxLength]
 */
export default function CampoBusqueda({
  id,
  etiqueta,
  etiquetaVisible = false,
  placeholder = '',
  valor = '',
  alCambiar,
  variante = 'borde',
  noDisponible = false,
  maxLength
}) {
  const manejarCambio = (evento) => {
    if (noDisponible) {
      return;
    }
    alCambiar?.(evento.target.value);
  };

  return (
    <div>
      <label
        htmlFor={id}
        className={etiquetaVisible ? estilos.etiqueta : estilosUtil.ocultoVisualmente}
      >
        {etiqueta}
      </label>
      <div className={estilos.contenedor}>
        <Icono nombre="buscar" tamano={18} className={estilos.icono} />
        <input
          id={id}
          type="search"
          className={`${estilos.campo} ${variante === 'relleno' ? estilos.relleno : ''}`}
          placeholder={placeholder}
          value={valor}
          onChange={manejarCambio}
          maxLength={maxLength}
          readOnly={noDisponible}
          aria-disabled={noDisponible || undefined}
          aria-describedby={noDisponible ? `${id}-no-disponible` : undefined}
          title={noDisponible ? 'Función no disponible por ahora' : undefined}
        />
      </div>
      {noDisponible && (
        <span id={`${id}-no-disponible`} className={estilosUtil.ocultoVisualmente}>
          Función no disponible por ahora.
        </span>
      )}
    </div>
  );
}
