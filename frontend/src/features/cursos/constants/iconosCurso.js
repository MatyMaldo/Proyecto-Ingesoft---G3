/**
 * Emoji decorativo de cada curso, tomado del prototipo. Es solo presentación (no viaja en la API),
 * por eso vive aquí y no en los datos. Un curso sin icono definido usa `ICONO_CURSO_POR_DEFECTO`.
 */
const ICONOS_POR_NOMBRE = Object.freeze({
  matematicas: '📐',
  comunicacion: '📖',
  'ciencias sociales': '🌍',
  'ciencia y tecnologia': '🔬',
  ingles: '🌐',
  'educacion fisica': '⚽',
  'arte y cultura': '🎨'
});

export const ICONO_CURSO_POR_DEFECTO = '📚';

function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * @param {string} nombreCurso
 * @returns {string}
 */
export function obtenerIconoCurso(nombreCurso) {
  return ICONOS_POR_NOMBRE[normalizar(nombreCurso)] ?? ICONO_CURSO_POR_DEFECTO;
}
