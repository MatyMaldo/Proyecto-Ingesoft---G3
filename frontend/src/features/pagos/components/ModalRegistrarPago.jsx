import { useId, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import estilos from '../../../shared/styles/camposDialogo.module.css';
import { etiquetaCompromiso, formatearMonto } from '../utils/formatoPago.js';

const MAXIMO_BYTES = 5 * 1024 * 1024;

function esPdf(archivo) {
  return Boolean(archivo) && (
    archivo.type === 'application/pdf'
    || archivo.name.toLowerCase().endsWith('.pdf')
  );
}

/**
 * Registro de un pago de un compromiso, con su comprobante en PDF (máximo 5 MB).
 *
 * @param {Object} props
 * @param {Object} props.compromiso Compromiso que se paga.
 * @param {() => void} props.onCerrar
 * @param {(datos: { compromisoId: number|string, montoPagado: number, comprobante: File }) => Promise<string|null>} props.onRegistrar
 *   Devuelve el mensaje de error del servidor, o `null` si se registró.
 */
export default function ModalRegistrarPago({ compromiso, onCerrar, onRegistrar }) {
  const [monto, establecerMonto] = useState(String(compromiso?.montoTotal ?? ''));
  const [archivo, establecerArchivo] = useState(null);
  const [error, establecerError] = useState('');
  const [enviando, establecerEnviando] = useState(false);
  const idMonto = useId();
  const idArchivo = useId();

  const manejarArchivo = (evento) => {
    const seleccionado = evento.target.files?.[0] ?? null;
    establecerError('');
    if (!seleccionado) {
      establecerArchivo(null);
      return;
    }
    if (!esPdf(seleccionado)) {
      establecerArchivo(null);
      establecerError('El comprobante debe ser un archivo PDF.');
      return;
    }
    if (seleccionado.size > MAXIMO_BYTES) {
      establecerArchivo(null);
      establecerError('El comprobante no puede superar los 5 MB.');
      return;
    }
    establecerArchivo(seleccionado);
  };

  const confirmar = async (evento) => {
    evento.preventDefault();
    const numero = Number(monto);
    if (!Number.isFinite(numero) || numero <= 0) {
      establecerError('Ingresa un monto mayor a cero.');
      return;
    }
    if (!archivo) {
      establecerError('Selecciona el comprobante en PDF.');
      return;
    }

    establecerEnviando(true);
    establecerError('');
    const mensaje = await onRegistrar({
      compromisoId: compromiso.id,
      montoPagado: numero,
      comprobante: archivo
    });
    establecerEnviando(false);
    if (mensaje) establecerError(mensaje);
  };

  return (
    <DialogoBase
      idTitulo="dialogo-registrar-pago"
      titulo="Registrar pago"
      subtitulo={`${etiquetaCompromiso(compromiso)} · ${formatearMonto(compromiso.montoTotal)}`}
      textoConfirmar="Registrar pago"
      textoEnviando="Registrando..."
      enviando={enviando}
      error={error || null}
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={confirmar}
    >
      <div className={estilos.campo}>
        <label htmlFor={idMonto} className={estilos.etiqueta}>Monto pagado</label>
        <input
          id={idMonto}
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          className={estilos.entrada}
          value={monto}
          data-enfoque-inicial=""
          onChange={(evento) => {
            establecerMonto(evento.target.value);
            establecerError('');
          }}
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor={idArchivo} className={estilos.etiqueta}>Comprobante PDF</label>
        <input
          id={idArchivo}
          type="file"
          accept="application/pdf,.pdf"
          className={estilos.entrada}
          onChange={manejarArchivo}
        />
        <p className={estilos.ayuda}>Formato PDF, máximo 5 MB.</p>
      </div>
    </DialogoBase>
  );
}
