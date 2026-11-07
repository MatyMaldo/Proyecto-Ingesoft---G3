import { ROLES } from '../../../shared/auth/roles.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  consultarNotasCursoMock,
  listarCursosEstudianteMock,
  listarEstudiantesBajoCargoMock
} from './mocks/consultaNotasMock.js';

// Los endpoints de consulta deben autorizar al estudiante titular o al apoderado vinculado,
// y resolver el año de consulta como el más reciente iniciado con matrícula confirmada.

export function listarEstudiantesConsulta(usuario) {
  if (usuario?.rol === ROLES.ESTUDIANTE) {
    return Promise.resolve({
      exitoso: true,
      mensaje: '',
      datos: [{ id: usuario.id, nombre: usuario.nombre, codigo: usuario.id }]
    });
  }
  if (USAR_MOCK) return listarEstudiantesBajoCargoMock(usuario);
  return solicitar('/apoderados/me/estudiantes');
}

export function listarCursosConsulta(usuario, estudianteId) {
  if (USAR_MOCK) return listarCursosEstudianteMock(usuario, estudianteId);
  const ruta = usuario?.rol === ROLES.ESTUDIANTE
    ? '/estudiantes/me/cursos/anio-consulta'
    : `/apoderados/me/estudiantes/${encodeURIComponent(estudianteId)}/cursos/anio-consulta`;
  return solicitar(ruta);
}

export function consultarNotasCurso(usuario, estudianteId, cursoId) {
  if (USAR_MOCK) return consultarNotasCursoMock(usuario, estudianteId, cursoId);
  const ruta = usuario?.rol === ROLES.ESTUDIANTE
    ? `/estudiantes/me/cursos/${encodeURIComponent(cursoId)}/evaluaciones-notas`
    : `/apoderados/me/estudiantes/${encodeURIComponent(estudianteId)}/cursos/${encodeURIComponent(cursoId)}/evaluaciones-notas`;
  return solicitar(ruta);
}
