import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { CACHE_CATALOGO_MS } from '../../../shared/api/constantesCache.js';
import { generarLibretaPdf } from '../utils/generarLibretaPdf.js';
import {
  listarAniosAcademicosMock,
  listarLibretasEstudianteMock,
  obtenerDetalleLibretaMock,
  listarOpcionesLibretaTutorMock,
  obtenerVistaPreviaLibretaTutorMock,
  generarLibretaTutorMock
} from './mocks/libretasMock.js';

/** Contexto de año, estudiantes tutorados, bimestres y estado de sus libretas. */
export async function listarOpcionesLibretaTutor(usuario) {
  if (USAR_MOCK) return listarOpcionesLibretaTutorMock(usuario);
  const respuesta = await solicitar('/libretas/contexto-tutor');
  return respuesta.exitoso
    ? { ...respuesta, datos: normalizarContextoTutor(respuesta.datos) }
    : respuesta;
}

export function esBimestreFinalizado(bimestre) {
  if (!bimestre) return false;
  if (bimestre.finalizado === true || bimestre.esFinalizado === true
    || bimestre.isFinalizado === true || bimestre.haFinalizado === true
    || bimestre.cerrado === true) return true;
  if (bimestre.finalizado === 1 || bimestre.esFinalizado === 1
    || bimestre.isFinalizado === 1 || bimestre.haFinalizado === 1
    || bimestre.cerrado === 1) return true;

  const estado = bimestre.estado
    ?? bimestre.estadoBimestre
    ?? bimestre.estadoNombre
    ?? bimestre.estadoPeriodo;
  const normalizado = String(estado ?? bimestre.finalizado ?? bimestre.esFinalizado ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
  return ['FINALIZADO', 'CERRADO', 'TERMINADO', 'COMPLETADO', 'TRUE', '1'].includes(normalizado);
}

export function normalizarContextoTutor(contexto) {
  if (!contexto || typeof contexto !== 'object') return contexto;
  const estudiantesPorId = new Map();
  for (const estudiante of Array.isArray(contexto.estudiantes) ? contexto.estudiantes : []) {
    const id = estudiante?.idEstudiante ?? estudiante?.estudianteId ?? estudiante?.id;
    if (id === null || id === undefined || id === '') continue;
    const clave = String(id);
    const anterior = estudiantesPorId.get(clave);
    const nombre = estudiante?.nombreCompleto
      ?? estudiante?.nombre
      ?? anterior?.nombre
      ?? String(id);
    estudiantesPorId.set(clave, {
      ...anterior,
      ...estudiante,
      idEstudiante: id,
      nombre
    });
  }
  return {
    ...contexto,
    estudiantes: [...estudiantesPorId.values()],
    bimestres: (Array.isArray(contexto.bimestres) ? contexto.bimestres : []).map((bimestre) => ({
      ...bimestre,
      id: bimestre.id ?? bimestre.idBimestre,
      nombre: bimestre.nombre ?? bimestre.nombreBimestre,
      finalizado: esBimestreFinalizado(bimestre)
    }))
  };
}

export function obtenerVistaPreviaLibretaTutor(usuario, estudianteId, bimestreId) {
  const errorEstudiante = validarIdLong(estudianteId, 'idEstudiante');
  if (errorEstudiante) return Promise.resolve(errorEstudiante);
  const errorBimestre = validarIdLong(bimestreId, 'idBimestre');
  if (errorBimestre) return Promise.resolve(errorBimestre);
  if (USAR_MOCK) return obtenerVistaPreviaLibretaTutorMock(usuario, estudianteId, bimestreId);
  return solicitar(`/estudiantes/${encodeURIComponent(estudianteId)}/libretas/vista-previa`, {
    parametros: { idBimestre: bimestreId }
  });
}

/** Genera una libreta del estudiante para un bimestre finalizado. */
export function generarLibretaTutor(datos) {
  const errorEstudiante = validarIdLong(datos?.estudianteId, 'idEstudiante');
  if (errorEstudiante) return Promise.resolve(errorEstudiante);
  const errorBimestre = validarIdLong(datos?.bimestreId, 'idBimestre');
  if (errorBimestre) return Promise.resolve(errorBimestre);
  const comentariosFinalesTutor = String(datos.comentariosFinalesTutor ?? '').trim();
  if (!comentariosFinalesTutor) {
    return Promise.resolve({ exitoso: false, datos: null, mensaje: 'Ingresa los comentarios finales del tutor.' });
  }
  if (comentariosFinalesTutor.length > 2000) {
    return Promise.resolve({ exitoso: false, datos: null, mensaje: 'Los comentarios no pueden superar los 2000 caracteres.' });
  }
  if (USAR_MOCK) return generarLibretaTutorMock(datos.usuario, { ...datos, comentariosFinalesTutor });
  return solicitar(`/estudiantes/${encodeURIComponent(datos.estudianteId)}/libretas`, {
    metodo: 'POST',
    cuerpo: {
      idBimestre: Number(datos.bimestreId),
      comentariosFinalesTutor
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
