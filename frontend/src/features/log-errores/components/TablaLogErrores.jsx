import Icono from '../../../shared/components/Icono.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import estilos from './TablaLogErrores.module.css';

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
              <th scope="col">Endpoint</th>
              <th scope="col">Tipo de error</th>
              <th scope="col">Mensaje</th>
              <th scope="col">Detalle</th>
              <th scope="col">Usuario</th>
              <th scope="col">Estado HTTP</th>
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
                <td className={estilos.operacion}>
                  <span>{error.metodoHttp}</span>
                  <code>{error.endpoint}</code>
                </td>
                <td>
                  <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
                </td>
                <td>
                  <p className={estilos.mensaje}>{error.mensaje}</p>
                </td>
                <td>
                  {error.detalle && (
                    <details className={estilos.detalle}>
                      <summary>Ver detalle</summary>
                      <pre>{error.detalle}</pre>
                    </details>
                  )}
                </td>
                <td>
                  <p className={estilos.usuario}>
                    {error.usuarioId != null && <Icono nombre="usuario" tamano={14} />}
                    {error.usuario}
                  </p>
                </td>
                <td>{error.codigoEstado}</td>
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
            </div>

            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Endpoint:</span>{' '}
              {error.metodoHttp} <code>{error.endpoint}</code>
            </p>

            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Tipo de error:</span>{' '}
              <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
            </p>

            <p className={estilos.mensajeTarjeta}>{error.mensaje}</p>

            {error.detalle && (
              <details className={estilos.detalle}>
                <summary>Ver detalle</summary>
                <pre>{error.detalle}</pre>
              </details>
            )}

            <p className={estilos.usuario}>
              {error.usuarioId != null && <Icono nombre="usuario" tamano={14} />}
              {error.usuario}
            </p>
            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Estado HTTP:</span> {error.codigoEstado}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
