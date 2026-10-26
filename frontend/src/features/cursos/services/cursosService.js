import { solicitar } from '../../../shared/api/clienteHttp.js';

/**
 * Lista todos los cursos, incluyendo las competencias propias de cada curso.
 *
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Array<{
 *   id: number|string, nombre: string, descripcion: string, gradoId: number,
 *   competencias: Array<{id: number|string, nombre: string, descripcion: string}>
 * }>|null, mensaje: string}>}
 */
export async function listarCursos(opciones = {}) {
  return solicitar('/cursos', {
    signal: opciones.signal
  });
}

/**
 * Crea un curso.
 *
 * @param {{ nombre: string, descripcion: string }} curso
 */
export async function crearCurso(curso) {
  return solicitar('/cursos', {
    metodo: 'POST',
    cuerpo: curso
  });
}

/**
 * Actualiza los datos de un curso.
 *
 * @param {string} idCurso
 * @param {{ nombre: string, descripcion: string }} curso
 */
export async function actualizarCurso(idCurso, curso) {
  return solicitar(`/cursos/${encodeURIComponent(idCurso)}`, {
    metodo: 'PUT',
    cuerpo: curso
  });
}

/**
 * Elimina un curso. El backend rechaza la operación si todavía tiene competencias asociadas.
 *
 * @param {string} idCurso
 */
export async function eliminarCurso(idCurso) {
  return solicitar(`/cursos/${encodeURIComponent(idCurso)}`, {
    metodo: 'DELETE'
  });
}

/**
 * Crea una competencia propia de un curso.
 *
 * @param {string} idCurso
 * @param {{ nombre: string, descripcion: string }} competencia
 * @param {{ signal?: AbortSignal }} [opciones]
 */
export async function crearCompetenciaCurso(idCurso, competencia, opciones = {}) {
  return solicitar(`/cursos/${encodeURIComponent(idCurso)}/competencias`, {
    metodo: 'POST',
    cuerpo: competencia,
    signal: opciones.signal
  });
}

/**
 * Lista las competencias asociadas a un curso.
 *
 * @param {string} idCurso
 * @param {{ signal?: AbortSignal }} [opciones]
 */
export async function listarCompetenciasCurso(idCurso, opciones = {}) {
  return solicitar(`/cursos/${encodeURIComponent(idCurso)}/competencias`, {
    signal: opciones.signal
  });
}

/**
 * Actualiza nombre y descripción de una competencia.
 *
 * @param {string} idCurso
 * @param {string} idCompetencia
 * @param {{ nombre: string, descripcion: string }} competencia
 * @param {{ signal?: AbortSignal }} [opciones]
 */
export async function actualizarCompetencia(idCurso, idCompetencia, competencia, opciones = {}) {
  return solicitar(
    `/cursos/${encodeURIComponent(idCurso)}/competencias/${encodeURIComponent(idCompetencia)}`,
    {
    metodo: 'PUT',
    cuerpo: competencia,
    signal: opciones.signal
    }
  );
}

/**
 * Elimina una competencia de un curso.
 *
 * @param {string} idCurso
 * @param {string} idCompetencia
 * @param {{ signal?: AbortSignal }} [opciones]
 */
export async function eliminarCompetenciaCurso(idCurso, idCompetencia, opciones = {}) {
  return solicitar(
    `/cursos/${encodeURIComponent(idCurso)}/competencias/${encodeURIComponent(idCompetencia)}`,
    {
      metodo: 'DELETE',
      signal: opciones.signal
    }
  );
}
