import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  listarBimestresAnio,
  listarContextoDocenteEvaluaciones,
  listarEvaluaciones
} from '../services/evaluacionesService.js';

/**
 * Datos de la pantalla de Evaluaciones del docente: su contexto (año vigente, cursos y secciones), las evaluaciones
 * de cada asignación y el curso y la sección elegidos. Las operaciones de los diálogos (crear evaluación, registrar
 * notas) viven en sus propios componentes y solo avisan a la página cuando algo cambia.
 *
 * @param {Object|null} usuario Docente autenticado.
 * @returns {{
 *   estado: 'cargando'|'listo'|'error', errorCarga: string, recargar: () => void,
 *   contexto: Object|null, anioVigente: Object|undefined,
 *   cursoId: string, seccionId: string,
 *   seleccionarCurso: (valor: string) => void, establecerSeccionId: (valor: string) => void,
 *   asignacion: Object|undefined, seccion: Object|undefined, competencias: Array,
 *   asignacionSeleccionada: Object|null, evaluacionesVisibles: Array,
 *   agregarEvaluacion: (evaluacion: Object) => void,
 *   esAnioVigente: (evaluacion: Object) => boolean
 * }}
 */
export default function useEvaluaciones(usuario) {
  const [contexto, establecerContexto] = useState(null);
  const [evaluaciones, establecerEvaluaciones] = useState([]);
  const [estado, establecerEstado] = useState('cargando');
  const [errorCarga, establecerErrorCarga] = useState('');
  const [cursoId, establecerCursoId] = useState('');
  const [seccionId, establecerSeccionId] = useState('');
  const [intento, establecerIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      establecerEstado('cargando');
      establecerErrorCarga('');
      const respuestaContexto = await listarContextoDocenteEvaluaciones(usuario);
      if (cancelado) return;
      if (!respuestaContexto.exitoso) {
        establecerErrorCarga(respuestaContexto.mensaje || 'No se pudo cargar la información de evaluaciones.');
        establecerEstado('error');
        return;
      }

      const anioAcademico = respuestaContexto.datos.anioAcademico;
      const asignaciones = (respuestaContexto.datos.asignaciones ?? []).flatMap((curso) =>
        curso.secciones.map((item) => ({
          idAsignacionCurso: item.idAsignacionCurso,
          cursoId: curso.cursoId,
          cursoNombre: curso.cursoNombre,
          seccionId: item.id,
          seccionNombre: item.nombre,
          gradoId: item.gradoId,
          gradoNombre: item.gradoNombre,
          anioAcademico
        }))
      );
      const [respuestaBimestres, respuestasEvaluaciones] = await Promise.all([
        listarBimestresAnio(anioAcademico.id),
        Promise.all(asignaciones.map((item) => listarEvaluaciones(item.idAsignacionCurso, item, anioAcademico)))
      ]);
      if (cancelado) return;

      const error = [respuestaBimestres, ...respuestasEvaluaciones].find((respuesta) => !respuesta.exitoso);
      if (error) {
        establecerErrorCarga(error.mensaje || 'No se pudo cargar la información de evaluaciones.');
        establecerEstado('error');
        return;
      }

      establecerContexto({ ...respuestaContexto.datos, bimestres: respuestaBimestres.datos });
      establecerEvaluaciones(respuestasEvaluaciones.flatMap((respuesta) => respuesta.datos ?? []));
      const primeraAsignacion = respuestaContexto.datos.asignaciones?.[0];
      establecerCursoId((actual) => actual || String(primeraAsignacion?.cursoId ?? ''));
      establecerSeccionId((actual) => actual || String(primeraAsignacion?.secciones?.[0]?.id ?? ''));
      establecerEstado('listo');
    }

    cargar();
    return () => {
      cancelado = true;
    };
    // El contexto depende del docente; `intento` permite reintentar sin cambiar de usuario.
  }, [usuario?.id, intento]);

  const recargar = useCallback(() => establecerIntento((valor) => valor + 1), []);

  const asignacion = contexto?.asignaciones?.find((item) => String(item.cursoId) === cursoId);
  const seccion = (asignacion?.secciones ?? []).find((item) => String(item.id) === seccionId);
  const competencias = asignacion?.competencias ?? [];
  const anioVigente = contexto?.anioAcademico;

  const asignacionSeleccionada = seccion
    ? {
      idAsignacionCurso: seccion.idAsignacionCurso,
      cursoId: asignacion.cursoId,
      cursoNombre: asignacion.cursoNombre,
      seccionId: seccion.id,
      seccionNombre: seccion.nombre,
      gradoId: seccion.gradoId,
      gradoNombre: seccion.gradoNombre,
      anioAcademico: anioVigente
    }
    : null;

  const evaluacionesVisibles = useMemo(
    () => evaluaciones.filter((item) => String(item.cursoId) === cursoId && String(item.seccionId) === seccionId),
    [evaluaciones, cursoId, seccionId]
  );

  const esAnioVigente = (evaluacion) => {
    if (!anioVigente || anioVigente.vigente === false) return false;
    if (evaluacion.anioAcademicoId != null && anioVigente.id != null) {
      return String(evaluacion.anioAcademicoId) === String(anioVigente.id);
    }
    return String(evaluacion.anioAcademico) === String(anioVigente.anio);
  };

  // Cambiar de curso lleva a la primera sección de ese curso, porque cada curso tiene las suyas.
  const seleccionarCurso = (valor) => {
    const nueva = contexto?.asignaciones?.find((item) => String(item.cursoId) === valor);
    establecerCursoId(valor);
    establecerSeccionId(String(nueva?.secciones?.[0]?.id ?? ''));
  };

  const agregarEvaluacion = (evaluacion) => establecerEvaluaciones((actuales) => [...actuales, evaluacion]);

  return {
    estado,
    errorCarga,
    recargar,
    contexto,
    anioVigente,
    cursoId,
    seccionId,
    seleccionarCurso,
    establecerSeccionId,
    asignacion,
    seccion,
    competencias,
    asignacionSeleccionada,
    evaluacionesVisibles,
    agregarEvaluacion,
    esAnioVigente
  };
}
