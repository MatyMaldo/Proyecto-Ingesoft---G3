import { useId, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import estilosModal from './Modal.module.css';

const MESES_PENSION = [
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SETIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE'
];

function mesActual() {
  const numeroMes = new Date().getMonth() + 1;
  return MESES_PENSION[numeroMes - 3] ?? '';
}

function anioEstaVigente(anio) {
  if (!anio?.fechaInicio || !anio?.fechaFin) return null;
  const hoy = new Date().toLocaleDateString('en-CA');
  const inicio = String(anio.fechaInicio).slice(0, 10);
  const fin = String(anio.fechaFin).slice(0, 10);
  return hoy >= inicio && hoy <= fin;
}

/**
 * Emisión masiva de compromisos de pensión por año y mes.
 */
export default function ModalEmitirPensionesMasivo({
  anios,
  anioInicialId,
  onCerrar,
  onEjecutar
}) {
  const [anioId, establecerAnioId] = useState(() => (
    anioInicialId || anios?.[0]?.id || ''
  ));
  const [mes, establecerMes] = useState(mesActual);
  const [ejecutando, establecerEjecutando] = useState(false);
  const [error, establecerError] = useState('');
  const [resultado, establecerResultado] = useState(null);

  const idTitulo = useId();
  const idAnio = useId();
  const idMes = useId();

  const anioSeleccionado = (anios ?? []).find(
    (anio) => String(anio.id) === String(anioId)
  );
  const vigente = anioEstaVigente(anioSeleccionado);
  const numeroMes = MESES_PENSION.indexOf(mes) + 3;
  const mesEsFuturo = Boolean(mes) && numeroMes > new Date().getMonth() + 1;
  const puedeEmitir = Boolean(anioId)
    && Boolean(mes)
    && vigente !== false
    && !mesEsFuturo
    && !ejecutando;

  const motivoBloqueo = (() => {
    if (!anioId) return 'Selecciona un año académico.';
    if (!mes) return 'Selecciona un mes.';
    if (vigente === false) return 'El año académico seleccionado no está vigente.';
    if (mesEsFuturo) return 'No se pueden emitir compromisos de meses futuros.';
    return '';
  })();

  const ejecutar = async () => {
    if (!puedeEmitir) return;

    establecerEjecutando(true);
    establecerError('');
    establecerResultado(null);

    const respuesta = await onEjecutar({ anioId, mes });
    establecerEjecutando(false);

    if (!respuesta.exitoso) {
      establecerError(respuesta.mensaje || 'No fue posible emitir los compromisos de pensión.');
      return;
    }

    establecerResultado(respuesta.datos);
  };

  return (
    <div className={estilosModal.fondo}>
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Pagos y Matrícula</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>
              Emitir compromisos de pensión
            </h2>
            <p className={estilosModal.tarjetaDni}>
              Emisión masiva por año y mes
            </p>
          </div>
          <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </header>

        <div className={estilosModal.cuerpo}>
          <div className={estilosModal.campo}>
            <label htmlFor={idAnio} className={estilosModal.etiqueta}>Año académico</label>
            <select
              id={idAnio}
              className={estilosModal.entrada}
              value={anioId}
              onChange={(evento) => {
                establecerAnioId(evento.target.value);
                establecerResultado(null);
              }}
            >
              {(anios ?? []).map((anio) => (
                <option key={anio.id} value={anio.id}>{anio.anio}</option>
              ))}
            </select>
          </div>

          <div className={estilosModal.campo}>
            <label htmlFor={idMes} className={estilosModal.etiqueta}>Mes</label>
            <select
              id={idMes}
              className={estilosModal.entrada}
              value={mes}
              onChange={(evento) => {
                establecerMes(evento.target.value);
                establecerResultado(null);
              }}
            >
              <option value="">Seleccionar mes...</option>
              {MESES_PENSION.map((nombreMes) => (
                <option key={nombreMes} value={nombreMes}>{nombreMes}</option>
              ))}
            </select>
          </div>

          <p className={estilosModal.textoAyuda}>
            Se emitirá un compromiso de pensión del mes seleccionado para cada
            matrícula confirmada del año que aún no lo tenga.
          </p>

          {vigente === false && (
            <p className={estilosModal.textoAyuda}>
              El año académico seleccionado no está vigente.
            </p>
          )}

          {error && (
            <p className={estilosModal.errorEstructura} role="alert">{error}</p>
          )}

          {resultado && (
            <div className={estilosModal.placeholderGlobal}>
              <div>
                <p className={estilosModal.etiquetaPlaceholder}>Resultado de la emisión</p>
                <p className={estilosModal.textoPlaceholder}>
                  Emitidos: <strong>{resultado.emitidos}</strong>
                  {' · '}
                  Omitidos: <strong>{resultado.omitidos}</strong>
                  {' · '}
                  Errores: <strong>{resultado.errores.length}</strong>
                </p>
                {resultado.errores.map((errorMatricula) => (
                  <p
                    key={errorMatricula.matriculaId}
                    className={estilosModal.errorEstructura}
                  >
                    Matrícula #{errorMatricula.matriculaId}: {errorMatricula.mensaje}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className={estilosModal.pie}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
            Cerrar
          </button>
          <button
            type="button"
            className={estilosModal.botonPrimario}
            disabled={!puedeEmitir}
            title={motivoBloqueo || 'Emitir pensiones del mes'}
            onClick={ejecutar}
          >
            {ejecutando ? 'Emitiendo…' : 'Emitir pensiones del mes'}
          </button>
        </footer>
      </div>
    </div>
  );
}
