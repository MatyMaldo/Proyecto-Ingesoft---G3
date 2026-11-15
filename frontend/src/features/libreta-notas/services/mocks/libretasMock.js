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

const esperar = (respuesta) => new Promise((resolver) => {
  setTimeout(() => resolver(respuesta), 180);
});

function estudianteAutorizado(usuario, estudianteId) {
  if (usuario?.rol === 'ESTUDIANTE') return String(usuario.id) === String(estudianteId);
  return usuario?.rol === 'APODERADO'
    && String(usuario.id) === 'APO-001'
    && ['EST-001', 'EST-003'].includes(String(estudianteId));
}

function errorPermiso(usuario) {
  return {
    exitoso: false,
    datos: null,
    mensaje: usuario?.rol === 'APODERADO'
      ? 'No eres responsable de este estudiante'
      : 'No puedes consultar libretas de otro estudiante'
  };
}

export async function listarAniosAcademicosMock() {
  return esperar({ exitoso: true, datos: structuredClone(ANIOS_ACADEMICOS), mensaje: '' });
}

export async function listarLibretasEstudianteMock(usuario, estudianteId, anioId) {
  if (!estudianteAutorizado(usuario, estudianteId)) return errorPermiso(usuario);
  if (String(anioId) !== '1' || String(estudianteId) !== 'EST-001') {
    return esperar({ exitoso: true, datos: [], mensaje: '' });
  }
  const resumenes = LIBRETAS
    .filter((libreta) => String(libreta.idEstudiante) === String(estudianteId))
    .map(({ notasCompetencias, ...libreta }) => libreta);
  return esperar({ exitoso: true, datos: structuredClone(resumenes), mensaje: '' });
}

export async function obtenerDetalleLibretaMock(usuario, estudianteId, libretaId) {
  if (!estudianteAutorizado(usuario, estudianteId)) return errorPermiso(usuario);
  const libreta = LIBRETAS.find((item) => String(item.idLibreta) === String(libretaId)
    && String(item.idEstudiante) === String(estudianteId));
  if (!libreta) {
    return esperar({ exitoso: false, datos: null, mensaje: 'No se encontró la libreta' });
  }
  return esperar({ exitoso: true, datos: structuredClone(libreta), mensaje: '' });
}
