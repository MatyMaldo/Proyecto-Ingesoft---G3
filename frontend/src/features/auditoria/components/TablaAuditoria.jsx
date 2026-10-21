import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import estilos from './TablaAuditoria.module.css';

const TITULO_LISTA = 'Registros de auditoría, del más reciente al más antiguo';

/**
 * Construye el nombre accesible del botón "Ver historial" de un registro
 * (LAB05, D12: opción visible, no solo una etiqueta accesible del botón de acción).
 *
 * @param {Object} registro RegistroVista.
 * @returns {string}
 */
function construirEtiquetaHistorial(registro) {
  return `Ver historial: ${registro.tipoTransaccion}, ${registro.usuario.nombre}, ${registro.fecha} ${registro.hora}`;
}

/**
 * Lista de registros de auditoría, ya filtrada y ordenada (orden descendente).
 * Se renderizan ambas estructuras (tabla y tarjetas) y una media query decide
 * cuál se muestra, según la técnica acordada en docs/planes/shell.md §19.3.
 *
 * @param {Object} props
 * @param {Array} props.registros Registros a mostrar (RegistroVista, orden descendente).
 * @param {boolean} props.actualizando `true` mientras llega un refiltrado: las filas
 *   anteriores siguen visibles, atenuadas.
 * @param {(registro: Object, elementoOrigen: HTMLElement) => void} props.alSeleccionarRegistro
 *   Abre el detalle (con el historial del elemento). Recibe el elemento que lo disparó,
 *   para devolverle el foco al cerrar.
 */
export default function TablaAuditoria({ registros, actualizando, alSeleccionarRegistro }) {
  const manejarClicFila = (registro, evento) => {
    const boton = evento.currentTarget.querySelector(`.${estilos.botonHistorial}`);
    alSeleccionarRegistro(registro, boton ?? evento.currentTarget);
  };

  const manejarClicBoton = (registro, evento) => {
    evento.stopPropagation();
    alSeleccionarRegistro(registro, evento.currentTarget);
  };

  const manejarActivarTarjeta = (registro, evento) => {
    alSeleccionarRegistro(registro, evento.currentTarget);
  };

  return (
    <div aria-busy={actualizando || undefined}>
      {/* Tabla: vista de escritorio y tableta (≥768px) */}
      <div className={estilos.contenedorTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>{TITULO_LISTA}</caption>
          <thead>
            <tr>
              <th scope="col" aria-sort="descending">Fecha y hora</th>
              <th scope="col">Usuario</th>
              <th scope="col">Rol</th>
              <th scope="col">Módulo</th>
              <th scope="col">Acción</th>
              <th scope="col" className={estilosUtil.ocultoVisualmente}>Historial</th>
            </tr>
          </thead>
          <tbody className={actualizando ? estilos.filasAtenuadas : undefined}>
            {registros.map((registro) => (
              <tr
                key={registro.id}
                className={estilos.fila}
                onClick={(evento) => manejarClicFila(registro, evento)}
              >
                <td>
                  <time dateTime={registro.fechaHoraIso} className={estilos.celdaFecha}>
                    <span className={estilos.fecha}>{registro.fecha}</span>
                    <span className={estilos.hora}>{registro.hora}</span>
                  </time>
                </td>
                <td>
                  <div className={estilos.celdaUsuario}>
                    <span className={estilos.avatar} aria-hidden="true">
                      {registro.usuario.iniciales}
                    </span>
                    <span className={estilos.nombreUsuario}>{registro.usuario.nombre}</span>
                  </div>
                </td>
                <td className={estilos.celdaRol}>{registro.usuario.rol}</td>
                <td>
                  <Insignia tono={registro.modulo.tono}>{registro.modulo.etiqueta}</Insignia>
                </td>
                <td>
                  <span className={estilos.accionTexto}>{registro.tipoTransaccion}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className={estilos.botonHistorial}
                    onClick={(evento) => manejarClicBoton(registro, evento)}
                    aria-label={construirEtiquetaHistorial(registro)}
                  >
                    Ver historial
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas: vista móvil (<768px) */}
      <ul
        className={`${estilos.listaTarjetas} ${actualizando ? estilos.filasAtenuadas : ''}`}
        aria-label={TITULO_LISTA}
      >
        {registros.map((registro) => (
          <li key={registro.id}>
            <button
              type="button"
              className={estilos.tarjeta}
              onClick={(evento) => manejarActivarTarjeta(registro, evento)}
              aria-label={construirEtiquetaHistorial(registro)}
            >
              <span className={estilos.filaSuperiorTarjeta}>
                <time dateTime={registro.fechaHoraIso} className={estilos.fechaTarjeta}>
                  <span className={estilos.fecha}>{registro.fecha}</span>
                  <span className={estilos.hora}>{registro.hora}</span>
                </time>
                <Insignia tono={registro.modulo.tono}>{registro.modulo.etiqueta}</Insignia>
              </span>
              <span className={estilos.filaUsuarioTarjeta}>
                <span className={estilos.avatar} aria-hidden="true">
                  {registro.usuario.iniciales}
                </span>
                <span className={estilos.bloqueUsuarioTarjeta}>
                  <span className={estilos.nombreUsuario}>{registro.usuario.nombre}</span>
                  <span className={estilos.celdaRol}>{registro.usuario.rol}</span>
                </span>
              </span>
              <span className={estilos.filaInferiorTarjeta}>
                <span className={estilos.accionTarjeta}>{registro.tipoTransaccion}</span>
                <span className={estilos.pistaHistorial}>Ver historial</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
