import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { CACHE_CATALOGO_MS } from '../../../shared/api/constantesCache.js';
import { generarLibretaPdf } from '../utils/generarLibretaPdf.js';
import {
  listarAniosAcademicosMock,
  listarLibretasEstudianteMock,
  obtenerDetalleLibretaMock,
  listarOpcionesLibretaTutorMock,
  generarLibretaTutorMock
} from './mocks/libretasMock.js';

/**
 * Contrato esperado para GET /docente/libretas/contexto:
 * { anioAcademico, seccion, estudiantes, bimestresFinalizados, opciones }.
 * Cada opción incluye estudiante, bimestre, estado (LISTA|INCOMPLETA|GENERADA), faltantes,
 * libreta (si existe) y datosGeneracion con notas, asistencia, tutor e institución.
 */
export function listarOpcionesLibretaTutor(usuario) {
  if (USAR_MOCK) return listarOpcionesLibretaTutorMock(usuario);
  return solicitar('/docente/libretas/contexto');
}

/** Guarda una libreta parcial del bimestre para un estudiante de la sección del docente tutor. */
export function generarLibretaTutor(datos) {
  if (!datos?.estudianteId || !datos?.bimestreId) {
    return Promise.resolve({ exitoso: false, datos: null, mensaje: 'Selecciona un estudiante y un bimestre finalizado.' });
  }
  if (!String(datos.comentariosFinalesTutor ?? '').trim()) {
    return Promise.resolve({ exitoso: false, datos: null, mensaje: 'Ingresa los comentarios finales del tutor.' });
  }
  if (USAR_MOCK) return generarLibretaTutorMock(datos.usuario, datos);
  return solicitar('/docente/libretas', {
    metodo: 'POST',
    cuerpo: {
      idEstudiante: Number(datos.estudianteId),
      idBimestre: Number(datos.bimestreId),
      comentariosFinalesTutor: datos.comentariosFinalesTutor.trim()
    }
  });
}

function validarIdLong(valor, nombre) {
  if (valor !== null && valor !== undefined && /^\d+$/.test(String(valor))) return null;
  return {
    exitoso: false,
    datos: null,
    mensaje: `El parámetro '${nombre}' debe ser un ID numérico válido.`
  };
}

export function listarAniosAcademicosLibretas() {
  if (USAR_MOCK) return listarAniosAcademicosMock();
  return solicitar('/anios-academicos', { cacheMs: CACHE_CATALOGO_MS });
}

export function listarLibretasDelEstudiante(usuario, estudianteId, anioId) {
  if (USAR_MOCK) return listarLibretasEstudianteMock(usuario, estudianteId, anioId);
  const errorEstudiante = validarIdLong(estudianteId, 'idEstudiante');
  if (errorEstudiante) return Promise.resolve(errorEstudiante);
  const errorAnio = validarIdLong(anioId, 'idAnioAcademico');
  if (errorAnio) return Promise.resolve(errorAnio);
  const ruta = `/estudiantes/${encodeURIComponent(estudianteId)}/libretas`;
  return solicitar(ruta, { parametros: { idAnioAcademico: anioId } });
}

export function obtenerDetalleLibreta(usuario, estudianteId, libretaId) {
  if (USAR_MOCK) return obtenerDetalleLibretaMock(usuario, estudianteId, libretaId);
  const errorEstudiante = validarIdLong(estudianteId, 'idEstudiante');
  if (errorEstudiante) return Promise.resolve(errorEstudiante);
  const errorLibreta = validarIdLong(libretaId, 'idLibreta');
  if (errorLibreta) return Promise.resolve(errorLibreta);
  const ruta = `/estudiantes/${encodeURIComponent(estudianteId)}/libretas/${encodeURIComponent(libretaId)}`;
  return solicitar(ruta);
}

export async function obtenerPdfLibreta(usuario, estudianteId, libretaId) {
  if (USAR_MOCK) {
    const respuesta = await obtenerDetalleLibretaMock(usuario, estudianteId, libretaId);
    if (!respuesta.exitoso) return respuesta;
    return { ...respuesta, datos: generarLibretaPdf(respuesta.datos) };
  }
  const errorEstudiante = validarIdLong(estudianteId, 'idEstudiante');
  if (errorEstudiante) return errorEstudiante;
  const errorLibreta = validarIdLong(libretaId, 'idLibreta');
  if (errorLibreta) return errorLibreta;
  const ruta = `/estudiantes/${encodeURIComponent(estudianteId)}/libretas/${encodeURIComponent(libretaId)}/pdf`;
  return solicitar(ruta, { respuestaArchivo: true });
}
