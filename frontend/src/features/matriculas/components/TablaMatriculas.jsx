import Avatar, { obtenerInicialesDeNombre } from '../../../shared/components/Avatar.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import estilos from './TablaMatriculas.module.css';

const TONO_ESTADO = {
  PENDIENTE: 'ambar',
  CONFIRMADA: 'verde',
  CANCELADA: 'rojo'
};

const ETIQUETA_ESTADO = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada'
};

function CeldaEstudiante({ matricula }) {
  const nombre = matricula.nombreCompletoEstudiante ?? 'Estudiante';
  return (
    <div className={estilos.celdaEstudiante}>
      <Avatar iniciales={obtenerInicialesDeNombre(nombre)} />
      <div>
        <span className={estilos.nombre}>{nombre}</span>
        {matricula.codigoEstudiante && (
          <span className={estilos.codigo}>{matricula.codigoEstudiante}</span>
        )}
      </div>
    </div>
  );
}

/** Año académico de la matrícula. */
function CeldaAnio({ matricula }) {
  return (
    <span className={estilos.anio}>{matricula.anioAcademico ?? '—'}</span>
  );
}

function InsigniaEstado({ estado }) {
  return (
    <Insignia tono={TONO_ESTADO[estado] ?? 'gris'}>
      {ETIQUETA_ESTADO[estado] ?? estado}
    </Insignia>
  );
}

/** Solo las matrículas pendientes se pueden emitir; el nombre accesible dice a qué estudiante afecta. */
function AccionEmitir({ matricula, estado, emitiendo, alEmitir }) {
  if (estado !== 'PENDIENTE') {
    return <span className={estilos.sinAccion}>—</span>;
  }

  const nombre = matricula.nombreCompletoEstudiante ?? 'Estudiante';
  return (
    <button
      type="button"
      className={estilos.botonEmitir}
      disabled={emitiendo}
      aria-label={`Emitir compromiso de ${nombre}`}
      onClick={() => alEmitir(matricula)}
    >
      <Icono nombre="archivo" tamano={16} />
      {emitiendo ? 'Emitiendo…' : 'Emitir compromiso'}
    </button>
  );
}

/**
 * Listado de matrículas: tabla en escritorio y tarjetas por debajo de 768 px (GUI §11). Las columnas siguen el orden
 * de los filtros (año, grado, sección, estado), con la fecha de asignación como subtexto del año, y cada fila permite emitir su compromiso. Solo pinta; los filtros,
 * la paginación y las llamadas a la API viven en la página.
 *
 * @param {Object} props
 * @param {Array} props.matriculas Matrículas de la página actual.
 * @param {(matricula: Object) => void} props.alEmitir Emite el compromiso de una matrícula pendiente.
 * @param {string|number|null} props.emitiendoId Id de la matrícula cuyo compromiso se está emitiendo.
 */
export default function TablaMatriculas({ matriculas, alEmitir, emitiendoId }) {
  return (
    <div className={estilos.contenedor}>
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>Listado de matrículas registradas</caption>
          <thead>
            <tr>
              <th scope="col" className={estilos.columnaEstudiante}>Estudiante</th>
              <th scope="col" className={estilos.columnaAnio}>Año</th>
              <th scope="col" className={estilos.columnaFecha}>Fecha de asignación</th>
              <th scope="col" className={estilos.columnaGrado}>Grado</th>
              <th scope="col" className={estilos.columnaSeccion}>Sección</th>
              <th scope="col" className={estilos.columnaEstado}>Estado</th>
              <th scope="col" className={estilos.columnaAccion}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {matriculas.map((matricula) => {
              const estado = String(matricula.estado ?? '').toUpperCase();
              return (
                <tr key={matricula.id} className={estilos.fila}>
                  <td><CeldaEstudiante matricula={matricula} /></td>
                  <td><CeldaAnio matricula={matricula} /></td>
                  <td className={estilos.celdaFecha}>
                    {formatearFechaVisible(matricula.fechaAsignacion)}
                  </td>
                  <td>{matricula.gradoNombre ?? '—'}</td>
                  <td>{matricula.seccionNombre ?? '—'}</td>
                  <td><InsigniaEstado estado={estado} /></td>
                  <td className={estilos.columnaAccion}>
                    <AccionEmitir
                      matricula={matricula}
                      estado={estado}
                      emitiendo={String(emitiendoId) === String(matricula.id)}
                      alEmitir={alEmitir}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className={estilos.listaTarjetas} aria-label="Matrículas registradas">
        {matriculas.map((matricula) => {
          const estado = String(matricula.estado ?? '').toUpperCase();
          return (
            <li key={matricula.id} className={estilos.tarjeta}>
              <div className={estilos.filaSuperior}>
                <CeldaEstudiante matricula={matricula} />
                <InsigniaEstado estado={estado} />
              </div>

              <p className={estilos.campo}>
                <span className={estilos.rotuloCampo}>Año, grado y sección:</span>{' '}
                {[matricula.anioAcademico, matricula.gradoNombre, matricula.seccionNombre && `Sección ${matricula.seccionNombre}`]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </p>
              <p className={estilos.campo}>
                <span className={estilos.rotuloCampo}>Fecha:</span> {formatearFechaVisible(matricula.fechaAsignacion)}
              </p>

              {estado === 'PENDIENTE' && (
                <AccionEmitir
                  matricula={matricula}
                  estado={estado}
                  emitiendo={String(emitiendoId) === String(matricula.id)}
                  alEmitir={alEmitir}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
