import { useEffect, useId, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { obtenerPeriodoMatricula } from '../services/matriculasService.js';
import estilosModal from './Modal.module.css';

/**
 * Actualización manual del estado de matrículas.
 * Solo se habilita cuando el período del año seleccionado ya finalizó.
 */
export default function ModalActualizarEstadosMatricula({
  anios,
  anioInicialId,
  onCerrar,
  onEjecutar
}) {
  const [anioId, establecerAnioId] = useState(() => (
    anioInicialId || anios?.[0]?.id || ''
  ));
  const [periodo, establecerPeriodo] = useState(null);
  const [estadoPeriodo, establecerEstadoPeriodo] = useState('cargando');
  const [errorPeriodo, establecerErrorPeriodo] = useState('');
  const [ejecutando, establecerEjecutando] = useState(false);
  const [errorEjecucion, establecerErrorEjecucion] = useState('');
  const [intento, establecerIntento] = useState(0);

  const idTitulo = useId();
  const idAnio = useId();

  useEffect(() => {
    if (!anioId) {
      establecerEstadoPeriodo('error');
      establecerErrorPeriodo('Selecciona un año académico.');
      return undefined;
    }

    let activo = true;
    establecerEstadoPeriodo('cargando');
    establecerErrorPeriodo('');

    obtenerPeriodoMatricula(anioId).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !respuesta.datos) {
        establecerPeriodo(null);
        establecerErrorPeriodo(
          respuesta.mensaje || 'No se pudo verificar el período de matrícula.'
        );
        establecerEstadoPeriodo('error');
        return;
      }
      establecerPeriodo(respuesta.datos);
      establecerEstadoPeriodo('listo');
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

  const puedeEjecutar = estadoPeriodo === 'listo'
    && periodo?.estado === 'FINALIZADO'
    && !ejecutando;

  const mensajePeriodo = (() => {
    if (estadoPeriodo === 'cargando') return 'Verificando el período de matrícula…';
    if (estadoPeriodo === 'error') {
      return errorPeriodo || 'No se pudo verificar el período de matrícula.';
    }
    if (periodo?.estado === 'VIGENTE') {
      return 'El período de matrícula está vigente. La actualización estará disponible cuando finalice.';
    }
    if (periodo?.estado === 'SIN_INICIAR') {
      return 'El período de matrícula aún no inicia.';
    }
    if (periodo?.estado === 'FINALIZADO') {
      return 'El período de matrícula finalizó. Puedes ejecutar la actualización.';
    }
    return 'Estado de período no reconocido.';
  })();

  const ejecutar = async () => {
    if (!puedeEjecutar) return;

    establecerEjecutando(true);
    establecerErrorEjecucion('');
    const resultado = await onEjecutar(anioId);
    establecerEjecutando(false);

    if (resultado && resultado.exitoso === false) {
      establecerErrorEjecucion(
        resultado.mensaje || 'No fue posible actualizar los estados de matrícula.'
      );
    }
  };

  return (
    <div className={estilosModal.fondo} onMouseDown={manejarClicFondo}>
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Gestión de matrículas</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>
              Actualizar estados de matrícula
            </h2>
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
                establecerErrorEjecucion('');
              }}
            >
              {(anios ?? []).map((anio) => (
                <option key={anio.id} value={anio.id}>{anio.anio}</option>
              ))}
            </select>
          </div>

          <div className={estilosModal.placeholderGlobal}>
            <div>
              <p className={estilosModal.etiquetaPlaceholder}>¿Qué hace esta acción?</p>
              <p className={estilosModal.textoPlaceholder}>
                Cancela las matrículas pendientes cuyo período ya finalizó y que
                no tienen un compromiso de matrícula pagado. No modifica
                matrículas confirmadas ni pagos.
              </p>
            </div>
          </div>

          <p className={estilosModal.textoAyuda}>{mensajePeriodo}</p>

          {estadoPeriodo === 'error' && (
            <button
              type="button"
              className={estilosModal.reintentar}
              onClick={() => establecerIntento((actual) => actual + 1)}
            >
              Reintentar
            </button>
          )}

          {errorEjecucion && (
            <p className={estilosModal.errorEstructura} role="alert">{errorEjecucion}</p>
          )}
        </div>

        <footer className={estilosModal.pie}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className={estilosModal.botonPrimario}
            disabled={!puedeEjecutar}
            onClick={ejecutar}
          >
            {ejecutando ? 'Actualizando…' : 'Ejecutar actualización'}
          </button>
        </footer>
      </div>
    </div>
  );
}
