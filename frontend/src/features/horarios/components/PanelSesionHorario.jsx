import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import {
  etiquetaEstadoSesion,
  normalizarEstadoSesion,
  puedeCambiarOmisionSesion,
  tonoEstadoSesion
} from '../utils/estadosSesion.js';
import { formatearFecha } from '../utils/tiempo.js';
import estilos from './PanelSesionHorario.module.css';

/**
 * Drawer lateral con el detalle de una sesión y la acción de omitir/restaurar.
 * Se usa en la consulta de horario para el administrador.
 */
export default function PanelSesionHorario({
  sesion,
  cambiando = false,
  alCerrar,
  alCambiarOmision,
  acciones = null
}) {
  const panel = useRef(null);
  const cerrar = useRef(null);

  useEffect(() => {
    cerrar.current?.focus();
  }, []);

  useEffect(() => {
    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') alCerrar();
    };
    const alHacerClic = (evento) => {
      // Los diálogos modales viven en la capa superior: un clic dentro de ellos
      // no debe cerrar el drawer que los abrió.
      if (evento.target instanceof Element && evento.target.closest('dialog[open]')) {
        return;
      }
      if (panel.current && !panel.current.contains(evento.target)) {
        alCerrar();
      }
    };
    document.addEventListener('keydown', alPresionarTecla);
    document.addEventListener('mousedown', alHacerClic);
    return () => {
      document.removeEventListener('keydown', alPresionarTecla);
      document.removeEventListener('mousedown', alHacerClic);
    };
  }, [alCerrar]);

  const estado = normalizarEstadoSesion(sesion.estado);
  const omitida = estado === 'OMITIDA';
  const puedeCambiar = puedeCambiarOmisionSesion(sesion);

  let motivoSinAccion = null;
  if (!puedeCambiar) {
    if (estado === 'ACTIVA' || estado === 'FINALIZADA') {
      motivoSinAccion = 'Esta sesión ya no se puede modificar.';
    } else if (estado === 'PROGRAMADA' || estado === 'OMITIDA') {
      motivoSinAccion = 'Solo se puede modificar antes de que comience la sesión.';
    } else {
      motivoSinAccion = 'El estado actual no permite modificar la omisión.';
    }
  }

  return createPortal(
    <>
      <div className={estilos.velo} aria-hidden="true" onClick={alCerrar} />
      <aside
        ref={panel}
        className={estilos.panel}
        role="dialog"
        aria-labelledby="panel-sesion-titulo"
      >
        <header className={estilos.cabecera}>
          <div>
            <p className={estilos.sobretitulo}>Detalle de la sesión</p>
            <h2 id="panel-sesion-titulo" className={estilos.titulo}>
              {sesion.cursoNombre}
            </h2>
          </div>
          <button
            ref={cerrar}
            type="button"
            className={estilos.botonCerrar}
            aria-label="Cerrar detalle de la sesión"
            onClick={alCerrar}
          >
            <Icono nombre="cerrar" tamano={20} />
          </button>
        </header>

        <div className={estilos.contenido}>
          <div className={estilos.estadoFila}>
            <span className={estilos.etiqueta}>Estado</span>
            <Insignia tono={tonoEstadoSesion(sesion.estado)}>
              {etiquetaEstadoSesion(sesion.estado)}
            </Insignia>
          </div>

          <dl className={estilos.detalles}>
            <dt>Docente</dt>
            <dd>{sesion.docenteNombre}</dd>

            <dt>Aula</dt>
            <dd>{sesion.aulaNombre}</dd>

            <dt>Grado y sección</dt>
            <dd>
              {[sesion.gradoNombre, sesion.seccionNombre].filter(Boolean).join(' · ')}
            </dd>

            <dt>Fecha</dt>
            <dd>{formatearFecha(sesion.fecha)}</dd>

            <dt>Horario</dt>
            <dd>
              {String(sesion.horaInicio).slice(0, 5)} – {String(sesion.horaFin).slice(0, 5)}
            </dd>
          </dl>

          <div className={estilos.aviso}>
            {puedeCambiar
              ? 'La omisión conserva la sesión en el historial; puedes restaurarla mientras no haya comenzado.'
              : motivoSinAccion}
          </div>
        </div>

        <footer className={estilos.pie}>
          {acciones ?? (
            puedeCambiar ? (
              <button
                type="button"
                className={omitida ? estilos.botonRestaurar : estilos.botonOmitir}
                disabled={cambiando}
                onClick={() => alCambiarOmision(sesion, !omitida)}
              >
                <Icono nombre={omitida ? 'ojo' : 'ojo-tachado'} tamano={18} />
                {cambiando
                  ? 'Actualizando…'
                  : omitida ? 'Restaurar sesión' : 'Omitir sesión'}
              </button>
            ) : (
              <button type="button" className={estilos.botonSecundario} onClick={alCerrar}>
                Cerrar
              </button>
            )
          )}
        </footer>
      </aside>
    </>,
    document.body
  );
}
