import { useEffect, useState } from 'react';

/**
 * Indica si una media query CSS coincide ahora y se actualiza cuando cambia (p. ej. al girar el
 * dispositivo). Sin `window.matchMedia` (pruebas con jsdom) devuelve `false`.
 *
 * @param {string} consulta Media query, p. ej. `'(max-width: 767px)'`.
 * @returns {boolean}
 */
export default function useCoincideMedia(consulta) {
  const [coincide, establecerCoincide] = useState(() => window.matchMedia?.(consulta).matches ?? false);

  useEffect(() => {
    const lista = window.matchMedia?.(consulta);
    if (!lista) {
      return undefined;
    }

    const alCambiar = (evento) => establecerCoincide(evento.matches);
    establecerCoincide(lista.matches);
    lista.addEventListener('change', alCambiar);
    return () => lista.removeEventListener('change', alCambiar);
  }, [consulta]);

  return coincide;
}
