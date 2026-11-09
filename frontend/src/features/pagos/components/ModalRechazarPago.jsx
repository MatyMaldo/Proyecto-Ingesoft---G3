import { useId, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import estilosModal from './Modal.module.css';
import estilos from './ModalPagos.module.css';

export default function ModalRechazarPago({
  pago,
  onCerrar,
  onConfirmar,
  enviando = false,
  errorServicio = ''
}) {
  const [motivo, establecerMotivo] = useState('');
  const [error, establecerError] = useState('');
  const idTitulo = useId();
  const idMotivo = useId();

  const confirmar = async () => {
    const texto = motivo.trim();
    if (!texto) {
      establecerError('Escribe el motivo del rechazo.');
      return;
    }
    establecerError('');
    await onConfirmar(texto);
  };

  return (
    <div className={estilosModal.fondo}>
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Pagos</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>Rechazar pago #{pago?.id}</h2>
          </div>
          <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </header>

        <div className={estilosModal.cuerpo}>
          {errorServicio && (
            <p className={estilos.errorCampo} role="alert">{errorServicio}</p>
          )}
          <div className={estilosModal.campo}>
            <label htmlFor={idMotivo} className={estilosModal.etiqueta}>Motivo del rechazo</label>
            <textarea
              id={idMotivo}
              className={estilos.textarea}
              value={motivo}
              maxLength={300}
              placeholder="Ej. Comprobante ilegible"
              onChange={(evento) => {
                establecerMotivo(evento.target.value);
                establecerError('');
              }}
            />
            {error && <p className={estilos.errorCampo} role="alert">{error}</p>}
          </div>
        </div>

        <footer className={estilosModal.pie}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className={estilosModal.botonPrimario}
            disabled={enviando}
            onClick={confirmar}
          >
            {enviando ? 'Rechazando…' : 'Rechazar pago'}
          </button>
        </footer>
      </div>
    </div>
  );
}
