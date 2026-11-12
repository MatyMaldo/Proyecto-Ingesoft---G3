import { useEffect, useMemo, useRef, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import { resumirTraza } from '../utils/resumirTraza.js';
import estilos from './DetalleError.module.css';

const DURACION_AVISO_COPIADO_MS = 2000;

/** Textos de cada campo copiable: etiqueta del botón según el resultado y aviso para lectores de pantalla. */
const TEXTOS_COPIA = Object.freeze({
  operacion: Object.freeze({
    etiquetas: { '': 'Copiar operación', copiado: 'Operación copiada', fallo: 'No se pudo copiar' },
    avisos: {
      copiado: 'Operación copiada al portapapeles',
      fallo: 'No se pudo copiar la operación; selecciónala y cópiala manualmente'
    }
  }),
  detalle: Object.freeze({
    etiquetas: { '': 'Copiar detalle', copiado: 'Detalle copiado', fallo: 'No se pudo copiar' },
    avisos: {
      copiado: 'Detalle copiado al portapapeles',
      fallo: 'No se pudo copiar el detalle; selecciónalo y cópialo manualmente'
    }
  })
});
const ICONOS_COPIA = Object.freeze({ '': 'copiar', copiado: 'verificar', fallo: 'alerta' });
const SIN_COPIA = Object.freeze({ campo: '', resultado: '' });

/**
 * Panel lateral de solo lectura con el detalle completo de un error del log.
 * Usa `<dialog>` + `showModal()` (capa superior, fondo inerte, Esc y foco
 * atrapado de forma nativa), igual que el detalle de Auditorías.
 *
 * La operación es el método y la ruta de la petición que falló; los procesos automáticos no
 * tienen petición y muestran «—».
 *
 * @param {Object} props
 * @param {Object|null} props.error Fila adaptada (`FilaError`). `null` → cerrado.
 * @param {() => void} props.alCerrar Se llama cuando el panel se cierra (Esc, velo o botón).
 */
export default function DetalleError({ error, alCerrar }) {
  const refDialogo = useRef(null);
  const refBotonCerrar = useRef(null);
  // Último intento de copiar: qué campo ('operacion' | 'detalle') y con qué resultado ('copiado' | 'fallo').
  const [copia, establecerCopia] = useState(SIN_COPIA);
  const [trazaCompleta, establecerTrazaCompleta] = useState(false);
  const traza = useMemo(() => resumirTraza(error?.detalle), [error?.detalle]);

  // El aviso dura un momento y se reinicia al cambiar de error.
  useEffect(() => {
    if (!copia.resultado) {
      return undefined;
    }
    const temporizador = setTimeout(() => establecerCopia(SIN_COPIA), DURACION_AVISO_COPIADO_MS);
    return () => clearTimeout(temporizador);
  }, [copia]);

  useEffect(() => {
    establecerCopia(SIN_COPIA);
    establecerTrazaCompleta(false);
  }, [error]);

  const copiar = async (campo, texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      establecerCopia({ campo, resultado: 'copiado' });
    } catch {
      // Sin permiso o sin portapapeles: se avisa y el texto sigue visible para copiarlo a mano.
      establecerCopia({ campo, resultado: 'fallo' });
    }
  };

  /** Botón de ícono que copia `texto` y muestra el resultado solo en el campo que se copió. */
  const renderizarBotonCopiar = (campo, texto, claseExtra = '') => {
    const resultado = copia.campo === campo ? copia.resultado : '';
    const etiqueta = TEXTOS_COPIA[campo].etiquetas[resultado];
    return (
      <button
        type="button"
        className={`${estilos.botonCopiar} ${claseExtra} ${resultado ? estilos[`copia_${resultado}`] : ''}`}
        onClick={() => copiar(campo, texto)}
        aria-label={etiqueta}
        title={etiqueta}
      >
        <Icono nombre={ICONOS_COPIA[resultado]} tamano={16} />
      </button>
    );
  };


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

  // La ruta se separa de su query string para atenuar los parámetros, que suelen ser lo menos relevante.
  const endpoint = error?.endpoint ?? '';
  const inicioConsulta = endpoint.indexOf('?');
  const ruta = inicioConsulta < 0 ? endpoint : endpoint.slice(0, inicioConsulta);
  const consulta = inicioConsulta < 0 ? '' : endpoint.slice(inicioConsulta);
  const hayOperacion = Boolean(error?.metodoHttp || error?.endpoint);
  const solicitud = [error?.metodoHttp, error?.endpoint].filter(Boolean).join(' ');

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
                Detalle del error
              </h2>
              <p className={estilos.soloLectura}>
                <Icono nombre="candado" tamano={14} />
                Solo lectura
                <span aria-hidden="true">·</span>
                <span>ID {error.id}</span>
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
              <div className={`${estilos.par} ${hayOperacion ? estilos.parApilado : ''}`}>
                <dt className={estilos.campo}>Operación</dt>
                <dd className={estilos.valor}>
                  {hayOperacion ? (
                    <div className={estilos.contenedorOperacion}>
                      <code className={estilos.operacion}>
                        {error.metodoHttp && <span className={estilos.metodo}>{error.metodoHttp}</span>}
                        {ruta && <span className={estilos.ruta}>{ruta}</span>}
                        {consulta && <span className={estilos.consulta}>{consulta}</span>}
                      </code>
                      {renderizarBotonCopiar('operacion', solicitud, estilos.botonCopiarEnLinea)}
                    </div>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
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
              <h3 className={estilos.subtitulo}>Detalle técnico</h3>
              {error.detalle ? (
                <>
                  <div className={estilos.contenedorTraza}>
                    <pre className={estilos.detalle} tabIndex={0} aria-label="Detalle técnico">
                      {trazaCompleta ? error.detalle : traza.texto}
                    </pre>
                    {renderizarBotonCopiar('detalle', error.detalle)}
                  </div>
                  {traza.lineasOcultas > 0 && (
                    <button
                      type="button"
                      className={estilos.botonExpandir}
                      aria-expanded={trazaCompleta}
                      onClick={() => establecerTrazaCompleta((valor) => !valor)}
                    >
                      {trazaCompleta ? 'Ver menos' : `Ver traza completa (${traza.totalLineas} líneas)`}
                    </button>
                  )}
                </>
              ) : (
                <p className={estilos.vacio}>Sin detalle técnico</p>
              )}
            </div>

            {/* Anuncio único para lectores de pantalla; el botón ya cambia su ícono y su nombre. */}
            <span className={estilos.avisoCopiado} role="status">
              {copia.resultado ? TEXTOS_COPIA[copia.campo].avisos[copia.resultado] : ''}
            </span>
          </div>
        </>
      )}
    </dialog>
  );
}
