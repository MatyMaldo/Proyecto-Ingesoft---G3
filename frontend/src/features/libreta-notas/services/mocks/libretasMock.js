const LIBRETAS_ESTUDIANTE = [
  {
    id: 'LIB-EST-001-B3-2026',
    estudiante: { id: 'EST-001', nombre: 'María López García', codigo: 'EST-001' },
    anioAcademico: 2026,
    bimestreId: 'B3',
    bimestre: 'III Bimestre',
    generadaEn: '2026-10-05T10:00:00-05:00',
    cursos: [
      {
        nombre: 'Matemáticas',
        grado: '1.° de secundaria',
        seccion: 'A',
        docente: 'Prof. Quispe',
        competencias: [
          { nombre: 'Resuelve problemas de cantidad', nota: 'A', conclusionDescriptiva: 'Resuelve situaciones con números naturales y explica los procedimientos que utiliza.' }
        ]
      },
      {
        nombre: 'Comunicación',
        grado: '1.° de secundaria',
        seccion: 'A',
        docente: 'Prof. García',
        competencias: [
          { nombre: 'Lee diversos tipos de textos en lengua materna', nota: 'AD', conclusionDescriptiva: 'Comprende textos de distintos formatos e interpreta información explícita e implícita.' }
        ]
      }
    ],
    asistencia: { inasistencias: 1, tardanzas: 2 },
    comentariosTutor: 'María demuestra responsabilidad y participa activamente en las actividades del aula.'
  },
  {
    id: 'LIB-EST-001-B2-2026',
    estudiante: { id: 'EST-001', nombre: 'María López García', codigo: 'EST-001' },
    anioAcademico: 2026,
    bimestreId: 'B2',
    bimestre: 'II Bimestre',
    generadaEn: '2026-07-24T10:00:00-05:00',
    cursos: [
      {
        nombre: 'Matemáticas',
        grado: '1.° de secundaria',
        seccion: 'A',
        docente: 'Prof. Quispe',
        competencias: [
          { nombre: 'Resuelve problemas de cantidad', nota: 'B', conclusionDescriptiva: 'Resuelve ejercicios de cantidad y se recomienda continuar practicando estrategias de cálculo.' }
        ]
      },
      {
        nombre: 'Comunicación',
        grado: '1.° de secundaria',
        seccion: 'A',
        docente: 'Prof. García',
        competencias: [
          { nombre: 'Lee diversos tipos de textos en lengua materna', nota: 'A', conclusionDescriptiva: 'Identifica las ideas principales y sustenta sus respuestas con información del texto.' }
        ]
      }
    ],
    asistencia: { inasistencias: 0, tardanzas: 1 },
    comentariosTutor: 'Buen avance durante el bimestre. Mantiene una convivencia positiva con sus compañeros.'
  }
];

export async function listarLibretasEstudianteMock(usuario, estudianteId = usuario?.id) {
  await new Promise((resolver) => setTimeout(resolver, 180));
  const estudianteAutorizado = usuario?.rol === 'ESTUDIANTE'
    ? String(usuario.id) === String(estudianteId)
    : usuario?.rol === 'APODERADO'
      && String(usuario.id) === 'APO-001'
      && ['EST-001', 'EST-003'].includes(String(estudianteId));
  if (!estudianteAutorizado) {
    return { exitoso: false, datos: null, mensaje: 'No tienes permiso para consultar las libretas de este estudiante.' };
  }
  if (String(estudianteId) !== 'EST-001') {
    return { exitoso: true, datos: [], mensaje: '' };
  }
  return {
    exitoso: true,
    datos: structuredClone(LIBRETAS_ESTUDIANTE),
    mensaje: ''
  };
}
