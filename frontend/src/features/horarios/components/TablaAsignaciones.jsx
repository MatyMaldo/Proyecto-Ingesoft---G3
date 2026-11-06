import { useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import estilos from './TablaAsignaciones.module.css';

const ID_TITULO = 'horarios-titulo-asignaciones';
const ID_CUERPO = 'horarios-cuerpo-asignaciones';
/** Cantidad de relaciones desde la cual la tabla se reparte en dos columnas. */
const UMBRAL_DOS_COLUMNAS = 8;

/**
 * Tabla de relaciones curso-docente de la sección consultada.
 *
 * @param {Object} props
 * @param {'cargando'|'listo'|'error'} props.estado
 * @param {Array<{ id: string, cursoNombre: string, docenteNombre: string }>} props.asignaciones
 * @param {() => void} props.alReintentar
 * @param {() => void} props.alAgregar
 * @param {(asignacion: Object) => void} props.alEliminar
 */
export default function TablaAsignaciones({
  estado,
  asignaciones,
  soloLectura = false,
  agregarDeshabilitado = false,
  alReintentar,
  alAgregar,
  alEliminar
}) {
  // Plegada por defecto cuando hay muchas relaciones; si la persona la abre o cierra, manda su elección.
  const [eleccion, establecerEleccion] = useState(null);
  const abierta = eleccion ?? asignaciones.length < UMBRAL_DOS_COLUMNAS;

  // Con muchas relaciones se reparten en dos tablas lado a lado (una sola en pantallas angostas).
  const mitad = Math.ceil(asignaciones.length / 2);
  const columnas =
    asignaciones.length >= UMBRAL_DOS_COLUMNAS
      ? [asignaciones.slice(0, mitad), asignaciones.slice(mitad)]
      : [asignaciones];

  return (
    <section className={estilos.seccion} aria-labelledby={ID_TITULO}>
      <div className={estilos.encabezado}>
        <h2 id={ID_TITULO} className={estilos.titulo}>Cursos y docentes de la sección</h2>
        <span className={estilos.linea} aria-hidden="true" />
        <div className={estilos.acciones}>
          {estado === 'listo' && asignaciones.length > 0 && (
            <button
              type="button"
              className={estilos.botonColapsar}
              aria-expanded={abierta}
              aria-controls={ID_CUERPO}
              onClick={() => establecerEleccion(!abierta)}
            >
              <Icono nombre={abierta ? 'chevron-arriba' : 'chevron-abajo'} tamano={16} />
              {abierta ? 'Ocultar' : `Mostrar (${asignaciones.length})`}
            </button>
          )}
          {!soloLectura && (
            <button
              type="button"
              className={estilos.botonAgregar}
              disabled={estado !== 'listo' || agregarDeshabilitado}
              title={agregarDeshabilitado ? 'No hay docentes activos disponibles.' : undefined}
              onClick={alAgregar}
            >
              <Icono nombre="agregar" tamano={18} />
              Agregar relación
            </button>
          )}
        </div>
      </div>

      {soloLectura && (
        <p className={estilos.avisoSoloLectura} role="note">
          El contrato actual permite consultar asignaciones, pero no modificarlas.
        </p>
      )}
      {!soloLectura && agregarDeshabilitado && (
        <p role="status">No hay docentes activos disponibles para crear una asignación.</p>
      )}
      {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={3} />}
      {estado === 'error' && <EstadoConsulta tipo="error" alReintentar={alReintentar} />}

      {estado === 'listo' && abierta && (
        <div id={ID_CUERPO} className={estilos.tarjeta}>
          {asignaciones.length === 0 ? (
            <EstadoConsulta
              tipo="vacio"
              mensaje="Esta sección aún no tiene relaciones curso-docente."
            />
          ) : (
            <div className={columnas.length > 1 ? estilos.dosColumnas : undefined}>
              {columnas.map((filas, indice) => (
                <div key={indice} className={estilos.contenedorTabla}>
                  <table className={estilos.tabla}>
                    <thead>
                      <tr>
                        <th scope="col">Curso</th>
                        <th scope="col">Docente</th>
                        {!soloLectura && (
                          <th scope="col" className={estilos.columnaAccion}>
                            <span className={estilosUtil.ocultoVisualmente}>Acciones</span>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filas.map((asignacion) => (
                        <tr key={asignacion.id}>
                          <td className={estilos.celdaCurso}>{asignacion.cursoNombre}</td>
                          <td>{asignacion.docenteNombre}</td>
                          {!soloLectura && (
                            <td className={estilos.columnaAccion}>
                              <button
                                type="button"
                                className={estilos.botonEliminar}
                                aria-label={`Eliminar ${asignacion.cursoNombre} con ${asignacion.docenteNombre}`}
                                onClick={() => alEliminar(asignacion)}
                              >
                                <Icono nombre="papelera" tamano={18} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
