import { useEffect, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import { obtenerPagoAdmin } from '../services/pagosService.js';
import {
  etiquetaEstadoCompromiso,
  etiquetaEstadoPago,
  etiquetaTipoCompromiso,
  formatearMonto,
  tonoEstadoPago
} from '../utils/formatoPago.js';
import estilos from './ModalPagos.module.css';
import VistaPreviaComprobante from './VistaPreviaComprobante.jsx';

const evitarEnvio = (evento) => evento.preventDefault();

/**
 * Detalle de un pago para el administrador. Primero lo esencial (monto, fecha, compromiso) y después el contexto
 * (estudiante y apoderado); los datos sin valor no se listan. Si el pago admite una decisión, "Validar" y "Rechazar"
 * están en el pie, para decidir sin volver a la tabla.
 *
 * @param {Object} props
 * @param {number|string} props.pagoId
 * @param {() => void} props.onCerrar Vuelve a la lista de pagos del estudiante.
 * @param {{
 *   puedeValidar: boolean, puedeRechazar: boolean, motivoBloqueo?: string, validando?: boolean,
 *   alValidar: () => void, alRechazar: () => void
 * }} [props.acciones] Decisiones disponibles sobre este pago; sin ellas el detalle es solo de lectura.
 */
export default function ModalDetallePago({ pagoId, onCerrar, acciones }) {
  const [pago, establecerPago] = useState(null);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    establecerEstado('cargando');
    establecerError('');

    obtenerPagoAdmin(pagoId).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !respuesta.datos) {
        establecerError(respuesta.mensaje || 'No se pudo cargar el detalle del pago.');
        establecerEstado('error');
        return;
      }
      establecerPago(respuesta.datos);
      establecerEstado('listo');
    });

    return () => { activo = false; };
  }, [pagoId, intento]);

  const puedeValidar = Boolean(acciones?.puedeValidar);
  const puedeRechazar = Boolean(acciones?.puedeRechazar);
  const hayComprobante = Boolean(pago?.evidenciaUrl);
  const rechazado = pago?.estado === 'RECHAZADO';

  // Compromiso: "Pensión · MARZO · #11" (el mes solo si lo hay).
  const compromiso = pago
    ? [
      etiquetaTipoCompromiso(pago.tipoCompromiso),
      pago.mes,
      pago.compromisoId != null ? `#${pago.compromisoId}` : null
    ].filter(Boolean).join(' · ')
    : '';

  // Solo se listan los datos que tienen valor.
  const datosPago = pago ? [
    ['Fecha de registro', formatearFechaVisible(pago.fechaRegistro)],
    ['Compromiso', compromiso],
    ['Estado del compromiso', pago.estadoCompromiso ? etiquetaEstadoCompromiso(pago.estadoCompromiso) : null],
    ['Validado por', pago.validadorNombreCompleto],
    ['Motivo de rechazo', rechazado ? pago.motivo : null]
  ].filter(([, valor]) => Boolean(valor)) : [];
  const datosEstudiante = pago ? [
    ['Nombres', pago.estudianteNombreCompleto],
    ['Grado y sección', pago.gradoSeccion],
    ['Apoderado', pago.apoderadoNombreCompleto]
  ].filter(([, valor]) => Boolean(valor)) : [];

  const accionesPie = estado === 'listo' && puedeRechazar ? (
    <button
      type="button"
      className={estilos.botonPieRechazar}
      disabled={acciones.validando}
      onClick={acciones.alRechazar}
    >
      Rechazar
    </button>
  ) : null;

  const confirmar = (evento) => {
    evento.preventDefault();
    if (puedeValidar && !acciones.validando) acciones.alValidar();
  };

  return (
    <DialogoBase
      idTitulo="dialogo-detalle-pago"
      titulo={`Pago #${pagoId}`}
      subtitulo="Detalle del pago"
      textoConfirmar="Validar"
      textoEnviando="Validando…"
      textoCancelar="Volver a los pagos"
      sinConfirmar={!(estado === 'listo' && puedeValidar)}
      enviando={Boolean(acciones?.validando)}
      notaPie={estado === 'listo' && !puedeValidar && !puedeRechazar ? acciones?.motivoBloqueo || undefined : undefined}
      accionesPie={accionesPie}
      anchoMaximo={hayComprobante ? '64rem' : '40rem'}
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={acciones ? confirmar : evitarEnvio}
    >
      {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={3} />}
      {estado === 'error' && (
        <EstadoConsulta
          tipo="error"
          mensaje={error}
          alReintentar={() => establecerIntento((actual) => actual + 1)}
        />
      )}

      {estado === 'listo' && pago && (
        <div className={hayComprobante ? estilos.detalleLayout : undefined}>
          <div className={estilos.detalleInfo}>
            <div className={estilos.detalleResumen}>
              <span className={estilos.detalleCifra}>{formatearMonto(pago.montoPagado)}</span>
              <Insignia tono={tonoEstadoPago(pago.estado)}>{etiquetaEstadoPago(pago.estado)}</Insignia>
            </div>

            <section aria-label="Datos del pago">
              <dl className={estilos.detalle}>
                {datosPago.map(([etiqueta, valor]) => (
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

            {datosEstudiante.length > 0 && (
              <section aria-label="Estudiante y apoderado" className={estilos.detalleGrupo}>
                <h3 className={estilos.detalleSubtitulo}>Estudiante y apoderado</h3>
                <dl className={estilos.detalle}>
                  {datosEstudiante.map(([etiqueta, valor]) => (
                    <div key={etiqueta} className={estilos.detalleFila}>
                      <dt>{etiqueta}</dt>
                      <dd>{valor}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>

          {hayComprobante && (
            <VistaPreviaComprobante
              evidenciaUrl={pago.evidenciaUrl}
              titulo={`Comprobante del pago ${pago.id ?? pagoId}`}
            />
          )}
        </div>
      )}
    </DialogoBase>
  );
}
