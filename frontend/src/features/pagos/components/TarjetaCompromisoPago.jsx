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
import estilos from '../pages/PaginaPagosApoderado.module.css';

export default function TarjetaCompromisoPago({
  compromiso,
  pagosInfo,
  cargandoPagos,
  alRegistrar,
  alVerDetalle
}) {
  const pagos = pagosInfo?.pagos ?? [];
  const errorPagos = pagosInfo?.error ?? '';
  const sinPagos = !cargandoPagos && !errorPagos && pagos.length === 0;

  return (
    <article className={estilos.compromiso}>
      <header className={estilos.compromisoCabecera}>
        <div className={estilos.compromisoInfo}>
          <p className={estilos.compromisoReferencia}>Compromiso #{compromiso.id}</p>
          <h2 className={estilos.compromisoTitulo}>{etiquetaCompromiso(compromiso)}</h2>
          <p className={estilos.compromisoMeta}>
            Emitido: {formatearFechaVisible(compromiso.fechaEmision)}
            {' · '}
            Total: <strong>{formatearMonto(compromiso.montoTotal)}</strong>
          </p>
          {Number(compromiso.montoMora) > 0 && (
            <p className={estilos.compromisoMeta}>
              Original: {formatearMonto(compromiso.montoOriginal)}
              {' · '}
              Mora: {formatearMonto(compromiso.montoMora)}
            </p>
          )}
          {compromiso.etiquetaMatricula && (
            <p className={estilos.compromisoMeta}>{compromiso.etiquetaMatricula}</p>
          )}
        </div>

        <div className={estilos.compromisoEstado}>
          <Insignia tono={tonoEstadoCompromiso(compromiso.estadoCompromiso)}>
            {etiquetaEstadoCompromiso(compromiso.estadoCompromiso)}
          </Insignia>
          {compromiso.sePuedeRegistrarPago ? (
            <button
              type="button"
              className={estilos.botonRegistrar}
              onClick={() => alRegistrar(compromiso)}
            >
              <Icono nombre="subir" tamano={16} />
              Registrar pago
            </button>
          ) : (
            <p className={estilos.motivoBloqueo}>
              {compromiso.motivoBloqueoPago || 'No disponible para registrar pagos.'}
            </p>
          )}
        </div>
      </header>

      <div className={estilos.pagosCompromiso}>
        {cargandoPagos && !pagosInfo && <p className={estilos.estadoPagos}>Cargando pagos…</p>}
        {errorPagos && <p className={estilos.errorPagos} role="alert">{errorPagos}</p>}
        {sinPagos && <p className={estilos.estadoPagos}>Sin pagos registrados.</p>}

        {pagos.length > 0 && (
          <div className={estilos.tablaContenedor}>
            <table className={estilos.tabla}>
              <caption hidden>Pagos del compromiso</caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Monto</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Comprobante</th>
                  <th scope="col">Observación</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id}>
                    <td>{formatearFechaVisible(pago.fechaRegistro)}</td>
                    <td className={estilos.monto}>{formatearMonto(pago.montoPagado)}</td>
                    <td>
                      <Insignia tono={tonoEstadoPago(pago.estado)}>
                        {etiquetaEstadoPago(pago.estado)}
                      </Insignia>
                    </td>
                    <td>
                      {pago.evidenciaUrl ? (
                        <a
                          className={estilos.evidencia}
                          href={pago.evidenciaUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver PDF
                        </a>
                      ) : '—'}
                    </td>
                    <td className={estilos.observacion}>{pago.motivo ?? '—'}</td>
                    <td>
                      <button
                        type="button"
                        className={estilos.botonDetalle}
                        onClick={() => alVerDetalle?.(pago)}
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </article>
  );
}
