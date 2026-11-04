import { useEffect, useRef } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import estilos from './DetalleError.module.css';

/**
 * Panel lateral de solo lectura con el detalle completo de un error del log.
 * Usa `<dialog>` + `showModal()` (capa superior, fondo inerte, Esc y foco
 * atrapado de forma nativa), igual que el detalle de Auditorías.
 *
 * @param {Object} props
 * @param {Object|null} props.error Fila adaptada (`FilaError`). `null` → cerrado.
 * @param {() => void} props.alCerrar Se llama cuando el panel se cierra (Esc, velo o botón).
 */
export default function DetalleError({ error, alCerrar }) {
  const refDialogo = useRef(null);
  const refBotonCerrar = useRef(null);

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (dialogo && error && !dialogo.open) {
      dialogo.showModal();
      refBotonCerrar.current?.focus();
    }
  }, [error]);

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) {
      return undefined;
    }

    const manejarCierre = () => alCerrar();
    dialogo.addEventListener('close', manejarCierre);
    return () => dialogo.removeEventListener('close', manejarCierre);
  }, [alCerrar]);

  useEffect(() => {
    if (!error) {
      return undefined;
    }
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [error]);

  const manejarClicDialogo = (evento) => {
    if (evento.target === refDialogo.current) {
      refDialogo.current?.close();
    }
  };

  const solicitud = error ? [error.metodoHttp, error.endpoint].filter(Boolean).join(' ') : '';

  return (
    <dialog
      ref={refDialogo}
      className={estilos.dialogo}
      aria-modal="true"
      aria-labelledby="detalle-error-titulo"
      onClick={manejarClicDialogo}
    >
      {error && (
        <>
          <div className={estilos.encabezado}>
            <div>
              <h2 id="detalle-error-titulo" className={estilos.titulo}>
                Detalle del error {error.id}
              </h2>
              <p className={estilos.soloLectura}>
                <Icono nombre="candado" tamano={14} />
                Solo lectura
              </p>
            </div>
            <button
              type="button"
              ref={refBotonCerrar}
              className={estilos.botonCerrar}
              aria-label="Cerrar detalle"
              onClick={() => refDialogo.current?.close()}
            >
              <Icono nombre="cerrar" tamano={20} />
            </button>
          </div>

          <div className={estilos.cuerpo} tabIndex={0} aria-label="Contenido del detalle">
            <dl className={estilos.datos}>
              <div className={estilos.par}>
                <dt className={estilos.campo}>Fecha y hora</dt>
                <dd className={estilos.valor}>
                  <time dateTime={error.fechaHora}>
                    {formatearFechaVisible(error.fecha)} {error.hora}
                  </time>
                </dd>
              </div>
              {error.moduloEtiqueta && (
                <div className={estilos.par}>
                  <dt className={estilos.campo}>Módulo</dt>
                  <dd className={estilos.valor}>
                    <Insignia tono={error.moduloTono}>{error.moduloEtiqueta}</Insignia>
                  </dd>
                </div>
              )}
              {error.operacion && (
                <div className={estilos.par}>
                  <dt className={estilos.campo}>Operación</dt>
                  <dd className={estilos.valor}>{error.operacion}</dd>
                </div>
              )}
              {solicitud && (
                <div className={estilos.par}>
                  <dt className={estilos.campo}>Endpoint</dt>
                  <dd className={estilos.valor}>
                    <code>{solicitud}</code>
                  </dd>
                </div>
              )}
              <div className={estilos.par}>
                <dt className={estilos.campo}>Tipo de error</dt>
                <dd className={estilos.valor}>
                  <Insignia tono={error.tipoErrorTono}>{error.tipoError}</Insignia>
                </dd>
              </div>
              <div className={estilos.par}>
                <dt className={estilos.campo}>Usuario</dt>
                <dd className={estilos.valor}>{error.usuario}</dd>
              </div>
              <div className={estilos.par}>
                <dt className={estilos.campo}>Estado HTTP</dt>
                <dd className={estilos.valor}>
                  {error.codigoEstado != null ? (
                    <Insignia tono={error.codigoEstadoTono}>{error.codigoEstado}</Insignia>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className={estilos.subtitulo}>Mensaje</h3>
              <p className={estilos.mensaje}>{error.mensaje || 'Sin mensaje'}</p>
            </div>

            <div>
              <h3 className={estilos.subtitulo}>Detalle</h3>
              {error.detalle ? (
                <pre className={estilos.detalle}>{error.detalle}</pre>
              ) : (
                <p className={estilos.vacio}>Sin detalle técnico</p>
              )}
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
