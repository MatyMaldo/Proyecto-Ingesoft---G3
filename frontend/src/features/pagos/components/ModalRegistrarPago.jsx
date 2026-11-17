import { useId, useRef, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilos from '../../../shared/styles/camposDialogo.module.css';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import { etiquetaCompromiso, formatearMonto } from '../utils/formatoPago.js';
import propios from './ModalRegistrarPago.module.css';

const MAXIMO_BYTES = 5 * 1024 * 1024;

function esPdf(archivo) {
  return Boolean(archivo) && (
    archivo.type === 'application/pdf'
    || archivo.name.toLowerCase().endsWith('.pdf')
  );
}

function tamanoLegible(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Registro de un pago de un compromiso, con su comprobante en PDF (máximo 5 MB). Muestra arriba el compromiso que se
 * paga, el monto con su moneda y una zona para elegir o soltar el comprobante.
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
  const [arrastrando, establecerArrastrando] = useState(false);
  const idMonto = useId();
  const idArchivo = useId();
  const refArchivo = useRef(null);
  const tieneMora = Number(compromiso?.montoMora) > 0;

  const elegirArchivo = (seleccionado) => {
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

  const manejarArchivo = (evento) => elegirArchivo(evento.target.files?.[0] ?? null);

  const quitarArchivo = () => {
    establecerArchivo(null);
    establecerError('');
    if (refArchivo.current) refArchivo.current.value = '';
  };

  const soltarArchivo = (evento) => {
    evento.preventDefault();
    establecerArrastrando(false);
    elegirArchivo(evento.dataTransfer.files?.[0] ?? null);
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
      anchoMaximo="34rem"
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={confirmar}
    >
      <div className={propios.resumen}>
        <div>
          <span className={propios.rotulo}>Compromiso</span>
          <strong className={propios.titulo}>N.º {compromiso.id}</strong>
          {compromiso.fechaEmision && (
            <span className={propios.referencia}>Emitido el {formatearFechaVisible(compromiso.fechaEmision)}</span>
          )}
        </div>
        <div className={propios.total}>
          <span className={propios.rotulo}>Total a pagar</span>
          <strong className={propios.cifra}>{formatearMonto(compromiso.montoTotal)}</strong>
          {tieneMora && <span className={propios.mora}>Incluye mora de {formatearMonto(compromiso.montoMora)}</span>}
        </div>
      </div>

      <div className={estilos.campo}>
        <label htmlFor={idMonto} className={estilos.etiqueta}>Monto pagado</label>
        <div className={propios.campoMonto}>
          <span className={propios.moneda} aria-hidden="true">S/</span>
          <input
            id={idMonto}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            className={`${estilos.entrada} ${propios.entradaMonto}`}
            value={monto}
            data-enfoque-inicial=""
            onChange={(evento) => {
              establecerMonto(evento.target.value);
              establecerError('');
            }}
          />
        </div>
        <p className={estilos.ayuda}>Ya está escrito el total del compromiso; cámbialo si pagaste otro monto.</p>
      </div>

      <div className={estilos.campo}>
        <label htmlFor={idArchivo} className={estilos.etiqueta}>Comprobante PDF</label>
        <div
          className={`${propios.zona} ${arrastrando ? propios.zonaActiva : ''} ${archivo ? propios.zonaConArchivo : ''}`}
          onDragOver={(evento) => { evento.preventDefault(); establecerArrastrando(true); }}
          onDragLeave={() => establecerArrastrando(false)}
          onDrop={soltarArchivo}
        >
          <input
            ref={refArchivo}
            id={idArchivo}
            type="file"
            accept="application/pdf,.pdf"
            className={propios.entradaArchivo}
            onChange={manejarArchivo}
          />
          {archivo ? (
            <div className={propios.archivo}>
              <span className={propios.iconoArchivo} aria-hidden="true"><Icono nombre="archivo" tamano={22} /></span>
              <div className={propios.datosArchivo}>
                <strong>{archivo.name}</strong>
                <span>{tamanoLegible(archivo.size)} · PDF</span>
              </div>
              <button type="button" className={propios.quitar} onClick={quitarArchivo}>Quitar</button>
            </div>
          ) : (
            <label htmlFor={idArchivo} className={propios.invitacion}>
              <span className={propios.iconoSubir} aria-hidden="true"><Icono nombre="subir" tamano={24} /></span>
              <span><strong>Selecciona el archivo</strong> o suéltalo aquí</span>
              <span className={propios.formato}>Formato PDF, máximo 5 MB</span>
            </label>
          )}
        </div>
      </div>
    </DialogoBase>
  );
}
