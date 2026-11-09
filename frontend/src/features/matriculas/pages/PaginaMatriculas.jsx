import { useState } from 'react';

import Boton from '../../../shared/components/Boton.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import estilosBoton from '../../../shared/components/Boton.module.css';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import ModalActualizarEstadosMatricula from '../components/ModalActualizarEstadosMatricula.jsx';
import ModalAsignarAlumno from '../components/ModalAsignarAlumno.jsx';
import ModalComprobante from '../components/ModalComprobante.jsx';
import TablaMatriculas from '../components/TablaMatriculas.jsx';
import useListadoMatriculas from '../hooks/useListadoMatriculas.js';
import {
  cancelarPendientesPorPeriodo,
  crearMatricula,
  emitirCompromisoMatricula,
  emitirCompromisosMatriculaLote
} from '../services/matriculasService.js';
import estilos from './PaginaMatriculas.module.css';

const OPCIONES_ESTADO = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' }
];

export default function PaginaMatriculas() {
  const { notificacion, mostrarNotificacion } = useNotificacion();
  const {
    estructura,
    estadoEstructura,
    errorEstructura,
    secciones,
    filtros,
    cambiarFiltro,
    limpiarFiltros,
    pagina,
    totalElementos,
    totalPaginas,
    tamanioPagina,
    matriculas,
    estado,
    error,
    recargando,
    irAPagina,
    recargar,
    reintentarEstructura
  } = useListadoMatriculas();

  const [modalAsignarAlumnoAbierto, establecerModalAsignarAlumnoAbierto] = useState(false);
  const [modalComprobanteAbierto, establecerModalComprobanteAbierto] = useState(false);
  const [modalActualizarEstadosAbierto, establecerModalActualizarEstadosAbierto] = useState(false);
  const [emitiendoId, establecerEmitiendoId] = useState(null);

  const confirmarAsignacion = async (asignacion) => {
    const respuesta = await crearMatricula(asignacion);
    if (!respuesta.exitoso) {
      mostrarNotificacion(
        respuesta.mensaje || 'No fue posible asignar al alumno a la sección.',
        true
      );
      return;
    }
    establecerModalAsignarAlumnoAbierto(false);
    recargar();
    mostrarNotificacion(
      `El alumno ${asignacion.alumno.nombre} ha sido asignado correctamente a ${asignacion.grado.nombre}, sección ${asignacion.seccion.nombre}, año ${asignacion.anio?.anio ?? 'seleccionado'}.`
    );
  };

  const emitirDesdeFila = async (matricula) => {    establecerEmitiendoId(matricula.id);
    const respuesta = await emitirCompromisoMatricula({
      matriculaId: matricula.id,
      estudianteId: matricula.estudianteId,
      nombreCompletoEstudiante: matricula.nombreCompletoEstudiante
    });
    establecerEmitiendoId(null);
    if (!respuesta.exitoso) {
      mostrarNotificacion(
        respuesta.mensaje || 'No fue posible emitir el compromiso de matrícula.',
        true
      );
      return;
    }
    recargar();
    mostrarNotificacion(`Se emitió el compromiso de la matrícula #${matricula.id}.`);
  };

  const emitirMasivo = async (anioId) => {
    const respuesta = await emitirCompromisosMatriculaLote(anioId);
    if (respuesta.exitoso) {
      recargar();
    }
    return respuesta;
  };

  const cargandoListado = estadoEstructura === 'cargando'
    || (estadoEstructura === 'listo' && estado === 'cargando');
  const hayFiltros = Boolean(filtros.gradoId || filtros.seccionId || filtros.estado);

  const ejecutarActualizacionEstados = async () => {    const respuesta = await cancelarPendientesPorPeriodo();

    if (!respuesta.exitoso) {
      return respuesta;
    }

    const canceladas = respuesta.datos.matriculasCanceladas;
    establecerModalActualizarEstadosAbierto(false);
    recargar();
    mostrarNotificacion(
      canceladas === 0
        ? 'No había matrículas pendientes por cancelar.'
        : canceladas === 1
          ? 'Se canceló 1 matrícula pendiente.'
          : `Se cancelaron ${canceladas} matrículas pendientes.`
    );
    return respuesta;
  };

  return (
    <div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Módulo de gestión</p>
          <h1 className={estilos.titulo}>Matrículas</h1>
          <p className={estilos.subtitulo}>
            Consulta las matrículas registradas y emite compromisos desde cada matrícula.
          </p>
        </div>
      </header>

      <div className={estilos.botones}>
        <Boton
          icono="agregar"
          span="Asignar alumno a sección"
          estilo={estilosBoton.btn_primario}
          onClick={() => establecerModalAsignarAlumnoAbierto(true)}
        />
        <Boton
          icono="archivo"
          span="Emitir compromisos de matrícula"
          estilo={estilosBoton.btn_secundario}
          onClick={() => establecerModalComprobanteAbierto(true)}
        />
        <button
          type="button"
          className={estilos.botonEstados}
          disabled={estadoEstructura !== 'listo'}
          title="Selecciona el año y actualiza las matrículas pendientes de períodos finalizados."
          onClick={() => establecerModalActualizarEstadosAbierto(true)}
        >
          Actualizar estados de matrícula
        </button>
      </div>

      <section className={estilos.filtrosListado} aria-label="Filtros del listado de matrículas">
        <div className={estilos.filaFiltros}>
          <label className={estilos.campoFiltro}>
            Año académico
            <select
              className={estilos.selectorFiltro}
              value={filtros.anioId}
              disabled={estadoEstructura !== 'listo'}
              onChange={(evento) => cambiarFiltro('anioId', evento.target.value)}
            >
              <option value="">Todos los años</option>
              {(estructura?.anios ?? []).map((anio) => (
                <option key={anio.id} value={anio.id}>{anio.anio}</option>
              ))}
            </select>
          </label>

          <label className={estilos.campoFiltro}>
            Grado
            <select
              className={estilos.selectorFiltro}
              value={filtros.gradoId}
              disabled={estadoEstructura !== 'listo'}
              onChange={(evento) => cambiarFiltro('gradoId', evento.target.value)}
            >
              <option value="">Todos los grados</option>
              {(estructura?.grados ?? []).map((grado) => (
                <option key={grado.id} value={grado.id}>{grado.nombre}</option>
              ))}
            </select>
          </label>

          <label className={estilos.campoFiltro}>
            Sección
            <select
              className={estilos.selectorFiltro}
              value={filtros.seccionId}
              disabled={!filtros.gradoId || !filtros.anioId}
              onChange={(evento) => cambiarFiltro('seccionId', evento.target.value)}
            >
              <option value="">Todas las secciones</option>
              {secciones.map((seccion) => (
                <option key={seccion.id} value={seccion.id}>{seccion.nombre}</option>
              ))}
            </select>
          </label>

          <label className={estilos.campoFiltro}>
            Estado
            <select
              className={estilos.selectorFiltro}
              value={filtros.estado}
              onChange={(evento) => cambiarFiltro('estado', evento.target.value)}
            >
              {OPCIONES_ESTADO.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
              ))}
            </select>
          </label>

          <div className={estilos.accionesFiltros}>
            <button type="button" className={estilos.botonActualizar} onClick={recargar}>
              Actualizar
            </button>
            <button
              type="button"
              className={estilos.botonLimpiar}
              onClick={limpiarFiltros}
              disabled={!hayFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      <section className={estilos.tarjetaListado} aria-busy={cargandoListado || undefined}>
        {estadoEstructura === 'error' && (
          <EstadoConsulta
            tipo="error"
            mensaje={errorEstructura}
            alReintentar={reintentarEstructura}
          />
        )}

        {estadoEstructura === 'cargando' && (
          <EstadoConsulta tipo="carga" filasEsqueleto={5} />
        )}

        {estadoEstructura === 'listo' && estado === 'cargando' && (
          <EstadoConsulta tipo="carga" filasEsqueleto={5} />
        )}

        {estadoEstructura === 'listo' && estado === 'error' && (
          <EstadoConsulta tipo="error" mensaje={error} alReintentar={recargar} />
        )}

        {estadoEstructura === 'listo' && estado === 'listo' && matriculas.length === 0 && (
          <EstadoConsulta
            tipo="vacio"
            mensaje="No hay matrículas con los filtros seleccionados."
            etiquetaAccion={hayFiltros ? 'Limpiar filtros' : undefined}
            alAccion={hayFiltros ? limpiarFiltros : undefined}
          />
        )}

        {estadoEstructura === 'listo' && estado === 'listo' && matriculas.length > 0 && (
          <>
            {recargando && <p className={estilos.actualizando}>Actualizando resultados…</p>}
            <TablaMatriculas
              matriculas={matriculas}
              alEmitir={emitirDesdeFila}
              emitiendoId={emitiendoId}
            />
            <div className={estilos.pieListado}>
              <Paginacion
                pagina={pagina}
                totalPaginas={totalPaginas}
                totalElementos={totalElementos}
                tamanioPagina={tamanioPagina}
                cantidadEnPagina={matriculas.length}
                alCambiarPagina={irAPagina}
                etiqueta="Paginación de matrículas"
                unidadSingular="matrícula"
                unidadPlural="matrículas"
              />
            </div>
          </>
        )}
      </section>

      {modalAsignarAlumnoAbierto && (
        <ModalAsignarAlumno
          onCerrar={() => establecerModalAsignarAlumnoAbierto(false)}
          onAceptar={confirmarAsignacion}
        />
      )}

      {modalComprobanteAbierto && (
        <ModalComprobante
          anios={estructura?.anios ?? []}
          anioInicialId={filtros.anioId}
          onCerrar={() => establecerModalComprobanteAbierto(false)}
          onEjecutar={emitirMasivo}
        />
      )}

      {modalActualizarEstadosAbierto && (
        <ModalActualizarEstadosMatricula
          anios={estructura?.anios ?? []}
          anioInicialId={filtros.anioId}
          onCerrar={() => establecerModalActualizarEstadosAbierto(false)}
          onEjecutar={ejecutarActualizacionEstados}
        />
      )}
    </div>
  );
}
