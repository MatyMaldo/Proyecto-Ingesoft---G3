import { useRef, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { formatearFechaCompacta, formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import DetalleError from './DetalleError.jsx';
import estilos from './TablaLogErrores.module.css';

const SIN_MENSAJE = 'Sin mensaje';

function construirEtiquetaDetalle(error) {
  return `Ver detalle: ${error.tipoError}, ${formatearFechaVisible(error.fecha)} ${error.hora}`;
}

/**
 * Pinta las filas del log de errores ya adaptadas (`FilaError`). No ordena, no
 * filtra y no decide estados de carga, vacío o error: solo se monta cuando hay
 * al menos una fila.
 *
 * Columnas: fecha y hora, módulo, tipo de error, mensaje y usuario. La operación
 * (método y ruta) y el estado HTTP se consultan en el panel de detalle, que se
 * abre con un clic en cualquier parte de la fila o con el botón del ojo.
 *
 * Renderiza las dos variantes (tabla y tarjetas) y una media query en el CSS
 * module oculta una según el ancho de pantalla (ver `docs/planes/shell.md` §19.3).
 *
 * @param {Object} props
 * @param {Array} props.errores Logs adaptados desde `LogErrorResponse`.
 * @param {boolean} [props.ocupado] `true` mientras se recalcula por un cambio de filtro.
 */
export default function TablaLogErrores({ errores, ocupado = false }) {
  const [seleccionado, establecerSeleccionado] = useState(null);
  const origenRef = useRef(null);

  const abrirDetalle = (error, origen) => {
    origenRef.current = origen;
    establecerSeleccionado(error);
  };

  // El clic en la fila equivale al botón del ojo; el foco vuelve a ese botón al cerrar.
  const abrirDesdeFila = (error, evento) => {
    if (window.getSelection?.()?.toString()) {
      return;
    }
    abrirDetalle(error, evento.currentTarget.querySelector('button'));
  };

  const abrirDesdeBoton = (error, evento) => {
    evento.stopPropagation();
    abrirDetalle(error, evento.currentTarget);
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
              <th scope="col">Módulo</th>
              <th scope="col">Tipo de error</th>
              <th scope="col" className={estilos.columnaMensaje}>
                Mensaje
              </th>
              <th scope="col">Usuario</th>
              <th scope="col" className={estilos.columnaDetalle}>
                Detalle
              </th>
            </tr>
          </thead>
          <tbody>
            {errores.map((error) => (
              <tr key={error.id} className={estilos.fila} onClick={(evento) => abrirDesdeFila(error, evento)}>
                <td className={estilos.celdaFecha}>
                  <time
                    dateTime={error.fechaHora}
                    className={estilos.tiempo}
                    title={`${formatearFechaVisible(error.fecha)} ${error.hora}`}
                  >
                    <span className={estilos.fecha}>{formatearFechaCompacta(error.fecha)}</span>
                    <span className={estilos.hora}>{error.hora}</span>
                  </time>
                </td>
                <td>
                  {error.moduloEtiqueta ? (
                    <Insignia tono={error.moduloTono}>{error.moduloEtiqueta}</Insignia>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
                </td>
                <td className={estilos.celdaMensaje}>
                  <span className={estilos.mensaje} title={error.mensaje || undefined}>
                    {error.mensaje || SIN_MENSAJE}
                  </span>
                </td>
                <td className={estilos.celdaUsuario}>{error.usuario}</td>
                <td className={estilos.celdaDetalle}>
                  <button
                    type="button"
                    className={estilos.botonDetalle}
                    onClick={(evento) => abrirDesdeBoton(error, evento)}
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
                {formatearFechaCompacta(error.fecha)} · {error.hora}
              </time>
              {error.moduloEtiqueta && <Insignia tono={error.moduloTono}>{error.moduloEtiqueta}</Insignia>}
            </div>

            <p className={estilos.mensajeTarjeta}>{error.mensaje || SIN_MENSAJE}</p>

            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Tipo de error:</span>{' '}
              <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
            </p>

            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Usuario:</span> {error.usuario}
            </p>

            <button
              type="button"
              className={estilos.botonDetalleTarjeta}
              onClick={(evento) => abrirDetalle(error, evento.currentTarget)}
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
