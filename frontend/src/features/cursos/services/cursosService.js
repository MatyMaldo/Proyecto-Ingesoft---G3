import {
  listarCursosPorGradoMock,
  crearCursoMock,
  guardarCompetenciasCursoMock
} from './mocks/cursosMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

// TODO(pregunta): los endpoints de abajo son una propuesta. Confirmar rutas, nombres de campos y
// códigos de estado con quien lleve el backend de curso-competencias antes de desactivar el mock.
// La autorización real (quién puede crear cursos o asignar competencias) y la auditoría de los
// cambios (HU-EVAL-08) las aplica el backend; la interfaz solo oculta los controles.

/**
 * Lista los cursos de un grado, con su catálogo de competencias disponibles y los ids de las
 * competencias ya asignadas.
 *
 * @param {string} grado Número de grado de secundaria: '1' a '5'.
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Array<{
 *   id: string, nombre: string, descripcion: string, grado: string,
 *   competenciasDisponibles: Array<{id: string, nombre: string}>,
 *   competenciasAsignadas: string[]
 * }>|null, mensaje: string}>}
 */
export async function listarCursosPorGrado(grado, opciones = {}) {
  if (USAR_MOCK) {
    return listarCursosPorGradoMock(grado);
  }

  return solicitar('/cursos', {
    parametros: { grado },
    signal: opciones.signal
  });
}

/**
 * Crea un curso en un grado. El backend valida los campos y que el nombre no se repita en el grado
 * (responde 409 en ese caso).
 *
 * @param {{ nombre: string, descripcion: string, grado: string }} datos
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string}>} `datos` es el curso creado.
 */
export async function crearCurso(datos, opciones = {}) {
  if (USAR_MOCK) {
    return crearCursoMock(datos);
  }

  return solicitar('/cursos', {
    metodo: 'POST',
    cuerpo: { nombre: datos.nombre, descripcion: datos.descripcion, grado: datos.grado },
    signal: opciones.signal
  });
}

/**
 * Reemplaza las competencias asignadas a un curso por las indicadas.
 *
 * @param {string} idCurso
 * @param {string[]} idsCompetencias
 * @param {{ signal?: AbortSignal }} [opciones]
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string}>} `datos` es el curso actualizado.
 */
export async function guardarCompetenciasCurso(idCurso, idsCompetencias, opciones = {}) {
  if (USAR_MOCK) {
    return guardarCompetenciasCursoMock(idCurso, idsCompetencias);
  }

  return solicitar(`/cursos/${encodeURIComponent(idCurso)}/competencias`, {
    metodo: 'PUT',
    cuerpo: { competencias: idsCompetencias },
    signal: opciones.signal
  });
}
