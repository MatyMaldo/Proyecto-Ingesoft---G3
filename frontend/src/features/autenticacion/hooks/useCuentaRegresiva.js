import { useEffect, useState } from 'react';

/**
 * Calcula los segundos restantes de una cuenta regresiva a partir de un
 * instante de inicio, recalculando siempre contra `Date.now()` (no
 * decrementando un contador) para no desfasarse si la pestaña se congela
 * (docs/planes/restablecer-contrasena.md §7.1).
 *
 * @param {number | null} instanteInicio Epoch ms de inicio, o `null` si no hay espera vigente.
 * @param {number} duracionSegundos Duración total de la cuenta regresiva.
 * @returns {number} Segundos restantes, entero ≥ 0.
 */
export default function useCuentaRegresiva(instanteInicio, duracionSegundos) {
  const [segundosRestantes, establecerSegundosRestantes] = useState(() =>
    calcularSegundosRestantes(instanteInicio, duracionSegundos)
  );

  useEffect(() => {
    establecerSegundosRestantes(calcularSegundosRestantes(instanteInicio, duracionSegundos));

    if (instanteInicio === null) {
      return undefined;
    }

    const intervalo = setInterval(() => {
      const restantes = calcularSegundosRestantes(instanteInicio, duracionSegundos);
      establecerSegundosRestantes(restantes);

      if (restantes <= 0) {
        clearInterval(intervalo);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [instanteInicio, duracionSegundos]);

  return segundosRestantes;
}

function calcularSegundosRestantes(instanteInicio, duracionSegundos) {
  if (instanteInicio === null) {
    return 0;
  }

  const restante = instanteInicio + duracionSegundos * 1000 - Date.now();
  return Math.max(0, Math.ceil(restante / 1000));
}
