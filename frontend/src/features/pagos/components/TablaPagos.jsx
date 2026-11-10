import Avatar, { obtenerInicialesDeNombre } from '../../../shared/components/Avatar.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import estilos from './TablaPagos.module.css';

const esConfirmada = (alumno) => String(alumno.estadoMatricula ?? '').toUpperCase() === 'CONFIRMADA';

const gradoYSeccion = (alumno) => (alumno.gradoNombre
  ? `${alumno.gradoNombre}${alumno.seccionNombre ? ` · ${alumno.seccionNombre}` : ''}`
  : '—');

function CeldaAlumno({ alumno }) {
  return (
    <div className={estilos.celdaAlumno}>
      <Avatar iniciales={obtenerInicialesDeNombre(alumno.nombre)} />
      <div>
        <span className={estilos.nombre}>{alumno.nombre}</span>
        <span className={estilos.codigo}>{alumno.codigo ?? alumno.dni ?? '—'}</span>
      </div>
    </div>
  );
}

function InsigniaMatricula({ alumno }) {
  return (
    <Insignia tono={esConfirmada(alumno) ? 'verde' : 'ambar'}>
      {esConfirmada(alumno) ? 'Confirmada' : 'Pendiente'}
    </Insignia>
  );
}

/**
 * Acciones de un alumno: emitir su compromiso de pensión (solo con matrícula confirmada) y ver sus compromisos y
 * pagos. El nombre accesible de cada botón dice a qué alumno afecta; el motivo por el que la pensión no está
 * disponible va como texto asociado al botón y no solo como `title`.
 */
function AccionesAlumno({ alumno, alEmitirPension, alVerPagos }) {
  const confirmada = esConfirmada(alumno);
  const idMotivo = `motivo-pension-${alumno.id}`;

  return (
    <div className={estilos.acciones}>
      <button
        type="button"
        className={`${estilos.boton} ${estilos.botonSecundario}`}
        disabled={!confirmada}
        aria-label={`Emitir compromiso de pensión de ${alumno.nombre}`}
        aria-describedby={confirmada ? undefined : idMotivo}
        onClick={() => alEmitirPension(alumno)}
      >
        <Icono nombre="archivo" tamano={16} />
        Emitir pensión
      </button>
      {!confirmada && (
        <span id={idMotivo} className={estilosUtil.ocultoVisualmente}>
          La pensión estará disponible cuando la matrícula esté confirmada.
        </span>
      )}
      <button
        type="button"
        className={`${estilos.boton} ${estilos.botonPrimario}`}
        aria-label={`Ver compromisos y pagos de ${alumno.nombre}`}
        onClick={() => alVerPagos(alumno)}
      >
        <Icono nombre="tarjeta" tamano={16} />
        Ver pagos
      </button>
    </div>
  );
}

/**
 * Listado de alumnos con matrícula del año: tabla en escritorio y tarjetas por debajo de 768 px (GUI §11).
 * Solo pinta; los filtros, la paginación, los diálogos y las llamadas a la API viven en la página.
 *
 * @param {Object} props
 * @param {Array} props.alumnos Alumnos de la página actual.
 * @param {(alumno: Object) => void} props.alEmitirPension
 * @param {(alumno: Object) => void} props.alVerPagos
 * @param {boolean} [props.ocupado] `true` mientras se recalcula por un cambio de filtro.
 */
export default function TablaPagos({ alumnos, alEmitirPension, alVerPagos, ocupado = false }) {
  return (
    <div className={estilos.contenedor} aria-busy={ocupado || undefined}>
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>Alumnos matriculados</caption>
          <thead>
            <tr>
              <th scope="col">Alumno</th>
              <th scope="col">Grado</th>
              <th scope="col">Sección</th>
              <th scope="col">Matrícula</th>
              <th scope="col" className={estilos.columnaAcciones}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.id} className={estilos.fila}>
                <td><CeldaAlumno alumno={alumno} /></td>
                <td>{alumno.gradoNombre ?? '—'}</td>
                <td className={estilos.celdaSeccion}>{alumno.seccionNombre ?? '—'}</td>
                <td><InsigniaMatricula alumno={alumno} /></td>
                <td className={estilos.columnaAcciones}>
                  <AccionesAlumno alumno={alumno} alEmitirPension={alEmitirPension} alVerPagos={alVerPagos} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={estilos.listaTarjetas} aria-label="Alumnos matriculados">
        {alumnos.map((alumno) => (
          <li key={alumno.id} className={estilos.tarjeta}>
            <div className={estilos.filaSuperior}>
              <CeldaAlumno alumno={alumno} />
              <InsigniaMatricula alumno={alumno} />
            </div>
            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Grado y sección:</span> {gradoYSeccion(alumno)}
            </p>
            <AccionesAlumno alumno={alumno} alEmitirPension={alEmitirPension} alVerPagos={alVerPagos} />
          </li>
        ))}
      </ul>
    </div>
  );
}
