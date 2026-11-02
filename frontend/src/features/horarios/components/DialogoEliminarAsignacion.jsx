import { useState } from 'react';

import DialogoBase from '../../cursos/components/DialogoBase.jsx';

/**
 * Confirmación para quitar una relación curso-docente. También se quitan sus bloques del horario.
 *
 * @param {Object} props
 * @param {{ cursoNombre: string, docenteNombre: string }} props.asignacion
 * @param {() => void} props.alCancelar
 * @param {() => Promise<string|null>} props.alConfirmar Devuelve el mensaje de error, o `null`.
 */
export default function DialogoEliminarAsignacion({ asignacion, alCancelar, alConfirmar }) {
  const [enviando, establecerEnviando] = useState(false);
  const [error, establecerError] = useState(null);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    establecerEnviando(true);
    establecerError(null);
    const mensaje = await alConfirmar();
    if (mensaje) {
      establecerEnviando(false);
      establecerError(mensaje);
      return;
    }
    alCancelar();
  }

  return (
    <DialogoBase
      idTitulo="dialogo-eliminar-asignacion-titulo"
      titulo="Eliminar relación"
      subtitulo={`${asignacion.cursoNombre} — ${asignacion.docenteNombre}`}
      textoConfirmar="Eliminar"
      textoEnviando="Eliminando…"
      enviando={enviando}
      error={error}
      cerrarAlClicFuera={false}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      <p>Los bloques del horario que usan esta relación también se quitarán.</p>
    </DialogoBase>
  );
}
