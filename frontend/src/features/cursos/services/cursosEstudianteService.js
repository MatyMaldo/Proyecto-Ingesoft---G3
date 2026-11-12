import { solicitar } from '../../../shared/api/clienteHttp.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import {
  consultarNotasCurso as consultarNotasCursoMock,
  listarCursosConsulta as listarCursosMock
} from '../../evaluaciones/services/consultaNotasService.js';

/**
 * Consulta de cursos y notas del estudiante autenticado (HU-EVAL-03).
 *
 * El backend todavía no expone los endpoints pensados para esta pantalla (`/estudiantes/me/cursos/anio-consulta`
 * y `/estudiantes/me/cursos/{id}/evaluaciones-notas`), así que este servicio compone la vista con los que ya
 * existen. Cuando el backend los publique, basta reemplazar el cuerpo de las dos funciones exportadas: las vistas
 * solo conocen el modelo que devuelven.
 *
 * Endpoints usados:
 * - `GET /anios-academicos` y `GET /matriculas/estudiante/{id}/seccion?anioId=` → año de consulta y sección.
 * - `GET /asignaciones-curso?gradoId&seccionId&anioId` → cursos y docente de la sección.
 * - `GET /bloques-horario?gradoId&anioId` → aula(s) de cada curso.
 * - `GET /cursos` y `GET /cursos/{id}/competencias` → descripción del curso y sus competencias.
 * - `GET /estudiantes/{id}/revision-notas/cursos/{cursoId}` → evaluaciones y notas.
 */

/** El backend responde 400 con este texto cuando el curso aún no tiene evaluaciones; para la vista no es un error. */
const MENSAJE_SIN_EVALUACIONES = /^No hay evaluaciones registradas/i;
/** Estados con los que el backend devuelve un mensaje de negocio pensado para el usuario. */
const ESTADOS_CON_MENSAJE_DE_NEGOCIO = [400, 403, 409, 422];

const NOMBRES_BIMESTRE = Object.freeze({
  BIM_1: 'I Bimestre',
  BIM_2: 'II Bimestre',
  BIM_3: 'III Bimestre',
  BIM_4: 'IV Bimestre'
});

/** Columnas de la tabla de competencias: los cuatro bimestres del año, tengan o no notas. */
export const BIMESTRES = Object.freeze(
  Object.entries(NOMBRES_BIMESTRE).map(([id, nombre]) => Object.freeze({ id, nombre }))
);

/**
 * Mensaje que se puede mostrar tal cual al usuario: el de negocio del backend (4xx controlados) o ninguno,
 * para que la vista use "Se registró un error inesperado" (EAC-13) en lugar de detalles técnicos.
 *
 * @param {{ estado?: number, mensaje?: string }} respuesta Respuesta fallida de `solicitar`.
 * @returns {string}
 */
export function mensajeParaUsuario(respuesta) {
  return ESTADOS_CON_MENSAJE_DE_NEGOCIO.includes(respuesta?.estado) ? respuesta.mensaje ?? '' : '';
}

function fallo(respuesta) {
  return { exitoso: false, datos: null, mensaje: mensajeParaUsuario(respuesta), estado: respuesta?.estado };
}

function formatoInvalido() {
  return { exitoso: false, datos: null, mensaje: '', estado: 500 };
}

function agruparAulasPorCurso(bloques) {
  const conteos = new Map();
  for (const bloque of bloques) {
    if (!bloque.aulaNombre) {
      continue;
    }
    const clave = String(bloque.cursoId);
    const porAula = conteos.get(clave) ?? new Map();
    porAula.set(bloque.aulaNombre, (porAula.get(bloque.aulaNombre) ?? 0) + 1);
    conteos.set(clave, porAula);
  }
  // La más usada primero: es la que se muestra en la tarjeta.
  return new Map([...conteos].map(([cursoId, porAula]) => [
    cursoId,
    [...porAula].sort((a, b) => b[1] - a[1]).map(([nombre]) => nombre)
  ]));
}

/**
 * Año de consulta: el de mayor `anio` en el que el estudiante tiene matrícula CONFIRMADA. Es el mismo criterio que
 * aplica el backend al consultar las notas (`RevisionNotasServiceImpl`), para que lista y notas coincidan.
 * TODO(backend, 2026-11-11): el backend no comprueba que el año ya haya iniciado (HU-EVAL-03); aquí tampoco.
 */
