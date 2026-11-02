import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import FiltroRangoFechas from '../../../shared/components/FiltroRangoFechas.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TablaAuditoria from '../components/TablaAuditoria.jsx';
import DetalleTransaccion from '../components/DetalleTransaccion.jsx';
import useAuditoria from '../hooks/useAuditoria.js';
import { obtenerOpcionesFiltroCategoria, obtenerEtiquetaCategoria } from '../constants/categoriasAuditoria.js';
import { GRUPOS_TIPOS_TRANSACCION_AUDITORIA } from '../constants/tiposTransaccionAuditoria.js';
import estilos from './PaginaAuditorias.module.css';

const OPCIONES_CATEGORIA = obtenerOpcionesFiltroCategoria();

const MENSAJE_VACIO_TOTAL = 'Aún no hay registros de auditoría.';
// Esc. 6 (HU-SAT-04, 2026-11-01): texto exacto, sin punto final (docs/planes/auditorias.md §B).
const MENSAJE_VACIO_FILTRADO = 'No se encontraron registros de auditoría con los criterios indicados';

/**
 * Texto de la insignia de cabecera: "{N} registros" (LAB05, D13: sin referencia a días,
 * porque los registros son permanentes y "Últimos N días" abarcaría todo el histórico).
 *
 * @param {{ totalAcciones: number }} resumen
 * @returns {string}
 */
function formatearTextoInsignia(resumen) {
  return resumen.totalAcciones === 1 ? '1 registro' : `${resumen.totalAcciones} registros`;
}

/**
 * Página de Auditorías del Sistema (HU-SAT-04). Consulta de solo lectura: listado
 * general con filtros y panel de detalle con el historial de
 * una transacción. No hay ningún control de edición ni eliminación.
 */
export default function PaginaAuditorias() {
  const {
    registros,
    estado,
    actualizando,
    resumen,
    mostrandoAhora,
    categoria,
    establecerCategoria,
    busqueda,
    establecerBusqueda,
    tipoTransaccion,
    establecerTipoTransaccion,
    fechaDesde,
    establecerFechaDesde,
    fechaHasta,
    establecerFechaHasta,
    mensajeErrorRango,
    reintentar,
    detalle
  } = useAuditoria();

  const textoMostrandoAhora = mostrandoAhora === 1 ? '1 registro' : `${mostrandoAhora} registros`;
  const mensajeVacio = resumen && resumen.totalAcciones === 0 ? MENSAJE_VACIO_TOTAL : MENSAJE_VACIO_FILTRADO;

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Módulo de administración</p>
          <h1 className={estilos.titulo}>Auditorías del Sistema</h1>
        </div>
        <div className={estilos.espacioInsignia}>
          {resumen && (
            <span className={estilos.insigniaEstado}>
              <span className={estilos.puntoEstado} aria-hidden="true" />
              {formatearTextoInsignia(resumen)}
            </span>
          )}
        </div>
      </header>

      <section className={estilos.barraHerramientas} aria-label="Filtros de auditoría">
        <div className={estilos.filaUno}>
          <div className={estilos.campoBusquedaContenedor}>
            <CampoBusqueda
              id="busqueda-auditorias"
              etiqueta="Buscar usuario, acción o módulo"
              etiquetaVisible
              placeholder="Buscar usuario, acción o módulo..."
              valor={busqueda}
              alCambiar={establecerBusqueda}
            />
          </div>

          <div className={estilos.campoTipoTransaccion}>
            <label htmlFor="tipo-transaccion-auditorias" className={estilos.etiquetaTipoTransaccion}>
              Tipo de transacción
            </label>
            <select
              id="tipo-transaccion-auditorias"
              className={estilos.selectorTipoTransaccion}
              value={tipoTransaccion}
              onChange={(evento) => establecerTipoTransaccion(evento.target.value)}
            >
              <option value="">Todos los tipos</option>
              {GRUPOS_TIPOS_TRANSACCION_AUDITORIA.map((grupo) => (
                <optgroup key={grupo.categoria} label={obtenerEtiquetaCategoria(grupo.categoria)}>
                  {grupo.tipos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <FiltroRangoFechas
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            alCambiarFechaDesde={establecerFechaDesde}
            alCambiarFechaHasta={establecerFechaHasta}
            mensajeError={mensajeErrorRango}
          />
        </div>

        <FiltroChips
          etiquetaGrupo="Filtrar por módulo"
          opciones={OPCIONES_CATEGORIA}
          valorSeleccionado={categoria}
          alSeleccionar={establecerCategoria}
        />
      </section>

      <section className={estilos.tarjetaResultados} aria-label="Registros de auditoría">
        {estado === 'cargando' && <EstadoConsulta tipo="carga" />}
        {estado === 'error' && <EstadoConsulta tipo="error" alReintentar={reintentar} />}
        {estado === 'listo' && registros.length === 0 && (
          <EstadoConsulta tipo="vacio" mensaje={mensajeVacio} />
        )}
        {estado === 'listo' && registros.length > 0 && (
          <TablaAuditoria
            registros={registros}
            actualizando={actualizando}
            alSeleccionarRegistro={detalle.abrir}
          />
        )}
      </section>

      <p className={estilos.notaPie}>
        Los registros de auditoría son de solo lectura y se conservan de forma permanente.
      </p>

      <p role="status" aria-live="polite" className={estilosUtil.ocultoVisualmente}>
        {estado === 'listo' ? `Mostrando ${textoMostrandoAhora}` : ''}
      </p>

      <DetalleTransaccion
        registro={detalle.registro}
        historial={detalle.historial}
        alReintentarHistorial={detalle.reintentarHistorial}
        alCerrar={detalle.cerrar}
      />
    </div>
  );
}
