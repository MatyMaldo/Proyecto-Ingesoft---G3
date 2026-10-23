/** Bimestres que se pueden asignar a un año académico. */
export const BIMESTRES = ['BIM_1', 'BIM_2', 'BIM_3', 'BIM_4'];

/**
 * Ordena los períodos académicos: años más recientes primero y, dentro de un mismo año, por bimestre
 * (BIM_1, BIM_2…). No modifica el arreglo original.
 *
 * @param {Array<{ anio: number, bimestre?: string }>} anios
 * @returns {Array}
 */
export const ordenarAnios = (anios) => [...anios].sort(
  (a, b) => b.anio - a.anio || String(a.bimestre ?? '').localeCompare(String(b.bimestre ?? ''))
);

const ANIO_MINIMO = 2000;
const ANIO_MAXIMO = 2100;

/**
 * Mensaje de error del período de matrícula, o `''` si es válido o aún está incompleto.
 * Solo revisa el orden de las fechas; la obligatoriedad la valida `validarAnioAcademico`.
 *
 * @param {string} inicio `'AAAA-MM-DD'` o `''`.
 * @param {string} fin `'AAAA-MM-DD'` o `''`.
 * @returns {string}
 */
export function obtenerMensajeRangoMatricula(inicio, fin) {
  if (inicio && fin && inicio > fin) {
    return 'La fecha de fin de la matrícula no puede ser anterior a la de inicio.';
  }

  return '';
}

/**
 * Valida el formulario de creación de un año académico.
 * Un año puede tener varios períodos, uno por bimestre: lo que no se admite es repetir
 * la misma pareja año + bimestre (por ejemplo, dos veces 2026 y BIM_1).
 *
 * @param {{ anio: string, bimestre: string, inicioMatricula: string, finMatricula: string }} datos
 * @param {{ anios?: Array<{ anio: number, bimestre?: string }>, bimestres?: string[] }} [contexto]
 *   Períodos ya registrados (para evitar duplicados) y bimestres válidos.
 * @returns {Object} Errores por campo (`anio`, `bimestre`, `periodo`, `periodoMatricula`); vacío si todo es válido.
 *   `periodo` es el error de la pareja año + bimestre repetida.
 */
export function validarAnioAcademico(datos, { anios = [], bimestres = BIMESTRES } = {}) {
  const errores = {};
  const anio = String(datos.anio ?? '').trim();

  if (!/^\d{4}$/.test(anio)) {
    errores.anio = 'Ingresa un año de 4 dígitos.';
  } else if (Number(anio) < ANIO_MINIMO || Number(anio) > ANIO_MAXIMO) {
    errores.anio = `El año debe estar entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`;
  }

  const bimestreValido = bimestres.includes(datos.bimestre);

  if (!bimestreValido) {
    errores.bimestre = 'Selecciona un bimestre.';
  }

  // Solo se compara la pareja cuando el año y el bimestre son válidos por separado.
  const periodoRepetido = anios.some((item) => Number(item.anio) === Number(anio) && item.bimestre === datos.bimestre);

  if (!errores.anio && bimestreValido && periodoRepetido) {
    errores.periodo = `Ya existe un período para el año ${anio} y el bimestre ${datos.bimestre}.`;
  }

  if (!datos.inicioMatricula || !datos.finMatricula) {
    errores.periodoMatricula = 'Indica las fechas de inicio y fin del período de matrícula.';
  } else {
    const mensajeRango = obtenerMensajeRangoMatricula(datos.inicioMatricula, datos.finMatricula);

    if (mensajeRango) {
      errores.periodoMatricula = mensajeRango;
    }
  }

  return errores;
}
