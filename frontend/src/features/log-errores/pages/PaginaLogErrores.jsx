import { useRef } from 'react';

import BarraBusquedaListado from '../../../shared/components/BarraBusquedaListado.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroRangoFechas from '../../../shared/components/FiltroRangoFechas.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TablaLogErrores from '../components/TablaLogErrores.jsx';
import useLogErrores, { OPCIONES_MODULO } from '../hooks/useLogErrores.js';
import {
  SOPORTA_FILTRO_MODULO_Y_BUSQUEDA,
  TAMANIO_PAGINA_LOG_ERRORES
} from '../services/logErroresService.js';
import estilos from './PaginaLogErrores.module.css';

const MENSAJE_VACIO = 'No se encontraron errores con los criterios indicados';

/**
 * Página "Log de Errores del Sistema" (HU-SAT-05, HU-SAT-06 en lo que toca a
 * esta pantalla). Solo lectura, solo ADMIN. Compone la pantalla a partir de
 * `useLogErrores`; no llama a servicios ni filtra datos por su cuenta.
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
    reintentar
  } = useLogErrores();

  const refInicioListado = useRef(null);

  // Al cambiar de página, devuelve la vista al inicio del listado (contador de resultados).
  const cambiarPagina = (nuevaPagina) => {
    irAPagina(nuevaPagina);
    const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    refInicioListado.current?.scrollIntoView?.({
      block: 'start',
      behavior: reducirMovimiento ? 'auto' : 'smooth'
    });
  };

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

  // Arriba solo va el contador; el paginador (sin repetir el resumen) queda al pie del listado.
  const inicio = pagina * TAMANIO_PAGINA_LOG_ERRORES + 1;
  const fin = pagina * TAMANIO_PAGINA_LOG_ERRORES + errores.length;
  const unidad = totalElementos === 1 ? 'error' : 'errores';

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <h1 className={estilos.titulo}>Log de Errores del Sistema</h1>
        <p className={estilos.descripcion}>
          <Icono nombre="candado" tamano={16} />
          <span>Consulta de solo lectura. Los errores registrados se conservan de forma permanente.</span>
        </p>
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
            <div className={estilos.campoModulo}>
              <label htmlFor="modulo-log-errores" className={estilos.etiquetaModulo}>
                Módulo
              </label>
              <select
                id="modulo-log-errores"
                className={estilos.selectorModulo}
                value={modulo}
                onChange={(evento) => establecerModulo(evento.target.value)}
              >
                {OPCIONES_MODULO.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Arriba del listado solo el total: con 10 filas por página, el paginador basta al pie. */}
      <div ref={refInicioListado} className={estilos.barraContador}>
        {estado === 'listo' && errores.length > 0 && (
          <p className={estilos.contador}>
            {inicio} – {fin} de {totalElementos} {unidad}
          </p>
        )}
      </div>

      <p className={estilosUtil.ocultoVisualmente} role="status" aria-live="polite">
        {mensajeRegion}
      </p>

      <section className={estilos.tarjetaResultados} aria-busy={estado === 'cargando' || undefined}>
        {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={5} />}

        {estado === 'error' && <EstadoConsulta tipo="error" alReintentar={reintentar} />}

        {estado === 'listo' && errores.length === 0 && (
          <EstadoConsulta tipo="vacio" mensaje={MENSAJE_VACIO} />
        )}

        {estado === 'listo' && errores.length > 0 && (
          <>
            {recargando && <p className={estilos.actualizando}>Actualizando resultados…</p>}
            <TablaLogErrores errores={errores} ocupado={recargando} />
            {totalPaginas > 1 && (
              <div className={estilos.pie}>
                <Paginacion
                  pagina={pagina}
                  totalPaginas={totalPaginas}
                  totalElementos={totalElementos}
                  tamanioPagina={TAMANIO_PAGINA_LOG_ERRORES}
                  cantidadEnPagina={errores.length}
                  alCambiarPagina={cambiarPagina}
                  etiqueta="Paginación de logs de errores"
                  mostrarResumen={false}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
