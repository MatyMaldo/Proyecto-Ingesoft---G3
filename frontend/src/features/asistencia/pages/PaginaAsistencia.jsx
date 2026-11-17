import useAuth from '../../../shared/auth/useAuth.js';
import { ROLES } from '../../../shared/auth/roles.js';
import BotonActualizar from '../../../shared/components/BotonActualizar.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltrosActivos from '../../../shared/components/FiltrosActivos.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import SelectorFilasPagina from '../../../shared/components/SelectorFilasPagina.jsx';
import SelectorFecha from '../../horarios/components/SelectorFecha.jsx';
import { formatearFecha } from '../../horarios/utils/tiempo.js';
import useHistorialAsistencia, { OPCIONES_TAMANO_PAGINA } from '../hooks/useHistorialAsistencia.js';
import {
  etiquetaEstadoAsistencia,
  formatearHoraRegistro,
  formatearPorcentajeAsistencia,
  normalizarEstadoAsistencia,
  tonoEstadoAsistencia
} from '../utils/estadosAsistencia.js';
import estilos from './PaginaAsistencia.module.css';

const MENSAJE_VACIO = 'No hay registros de asistencia disponibles.';

function descripcionPagina(rol) {
  if (rol === ROLES.DOCENTE) return 'Consulta el historial de asistencia de tus cursos por rango de fechas.';
  if (rol === ROLES.APODERADO) return 'Consulta el historial de asistencia de tus estudiantes por curso y rango de fechas.';
  return 'Consulta tu historial de asistencia por curso y rango de fechas.';
}

const horario = (registro) =>
  `${String(registro.horaInicio ?? '').slice(0, 5)} – ${String(registro.horaFin ?? '').slice(0, 5)}`;

/**
 * Historial de asistencia de docentes, estudiantes y apoderados. Mismo orden y ritmo que Usuarios, Matrículas y
 * Pagos: título con descripción, filtros planos, resumen y una sola tabla con su pie (tarjetas por debajo de 768 px).
 */
