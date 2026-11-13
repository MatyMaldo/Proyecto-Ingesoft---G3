import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  crearEvaluacionMock,
  guardarNotaEvaluacionMock,
  listarContextoDocenteMock,
  listarEstudiantesAsignacionMock,
  listarBimestresAnioMock,
  listarNotasEvaluacionMock,
  listarNotasCompetenciasMock,
  guardarNotasCompetenciasMock,
  listarEvaluacionesMock
} from './mocks/evaluacionesMock.js';

export const ESCALA_NOTAS_EVALUACION = Object.freeze(['AD', 'A', 'B', 'C']);
export const LONGITUD_MAXIMA_CONCLUSION_COMPETENCIA = 120;

const fallo = (mensaje) => ({ exitoso: false, datos: null, mensaje });
const NOMBRES_BIMESTRE = {
  BIM_1: 'I Bimestre',
  BIM_2: 'II Bimestre',
  BIM_3: 'III Bimestre',
  BIM_4: 'IV Bimestre'
};

function normalizarContexto(contexto, usuario) {
  const competencias = contexto.competencias ?? [];
  const asignaciones = (contexto.asignaciones ?? []).reduce((resultado, item) => {
    let curso = resultado.find((actual) => String(actual.cursoId) === String(item.idCurso));
    if (!curso) {
      curso = {
        cursoId: item.idCurso,
        cursoNombre: item.nombreCurso,
        gradoId: item.idGrado,
        competencias: competencias
          .filter((competencia) => String(competencia.idCurso) === String(item.idCurso))
          .map((competencia) => ({ id: competencia.id, nombre: competencia.nombre })),
        secciones: []
      };
      resultado.push(curso);
    }
    curso.secciones.push({
      id: item.idSeccion,
      idAsignacionCurso: item.idAsignacionCurso,
      nombre: item.nombreSeccion,
      gradoId: item.idGrado,
      gradoNombre: item.nombreGrado
    });
    return resultado;
  }, []);

  return {
    docente: { id: usuario?.id, nombre: usuario?.nombre ?? 'Docente' },
    anioAcademico: {
      ...contexto.anioAcademico,
      vigente: contexto.anioAcademico?.vigente ?? true
    },
    asignaciones,
    secciones: contexto.secciones ?? [],
    competencias,
    bimestres: (contexto.bimestres ?? []).map((bimestre) => ({
      ...bimestre,
      inicio: bimestre.fechaInicio ?? bimestre.inicio,
      fin: bimestre.fechaFin ?? bimestre.fin
    }))
  };
}

function normalizarEvaluacion(evaluacion, asignacion, anioAcademico) {
  return {
    ...evaluacion,
    id: evaluacion.id ?? evaluacion.idEvaluacion,
    cursoId: asignacion.cursoId,
    cursoNombre: evaluacion.nombreCurso ?? asignacion.cursoNombre,
    seccionId: asignacion.seccionId,
    seccionNombre: evaluacion.nombreSeccion ?? asignacion.seccionNombre,
    competenciaNombre: evaluacion.nombreCompetencia,
    bimestreNombre: evaluacion.nombreBimestre,
    idAsignacionCurso: asignacion.idAsignacionCurso,
    anioAcademicoId: anioAcademico?.id,
    anioAcademico: anioAcademico?.anio
  };
}

function normalizarNota(nota) {
  return {
    ...nota,
    idNota: nota.idNota ?? nota.id,
    evaluacionId: nota.idEvaluacion ?? nota.evaluacionId,
    estudianteId: nota.idEstudiante ?? nota.estudianteId,
    estudianteNombre: nota.nombreEstudiante ?? nota.estudianteNombre,
    nota: nota.valorNota ?? nota.nota
  };
}

function normalizarNotasCompetencias(respuesta, competencias) {
  if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) return respuesta;
  return {
    ...respuesta,
    datos: respuesta.datos.map((nota) => {
      const competenciasConNombre = competencias.filter((item) =>
        String(item.nombre) === String(nota.nombreCompetencia)
      );
      const competencia = nota.idCompetencia == null && competenciasConNombre.length === 1
        ? competenciasConNombre[0]
        : undefined;
      return {
        ...nota,
        competenciaId: nota.idCompetencia ?? competencia?.id,
        nombre: nota.nombreCompetencia ?? competencia?.nombre,
        nota: nota.valorNota ?? nota.nota
      };
    })
  };
}