async function buscarAnioDeConsulta(estudianteId) {
  const anios = await solicitar('/anios-academicos');
  if (!anios.exitoso) {
    return { fallo: fallo(anios) };
  }
  if (!Array.isArray(anios.datos)) {
    return { fallo: formatoInvalido() };
  }

  const matriculas = await Promise.all(anios.datos.map(async (anio) => ({
    anio,
    respuesta: await solicitar(`/matriculas/estudiante/${encodeURIComponent(estudianteId)}/seccion`, {
      parametros: { anioId: anio.id }
    })
  })));

  const confirmadas = matriculas
    .filter(({ respuesta }) => respuesta.exitoso && respuesta.datos?.estado === 'CONFIRMADA')
    .sort((a, b) => b.anio.anio - a.anio.anio);
  if (confirmadas.length > 0) {
    return { anio: confirmadas[0].anio, matricula: confirmadas[0].respuesta.datos };
  }

  // Un 404 significa "sin matrícula en ese año"; cualquier otro fallo impide saberlo y se informa.
  const falloInesperado = matriculas.find(({ respuesta }) => !respuesta.exitoso && respuesta.estado !== 404);
  return falloInesperado ? { fallo: fallo(falloInesperado.respuesta) } : { anio: null, matricula: null };
}

async function listarCursosDeLaApi(usuario) {
  const encontrado = await buscarAnioDeConsulta(usuario.id);
  if (encontrado.fallo) {
    return encontrado.fallo;
  }
  const estudiante = { id: usuario.id, nombre: usuario.nombre };
  if (!encontrado.matricula) {
    return {
      exitoso: true,
      mensaje: '',
      datos: { estudiante, anioConsulta: null, gradoNombre: '', seccionNombre: '', cursos: [], sinMatricula: true }
    };
  }

  const { anio, matricula } = encontrado;
  const [asignaciones, bloques, catalogo] = await Promise.all([
    solicitar('/asignaciones-curso', {
      parametros: { gradoId: matricula.gradoId, seccionId: matricula.seccionId, anioId: anio.id }
    }),
    solicitar('/bloques-horario', { parametros: { gradoId: matricula.gradoId, anioId: anio.id } }),
    solicitar('/cursos')
  ]);
  if (!asignaciones.exitoso) {
    return fallo(asignaciones);
  }
  if (!Array.isArray(asignaciones.datos)) {
    return formatoInvalido();
  }

  // El aula y la descripción son complementos de la tarjeta: si fallan, la lista sigue siendo útil.
  const descripciones = new Map((catalogo.exitoso && Array.isArray(catalogo.datos) ? catalogo.datos : [])
    .map((curso) => [String(curso.id), curso.descripcion ?? '']));
  const aulas = agruparAulasPorCurso(
    (bloques.exitoso && Array.isArray(bloques.datos) ? bloques.datos : [])
      .filter((bloque) => String(bloque.seccionId) === String(matricula.seccionId))
  );

  const vistos = new Set();
  const cursos = [];
  for (const asignacion of asignaciones.datos) {
    const id = String(asignacion.cursoId);
    if (vistos.has(id)) {
      continue;
    }
    vistos.add(id);
    cursos.push({
      id,
      nombre: asignacion.cursoNombre,
      descripcion: descripciones.get(id) ?? '',
      docenteNombre: asignacion.docenteNombre ?? '',
      aulas: aulas.get(id) ?? []
    });
  }

  return {
    exitoso: true,
    mensaje: '',
    datos: {
      estudiante,
      anioConsulta: { id: anio.id, anio: anio.anio },
      gradoNombre: matricula.gradoNombre,
      seccionNombre: matricula.seccionNombre,
      cursos,
      sinMatricula: false
    }
  };
}

async function listarCursosEnMemoria(usuario) {
  const respuesta = await listarCursosMock(usuario, usuario.id);
  if (!respuesta.exitoso) {
    return respuesta;
  }
  const lista = Array.isArray(respuesta.datos) ? respuesta.datos : [];
  return {
    exitoso: true,
    mensaje: '',
    datos: {
      estudiante: { id: usuario.id, nombre: usuario.nombre },
      anioConsulta: lista[0]?.anioAcademico ?? null,
      gradoNombre: lista[0]?.gradoNombre ?? '',
      seccionNombre: lista[0]?.seccionNombre ?? '',
      sinMatricula: lista.length === 0,
      cursos: lista.map((curso) => ({
        id: String(curso.id),
        nombre: curso.nombre,
        descripcion: curso.descripcion ?? '',
        docenteNombre: '',
        aulas: []
      }))
    }
  };
}

/**
 * Cursos del estudiante en su año de consulta.
 *
 * @param {{ id: * , nombre: string }} usuario Estudiante autenticado (`useAuth`).
 * @returns {Promise<{
 *   exitoso: boolean, mensaje: string, estado?: number,
 *   datos: null | {
 *     estudiante: { id: *, nombre: string },
 *     anioConsulta: { id?: *, anio: number } | null,
 *     gradoNombre: string, seccionNombre: string, sinMatricula: boolean,
 *     cursos: Array<{ id: string, nombre: string, descripcion: string, docenteNombre: string, aulas: string[] }>
 *   }
 * }>}
 */
export function consultarCursosEstudiante(usuario) {
  return USAR_MOCK ? listarCursosEnMemoria(usuario) : listarCursosDeLaApi(usuario);
}

