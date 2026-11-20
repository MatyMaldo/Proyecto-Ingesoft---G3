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

// ---------------------------------------------------------------------------
// Docente: generación de reportes de inasistencia
// ---------------------------------------------------------------------------

/**
 * Asignaciones de curso del docente en sesión con su año académico (`/evaluaciones/contexto-docente`).
 *
 * @returns {Promise<{ exitoso: boolean, datos: { anioAcademico: Object, asignaciones: Array }|null, mensaje: string }>}
 */
export async function obtenerAsignacionesDocente() {
  const respuesta = await solicitar('/evaluaciones/contexto-docente');
  if (!respuesta.exitoso) return respuesta;

  const datos = respuesta.datos;
  if (!datos?.anioAcademico || !Array.isArray(datos.asignaciones)) {
    return falloFormato('las asignaciones del docente');
  }

  const anioAcademico = {
    id: datos.anioAcademico.id,
    anio: datos.anioAcademico.anio,
    fechaInicio: datos.anioAcademico.fechaInicio ?? null,
    fechaFin: datos.anioAcademico.fechaFin ?? null
  };

  return {
    exitoso: true,
    datos: {
      anioAcademico,
      asignaciones: datos.asignaciones.map((asignacion) => ({
        id: asignacion.idAsignacionCurso,
        curso: asignacion.nombreCurso ?? '',
        grado: asignacion.nombreGrado ?? '',
        seccion: asignacion.nombreSeccion ?? '',
        anio: anioAcademico.anio
      }))
    },
    mensaje: ''
  };
}

/** Estudiantes con matrícula confirmada de una asignación de curso. */
export async function obtenerEstudiantesAsignacion(asignacionId) {
  const respuesta = await solicitar(`/asignaciones-curso/${encodeURIComponent(asignacionId)}/estudiantes`);
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) return falloFormato('los estudiantes de la asignación');

  return {
    exitoso: true,
    datos: respuesta.datos
      .filter((estudiante) => !estudiante.estadoMatricula || estudiante.estadoMatricula === 'CONFIRMADA')
      .map((estudiante) => ({
        id: estudiante.idEstudiante ?? estudiante.id,
        codigo: estudiante.codigo ?? '',
        nombre: [estudiante.nombre, estudiante.apellidoPaterno, estudiante.apellidoMaterno].filter(Boolean).join(' ')
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    mensaje: ''
  };
}

const MENSAJE_GENERICO_CLIENTE = 'No se pudo completar la operación.';
const MENSAJE_REPORTE_DUPLICADO = 'Ya existe un reporte para este estudiante en el rango de fechas seleccionado.';

/**
 * Reportes ya emitidos en esta sesión del navegador (estudiante + rango). Es una protección del frontend mientras el
 * backend no rechaza los duplicados: sobrevive a recargas de la pestaña, pero no a otro navegador u otro docente.
 */
const CLAVE_REPORTES_EMITIDOS = 'rendimiento.reportesEmitidos';
/** Envíos en curso, para que dos clics seguidos no lancen dos solicitudes iguales. */
const reportesEnCurso = new Set();

const claveReporte = ({ estudianteId, desde, hasta }) => `${Number(estudianteId)}|${desde}|${hasta}`;

function leerReportesEmitidos() {
  try {
    const guardados = JSON.parse(sessionStorage.getItem(CLAVE_REPORTES_EMITIDOS) ?? '[]');
    return new Set(Array.isArray(guardados) ? guardados : []);
  } catch {
    return new Set();
  }
}

function registrarReporteEmitido(clave) {
  const emitidos = leerReportesEmitidos();
  emitidos.add(clave);
  try {
    sessionStorage.setItem(CLAVE_REPORTES_EMITIDOS, JSON.stringify([...emitidos]));
  } catch {
    // Sin sessionStorage (modo privado lleno, etc.) solo se pierde esta protección local.
  }
}

/**
 * Crea un reporte de inasistencia. El backend valida que el estudiante tenga faltas o tardanzas en el rango; esos
 * rechazos llegan como `exitoso: false` con su mensaje. Antes de llamar, se bloquea el envío si ya se emitió en esta
 * sesión un reporte para el mismo estudiante y rango de fechas, o si hay uno idéntico en curso.
 *
 * @param {Object} datos
 * @param {number} datos.asignacionId
 * @param {number} datos.estudianteId
 * @param {string} datos.desde `YYYY-MM-DD`
 * @param {string} datos.hasta `YYYY-MM-DD`
 * @param {string} datos.comentarios
 */
export async function generarReporteInasistencia({ asignacionId, estudianteId, desde, hasta, comentarios }) {
  const clave = claveReporte({ estudianteId, desde, hasta });
  if (reportesEnCurso.has(clave) || leerReportesEmitidos().has(clave)) {
    return { exitoso: false, datos: null, mensaje: MENSAJE_REPORTE_DUPLICADO, estado: 409 };
  }

  reportesEnCurso.add(clave);
  let respuesta;
  try {
    respuesta = await solicitar(
      `/asistencias/reportes/docente/asignaciones/${encodeURIComponent(asignacionId)}`
        + `/estudiantes/${encodeURIComponent(estudianteId)}`,
      {
        metodo: 'POST',
        cuerpo: { desde, hasta, comentarios: comentarios.trim() }
      }
    );
  } finally {
    reportesEnCurso.delete(clave);
  }

  if (respuesta.exitoso) {
    registrarReporteEmitido(clave);
    return respuesta;
  }

  // Si el backend no envía un mensaje propio, se usa uno según el código HTTP.
  if (!respuesta.mensaje || respuesta.mensaje === MENSAJE_GENERICO_CLIENTE) {
    const porEstado = {
      409: MENSAJE_REPORTE_DUPLICADO,
      422: 'El estudiante no tiene faltas ni tardanzas en el rango de fechas seleccionado.'
    };
    return { ...respuesta, mensaje: porEstado[respuesta.estado] ?? 'No se pudo generar el reporte de inasistencia.' };
  }
  return respuesta;
}
