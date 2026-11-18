import DialogoBase from './DialogoBase.jsx';

/**
 * Confirmación común de las cargas masivas (usuarios, matrículas y horarios) antes de perder el archivo elegido o su
 * vista previa. Todas las cargas usan el mismo aviso para que el flujo sea igual:
 * - Con el archivo ya revisado (paso 2), descartar vuelve al paso 1.
 * - Con el archivo solo elegido (paso 1), descartar cierra la carga.
 * Quien lo usa decide qué ocurre al descartar; este aviso solo pregunta.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.mensaje Qué se perderá y que no se creará nada.
 * @param {() => void} props.alDescartar Se llama al elegir «Descartar».
 * @param {() => void} props.alSeguir Se llama al elegir «Seguir con la carga»: solo cierra este aviso.
 */
export default function DialogoDescartarImportacion({ mensaje, alDescartar, alSeguir }) {
  return (
    <DialogoBase
      idTitulo="dialogo-descartar-importacion"
      titulo="¿Descartar la importación?"
      textoConfirmar="Descartar"
      textoEnviando="Descartando..."
      textoCancelar="Seguir con la carga"
      confirmarPeligro
      enfocarCancelar
      cerrarAlClicFuera={false}
      alCancelar={alSeguir}
      alConfirmar={(evento) => {
        evento.preventDefault();
        alDescartar();
      }}
    >
      <p>{mensaje}</p>
    </DialogoBase>
  );
}
