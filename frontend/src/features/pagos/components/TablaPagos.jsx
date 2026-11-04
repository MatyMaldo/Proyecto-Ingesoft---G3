import Icono from '../../../shared/components/Icono.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import estilos from './TablaPagos.module.css';
import estilosBoton from '../../../shared/components/Boton.module.css'
import Boton from '../../../shared/components/Boton.jsx';

/**
 * @param {Object} props
 * @param {Array} props.alumnos Logs adaptados desde `LogErrorResponse`.
 * @param {boolean} [props.ocupado] `true` mientras se recalcula por un cambio de filtro.
 */
export default function TablaPagos({ alumnos, ocupado = false }) {
  return (
    <div className={estilos.contenedor} aria-busy={ocupado || undefined}>
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>
            Alumnos registrados
          </caption>
          <thead>
            <tr>
              <th scope="col">Alumno</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.id} className={estilos.fila}>
                <td>
                  <p className={estilos.mensaje}>{alumno.nombre}</p>
                  <p className={estilos.dni}>{alumno.dni}</p>
                </td>
                <td>
                  {<Boton icono="archivo" span="Emitir compromiso de pago" estilo={estilosBoton.btn_secundario} onClick={()=>{}}  ></Boton>}
                </td>
                <td>
                  {<Boton icono="verificar" span="Ver pagos realizados" estilo={estilosBoton.btn_activo} onClick={()=>{}}  ></Boton>}
                </td>
                <td>
                  {<Boton icono="reloj" span="Ver pagos pendientes" estilo={estilosBoton.btn_pendiente} onClick={()=>{}}  ></Boton>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
