import { useState } from 'react';

import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import FiltroRangoFechas from '../../../shared/components/FiltroRangoFechas.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TablaAuditoria from '../components/TablaAuditoria.jsx';
import DetalleTransaccion from '../components/DetalleTransaccion.jsx';
import useAuditoria from '../hooks/useAuditoria.js';
import { obtenerOpcionesFiltroCategoria } from '../constants/categoriasAuditoria.js';
import { obtenerTiposDeCategoria } from '../constants/tiposTransaccionAuditoria.js';
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

  const [filtrosAbiertos, establecerFiltrosAbiertos] = useState(false);
  const tiposDelModulo = obtenerTiposDeCategoria(categoria);
  const filtrosActivos =
    (categoria !== 'TODOS' ? 1 : 0) + (tipoTransaccion ? 1 : 0) + (fechaDesde || fechaHasta ? 1 : 0);
  const textoMostrandoAhora = mostrandoAhora === 1 ? '1 registro' : `${mostrandoAhora} registros`;
  const mensajeVacio = resumen && resumen.totalAcciones === 0 ? MENSAJE_VACIO_TOTAL : MENSAJE_VACIO_FILTRADO;

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Módulo de administración</p>
          <h1 className={estilos.titulo}>Auditorías del Sistema</h1>
        </div>
        {resumen && (
          <div className={estilos.espacioInsignia}>
            <span className={estilos.insigniaEstado}>
              <span className={estilos.puntoEstado} aria-hidden="true" />
              {formatearTextoInsignia(resumen)}
            </span>
          </div>
        )}
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

          <button
            type="button"
            className={estilos.botonFiltros}
            aria-expanded={filtrosAbiertos}
            aria-controls="filtros-avanzados-auditorias"
            onClick={() => establecerFiltrosAbiertos((anterior) => !anterior)}
          >
            Filtros
            {filtrosActivos > 0 && (
              <span className={estilos.contadorFiltros}>
                {filtrosActivos}
                <span className={estilosUtil.ocultoVisualmente}>
                  {filtrosActivos === 1 ? ' filtro activo' : ' filtros activos'}
                </span>
              </span>
            )}
            <Icono nombre={filtrosAbiertos ? 'chevron-arriba' : 'chevron-abajo'} tamano={16} />
          </button>

          <div
            id="filtros-avanzados-auditorias"
            className={filtrosAbiertos ? `${estilos.filtrosAvanzados} ${estilos.filtrosAbiertos}` : estilos.filtrosAvanzados}
          >
            <div className={estilos.campoTipoTransaccion}>
              <label htmlFor="modulo-auditorias" className={estilos.etiquetaTipoTransaccion}>
                Módulo
              </label>
              <select
                id="modulo-auditorias"
                className={estilos.selectorTipoTransaccion}
                value={categoria}
                onChange={(evento) => establecerCategoria(evento.target.value)}
              >
                {OPCIONES_CATEGORIA.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.valor === 'TODOS' ? 'Todos los módulos' : opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div className={estilos.campoTipoTransaccion}>
              <label htmlFor="tipo-transaccion-auditorias" className={estilos.etiquetaTipoTransaccion}>
                Tipo de transacción
              </label>
              <select
                id="tipo-transaccion-auditorias"
                className={estilos.selectorTipoTransaccion}
                value={tipoTransaccion}
                disabled={tiposDelModulo.length === 0}
                onChange={(evento) => establecerTipoTransaccion(evento.target.value)}
              >
                <option value="">
                  {tiposDelModulo.length === 0 ? 'Elige un módulo primero' : 'Todos los tipos'}
                </option>
                {tiposDelModulo.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
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
        </div>
      </section>

      <p className={estilos.notaPie}>
        <Icono nombre="informacion" tamano={16} />
        <span>Los registros de auditoría son de solo lectura y se conservan de forma permanente.</span>
      </p>

      <section className={estilos.tarjetaResultados} aria-label="Registros de auditoría">
        {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={5} />}
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
