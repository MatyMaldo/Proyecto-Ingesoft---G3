import { useEffect, useId, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import estilosModal from './Modal.module.css';
import usePagos from '../hooks/usePagos.js';

/**
 *
 * Modal para elegir año y mes y emitir el compromiso de pensión de un alumno.
 * Al aceptar entrega `{ alumno, anioId, mes }` a `onAceptar`.
 *
 * @param {{
 *   onCerrar: () => void,
 *   onAceptar: (datos: { estudianteId: number, anioId: number, mes: string }) => void,
 *   alumno: Object|null,
 *   enviando?: boolean
 * }} props
 */
export default function ModalEmitirPension({ onCerrar, onAceptar,alumno,enviando }) {

  const{
    alumnos,
    estado,
    recargando,
    anios,
    estadoEstructura,
    errorEstructura,
    anioId,
    seleccionarAnio,
    mes,
    seleccionarMes
  } = usePagos();

  const estudianteId = alumno.id;
  const idTitulo = useId();
  const idAnio = useId();
  const idMes = useId();

  return (
    <div className={estilosModal.fondo} >
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Gestión académica</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>Emitir compromiso de pago de pensión</h2>
          </div>
          <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </header>

        <div className={estilosModal.cuerpo}>

          {alumno && (
            <div className={estilosModal.tarjetaAlumno}>
              <div>
                <p className={estilosModal.tarjetaEtiqueta}>Alumno seleccionado</p>
                <p className={estilosModal.tarjetaNombre}>{alumno.nombre}</p>
                <p className={estilosModal.tarjetaDni}>
                  {alumno.dni ? `DNI: ${alumno.dni}` : `Código: ${alumno.codigo ?? '—'}`}
                </p>
              </div>
            </div>
          )}
          
          <div className={estilosModal.campo}>
            <label htmlFor={idAnio} className={estilosModal.etiqueta}>Año académico</label>
            <select
              id={idAnio}
              className={estilosModal.entrada}
              value={anioId ?? ''}
              disabled={estadoEstructura !== 'listo'}
              onChange={(evento) => seleccionarAnio(evento.target.value)}
              //onChange={() => {}}
            >
              <option value="">
                {estadoEstructura === 'cargando' ? 'Cargando años...' : 'Seleccionar año...'
                }
              </option>
              {anios.map((anio) => (
                <option key={anio.id} value={anio.id}>{anio.anio}</option>
              ))}
            </select>
            {estadoEstructura === 'error' && (
              <div className={estilosModal.errorEstructura} role="alert">
                <span>{errorEstructura}</span>
              </div>
            )}
          </div>

          <div className={estilosModal.campo}>
            <label htmlFor={idMes} className={estilosModal.etiqueta}>Mes</label>
            <select
              id={idMes}
              className={estilosModal.entrada}
              value={mes ?? ''}
              disabled={estadoEstructura !== 'listo'}
              onChange={(evento) => seleccionarMes(evento.target.value)}
              //onChange={() => {}}
            >
              <option value="">
                {estadoEstructura === 'cargando' ? 'Cargando meses...' : 'Seleccionar Mes...'
                }
              </option>
              
              <option key={1} value="MARZO">MARZO</option>
              <option key={2} value="ABRIL">ABRIL</option>
              <option key={3} value="MAYO">MAYO</option>
              <option key={4} value="JUNIO">JUNIO</option>
              <option key={5} value="JULIO">JULIO</option>
              <option key={6} value="AGOSTO">AGOSTO</option>
              <option key={7} value="SETIEMBRE">SETIEMBRE</option>
              <option key={8} value="OCTUBRE">OCTUBRE</option>
              <option key={9} value="NOVIEMBRE">NOVIEMBRE</option>
              <option key={10} value="DICIEMBRE">DICIEMBRE</option>

            </select>
            {estadoEstructura === 'error' && (
              <div className={estilosModal.errorEstructura} role="alert">
                <span>{errorEstructura}</span>
              </div>
            )}
          </div>

        </div>

        <footer className={estilosModal.pie}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className={estilosModal.botonPrimario}
            disabled={ (alumno && anioId && mes) ? false : true } // Por ahora estaría así 
            onClick={() => onAceptar({estudianteId,anioId,mes})}
            //onClick={onAceptar} Por ahora
          >
            {enviando ? 'Emitiendo...' : 'Aceptar'}
          </button>
        </footer>
      </div>
    </div>
  );
}