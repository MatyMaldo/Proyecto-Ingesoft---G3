import { useEffect, useId, useState } from 'react';

import CampoBusquedaDesplegable from '../../../shared/components/CampoBusquedaDesplegable.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import useMatriculas from '../hooks/useMatriculas.js';
import estilosModal from './Modal.module.css';

/**
 * Modal "Emiir comprobante": busca un alumno y,
 * al aceptar, entrega la asignación a `onAceptar`.
 * Se monta solo mientras está abierto, así su estado se descarta al cerrarlo.
 *
 * @param {{ onCerrar: () => void, onAceptar: (asignacion: Object) => void }} props
 */
export default function ModalComprobante({ onCerrar, onAceptar }) {
  const {
    busqueda,
    establecerBusqueda,
    hayBusqueda,
    resultados,
    buscando,
    errorBusqueda,
    alumnoSeleccionado,
    seleccionarAlumno,
    quitarAlumno,
    asignacion
  } = useMatriculas();

  const idTitulo = useId();
  const idBusqueda = useId();

  // CampoBusqueda no expone `ref`, así que el input se enfoca por su id al abrir el modal.
  useEffect(() => {
    document.getElementById(idBusqueda)?.focus();
  }, [idBusqueda]);

  useEffect(() => {
    const manejarTecla = (evento) => {
      if (evento.key === 'Escape') {
        onCerrar();
      }
    };
    
    document.addEventListener('keydown', manejarTecla);

    return () => {
      document.removeEventListener('keydown', manejarTecla);
    };
  }, [onCerrar]);

  // Cierra solo si el clic fue sobre el fondo oscuro, no dentro de la caja.
  const manejarClicFondo = (evento) => {
    if (evento.target === evento.currentTarget) {
      onCerrar();
    }
  };

  return (
    <div className={estilosModal.fondo} onMouseDown={manejarClicFondo}>
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Pagos y Matrícua</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>Emitir comprobantes de pago de matrícula</h2>
          </div>
          <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </header>

        <div className={estilosModal.cuerpo}>
          <CampoBusquedaDesplegable
            id={idBusqueda}
            etiqueta="Buscar alumno"
            etiquetaVisible
            placeholder="Buscar por nombre, DNI o código..."
            variante="relleno"
            valor={busqueda}
            alCambiar={establecerBusqueda}
            abierto={hayBusqueda}
            buscando={buscando}
            error={errorBusqueda}
            resultados={resultados}
            mensajeSinResultados="No se encontraron alumnos."
            obtenerTitulo={(alumno) => alumno.nombre}
            obtenerDetalle={(alumno) => `DNI: ${alumno.dni} · ${alumno.codigo}`}
            alSeleccionar={seleccionarAlumno}
          />

          {alumnoSeleccionado && (
            <div className={estilosModal.tarjetaAlumno}>
              <div>
                <p className={estilosModal.tarjetaEtiqueta}>Alumno seleccionado</p>
                <p className={estilosModal.tarjetaNombre}>{alumnoSeleccionado.nombre}</p>
                <p className={estilosModal.tarjetaDni}>DNI: {alumnoSeleccionado.dni}</p>
              </div>
              <button
                type="button"
                className={estilosModal.quitar}
                onClick={quitarAlumno}
                aria-label="Quitar alumno seleccionado"
              >
                <Icono nombre="cerrar" tamano={16} />
              </button>
            </div>
          )}
        </div>

        <footer className={estilosModal.pie}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className={estilosModal.botonPrimario}
            disabled={alumnoSeleccionado === null}
            onClick={() => onAceptar(alumnoSeleccionado)}
          >
            Aceptar
          </button>
        </footer>
      </div>
    </div>
  );
}