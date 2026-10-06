import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import BarraResumen from '../../../shared/components/BarraResumen.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TablaAuditoria from '../components/TablaAuditoria.jsx';
import DetalleTransaccion from '../components/DetalleTransaccion.jsx';
import useAuditoria from '../hooks/useAuditoria.js';
import { obtenerOpcionesFiltroCategoria } from '../constants/categoriasAuditoria.js';
import estilos from './PaginaAuditorias.module.css';

const OPCIONES_CATEGORIA = obtenerOpcionesFiltroCategoria();

const MENSAJE_VACIO_TOTAL = 'Aún no hay registros de auditoría.';
const MENSAJE_VACIO_FILTRADO = 'No hay registros de auditoría que coincidan con los filtros aplicados.';

/**
 * Texto de la insignia de cabecera: "{N} registros · Últimos {N} días".
 * Con 0 registros se muestra solo el conteo (docs/planes/auditorias.md §4.1).
 *
 * @param {{ totalAcciones: number, diasCubiertos: number }} resumen
 * @returns {string}
 */
function formatearTextoInsignia(resumen) {
  const textoRegistros =
    resumen.totalAcciones === 1 ? '1 registro' : `${resumen.totalAcciones} registros`;

  if (resumen.totalAcciones === 0) {
    return textoRegistros;
  }

  const textoDias = resumen.diasCubiertos === 1 ? 'Último día' : `Últimos ${resumen.diasCubiertos} días`;
  return `${textoRegistros} · ${textoDias}`;
}

/**
 * Página de Auditorías del Sistema (HU-SAT-04). Consulta de solo lectura: listado
 * general con filtros, barra de resumen y panel de detalle con el historial de
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
    reintentar,
    detalle
  } = useAuditoria();

  const metricas = [
    {
      id: 'total',
      valor: resumen ? resumen.totalAcciones : '—',
      etiqueta: 'Total acciones',
      color: 'azul-marino'
    },
    {
      id: 'modulos',
      valor: resumen ? resumen.modulosActivos : '—',
      etiqueta: 'Módulos activos',
      color: 'azul'
    },
    {
      id: 'usuarios',
      valor: resumen ? resumen.usuariosUnicos : '—',
      etiqueta: 'Usuarios únicos',
      color: 'violeta'
    },
    {
      id: 'mostrando',
      valor: resumen ? mostrandoAhora : '—',
      etiqueta: 'Mostrando ahora',
      color: 'verde'
    }
  ];

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

      <div className={estilos.barraHerramientas}>
        <div className={estilos.campoBusquedaContenedor}>
          <CampoBusqueda
            id="busqueda-auditorias"
            etiqueta="Buscar usuario, acción o módulo"
            placeholder="Buscar usuario, acción o módulo..."
            valor={busqueda}
            alCambiar={establecerBusqueda}
          />
        </div>
        <FiltroChips
          etiquetaGrupo="Filtrar por módulo"
          opciones={OPCIONES_CATEGORIA}
          valorSeleccionado={categoria}
          alSeleccionar={establecerCategoria}
        />
      </div>

      <BarraResumen etiqueta="Resumen de auditorías" metricas={metricas} />

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
        Los registros de auditoría son de solo lectura. Se retienen por 90 días según política institucional.
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
