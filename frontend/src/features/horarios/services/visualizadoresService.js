import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  listarSesiones,
  listarSesionesDocente,
  listarSesionesApoderado,
  miHorarioSesionesDocente,
  miHorarioSesionesEstudiante,
  obtenerPeriodoMatricula
} from './horariosService.js';

/**
 * Adaptador de la pantalla de consulta. Los horarios se leen siempre desde
 * `/sesiones-clase/**`; los visualizadores antiguos quedaron deprecados.
 */

export function horarioSeccion(seccionId, parametros) {
  return listarSesiones({ ...parametros, seccionId });
}

export function horarioDocente(docenteId, parametros) {
  return listarSesionesDocente(docenteId, parametros);
}

export function miHorarioDocente(parametros) {
  return miHorarioSesionesDocente(parametros);
}

export function miHorarioEstudiante(parametros) {
  return miHorarioSesionesEstudiante(parametros);
}

export function horarioApoderado(estudianteId, parametros) {
  return listarSesionesApoderado(estudianteId, parametros);
}

export function obtenerPeriodo(anioId) {
  return obtenerPeriodoMatricula(anioId);
}

export function listarMisEstudiantes(anioId) {
  return solicitar('/usuarios/apoderados/me/estudiantes', {
    parametros: anioId == null ? undefined : { anioId }
  });
}

export async function listarDocentes() {
  const respuesta = await solicitar('/usuarios', {
    parametros: { tipoUsuario: 'DOCENTE', activo: true, page: 0, size: 100 }
  });
  if (!respuesta.exitoso) return respuesta;
  const docentes = respuesta.datos?.content;
  if (!Array.isArray(docentes)) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió un formato de docentes no válido.'
    };
  }
  return {
    ...respuesta,
    datos: docentes.map((docente) => ({
      id: docente.id,
      nombre: docente.nombreCompleto
        ?? [docente.nombre, docente.apellidoPaterno, docente.apellidoMaterno]
          .filter(Boolean)
          .join(' ')
          .trim(),
      activo: docente.activo
    }))
  };
}

export async function listarSecciones(anioId) {
  const respuesta = await solicitar('/secciones', {
    parametros: anioId == null ? undefined : { anioId }
  });
  if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) return respuesta;
  return {
    ...respuesta,
    datos: respuesta.datos.map((seccion) => ({
      ...seccion,
      nombre: seccion.nombre ?? seccion.nombreSeccion,
      gradoId: seccion.gradoId ?? seccion.grado?.id,
      gradoNombre: seccion.gradoNombre ?? seccion.grado?.nombre,
      anioAcademicoId: seccion.anioAcademicoId ?? anioId,
      anioAcademico: seccion.anioAcademico ?? seccion.anio
    }))
  };
}

export function listarAniosAcademicos() {
  return solicitar('/anios-academicos');
}
