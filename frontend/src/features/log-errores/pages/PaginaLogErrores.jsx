import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroRangoFechas from '../../../shared/components/FiltroRangoFechas.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TablaLogErrores from '../components/TablaLogErrores.jsx';
import useLogErrores from '../hooks/useLogErrores.js';
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
    textoInsignia,
    estado,
    recargando,
    fechaDesde,
    fechaHasta,
    mensajeErrorRango,
    establecerFechaDesde,
    establecerFechaHasta,
    irAPagina,
    reintentar
  } = useLogErrores();

  let mensajeRegion = '';
  if (recargando) {
    mensajeRegion = 'Actualizando resultados…';
  } else if (estado === 'listo') {
    mensajeRegion = errores.length === 1 ? 'Mostrando 1 error' : `Mostrando ${errores.length} errores`;
  }

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Módulo de administración</p>
          <h1 className={estilos.titulo}>Log de Errores del Sistema</h1>
        </div>

        {estado === 'listo' && (
          <span className={estilos.insignia}>
            <Icono nombre="alerta" tamano={16} />
            {textoInsignia}
          </span>
        )}
      </header>

      <section className={estilos.filtros} aria-label="Filtros del log de errores">
        <div className={estilos.filaUno}>
          <FiltroRangoFechas
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            alCambiarFechaDesde={establecerFechaDesde}
            alCambiarFechaHasta={establecerFechaHasta}
            mensajeError={mensajeErrorRango}
          />
        </div>
      </section>

      <p className={estilos.notaPie}>
        <Icono nombre="informacion" tamano={16} />
        <span>Los errores registrados son de solo lectura y se conservan de forma permanente.</span>
      </p>

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
            <nav className={estilos.paginacion} aria-label="Paginación de logs de errores">
              <span>
                Página {pagina + 1} de {Math.max(totalPaginas, 1)} · {totalElementos} registros
              </span>
              <div>
                <button type="button" onClick={() => irAPagina(pagina - 1)} disabled={pagina === 0 || recargando}>
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => irAPagina(pagina + 1)}
                  disabled={pagina + 1 >= totalPaginas || recargando}
                >
                  Siguiente
                </button>
              </div>
            </nav>
          </>
        )}
      </section>
    </div>
  );
}
