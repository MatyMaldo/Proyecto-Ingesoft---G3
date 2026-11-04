import { useRef } from 'react';

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
    establecerModulo,
    establecerBusqueda,
    establecerFechaDesde,
    establecerFechaHasta,
    irAPagina,
    reintentar
  } = useLogErrores();

  const refInicioListado = useRef(null);

  // Al cambiar de página, devuelve la vista al inicio del listado (paginador superior).
  const cambiarPagina = (nuevaPagina) => {
    irAPagina(nuevaPagina);
    const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    refInicioListado.current?.scrollIntoView?.({
      block: 'start',
      behavior: reducirMovimiento ? 'auto' : 'smooth'
    });
  };

  let mensajeRegion = '';
  if (recargando) {
    mensajeRegion = 'Actualizando resultados…';
  } else if (estado === 'listo') {
    const cantidad = errores.length === 1 ? 'Mostrando 1 error' : `Mostrando ${errores.length} errores`;
    mensajeRegion = totalPaginas > 1 ? `Página ${pagina + 1} de ${totalPaginas}. ${cantidad}` : cantidad;
  }

  // El mismo paginador (con resumen y campo de página) va arriba y abajo del listado.
  const pieDePaginacion = (posicion) => (
    <Paginacion
      pagina={pagina}
      totalPaginas={totalPaginas}
      totalElementos={totalElementos}
      tamanioPagina={TAMANIO_PAGINA_LOG_ERRORES}
      cantidadEnPagina={errores.length}
      alCambiarPagina={cambiarPagina}
      etiqueta={`Paginación de logs de errores (${posicion})`}
      unidadSingular="error"
      unidadPlural="errores"
    />
  );

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Módulo de administración</p>
          <h1 className={estilos.titulo}>Log de Errores del Sistema</h1>
        </div>
      </header>

      <section className={estilos.filtros} aria-label="Filtros del log de errores">
        <div className={estilos.filaUno}>
          {SOPORTA_FILTRO_MODULO_Y_BUSQUEDA && (
            <>
              <CampoBusqueda
                id="busqueda-log-errores"
                etiqueta="Buscar por operación, mensaje o usuario"
                placeholder="Buscar operación, mensaje o usuario"
                valor={busqueda}
                alCambiar={establecerBusqueda}
              />
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
            </>
          )}
          <FiltroRangoFechas
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            alCambiarFechaDesde={establecerFechaDesde}
            alCambiarFechaHasta={establecerFechaHasta}
            mensajeError={mensajeErrorRango}
          />
        </div>
      </section>

      <div ref={refInicioListado} className={estilos.filaInfo}>
        <p className={estilos.notaPie}>
          <Icono nombre="informacion" tamano={16} />
          <span>Los errores registrados son de solo lectura y se conservan de forma permanente.</span>
        </p>

        {estado === 'listo' && errores.length > 0 && pieDePaginacion('superior')}
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
          </>
        )}
      </section>

      {estado === 'listo' && errores.length > 0 && pieDePaginacion('inferior')}
    </div>
  );
}
