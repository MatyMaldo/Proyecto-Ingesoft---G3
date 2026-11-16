import { useState } from 'react';

import BarraBusquedaListado from '../../../shared/components/BarraBusquedaListado.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroRangoFechas from '../../../shared/components/FiltroRangoFechas.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import SelectorFilasPagina from '../../../shared/components/SelectorFilasPagina.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TablaAuditoria from '../components/TablaAuditoria.jsx';
import DetalleTransaccion from '../components/DetalleTransaccion.jsx';
import useAuditoria from '../hooks/useAuditoria.js';
import { obtenerOpcionesFiltroCategoria } from '../constants/categoriasAuditoria.js';
import { OPCIONES_TAMANIO_PAGINA_AUDITORIA } from '../constants/paginacionAuditoria.js';
import { TIPOS_ACCION_AUDITORIA } from '../constants/tiposAccionAuditoria.js';
import estilos from './PaginaAuditorias.module.css';

const OPCIONES_MODULO = obtenerOpcionesFiltroCategoria().map((opcion) => ({
  valor: opcion.valor,
  etiqueta: opcion.valor === 'TODOS' ? 'Todos los módulos' : opcion.etiqueta
}));

const OPCIONES_ACCION = [
  { valor: '', etiqueta: 'Todas las acciones' },
  ...TIPOS_ACCION_AUDITORIA.map((tipo) => ({ valor: tipo.valor, etiqueta: tipo.etiqueta }))
];

const MENSAJE_VACIO_TOTAL = 'Aún no hay registros de auditoría.';
// Esc. 6 (HU-SAT-04, 2026-11-01): texto exacto, sin punto final (docs/planes/auditorias.md §B).
const MENSAJE_VACIO_FILTRADO = 'No se encontraron registros de auditoría con los criterios indicados';

/**
 * Página de Auditorías (HU-SAT-04). Consulta de solo lectura: listado general con filtros, paginación y panel de
 * detalle con el historial de una transacción. No hay ningún control de edición ni eliminación, y tampoco una
 * acción general: la cabecera solo lleva título y descripción.
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
    tamanioPagina,
    cambiarTamanioPagina,
    reintentar,
    detalle
  } = useAuditoria();

  const [filtrosAbiertos, establecerFiltrosAbiertos] = useState(false);

  const hayRangoVigente = Boolean(rangoVigente.fechaDesde || rangoVigente.fechaHasta);
  const filtrosActivos = (categoria !== 'TODOS' ? 1 : 0) + (tipoAccion ? 1 : 0) + (hayRangoVigente ? 1 : 0);
  const hayFiltrosAplicados = filtrosActivos > 0 || busqueda.trim().length > 0;
  const mensajeVacio = hayFiltrosAplicados ? MENSAJE_VACIO_FILTRADO : MENSAJE_VACIO_TOTAL;
  const hayResultados = estado === 'listo' && registros.length > 0;

  return (
    <div className={estilos.pagina}>
      {/* Barra de título (GUI §6): título y descripción en la misma línea. Sin acción global. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Auditorías</h1>
          <p className={estilos.descripcion}>
            Consulta de solo lectura. Los registros se conservan de forma permanente.
          </p>
        </div>
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

            <SelectFiltro
              id="modulo-auditorias"
              etiqueta="Módulo"
              valor={categoria}
              opciones={OPCIONES_MODULO}
              alCambiar={establecerCategoria}
              apilado
            />

            <SelectFiltro
              id="tipo-accion-auditorias"
              etiqueta="Tipo de acción"
              valor={tipoAccion}
              opciones={OPCIONES_ACCION}
              alCambiar={establecerTipoAccion}
              apilado
            />
          </div>
        </div>
      </section>

      <section className={estilos.tarjetaResultados} aria-label="Registros de auditoría" aria-busy={estado === 'cargando' || undefined}>
        {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={5} />}
        {estado === 'error' && <EstadoConsulta tipo="error" alReintentar={reintentar} />}
        {estado === 'listo' && registros.length === 0 && (
          <EstadoConsulta tipo="vacio" icono="escudo" mensaje={mensajeVacio} />
        )}
        {hayResultados && (
          <>
            {/* `key` en la página: al cambiar de página la tabla se vuelve a montar y su scroll vuelve arriba. */}
            <TablaAuditoria
              key={pagina}
              registros={registros}
              actualizando={actualizando}
              alSeleccionarRegistro={detalle.abrir}
            />
            {/* Un solo pie: filas por página a la izquierda y, a la derecha, el total y el paginador. */}
            <div className={estilos.pie}>
              <SelectorFilasPagina
                opciones={OPCIONES_TAMANIO_PAGINA_AUDITORIA}
                valor={tamanioPagina}
                totalElementos={totalElementos}
                alCambiar={cambiarTamanioPagina}
              />
              <Paginacion
                pagina={pagina}
                totalPaginas={totalPaginas}
                totalElementos={totalElementos}
                tamanioPagina={tamanioPagina}
                cantidadEnPagina={cantidadPagina}
                alCambiarPagina={cambiarPagina}
                etiqueta="Paginación de auditorías"
                unidadSingular="registro"
                unidadPlural="registros"
                anunciarTotal
              />
            </div>
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
