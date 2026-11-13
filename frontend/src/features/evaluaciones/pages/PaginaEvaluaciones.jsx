import { useEffect, useMemo, useState } from 'react';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import useAuth from '../../../shared/auth/useAuth.js';
import {
  crearEvaluacion,
  guardarNotasCompetencias,
  guardarNotaEvaluacion,
  listarBimestresAnio,
  listarContextoDocenteEvaluaciones,
  listarEstudiantesEvaluacion,
  listarEstudiantesSeccionCompetencias,
  listarNotasEvaluacion,
  listarNotasCompetencias,
  listarEvaluaciones
} from '../services/evaluacionesService.js';
import estilos from './PaginaEvaluaciones.module.css';

const FORMULARIO_VACIO = { nombre: '', descripcion: '', fecha: '', competenciaId: '' };

function encontrarBimestre(fecha, bimestres = []) {
  return bimestres.find((bimestre) => fecha >= bimestre.inicio && fecha <= bimestre.fin);
}

export default function PaginaEvaluaciones() {
  const { usuario } = useAuth();
  const [contexto, setContexto] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [errorCarga, setErrorCarga] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [seccionId, setSeccionId] = useState('');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [evaluacionNotas, setEvaluacionNotas] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [estudianteId, setEstudianteId] = useState('');
  const [notaSeleccionada, setNotaSeleccionada] = useState('');
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [errorNota, setErrorNota] = useState('');
  const [avisoNota, setAvisoNota] = useState('');
  const [formCompetenciasAbierto, setFormCompetenciasAbierto] = useState(false);
  const [bimestresFinalizados, setBimestresFinalizados] = useState([]);
  const [bimestreCompetenciasId, setBimestreCompetenciasId] = useState('');
  const [estudianteCompetenciasId, setEstudianteCompetenciasId] = useState('');
  const [formNotasCompetencias, setFormNotasCompetencias] = useState([]);
  const [cargandoCompetencias, setCargandoCompetencias] = useState(false);
  const [guardandoCompetencias, setGuardandoCompetencias] = useState(false);
  const [errorCompetencias, setErrorCompetencias] = useState('');
  const [avisoCompetencias, setAvisoCompetencias] = useState('');

  async function cargar() {
    setEstado('cargando');
    setErrorCarga('');
    const respuestaContexto = await listarContextoDocenteEvaluaciones(usuario);
    if (!respuestaContexto.exitoso) {
      setErrorCarga(respuestaContexto.mensaje || 'No se pudo cargar la información de evaluaciones.');
      setEstado('error');
      return;
    }
    const anioAcademico = respuestaContexto.datos.anioAcademico;
    const asignaciones = (respuestaContexto.datos.asignaciones ?? []).flatMap((curso) =>
      curso.secciones.map((seccion) => ({
        idAsignacionCurso: seccion.idAsignacionCurso,
        cursoId: curso.cursoId,
        cursoNombre: curso.cursoNombre,
        seccionId: seccion.id,
        seccionNombre: seccion.nombre,
        gradoId: seccion.gradoId,
        gradoNombre: seccion.gradoNombre,
        anioAcademico
      }))
    );
    const [respuestaBimestres, respuestasEvaluaciones] = await Promise.all([
      listarBimestresAnio(anioAcademico.id),
      Promise.all(asignaciones.map((item) =>
        listarEvaluaciones(item.idAsignacionCurso, item, anioAcademico)
      ))
    ]);
    const error = [respuestaBimestres, ...respuestasEvaluaciones]
      .find((respuesta) => !respuesta.exitoso);
    if (error) {
      setErrorCarga(error.mensaje || 'No se pudo cargar la información de evaluaciones.');
      setEstado('error');
      return;
    }
    setContexto({ ...respuestaContexto.datos, bimestres: respuestaBimestres.datos });
    setEvaluaciones(respuestasEvaluaciones.flatMap((respuesta) => respuesta.datos ?? []));
    const primeraAsignacion = respuestaContexto.datos.asignaciones?.[0];
    setCursoId((actual) => actual || String(primeraAsignacion?.cursoId ?? ''));
    setSeccionId((actual) => actual || String(primeraAsignacion?.secciones?.[0]?.id ?? ''));
    setEstado('listo');
  }

  useEffect(() => { cargar(); }, [usuario?.id]);

  const asignacion = contexto?.asignaciones?.find((item) => String(item.cursoId) === cursoId);
  const secciones = asignacion?.secciones ?? [];
  const seccion = secciones.find((item) => String(item.id) === seccionId);
  const competencias = asignacion?.competencias ?? [];
  const bimestreFecha = encontrarBimestre(formulario.fecha, contexto?.bimestres);
  const asignacionSeleccionada = seccion ? {
    idAsignacionCurso: seccion.idAsignacionCurso,
    cursoId: asignacion.cursoId,
    cursoNombre: asignacion.cursoNombre,
    seccionId: seccion.id,
    seccionNombre: seccion.nombre,
    gradoId: seccion.gradoId,
    gradoNombre: seccion.gradoNombre,
    anioAcademico: contexto?.anioAcademico
  } : null;

  const evaluacionesVisibles = useMemo(() => evaluaciones.filter((item) =>
    String(item.cursoId) === cursoId && String(item.seccionId) === seccionId
  ), [evaluaciones, cursoId, seccionId]);

  const estudianteSeleccionado = estudiantes.find((item) => String(item.id) === estudianteId);
  const estudianteCompetencias = estudiantes.find((item) => String(item.id) === estudianteCompetenciasId);
  const bimestreBloqueado = formNotasCompetencias.some((item) => item.libretaGenerada);
  const notaExistente = notas.find((item) => String(item.estudianteId) === estudianteId);
  const anioVigente = contexto?.anioAcademico;

  function esAnioVigente(evaluacion) {
    if (!anioVigente || anioVigente.vigente === false) return false;
    if (evaluacion.anioAcademicoId != null && anioVigente.id != null) {
      return String(evaluacion.anioAcademicoId) === String(anioVigente.id);
    }
    return String(evaluacion.anioAcademico) === String(anioVigente.anio);
  }

  function seleccionarCurso(valor) {
    const nuevaAsignacion = contexto?.asignaciones?.find((item) => String(item.cursoId) === valor);
    setCursoId(valor);
    setSeccionId(String(nuevaAsignacion?.secciones?.[0]?.id ?? ''));
    setFormularioAbierto(false);
    setEvaluacionNotas(null);
    setAviso('');
  }

  function abrirFormulario() {
    setFormulario(FORMULARIO_VACIO);
    setErrores({});
    setAviso('');
    setFormularioAbierto(true);
  }

  function validar() {
    const nuevosErrores = {};
    if (!formulario.nombre.trim()) nuevosErrores.nombre = 'Ingresa el nombre de la evaluación.';
    else if (formulario.nombre.trim().length > 160) nuevosErrores.nombre = 'El nombre no puede superar los 160 caracteres.';
    if (!formulario.descripcion.trim()) nuevosErrores.descripcion = 'Ingresa una descripción.';
    else if (formulario.descripcion.trim().length > 1000) nuevosErrores.descripcion = 'La descripción no puede superar los 1000 caracteres.';
    if (!formulario.fecha) nuevosErrores.fecha = 'Selecciona la fecha de la evaluación.';
    else if (!formulario.fecha.startsWith(`${contexto?.anioAcademico?.anio}-`)) {
      nuevosErrores.fecha = `La fecha debe estar dentro del año académico ${contexto?.anioAcademico?.anio}.`;
    } else if (!bimestreFecha) {
      nuevosErrores.fecha = 'La fecha debe estar dentro de uno de los bimestres del año académico.';
    }
    if (!formulario.competenciaId) nuevosErrores.competenciaId = 'Selecciona la competencia que medirá la evaluación.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (!validar() || !asignacion || !seccion) return;
    setGuardando(true);
    setAviso('');
    const competencia = competencias.find((item) => String(item.id) === formulario.competenciaId);
    const respuesta = await crearEvaluacion({
      nombre: formulario.nombre,
      descripcion: formulario.descripcion,
      fecha: formulario.fecha,
      idCompetencia: competencia.id,
      idAsignacionCurso: asignacionSeleccionada.idAsignacionCurso
    }, asignacionSeleccionada, contexto.docente, competencia);
    setGuardando(false);
    if (!respuesta.exitoso) {
      setAviso(respuesta.mensaje || 'No se pudo registrar la evaluación.');
      return;
    }
    setEvaluaciones((actuales) => [...actuales, respuesta.datos]);
    setFormularioAbierto(false);
    setAviso(`La evaluación se registró correctamente en ${bimestreFecha.nombre}.`);
  }

  async function abrirNotas(evaluacion) {
    setAviso('');
    setAvisoNota('');
    setErrorNota('');
    if (!esAnioVigente(evaluacion)) {
      setEvaluacionNotas(evaluacion);
      setEstudiantes([]);
      setNotas([]);
      setAvisoNota('Las notas de las evaluaciones solo se registran con el año académico vigente');
      return;
    }
    setCargandoNotas(true);
    setEvaluacionNotas(evaluacion);
    const [respuestaEstudiantes, respuestaNotas] = await Promise.all([
      listarEstudiantesEvaluacion(evaluacion), listarNotasEvaluacion(evaluacion)
    ]);
    setCargandoNotas(false);
    const error = [respuestaEstudiantes, respuestaNotas].find((respuesta) => !respuesta.exitoso);
    if (error) {
      setErrorNota(error.mensaje || 'No se pudieron cargar los estudiantes y sus notas.');
      return;
    }
    setEstudiantes(Array.isArray(respuestaEstudiantes.datos) ? respuestaEstudiantes.datos : []);
    setNotas(Array.isArray(respuestaNotas.datos) ? respuestaNotas.datos : []);
    const primerEstudiante = respuestaEstudiantes.datos?.[0];
    setEstudianteId(String(primerEstudiante?.id ?? ''));
    const notaInicial = respuestaNotas.datos?.find((nota) => String(nota.estudianteId) === String(primerEstudiante?.id));
    setNotaSeleccionada(notaInicial?.nota ?? '');
  }

  function seleccionarEstudiante(id) {
    setEstudianteId(id);
    setNotaSeleccionada(notas.find((nota) => String(nota.estudianteId) === id)?.nota ?? '');
    setErrorNota('');
    setAvisoNota('');
  }

  async function guardarNota(evento) {
    evento.preventDefault();
    setErrorNota('');
    setAvisoNota('');
    if (!evaluacionNotas || !estudianteSeleccionado || !notaSeleccionada) {
      setErrorNota('Selecciona un estudiante y una nota de la escala AD, A, B o C.');
      return;
    }
    const esModificacion = Boolean(notaExistente);
    setGuardandoNota(true);
    const respuesta = await guardarNotaEvaluacion(
      evaluacionNotas,
      estudianteSeleccionado,
      notaSeleccionada,
      usuario,
      anioVigente
    );
    setGuardandoNota(false);
    if (!respuesta.exitoso) {
      setErrorNota(respuesta.mensaje || 'No se pudo guardar la nota.');
      return;
    }
    setNotas((actuales) => [
      ...actuales.filter((nota) => String(nota.estudianteId) !== String(respuesta.datos.estudianteId)),
      respuesta.datos
    ]);
    setAvisoNota(esModificacion ? 'La nota se actualizó correctamente.' : 'La nota se registró correctamente.');
  }

  async function abrirFormularioCompetencias() {
    setFormCompetenciasAbierto(true);
    setErrorCompetencias('');
    setAvisoCompetencias('');
    setCargandoCompetencias(true);
    const [respuestaEstudiantes, respuestaBimestres] = await Promise.all([
      listarEstudiantesSeccionCompetencias(asignacionSeleccionada?.idAsignacionCurso),
      listarBimestresAnio(contexto.anioAcademico.id)
    ]);
    setCargandoCompetencias(false);
    const error = [respuestaEstudiantes, respuestaBimestres].find((respuesta) => !respuesta.exitoso);
    if (error) {
      setErrorCompetencias(error.mensaje || 'No se pudieron cargar los datos de notas de competencias.');
      return;
    }
    setEstudiantes(respuestaEstudiantes.datos ?? []);
    const bimestresFinalizados = respuestaBimestres.datos.filter((item) => item.finalizado);
    setBimestresFinalizados(bimestresFinalizados);
    setBimestreCompetenciasId(bimestresFinalizados[0]?.id ?? '');
    setEstudianteCompetenciasId('');
    setFormNotasCompetencias([]);
  }

  async function cargarNotasCompetencias(bimestreId, idEstudiante) {
    if (!bimestreId || !idEstudiante || !competencias.length) {
      setFormNotasCompetencias([]);
      return;
    }
    setCargandoCompetencias(true);
    setErrorCompetencias('');
    const respuesta = await listarNotasCompetencias(cursoId, bimestreId, idEstudiante, competencias);
    setCargandoCompetencias(false);
    if (!respuesta.exitoso) {
      setErrorCompetencias(respuesta.mensaje || 'No se pudieron cargar las notas de competencias.');
      return;
    }
    const registradas = respuesta.datos ?? [];
    setFormNotasCompetencias(competencias.map((competencia) => {
      const nota = registradas.find((item) =>
        String(item.competenciaId) === String(competencia.id)
      );
      return {
        competenciaId: competencia.id,
        nombre: competencia.nombre,
        descripcion: competencia.descripcion ?? '',
        nota: nota?.nota ?? '',
        conclusionDescriptiva: nota?.conclusionDescriptiva ?? ''
      };
    }));
  }

  async function guardarNotasCompetenciasFormulario(evento) {
    evento.preventDefault();
    setErrorCompetencias('');
    setAvisoCompetencias('');
    for (const item of formNotasCompetencias) {
      if (!['AD', 'A', 'B', 'C'].includes(item.nota)) {
        setErrorCompetencias(`${item.nombre}: la nota debe ser AD, A, B o C.`);
        return;
      }
      if (!item.conclusionDescriptiva.trim()) {
        setErrorCompetencias(`${item.nombre}: La conclusión descriptiva es obligatoria.`);
        return;
      }
      if (item.conclusionDescriptiva.trim().length > 120) {
        setErrorCompetencias(`${item.nombre}: La conclusión descriptiva no puede superar los 120 caracteres.`);
        return;
      }
    }
    const bimestre = bimestresFinalizados.find((item) => String(item.id) === String(bimestreCompetenciasId));
    setGuardandoCompetencias(true);
    const respuesta = await guardarNotasCompetencias(usuario, {
      idAsignacionCurso: asignacionSeleccionada?.idAsignacionCurso,
      idEstudiante: estudianteCompetenciasId,
      idBimestre: bimestreCompetenciasId,
      idCurso: cursoId,
      idSeccion: seccionId,
      estudianteNombre: estudianteCompetencias?.nombre,
      bimestreNombre: bimestre?.nombre,
      cursoNombre: asignacion?.cursoNombre,
      calificaciones: formNotasCompetencias.map((item) => ({
        idCompetencia: item.competenciaId,
        nombre: item.nombre,
        valorNota: item.nota,
        conclusionDescriptiva: item.conclusionDescriptiva
      }))
    });
    setGuardandoCompetencias(false);
    if (!respuesta.exitoso) {
      setErrorCompetencias(respuesta.mensaje || 'No se pudieron guardar las notas de competencias.');
      return;
    }
    setAvisoCompetencias('Las notas de competencias y conclusiones se guardaron correctamente.');
  }

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.sobretitulo}>Gestión académica</p>
        <h1 className={estilos.titulo}>Evaluaciones</h1>
        <p className={estilos.descripcion}>Registra evaluaciones para tus cursos y secciones del año académico vigente.</p>
      </header>

      {estado === 'cargando' && <div className={estilos.estado}><EstadoConsulta tipo="carga" /></div>}
      {estado === 'error' && <div className={estilos.estado}><p role="alert">{errorCarga}</p><button type="button" onClick={cargar}>Reintentar</button></div>}
      {estado === 'listo' && (
        <>
          <section className={estilos.panel} aria-labelledby="contexto-evaluacion-titulo">
            <div className={estilos.panelCabecera}>
              <div>
                <h2 id="contexto-evaluacion-titulo">Mis cursos y secciones</h2>
                <p>Docente: <strong>{contexto?.docente?.nombre ?? usuario?.nombre}</strong> · Año académico: <strong>{contexto?.anioAcademico?.anio}</strong></p>
              </div>
              <span className={estilos.etiquetaAnio}>Año vigente</span>
            </div>
            {!contexto?.asignaciones?.length ? (
              <p className={estilos.vacio}>No tienes cursos y secciones asignados en el año académico vigente.</p>
            ) : (
              <div className={estilos.selectores}>
                <label>Curso
                  <select value={cursoId} onChange={(evento) => seleccionarCurso(evento.target.value)}>
                    {contexto.asignaciones.map((item) => <option key={item.cursoId} value={item.cursoId}>{item.cursoNombre} · {item.secciones[0]?.gradoNombre}</option>)}
                  </select>
                </label>
                <label>Sección
                  <select value={seccionId} onChange={(evento) => { setSeccionId(evento.target.value); setFormularioAbierto(false); }}>
                    {secciones.map((item) => <option key={item.id} value={item.id}>{item.gradoNombre} · Sección {item.nombre}</option>)}
                  </select>
                </label>
                <button type="button" className={estilos.botonPrimario} onClick={abrirFormulario} disabled={!asignacion || !seccion || contexto.anioAcademico?.vigente === false}>Crear evaluación</button>
                <button type="button" className={estilos.botonSecundario} onClick={abrirFormularioCompetencias} disabled={!asignacion || !seccion || contexto.anioAcademico?.vigente === false}>Registrar notas de competencias</button>
              </div>
            )}
          </section>

          {asignacion && seccion && (
            <section className={estilos.panel} aria-labelledby="lista-evaluaciones-titulo">
              <div className={estilos.panelCabecera}>
                <div><h2 id="lista-evaluaciones-titulo">{asignacion.cursoNombre} · {seccion.gradoNombre} {seccion.nombre}</h2><p>Evaluaciones registradas para esta sección.</p></div>
                <span className={estilos.contador}>{evaluacionesVisibles.length}</span>
              </div>

              {formularioAbierto && (
                <form className={estilos.formulario} onSubmit={guardar} noValidate>
                  <h3>Nueva evaluación</h3>
                  <div className={estilos.datosRelacionados}>
                    <span><small>Grado y sección</small>{seccion.gradoNombre} · {seccion.nombre}</span>
                    <span><small>Curso</small>{asignacion.cursoNombre}</span>
                    <span><small>Docente</small>{contexto.docente.nombre}</span>
                    <span><small>Año académico</small>{contexto.anioAcademico.anio}</span>
                  </div>

                  {!competencias.length ? (
                    <div className={estilos.alerta} role="alert">Este curso aún no tiene competencias establecidas. Solicita que se configuren en el módulo Cursos antes de crear evaluaciones.</div>
                  ) : (
                    <div className={estilos.campos}>
                      <label className={estilos.anchoCompleto}>Nombre de la evaluación <span aria-hidden="true">*</span>
                        <input maxLength={160} value={formulario.nombre} onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })} aria-invalid={Boolean(errores.nombre)} aria-describedby={errores.nombre ? 'error-nombre' : undefined} />
                        {errores.nombre && <small id="error-nombre" className={estilos.error}>{errores.nombre}</small>}
                      </label>
                      <label className={estilos.anchoCompleto}>Descripción <span aria-hidden="true">*</span>
                        <textarea maxLength={1000} rows="3" value={formulario.descripcion} onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })} aria-invalid={Boolean(errores.descripcion)} aria-describedby={errores.descripcion ? 'error-descripcion' : undefined} />
                        {errores.descripcion && <small id="error-descripcion" className={estilos.error}>{errores.descripcion}</small>}
                      </label>
                      <label>Fecha <span aria-hidden="true">*</span>
                        <input type="date" value={formulario.fecha} onChange={(evento) => setFormulario({ ...formulario, fecha: evento.target.value })} aria-invalid={Boolean(errores.fecha)} aria-describedby={errores.fecha ? 'error-fecha' : 'ayuda-fecha'} />
                        {errores.fecha ? <small id="error-fecha" className={estilos.error}>{errores.fecha}</small> : <small id="ayuda-fecha">Debe corresponder a un bimestre vigente.</small>}
                      </label>
                      <label>Competencia <span aria-hidden="true">*</span>
                        <select value={formulario.competenciaId} onChange={(evento) => setFormulario({ ...formulario, competenciaId: evento.target.value })} aria-invalid={Boolean(errores.competenciaId)} aria-describedby={errores.competenciaId ? 'error-competencia' : undefined}>
                          <option value="">Selecciona una competencia</option>
                          {competencias.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                        </select>
                        {errores.competenciaId && <small id="error-competencia" className={estilos.error}>{errores.competenciaId}</small>}
                      </label>
                      <div className={estilos.campoBimestre}><span>Bimestre asignado</span><strong>{bimestreFecha?.nombre ?? 'Se determinará según la fecha'}</strong></div>
                    </div>
                  )}
                  <div className={estilos.acciones}>
                    <button type="button" className={estilos.botonSecundario} onClick={() => setFormularioAbierto(false)}>Cancelar</button>
                    <button type="submit" className={estilos.botonPrimario} disabled={guardando || competencias.length === 0}>{guardando ? 'Guardando…' : 'Guardar evaluación'}</button>
                  </div>
                </form>
              )}

              {aviso && <p className={estilos.aviso} role="status">{aviso}</p>}
              {formCompetenciasAbierto && (
                <section className={estilos.panelNotas} aria-labelledby="notas-competencias-titulo">
                  <div className={estilos.panelCabecera}>
                    <div><h2 id="notas-competencias-titulo">Registrar notas de competencias</h2><p>{asignacion?.cursoNombre} · {seccion?.gradoNombre} {seccion?.nombre} · {contexto.docente.nombre}</p></div>
                    <button type="button" className={estilos.botonSecundario} onClick={() => setFormCompetenciasAbierto(false)}>Cerrar</button>
                  </div>
                  <div className={estilos.formularioNota}>
                    <label>Bimestre finalizado
                      <select value={bimestreCompetenciasId} onChange={(evento) => {
                        setBimestreCompetenciasId(evento.target.value);
                        cargarNotasCompetencias(evento.target.value, estudianteCompetenciasId);
                      }} disabled={cargandoCompetencias || !bimestresFinalizados.length}>
                        {bimestresFinalizados.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                      </select>
                    </label>
                    <label>Estudiante
                      <select value={estudianteCompetenciasId} onChange={(evento) => {
                        setEstudianteCompetenciasId(evento.target.value);
                        cargarNotasCompetencias(bimestreCompetenciasId, evento.target.value);
                      }} disabled={cargandoCompetencias || !estudiantes.length}>
                        <option value="">Selecciona un estudiante</option>
                        {estudiantes.map((item) => <option key={item.id} value={item.id}>{item.nombre}{item.codigo ? ` · ${item.codigo}` : ''}</option>)}
                      </select>
                    </label>
                  </div>
                  {cargandoCompetencias && <p className={estilos.vacio}>Cargando bimestres o notas…</p>}
                  {!cargandoCompetencias && !bimestresFinalizados.length && <p className={estilos.alerta}>Las notas de competencias se registran una vez finalizado el bimestre</p>}
                  {!cargandoCompetencias && !competencias.length && <p className={estilos.alerta}>Este curso aún no tiene competencias establecidas.</p>}
                  {!cargandoCompetencias && estudianteCompetenciasId && formNotasCompetencias.length > 0 && (
                    <form className={estilos.formularioCompetencias} onSubmit={guardarNotasCompetenciasFormulario}>
                      {formNotasCompetencias.map((item, indice) => (
                        <fieldset className={estilos.competenciaNota} key={item.competenciaId}>
                          <legend>{item.nombre}</legend>
                          {item.descripcion && <p>{item.descripcion}</p>}
                          <label>Nota
                            <select value={item.nota} onChange={(evento) => setFormNotasCompetencias((actuales) => actuales.map((actual, posicion) => posicion === indice ? { ...actual, nota: evento.target.value } : actual))}>
                              <option value="">Selecciona una nota</option>
                              {['AD', 'A', 'B', 'C'].map((nota) => <option key={nota} value={nota}>{nota}</option>)}
                            </select>
                          </label>
                          <label>Conclusión descriptiva (máximo 120 caracteres)
                            <textarea maxLength={120} rows={3} value={item.conclusionDescriptiva} onChange={(evento) => setFormNotasCompetencias((actuales) => actuales.map((actual, posicion) => posicion === indice ? { ...actual, conclusionDescriptiva: evento.target.value } : actual))} />
                            <small>{item.conclusionDescriptiva.trim().length}/120 caracteres</small>
                          </label>
                        </fieldset>
                      ))}
                      {errorCompetencias && <p className={estilos.errorNota} role="alert">{errorCompetencias}</p>}
                      {avisoCompetencias && <p className={estilos.aviso} role="status">{avisoCompetencias}</p>}
                      <div className={estilos.acciones}>
                        <button type="submit" className={estilos.botonPrimario} disabled={guardandoCompetencias || bimestreBloqueado}>{guardandoCompetencias ? 'Guardando…' : 'Guardar notas de competencias'}</button>
                      </div>
                    </form>
                  )}
                  {errorCompetencias && !formNotasCompetencias.length && <p className={estilos.errorNota} role="alert">{errorCompetencias}</p>}
                  {!estudiantes.length && !cargandoCompetencias && <p className={estilos.vacio}>No hay estudiantes activos con matrícula confirmada en esta sección.</p>}
                </section>
              )}
              {evaluacionesVisibles.length === 0 ? <p className={estilos.vacio}>Todavía no hay evaluaciones registradas para esta sección.</p> : (
                <ul className={estilos.lista}>
                  {evaluacionesVisibles.map((item) => {
                    const vigente = esAnioVigente(item);
                    return <li key={item.id}>
                      <div className={estilos.evaluacionResumen}>
                        <div><h3>{item.nombre}</h3><p>{item.descripcion}</p><small>{item.competenciaNombre}</small></div>
                        <div className={estilos.detalleEvaluacion}><strong>{item.bimestreNombre}</strong><span>{item.fecha}</span><small>Creada por {item.docenteCreadorNombre ?? 'Docente'}</small></div>
                        <button type="button" className={estilos.botonSecundario} onClick={() => abrirNotas(item)} disabled={!vigente}>
                          {vigente ? 'Registrar / modificar notas' : 'Registro de notas bloqueado'}
                        </button>
                      </div>
                      {!vigente && <small className={estilos.mensajeAnio}>Las notas de las evaluaciones solo se registran con el año académico vigente</small>}
                    </li>;
                  })}
                </ul>
              )}

              {evaluacionNotas && (
                <section className={estilos.panelNotas} aria-labelledby="registro-notas-titulo">
                  <div className={estilos.panelCabecera}>
                    <div><h2 id="registro-notas-titulo">Notas: {evaluacionNotas.nombre}</h2><p>{evaluacionNotas.descripcion}</p></div>
                    <button type="button" className={estilos.botonSecundario} onClick={() => setEvaluacionNotas(null)}>Cerrar</button>
                  </div>
                  <div className={estilos.datosRelacionados}>
                    <span><small>Grado y sección</small>{seccion?.gradoNombre} · {seccion?.nombre}</span>
                    <span><small>Curso</small>{asignacion?.cursoNombre}</span>
                    <span><small>Docente</small>{contexto.docente.nombre}</span>
                    <span><small>Competencia y fecha</small>{evaluacionNotas.competenciaNombre} · {evaluacionNotas.fecha}</span>
                  </div>

                  {cargandoNotas ? <p className={estilos.vacio}>Cargando estudiantes…</p> : errorNota ? <p role="alert" className={estilos.errorNota}>{errorNota}</p> : (
                    <>
                      {!estudiantes.length ? <p className={estilos.vacio}>No hay estudiantes activos con matrícula confirmada en esta sección.</p> : (
                        <form className={estilos.formularioNota} onSubmit={guardarNota}>
                          <label>Estudiante
                            <select value={estudianteId} onChange={(evento) => seleccionarEstudiante(evento.target.value)}>
                              {estudiantes.map((item) => <option key={item.id} value={item.id}>{item.nombre}{item.codigo ? ` · ${item.codigo}` : ''}</option>)}
                            </select>
                          </label>
                          <label>Nota
                            <select value={notaSeleccionada} onChange={(evento) => setNotaSeleccionada(evento.target.value)}>
                              <option value="">Selecciona una nota</option>
                              {['AD', 'A', 'B', 'C'].map((nota) => <option key={nota} value={nota}>{nota}</option>)}
                            </select>
                          </label>
                          {notaExistente && <p className={estilos.notaActual}>Nota actual: <strong>{notaExistente.nota}</strong>. Puedes cambiarla y guardar para actualizarla.</p>}
                          <button type="submit" className={estilos.botonPrimario} disabled={guardandoNota || !estudianteId || !notaSeleccionada}>
                            {guardandoNota ? 'Guardando…' : notaExistente ? 'Actualizar nota' : 'Guardar nota'}
                          </button>
                        </form>
                      )}
                      {errorNota && <p role="alert" className={estilos.errorNota}>{errorNota}</p>}
                      {avisoNota && <p role="status" className={estilos.aviso}>{avisoNota}</p>}
                      {notas.length > 0 && <div className={estilos.tablaNotas}>
                        <h3>Notas registradas</h3>
                        <ul>{notas.map((nota) => <li key={nota.estudianteId}><span>{nota.estudianteNombre}</span><strong>{nota.nota}</strong></li>)}</ul>
                      </div>}
                    </>
                  )}
                </section>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
