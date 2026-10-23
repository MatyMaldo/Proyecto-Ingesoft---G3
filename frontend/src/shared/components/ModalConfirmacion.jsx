import { useEffect, useId, useRef } from 'react';

import estilos from './ModalConfirmacion.module.css';

/**
 * Modal para pedir una confirmación ("¿Estás seguro?") antes de una acción importante.
 * No guarda estado: quien lo usa decide cuándo montarlo y qué hacer al aceptar o cancelar.
 * Se cierra con el botón de cancelar o con Escape; no con un clic en el fondo, para evitar descartes accidentales.
 * El foco inicial queda en el botón de cancelar, la opción menos destructiva.
 *
 * @param {Object} props
 * @param {string} props.titulo
 * @param {string} [props.mensaje] Texto de la pregunta.
 * @param {Array<{ etiqueta: string, valor: string }>} [props.detalles] Resumen de los datos a confirmar.
 * @param {string} [props.textoAceptar]
 * @param {string} [props.textoCancelar]
 * @param {boolean} [props.procesando] `true`: deshabilita los botones y bloquea Escape mientras se ejecuta la acción.
 * @param {() => void} props.alAceptar
 * @param {() => void} props.alCancelar
 */
export default function ModalConfirmacion({
  titulo,
  mensaje = '',
  detalles = [],
  textoAceptar = 'Aceptar',
  textoCancelar = 'Cancelar',
  procesando = false,
  alAceptar,
  alCancelar
}) {
  const idTitulo = useId();
  const idMensaje = useId();
  const botonCancelarRef = useRef(null);

  useEffect(() => {
    botonCancelarRef.current?.focus();
  }, []);

  useEffect(() => {
    const manejarTecla = (evento) => {
      if (evento.key === 'Escape' && !procesando) {
        alCancelar();
      }
    };

    document.addEventListener('keydown', manejarTecla);

    return () => {
      document.removeEventListener('keydown', manejarTecla);
    };
  }, [alCancelar, procesando]);

  return (
    <div className={estilos.fondo}>
      <div
        className={estilos.caja}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={mensaje ? idMensaje : undefined}
      >
        <h2 id={idTitulo} className={estilos.titulo}>{titulo}</h2>
        {mensaje && <p id={idMensaje} className={estilos.mensaje}>{mensaje}</p>}

        {detalles.length > 0 && (
          <dl className={estilos.detalles}>
            {detalles.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className={estilos.detalle}>
                <dt>{etiqueta}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className={estilos.pie}>
          <button
            ref={botonCancelarRef}
            type="button"
            className={estilos.botonSecundario}
            disabled={procesando}
            onClick={alCancelar}
          >
            {textoCancelar}
          </button>
          <button type="button" className={estilos.botonPrimario} disabled={procesando} onClick={alAceptar}>
            {procesando ? 'Guardando…' : textoAceptar}
          </button>
        </div>
      </div>
    </div>
  );
}
