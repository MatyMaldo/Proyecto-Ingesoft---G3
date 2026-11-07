import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { listarLibretasEstudianteMock } from './mocks/libretasMock.js';
import { ROLES } from '../../../shared/auth/roles.js';
import { listarEstudiantesConsulta } from '../../../features/evaluaciones/services/consultaNotasService.js';

/** El backend debe limitar la respuesta al estudiante autenticado y a su año de consulta. */
export function listarLibretasEstudiante(usuario) {
  return listarEstudiantesConsulta(usuario);
}

/** El servidor debe autorizar la relación apoderado-estudiante y limitar el año consultado. */
export function listarLibretasDelEstudiante(usuario, estudianteId) {
  if (USAR_MOCK) return listarLibretasEstudianteMock(usuario, estudianteId);
  const ruta = usuario?.rol === ROLES.ESTUDIANTE
    ? '/estudiantes/me/libretas/anio-consulta'
    : `/apoderados/me/estudiantes/${encodeURIComponent(estudianteId)}/libretas/anio-consulta`;
  return solicitar(ruta);
}
