/** "BIM_1" → "Bimestre 1". Si el nombre no tiene ese formato, se muestra tal cual. */
export function etiquetaBimestre(nombre) {
  const coincidencia = /^BIM_(\d+)$/.exec(String(nombre ?? ''));
  return coincidencia ? `Bimestre ${coincidencia[1]}` : String(nombre ?? '');
}

/** "2026-05-16" → "16/05/2026". */
export function formatearFechaLibreta(fecha) {
  return fecha ? String(fecha).split('-').reverse().join('/') : 'fecha no disponible';
}

/**
 * Agrupa las competencias calificadas por curso, conservando el orden en que llegan.
 *
 * @param {Array<{ nombreCurso: string }>} [notas]
 * @returns {Array<[string, Array<Object>]>}
 */
export function agruparNotasPorCurso(notas = []) {
  const cursos = new Map();
  notas.forEach((nota) => {
    const competencias = cursos.get(nota.nombreCurso) ?? [];
    competencias.push(nota);
    cursos.set(nota.nombreCurso, competencias);
  });
  return [...cursos.entries()];
}
