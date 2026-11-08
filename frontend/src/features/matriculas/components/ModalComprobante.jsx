import { useEffect, useId, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import { listarMatriculas } from '../services/matriculasService.js';
import estilosModal from './Modal.module.css';

/**
 * Emisión de compromisos de matrícula desde una matrícula existente.
 * El bloque de emisión global queda como placeholder para una siguiente iteración.
 */
export default function ModalComprobante({ anioId, anio, onCerrar, onAceptar }) {
  const [matriculas, establecerMatriculas] = useState([]);
  const [seleccionada, establecerSeleccionada] = useState(null);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);
  const [enviando, establecerEnviando] = useState(false);

  const idTitulo = useId();

  useEffect(() => {
    let activo = true;
    establecerEstado('cargando');
    establecerError('');

    listarMatriculas({
      anioId,
      estado: 'PENDIENTE',
      page: 0,
      size: 100
    }).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudieron cargar las matrículas pendientes.');
        establecerEstado('error');
        return;
      }
      const pendientes = respuesta.datos.content;
      establecerMatriculas(pendientes);
      establecerSeleccionada((actual) => (
        actual && pendientes.some((matricula) => String(matricula.id) === String(actual.id))
          ? actual
          : null
      ));
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

  const confirmar = async () => {
    if (!seleccionada || enviando) return;
    establecerEnviando(true);
    await onAceptar(seleccionada);
    establecerEnviando(false);
  };

  return (
    <div className={estilosModal.fondo} onMouseDown={manejarClicFondo}>
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Pagos y Matrícula</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>
              Emitir compromisos de pago de matrícula
            </h2>
            <p className={estilosModal.tarjetaDni}>
              Matrículas pendientes{anio ? ` del año ${anio}` : ''}
            </p>
          </div>
          <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </header>

        <div className={estilosModal.cuerpo}>
          {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={3} />}

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

          {estado === 'listo' && matriculas.length === 0 && (
            <EstadoConsulta
              tipo="vacio"
              mensaje="No hay matrículas pendientes para emitir compromisos."
            />
          )}

          {estado === 'listo' && matriculas.length > 0 && (
            <div
              className={estilosModal.listaMatriculas}
              role="radiogroup"
              aria-label="Matrículas pendientes"
            >
              {matriculas.map((matricula) => {
                const activa = String(seleccionada?.id) === String(matricula.id);
                return (
                  <label
                    key={matricula.id}
                    className={`${estilosModal.opcionMatricula} ${activa ? estilosModal.opcionActiva : ''}`}
                  >
                    <input
                      type="radio"
                      name="matricula-compromiso"
                      checked={activa}
                      onChange={() => establecerSeleccionada(matricula)}
                    />
                    <span className={estilosModal.idMatricula}>#{matricula.id}</span>
                    <span className={estilosModal.detalleMatricula}>
                      <span className={estilosModal.nombreMatricula}>
                        {matricula.nombreCompletoEstudiante}
                      </span>
                      <span>
                        {matricula.gradoNombre} · Sección {matricula.seccionNombre}
                        {matricula.anioAcademico ? ` · ${matricula.anioAcademico}` : ''}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <div className={estilosModal.placeholderGlobal}>
            <div>
              <p className={estilosModal.etiquetaPlaceholder}>Emisión global del año</p>
              <p className={estilosModal.textoPlaceholder}>
                Emitir todos los compromisos pendientes de {anio ?? 'el año seleccionado'}.
              </p>
            </div>
            <button type="button" className={estilosModal.botonGlobal} disabled>
              Emitir todos (próximamente)
            </button>
          </div>
        </div>

        <footer className={estilosModal.pie}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className={estilosModal.botonPrimario}
            disabled={!seleccionada || enviando}
            onClick={confirmar}
          >
            {enviando ? 'Emitiendo…' : 'Emitir compromiso'}
          </button>
        </footer>
      </div>
    </div>
  );
}
