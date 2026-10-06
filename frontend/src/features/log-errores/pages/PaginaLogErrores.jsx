import BarraResumen from '../../../shared/components/BarraResumen.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import FiltroRangoFechas from '../components/FiltroRangoFechas.jsx';
import TablaLogErrores from '../components/TablaLogErrores.jsx';
import useLogErrores, { OPCIONES_MODULO } from '../hooks/useLogErrores.js';
import estilos from './PaginaLogErrores.module.css';

const MENSAJE_VACIO = 'No se ha registrado ningún error que corresponda con los criterios indicados';

/**
 * Página "Log de Errores del Sistema" (HU-SAT-05, HU-SAT-06 en lo que toca a
 * esta pantalla). Solo lectura, solo ADMIN. Compone la pantalla a partir de
 * `useLogErrores`; no llama a servicios ni filtra datos por su cuenta.
 */
export default function PaginaLogErrores() {
  const {
    errores,
    resumen,
    textoInsignia,
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
          <CampoBusqueda
            id="busqueda-log-errores"
            etiqueta="Buscar en el log de errores"
            placeholder="Buscar mensaje, tipo o módulo..."
            valor={busqueda}
            alCambiar={establecerBusqueda}
          />
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
          opciones={OPCIONES_MODULO}
          valorSeleccionado={modulo}
          alSeleccionar={establecerModulo}
        />
      </section>

      {estado === 'listo' && resumen && (
        <BarraResumen
          etiqueta="Resumen del log de errores"
          metricas={[
            { id: 'total', valor: resumen.totalErrores, etiqueta: 'Total errores', color: 'roja' },
            { id: 'modulos', valor: resumen.modulosAfectados, etiqueta: 'Módulos afectados', color: 'naranja' },
            { id: 'usuarios', valor: resumen.usuariosInvolucrados, etiqueta: 'Usuarios involucrados', color: 'azul' },
            { id: 'mostrando', valor: errores.length, etiqueta: 'Mostrando ahora', color: 'verde' }
          ]}
        />
      )}

      <p className={estilosUtil.ocultoVisualmente} role="status" aria-live="polite">
        {mensajeRegion}
      </p>

      <section className={estilos.tarjetaResultados} aria-busy={estado === 'cargando' || undefined}>
        {estado === 'cargando' && <EstadoConsulta tipo="carga" />}

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

      <p className={estilos.notaPie}>
        Los errores se retienen 30 días. Contacta al área de sistemas para investigar errores críticos.
      </p>
    </div>
  );
}
