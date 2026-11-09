import { useId } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import {
  etiquetaCompromiso,
  etiquetaEstadoCompromiso,
  etiquetaEstadoPago,
  formatearMonto,
  tonoEstadoPago
} from '../utils/formatoPago.js';
import estilosModal from './Modal.module.css';
import estilos from './ModalPagos.module.css';

export default function ModalDetallePagoApoderado({ pago, compromiso, onCerrar }) {
  const idTitulo = useId();

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
            <h2 id={idTitulo} className={estilosModal.titulo}>Pago #{pago.id}</h2>
          </div>
          <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </header>

        <div className={estilosModal.cuerpo}>
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

            <aside className={estilos.preview} aria-label="Vista previa del comprobante">
              <div className={estilos.previewCabecera}>
                <span>Comprobante</span>
                {pago.evidenciaUrl && (
                  <a
                    className={estilos.evidencia}
                    href={pago.evidenciaUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir en pestaña nueva
                  </a>
                )}
              </div>

              {pago.evidenciaUrl ? (
                <iframe
                  className={estilos.pdf}
                  src={pago.evidenciaUrl}
                  title={`Comprobante del pago ${pago.id}`}
                  loading="lazy"
                />
              ) : (
                <p className={estilos.previewVacio}>Comprobante no disponible.</p>
              )}
            </aside>
          </div>
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