/** El backend limita el contexto al docente autenticado y al año académico vigente. */
export async function listarContextoDocenteEvaluaciones(usuario) {
  const respuesta = USAR_MOCK
    ? await listarContextoDocenteMock(usuario)
    : await solicitar('/evaluaciones/contexto-docente');
  if (!respuesta.exitoso) return respuesta;
  if (!respuesta.datos?.anioAcademico
    || !Array.isArray(respuesta.datos.asignaciones)
    || !Array.isArray(respuesta.datos.bimestres)
    || !Array.isArray(respuesta.datos.competencias)) {
    return fallo('El backend devolvió un formato de contexto docente no válido.');
  }
  return { ...respuesta, datos: normalizarContexto(respuesta.datos, usuario) };
}

export async function listarBimestresAnio(anioId) {
  const respuesta = USAR_MOCK
    ? await listarBimestresAnioMock(anioId)
    : await solicitar(`/anios-academicos/${encodeURIComponent(anioId)}/bimestres`);
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) {
    return fallo('El backend devolvió un formato de bimestres no válido.');
  }
  return {
    ...respuesta,
    datos: respuesta.datos.map((bimestre) => ({
      ...bimestre,
      nombre: NOMBRES_BIMESTRE[bimestre.nombre] ?? bimestre.nombre,
      inicio: bimestre.fechaInicio ?? bimestre.inicio,
      fin: bimestre.fechaFin ?? bimestre.fin
    }))
  };
}

export async function listarEvaluaciones(idAsignacionCurso, asignacion, anioAcademico) {
  const respuesta = USAR_MOCK
    ? await listarEvaluacionesMock(idAsignacionCurso)
    : await solicitar('/evaluaciones', {
      parametros: { idAsignacionCurso }
    });
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) {
    return fallo('El backend devolvió un formato de evaluaciones no válido.');
  }
  return {
    ...respuesta,
    datos: respuesta.datos.map((item) => normalizarEvaluacion(item, asignacion, anioAcademico))
  };
}

export async function listarEstudiantesAsignacion(idAsignacionCurso) {
  const respuesta = USAR_MOCK
    ? await listarEstudiantesAsignacionMock(idAsignacionCurso)
    : await solicitar(`/asignaciones-curso/${encodeURIComponent(idAsignacionCurso)}/estudiantes`);
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) {
    return fallo('El backend devolvió un formato de estudiantes no válido.');
  }
  return {
    ...respuesta,
    datos: respuesta.datos
      .filter((estudiante) => estudiante.estadoMatricula === 'CONFIRMADA')
      .map((estudiante) => ({
        ...estudiante,
        id: estudiante.idEstudiante ?? estudiante.id,
        nombre: [estudiante.nombre, estudiante.apellidoPaterno, estudiante.apellidoMaterno]
          .filter(Boolean)
          .join(' '),
        codigo: estudiante.codigo ?? '',
        activo: true
      }))
  };
}

export function listarEstudiantesSeccionCompetencias(idAsignacionCurso) {
  return listarEstudiantesAsignacion(idAsignacionCurso);
}

export async function listarNotasCompetencias(cursoId, bimestreId, estudianteId, competencias) {
  const respuesta = USAR_MOCK
    ? await listarNotasCompetenciasMock(cursoId, bimestreId, estudianteId)
    : await solicitar('/notas-competencias', {
      parametros: { idEstudiante: estudianteId, idBimestre: bimestreId, idCurso: cursoId }
    });
  if (respuesta.exitoso && !Array.isArray(respuesta.datos)) {
    return fallo('El backend devolvió un formato de notas de competencias no válido.');
  }
  return normalizarNotasCompetencias(respuesta, competencias);
}

