import DialogoBase from '../../cursos/components/DialogoBase.jsx';

/**
 * Confirmación antes de cerrar un diálogo de usuarios con trabajo sin guardar. Por defecto habla de un formulario;
 * cada diálogo puede indicar qué se perderá con `titulo`, `mensaje` y `textoSeguir`.
 *
 * @param {Object} props
 * @param {() => void} props.alDescartar Cierra el diálogo y pierde lo pendiente.
 * @param {() => void} props.alSeguirEditando Cierra solo esta confirmación.
 * @param {string} [props.titulo]
 * @param {import('react').ReactNode} [props.mensaje] Qué se perderá si se descarta.
 * @param {string} [props.textoSeguir] Texto del botón que vuelve al diálogo.
 */
export default function DialogoDescartarCambios({
  alDescartar,
  alSeguirEditando,
  titulo = '¿Descartar los cambios?',
  mensaje = 'Lo que escribió se perderá si cierra el formulario.',
  textoSeguir = 'Seguir editando'
}) {
  return (
    <DialogoBase
      idTitulo="dialogo-descartar-usuarios"
      titulo={titulo}
      textoConfirmar="Descartar"
      textoEnviando="Descartando..."
      textoCancelar={textoSeguir}
      confirmarPeligro
      enfocarCancelar
      cerrarAlClicFuera={false}
      alCancelar={alSeguirEditando}
      alConfirmar={(evento) => {
        evento.preventDefault();
        alDescartar();
      }}
    >
      <p>{mensaje}</p>
    </DialogoBase>
  );
}
