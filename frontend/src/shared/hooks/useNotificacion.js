import { useEffect, useState } from 'react';

const DURACION_NOTIFICACION_MS = 4000;

/**
 * Estado de una notificación flotante (éxito o error) que se oculta sola a los 4 s.
 * Se llama desde la página y no desde un modal: así la notificación sigue visible
 * después de que el modal se cierre y se desmonte.
 *
 * @returns {{
 *   notificacion: { mensaje: string, error: boolean }|null,
 *   mostrarNotificacion: (mensaje: string, error?: boolean) => void
 * }}
 */
export default function useNotificacion() {
  const [notificacion, establecerNotificacion] = useState(null);

  // Cada notificación nueva reinicia el temporizador, así una anterior no borra a la actual antes de tiempo.
  useEffect(() => {
    if (notificacion === null) {
      return undefined;
    }

    const temporizador = setTimeout(() => {
      establecerNotificacion(null);
    }, DURACION_NOTIFICACION_MS);

    return () => clearTimeout(temporizador);
  }, [notificacion]);

  const mostrarNotificacion = (mensaje, error = false) => establecerNotificacion({ mensaje, error });

  return { notificacion, mostrarNotificacion };
}
