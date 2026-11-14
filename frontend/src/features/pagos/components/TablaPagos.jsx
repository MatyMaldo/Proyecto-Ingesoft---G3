import Avatar, { obtenerInicialesDeNombre } from '../../../shared/components/Avatar.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import MenuDesplegable from '../../../shared/components/MenuDesplegable.jsx';
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

/** Pagos del alumno que esperan validación. */
function InsigniaPorValidar({ cantidad }) {
  if (!cantidad) {
    return <span className={estilos.sinPendientes}>—</span>;
  }
  return <Insignia tono="ambar">{cantidad === 1 ? '1 por validar' : `${cantidad} por validar`}</Insignia>;
}

/**
 * Acciones de un alumno. En la tabla, "Ver pagos" es la acción principal y emitir su compromiso de pensión (solo con
 * matrícula confirmada) va en un menú ⋯; en las tarjetas móviles ambas son botones. El nombre accesible dice a qué
 * alumno afecta cada acción.
 */
function AccionesAlumno({ alumno, alEmitirPension, alVerPagos, enMenu = false }) {
  const confirmada = esConfirmada(alumno);
  const botonVerPagos = (
    <button
      type="button"
      className={`${estilos.boton} ${estilos.botonPrimario}`}
      aria-label={`Ver compromisos y pagos de ${alumno.nombre}`}
      onClick={() => alVerPagos(alumno)}
    >
      <Icono nombre="tarjeta" tamano={16} />
      Ver pagos
    </button>
  );

  if (enMenu) {
    return (
      <div className={estilos.acciones}>
        {botonVerPagos}
        {confirmada && (
          <MenuDesplegable
            etiquetaBoton={`Más acciones de ${alumno.nombre}`}
            claseBoton={estilos.botonMas}
            alineacion="fin"
            contenidoBoton={<Icono nombre="mas-opciones" tamano={20} />}
            items={[{
              id: 'emitir-pension',
              etiqueta: 'Emitir pensión',
              ariaLabel: `Emitir compromiso de pensión de ${alumno.nombre}`,
              icono: 'archivo',
              alSeleccionar: () => alEmitirPension(alumno)
            }]}
          />
        )}
      </div>
    );
  }

  return (
    <div className={estilos.acciones}>
      {confirmada && (
        <button
          type="button"
          className={`${estilos.boton} ${estilos.botonSecundario}`}
          aria-label={`Emitir compromiso de pensión de ${alumno.nombre}`}
          onClick={() => alEmitirPension(alumno)}
        >
          <Icono nombre="archivo" tamano={16} />
          Emitir pensión
        </button>
      )}
      {botonVerPagos}
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
 * @param {Object<string, number>|null} [props.porValidar] Pagos por validar por id de estudiante; `null` si no se
 *   conoce (la columna no se muestra).
 * @param {boolean} [props.ocupado] `true` mientras se recalcula por un cambio de filtro.
 */
export default function TablaPagos({ alumnos, alEmitirPension, alVerPagos, porValidar = null, ocupado = false }) {
  const pendientesDe = (alumno) => porValidar?.[String(alumno.id)] ?? 0;

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
              {porValidar && <th scope="col">Por validar</th>}
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
                {porValidar && <td><InsigniaPorValidar cantidad={pendientesDe(alumno)} /></td>}
                <td className={estilos.columnaAcciones}>
                  <AccionesAlumno
                    alumno={alumno}
                    alEmitirPension={alEmitirPension}
                    alVerPagos={alVerPagos}
                    enMenu
                  />
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
            {pendientesDe(alumno) > 0 && (
              <p className={estilos.campo}>
                <InsigniaPorValidar cantidad={pendientesDe(alumno)} />
              </p>
            )}
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