export function guardarNotasCompetencias(usuario, datos) {
  const calificaciones = Array.isArray(datos?.calificaciones) ? datos.calificaciones : [];
  if (!datos.idAsignacionCurso || !datos.idEstudiante || !datos.idBimestre || !calificaciones.length) {
    return Promise.resolve(fallo('Selecciona una asignación, un estudiante, un bimestre y al menos una competencia.'));
  }
  for (const calificacion of calificaciones) {
    if (!ESCALA_NOTAS_EVALUACION.includes(calificacion.valorNota)) {
      return Promise.resolve(fallo(`La nota de "${calificacion.nombre}" debe ser AD, A, B o C.`));
    }
    const conclusion = String(calificacion.conclusionDescriptiva ?? '').trim();
    if (!conclusion) {
      return Promise.resolve(fallo(`${calificacion.nombre}: La conclusión descriptiva es obligatoria.`));
    }
    if (conclusion.length > LONGITUD_MAXIMA_CONCLUSION_COMPETENCIA) {
      return Promise.resolve(fallo(`${calificacion.nombre}: La conclusión descriptiva no puede superar los 120 caracteres.`));
    }
  }
  const cuerpo = {
    idAsignacionCurso: USAR_MOCK ? datos.idAsignacionCurso : Number(datos.idAsignacionCurso),
    idEstudiante: USAR_MOCK ? datos.idEstudiante : Number(datos.idEstudiante),
    idBimestre: USAR_MOCK ? datos.idBimestre : Number(datos.idBimestre),
    calificaciones: calificaciones.map(({ nombre, ...item }) => ({
      ...item,
      idCompetencia: USAR_MOCK ? item.idCompetencia : Number(item.idCompetencia),
      conclusionDescriptiva: item.conclusionDescriptiva.trim()
    }))
  };
  return USAR_MOCK
    ? guardarNotasCompetenciasMock(usuario, {
      ...cuerpo,
      calificaciones: cuerpo.calificaciones.map((item, index) => ({
        ...item,
        nombre: calificaciones[index].nombre
      })),
      idCurso: datos.idCurso,
      idSeccion: datos.idSeccion,
      cursoNombre: datos.cursoNombre,
      estudianteNombre: datos.estudianteNombre,
      bimestreNombre: datos.bimestreNombre
    })
    : solicitar('/notas-competencias', { metodo: 'POST', cuerpo });
}

/** Solo devuelve alumnos activos cuya matrícula confirmada corresponde a la sección evaluada. */
export async function listarEstudiantesEvaluacion(evaluacion) {
  return listarEstudiantesAsignacion(evaluacion.idAsignacionCurso);
}

export async function listarNotasEvaluacion(evaluacion) {
  const respuesta = USAR_MOCK
    ? await listarNotasEvaluacionMock(evaluacion.id)
    : await solicitar(`/evaluaciones/${encodeURIComponent(evaluacion.id)}/notas`);
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) {
    return fallo('El backend devolvió un formato de notas no válido.');
  }
  return { ...respuesta, datos: respuesta.datos.map(normalizarNota) };
}

function evaluacionEsDelAnioVigente(evaluacion, anioVigente) {
  if (evaluacion.anioAcademicoId != null && anioVigente?.id != null) {
    return String(evaluacion.anioAcademicoId) === String(anioVigente.id);
  }
  return String(evaluacion.anioAcademico) === String(anioVigente?.anio);
}

export function guardarNotaEvaluacion(evaluacion, estudiante, valorNota, usuario, anioVigente) {
  if (!ESCALA_NOTAS_EVALUACION.includes(valorNota)) {
    return Promise.resolve(fallo('La nota debe ser uno de los valores permitidos: AD, A, B o C.'));
  }
  if (!evaluacionEsDelAnioVigente(evaluacion, anioVigente)) {
    return Promise.resolve(fallo('Las notas de las evaluaciones solo se registran con el año académico vigente.'));
  }
  const cuerpo = {
    idEstudiante: USAR_MOCK ? estudiante.id : Number(estudiante.id),
    valorNota
  };
  const respuesta = USAR_MOCK
    ? guardarNotaEvaluacionMock(evaluacion, estudiante, valorNota, usuario)
    : solicitar(`/evaluaciones/${encodeURIComponent(evaluacion.id)}/notas`, {
      metodo: 'POST',
      cuerpo
    });
  return Promise.resolve(respuesta).then((resultado) => resultado.exitoso
    ? { ...resultado, datos: normalizarNota(resultado.datos) }
    : resultado);
}

export async function crearEvaluacion(datos, asignacion, docente, competencia) {
  const cuerpo = {
    ...datos,
    idCompetencia: USAR_MOCK ? datos.idCompetencia : Number(datos.idCompetencia),
    idAsignacionCurso: USAR_MOCK ? datos.idAsignacionCurso : Number(datos.idAsignacionCurso)
  };
  const respuesta = USAR_MOCK
    ? await crearEvaluacionMock({
      ...cuerpo,
      cursoId: asignacion.cursoId,
      cursoNombre: asignacion.cursoNombre,
      seccionId: asignacion.seccionId,
      seccionNombre: asignacion.seccionNombre,
      anioAcademicoId: asignacion.anioAcademico?.id,
      anioAcademico: asignacion.anioAcademico?.anio,
      nombreCompetencia: competencia?.nombre,
      nombreCurso: asignacion.cursoNombre,
      nombreSeccion: asignacion.seccionNombre
    }, docente, asignacion)
    : await solicitar('/evaluaciones', { metodo: 'POST', cuerpo });
  if (!respuesta.exitoso) return respuesta;
  return {
    ...respuesta,
    datos: normalizarEvaluacion(respuesta.datos, asignacion, asignacion.anioAcademico)
  };
}
