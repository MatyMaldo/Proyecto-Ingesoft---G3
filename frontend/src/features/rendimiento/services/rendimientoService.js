import { solicitar } from '../../../shared/api/clienteHttp.js';

const falloFormato = (recurso) => ({
  exitoso: false,
  datos: null,
  mensaje: `El backend devolvió un formato de ${recurso} no válido.`
});

/**
 * Acepta las formas en que el backend puede devolver los reportes:
 * una lista, un objeto `{ reportes: [...] }` o un único reporte.
 */
function extraerReportes(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.reportes)) return datos.reportes;
  if (datos && typeof datos === 'object' && datos.id != null) return [datos];
  return null;
}

const normalizarReporte = (reporte) => ({
  id: reporte.id,
  fechaEmision: reporte.fechaEmision ?? null,
  desde: reporte.desde ?? null,
  hasta: reporte.hasta ?? null,
  docente: reporte.docente ?? '',
  estudiante: reporte.estudiante ?? '',
  grado: reporte.grado ?? '',
  seccion: reporte.seccion ?? '',
  curso: reporte.curso ?? '',
  comentarios: reporte.comentarios ?? '',
  faltas: Array.isArray(reporte.faltas) ? reporte.faltas : [],
  cantidadFaltas: typeof reporte.cantidadFaltas === 'number'
    ? reporte.cantidadFaltas
    : Array.isArray(reporte.faltas) ? reporte.faltas.length : null
});

/** Reportes de inasistencia del estudiante en sesión. */
export async function obtenerReportesEstudiante() {
  const respuesta = await solicitar('/asistencias/reportes/estudiante');
  if (!respuesta.exitoso) return respuesta;

  const reportes = extraerReportes(respuesta.datos);
  if (!reportes) return falloFormato('los reportes de inasistencia');

  return {
    exitoso: true,
    datos: { reportes: reportes.map(normalizarReporte) },
    mensaje: ''
  };
}

/** Detalle de un reporte de inasistencia (incluye las faltas y los comentarios del docente). */
export async function obtenerDetalleReporteEstudiante(reporteId) {
  const respuesta = await solicitar(`/asistencias/reportes/estudiante/${encodeURIComponent(reporteId)}`);
  if (!respuesta.exitoso) return respuesta;

  const [reporte] = extraerReportes(respuesta.datos) ?? [];
  if (!reporte) return falloFormato('el detalle del reporte de inasistencia');

  return { exitoso: true, datos: normalizarReporte(reporte), mensaje: '' };
}

// ---------------------------------------------------------------------------
// Apoderado
// ---------------------------------------------------------------------------

/** Estudiantes asignados al apoderado en sesión. */
export async function obtenerEstudiantesApoderado() {
  const respuesta = await solicitar('/usuarios/apoderados/me/estudiantes');
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) return falloFormato('los estudiantes del apoderado');

  return {
    exitoso: true,
    datos: respuesta.datos.map((estudiante) => ({
      id: estudiante.id,
      nombre: estudiante.nombreCompleto
        ?? [estudiante.nombre, estudiante.apellidoPaterno, estudiante.apellidoMaterno].filter(Boolean).join(' '),
      codigo: estudiante.codigo ?? null,
      dni: estudiante.dni ?? null
    })),
    mensaje: ''
  };
}

/** Reportes de inasistencia de un estudiante asignado al apoderado. */
export async function obtenerReportesApoderado(estudianteId) {
  const respuesta = await solicitar(`/asistencias/reportes/apoderado/${encodeURIComponent(estudianteId)}`);
  if (!respuesta.exitoso) return respuesta;

  const reportes = extraerReportes(respuesta.datos);
  if (!reportes) return falloFormato('los reportes de inasistencia');

  return {
    exitoso: true,
    datos: { reportes: reportes.map(normalizarReporte) },
    mensaje: ''
  };
}

/** Detalle de un reporte de inasistencia de un estudiante asignado al apoderado. */
export async function obtenerDetalleReporteApoderado(estudianteId, reporteId) {
  const respuesta = await solicitar(
    `/asistencias/reportes/apoderado/${encodeURIComponent(estudianteId)}/${encodeURIComponent(reporteId)}`
  );
  if (!respuesta.exitoso) return respuesta;

  const [reporte] = extraerReportes(respuesta.datos) ?? [];
  if (!reporte) return falloFormato('el detalle del reporte de inasistencia');

  return { exitoso: true, datos: normalizarReporte(reporte), mensaje: '' };
}

/**
 * Elige el endpoint según quién consulta: con `estudianteId` se usan las rutas del apoderado; sin él, las del
 * estudiante en sesión.
 */
export const listarReportes = (estudianteId) => (estudianteId == null
  ? obtenerReportesEstudiante()
  : obtenerReportesApoderado(estudianteId));

export const obtenerDetalleReporte = (reporteId, estudianteId) => (estudianteId == null
  ? obtenerDetalleReporteEstudiante(reporteId)
  : obtenerDetalleReporteApoderado(estudianteId, reporteId));
