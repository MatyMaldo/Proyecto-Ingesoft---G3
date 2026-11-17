import { normalizarEstadoSesion } from './estadosSesion.js';
import { aMinutos } from './tiempo.js';

/** Minutos como horas de clase: «7 h» o «7 h 30 min». */
export function formatearHoras(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

/**
 * Carga de un docente en un conjunto de sesiones (normalmente una semana): sesiones y horas por curso y sección, y el
 * total. Las sesiones omitidas no se dictan, así que no suman; se cuentan aparte.
 *
 * @param {Array} sesiones
 * @returns {{ filas: Array<{ clave: string, curso: string, seccion: string, sesiones: number, minutos: number }>,
 *   totalSesiones: number, totalMinutos: number, omitidas: number }}
 */
export function calcularCargaDocente(sesiones) {
  const grupos = new Map();
  let omitidas = 0;

  sesiones.forEach((sesion) => {
    if (normalizarEstadoSesion(sesion.estado) === 'OMITIDA') {
      omitidas += 1;
      return;
    }
    const clave = `${sesion.cursoId ?? sesion.cursoNombre}|${sesion.seccionId ?? sesion.seccionNombre}`;
    const inicio = aMinutos(sesion.horaInicio);
    const fin = aMinutos(sesion.horaFin);
    const minutos = inicio !== null && fin !== null && fin > inicio ? fin - inicio : 0;
    const grupo = grupos.get(clave) ?? {
      clave,
      curso: sesion.cursoNombre,
      seccion: [sesion.gradoNombre, sesion.seccionNombre].filter(Boolean).join(' '),
      sesiones: 0,
      minutos: 0
    };
    grupo.sesiones += 1;
    grupo.minutos += minutos;
    grupos.set(clave, grupo);
  });

  const filas = [...grupos.values()].sort(
    (a, b) => a.curso.localeCompare(b.curso, 'es') || a.seccion.localeCompare(b.seccion, 'es')
  );
  return {
    filas,
    totalSesiones: filas.reduce((total, fila) => total + fila.sesiones, 0),
    totalMinutos: filas.reduce((total, fila) => total + fila.minutos, 0),
    omitidas
  };
}
