import CampoBusqueda from './CampoBusqueda.jsx';
import estilos from './CampoBusquedaDesplegable.module.css';

/**
 * Campo de búsqueda que previsualiza los resultados en una lista desplegable bajo el input.
 * Reutiliza `CampoBusqueda` para el input; este componente solo añade la lista.
 * No guarda estado: el texto, los resultados y cuándo mostrarlos los controla quien lo usa.
 *
 * @param {Object} props
 * @param {string} props.id `id` del input (enlaza el `label`).
 * @param {string} props.etiqueta Texto del `<label>`.
 * @param {boolean} [props.etiquetaVisible] `false`: label oculto visualmente.
 * @param {string} [props.placeholder]
 * @param {string} [props.valor] Texto del input (controlado).
 * @param {(valor: string) => void} [props.alCambiar] Recibe el texto, no el evento.
 * @param {'borde'|'relleno'} [props.variante]
 * @param {number} [props.maxLength]
 * @param {Array<{ id: number|string }>} [props.resultados] Elementos a previsualizar; cada uno necesita `id`.
 * @param {boolean} [props.abierto] Muestra la lista desplegable.
 * @param {boolean} [props.buscando] Muestra "Buscando..." en lugar de los resultados.
 * @param {string} [props.error] Mensaje de error; reemplaza a los resultados.
 * @param {string} [props.mensajeSinResultados] Texto cuando la búsqueda no devuelve nada.
 * @param {(resultado: Object) => string} props.obtenerTitulo Texto principal de cada resultado.
 * @param {(resultado: Object) => string} [props.obtenerDetalle] Texto secundario de cada resultado.
 * @param {(resultado: Object) => void} props.alSeleccionar Recibe el resultado elegido, tal como llegó en `resultados`.
 */
export default function CampoBusquedaDesplegable({
  id,
  etiqueta,
  etiquetaVisible = false,
  placeholder = '',
  valor = '',
  alCambiar,
  variante = 'borde',
  maxLength,
  resultados = [],
  abierto = false,
  buscando = false,
  error = '',
  mensajeSinResultados = 'No se encontraron resultados.',
  obtenerTitulo,
  obtenerDetalle,
  alSeleccionar
}) {
  const renderizarContenido = () => {
    if (buscando) {
      return <p className={estilos.mensaje} role="status">Buscando...</p>;
    }

    if (error) {
      return <p className={estilos.mensaje} role="alert">{error}</p>;
    }

    if (resultados.length === 0) {
      return <p className={estilos.mensaje} role="status">{mensajeSinResultados}</p>;
    }

    return (
      <ul className={estilos.lista}>
        {resultados.map((resultado) => (
          <li key={resultado.id}>
            <button type="button" className={estilos.item} onClick={() => alSeleccionar(resultado)}>
              <span className={estilos.titulo}>{obtenerTitulo(resultado)}</span>
              {obtenerDetalle && <span className={estilos.detalle}>{obtenerDetalle(resultado)}</span>}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={estilos.contenedor}>
      <CampoBusqueda
        id={id}
        etiqueta={etiqueta}
        etiquetaVisible={etiquetaVisible}
        placeholder={placeholder}
        valor={valor}
        alCambiar={alCambiar}
        variante={variante}
        maxLength={maxLength}
      />
      {abierto && <div className={estilos.desplegable}>{renderizarContenido()}</div>}
    </div>
  );
}
