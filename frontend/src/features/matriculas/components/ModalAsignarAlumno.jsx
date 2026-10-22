import { useEffect, useId, useState } from 'react';

import CampoBusquedaDesplegable from '../../../shared/components/CampoBusquedaDesplegable.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import useMatriculas from '../hooks/useMatriculas.js';
import estilosModal from './Modal.module.css';

/**
 * Modal "Asignar alumno a sección": busca un alumno, elige grado y sección y,
 * al aceptar, entrega la asignación a `onAceptar`.
 * Se monta solo mientras está abierto, así su estado se descarta al cerrarlo.
 *
 * @param {{ onCerrar: () => void, onAceptar: (asignacion: Object) => void }} props
 */
export default function ModalAsignarAlumno({ onCerrar, onAceptar }) {
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
    grados,
    estadoEstructura,
    errorEstructura,
    reintentarEstructura,
    gradoId,
    seleccionarGrado,
    secciones,
    seccionId,
    seleccionarSeccion,
    asignacion
  } = useMatriculas();

  const idTitulo = useId();
  const idBusqueda = useId();
  const idGrado = useId();
  const idSeccion = useId();

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

  const renderizarSecciones = () => {
    if (gradoId === null) {
      return <p className={estilosModal.textoAyuda}>Seleccione primero un grado.</p>;
    }

    if (secciones.length === 0) {
      return <p className={estilosModal.textoAyuda}>Este grado no tiene secciones en el año académico vigente.</p>;
    }

    return (
      <div className={estilosModal.chips} role="radiogroup" aria-labelledby={idSeccion}>
        {secciones.map((seccion) => {
          const activa = seccion.id === seccionId;

          return (
            <button
              key={seccion.id}
              type="button"
              role="radio"
              aria-checked={activa}
              className={activa ? `${estilosModal.chip} ${estilosModal.chipActivo}` : estilosModal.chip}
              onClick={() => seleccionarSeccion(seccion.id)}
            >
              {seccion.nombre}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={estilosModal.fondo} onMouseDown={manejarClicFondo}>
      <div className={estilosModal.caja} role="dialog" aria-modal="true" aria-labelledby={idTitulo}>
        <header className={estilosModal.cabecera}>
          <div>
            <p className={estilosModal.sobretitulo}>Gestión académica</p>
            <h2 id={idTitulo} className={estilosModal.titulo}>Asignar alumno a sección</h2>
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

          <div className={estilosModal.campo}>
            <label htmlFor={idGrado} className={estilosModal.etiqueta}>Grado académico</label>
            <select
              id={idGrado}
              className={estilosModal.entrada}
              value={gradoId ?? ''}
              disabled={estadoEstructura !== 'listo'}
              onChange={(evento) => seleccionarGrado(evento.target.value)}
            >
              <option value="">
                {estadoEstructura === 'cargando' ? 'Cargando grados...' : 'Seleccionar grado...'}
              </option>
              {grados.map((grado) => (
                <option key={grado.id} value={grado.id}>{grado.nombre}</option>
              ))}
            </select>
            {estadoEstructura === 'error' && (
              <div className={estilosModal.errorEstructura} role="alert">
                <span>{errorEstructura}</span>
                <button type="button" className={estilosModal.reintentar} onClick={reintentarEstructura}>
                  Reintentar
                </button>
              </div>
            )}
          </div>

          <div className={estilosModal.campo}>
            <span id={idSeccion} className={estilosModal.etiqueta}>Sección</span>
            {renderizarSecciones()}
          </div>
        </div>

        <footer className={estilosModal.pie}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className={estilosModal.botonPrimario}
            disabled={asignacion === null}
            onClick={() => onAceptar(asignacion)}
          >
            Aceptar
          </button>
        </footer>
      </div>
    </div>
  );
}