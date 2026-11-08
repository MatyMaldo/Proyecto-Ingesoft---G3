import { useEffect, useId, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
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
import estilosModal from './Modal.module.css';
import estilos from './ModalPagos.module.css';

export default function ModalDetallePago({ pagoId, onCerrar }) {
  const [pago, establecerPago] = useState(null);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);
  const idTitulo = useId();

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
    <div className={estilosModal.fondo} onMouseDown={(evento) => {
      if (evento.target === evento.currentTarget) onCerrar();
    }}>
      <div
        className={`${estilosModal.caja} ${estilos.cajaAncha}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
      >
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Detalle del pago</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>Pago #{pagoId}</h2>
          </div>
          <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </header>

        <div className={estilosModal.cuerpo}>
          {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={3} />}
          {estado === 'error' && (
            <div>
              <EstadoConsulta tipo="error" mensaje={error} />
              <button
                type="button"
                className={estilosModal.reintentar}
                onClick={() => establecerIntento((actual) => actual + 1)}
              >
                Reintentar
              </button>
            </div>
          )}

          {estado === 'listo' && pago && (
            <>
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
                <dt>Comprobante</dt>
                <dd>
                  {pago.evidenciaUrl ? (
                    <a className={estilos.evidencia} href={pago.evidenciaUrl} target="_blank" rel="noreferrer">
                      Abrir comprobante
                    </a>
                  ) : '—'}
                </dd>
              </dl>
            </>
          )}
        </div>

        <footer className={estilosModal.pie}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
