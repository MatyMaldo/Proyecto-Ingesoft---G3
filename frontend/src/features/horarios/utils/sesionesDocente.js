import {
  etiquetaEstadoAsistencia,
  normalizarEstadoAsistencia,
  tonoEstadoAsistencia
} from '../../asistencia/utils/estadosAsistencia.js';
import { normalizarEstadoSesion } from './estadosSesion.js';

/** «1er Grado de Secundaria» → «1er Grado»: el nombre completo sobra en listas y bloques estrechos. */
export function acortarGrado(grado) {
  return String(grado ?? '')
    .replace(/\s+de\s+(Secundaria|Primaria|Inicial)$/i, '')
    .replace(/\s+(Secundaria|Primaria|Inicial)$/i, '')
    .trim();
}

/** Fecha y hora (locales) en que empieza o termina una sesión. */
function momento(sesion, hora) {
  return new Date(`${sesion.fecha}T${String(hora).slice(0, 8)}`);
}

/**
 * Elige la sesión que el docente tiene "ahora" o, si no hay ninguna, la siguiente. Se ignoran las omitidas y las ya
 * terminadas (por hora o por estado).
 *
 * @param {Array} sesiones Sesiones del docente.
 * @param {Date} [ahora]
 * @returns {{ sesion: Object, tipo: 'ahora'|'hoy'|'proxima' }|null}
 *   `ahora`: en curso; `hoy`: empieza más tarde hoy; `proxima`: es de otro día.
 */
export function elegirSesionDestacada(sesiones, ahora = new Date()) {
  const vigentes = sesiones
    .filter((sesion) => {
      const estado = normalizarEstadoSesion(sesion.estado);
      return estado !== 'OMITIDA' && estado !== 'FINALIZADA' && momento(sesion, sesion.horaFin) > ahora;
    })
    .sort((a, b) => momento(a, a.horaInicio) - momento(b, b.horaInicio));

  const sesion = vigentes[0];
  if (!sesion) return null;
  if (momento(sesion, sesion.horaInicio) <= ahora) return { sesion, tipo: 'ahora' };
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  return { sesion, tipo: sesion.fecha === hoy ? 'hoy' : 'proxima' };
}

/** Sesiones de una fecha (`YYYY-MM-DD`), por hora de inicio. Con `incluirOmitidas` también las omitidas. */
export function sesionesDelDia(sesiones, fecha, { incluirOmitidas = false } = {}) {
  return sesiones
    .filter((sesion) => sesion.fecha === fecha
      && (incluirOmitidas || normalizarEstadoSesion(sesion.estado) !== 'OMITIDA'))
    .sort((a, b) => String(a.horaInicio).localeCompare(String(b.horaInicio)));
}

/**
 * Indicadores de asistencia de una sesión del docente: su propia asistencia y la de los estudiantes. Solo aplican a
 * sesiones ya iniciadas y que no están omitidas; si la respuesta no trae los datos (otros roles) no hay indicadores.
 *
 * @returns {Array<{ id: string, texto: string, tono: string }>}
 */
export function indicadoresAsistencia(sesion) {
  if (!sesion || sesion.asistenciaEstudiantesRegistrada == null) return [];
  const estado = normalizarEstadoSesion(sesion.estado);
  if (estado !== 'ACTIVA' && estado !== 'FINALIZADA') return [];

  const activa = estado === 'ACTIVA';
  const indicadores = [];

  const propia = normalizarEstadoAsistencia(sesion.asistenciaDocente);
  indicadores.push(propia
    ? {
      id: 'docente',
      texto: `Mi asistencia · ${etiquetaEstadoAsistencia(propia)}`,
      tono: tonoEstadoAsistencia(propia)
    }
    : {
      id: 'docente',
      texto: `Mi asistencia · ${activa ? 'Pendiente' : 'Sin registro'}`,
      tono: activa ? 'ambar' : 'gris'
    });

  indicadores.push(sesion.asistenciaEstudiantesRegistrada
    ? { id: 'estudiantes', texto: 'Estudiantes · Registrada', tono: 'verde' }
    : {
      id: 'estudiantes',
      texto: `Estudiantes · ${activa ? 'Pendiente' : 'Sin registro'}`,
      tono: activa ? 'ambar' : 'gris'
    });

  return indicadores;
}

/** Indicadores que se desprenden del detalle de asistencia de una sesión (para refrescar el horario sin recargarlo). */
export function indicadoresDeDetalle(detalle) {
  return {
    asistenciaDocente: detalle?.asistenciaDocente?.estado ?? null,
    asistenciaEstudiantesRegistrada: (detalle?.estudiantes ?? []).some((estudiante) => Boolean(estudiante.estado))
  };
}
