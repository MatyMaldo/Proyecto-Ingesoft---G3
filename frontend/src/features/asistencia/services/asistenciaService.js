import { ROLES } from '../../../shared/auth/roles.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  consultarHistorialAsistenciaMock,
  guardarAsistenciaEstudiantesMock,
  listarEstudiantesACargoMock,
  obtenerAsistenciaSesionMock,
  registrarAsistenciaDocenteMock
} from './mocks/asistenciaMock.js';

/**
 * Permite revisar la UI sin backend usando `VITE_USAR_MOCK_ASISTENCIA=true`.
 * En el flujo normal se usan los endpoints reales.
 */
const USAR_MOCK_ASISTENCIA = USAR_MOCK
  || import.meta.env.VITE_USAR_MOCK_ASISTENCIA === 'true';

const BASE = '/asistencias';

function identificadorLong(valor) {
  return /^\d+$/.test(String(valor)) ? Number(valor) : valor;
}

function cuerpoAsistencia(asistencias = []) {
  return {
    asistencias: asistencias.map((item) => ({
      estudianteId: identificadorLong(item.estudianteId),
      estado: item.estado,
      observaciones: item.observaciones ?? ''
    }))
  };
}

/** Detalle de asistencia de una sesión: docente, roster y estados. */
export async function obtenerAsistenciaSesion(sesion) {
  if (USAR_MOCK_ASISTENCIA) return obtenerAsistenciaSesionMock(sesion);
  if (!sesion?.id) {
    return { exitoso: false, datos: null, mensaje: 'No se identificó la sesión.' };
  }
  const respuesta = await solicitar(`${BASE}/sesiones/${encodeURIComponent(sesion.id)}`, {
    tiempoEsperaMs: 15000
  });
  return respuesta;
}

/** Guarda la asistencia de todos los estudiantes de la sesión. */
export async function guardarAsistenciaEstudiantes(sesionId, asistencias) {
  if (USAR_MOCK_ASISTENCIA) {
    return guardarAsistenciaEstudiantesMock(sesionId, asistencias);
  }
  return solicitar(`${BASE}/sesiones/${encodeURIComponent(sesionId)}/estudiantes`, {
    metodo: 'PUT',
    cuerpo: cuerpoAsistencia(asistencias),
    tiempoEsperaMs: 15000
  });
}

/** Registra la asistencia del docente dueño de la sesión. */
export async function registrarAsistenciaDocente(sesionId) {
  if (USAR_MOCK_ASISTENCIA) return registrarAsistenciaDocenteMock(sesionId);
  return solicitar(`${BASE}/sesiones/${encodeURIComponent(sesionId)}/docente`, {
    metodo: 'PUT',
    tiempoEsperaMs: 15000
  });
}

function rutaHistorial(rol, estudianteId) {
  if (rol === ROLES.DOCENTE) return `${BASE}/docente/mi-asistencia`;
  if (rol === ROLES.ESTUDIANTE) return `${BASE}/estudiante/mi-asistencia`;
  if (rol === ROLES.APODERADO) {
    return `${BASE}/apoderado/${encodeURIComponent(estudianteId)}`;
  }
  return null;
}

/** Historial de asistencia del rol autenticado. */
export async function consultarHistorialAsistencia({
  rol,
  estudianteId,
  cursoId,
  desde,
  hasta,
  page,
  size
} = {}) {
  if (USAR_MOCK_ASISTENCIA) {
    return consultarHistorialAsistenciaMock({
      cursoId,
      desde,
      hasta,
      page,
      size
    });
  }

  const ruta = rutaHistorial(rol, estudianteId);
  if (!ruta) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'La consulta de asistencia no está disponible para este rol.'
    };
  }

  return solicitar(ruta, {
    parametros: {
      ...(cursoId ? { cursoId: identificadorLong(cursoId) } : {}),
      ...(desde ? { desde } : {}),
      ...(hasta ? { hasta } : {}),
      ...(Number.isInteger(page) ? { page } : {}),
      ...(Number.isInteger(size) ? { size } : {})
    }
  });
}

/** Estudiantes a cargo del apoderado autenticado. */
export async function listarEstudiantesACargo() {
  if (USAR_MOCK_ASISTENCIA) return listarEstudiantesACargoMock();
  return solicitar('/usuarios/apoderados/me/estudiantes');
}
