/**
 * Arma la matriz "competencia × evaluaciones del bimestre" de la pestaña Evaluaciones y Notas (HU-EVAL-03).
 * Son funciones puras sobre el modelo que devuelve `consultarNotasCursoEstudiante`.
 */

/** Id del bimestre de una evaluación: el propio, o el del bimestre que tenga su nombre (datos simulados). */
function idBimestreDe(evaluacion, bimestres) {
  return evaluacion.bimestreId
    ?? bimestres.find((bimestre) => bimestre.nombre === evaluacion.bimestreNombre)?.id
    ?? null;
}

function porFecha(a, b) {
  return String(a.fecha).localeCompare(String(b.fecha)) || String(a.id).localeCompare(String(b.id));
}

/**
 * Bimestre que se muestra al abrir: el último que ya tiene evaluaciones o notas de competencia; si ninguno,
 * el primero.
 *
 * @param {{ bimestres: Array<{ id: string }>, evaluaciones: Array, competencias: Array }} datos
 * @returns {string} Id del bimestre ('' si el curso no define bimestres).
 */
export function bimestreInicial(datos) {
  const conDatos = datos.bimestres.filter((bimestre) => (
    datos.evaluaciones.some((evaluacion) => idBimestreDe(evaluacion, datos.bimestres) === bimestre.id)
    || datos.competencias.some((competencia) => competencia.notasPorBimestre?.[bimestre.id])
  ));
  return (conDatos.at(-1) ?? datos.bimestres[0])?.id ?? '';
}

/**
 * Matriz de un bimestre.
 *
 * Cada fila es una competencia del curso (más las que aparezcan en evaluaciones aunque el catálogo no las traiga).
 * Las columnas "Ev. n" numeran, dentro de cada competencia, sus evaluaciones del bimestre por fecha; hay tantas
 * columnas como evaluaciones tenga la competencia que más tiene. Cada fila trae además la nota de la competencia en
 * cada bimestre (`notasPorBimestre`, HU-EVAL-07). El curso no tiene nota final (HU-EVAL-03).
 *
 * @param {{ bimestres: Array, evaluaciones: Array, competencias: Array }} datos
 * @param {string} bimestreId
 * @returns {{
 *   columnas: number,
 *   filas: Array<{
 *     id: string, nombre: string, evaluaciones: Array<Object|null>,
 *     notasPorBimestre: Object<string, string>
 *   }>,
 *   evaluaciones: Array<Object>
 * }} `evaluaciones` son las del bimestre por fecha, cada una con su `numero` ("Ev. n") y `competenciaNombre`.
 */
export function armarMatrizBimestre(datos, bimestreId) {
  const delBimestre = datos.evaluaciones
    .filter((evaluacion) => idBimestreDe(evaluacion, datos.bimestres) === bimestreId)
    .sort(porFecha);

  const filas = new Map(datos.competencias.map((competencia) => [competencia.nombre, {
    id: competencia.id,
    nombre: competencia.nombre,
    evaluaciones: [],
    notasPorBimestre: competencia.notasPorBimestre ?? {}
  }]));
  for (const evaluacion of delBimestre) {
    if (!filas.has(evaluacion.competenciaNombre)) {
      filas.set(evaluacion.competenciaNombre, {
        id: evaluacion.competenciaNombre,
        nombre: evaluacion.competenciaNombre,
        evaluaciones: [],
        notasPorBimestre: {}
      });
    }
  }

  const numeradas = delBimestre.map((evaluacion) => {
    const fila = filas.get(evaluacion.competenciaNombre);
    fila.evaluaciones.push(evaluacion);
    return { ...evaluacion, numero: fila.evaluaciones.length };
  });

  const columnas = Math.max(0, ...[...filas.values()].map((fila) => fila.evaluaciones.length));
  return {
    columnas,
    filas: [...filas.values()].map((fila) => ({
      ...fila,
      evaluaciones: Array.from({ length: columnas }, (_, indice) => fila.evaluaciones[indice] ?? null)
    })),
    evaluaciones: numeradas
  };
}
