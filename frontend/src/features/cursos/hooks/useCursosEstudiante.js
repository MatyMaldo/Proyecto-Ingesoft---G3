import { useCallback, useEffect, useRef, useState } from 'react';

import {
  consultarCursosEstudiante,
  consultarNotasCursoEstudiante
} from '../services/cursosEstudianteService.js';

const DETALLE_INICIAL = Object.freeze({ curso: null, datos: null, cargando: false, error: null });

/**
 * Datos de la pantalla "Mis cursos" del estudiante: la lista de cursos del año de consulta y, al abrir uno, sus
 * evaluaciones y notas (HU-EVAL-03).
 *
 * @param {{ id: *, nombre: string }|null} usuario Estudiante autenticado (`useAuth`).
 * @returns {{
 *   estado: 'cargando'|'listo'|'error',
 *   error: string,
 *   contexto: Object|null,
 *   cursos: Array,
 *   reintentar: () => void,
 *   detalle: {
 *     curso: Object|null, datos: Object|null, cargando: boolean, error: string|null,
 *     abrir: (curso: Object) => void, cerrar: () => void, reintentar: () => void
 *   }
 * }}
 */
export default function useCursosEstudiante(usuario) {
  const [contexto, establecerContexto] = useState(null);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);
  const [detalle, establecerDetalle] = useState(DETALLE_INICIAL);
  // Para ignorar la respuesta de un detalle que ya no es el que el estudiante tiene abierto.
  const consultaDetalle = useRef(0);

  const idUsuario = usuario?.id;
  const nombreUsuario = usuario?.nombre;

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      establecerEstado('cargando');
      establecerError('');
      const respuesta = await consultarCursosEstudiante({ id: idUsuario, nombre: nombreUsuario });
      if (!vigente) {
        return;
      }
      if (!respuesta.exitoso) {
        establecerError(respuesta.mensaje ?? '');
        establecerEstado('error');
        return;
      }
      establecerContexto(respuesta.datos);
      establecerEstado('listo');
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [idUsuario, nombreUsuario, intento]);

  const reintentar = useCallback(() => establecerIntento((valor) => valor + 1), []);

  const abrir = useCallback(async (curso) => {
    if (!contexto) {
      return;
    }
    const consulta = consultaDetalle.current + 1;
    consultaDetalle.current = consulta;
    establecerDetalle({ curso, datos: null, cargando: true, error: null });

    const respuesta = await consultarNotasCursoEstudiante(
      { id: idUsuario, nombre: nombreUsuario },
      curso,
      contexto
    );
    if (consultaDetalle.current !== consulta) {
      return;
    }
    establecerDetalle(respuesta.exitoso
      ? { curso, datos: respuesta.datos, cargando: false, error: null }
      : { curso, datos: null, cargando: false, error: respuesta.mensaje ?? '' });
  }, [contexto, idUsuario, nombreUsuario]);

  const cerrar = useCallback(() => {
    consultaDetalle.current += 1;
    establecerDetalle(DETALLE_INICIAL);
  }, []);

  return {
    estado,
    error,
    contexto,
    cursos: contexto?.cursos ?? [],
    reintentar,
    detalle: {
      ...detalle,
      abrir,
      cerrar,
      reintentar: () => {
        if (detalle.curso) {
          abrir(detalle.curso);
        }
      }
    }
  };
}
