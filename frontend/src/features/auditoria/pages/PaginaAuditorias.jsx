import { useRef, useState } from 'react';

import BarraBusquedaListado from '../../../shared/components/BarraBusquedaListado.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroRangoFechas from '../../../shared/components/FiltroRangoFechas.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TablaAuditoria from '../components/TablaAuditoria.jsx';
import DetalleTransaccion from '../components/DetalleTransaccion.jsx';
import useAuditoria from '../hooks/useAuditoria.js';
import { obtenerOpcionesFiltroCategoria } from '../constants/categoriasAuditoria.js';
import { TAMANIO_PAGINA_AUDITORIA } from '../constants/paginacionAuditoria.js';
import { TIPOS_ACCION_AUDITORIA } from '../constants/tiposAccionAuditoria.js';
import estilos from './PaginaAuditorias.module.css';

const OPCIONES_CATEGORIA = obtenerOpcionesFiltroCategoria();

const MENSAJE_VACIO_TOTAL = 'Aún no hay registros de auditoría.';
// Esc. 6 (HU-SAT-04, 2026-11-01): texto exacto, sin punto final (docs/planes/auditorias.md §B).
const MENSAJE_VACIO_FILTRADO = 'No se encontraron registros de auditoría con los criterios indicados';

/**
 * Página de Auditorías del Sistema (HU-SAT-04). Consulta de solo lectura: listado
 * general con filtros, paginación de 10 en 10 y panel de detalle con el historial de
 * una transacción. No hay ningún control de edición ni eliminación.
 */
export default function PaginaAuditorias() {
  const {
    registros,
    estado,
    actualizando,
    categoria,
    establecerCategoria,
    busqueda,
    establecerBusqueda,
    tipoAccion,
    establecerTipoAccion,
    fechaDesde,
    establecerFechaDesde,
    fechaHasta,
    establecerFechaHasta,
    mensajeErrorRango,
    rangoVigente,
    limpiarFiltros,
    pagina,
    totalPaginas,
    totalElementos,
    cantidadPagina,
    cambiarPagina,
    reintentar,
    detalle
  } = useAuditoria();

  const [filtrosAbiertos, establecerFiltrosAbiertos] = useState(false);
  const refInicioListado = useRef(null);

  const hayRangoVigente = Boolean(rangoVigente.fechaDesde || rangoVigente.fechaHasta);
  const filtrosActivos = (categoria !== 'TODOS' ? 1 : 0) + (tipoAccion ? 1 : 0) + (hayRangoVigente ? 1 : 0);
  const hayFiltrosAplicados = filtrosActivos > 0 || busqueda.trim().length > 0;
  const mensajeVacio = hayFiltrosAplicados ? MENSAJE_VACIO_FILTRADO : MENSAJE_VACIO_TOTAL;
  const hayResultados = estado === 'listo' && registros.length > 0;

  // Al cambiar de página (sobre todo desde el paginador inferior) la vista vuelve al inicio del listado.
  const irAPagina = (nuevaPagina) => {
    cambiarPagina(nuevaPagina);
    const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    refInicioListado.current?.scrollIntoView?.({ block: 'start', behavior: reducirMovimiento ? 'auto' : 'smooth' });
  };

  // El mismo paginador va arriba y abajo del listado; solo el superior anuncia el total.
  const paginador = (posicion) => (
    <Paginacion
      pagina={pagina}
      totalPaginas={totalPaginas}
      totalElementos={totalElementos}
      tamanioPagina={TAMANIO_PAGINA_AUDITORIA}
      cantidadEnPagina={cantidadPagina}
      alCambiarPagina={irAPagina}
      etiqueta={`Paginación de auditorías (${posicion})`}
      unidadSingular="registro"
      unidadPlural="registros"
      anunciarTotal={posicion === 'superior'}
    />
  );

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <h1 className={estilos.titulo}>Auditorías del Sistema</h1>
        <p className={estilos.descripcion}>
          <Icono nombre="candado" tamano={16} />
          <span>Consulta de solo lectura. Los registros de auditoría se conservan de forma permanente.</span>
        </p>
      </header>

      {/* Primera línea: buscador, "Actualizar" y "Limpiar filtros". Debajo, los filtros: primero las fechas y luego
          los selectores. En pantallas angostas los filtros se pliegan detrás del botón "Filtros". */}
      <section className={estilos.barraHerramientas} aria-label="Búsqueda y filtros de auditoría">
        <BarraBusquedaListado
          alActualizar={reintentar}
          actualizando={actualizando}
          hayFiltros={hayFiltrosAplicados}
          alLimpiar={limpiarFiltros}
        >
          <CampoBusqueda
            id="busqueda-auditorias"
            etiqueta="Buscar usuario o descripción"
            placeholder="Buscar por usuario o descripción"
            valor={busqueda}
            alCambiar={establecerBusqueda}
          />
        </BarraBusquedaListado>

        <div className={estilos.filaFiltros}>
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
            <FiltroRangoFechas
              fechaDesde={fechaDesde}
              fechaHasta={fechaHasta}
              alCambiarFechaDesde={establecerFechaDesde}
              alCambiarFechaHasta={establecerFechaHasta}
              mensajeError={mensajeErrorRango}
            />

            <div className={estilos.campoFiltro}>
              <label htmlFor="modulo-auditorias" className={estilos.etiquetaFiltro}>
                Módulo
              </label>
              <select
                id="modulo-auditorias"
                className={estilos.selectorFiltro}
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

            <div className={estilos.campoFiltro}>
              <label htmlFor="tipo-accion-auditorias" className={estilos.etiquetaFiltro}>
                Tipo de acción
              </label>
              <select
                id="tipo-accion-auditorias"
                className={estilos.selectorFiltro}
                value={tipoAccion}
                onChange={(evento) => establecerTipoAccion(evento.target.value)}
              >
                <option value="">Todas las acciones</option>
                {TIPOS_ACCION_AUDITORIA.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Total y paginación arriba del listado, como en Usuarios y Log de errores. */}
      {hayResultados && <div ref={refInicioListado} className={estilos.barraPaginacion}>{paginador('superior')}</div>}

      <section className={estilos.tarjetaResultados} aria-label="Registros de auditoría" aria-busy={estado === 'cargando' || undefined}>
        {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={5} />}
        {estado === 'error' && <EstadoConsulta tipo="error" alReintentar={reintentar} />}
        {estado === 'listo' && registros.length === 0 && (
          <EstadoConsulta tipo="vacio" mensaje={mensajeVacio} />
        )}
        {hayResultados && (
          <>
            <TablaAuditoria
              registros={registros}
              actualizando={actualizando}
              alSeleccionarRegistro={detalle.abrir}
            />
            {/* Con una sola página el total ya está arriba: no se repite abajo. */}
            {totalPaginas > 1 && <div className={estilos.pie}>{paginador('inferior')}</div>}
          </>
        )}
      </section>

      <DetalleTransaccion
        registro={detalle.registro}
        estadoDetalle={detalle.estado}
        mensajeErrorDetalle={detalle.mensajeError}
        historial={detalle.historial}
        alReintentarDetalle={detalle.reintentarDetalle}
        alReintentarHistorial={detalle.reintentarHistorial}
        alCerrar={detalle.cerrar}
      />
    </div>
  );
}
