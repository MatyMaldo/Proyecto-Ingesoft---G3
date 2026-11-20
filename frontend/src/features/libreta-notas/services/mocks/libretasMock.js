import {
  listarContextoDocenteMock,
  listarEstudiantesAsignacionMock,
  listarBimestresAnioMock,
  listarNotasCompetenciasMock
} from '../../../evaluaciones/services/mocks/evaluacionesMock.js';
import { consultarEstructuraMock } from '../../../grados-secciones/services/mocks/estructuraEscolarMock.js';

const ANIOS_ACADEMICOS = [{ id: 1, anio: 2026 }];

const LIBRETAS = [
  {
    idLibreta: 1,
    idEstudiante: 'EST-001',
    anioAcademico: 2026,
    nombreBimestre: 'BIM_3',
    fechaGeneracion: '2026-10-05',
    comentariosFinalesTutor: 'María demuestra responsabilidad y participa activamente en las actividades del aula.',
    notasCompetencias: [
      {
        nombreCurso: 'Matemáticas',
        nombreCompetencia: 'Resuelve problemas de cantidad',
        valorNota: 'A',
        descripcion: 'Logro esperado',
        conclusionDescriptiva: 'Resuelve situaciones con números naturales y explica los procedimientos que utiliza.'
      },
      {
        nombreCurso: 'Comunicación',
        nombreCompetencia: 'Lee diversos tipos de textos en lengua materna',
        valorNota: 'AD',
        descripcion: 'Logro destacado',
        conclusionDescriptiva: 'Comprende textos de distintos formatos e interpreta información explícita e implícita.'
      }
    ]
  },
  {
    idLibreta: 2,
    idEstudiante: 'EST-001',
    anioAcademico: 2026,
    nombreBimestre: 'BIM_2',
    fechaGeneracion: '2026-07-24',
    comentariosFinalesTutor: 'Buen avance durante el bimestre.',
    notasCompetencias: [
      {
        nombreCurso: 'Matemáticas',
        nombreCompetencia: 'Resuelve problemas de cantidad',
        valorNota: 'B',
        descripcion: 'En proceso',
        conclusionDescriptiva: 'Se recomienda continuar practicando estrategias de cálculo.'
      },
      {
        nombreCurso: 'Comunicación',
        nombreCompetencia: 'Lee diversos tipos de textos en lengua materna',
        valorNota: 'A',
        descripcion: 'Logro esperado',
        conclusionDescriptiva: 'Identifica las ideas principales y sustenta sus respuestas con información del texto.'
      }
    ]
  }
];

const BIMESTRE_A_NUMERO = (bimestre) => Number(String(bimestre?.nombre ?? bimestre?.id).replace(/\D/g, ''));
const BIMESTRE_A_CLAVE = (bimestre) => `BIM_${BIMESTRE_A_NUMERO(bimestre)}`;

async function obtenerContextoTutor(usuario) {
  const [respuestaContexto, respuestaEstructura, respuestaBimestres] = await Promise.all([
    listarContextoDocenteMock(usuario),
    consultarEstructuraMock(),
    listarBimestresAnioMock()
  ]);
  const error = [respuestaContexto, respuestaEstructura, respuestaBimestres]
    .find((respuesta) => !respuesta.exitoso);
  if (error) return error;
  const anio = respuestaContexto.datos.anioAcademico;
  const seccion = respuestaEstructura.datos.secciones.find((item) =>
    String(item.anioAcademicoId) === String(anio.id) && String(item.tutorId) === String(usuario?.id));
  if (!seccion) return { exitoso: true, datos: { anio, seccion: null, estudiantes: [], bimestres: [] }, mensaje: '' };
  const asignaciones = respuestaContexto.datos.asignaciones.filter((item) => String(item.idSeccion) === String(seccion.id));
  const estudiantesPorId = new Map();
  for (const asignacion of asignaciones) {
    const respuesta = await listarEstudiantesAsignacionMock(asignacion.idAsignacionCurso);
    if (!respuesta.exitoso) return respuesta;
    respuesta.datos.forEach((item) => estudiantesPorId.set(String(item.idEstudiante), {
      id: item.idEstudiante,
      codigo: item.codigo,
      nombre: [item.nombre, item.apellidoPaterno, item.apellidoMaterno].filter(Boolean).join(' ')
    }));
  }
  return {
    exitoso: true,
    datos: {
      anio,
      seccion,
      tutorNombre: respuestaContexto.datos.docente?.nombre ?? usuario?.nombre ?? 'Docente tutor',
      gradoNombre: seccion.gradoNombre ?? respuestaEstructura.datos.grados.find((item) => String(item.id) === String(seccion.gradoId))?.nombre ?? '',
      estudiantes: [...estudiantesPorId.values()],
      asignaciones,
      competencias: respuestaContexto.datos.competencias,
      bimestres: respuestaBimestres.datos.filter((item) => item.finalizado)
    },
    mensaje: ''
  };
}

