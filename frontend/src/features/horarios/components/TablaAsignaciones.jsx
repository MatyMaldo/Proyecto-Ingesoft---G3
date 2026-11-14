import { useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import estilos from './TablaAsignaciones.module.css';

const ID_TITULO = 'horarios-titulo-asignaciones';
/** Relaciones por página: fijo, sin selector, para que la pantalla de Horarios no necesite desplazarse. */
export const ASIGNACIONES_POR_PAGINA = 5;

/**
 * Tabla paginada de relaciones curso-docente de la sección consultada.
 *
 * @param {Object} props
 * @param {'cargando'|'listo'|'error'} props.estado
 * @param {Array<{ id: string, cursoNombre: string, docenteNombre: string }>} props.asignaciones
 * @param {() => void} props.alReintentar
 * @param {() => void} props.alAgregar
 * @param {(asignacion: Object) => void} props.alEliminar
 * @param {(asignacion: Object) => void} [props.alVerCarga] Abre la carga horaria del docente de la fila; sin ella
 *   no se ofrece la acción.
 */
export default function TablaAsignaciones({
  estado,
  asignaciones,
  soloLectura = false,
  agregarDeshabilitado = false,
  alReintentar,
  alAgregar,
  alEditar,
  alEliminar,
  alVerCarga
}) {
  const [pagina, establecerPagina] = useState(0);

  const totalPaginas = Math.max(1, Math.ceil(asignaciones.length / ASIGNACIONES_POR_PAGINA));
  // Si al quitar una relación la página actual deja de existir, se muestra la última.
  const paginaVisible = Math.min(pagina, totalPaginas - 1);
  const filas = asignaciones.slice(
    paginaVisible * ASIGNACIONES_POR_PAGINA,
    (paginaVisible + 1) * ASIGNACIONES_POR_PAGINA
  );
  const hayAcciones = !soloLectura || Boolean(alVerCarga);

  return (
    <section className={estilos.seccion} aria-labelledby={ID_TITULO}>
      <div className={estilos.encabezado}>
        <h2 id={ID_TITULO} className={estilos.titulo}>Asignaciones de cursos y docentes de la sección</h2>
        <span className={estilos.linea} aria-hidden="true" />
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

      {!soloLectura && agregarDeshabilitado && (
        <p role="status">No hay docentes activos disponibles para crear una asignación.</p>
      )}
      {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={3} />}
      {estado === 'error' && <EstadoConsulta tipo="error" alReintentar={alReintentar} />}

      {estado === 'listo' && (
        <div className={estilos.tarjeta}>
          {asignaciones.length === 0 ? (
            <EstadoConsulta
              tipo="vacio"
              mensaje="Esta sección aún no tiene relaciones curso-docente."
            />
          ) : (
            <div className={estilos.contenedorTabla}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Curso</th>
                    <th scope="col">Docente</th>
                    {hayAcciones && (
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
                      {hayAcciones && (
                        <td className={estilos.columnaAccion}>
                          {alVerCarga && (
                            <button
                              type="button"
                              className={estilos.botonCarga}
                              title={`Ver la carga horaria semanal de ${asignacion.docenteNombre}`}
                              aria-label={`Carga docente de ${asignacion.docenteNombre}`}
                              onClick={() => alVerCarga(asignacion)}
                            >
                              <Icono nombre="reloj" tamano={16} />
                              Carga docente
                            </button>
                          )}
                          {!soloLectura && (
                            <>
                              <button
                                type="button"
                                className={estilos.botonEditar}
                                aria-label={`Editar ${asignacion.cursoNombre} con ${asignacion.docenteNombre}`}
                                onClick={() => alEditar?.(asignacion)}
                              >
                                <Icono nombre="editar" tamano={18} />
                              </button>
                              <button
                                type="button"
                                className={estilos.botonEliminar}
                                aria-label={`Eliminar ${asignacion.cursoNombre} con ${asignacion.docenteNombre}`}
                                onClick={() => alEliminar(asignacion)}
                              >
                                <Icono nombre="papelera" tamano={18} />
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {estado === 'listo' && totalPaginas > 1 && (
        <Paginacion
          pagina={paginaVisible}
          totalPaginas={totalPaginas}
          totalElementos={asignaciones.length}
          tamanioPagina={ASIGNACIONES_POR_PAGINA}
          cantidadEnPagina={filas.length}
          alCambiarPagina={establecerPagina}
          etiqueta="Paginación de asignaciones"
          unidadSingular="asignación"
          unidadPlural="asignaciones"
        />
      )}
    </section>
  );
}
