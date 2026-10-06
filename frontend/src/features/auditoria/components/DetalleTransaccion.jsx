import { useEffect, useRef } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import estilos from './DetalleTransaccion.module.css';

/**
 * Bloque de pares campo → valor de solo lectura ("valores antes"/"valores
 * después"). Sin tachados, colores de diferencia ni marcas de edición
 * (docs/planes/auditorias.md §4.3).
 *
 * @param {Object} props
 * @param {string} props.titulo
 * @param {Array<{ campo: string, valor: string }>|null} props.valores
 * @param {string} props.mensajeVacio
 */
function BloqueValores({ titulo, valores, mensajeVacio }) {
  return (
    <div>
      <h3 className={estilos.subtitulo}>{titulo}</h3>
      {valores && valores.length > 0 ? (
        <dl className={estilos.listaValores}>
          {valores.map((par) => (
            <div key={par.campo} className={estilos.parValor}>
              <dt className={estilos.campoValor}>{par.campo}</dt>
              <dd className={estilos.valorValor}>{par.valor}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={estilos.mensajeVacio}>{mensajeVacio}</p>
      )}
    </div>
  );
}

/**
 * Un elemento del historial de la transacción (orden ascendente).
 *
 * @param {Object} props
 * @param {Object} props.item RegistroVista.
 * @param {boolean} props.esSeleccionado
 */
function ItemHistorial({ item, esSeleccionado }) {
  return (
    <li
      className={esSeleccionado ? estilos.itemSeleccionado : estilos.item}
      aria-current={esSeleccionado ? 'true' : undefined}
    >
      {esSeleccionado && <span className={estilos.etiquetaSeleccionado}>Registro seleccionado</span>}
      <p className={estilos.fechaHistorial}>
        <time dateTime={item.fechaHoraIso}>
          {item.fecha} {item.hora}
        </time>
      </p>
      <p className={estilos.tipoHistorial}>{item.tipoTransaccion}</p>
      <p className={estilos.usuarioHistorial}>
        {item.usuario.nombre} ({item.usuario.rol})
      </p>
      <BloqueValores titulo="Antes" valores={item.valoresAntes} mensajeVacio="Sin valores previos" />
      <BloqueValores titulo="Después" valores={item.valoresDespues} mensajeVacio="Sin valores posteriores" />
    </li>
  );
}

/**
 * Diálogo modal de solo lectura con el detalle de un registro de auditoría y
 * el historial de su transacción. Implementado con `<dialog>` + `showModal()`
 * para obtener capa superior, fondo inerte, Esc y foco atrapado de forma nativa
 * (docs/planes/auditorias.md §4.3).
 *
 * @param {Object} props
 * @param {Object|null} props.registro RegistroVista. `null` → el diálogo está cerrado.
 * @param {{ estado: 'cargando'|'error'|'listo', registros: Array }} props.historial
 * @param {() => void} props.alReintentarHistorial
 * @param {() => void} props.alCerrar Se llama cuando el diálogo se cierra (Esc, velo o botón Cerrar).
 */
export default function DetalleTransaccion({ registro, historial, alReintentarHistorial, alCerrar }) {
  const refDialogo = useRef(null);
  const refBotonCerrar = useRef(null);

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) {
      return;
    }
    if (registro && !dialogo.open) {
      dialogo.showModal();
      refBotonCerrar.current?.focus();
    }
  }, [registro]);

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) {
      return;
    }

    const manejarCierre = () => alCerrar();
    dialogo.addEventListener('close', manejarCierre);
    return () => dialogo.removeEventListener('close', manejarCierre);
  }, [alCerrar]);

  useEffect(() => {
    if (!registro) {
      return undefined;
    }
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [registro]);

  const manejarClicCerrar = () => {
    refDialogo.current?.close();
  };

  const manejarClicDialogo = (evento) => {
    if (evento.target === refDialogo.current) {
      refDialogo.current?.close();
    }
  };

  return (
    <dialog
      ref={refDialogo}
      className={estilos.dialogo}
      aria-modal="true"
      aria-labelledby="detalle-auditoria-titulo"
      aria-describedby="detalle-auditoria-solo-lectura"
      onClick={manejarClicDialogo}
    >
      {registro && (
        <>
          <div className={estilos.encabezado}>
            <div>
              <h2 id="detalle-auditoria-titulo" className={estilos.titulo}>
                Detalle del registro {registro.id}
              </h2>
              <p id="detalle-auditoria-solo-lectura" className={estilos.soloLectura}>
                <Icono nombre="candado" tamano={14} />
                Solo lectura
              </p>
            </div>
            <button
              type="button"
              ref={refBotonCerrar}
              className={estilos.botonCerrar}
              aria-label="Cerrar detalle"
              onClick={manejarClicCerrar}
            >
              <Icono nombre="cerrar" tamano={20} />
            </button>
          </div>

          <div className={estilos.cuerpo} tabIndex={0} aria-label="Contenido del detalle">
            <dl className={estilos.datosRegistro}>
              <div className={estilos.parValor}>
                <dt className={estilos.campoValor}>ID</dt>
                <dd className={estilos.valorValor}>{registro.id}</dd>
              </div>
              <div className={estilos.parValor}>
                <dt className={estilos.campoValor}>Tipo de transacción</dt>
                <dd className={estilos.valorValor}>{registro.tipoTransaccion}</dd>
              </div>
              <div className={estilos.parValor}>
                <dt className={estilos.campoValor}>Usuario</dt>
                <dd className={estilos.valorValor}>
                  {registro.usuario.nombre} ({registro.usuario.rol})
                </dd>
              </div>
              <div className={estilos.parValor}>
                <dt className={estilos.campoValor}>Fecha y hora</dt>
                <dd className={estilos.valorValor}>
                  <time dateTime={registro.fechaHoraIso}>{registro.fechaHoraCompleta}</time>
                </dd>
              </div>
              <div className={estilos.parValor}>
                <dt className={estilos.campoValor}>Módulo</dt>
                <dd className={estilos.valorValor}>
                  <Insignia tono={registro.modulo.tono}>{registro.modulo.etiqueta}</Insignia>
                </dd>
              </div>
            </dl>

            <BloqueValores
              titulo="Valores antes del cambio"
              valores={registro.valoresAntes}
              mensajeVacio="Sin valores previos"
            />
            <BloqueValores
              titulo="Valores después del cambio"
              valores={registro.valoresDespues}
              mensajeVacio="Sin valores posteriores"
            />

            <section>
              <h3 className={estilos.subtitulo}>Historial de la transacción</h3>

              {historial.estado === 'cargando' && <EstadoConsulta tipo="carga" />}
              {historial.estado === 'error' && (
                <EstadoConsulta tipo="error" alReintentar={alReintentarHistorial} />
              )}
              {historial.estado === 'listo' && (
                <>
                  <p className={estilos.subtituloHistorial}>
                    Del más antiguo al más reciente ·{' '}
                    {historial.registros.length === 1
                      ? '1 registro'
                      : `${historial.registros.length} registros`}
                  </p>
                  <ol className={estilos.listaHistorial}>
                    {historial.registros.map((item) => (
                      <ItemHistorial key={item.id} item={item} esSeleccionado={item.id === registro.id} />
                    ))}
                  </ol>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </dialog>
  );
}
