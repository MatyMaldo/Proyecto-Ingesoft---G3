import { listarCursosMock } from '../../../cursos/services/mocks/cursosMock.js';
import { listarEvaluacionesMock, listarNotasEvaluacionMock } from './evaluacionesMock.js';

const ANIO_CONSULTA = { id: 1, anio: 2026 };
const BIMESTRES_FINALIZADOS = [
  { id: 'B1', nombre: 'I Bimestre', inicio: '2026-03-09', fin: '2026-05-08' },
  { id: 'B2', nombre: 'II Bimestre', inicio: '2026-05-18', fin: '2026-07-17' },
  { id: 'B3', nombre: 'III Bimestre', inicio: '2026-08-03', fin: '2026-10-02' }
];

const ESTUDIANTES = [
  { id: 'EST-001', nombre: 'María López García', codigo: 'EST-001', activo: true, apoderadoIds: ['APO-001'], seccionId: 1, seccionNombre: 'A' },
  { id: 'EST-002', nombre: 'Carlos Ramírez Soto', codigo: 'EST-002', activo: true, apoderadoIds: [], seccionId: 1, seccionNombre: 'A' },
  { id: 'EST-003', nombre: 'Lucas Torres Vega', codigo: 'EST-003', activo: true, apoderadoIds: ['APO-001'], seccionId: 2, seccionNombre: 'B' },
  { id: 'EST-004', nombre: 'Isabella Flores Ruiz', codigo: 'EST-004', activo: true, apoderadoIds: [], seccionId: 2, seccionNombre: 'B' },
  { id: 'EST-005', nombre: 'Mateo Herrera Campos', codigo: 'EST-005', activo: false, apoderadoIds: [], seccionId: 1, seccionNombre: 'A' }
];

const MATRICULAS_CONFIRMADAS = ESTUDIANTES.flatMap((estudiante) => [
  { estudianteId: estudiante.id, cursoId: 'CUR-0001', seccionId: estudiante.seccionId, estado: 'CONFIRMADA' },
  { estudianteId: estudiante.id, cursoId: 'CUR-0002', seccionId: estudiante.seccionId, estado: 'CONFIRMADA' }
]);

const NOTAS_COMPETENCIA_DEMO = {
  'CUR-0001:COM-0001': { B1: 'A', B2: null, B3: 'B' },
  'CUR-0002:COM-0005': { B1: 'B', B2: null, B3: null }
};

const esperar = () => new Promise((resolver) => setTimeout(resolver, 180));
const copiar = (valor) => structuredClone(valor);
const fallo = (mensaje) => ({ exitoso: false, datos: null, mensaje });

function estudiantePermitido(usuario, estudianteId) {
  if (usuario?.rol === 'ESTUDIANTE') return String(usuario.id) === String(estudianteId);
  return usuario?.rol === 'APODERADO'
    && ESTUDIANTES.some((estudiante) => String(estudiante.id) === String(estudianteId)
      && estudiante.apoderadoIds.some((id) => String(id) === String(usuario.id)));
}

export async function listarEstudiantesBajoCargoMock(usuario) {
  await esperar();
  if (usuario?.rol !== 'APODERADO') return fallo('Esta consulta está disponible para apoderados.');
  const datos = ESTUDIANTES.filter((estudiante) => estudiante.activo
    && estudiante.apoderadoIds.some((id) => String(id) === String(usuario.id)))
    .map(({ id, nombre, codigo }) => ({ id, nombre, codigo, activo: true }));
  return { exitoso: true, datos: copiar(datos), mensaje: '' };
}

