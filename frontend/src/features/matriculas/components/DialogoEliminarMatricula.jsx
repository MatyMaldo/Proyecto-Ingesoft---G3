import { useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';

/** Confirmación de borrado de una matrícula pendiente sin pagos. */
export default function DialogoEliminarMatricula({ matricula, alCerrar, alConfirmar }) {
  const [enviando, establecerEnviando] = useState(false);
  const [error, establecerError] = useState(null);
  const confirmar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;
    establecerEnviando(true);
    establecerError(null);
    try {
      const respuesta = await alConfirmar();
      if (respuesta && !respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudo eliminar la matrícula.');
      }
    } finally {
      establecerEnviando(false);
    }
  };

  return (
    <DialogoBase
      idTitulo="dialogo-eliminar-matricula"
      titulo="Eliminar matrícula"
      subtitulo={matricula.nombreCompletoEstudiante}
      textoConfirmar="Eliminar"
      textoEnviando="Eliminando..."
      enviando={enviando}
      error={error}
      confirmarPeligro
      cerrarAlClicFuera={false}
      alCancelar={alCerrar}
      alConfirmar={confirmar}
    >
      <p>
        Se eliminará la matrícula de <strong>{matricula.nombreCompletoEstudiante}</strong>
        {' '}en {matricula.gradoNombre ?? 'el grado'}, sección {matricula.seccionNombre ?? '—'},
        año {matricula.anioAcademico ?? '—'}.
      </p>
      <p>
        <Icono nombre="alerta" tamano={16} />
        {' '}Solo se eliminarán matrículas pendientes que no tengan pagos registrados.
        Si existe un compromiso sin pagos, también se eliminará.
      </p>
    </DialogoBase>
  );
}
