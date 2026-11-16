import BarraBusquedaListado from '../../../shared/components/BarraBusquedaListado.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroRangoFechas from '../../../shared/components/FiltroRangoFechas.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import SelectorFilasPagina from '../../../shared/components/SelectorFilasPagina.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TablaLogErrores from '../components/TablaLogErrores.jsx';
import useLogErrores, { OPCIONES_MODULO } from '../hooks/useLogErrores.js';
import {
  OPCIONES_TAMANIO_PAGINA_LOG_ERRORES,
  SOPORTA_FILTRO_MODULO_Y_BUSQUEDA
} from '../services/logErroresService.js';
import estilos from './PaginaLogErrores.module.css';

const MENSAJE_VACIO = 'No se encontraron errores con los criterios indicados';

/**
 * Página "Log de errores" (HU-SAT-05, HU-SAT-06 en lo que toca a esta pantalla). Solo lectura, solo ADMIN. Compone la
 * pantalla a partir de `useLogErrores`; no llama a servicios ni filtra datos por su cuenta. No tiene una acción
 * general: la cabecera solo lleva título y descripción.
 */
export default function PaginaLogErrores() {
  const {
    errores,
    totalElementos,
    totalPaginas,
    pagina,
    estado,
    recargando,
    modulo,
    busqueda,
    fechaDesde,
    fechaHasta,
    mensajeErrorRango,
    rangoAplicado,
    limpiarFiltros,
    establecerModulo,
    establecerBusqueda,
    establecerFechaDesde,
    establecerFechaHasta,
    irAPagina,
    tamanioPagina,
    cambiarTamanioPagina,
    reintentar
  } = useLogErrores();

  const hayRango = Boolean(rangoAplicado.fechaDesde || rangoAplicado.fechaHasta);
  const hayModulo = SOPORTA_FILTRO_MODULO_Y_BUSQUEDA && modulo !== 'TODOS';
  const hayBusqueda = SOPORTA_FILTRO_MODULO_Y_BUSQUEDA && busqueda.trim().length > 0;
  const hayFiltros = hayRango || hayModulo || hayBusqueda;
  let mensajeRegion = '';
  if (recargando) {
    mensajeRegion = 'Actualizando resultados…';
  } else if (estado === 'listo') {
    const cantidad = errores.length === 1 ? 'Mostrando 1 error' : `Mostrando ${errores.length} errores`;
    mensajeRegion = totalPaginas > 1 ? `Página ${pagina + 1} de ${totalPaginas}. ${cantidad}` : cantidad;
  }

  return (
    <div className={estilos.pagina}>
      {/* Barra de título (GUI §6): título y descripción en la misma línea. Sin acción global. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Log de errores</h1>
          <p className={estilos.descripcion}>
            Consulta de solo lectura. Los errores registrados se conservan de forma permanente.
          </p>
        </div>
      </header>

      {/* Primera línea: buscador, "Actualizar" y "Limpiar filtros". Debajo, los filtros: primero las fechas y luego
          el módulo. */}
      <section className={estilos.filtros} aria-label="Búsqueda y filtros del log de errores">
        <BarraBusquedaListado
          alActualizar={reintentar}
          actualizando={recargando}
          hayFiltros={hayFiltros}
          alLimpiar={limpiarFiltros}
        >
          {SOPORTA_FILTRO_MODULO_Y_BUSQUEDA && (
            <CampoBusqueda
              id="busqueda-log-errores"
              etiqueta="Buscar por mensaje, tipo de error o usuario"
              placeholder="Buscar por mensaje, tipo de error o usuario"
              valor={busqueda}
              alCambiar={establecerBusqueda}
            />
          )}
        </BarraBusquedaListado>

        <div className={estilos.filaFiltros}>
          <FiltroRangoFechas
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            alCambiarFechaDesde={establecerFechaDesde}
            alCambiarFechaHasta={establecerFechaHasta}
            mensajeError={mensajeErrorRango}
          />
          {SOPORTA_FILTRO_MODULO_Y_BUSQUEDA && (
            <SelectFiltro
              id="modulo-log-errores"
              etiqueta="Módulo"
              valor={modulo}
              opciones={OPCIONES_MODULO}
              alCambiar={establecerModulo}
              apilado
            />
          )}
        </div>
      </section>

      <p className={estilosUtil.ocultoVisualmente} role="status" aria-live="polite">
        {mensajeRegion}
      </p>

      <section className={estilos.tarjetaResultados} aria-busy={estado === 'cargando' || undefined}>
        {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={5} />}

        {estado === 'error' && <EstadoConsulta tipo="error" alReintentar={reintentar} />}

        {estado === 'listo' && errores.length === 0 && (
          <EstadoConsulta tipo="vacio" icono="verificar" mensaje={MENSAJE_VACIO} />
        )}

        {estado === 'listo' && errores.length > 0 && (
          <>
            {/* `key` en la página: al cambiar de página la tabla se vuelve a montar y su scroll vuelve arriba. */}
            <TablaLogErrores key={pagina} errores={errores} ocupado={recargando} />
            {/* Un solo pie: filas por página a la izquierda y, a la derecha, el total y el paginador. */}
            <div className={estilos.pie}>
              <SelectorFilasPagina
                opciones={OPCIONES_TAMANIO_PAGINA_LOG_ERRORES}
                valor={tamanioPagina}
                totalElementos={totalElementos}
                alCambiar={cambiarTamanioPagina}
              />
              <Paginacion
                pagina={pagina}
                totalPaginas={totalPaginas}
                totalElementos={totalElementos}
                tamanioPagina={tamanioPagina}
                cantidadEnPagina={errores.length}
                alCambiarPagina={irAPagina}
                etiqueta="Paginación de logs de errores"
                unidadSingular="error"
                unidadPlural="errores"
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
