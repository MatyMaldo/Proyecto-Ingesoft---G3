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
import estilos from './TablaCompromisosPago.module.css';

/** Resumen de los pagos de un compromiso: el estado del más reciente y cuántos hay. */
function ResumenPagos({ pagosInfo, cargandoPagos }) {
  if (pagosInfo?.error) {
    return <span className={estilos.errorPagos}>No se pudieron cargar</span>;
  }
  if (!pagosInfo) {
    return <span className={estilos.sinDato}>{cargandoPagos ? 'Cargando…' : '—'}</span>;
  }
  const pagos = pagosInfo.pagos ?? [];
  if (pagos.length === 0) {
    return <span className={estilos.sinDato}>Sin pagos</span>;
  }
  const reciente = [...pagos].sort((a, b) => String(b.fechaRegistro).localeCompare(String(a.fechaRegistro)))[0];
  return (
    <span className={estilos.resumenPagos}>
      <Insignia tono={tonoEstadoPago(reciente.estado)}>{etiquetaEstadoPago(reciente.estado)}</Insignia>
      <span className={estilos.cantidad}>{pagos.length === 1 ? '1 pago' : `${pagos.length} pagos`}</span>
    </span>
  );
}

/**
 * Compromisos de pago del estudiante, para el apoderado: tabla en escritorio (una fila por compromiso, así caben
 * muchos) y tarjetas por debajo de 768 px (GUI §11). Los pagos de cada compromiso se ven en un diálogo.
 *
 * @param {Object} props
 * @param {Array} props.compromisos
 * @param {Object} props.pagosPorCompromiso Pagos por id de compromiso (`{ pagos, error }`).
 * @param {boolean} props.cargandoPagos
 * @param {(compromiso: Object) => void} props.alRegistrar
 * @param {(compromiso: Object) => void} props.alVerPagos
 */
export default function TablaCompromisosPago({
  compromisos,
  pagosPorCompromiso,
  cargandoPagos,
  alRegistrar,
  alVerPagos
}) {
  return (
    <div className={estilos.vista}>
      <table className={estilos.tabla}>
        <caption hidden>Compromisos de pago</caption>
        <thead>
          <tr>
            <th scope="col">Compromiso</th>
            <th scope="col">Emitido</th>
            <th scope="col">Total</th>
            <th scope="col">Estado</th>
            <th scope="col">Pagos</th>
            <th scope="col" className={estilos.columnaAcciones}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compromisos.map((compromiso) => {
            const tieneMora = Number(compromiso.montoMora) > 0;
            return (
              <tr key={compromiso.id} className={estilos.fila}>
                <td data-etiqueta="Compromiso">
                  <span className={estilos.titulo}>{etiquetaCompromiso(compromiso)}</span>
                  <span className={estilos.referencia}>Compromiso #{compromiso.id}</span>
                </td>
                <td data-etiqueta="Emitido">{formatearFechaVisible(compromiso.fechaEmision)}</td>
                <td data-etiqueta="Total">
                  <span className={estilos.monto}>{formatearMonto(compromiso.montoTotal)}</span>
                  {tieneMora && (
                    <span className={estilos.mora}>
                      Incluye mora {formatearMonto(compromiso.montoMora)}
                    </span>
                  )}
                </td>
                <td data-etiqueta="Estado">
                  <Insignia tono={tonoEstadoCompromiso(compromiso.estadoCompromiso)}>
                    {etiquetaEstadoCompromiso(compromiso.estadoCompromiso)}
                  </Insignia>
                </td>
                <td data-etiqueta="Pagos">
                  <ResumenPagos pagosInfo={pagosPorCompromiso[compromiso.id]} cargandoPagos={cargandoPagos} />
                </td>
                <td data-etiqueta="Acciones" className={estilos.columnaAcciones}>
                  <div className={estilos.acciones}>
                    {compromiso.sePuedeRegistrarPago && (
                      <button
                        type="button"
                        className={`${estilos.boton} ${estilos.botonPrimario}`}
                        onClick={() => alRegistrar(compromiso)}
                      >
                        <Icono nombre="subir" tamano={16} />
                        Registrar pago
                      </button>
                    )}
                    <button
                      type="button"
                      className={`${estilos.boton} ${estilos.botonSecundario}`}
                      aria-label={`Ver pagos de ${etiquetaCompromiso(compromiso)}`}
                      title={!compromiso.sePuedeRegistrarPago ? compromiso.motivoBloqueoPago || undefined : undefined}
                      onClick={() => alVerPagos(compromiso)}
                    >
                      Ver pagos
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
