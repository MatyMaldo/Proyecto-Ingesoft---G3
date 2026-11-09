import DialogoBase from '../../../shared/components/DialogoBase.jsx';

/**
 * Confirmación antes de perder los cambios sin guardar de la matriz.
 *
 * @param {Object} props
 * @param {string} props.mensaje Qué se pierde y por qué se pregunta.
 * @param {string} props.textoConfirmar
 * @param {() => void} props.alCancelar
 * @param {() => void} props.alConfirmar
 */
export default function DialogoDescartarCambios({ mensaje, textoConfirmar, alCancelar, alConfirmar }) {
  return (
    <DialogoBase
      idTitulo="dialogo-descartar-titulo"
      titulo="Cambios sin guardar"
      textoConfirmar={textoConfirmar}
      textoEnviando={textoConfirmar}
      cerrarAlClicFuera={false}
      alCancelar={alCancelar}
      alConfirmar={(evento) => {
        evento.preventDefault();
        alConfirmar();
        alCancelar();
      }}
    >
      <p>{mensaje}</p>
    </DialogoBase>
  );
}
