import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import {
  etiquetaCompromiso,
  etiquetaEstadoCompromiso,
  etiquetaEstadoPago,
  formatearMonto,
  tonoEstadoCompromiso,
  tonoEstadoPago
} from '../utils/formatoPago.js';
import estilos from './ModalPagosCompromiso.module.css';

const evitarEnvio = (evento) => evento.preventDefault();

/** Cuántos pagos hay en cada estado, en el orden en que aparecen. */
function contarPorEstado(pagos) {
  const cuentas = new Map();
  pagos.forEach((pago) => cuentas.set(pago.estado, (cuentas.get(pago.estado) ?? 0) + 1));
  return [...cuentas.entries()];
}

/**
 * Pagos registrados de un compromiso, en un diálogo. Cada pago lleva su estado, el enlace al comprobante y "Detalle".
 * Si el compromiso admite un nuevo pago, "Registrar pago" va en el pie.
 *
 * @param {Object} props
 * @param {Object} props.compromiso
 * @param {{ pagos?: Array, error?: string }} [props.pagosInfo]
 * @param {boolean} props.cargandoPagos
 * @param {() => void} props.onCerrar
 * @param {(compromiso: Object) => void} props.alRegistrar
 * @param {(pago: Object) => void} props.alVerDetalle
 */
export default function ModalPagosCompromiso({ compromiso, pagosInfo, cargandoPagos, onCerrar, alRegistrar, alVerDetalle }) {
  const pagos = pagosInfo?.pagos ?? [];
  const error = pagosInfo?.error ?? '';
  const sinPagos = !cargandoPagos && !error && pagos.length === 0;
  const tieneMora = Number(compromiso.montoMora) > 0;

  return (
    <DialogoBase
      idTitulo="dialogo-pagos-compromiso"
      titulo={`Pagos de ${etiquetaCompromiso(compromiso)}`}
      subtitulo={`Compromiso #${compromiso.id} · Total ${formatearMonto(compromiso.montoTotal)}`}
      textoConfirmar="Registrar pago"
      textoEnviando="Registrar pago"
      textoCancelar="Cerrar"
      sinConfirmar={!compromiso.sePuedeRegistrarPago}
      notaPie={!compromiso.sePuedeRegistrarPago ? compromiso.motivoBloqueoPago || undefined : undefined}
      anchoMaximo="40rem"
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={(evento) => { evitarEnvio(evento); alRegistrar(compromiso); }}
    >
      <dl className={estilos.resumen}>
        <div className={estilos.total}>
          <dt>Total</dt>
          <dd>{formatearMonto(compromiso.montoTotal)}</dd>
        </div>
        <div>
          <dt>Emitido</dt>
          <dd>{formatearFechaVisible(compromiso.fechaEmision)}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <Insignia tono={tonoEstadoCompromiso(compromiso.estadoCompromiso)}>
              {etiquetaEstadoCompromiso(compromiso.estadoCompromiso)}
            </Insignia>
          </dd>
        </div>
        {tieneMora && (
          <div>
            <dt>Mora</dt>
            <dd className={estilos.mora}>{formatearMonto(compromiso.montoMora)}</dd>
            <span className={estilos.original}>Original {formatearMonto(compromiso.montoOriginal)}</span>
          </div>
        )}
      </dl>

      <div className={estilos.tituloLista}>
        <h3>Pagos registrados</h3>
        <div className={estilos.conteo}>
          {contarPorEstado(pagos).map(([estado, cantidad]) => (
            <Insignia key={estado} tono={tonoEstadoPago(estado)}>{cantidad} {etiquetaEstadoPago(estado).toLowerCase()}</Insignia>
          ))}
        </div>
      </div>

      {cargandoPagos && !pagosInfo && <p className={estilos.estado}>Cargando pagos…</p>}
      {error && <p className={estilos.error} role="alert">{error}</p>}
      {sinPagos && <p className={estilos.estado}>Sin pagos registrados.</p>}

      {pagos.length > 0 && (
        <ul className={estilos.lista}>
          {pagos.map((pago) => (
            <li key={pago.id} className={estilos.pago}>
              <div className={estilos.principal}>
                <div>
                  <strong className={estilos.monto}>{formatearMonto(pago.montoPagado)}</strong>
                  <span className={estilos.fecha}>Pago #{pago.id} · {formatearFechaVisible(pago.fechaRegistro)}</span>
                </div>
                <Insignia tono={tonoEstadoPago(pago.estado)}>{etiquetaEstadoPago(pago.estado)}</Insignia>
              </div>
              {pago.motivo && (
                <p className={pago.estado === 'RECHAZADO' ? `${estilos.observacion} ${estilos.rechazo}` : estilos.observacion}>
                  <span>{pago.estado === 'RECHAZADO' ? 'Motivo del rechazo' : 'Observación'}</span>
                  {pago.motivo}
                </p>
              )}
              <div className={estilos.acciones}>
                {pago.evidenciaUrl ? (
                  <a className={estilos.evidencia} href={pago.evidenciaUrl} target="_blank" rel="noreferrer">
                    <Icono nombre="archivo" tamano={14} />
                    Ver comprobante
                  </a>
                ) : <span className={estilos.sinComprobante}>Sin comprobante</span>}
                <button type="button" className={estilos.botonDetalle} onClick={() => alVerDetalle(pago)}>
                  Detalle
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DialogoBase>
  );
}
