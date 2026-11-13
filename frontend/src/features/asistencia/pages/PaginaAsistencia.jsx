import useAuth from '../../../shared/auth/useAuth.js';
import { ROLES } from '../../../shared/auth/roles.js';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import SelectorFecha from '../../horarios/components/SelectorFecha.jsx';
import { formatearFecha } from '../../horarios/utils/tiempo.js';
import useHistorialAsistencia from '../hooks/useHistorialAsistencia.js';
import {
  etiquetaEstadoAsistencia,
  formatearPorcentajeAsistencia,
  normalizarEstadoAsistencia,
  tonoEstadoAsistencia
} from '../utils/estadosAsistencia.js';
import estilos from './PaginaAsistencia.module.css';

function mensajeVacio(rol) {
  if (rol === ROLES.DOCENTE) return 'No hay registros de asistencia en el rango seleccionado.';
  return 'No hay registros de asistencia para el rango seleccionado.';
}

export default function PaginaAsistencia() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;
  const historial = useHistorialAsistencia(usuario);

  if (rol === ROLES.ADMINISTRADOR) {
    return (
      <div className={estilos.pagina}>
        <header className={estilos.cabecera}>
          <h1 className={estilos.titulo}>Asistencia</h1>
        </header>
        <EstadoConsulta
          tipo="vacio"
          mensaje="La consulta de asistencia está disponible para docentes, estudiantes y apoderados."
        />
      </div>
    );
  }

  const titulo = historial.esApoderado ? 'Asistencia' : 'Mi asistencia';
  const opcionesEstudiante = historial.estudiantes.map((estudiante) => ({
    valor: String(estudiante.id),
    etiqueta: estudiante.nombre ?? estudiante.nombreCompleto ?? String(estudiante.id)
  }));
  const opcionesCurso = [
    { valor: '', etiqueta: 'Todos los cursos' },
    ...historial.cursos.map((curso) => ({
      valor: String(curso.id),
      etiqueta: curso.nombre
    }))
  ];

  if (historial.esApoderado && !historial.estudiantes.length && !historial.cargando) {
    return (
      <div className={estilos.pagina}>
        <header className={estilos.cabecera}>
          <p className={estilos.sobretitulo}>Seguimiento académico</p>
          <h1 className={estilos.titulo}>Asistencia</h1>
        </header>
        <EstadoConsulta
          tipo="vacio"
          mensaje="No cuentas con ningún estudiante a tu cargo."
        />
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.sobretitulo}>Seguimiento académico</p>
        <h1 className={estilos.titulo}>{titulo}</h1>
        <p className={estilos.descripcion}>
          Consulta el historial de asistencia por curso y rango de fechas.
        </p>
      </header>

      <section className={estilos.filtros} aria-label="Filtros de asistencia">
        {historial.esApoderado && (
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
        )}

        <SelectFiltro
          id="asistencia-curso"
          etiqueta="Curso"
          valor={historial.cursoId}
          opciones={opcionesCurso}
          alCambiar={historial.establecerCursoId}
          apilado
        />

        <div className={estilos.campoFecha}>
          <span className={estilos.etiqueta}>Desde</span>
          <SelectorFecha
            id="asistencia-desde"
            etiqueta="Desde"
            valor={historial.fechaInicio}
            max={historial.fechaFin}
            alCambiar={historial.establecerFechaInicio}
          />
        </div>

        <div className={estilos.campoFecha}>
          <span className={estilos.etiqueta}>Hasta</span>
          <SelectorFecha
            id="asistencia-hasta"
            etiqueta="Hasta"
            valor={historial.fechaFin}
            min={historial.fechaInicio}
            alCambiar={historial.establecerFechaFin}
          />
        </div>

        <button
          type="button"
          className={estilos.botonActualizar}
          onClick={historial.recargar}
          disabled={historial.cargando}
        >
          <Icono nombre="reintentar" tamano={16} />
          Actualizar
        </button>
      </section>

      {historial.error && (
        <EstadoConsulta
          tipo="error"
          mensaje={historial.error}
          alReintentar={historial.recargar}
        />
      )}

      {!historial.error && historial.cargando && (
        <EstadoConsulta tipo="carga" filasEsqueleto={4} />
      )}

      {!historial.error && !historial.cargando && (
        <>
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

          {historial.registros.length === 0 ? (
            <EstadoConsulta tipo="vacio" mensaje={mensajeVacio(rol)} />
          ) : (
            <div className={estilos.tablaContenedor}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Curso</th>
                    <th scope="col">Grado</th>
                    <th scope="col">Sección</th>
                    <th scope="col">Horario</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.registros.map((registro) => {
                    const estado = normalizarEstadoAsistencia(registro.estado);
                    return (
                      <tr key={registro.id}>
                        <td className={estilos.fecha}>{formatearFecha(registro.fecha)}</td>
                        <td className={estilos.curso}>{registro.cursoNombre}</td>
                        <td>{registro.gradoNombre}</td>
                        <td>{registro.seccionNombre}</td>
                        <td>
                          {String(registro.horaInicio ?? '').slice(0, 5)} – {String(registro.horaFin ?? '').slice(0, 5)}
                        </td>
                        <td>
                          <Insignia tono={tonoEstadoAsistencia(estado)}>
                            {etiquetaEstadoAsistencia(estado)}
                          </Insignia>
                        </td>
                        <td className={estilos.observaciones}>
                          {registro.observaciones || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {historial.totalRegistros > 0 && (
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
          )}
        </>
      )}
    </div>
  );
}
