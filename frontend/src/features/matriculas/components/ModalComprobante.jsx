import { useEffect, useId, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import {
  listarMatriculas,
  obtenerPeriodoMatricula
} from '../services/matriculasService.js';
import estilosModal from './Modal.module.css';

/**
 * Emisión masiva de compromisos de matrícula.
 * La emisión individual vive en cada fila de la tabla de matrículas.
 */
export default function ModalComprobante({ anios, anioInicialId, onCerrar, onEjecutar }) {
  const [anioId, establecerAnioId] = useState(() => (
    anioInicialId || anios?.[0]?.id || ''
  ));
  const [cantidadPendientes, establecerCantidadPendientes] = useState(null);
  const [periodo, establecerPeriodo] = useState(null);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);
  const [ejecutando, establecerEjecutando] = useState(false);
  const [resultado, establecerResultado] = useState(null);

  const idTitulo = useId();
  const idAnio = useId();

  useEffect(() => {
    if (!anioId) {
      establecerEstado('error');
      establecerError('Selecciona un año académico.');
      return undefined;
    }

    let activo = true;
    establecerEstado('cargando');
    establecerError('');

    Promise.all([
      listarMatriculas({ anioId, estado: 'PENDIENTE', page: 0, size: 1 }),
      obtenerPeriodoMatricula(anioId)
    ]).then(([respuestaMatriculas, respuestaPeriodo]) => {
      if (!activo) return;

      if (!respuestaMatriculas.exitoso) {
        establecerError(
          respuestaMatriculas.mensaje || 'No se pudieron cargar las matrículas pendientes.'
        );
        establecerEstado('error');
        return;
      }

      establecerCantidadPendientes(respuestaMatriculas.datos.totalElements);
      establecerPeriodo(respuestaPeriodo.exitoso ? respuestaPeriodo.datos : null);
      establecerEstado('listo');
    });

    return () => { activo = false; };
  }, [anioId, intento]);

  useEffect(() => {
    const manejarTecla = (evento) => {
      if (evento.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, [onCerrar]);

  const manejarClicFondo = (evento) => {
    if (evento.target === evento.currentTarget) onCerrar();
  };

  const periodoVigente = periodo?.estado === 'VIGENTE';
  const hayPendientes = (cantidadPendientes ?? 0) > 0;
  const puedeEmitir = estado === 'listo'
    && periodoVigente
    && hayPendientes
    && !ejecutando;

  const mensajePeriodo = (() => {
    if (!periodo) return 'No se pudo verificar el período de matrícula.';
    if (periodo.estado === 'VIGENTE') return 'Período de matrícula vigente.';
    if (periodo.estado === 'FINALIZADO') {
      return 'El período de matrícula finalizó; no se pueden emitir compromisos.';
    }
    if (periodo.estado === 'SIN_INICIAR') {
      return 'El período de matrícula aún no inicia.';
    }
    return 'Estado de período no reconocido.';
  })();

  const motivoBloqueo = (() => {
    if (estado !== 'listo') return 'Cargando información del año.';
    if (!periodoVigente) return mensajePeriodo;
    if (!hayPendientes) return 'No hay matrículas pendientes para emitir.';
    return '';
  })();

  const ejecutar = async () => {
    if (!puedeEmitir) return;

    establecerEjecutando(true);
    establecerError('');
    establecerResultado(null);

    const respuesta = await onEjecutar(anioId);
    establecerEjecutando(false);

    if (!respuesta.exitoso) {
      establecerError(respuesta.mensaje || 'No fue posible emitir los compromisos.');
      return;
    }

    establecerResultado(respuesta.datos);
    establecerIntento((actual) => actual + 1);
  };

  return (
    <div className={estilosModal.fondo} onMouseDown={manejarClicFondo}>
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Pagos y Matrícula</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>
              Emitir compromisos de matrícula
            </h2>
            <p className={estilosModal.tarjetaDni}>
              Emisión masiva por año académico
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

          <p className={estilosModal.textoAyuda}>
            Se emitirá un compromiso de pago de matrícula para cada matrícula
            pendiente del año que aún no tenga uno.
          </p>

          {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={2} />}

          {estado === 'error' && (
            <div>
              <p className={estilosModal.errorEstructura} role="alert">{error}</p>
              <button
                type="button"
                className={estilosModal.reintentar}
                onClick={() => establecerIntento((actual) => actual + 1)}
              >
                Reintentar
              </button>
            </div>
          )}

          {estado === 'listo' && (
            <>
              <p className={estilosModal.textoAyuda}>
                Matrículas pendientes: <strong>{cantidadPendientes ?? 0}</strong>
              </p>
              <p className={estilosModal.textoAyuda}>{mensajePeriodo}</p>
            </>
          )}

          {error && estado === 'listo' && (
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
            title={motivoBloqueo || 'Emitir todos los compromisos pendientes'}
            onClick={ejecutar}
          >
            {ejecutando ? 'Emitiendo…' : 'Emitir todos'}
          </button>
        </footer>
      </div>
    </div>
  );
}
