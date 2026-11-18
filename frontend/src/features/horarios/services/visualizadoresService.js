import { solicitar } from '../../../shared/api/clienteHttp.js';
import { CACHE_CATALOGO_MS } from '../../../shared/api/constantesCache.js';
import {
  cambiarOmisionSesion as cambiarOmisionSesionBase,
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

export function cambiarOmisionSesion(sesionId, omitida) {
  return cambiarOmisionSesionBase(sesionId, omitida);
}

export function obtenerPeriodo(anioId) {
  return obtenerPeriodoMatricula(anioId);
}

export function listarMisEstudiantes(anioId) {
  return solicitar('/usuarios/apoderados/me/estudiantes', {
    parametros: anioId == null ? undefined : { anioId }
  });
}

/** Páginas que se piden como máximo al listar docentes (100 por página): evita un bucle ante una respuesta anómala. */
const MAX_PAGINAS_DOCENTES = 20;

export async function listarDocentes() {
  const docentes = [];
  let respuesta = null;
  for (let pagina = 0; pagina < MAX_PAGINAS_DOCENTES; pagina += 1) {
    respuesta = await solicitar('/usuarios', {
      parametros: { tipoUsuario: 'DOCENTE', activo: true, page: pagina, size: 100 }
    });
    if (!respuesta.exitoso) return respuesta;
    const contenido = respuesta.datos?.content;
    if (!Array.isArray(contenido)) {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'El backend devolvió un formato de docentes no válido.'
      };
    }
    docentes.push(...contenido);
    const totalPaginas = Number(respuesta.datos?.totalPages);
    if (contenido.length === 0 || !Number.isFinite(totalPaginas) || pagina + 1 >= totalPaginas) break;
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
  return solicitar('/anios-academicos', { cacheMs: CACHE_CATALOGO_MS });
}
