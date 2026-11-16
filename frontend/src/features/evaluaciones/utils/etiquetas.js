/** «1er Grado de Secundaria» → «1er Grado»: los chips y títulos usan el nombre corto; el completo va en los diálogos. */
export function nombreCortoGrado(nombre) {
  return String(nombre ?? '').replace(/\s+de\s+(Secundaria|Primaria|Inicial)$/i, '').trim();
}

/** Grado corto y sección juntos («1er Grado A»). */
export function etiquetaGradoSeccion(seccion) {
  return `${nombreCortoGrado(seccion?.gradoNombre)} ${seccion?.nombre ?? ''}`.trim();
}

/**
 * Opciones del selector de curso: solo el nombre del curso. Si el docente tiene dos cursos con el mismo nombre
 * (p. ej. Matemáticas en dos grados), se añade el grado corto solo a esos para distinguirlos.
 *
 * @param {Array<{ cursoId: string|number, cursoNombre: string, secciones: Array }>} asignaciones
 * @returns {Array<{ valor: string, etiqueta: string }>}
 */
export function opcionesCurso(asignaciones = []) {
  const repetidos = new Set(
    asignaciones
      .map((item) => item.cursoNombre)
      .filter((nombre, indice, nombres) => nombres.indexOf(nombre) !== indice)
  );
  return asignaciones.map((item) => ({
    valor: String(item.cursoId),
    etiqueta: repetidos.has(item.cursoNombre)
      ? `${item.cursoNombre} · ${nombreCortoGrado(item.secciones[0]?.gradoNombre)}`
      : item.cursoNombre
  }));
}
