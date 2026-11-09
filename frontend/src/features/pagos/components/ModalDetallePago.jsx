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

/** Detalle de un pago para el administrador: datos del pago y vista previa de su comprobante. */
export default function ModalDetallePago({ pagoId, onCerrar }) {
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

  return (
    <DialogoBase
      idTitulo="dialogo-detalle-pago"
      titulo={`Pago #${pagoId}`}
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
      {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={3} />}
      {estado === 'error' && (
        <EstadoConsulta
          tipo="error"
          mensaje={error}
          alReintentar={() => establecerIntento((actual) => actual + 1)}
        />
      )}

      {estado === 'listo' && pago && (
        <div className={estilos.detalleLayout}>
          <div className={estilos.detalleInfo}>
            <div>
              <Insignia tono={tonoEstadoPago(pago.estado)}>
                {etiquetaEstadoPago(pago.estado)}
              </Insignia>
            </div>
            <dl className={estilos.detalle}>
              <dt>Estudiante</dt>
              <dd>{pago.estudianteNombreCompleto ?? '—'}</dd>
              <dt>Grado y sección</dt>
              <dd>{pago.gradoSeccion ?? '—'}</dd>
              <dt>Apoderado</dt>
              <dd>{pago.apoderadoNombreCompleto ?? '—'}</dd>
              <dt>Fecha de registro</dt>
              <dd>{formatearFechaVisible(pago.fechaRegistro)}</dd>
              <dt>Monto pagado</dt>
              <dd className={estilos.monto}>{formatearMonto(pago.montoPagado)}</dd>
              <dt>Compromiso</dt>
              <dd>
                {etiquetaTipoCompromiso(pago.tipoCompromiso)}
                {pago.compromisoId != null ? ` · #${pago.compromisoId}` : ''}
              </dd>
              <dt>Mes</dt>
              <dd>{pago.mes ?? '—'}</dd>
              <dt>Estado del compromiso</dt>
              <dd>{etiquetaEstadoCompromiso(pago.estadoCompromiso)}</dd>
              <dt>Validado por</dt>
              <dd>{pago.validadorNombreCompleto ?? '—'}</dd>
              <dt>Motivo de rechazo</dt>
              <dd>{pago.motivo ?? '—'}</dd>
            </dl>
          </div>

          <VistaPreviaComprobante
            evidenciaUrl={pago.evidenciaUrl}
            titulo={`Comprobante del pago ${pago.id ?? pagoId}`}
          />
        </div>
      )}
    </DialogoBase>
  );
}