async function compilarNotasEstudiante(contexto, estudianteId, bimestre) {
  const notas = [];
  const faltantes = [];
  for (const asignacion of contexto.asignaciones) {
    const competencias = contexto.competencias.filter((item) => String(item.idCurso) === String(asignacion.idCurso));
    if (!competencias.length) {
      faltantes.push(`${asignacion.nombreCurso}: el curso aún no tiene competencias establecidas`);
      continue;
    }
    const respuesta = await listarNotasCompetenciasMock(asignacion.idCurso, bimestre.id, estudianteId);
    if (!respuesta.exitoso) return { error: respuesta.mensaje };
    const registradas = respuesta.datos ?? [];
    for (const competencia of competencias) {
      const nota = registradas.find((item) => String(item.idCompetencia) === String(competencia.id));
      if (!nota?.valorNota || !String(nota.conclusionDescriptiva ?? '').trim()) {
        faltantes.push(`${asignacion.nombreCurso}: ${competencia.nombre}`);
      } else {
        notas.push({
          nombreCurso: asignacion.nombreCurso,
          nombreCompetencia: competencia.nombre,
          valorNota: nota.valorNota,
          descripcion: nota.descripcion ?? '',
          conclusionDescriptiva: nota.conclusionDescriptiva
        });
      }
    }
  }
  return { notas, faltantes };
}

/** Contexto, alumnos y estado de generación de las libretas de la sección tutorada. */
export async function listarOpcionesLibretaTutorMock(usuario) {
  const contextoRespuesta = await obtenerContextoTutor(usuario);
  if (!contextoRespuesta.exitoso) return contextoRespuesta;
  const contexto = contextoRespuesta.datos;
  const estudiantes = contexto.estudiantes.map((estudiante) => ({
    idEstudiante: estudiante.id,
    codigo: estudiante.codigo,
    nombre: estudiante.nombre,
    idSeccion: contexto.seccion?.id,
    nombreSeccion: contexto.seccion?.nombre,
    estadoLibretas: contexto.bimestres.map((bimestre) => {
      const existente = LIBRETAS.find((item) => String(item.idEstudiante) === String(estudiante.id)
        && Number(item.anioAcademico) === Number(contexto.anio.anio)
        && item.nombreBimestre === BIMESTRE_A_CLAVE(bimestre));
      return {
        idBimestre: bimestre.id,
        nombreBimestre: BIMESTRE_A_CLAVE(bimestre),
        libretaGenerada: Boolean(existente),
        fechaGeneracion: existente?.fechaGeneracion ?? null
      };
    })
  }));
  return esperar({ exitoso: true, datos: {
    anioAcademico: contexto.anio ? {
      id: contexto.anio.id,
      anio: contexto.anio.anio,
      fechaInicio: contexto.anio.fechaInicio,
      fechaFin: contexto.anio.fechaFin
    } : null,
    estudiantes,
    bimestres: contexto.bimestres.map((bimestre) => ({
      id: bimestre.id,
      nombre: BIMESTRE_A_CLAVE(bimestre),
      fechaInicio: bimestre.inicio,
      fechaFin: bimestre.fin,
      finalizado: bimestre.finalizado
    }))
  }, mensaje: '' });
}

export async function obtenerVistaPreviaLibretaTutorMock(usuario, estudianteId, bimestreId) {
  const respuesta = await obtenerContextoTutor(usuario);
  if (!respuesta.exitoso) return respuesta;
  const contexto = respuesta.datos;
  const estudiante = contexto.estudiantes.find((item) => String(item.id) === String(estudianteId));
  const bimestre = contexto.bimestres.find((item) => String(item.id) === String(bimestreId));
  if (!estudiante || !bimestre) {
    return esperar({ exitoso: false, datos: null, mensaje: 'No se encontró el estudiante o bimestre solicitado.' });
  }
  const compilado = await compilarNotasEstudiante(contexto, estudianteId, bimestre);
  if (compilado.error) {
    return esperar({ exitoso: false, datos: null, mensaje: compilado.error });
  }
  if (compilado.faltantes.length) {
    return esperar({
      exitoso: false,
      datos: null,
      mensaje: 'Faltan notas de competencias para generar la libreta.'
    });
  }
  return esperar({
    exitoso: true,
    datos: {
      idEstudiante: estudiante.id,
      nombreEstudiante: estudiante.nombre,
      idSeccion: contexto.seccion?.id,
      nombreSeccion: contexto.seccion?.nombre,
      nombreTutor: contexto.tutorNombre,
      idBimestre: bimestre.id,
      nombreBimestre: BIMESTRE_A_CLAVE(bimestre),
      anioAcademico: contexto.anio.anio,
      nombreInstitucion: 'Colegio San Marcos',
      inasistencias: String(estudiante.id) === 'EST-001' ? 2 : 0,
      tardanzas: String(estudiante.id) === 'EST-001' ? 1 : 0,
      notasCompetencias: structuredClone(compilado.notas)
    },
    mensaje: ''
  });
}

