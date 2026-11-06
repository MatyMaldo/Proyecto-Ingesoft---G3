import DialogoBase from '../../cursos/components/DialogoBase.jsx';

/**
 * Confirmación antes de cerrar un formulario de usuarios con datos escritos.
 *
 * @param {Object} props
 * @param {() => void} props.alDescartar Cierra el formulario y pierde lo escrito.
 * @param {() => void} props.alSeguirEditando Cierra solo esta confirmación.
 */
export default function DialogoDescartarCambios({ alDescartar, alSeguirEditando }) {
  return (
    <DialogoBase
      idTitulo="dialogo-descartar-usuarios"
      titulo="¿Descartar los cambios?"
      textoConfirmar="Descartar"
      textoEnviando="Descartando..."
      textoCancelar="Seguir editando"
      confirmarPeligro
      enfocarCancelar
      cerrarAlClicFuera={false}
      alCancelar={alSeguirEditando}
      alConfirmar={(evento) => {
        evento.preventDefault();
        alDescartar();
      }}
    >
      <p>Lo que escribió se perderá si cierra el formulario.</p>
    </DialogoBase>
  );
}
