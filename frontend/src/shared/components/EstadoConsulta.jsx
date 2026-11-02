import Icono from './Icono.jsx';
import estilosUtil from '../styles/utilidades.module.css';
import estilos from './EstadoConsulta.module.css';

const MENSAJE_POR_DEFECTO = {
  carga: 'Cargando…',
  error: 'Se registró un error inesperado'
};

/**
 * Estado de carga, vacío o error para pantallas que consultan datos.
 *
 * @param {Object} props
 * @param {'carga'|'vacio'|'error'} props.tipo
 * @param {string} [props.mensaje] Obligatorio para `vacio`; en `carga`/`error` tiene mensaje por defecto.
 * @param {number} [props.filasEsqueleto] Solo en `carga`: muestra esa cantidad de filas de carga (mantiene la altura); el texto sigue disponible para lectores de pantalla.
 * @param {() => void} [props.alReintentar] Solo en `error`: si se pasa, muestra el botón "Reintentar".
 */
export default function EstadoConsulta({ tipo, mensaje, filasEsqueleto = 0, alReintentar }) {
  const texto = mensaje ?? MENSAJE_POR_DEFECTO[tipo];
  const propsRegion = tipo === 'error' ? { role: 'alert' } : { role: 'status' };

  if (tipo === 'carga' && filasEsqueleto > 0) {
    return (
      <div className={estilos.esqueleto} {...propsRegion}>
        <span className={estilosUtil.ocultoVisualmente}>{texto}</span>
        {Array.from({ length: filasEsqueleto }, (_, indice) => (
          <span key={indice} className={estilos.filaEsqueleto} aria-hidden="true" />
        ))}
      </div>
    );
  }

  return (
    <div className={estilos.contenedor} {...propsRegion}>
      {tipo === 'error' && <Icono nombre="alerta" tamano={32} />}
      <p className={estilos.mensaje}>{texto}</p>
      {tipo === 'error' && alReintentar && (
        <button type="button" className={estilos.boton} onClick={alReintentar}>
          <Icono nombre="reintentar" tamano={16} />
          Reintentar
        </button>
      )}
    </div>
  );
}
