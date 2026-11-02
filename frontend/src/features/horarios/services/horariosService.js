import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  consultarCatalogosMock,
  listarAsignacionesMock,
  crearAsignacionMock,
  eliminarAsignacionMock,
  obtenerHorarioMock,
  listarOcupacionesMock,
  listarSesionesMock,
  generarSesionesMock,
  guardarDisponibilidadSesionesMock,
  guardarHorarioMock
} from './mocks/horariosMock.js';

// TODO(backend): las rutas reales aún no existen; este contrato es una propuesta.
// AsignacionCurso = { id, gradoId, seccion, cursoId, cursoNombre, docenteId, docenteNombre }.
// Bloque = { dia, franjaId, asignacionId, aulaId }.

/**
 * Catálogos para filtros y selectores: grados, secciones, cursos, docentes y aulas.
 *
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string}>}
 */
export async function consultarCatalogos() {
  if (USAR_MOCK) {
    return consultarCatalogosMock();
  }
  return solicitar('/horarios/catalogos');
}

/** Relaciones curso-docente de una sección (alimentan la tabla y el selector en cascada de la matriz). */
export async function listarAsignaciones({ gradoId, seccion }) {
  if (USAR_MOCK) {
    return listarAsignacionesMock({ gradoId, seccion });
  }
  return solicitar('/asignaciones-curso', { parametros: { gradoId, seccion } });
}

export async function crearAsignacion(datos) {
  if (USAR_MOCK) {
    return crearAsignacionMock(datos);
  }
  return solicitar('/asignaciones-curso', { metodo: 'POST', cuerpo: datos });
}

export async function eliminarAsignacion(idAsignacion) {
  if (USAR_MOCK) {
    return eliminarAsignacionMock(idAsignacion);
  }
  return solicitar(`/asignaciones-curso/${encodeURIComponent(idAsignacion)}`, { metodo: 'DELETE' });
}

export async function obtenerHorario({ gradoId, seccion }) {
  if (USAR_MOCK) {
    return obtenerHorarioMock({ gradoId, seccion });
  }
  return solicitar('/horarios', { parametros: { gradoId, seccion } });
}

/**
 * Bloques de las demás secciones, con su docente y aula, para avisar de choques de horario.
 * Ocupacion = { dia, franjaId, docenteId, aulaId, seccionNombre }.
 */
export async function listarOcupaciones({ gradoId, seccion }) {
  if (USAR_MOCK) {
    return listarOcupacionesMock({ gradoId, seccion });
  }
  return solicitar('/horarios/ocupaciones', { parametros: { gradoId, seccion } });
}

/**
 * Guarda la matriz completa de la sección.
 *
 * @param {{ gradoId: string, seccion: string, bloques: Array }} horario
 */
export async function guardarHorario(horario) {
  if (USAR_MOCK) {
    return guardarHorarioMock(horario);
  }
  return solicitar('/horarios', { metodo: 'PUT', cuerpo: horario });
}

// Sesion = { id, fecha (AAAA-MM-DD), dia, franjaId, inicio, fin, cursoNombre, docenteNombre, aulaNombre, disponible }.

/**
 * Sesiones con fecha ya generadas para una sección y un bimestre.
 * La respuesta es `{ sesiones, desactualizada }`: `desactualizada` es `true` si el horario cambió
 * después de la última generación.
 */
export async function listarSesiones({ gradoId, seccion, bimestreId }) {
  if (USAR_MOCK) {
    return listarSesionesMock({ gradoId, seccion, bimestreId });
  }
  return solicitar('/sesiones-horario', { parametros: { gradoId, seccion, bimestreId } });
}

/** Genera las sesiones del bimestre a partir de los bloques guardados del horario. Misma respuesta que `listarSesiones`. */
export async function generarSesiones({ gradoId, seccion, bimestreId }) {
  if (USAR_MOCK) {
    return generarSesionesMock({ gradoId, seccion, bimestreId });
  }
  return solicitar('/sesiones-horario/generar', {
    metodo: 'POST',
    cuerpo: { gradoId, seccion, bimestreId }
  });
}

/**
 * Marca sesiones como disponibles o no disponibles (feriados, vacaciones).
 *
 * @param {{ gradoId: string, seccion: string, bimestreId: string, cambios: Array<{ id: string, disponible: boolean }> }} datos
 */
export async function guardarDisponibilidadSesiones(datos) {
  if (USAR_MOCK) {
    return guardarDisponibilidadSesionesMock(datos);
  }
  return solicitar('/sesiones-horario/disponibilidad', { metodo: 'PATCH', cuerpo: datos });
}