/** Genera una sola vez la libreta parcial tras validar tutoría, matrícula, bimestre y calificaciones completas. */
export async function generarLibretaTutorMock(usuario, { estudianteId, bimestreId, comentariosFinalesTutor }) {
  const contextoRespuesta = await obtenerContextoTutor(usuario);
  if (!contextoRespuesta.exitoso) return contextoRespuesta;
  const contexto = contextoRespuesta.datos;
  if (!contexto.seccion) return esperar({ exitoso: false, datos: null, mensaje: 'No tienes una sección asignada como tutor.' });
  const estudiante = contexto.estudiantes.find((item) => String(item.id) === String(estudianteId));
  if (!estudiante) return esperar({ exitoso: false, datos: null, mensaje: 'El estudiante no pertenece a tu sección con matrícula confirmada.' });
  const bimestre = contexto.bimestres.find((item) => String(item.id) === String(bimestreId));
  if (!bimestre) return esperar({ exitoso: false, datos: null, mensaje: 'La libreta solo puede generarse al finalizar un bimestre.' });
  const nombreBimestre = BIMESTRE_A_CLAVE(bimestre);
  if (LIBRETAS.some((item) => String(item.idEstudiante) === String(estudianteId)
    && Number(item.anioAcademico) === Number(contexto.anio.anio)
    && item.nombreBimestre === nombreBimestre)) {
    return esperar({ exitoso: false, datos: null, mensaje: 'La libreta de este estudiante y bimestre ya fue generada.' });
  }
  const comentarios = String(comentariosFinalesTutor ?? '').trim();
  if (!comentarios) return esperar({ exitoso: false, datos: null, mensaje: 'Ingresa los comentarios finales del tutor.' });
  const compilado = await compilarNotasEstudiante(contexto, estudianteId, bimestre);
  if (compilado.error) return esperar({ exitoso: false, datos: null, mensaje: compilado.error });
  if (compilado.faltantes.length) {
    return esperar({ exitoso: false, datos: null, mensaje: 'Todavía no se han registrado todas las notas de competencias del curso del estudiante en este bimestre.' });
  }
  const datos = {
    idLibreta: Math.max(0, ...LIBRETAS.map((item) => Number(item.idLibreta) || 0)) + 1,
    idEstudiante: estudiante.id,
    nombreEstudiante: estudiante.nombre,
    codigoEstudiante: estudiante.codigo,
    anioAcademico: contexto.anio.anio,
    nombreBimestre,
    esParcial: true,
    fechaGeneracion: new Date().toISOString().slice(0, 10),
    comentariosFinalesTutor: comentarios,
    notasCompetencias: compilado.notas,
    inasistencias: String(estudiante.id) === 'EST-001' ? 2 : 0,
    tardanzas: String(estudiante.id) === 'EST-001' ? 1 : 0,
    tutorNombre: contexto.tutorNombre,
    gradoNombre: contexto.gradoNombre,
    seccionNombre: contexto.seccion.nombre,
    institucion: 'Colegio San Marcos'
  };
  LIBRETAS.unshift(datos);
  return esperar({ exitoso: true, datos: structuredClone(datos), mensaje: '' });
}

const esperar = (respuesta) => new Promise((resolver) => {
  setTimeout(() => resolver(respuesta), 180);
});

async function estudianteAutorizado(usuario, estudianteId) {
  if (usuario?.rol === 'ESTUDIANTE') return String(usuario.id) === String(estudianteId);
  if (usuario?.rol === 'DOCENTE') {
    const contexto = await obtenerContextoTutor(usuario);
    return contexto.exitoso
      && contexto.datos.estudiantes.some((item) => String(item.id) === String(estudianteId));
  }
  return usuario?.rol === 'APODERADO'
    && String(usuario.id) === 'APO-001'
    && ['EST-001', 'EST-002', 'EST-003', 'EST-004'].includes(String(estudianteId));
}

function errorPermiso(usuario) {
  return {
    exitoso: false,
    datos: null,
    mensaje: usuario?.rol === 'APODERADO'
      ? 'No eres responsable de este estudiante'
      : 'No puedes consultar libretas parciales de otro estudiante'
  };
}

export async function listarAniosAcademicosMock() {
  return esperar({ exitoso: true, datos: structuredClone(ANIOS_ACADEMICOS), mensaje: '' });
}

export async function listarLibretasEstudianteMock(usuario, estudianteId, anioId) {
  if (!(await estudianteAutorizado(usuario, estudianteId))) return errorPermiso(usuario);
  if (Number(anioId) !== 1) {
    return esperar({ exitoso: true, datos: [], mensaje: '' });
  }
  const resumenes = LIBRETAS
    .filter((libreta) => String(libreta.idEstudiante) === String(estudianteId))
    .map(({ notasCompetencias, ...libreta }) => libreta);
  return esperar({ exitoso: true, datos: structuredClone(resumenes), mensaje: '' });
}

export async function obtenerDetalleLibretaMock(usuario, estudianteId, libretaId) {
  if (!(await estudianteAutorizado(usuario, estudianteId))) return errorPermiso(usuario);
  const libreta = LIBRETAS.find((item) => String(item.idLibreta) === String(libretaId)
    && String(item.idEstudiante) === String(estudianteId));
  if (!libreta) {
    return esperar({ exitoso: false, datos: null, mensaje: 'No se encontró la libreta parcial' });
  }
  return esperar({ exitoso: true, datos: structuredClone(libreta), mensaje: '' });
}
