import { useState } from 'react';

import estilos from './PaginaPagos.module.css';
import usePagos from '../hooks/usePagos.js';
import TablaPagos from '../components/TablaPagos.jsx';
import ModalEmitirPensionesMasivo from '../components/ModalEmitirPensionesMasivo.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import { emitirCompromisosPensionLote } from '../services/pagosService.js';

const MENSAJE_VACIO = 'No hay alumnos con matrícula pendiente o confirmada en el año seleccionado.';

export default function PaginaPagos() {
  const {
    alumnos,
    estado,
    error,
    recargando,
    estadoEstructura,
    errorEstructura,
    anios,
    anioId,
    seleccionarAnio,
    grados,
    gradoId,
    seleccionarGrado,
    secciones,
    seccionId,
    seleccionarSeccion,
    cargandoSecciones,
    limpiarFiltros,
    reintentar
  } = usePagos();

  const hayFiltros = Boolean(gradoId || seccionId);

  const [modalPensionesAbierto, establecerModalPensionesAbierto] = useState(false);

  const anioSeleccionado = anios.find(
    (anio) => String(anio.id) === String(anioId)
  );

  const emitirPensionesMasivo = async ({ anioId: anioSeleccionadoId, mes }) => {
    const respuesta = await emitirCompromisosPensionLote({
      anioId: anioSeleccionadoId,
      mes
    });
    if (respuesta.exitoso) {
      reintentar();
    }
    return respuesta;
  };

  let mensajeRegion = '';
  if (recargando) {
    mensajeRegion = 'Actualizando resultados…';
  } 

  return(
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Módulo de pagos</p>
          <h1 className={estilos.titulo}>Pagos</h1>
          <p className={estilos.subtitulo}>Gestiona los pagos y compromisos de matrícula de los estudiantes.</p>
        </div>
        <button
          type="button"
          className={estilos.botonPensiones}
          disabled={estadoEstructura !== 'listo'}
          onClick={() => establecerModalPensionesAbierto(true)}
        >
          Emitir compromisos de pensión
        </button>
      </header>    

      <section className={estilos.filtros} aria-label="Filtros de pagos">
        <label className={estilos.campoFiltro}>
          Año académico
          <select
            className={estilos.selector}
            value={anioId ?? ''}
            disabled={estadoEstructura !== 'listo'}
            onChange={(evento) => seleccionarAnio(evento.target.value)}
          >
            {anios.map((anio) => (
              <option key={anio.id} value={anio.id}>{anio.anio}</option>
            ))}
          </select>
        </label>

        <label className={estilos.campoFiltro}>
          Grado
          <select
            className={estilos.selector}
            value={gradoId ?? ''}
            disabled={estadoEstructura !== 'listo'}
            onChange={(evento) => seleccionarGrado(evento.target.value)}
          >
            <option value="">Todos los grados</option>
            {grados.map((grado) => (
              <option key={grado.id} value={grado.id}>{grado.nombre}</option>
            ))}
          </select>
        </label>

        <label className={estilos.campoFiltro}>
          Sección
          <select
            className={estilos.selector}
            value={seccionId ?? ''}
            disabled={estadoEstructura !== 'listo' || !gradoId || cargandoSecciones}
            onChange={(evento) => seleccionarSeccion(evento.target.value)}
          >
            <option value="">Todas las secciones</option>
            {secciones.map((seccion) => (
              <option key={seccion.id} value={seccion.id}>{seccion.nombre}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={estilos.botonLimpiar}
          onClick={limpiarFiltros}
          disabled={!hayFiltros}
        >
          Limpiar filtros
        </button>
      </section>

      <section aria-busy={estado === 'cargando' || undefined}>
        {estadoEstructura === 'error' && (
          <EstadoConsulta
            tipo="error"
            mensaje={errorEstructura}
            alReintentar={reintentar}
          />
        )}

        {estadoEstructura !== 'error' && estado === 'cargando' && (
          <EstadoConsulta tipo="carga" filasEsqueleto={5} />
        )}

        {estadoEstructura !== 'error' && estado === 'error' && (
          <EstadoConsulta
            tipo="error"
            mensaje={error}
            alReintentar={reintentar}
          />
        )}

        {estadoEstructura !== 'error' && estado === 'listo' && alumnos.length === 0 && (
          <EstadoConsulta tipo="vacio" mensaje={MENSAJE_VACIO} />
        )}

        {estadoEstructura !== 'error' && estado === 'listo' && alumnos.length > 0 && (
          <>
            {recargando && <p>Actualizando resultados…</p>}
            <TablaPagos alumnos={alumnos} anio={anioSeleccionado} ocupado={recargando} />
          </>
        )}
      </section>

      {modalPensionesAbierto && (
        <ModalEmitirPensionesMasivo
          anios={anios}
          anioInicialId={anioId != null ? String(anioId) : ''}
          onCerrar={() => establecerModalPensionesAbierto(false)}
          onEjecutar={emitirPensionesMasivo}
        />
      )}
    </div>
  )

}