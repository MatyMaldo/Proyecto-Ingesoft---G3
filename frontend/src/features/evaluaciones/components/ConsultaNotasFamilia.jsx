import { useEffect, useState } from 'react';
import { ROLES } from '../../../shared/auth/roles.js';
import useAuth from '../../../shared/auth/useAuth.js';
import {
  consultarNotasCurso,
  listarCursosConsulta,
  listarEstudiantesConsulta
} from '../services/consultaNotasService.js';
import estilos from './ConsultaNotasFamilia.module.css';

export default function ConsultaNotasFamilia() {
  const { usuario } = useAuth();
  const esEstudiante = usuario?.rol === ROLES.ESTUDIANTE;
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteId, setEstudianteId] = useState(esEstudiante ? String(usuario?.id ?? '') : '');
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);
  const [cargandoCursos, setCargandoCursos] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargarEstudiantes() {
      setCargandoEstudiantes(true);
      const respuesta = await listarEstudiantesConsulta(usuario);
      if (!activo) return;
      setCargandoEstudiantes(false);
      if (!respuesta.exitoso) {
        setError(respuesta.mensaje || 'No se pudo identificar al estudiante.');
        return;
      }
      const lista = Array.isArray(respuesta.datos) ? respuesta.datos : [];
      setEstudiantes(lista);
      if (esEstudiante) setEstudianteId(String(usuario.id));
      else setEstudianteId((actual) => actual || String(lista[0]?.id ?? ''));
    }
    cargarEstudiantes();
    return () => { activo = false; };
  }, [usuario?.id, usuario?.rol]);

  useEffect(() => {
    let activo = true;
    async function cargarCursos() {
      setDetalle(null);
      setCursoSeleccionado(null);
      setCursos([]);
      setError('');
      if (!estudianteId) return;
      setCargandoCursos(true);
      const respuesta = await listarCursosConsulta(usuario, estudianteId);
      if (!activo) return;
      setCargandoCursos(false);
      if (!respuesta.exitoso) {
        setError(respuesta.mensaje || 'No se pudieron cargar los cursos del año de consulta.');
        return;
      }
      setCursos(Array.isArray(respuesta.datos) ? respuesta.datos : []);
    }
    cargarCursos();
    return () => { activo = false; };
  }, [estudianteId, usuario?.id, usuario?.rol]);

  const estudiante = estudiantes.find((item) => String(item.id) === estudianteId);

  async function abrirNotas(curso) {
    setCursoSeleccionado(curso);
    setDetalle(null);
    setError('');
    setCargandoDetalle(true);
    const respuesta = await consultarNotasCurso(usuario, estudianteId, curso.id);
    setCargandoDetalle(false);
    if (!respuesta.exitoso) {
      setError(respuesta.mensaje || 'No se pudieron consultar las notas del curso.');
      return;
    }
    setDetalle(respuesta.datos);
  }

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.sobretitulo}>Seguimiento académico</p>
        <h1 className={estilos.titulo}>Cursos</h1>
        <p className={estilos.descripcion}>Consulta las evaluaciones, notas y resultados por competencia del año académico de consulta.</p>
      </header>

      {cargandoEstudiantes ? <p className={estilos.estado}>Cargando información…</p> : (
        <>
          {!esEstudiante && estudiantes.length > 0 && (
            <section className={estilos.selectorEstudiante}>
              <label htmlFor="estudiante-consulta">Estudiante</label>
              <select id="estudiante-consulta" value={estudianteId} onChange={(evento) => setEstudianteId(evento.target.value)}>
                {estudiantes.map((item) => <option key={item.id} value={item.id}>{item.nombre} · {item.codigo}</option>)}
              </select>
            </section>
          )}
          {!esEstudiante && !estudiantes.length && !error && <p className={estilos.vacio}>No hay estudiantes asociados a tu cuenta de apoderado.</p>}
          {esEstudiante && <p className={estilos.estudianteActual}>Estudiante: <strong>{usuario?.nombre}</strong></p>}
          {error && <p className={estilos.error} role="alert">{error}</p>}

          {cargandoCursos ? <p className={estilos.estado}>Cargando cursos del año de consulta…</p> : cursos.length > 0 ? (
            <section className={estilos.seccion} aria-labelledby="cursos-consulta-titulo">
              <div className={estilos.encabezadoSeccion}>
                <div><h2 id="cursos-consulta-titulo">Cursos de {estudiante?.nombre ?? usuario?.nombre}</h2><p>Año académico de consulta: <strong>{cursos[0]?.anioAcademico?.anio ?? '—'}</strong></p></div>
              </div>
              <ul className={estilos.listaCursos}>
                {cursos.map((curso) => <li key={`${curso.id}-${curso.seccionId}`}>
                  <div><h3>{curso.nombre}</h3><p>{curso.gradoNombre} · Sección {curso.seccionNombre}</p></div>
                  <button type="button" className={estilos.boton} onClick={() => abrirNotas(curso)}>Evaluaciones y Notas</button>
                </li>)}
              </ul>
            </section>
          ) : !cargandoCursos && estudianteId && !error ? (
            <p className={estilos.vacio}>No hay cursos con matrícula confirmada para el año académico de consulta.</p>
          ) : null}

          {cursoSeleccionado && (
            <section className={estilos.seccion} aria-labelledby="detalle-notas-titulo">
              {cargandoDetalle ? <p className={estilos.estado}>Cargando evaluaciones y notas…</p> : detalle && (
                <>
                  <div className={estilos.encabezadoSeccion}>
                    <div><h2 id="detalle-notas-titulo">{detalle.curso.nombre} · {detalle.gradoNombre} {detalle.seccionNombre}</h2><p>{detalle.estudiante.nombre} · Año académico {detalle.anioConsulta.anio}</p></div>
                    <button type="button" className={estilos.botonCerrar} onClick={() => { setDetalle(null); setCursoSeleccionado(null); }}>Cerrar detalle</button>
                  </div>
                  <dl className={estilos.datosCurso}>
                    <div><dt>Curso</dt><dd>{detalle.curso.nombre}</dd></div>
                    <div><dt>Grado y sección</dt><dd>{detalle.gradoNombre} · {detalle.seccionNombre}</dd></div>
                    <div><dt>Docente</dt><dd>{detalle.docenteNombre}</dd></div>
                    <div><dt>Estudiante</dt><dd>{detalle.estudiante.nombre}</dd></div>
                  </dl>

                  <section className={estilos.subseccion} aria-labelledby="evaluaciones-notas-titulo">
                    <h3 id="evaluaciones-notas-titulo">Evaluaciones y notas</h3>
                    {!detalle.evaluaciones.length ? <p className={estilos.vacio}>No hay evaluaciones registradas para este curso.</p> : (
                      <ul className={estilos.listaEvaluaciones}>
                        {detalle.evaluaciones.map((evaluacion) => <li key={evaluacion.id}>
                          <div className={estilos.resumenEvaluacion}><strong>{evaluacion.nombre}</strong><span>{evaluacion.bimestreNombre} · {evaluacion.fecha}</span></div>
                          <details>
                            <summary>Ver detalle</summary>
                            <dl className={estilos.datosEvaluacion}>
                              <div><dt>Curso</dt><dd>{evaluacion.cursoNombre}</dd></div>
                              <div><dt>Grado y sección</dt><dd>{evaluacion.gradoNombre} · {evaluacion.seccionNombre}</dd></div>
                              <div><dt>Docente</dt><dd>{evaluacion.docenteNombre}</dd></div>
                              <div><dt>Evaluación</dt><dd>{evaluacion.nombre}</dd></div>
                              <div><dt>Descripción</dt><dd>{evaluacion.descripcion}</dd></div>
                              <div><dt>Fecha</dt><dd>{evaluacion.fecha}</dd></div>
                              <div><dt>Bimestre</dt><dd>{evaluacion.bimestreNombre}</dd></div>
                              <div><dt>Competencia</dt><dd>{evaluacion.competenciaNombre}</dd></div>
                              <div><dt>Estudiante</dt><dd>{evaluacion.estudianteNombre}</dd></div>
                              <div><dt>Nota</dt><dd>{evaluacion.nota ?? <span className={estilos.sinNota}>no hay nota registrada</span>}</dd></div>
                            </dl>
                          </details>
                        </li>)}
                      </ul>
                    )}
                  </section>

                  <section className={estilos.subseccion} aria-labelledby="competencias-bimestres-titulo">
                    <h3 id="competencias-bimestres-titulo">Notas de competencias por bimestre</h3>
                    {!detalle.competencias.length ? <p className={estilos.vacio}>El curso aún no tiene competencias establecidas.</p> : (
                      <div className={estilos.tablaDesbordable}>
                        <table>
                          <thead><tr><th scope="col">Competencia</th>{detalle.bimestres.map((bimestre) => <th scope="col" key={bimestre.id}>{bimestre.nombre}</th>)}</tr></thead>
                          <tbody>{detalle.competencias.map((competencia) => <tr key={competencia.id}>
                            <th scope="row">{competencia.nombre}</th>
                            {detalle.bimestres.map((bimestre) => <td key={bimestre.id}>{competencia.notasPorBimestre[bimestre.id] ?? <span className={estilos.sinNota}>no hay nota de competencia registrada</span>}</td>)}
                          </tr>)}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
