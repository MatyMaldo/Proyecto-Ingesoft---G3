import estilos from './Avatar.module.css';

/**
 * Iniciales de una persona: primera letra del nombre y primera del apellido.
 *
 * @param {string} [nombre]
 * @param {string} [apellido]
 * @returns {string} Hasta dos letras en mayúscula; `'?'` si no hay datos.
 */
export function obtenerIniciales(nombre, apellido) {
  const inicial = (texto) => String(texto ?? '').trim().charAt(0).toLocaleUpperCase('es');
  return `${inicial(nombre)}${inicial(apellido)}` || '?';
}

/**
 * Iniciales de un nombre completo escrito en una sola cadena: la primera letra de cada una de las dos primeras
 * palabras ("Prof. Quispe" → "PQ"); con una sola palabra, solo su inicial.
 *
 * @param {string} [nombreCompleto]
 * @returns {string} Hasta dos letras en mayúscula; `'?'` si no hay datos.
 */
export function obtenerInicialesDeNombre(nombreCompleto) {
  const palabras = String(nombreCompleto ?? '').trim().split(/\s+/).filter(Boolean);
  return palabras.slice(0, 2).map((palabra) => palabra.charAt(0).toLocaleUpperCase('es')).join('') || '?';
}

/**
 * Círculo con las iniciales de una persona. Es decorativo: el nombre siempre va como texto al lado.
 *
 * @param {Object} props
 * @param {string} [props.nombre]
 * @param {string} [props.apellido]
 * @param {string} [props.iniciales] Iniciales ya calculadas; si se indican, sustituyen a las de `nombre` y `apellido`.
 * @param {boolean} [props.atenuado] Se ve más tenue (p. ej. cuenta desactivada).
 * @param {string} [props.className]
 */
export default function Avatar({ nombre, apellido, iniciales, atenuado = false, className }) {
  const clases = [estilos.avatar, atenuado ? estilos.atenuado : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <span className={clases} aria-hidden="true">
      {iniciales || obtenerIniciales(nombre, apellido)}
    </span>
  );
}
