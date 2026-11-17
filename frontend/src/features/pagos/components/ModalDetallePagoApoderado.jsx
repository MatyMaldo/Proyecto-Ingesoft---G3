import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import {
  etiquetaCompromiso,
  etiquetaEstadoCompromiso,
  etiquetaEstadoPago,
  formatearMonto,
  tonoEstadoPago
} from '../utils/formatoPago.js';
import estilos from './ModalPagos.module.css';
import VistaPreviaComprobante from './VistaPreviaComprobante.jsx';

const evitarEnvio = (evento) => evento.preventDefault();

/** Qué significa el estado del pago para el apoderado (estados del documento de contexto: validado y observado). */
const EXPLICACION_ESTADO = Object.freeze({
  PENDIENTE: 'El comprobante está pendiente de validación por el colegio.',
  REGISTRADO: 'El comprobante está pendiente de validación por el colegio.',
  VALIDADO: 'El colegio validó este pago.',
  RECHAZADO: 'El colegio observó este pago. Revisa el motivo y registra uno nuevo si corresponde.'
});

/**
 * Detalle de un pago para el apoderado, con la misma estructura que el del administrador: primero lo esencial (monto y
 * estado), después los datos en filas y, si hay comprobante, su vista previa al lado.
 *
 * @param {Object} props
 * @param {Object} props.pago
 * @param {Object} props.compromiso Compromiso al que pertenece el pago.
 * @param {() => void} props.onCerrar
 */
export default function ModalDetallePagoApoderado({ pago, compromiso, onCerrar }) {
  const hayComprobante = Boolean(pago.evidenciaUrl);
  const rechazado = pago.estado === 'RECHAZADO';
  const explicacion = EXPLICACION_ESTADO[pago.estado];

  const datos = [
    ['Compromiso', `${etiquetaCompromiso(compromiso)}${pago.compromisoId != null ? ` · #${pago.compromisoId}` : ''}`],
    ['Fecha de registro', formatearFechaVisible(pago.fechaRegistro)],
    ['Estado del compromiso', etiquetaEstadoCompromiso(compromiso.estadoCompromiso)]
  ];

  return (
    <DialogoBase
      idTitulo="dialogo-detalle-pago-apoderado"
      titulo={`Pago #${pago.id}`}
      subtitulo="Detalle del pago"
      textoConfirmar=""
      textoEnviando=""
      textoCancelar="Cerrar"
      sinConfirmar
      anchoMaximo={hayComprobante ? '64rem' : '36rem'}
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={evitarEnvio}
    >
      <div className={hayComprobante ? estilos.detalleLayout : undefined}>
        <div className={estilos.detalleInfo}>
          <div className={estilos.detalleResumen}>
            <span className={estilos.detalleCifra}>{formatearMonto(pago.montoPagado)}</span>
            <Insignia tono={tonoEstadoPago(pago.estado)}>{etiquetaEstadoPago(pago.estado)}</Insignia>
          </div>
          {explicacion && <p className={estilos.detalleExplicacion}>{explicacion}</p>}

          <section aria-label="Datos del pago">
            <dl className={estilos.detalle}>
              {datos.map(([etiqueta, valor]) => (
                <div key={etiqueta} className={estilos.detalleFila}>
                  <dt>{etiqueta}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
              {!hayComprobante && (
                <div className={estilos.detalleFila}>
                  <dt>Comprobante</dt>
                  <dd className={estilos.detalleAtenuado}>No disponible</dd>
                </div>
              )}
            </dl>
          </section>

          {pago.motivo && (
            <section
              aria-label={rechazado ? 'Motivo del rechazo' : 'Observación'}
              className={rechazado ? `${estilos.detalleNota} ${estilos.detalleNotaRechazo}` : estilos.detalleNota}
            >
              <h3 className={estilos.detalleSubtitulo}>{rechazado ? 'Motivo del rechazo' : 'Observación'}</h3>
              <p>{pago.motivo}</p>
            </section>
          )}
        </div>

        {hayComprobante && (
          <VistaPreviaComprobante
            evidenciaUrl={pago.evidenciaUrl}
            titulo={`Comprobante del pago ${pago.id}`}
          />
        )}
      </div>
    </DialogoBase>
  );
}
