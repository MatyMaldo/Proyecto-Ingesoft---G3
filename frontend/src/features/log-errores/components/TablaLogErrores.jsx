import { useRef, useState } from 'react';

import Avatar, { obtenerInicialesDeNombre } from '../../../shared/components/Avatar.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import DetalleError from './DetalleError.jsx';
import estilos from './TablaLogErrores.module.css';

function construirEtiquetaDetalle(error) {
  return `Ver detalle: ${error.tipoError}, ${formatearFechaVisible(error.fecha)} ${error.hora}`;
}

/**
 * Pinta las filas del log de errores ya adaptadas (`FilaError`). No ordena, no
 * filtra y no decide estados de carga, vacío o error: solo se monta cuando hay
 * al menos una fila.
 *
 * Renderiza las dos variantes (tabla y tarjetas) y una media query en el CSS
 * module oculta una según el ancho de pantalla (ver `docs/planes/shell.md` §19.3).
 *
 * @param {Object} props
 * @param {Array} props.errores Logs adaptados desde `LogErrorResponse`.
 * @param {boolean} [props.ocupado] `true` mientras se recalcula por un cambio de filtro.
 */
export default function TablaLogErrores({ errores, ocupado = false }) {
  // Estas columnas solo existen si el origen de datos las entrega (hoy, los mocks).
  const hayModulo = errores.some((error) => error.moduloEtiqueta);
  const hayOperacion = errores.some((error) => error.operacion);

  const [seleccionado, establecerSeleccionado] = useState(null);
  const origenRef = useRef(null);

  const abrirDetalle = (error, evento) => {
    origenRef.current = evento.currentTarget;
    establecerSeleccionado(error);
  };

  const cerrarDetalle = () => {
    establecerSeleccionado(null);
    const origen = origenRef.current;
    if (origen && document.contains(origen)) {
      origen.focus();
    }
  };

  return (
    <div className={estilos.contenedor} aria-busy={ocupado || undefined}>
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>
            Errores registrados, del más reciente al más antiguo.
          </caption>
          <thead>
            <tr>
              <th scope="col">Fecha y hora</th>
              {hayModulo && <th scope="col">Módulo</th>}
              {hayOperacion && <th scope="col">Operación</th>}
              <th scope="col">Tipo de error</th>
              <th scope="col">Usuario</th>
              <th scope="col" className={estilos.columnaDetalle}>
                Detalle
              </th>
            </tr>
          </thead>
          <tbody>
            {errores.map((error) => (
              <tr key={error.id} className={estilos.fila}>
                <td className={estilos.celdaFecha}>
                  <time dateTime={error.fechaHora} className={estilos.tiempo}>
                    <span className={estilos.fecha}>{formatearFechaVisible(error.fecha)}</span>
                    <span className={estilos.hora}>{error.hora}</span>
                  </time>
                </td>
                {hayModulo && (
                  <td>
                    {error.moduloEtiqueta && <Insignia tono={error.moduloTono}>{error.moduloEtiqueta}</Insignia>}
                  </td>
                )}
                {hayOperacion && <td className={estilos.operacion}>{error.operacion}</td>}
                <td>
                  <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
                </td>
                <td>
                  <p className={estilos.usuario}>
                    <Avatar iniciales={obtenerInicialesDeNombre(error.usuario)} />
                    {error.usuario}
                  </p>
                </td>
                <td className={estilos.celdaDetalle}>
                  <button
                    type="button"
                    className={estilos.botonDetalle}
                    onClick={(evento) => abrirDetalle(error, evento)}
                    aria-label={construirEtiquetaDetalle(error)}
                    title="Ver detalle"
                  >
                    <Icono nombre="ojo" tamano={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={estilos.listaTarjetas} aria-label="Errores registrados">
        {errores.map((error) => (
          <li key={error.id} className={estilos.tarjeta}>
            <div className={estilos.filaSuperior}>
              <time dateTime={error.fechaHora} className={estilos.fechaHoraTarjeta}>
                {formatearFechaVisible(error.fecha)} · {error.hora}
              </time>
              {error.moduloEtiqueta && <Insignia tono={error.moduloTono}>{error.moduloEtiqueta}</Insignia>}
            </div>

            {error.operacion && (
              <p className={estilos.campo}>
                <span className={estilos.rotuloCampo}>Operación:</span> {error.operacion}
              </p>
            )}

            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Tipo de error:</span>{' '}
              <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
            </p>

            <p className={estilos.usuario}>
              <Avatar iniciales={obtenerInicialesDeNombre(error.usuario)} />
              {error.usuario}
            </p>
            <button
              type="button"
              className={estilos.botonDetalleTarjeta}
              onClick={(evento) => abrirDetalle(error, evento)}
              aria-label={construirEtiquetaDetalle(error)}
            >
              <Icono nombre="ojo" tamano={18} />
              Ver detalle
            </button>
          </li>
        ))}
      </ul>

      <DetalleError error={seleccionado} alCerrar={cerrarDetalle} />
    </div>
  );
}
