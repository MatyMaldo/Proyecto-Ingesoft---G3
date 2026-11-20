import { useEffect, useState } from 'react';

import {
  listarReportes,
  obtenerDetalleReporte,
  obtenerEstudiantesApoderado
} from '../services/rendimientoService.js';

/**
 * Datos de la pantalla de Rendimiento académico: reportes de inasistencia.
 * El listado no trae las faltas ni el alumno, así que después de cargarlo se pide el detalle de cada reporte para
 * completarlos; esos detalles se guardan para que el modal no tenga que volver a pedirlos.
 *
 * @param {Object} [opciones]
 * @param {boolean} [opciones.habilitado] Si es `false`, no se consulta la API.
 * @param {number|string|null} [opciones.estudianteId] Solo para el apoderado: estudiante cuyos reportes se consultan.
 *   Sin él se consultan los reportes del estudiante en sesión.
 */
export default function useRendimiento({ habilitado = true, estudianteId = null } = {}) {
  const [reportes, establecerReportes] = useState([]);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [recargaClave, establecerRecargaClave] = useState(0);
  // id de reporte → detalle normalizado (con `faltas`).
  const [detalles, establecerDetalles] = useState({});

  useEffect(() => {
    if (!habilitado) return undefined;
    let cancelado = false;
    establecerEstado('cargando');
    establecerError('');
    establecerReportes([]);
    establecerDetalles({});

    listarReportes(estudianteId).then((respuesta) => {
      if (cancelado) return;
      if (!respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudieron cargar los reportes de inasistencia.');
        establecerEstado('error');
        return;
      }
      const lista = respuesta.datos.reportes ?? [];
      establecerReportes(lista);
      establecerEstado('listo');

      // Cada detalle se agrega en cuanto llega; si uno falla, su fila conserva los datos del listado.
      lista.forEach((reporte) => {
        obtenerDetalleReporte(reporte.id, estudianteId).then((detalle) => {
          if (cancelado || !detalle.exitoso) return;
          establecerDetalles((actuales) => ({ ...actuales, [reporte.id]: detalle.datos }));
        });
      });
    });

    return () => {
      cancelado = true;
    };
  }, [habilitado, estudianteId, recargaClave]);

  const reportesCompletos = reportes.map((reporte) => {
    const detalle = detalles[reporte.id];
    return detalle
      ? { ...reporte, cantidadFaltas: detalle.cantidadFaltas, estudiante: reporte.estudiante || detalle.estudiante }
      : reporte;
  });

  return {
    reportes: reportesCompletos,
    detalles,
    estado,
    error,
    recargar: () => establecerRecargaClave((valor) => valor + 1)
  };
}

/**
 * Estudiantes asignados al apoderado en sesión, con el primero seleccionado por defecto.
 *
 * @param {Object} [opciones]
 * @param {boolean} [opciones.habilitado] Si es `false`, no se consulta la API (rol distinto de APODERADO).
 */
export function useEstudiantesApoderado({ habilitado = true } = {}) {
  const [estudiantes, establecerEstudiantes] = useState([]);
  const [estudianteId, establecerEstudianteId] = useState(null);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [intentoClave, establecerIntentoClave] = useState(0);

  useEffect(() => {
    if (!habilitado) return undefined;
    let cancelado = false;
    establecerEstado('cargando');
    establecerError('');

    obtenerEstudiantesApoderado().then((respuesta) => {
      if (cancelado) return;
      if (!respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudieron cargar tus estudiantes.');
        establecerEstado('error');
        return;
      }
      establecerEstudiantes(respuesta.datos);
      establecerEstudianteId((actual) => (
        respuesta.datos.some((estudiante) => estudiante.id === actual) ? actual : respuesta.datos[0]?.id ?? null
      ));
      establecerEstado('listo');
    });

    return () => {
      cancelado = true;
    };
  }, [habilitado, intentoClave]);

  const seleccionarEstudiante = (valor) => {
    establecerEstudianteId(valor === '' ? null : Number(valor));
  };

  return {
    estudiantes,
    estudianteId,
    estudianteSeleccionado: estudiantes.find((estudiante) => estudiante.id === estudianteId) ?? null,
    seleccionarEstudiante,
    estado,
    error,
    reintentar: () => establecerIntentoClave((valor) => valor + 1)
  };
}
