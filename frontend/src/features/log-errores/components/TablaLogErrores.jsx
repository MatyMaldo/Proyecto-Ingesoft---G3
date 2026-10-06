import Icono from '../../../shared/components/Icono.jsx';
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
 * @param {Array<{
 *   id: number, fechaHora: string, fecha: string, hora: string,
 *   moduloEtiqueta: string, moduloTono: string, operacion: string,
 *   tipoError: string, tipoErrorTono: string, mensaje: string, usuario: string|null
 * }>} props.errores
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
              <th scope="col">Módulo</th>
              <th scope="col">Operación</th>
              <th scope="col">Tipo de error</th>
              <th scope="col">Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {errores.map((error) => (
              <tr key={error.id} className={estilos.fila}>
                <td className={estilos.celdaFecha}>
                  <time dateTime={error.fechaHora} className={estilos.tiempo}>
                    <span className={estilos.fecha}>{error.fecha}</span>
                    <span className={estilos.hora}>{error.hora}</span>
                  </time>
                </td>
                <td>
                  <Insignia tono={error.moduloTono}>{error.moduloEtiqueta}</Insignia>
                </td>
                <td className={estilos.operacion}>{error.operacion}</td>
                <td>
                  <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
                </td>
                <td>
                  <p className={estilos.mensaje}>{error.mensaje}</p>
                  {error.usuario && (
                    <p className={estilos.usuario}>
                      <Icono nombre="usuario" tamano={14} />
                      {error.usuario}
                    </p>
                  )}
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
                {error.fecha} · {error.hora}
              </time>
              <Insignia tono={error.moduloTono}>{error.moduloEtiqueta}</Insignia>
            </div>

            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Operación:</span> {error.operacion}
            </p>

            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Tipo de error:</span>{' '}
              <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
            </p>

            <p className={estilos.mensajeTarjeta}>{error.mensaje}</p>

            {error.usuario && (
              <p className={estilos.usuario}>
                <Icono nombre="usuario" tamano={14} />
                {error.usuario}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