export default function PaginaAsistencia() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;
  const historial = useHistorialAsistencia(usuario);

  if (rol === ROLES.ADMINISTRADOR) {
    return (
      <div className={estilos.pagina}>
        <header className={estilos.cabecera}>
          <div className={estilos.textoCabecera}>
            <h1 className={estilos.titulo}>Asistencia</h1>
          </div>
        </header>
        <EstadoConsulta
          tipo="vacio"
          mensaje="La consulta de asistencia está disponible para docentes, estudiantes y apoderados."
        />
      </div>
    );
  }

  const esDocente = rol === ROLES.DOCENTE;
  // El docente ve su propia asistencia (HU-ASI-08), igual que el estudiante: «Mi asistencia».
  const titulo = esDocente || rol === ROLES.ESTUDIANTE ? 'Mi asistencia' : 'Asistencia';
  const opcionesEstudiante = historial.estudiantes.map((estudiante) => ({
    valor: String(estudiante.id),
    etiqueta: estudiante.nombreCompleto ?? estudiante.nombre ?? String(estudiante.id)
  }));
  const opcionesCurso = [
    { valor: '', etiqueta: 'Todos los cursos' },
    ...historial.cursos.map((curso) => ({
      valor: String(curso.id),
      etiqueta: curso.nombre
    }))
  ];

  if (historial.esApoderado && historial.estudiantesListos && !historial.estudiantes.length && !historial.error) {
    return (
      <div className={estilos.pagina}>
        <header className={estilos.cabecera}>
          <div className={estilos.textoCabecera}>
            <h1 className={estilos.titulo}>Asistencia</h1>
          </div>
        </header>
        <EstadoConsulta
          tipo="vacio"
          mensaje="No cuenta con ningún estudiante a su cargo"
        />
      </div>
    );
  }

  const hayResultados = !historial.error && !historial.cargando && historial.registros.length > 0;

  return (
    <div className={estilos.pagina}>
      {/* Barra de título (GUI §6): título y descripción en la misma línea, sin acciones. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>{titulo}</h1>
          <p className={estilos.descripcion}>
            {descripcionPagina(rol)}
            {historial.anioConsulta?.anio ? ` Año académico ${historial.anioConsulta.anio}.` : ''}
          </p>
        </div>
      </header>

      {/* Filtros sin tarjeta: una fila (se acomoda en varias si no cabe) y debajo «Limpiar filtros». */}
      <section className={estilos.filtros} aria-label="Filtros de asistencia">
        <div className={estilos.filaFiltros}>
          {historial.esApoderado && (
            <div className={`${estilos.campoSelect} ${estilos.campoEstudiante}`}>
              <SelectFiltro
                id="asistencia-estudiante"
                etiqueta="Estudiante"
                valor={historial.estudianteId}
                opciones={opcionesEstudiante}
                alCambiar={(valor) => {
                  historial.establecerEstudianteId(valor);
                  historial.establecerCursoId('');
                }}
                apilado
              />
            </div>
          )}

          <div className={estilos.campoSelect}>
            <SelectFiltro
              id="asistencia-curso"
              etiqueta="Curso"
              valor={historial.cursoId}
              opciones={opcionesCurso}
              alCambiar={historial.establecerCursoId}
              apilado
            />
          </div>

          <div className={estilos.campoFecha}>
            <span className={estilos.etiqueta}>Desde</span>
            <SelectorFecha
              id="asistencia-desde"
              etiqueta="Desde"
              valor={historial.fechaInicio}
              min={historial.anioConsulta?.fechaInicio}
              max={historial.fechaFin || historial.anioConsulta?.fechaFin}
              alCambiar={historial.establecerFechaInicio}
            />
          </div>

          <div className={estilos.campoFecha}>
            <span className={estilos.etiqueta}>Hasta</span>
            <SelectorFecha
              id="asistencia-hasta"
              etiqueta="Hasta"
              valor={historial.fechaFin}
              min={historial.fechaInicio || historial.anioConsulta?.fechaInicio}
              max={historial.anioConsulta?.fechaFin}
              alCambiar={historial.establecerFechaFin}
            />
          </div>

          <div className={estilos.botonFila}>
            <BotonActualizar alActualizar={historial.recargar} actualizando={historial.cargando} />
          </div>
        </div>

        <FiltrosActivos filtros={[]} hayFiltros={historial.hayFiltros} alLimpiar={historial.limpiarFiltros} />
      </section>

      {!historial.error && !historial.cargando && (
        <section className={estilos.resumen} aria-label="Resumen del filtro seleccionado">
          <p className={estilos.notaResumen}>Resumen del filtro seleccionado.</p>
          <article className={`${estilos.tarjetaResumen} ${estilos.tarjetaPorcentaje}`}>
            <p className={estilos.etiquetaResumen}>Asistencia general</p>
            <p className={estilos.valorResumen}>
              {formatearPorcentajeAsistencia(historial.resumen.porcentaje)}%
            </p>
          </article>
          <article className={`${estilos.tarjetaResumen} ${estilos.tarjetaPresente}`}>
            <p className={estilos.etiquetaResumen}>Sesiones presentes</p>
            <p className={estilos.valorResumen}>{historial.resumen.presentes}</p>
          </article>
          <article className={`${estilos.tarjetaResumen} ${estilos.tarjetaTardanza}`}>
            <p className={estilos.etiquetaResumen}>Tardanzas</p>
            <p className={estilos.valorResumen}>{historial.resumen.tardanzas}</p>
          </article>
          <article className={`${estilos.tarjetaResumen} ${estilos.tarjetaFalta}`}>
            <p className={estilos.etiquetaResumen}>Faltas</p>
            <p className={estilos.valorResumen}>{historial.resumen.faltas}</p>
          </article>
        </section>
      )}

      <section className={estilos.tarjetaResultados} aria-label="Historial de asistencia" aria-busy={historial.cargando || undefined}>
        {historial.error && (
          <EstadoConsulta tipo="error" mensaje={historial.error} alReintentar={historial.recargar} />
        )}

        {!historial.error && historial.cargando && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}

        {!historial.error && !historial.cargando && historial.registros.length === 0 && (
          <EstadoConsulta tipo="vacio" mensaje={MENSAJE_VACIO} />
        )}

        {hayResultados && (
          <>
            <div className={estilos.vistaTabla}>
              <table className={estilos.tabla}>
                <caption className={estilos.soloLectores}>Historial de asistencia</caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Curso</th>
                    <th scope="col">Grado</th>
                    <th scope="col" className={estilos.columnaSeccion}>Sección</th>
                    <th scope="col">Horario</th>
                    {esDocente && <th scope="col">Hora de registro</th>}
                    <th scope="col">Estado</th>
                    {!esDocente && <th scope="col">Observaciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {historial.registros.map((registro) => {
                    const estado = normalizarEstadoAsistencia(registro.estado);
                    return (
                      <tr key={registro.id} className={estilos.fila}>
                        <td className={estilos.fecha}>{formatearFecha(registro.fecha)}</td>
                        <td className={estilos.curso} title={registro.cursoNombre}>{registro.cursoNombre}</td>
                        <td>{registro.gradoNombre ?? '—'}</td>
                        <td className={estilos.columnaSeccion}>{registro.seccionNombre}</td>
                        <td>{horario(registro)}</td>
                        {esDocente && <td>{formatearHoraRegistro(registro.fechaHoraRegistro)}</td>}
                        <td>
                          <Insignia tono={tonoEstadoAsistencia(estado)}>
                            {etiquetaEstadoAsistencia(estado)}
                          </Insignia>
                        </td>
                        {!esDocente && (
                          <td className={estilos.observaciones} title={registro.observaciones || undefined}>
                            {registro.observaciones || '—'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className={estilos.listaTarjetas} aria-label="Registros de asistencia">
              {historial.registros.map((registro) => {
                const estado = normalizarEstadoAsistencia(registro.estado);
                return (
                  <li key={registro.id} className={estilos.tarjeta}>
                    <div className={estilos.filaSuperior}>
                      <span className={estilos.curso}>{registro.cursoNombre}</span>
                      <Insignia tono={tonoEstadoAsistencia(estado)}>
                        {etiquetaEstadoAsistencia(estado)}
                      </Insignia>
                    </div>
                    <p className={estilos.campo}>
                      <span className={estilos.rotuloCampo}>Fecha y horario:</span>{' '}
                      {formatearFecha(registro.fecha)} · {horario(registro)}
                    </p>
                    <p className={estilos.campo}>
                      <span className={estilos.rotuloCampo}>Grado y sección:</span>{' '}
                      {[registro.gradoNombre, registro.seccionNombre].filter(Boolean).join(' · ') || '—'}
                    </p>
                    {esDocente && (
                      <p className={estilos.campo}>
                        <span className={estilos.rotuloCampo}>Hora de registro:</span>{' '}
                        {formatearHoraRegistro(registro.fechaHoraRegistro)}
                      </p>
                    )}
                    {!esDocente && registro.observaciones && (
                      <p className={estilos.campo}>
                        <span className={estilos.rotuloCampo}>Observaciones:</span> {registro.observaciones}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* El pie lleva siempre el selector de filas y el paginador. */}
            <div className={estilos.pie}>
              <SelectorFilasPagina
                opciones={OPCIONES_TAMANO_PAGINA}
                valor={historial.tamanoPagina}
                totalElementos={historial.totalRegistros}
                alCambiar={historial.cambiarTamanoPagina}
              />
              <Paginacion
                pagina={historial.pagina}
                totalPaginas={historial.totalPaginas}
                totalElementos={historial.totalRegistros}
                tamanioPagina={historial.tamanoPagina}
                cantidadEnPagina={historial.registros.length}
                alCambiarPagina={historial.cambiarPagina}
                etiqueta="Paginación del historial de asistencia"
                unidadSingular="registro"
                unidadPlural="registros"
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