export async function listarCursosEstudianteMock(usuario, estudianteId) {
  await esperar();
  if (!estudiantePermitido(usuario, estudianteId)) return fallo('No tienes permiso para consultar los cursos de este estudiante.');
  const estudiante = ESTUDIANTES.find((item) => String(item.id) === String(estudianteId) && item.activo);
  if (!estudiante) return fallo('El estudiante no está activo o no existe.');

  const [respuestaCursos] = await Promise.all([listarCursosMock()]);
  if (!respuestaCursos.exitoso) return respuestaCursos;
  const cursosEstudiante = MATRICULAS_CONFIRMADAS
    .filter((matricula) => String(matricula.estudianteId) === String(estudianteId)
      && matricula.estado === 'CONFIRMADA')
    .map((matricula) => {
      const curso = respuestaCursos.datos.find((item) => String(item.id) === String(matricula.cursoId));
      return curso ? {
        ...curso,
        gradoNombre: '1.° de secundaria',
        seccionId: matricula.seccionId,
        seccionNombre: estudiante.seccionNombre,
        anioAcademico: ANIO_CONSULTA
      } : null;
    })
    .filter(Boolean);
  return { exitoso: true, datos: copiar(cursosEstudiante), mensaje: '' };
}

export async function consultarNotasCursoMock(usuario, estudianteId, cursoId) {
  await esperar();
  if (!estudiantePermitido(usuario, estudianteId)) return fallo('No tienes permiso para consultar las notas de este estudiante.');
  const estudiante = ESTUDIANTES.find((item) => String(item.id) === String(estudianteId) && item.activo);
  const matricula = MATRICULAS_CONFIRMADAS.find((item) => String(item.estudianteId) === String(estudianteId)
    && String(item.cursoId) === String(cursoId) && item.estado === 'CONFIRMADA');
  if (!estudiante || !matricula) return fallo('No existe una matrícula confirmada de este estudiante en el curso.');

  const [respuestaCursos, respuestaEvaluaciones] = await Promise.all([
    listarCursosMock(), listarEvaluacionesMock()
  ]);
  const error = [respuestaCursos, respuestaEvaluaciones].find((respuesta) => !respuesta.exitoso);
  if (error) return error;
  const curso = respuestaCursos.datos.find((item) => String(item.id) === String(cursoId));
  if (!curso) return fallo('No se encontró el curso seleccionado.');

  const evaluaciones = respuestaEvaluaciones.datos.filter((item) => String(item.cursoId) === String(cursoId)
    && String(item.seccionId) === String(estudiante.seccionId)
    && String(item.anioAcademico) === String(ANIO_CONSULTA.anio));
  const evaluacionesConNota = await Promise.all(evaluaciones.map(async (evaluacion) => {
    const respuestaNotas = await listarNotasEvaluacionMock(evaluacion.id);
    if (!respuestaNotas.exitoso) return null;
    const nota = respuestaNotas.datos.find((item) => String(item.estudianteId) === String(estudianteId));
    return {
      id: evaluacion.id,
      cursoNombre: curso.nombre,
      gradoNombre: '1.° de secundaria',
      seccionNombre: estudiante.seccionNombre,
      docenteNombre: evaluacion.docenteCreadorNombre ?? 'Docente',
      nombre: evaluacion.nombre,
      descripcion: evaluacion.descripcion,
      fecha: evaluacion.fecha,
      bimestreNombre: evaluacion.bimestreNombre,
      competenciaNombre: evaluacion.competenciaNombre,
      estudianteNombre: estudiante.nombre,
      nota: nota?.nota ?? null
    };
  }));

  return {
    exitoso: true,
    mensaje: '',
    datos: {
      estudiante: { id: estudiante.id, nombre: estudiante.nombre, codigo: estudiante.codigo },
      curso: { id: curso.id, nombre: curso.nombre },
      gradoNombre: '1.° de secundaria',
      seccionNombre: estudiante.seccionNombre,
      docenteNombre: 'Prof. Quispe',
      anioConsulta: ANIO_CONSULTA,
      bimestres: copiar(BIMESTRES_FINALIZADOS),
      competencias: curso.competencias.map((competencia) => ({
        id: competencia.id,
        nombre: competencia.nombre,
        notasPorBimestre: NOTAS_COMPETENCIA_DEMO[`${curso.id}:${competencia.id}`] ?? {}
      })),
      evaluaciones: evaluacionesConNota.filter(Boolean)
    }
  };
}
