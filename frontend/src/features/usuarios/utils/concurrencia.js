/**
 * Recorre `elementos` ejecutando `tarea` sobre cada uno, con como máximo `limite` tareas en curso a la vez.
 * Cuando una tarea termina, el hueco lo toma el siguiente elemento pendiente (no se espera por tandas).
 * Resuelve cuando todas terminaron. `tarea` debe capturar sus propios errores: una excepción no controlada
 * rechaza la promesa devuelta, aunque las demás tareas en curso sigan hasta terminar.
 *
 * @template T
 * @param {T[]} elementos
 * @param {number} limite Máximo de tareas simultáneas (mínimo 1).
 * @param {(elemento: T, indice: number) => Promise<void>} tarea
 * @returns {Promise<void>}
 */
export async function ejecutarConConcurrencia(elementos, limite, tarea) {
  let siguiente = 0;

  const trabajador = async () => {
    while (siguiente < elementos.length) {
      const indice = siguiente;
      siguiente += 1;
      await tarea(elementos[indice], indice);
    }
  };

  const trabajadores = Math.max(1, Math.min(limite, elementos.length));
  await Promise.all(Array.from({ length: trabajadores }, trabajador));
}
