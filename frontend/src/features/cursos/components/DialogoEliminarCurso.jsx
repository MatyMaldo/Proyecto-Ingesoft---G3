import DialogoBase from './DialogoBase.jsx';

/**
 * Confirmación de eliminación. El backend valida si existen competencias asociadas.
 *
 * @param {Object} props
 * @param {string} props.nombreCurso
 * @param {boolean} props.enviando
 * @param {string|null} props.error
 * @param {() => void} props.alCancelar
 * @param {(evento: SubmitEvent) => void} props.alConfirmar
 */
export default function DialogoEliminarCurso({
  nombreCurso,
  enviando,
  error,
  alCancelar,
  alConfirmar
}) {
  return (
    <DialogoBase
      idTitulo="dialogo-eliminar-curso-titulo"
      titulo="Eliminar curso"
      subtitulo={`¿Quieres eliminar «${nombreCurso}»?`}
      textoConfirmar="Eliminar curso"
      textoEnviando="Eliminando…"
      enviando={enviando}
      error={error}
      alCancelar={alCancelar}
      alConfirmar={(evento) => {
        evento.preventDefault();
        alConfirmar();
      }}
    >
      <p>
        Esta acción es permanente. No se puede eliminar un curso que tenga competencias asociadas.
      </p>
    </DialogoBase>
  );
}
