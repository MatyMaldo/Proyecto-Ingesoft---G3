import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { generarLibretaPdf } from '../utils/generarLibretaPdf.js';
import {
  listarAniosAcademicosMock,
  listarLibretasEstudianteMock,
  obtenerDetalleLibretaMock
} from './mocks/libretasMock.js';

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
  return solicitar('/anios-academicos');
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
