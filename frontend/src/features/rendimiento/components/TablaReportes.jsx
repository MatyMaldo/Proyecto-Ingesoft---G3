import Boton from '../../../shared/components/Boton.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosBoton from '../../../shared/components/Boton.module.css';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import { formatearFecha } from '../../horarios/utils/tiempo.js';
import estilos from './TablaReportes.module.css';

const textoOGuion = (valor) => (valor ? valor : '—');

function InsigniaFaltas({ cantidad }) {
  if (cantidad == null) return <span className={estilos.sinDato}>—</span>;
  return <Insignia tono="rojo">{cantidad}</Insignia>;
}

function BotonRevisar({ reporte, alVerDetalle }) {
  return (
    <Boton
      icono="ojo"
      span="Revisar reporte"
      estilo={`${estilosBoton.btn_secundario} ${estilos.botonDetalle}`}
      onClick={() => alVerDetalle?.(reporte)}
    />
  );
}

/**
 * Listado de reportes de inasistencia: tabla en escritorio y tarjetas por debajo de 768 px.
 * Solo pinta; las llamadas a la API viven en el hook de la página.
 *
 * @param {Object} props
 * @param {Array} props.reportes
 * @param {(reporte: Object) => void} [props.alVerDetalle] Abre el detalle del reporte.
 * @param {string} [props.nombreAlumno] Nombre del estudiante en sesión, para las filas que no lo traen.
 */
export default function TablaReportes({ reportes, alVerDetalle, nombreAlumno = '' }) {
  return (
    <div className={estilos.contenedor}>
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>Reportes de inasistencia</caption>
          <thead>
            <tr>
              <th scope="col">Fecha emisión</th>
              <th scope="col">Profesor</th>
              <th scope="col">Alumno</th>
              <th scope="col">Grado</th>
              <th scope="col" className={estilos.centrado}>Sección</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte) => (
              <tr key={reporte.id} className={estilos.fila}>
                <td>{textoOGuion(formatearFecha(reporte.fechaEmision))}</td>
                <td className={estilos.profesor}>{textoOGuion(reporte.docente)}</td>
                <td>{textoOGuion(reporte.estudiante || "Cargando..")}</td>
                <td className={estilos.grado}>{textoOGuion(reporte.grado)}</td>
                <td className={estilos.centrado}>
                  {reporte.seccion ? <Insignia tono="marino">{reporte.seccion}</Insignia> : '—'}
                </td>
                <td>
                  <BotonRevisar reporte={reporte} alVerDetalle={alVerDetalle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={estilos.listaTarjetas} aria-label="Reportes de inasistencia">
        {reportes.map((reporte) => (
          <li key={reporte.id} className={estilos.tarjeta}>
            <div className={estilos.filaSuperior}>
              <span className={estilos.profesor}>{textoOGuion(reporte.docente)}</span>
              <InsigniaFaltas cantidad={reporte.cantidadFaltas} />
            </div>
            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Fecha de emisión:</span>{' '}
              {textoOGuion(formatearFecha(reporte.fechaEmision))}
            </p>
            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Alumno:</span> {textoOGuion(reporte.estudiante || nombreAlumno)}
            </p>
            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Grado y sección:</span>{' '}
              {textoOGuion(reporte.grado)}{reporte.seccion ? ` · ${reporte.seccion}` : ''}
            </p>
            <BotonRevisar reporte={reporte} alVerDetalle={alVerDetalle} />
          </li>
        ))}
      </ul>
    </div>
  );
}
