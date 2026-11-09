import { useId, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilos from '../../../shared/styles/camposDialogo.module.css';

const MAXIMO_MOTIVO = 300;

/**
 * Pide el motivo para rechazar un pago. Es una acción crítica: el botón de confirmar va en rojo (GUI §4).
 *
 * @param {Object} props
 * @param {{ id: number|string }} props.pago Pago que se rechaza.
 * @param {() => void} props.onCerrar
 * @param {(motivo: string) => (void|Promise<void>)} props.onConfirmar Recibe el motivo ya sin espacios sobrantes.
 * @param {boolean} [props.enviando] `true` mientras se espera al servidor.
 * @param {string} [props.errorServicio] Mensaje de error que devolvió el servidor.
 */
export default function ModalRechazarPago({
  pago,
  onCerrar,
  onConfirmar,
  enviando = false,
  errorServicio = ''
}) {
  const [motivo, establecerMotivo] = useState('');
  const [error, establecerError] = useState('');
  const idMotivo = useId();
  const idError = useId();

  const confirmar = async (evento) => {
    evento.preventDefault();
    const texto = motivo.trim();
    if (!texto) {
      establecerError('Escribe el motivo del rechazo.');
      return;
    }
    establecerError('');
    await onConfirmar(texto);
  };

  return (
    <DialogoBase
      idTitulo="dialogo-rechazar-pago"
      titulo={`Rechazar pago #${pago?.id}`}
      subtitulo="Pagos"
      textoConfirmar="Rechazar pago"
      textoEnviando="Rechazando..."
      enviando={enviando}
      confirmarPeligro
      error={errorServicio || null}
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={confirmar}
    >
      <div className={estilos.campo}>
        <label htmlFor={idMotivo} className={estilos.etiqueta}>
          Motivo del rechazo <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={idMotivo}
          className={estilos.areaTexto}
          value={motivo}
          maxLength={MAXIMO_MOTIVO}
          placeholder="Ej. Comprobante ilegible"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          data-enfoque-inicial=""
          onChange={(evento) => {
            establecerMotivo(evento.target.value);
            establecerError('');
          }}
        />
        {error ? (
          <p id={idError} className={estilos.error}>
            <Icono nombre="alerta" tamano={14} />
            <span>{error}</span>
          </p>
        ) : (
          <p className={estilos.ayuda}>{motivo.length}/{MAXIMO_MOTIVO} caracteres</p>
        )}
      </div>
    </DialogoBase>
  );
}
