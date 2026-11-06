import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  crearEvaluacionMock,
  guardarNotaEvaluacionMock,
  listarContextoDocenteMock,
  listarEstudiantesEvaluacionMock,
  listarNotasEvaluacionMock,
  listarEvaluacionesMock
} from './mocks/evaluacionesMock.js';

export const ESCALA_NOTAS_EVALUACION = Object.freeze(['AD', 'A', 'B', 'C']);

const fallo = (mensaje) => ({ exitoso: false, datos: null, mensaje });

/**
 * El backend debe devolver solo asignaciones del docente autenticado, el año vigente
 * y sus fechas de bimestre. El mock reproduce ese contrato para el prototipo.
 */
export function listarContextoDocenteEvaluaciones(usuario) {
  return USAR_MOCK
    ? listarContextoDocenteMock(usuario)
    : solicitar('/evaluaciones/contexto-docente');
}

export function listarEvaluaciones() {
  return USAR_MOCK ? listarEvaluacionesMock() : solicitar('/evaluaciones');
}

/** Solo devuelve alumnos activos cuya matrícula confirmada corresponde a la sección evaluada. */
export async function listarEstudiantesEvaluacion(evaluacion) {
  const respuesta = USAR_MOCK
    ? listarEstudiantesEvaluacionMock(evaluacion)
    : solicitar(`/evaluaciones/${encodeURIComponent(evaluacion.id)}/estudiantes`, {
      parametros: { activo: true, estadoMatricula: 'CONFIRMADA' }
    });
  const resultado = await respuesta;
  if (!resultado.exitoso) return resultado;
  if (!Array.isArray(resultado.datos)) {
    return fallo('El backend devolvió un formato de estudiantes no válido.');
  }
  return {
    ...resultado,
    datos: resultado.datos.filter((estudiante) => estudiante.activo === true
      && estudiante.estadoMatricula === 'CONFIRMADA')
  };
}

export function listarNotasEvaluacion(evaluacion) {
  return USAR_MOCK
    ? listarNotasEvaluacionMock(evaluacion.id)
    : solicitar(`/evaluaciones/${encodeURIComponent(evaluacion.id)}/notas`);
}

function evaluacionEsDelAnioVigente(evaluacion, anioVigente) {
  if (evaluacion.anioAcademicoId != null && anioVigente?.id != null) {
    return String(evaluacion.anioAcademicoId) === String(anioVigente.id);
  }
  return String(evaluacion.anioAcademico) === String(anioVigente?.anio);
}

/** Valida en la capa de servicio y deja que el servidor vuelva a aplicar las mismas reglas. */
export function guardarNotaEvaluacion(evaluacion, estudiante, nota, usuario, anioVigente) {
  if (!ESCALA_NOTAS_EVALUACION.includes(nota)) {
    return Promise.resolve(fallo('La nota debe ser uno de los valores permitidos: AD, A, B o C.'));
  }
  if (!evaluacionEsDelAnioVigente(evaluacion, anioVigente)) {
    return Promise.resolve(fallo('Las notas de las evaluaciones solo se registran con el año académico vigente.'));
  }
  if (USAR_MOCK) return guardarNotaEvaluacionMock(evaluacion, estudiante, nota, usuario);

  return solicitar(
    `/evaluaciones/${encodeURIComponent(evaluacion.id)}/estudiantes/${encodeURIComponent(estudiante.id)}/nota`,
    { metodo: 'PUT', cuerpo: { nota } }
  );
}

/** El servidor debe determinar el docente creador desde la sesión autenticada. */
export function crearEvaluacion(datos, docente) {
  return USAR_MOCK
    ? crearEvaluacionMock(datos, docente)
    : solicitar('/evaluaciones', { metodo: 'POST', cuerpo: datos });
}
