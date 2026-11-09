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

/** Detalle de un pago para el apoderado: datos del pago y vista previa de su comprobante. */
export default function ModalDetallePagoApoderado({ pago, compromiso, onCerrar }) {
  return (
    <DialogoBase
      idTitulo="dialogo-detalle-pago-apoderado"
      titulo={`Pago #${pago.id}`}
      subtitulo="Detalle del pago"
      textoConfirmar=""
      textoEnviando=""
      textoCancelar="Cerrar"
      sinConfirmar
      anchoMaximo="64rem"
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={evitarEnvio}
    >
      <div className={estilos.detalleLayout}>
        <div className={estilos.detalleInfo}>
          <div>
            <Insignia tono={tonoEstadoPago(pago.estado)}>
              {etiquetaEstadoPago(pago.estado)}
            </Insignia>
          </div>
          <dl className={estilos.detalle}>
            <dt>Compromiso</dt>
            <dd>
              {etiquetaCompromiso(compromiso)}
              {pago.compromisoId != null ? ` · #${pago.compromisoId}` : ''}
            </dd>
            <dt>Fecha de registro</dt>
            <dd>{formatearFechaVisible(pago.fechaRegistro)}</dd>
            <dt>Monto pagado</dt>
            <dd className={estilos.monto}>{formatearMonto(pago.montoPagado)}</dd>
            <dt>Estado del compromiso</dt>
            <dd>{etiquetaEstadoCompromiso(compromiso.estadoCompromiso)}</dd>
            <dt>Observación</dt>
            <dd>{pago.motivo ?? '—'}</dd>
          </dl>
        </div>

        <VistaPreviaComprobante
          evidenciaUrl={pago.evidenciaUrl}
          titulo={`Comprobante del pago ${pago.id}`}
        />
      </div>
    </DialogoBase>
  );
}