async function consultarNotasDeLaApi(usuario, curso, contexto) {
  const [revision, competenciasCurso] = await Promise.all([
    solicitar(`/estudiantes/${encodeURIComponent(usuario.id)}/revision-notas/cursos/${encodeURIComponent(curso.id)}`),
    solicitar(`/cursos/${encodeURIComponent(curso.id)}/competencias`)
  ]);

  const sinEvaluaciones = !revision.exitoso
    && revision.estado === 400
    && MENSAJE_SIN_EVALUACIONES.test(revision.mensaje ?? '');
  // TODO(backend, 2026-11-11): un curso sin evaluaciones debería responder 200 con listas vacías, no 400.
  if (!revision.exitoso && !sinEvaluaciones) {
    return fallo(revision);
  }
  const datosRevision = revision.exitoso ? revision.datos : null;
  if (revision.exitoso && !Array.isArray(datosRevision?.evaluaciones)) {
    return formatoInvalido();
  }

  const nombreEstudiante = datosRevision?.nombreEstudiante ?? contexto.estudiante.nombre;
  // TODO(backend, 2026-11-11): `nombreCurso` de la respuesta trae el nombre del grado; se usa el de la tarjeta.
  const evaluaciones = (datosRevision?.evaluaciones ?? [])
    .map((evaluacion) => ({
      id: String(evaluacion.idEvaluacion),
      cursoNombre: curso.nombre,
      gradoNombre: contexto.gradoNombre,
      seccionNombre: contexto.seccionNombre,
      docenteNombre: curso.docenteNombre,
      nombre: evaluacion.nombreEvaluacion,
      descripcion: evaluacion.descripcion ?? '',
      fecha: evaluacion.fecha,
      bimestreId: evaluacion.nombreBimestre,
      bimestreNombre: NOMBRES_BIMESTRE[evaluacion.nombreBimestre] ?? evaluacion.nombreBimestre,
      competenciaNombre: evaluacion.nombreCompetencia,
      estudianteNombre: nombreEstudiante,
      nota: evaluacion.valorNota ?? null
    }))
    .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));

  // Todas las competencias del curso, con o sin nota, para que el estudiante vea qué se evalúa.
  const filas = new Map();
  for (const competencia of (competenciasCurso.exitoso && Array.isArray(competenciasCurso.datos) ? competenciasCurso.datos : [])) {
    filas.set(competencia.nombre, {
      id: String(competencia.id),
      nombre: competencia.nombre,
      descripcion: competencia.descripcion ?? '',
      notasPorBimestre: {}
    });
  }
  // La conclusión descriptiva (`conclusionDescriptiva`) no se muestra aquí: el estudiante la ve en la libreta (HU-EVAL-03).
  for (const nota of datosRevision?.notasCompetencias ?? []) {
    const fila = filas.get(nota.nombreCompetencia) ?? {
      id: nota.nombreCompetencia,
      nombre: nota.nombreCompetencia,
      descripcion: '',
      notasPorBimestre: {}
    };
    fila.notasPorBimestre[nota.nombreBimestre] = nota.valorNota;
    filas.set(nota.nombreCompetencia, fila);
  }

  return {
    exitoso: true,
    mensaje: '',
    datos: {
      estudiante: { id: usuario.id, nombre: nombreEstudiante },
      curso: { id: curso.id, nombre: curso.nombre, descripcion: curso.descripcion },
      gradoNombre: contexto.gradoNombre,
      seccionNombre: contexto.seccionNombre,
      docenteNombre: curso.docenteNombre,
      aulas: curso.aulas,
      anioConsulta: contexto.anioConsulta,
      bimestres: BIMESTRES,
      competencias: [...filas.values()],
      evaluaciones
    }
  };
}

/**
 * Evaluaciones, notas y notas de competencias de un curso del estudiante.
 *
 * @param {{ id: *, nombre: string }} usuario Estudiante autenticado.
 * @param {{ id: string, nombre: string, descripcion?: string, docenteNombre?: string, aulas?: string[] }} curso
 *   Tarjeta del curso (la que devolvió `consultarCursosEstudiante`).
 * @param {{
 *   estudiante: { id: *, nombre: string }, gradoNombre: string, seccionNombre: string,
 *   anioConsulta: { anio: number } | null
 * }} contexto Datos del año de consulta que devolvió `consultarCursosEstudiante`.
 * @returns {Promise<{ exitoso: boolean, mensaje: string, estado?: number, datos: Object|null }>}
 */
export async function consultarNotasCursoEstudiante(usuario, curso, contexto) {
  if (!USAR_MOCK) {
    return consultarNotasDeLaApi(usuario, curso, contexto);
  }
  const respuesta = await consultarNotasCursoMock(usuario, usuario.id, curso.id);
  return respuesta.exitoso ? { ...respuesta, datos: { ...respuesta.datos, aulas: curso.aulas ?? [] } } : respuesta;
}
