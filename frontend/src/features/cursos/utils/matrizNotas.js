/**
 * Arma la matriz "competencia × bimestre" y la lista de evaluaciones del periodo (HU-EVAL-03).
 * Las evaluaciones ya no están vinculadas a una competencia.
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
 * Competencias con sus logros bimestrales y evaluaciones del bimestre seleccionado, sin asociación entre ambas.
 *
 * @param {{ bimestres: Array, evaluaciones: Array, competencias: Array }} datos
 * @param {string} bimestreId
 * @returns {{ filas: Array, evaluaciones: Array }}
 */
export function armarMatrizBimestre(datos, bimestreId) {
  const evaluaciones = datos.evaluaciones
    .filter((evaluacion) => idBimestreDe(evaluacion, datos.bimestres) === bimestreId)
    .sort(porFecha);
  const filas = datos.competencias.map((competencia) => ({
    id: competencia.id,
    nombre: competencia.nombre,
    notasPorBimestre: competencia.notasPorBimestre ?? {}
  }));

  return { filas, evaluaciones };
}
