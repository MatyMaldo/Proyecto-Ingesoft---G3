import { useId, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { etiquetaCompromiso, formatearMonto } from '../utils/formatoPago.js';
import estilosModal from './Modal.module.css';

const MAXIMO_BYTES = 5 * 1024 * 1024;

function esPdf(archivo) {
  return Boolean(archivo) && (
    archivo.type === 'application/pdf'
    || archivo.name.toLowerCase().endsWith('.pdf')
  );
}

export default function ModalRegistrarPago({ compromiso, onCerrar, onRegistrar }) {
  const [monto, establecerMonto] = useState(String(compromiso?.montoTotal ?? ''));
  const [archivo, establecerArchivo] = useState(null);
  const [error, establecerError] = useState('');
  const [enviando, establecerEnviando] = useState(false);
  const idTitulo = useId();
  const idMonto = useId();
  const idArchivo = useId();

  const manejarArchivo = (evento) => {
    const seleccionado = evento.target.files?.[0] ?? null;
    establecerError('');
    if (!seleccionado) {
      establecerArchivo(null);
      return;
    }
    if (!esPdf(seleccionado)) {
      establecerArchivo(null);
      establecerError('El comprobante debe ser un archivo PDF.');
      return;
    }
    if (seleccionado.size > MAXIMO_BYTES) {
      establecerArchivo(null);
      establecerError('El comprobante no puede superar los 5 MB.');
      return;
    }
    establecerArchivo(seleccionado);
  };

  const confirmar = async () => {
    const numero = Number(monto);
    if (!Number.isFinite(numero) || numero <= 0) {
      establecerError('Ingresa un monto mayor a cero.');
      return;
    }
    if (!archivo) {
      establecerError('Selecciona el comprobante en PDF.');
      return;
    }

    establecerEnviando(true);
    establecerError('');
    const mensaje = await onRegistrar({
      compromisoId: compromiso.id,
      montoPagado: numero,
      comprobante: archivo
    });
    establecerEnviando(false);
    if (mensaje) establecerError(mensaje);
  };

  return (
    <div className={estilosModal.fondo}>
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Pago de compromiso</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>Registrar pago</h2>
            <p className={estilosModal.tarjetaDni}>
              {etiquetaCompromiso(compromiso)} · {formatearMonto(compromiso.montoTotal)}
            </p>
          </div>
          <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </header>

        <div className={estilosModal.cuerpo}>
          <div className={estilosModal.campo}>
            <label htmlFor={idMonto} className={estilosModal.etiqueta}>Monto pagado</label>
            <input
              id={idMonto}
              type="number"
              min="0.01"
              step="0.01"
              className={estilosModal.entrada}
              value={monto}
              onChange={(evento) => {
                establecerMonto(evento.target.value);
                establecerError('');
              }}
            />
          </div>

          <div className={estilosModal.campo}>
            <label htmlFor={idArchivo} className={estilosModal.etiqueta}>Comprobante PDF</label>
            <input
              id={idArchivo}
              type="file"
              accept="application/pdf,.pdf"
              className={estilosModal.entrada}
              onChange={manejarArchivo}
            />
            <p className={estilosModal.tarjetaDni}>
              Formato PDF, máximo 5 MB.
            </p>
          </div>

          {error && <p className={estilosModal.errorEstructura} role="alert">{error}</p>}
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
            {enviando ? 'Registrando…' : 'Registrar pago'}
          </button>
        </footer>
      </div>
    </div>
  );
}
