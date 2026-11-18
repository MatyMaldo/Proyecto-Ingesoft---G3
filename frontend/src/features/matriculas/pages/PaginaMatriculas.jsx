import { useState } from 'react';

import BarraBusquedaListado from '../../../shared/components/BarraBusquedaListado.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import MenuDesplegable from '../../../shared/components/MenuDesplegable.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import useOperacionMasiva from '../../../shared/hooks/useOperacionMasiva.js';
import ModalActualizarEstadosMatricula from '../components/ModalActualizarEstadosMatricula.jsx';
import ModalAsignarAlumno from '../components/ModalAsignarAlumno.jsx';
import ModalComprobante from '../components/ModalComprobante.jsx';
import ModalEditarMatricula from '../components/ModalEditarMatricula.jsx';
import DialogoEliminarMatricula from '../components/DialogoEliminarMatricula.jsx';
import DialogoCargaMasivaMatriculas from '../components/DialogoCargaMasivaMatriculas.jsx';
import TablaMatriculas from '../components/TablaMatriculas.jsx';
import useListadoMatriculas, { OPCIONES_TAMANIO_PAGINA } from '../hooks/useListadoMatriculas.js';
import {
  actualizarMatricula,
  cancelarPendientesPorPeriodo,
  crearMatricula,
  eliminarMatricula,
  emitirCompromisoMatricula
} from '../services/matriculasService.js';
import estilos from './PaginaMatriculas.module.css';

/**
 * Chips del filtro de estado; el tono es el mismo de la insignia de estado de la tabla. `campoConteo` es el campo
 * del conteo por estado que trae el backend (`/matriculas/conteo-por-estado`) para ese chip.
 */
const OPCIONES_ESTADO = [
  { valor: '', etiqueta: 'Todos', tono: 'gris', campoConteo: 'total' },
  { valor: 'PENDIENTE', etiqueta: 'Pendiente', tono: 'ambar', campoConteo: 'pendientes' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada', tono: 'verde', campoConteo: 'confirmadas' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada', tono: 'rojo', campoConteo: 'canceladas' }
];

export default function PaginaMatriculas() {
  const { notificacion, mostrarNotificacion } = useNotificacion();
  const {
    estructura,
    estadoEstructura,
    errorEstructura,
    secciones,
    filtros,
    busqueda,
    conteoEstados,
    cambiarBusqueda,
    cambiarFiltro,
    limpiarFiltros,
    pagina,
    totalElementos,
    totalPaginas,
    tamanioPagina,
    cambiarTamanioPagina,
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
  const [modalCargaMasivaAbierto, establecerModalCargaMasivaAbierto] = useState(false);
  const [matriculaAEditar, establecerMatriculaAEditar] = useState(null);
  const [matriculaAEliminar, establecerMatriculaAEliminar] = useState(null);
  const [emitiendoId, establecerEmitiendoId] = useState(null);
  const [eliminandoId, establecerEliminandoId] = useState(null);

  const operacionMatriculas = useOperacionMasiva({
    alTerminar: (job) => {
      recargar();
      const conError = job.errores > 0
        || job.estado === 'COMPLETADO_CON_ERRORES'
        || job.estado === 'FALLIDO';
      mostrarNotificacion(
        `Emisión masiva: ${job.exitosos} emitidos, ${job.omitidos} omitidos, ${job.errores} errores.`,
        conError
      );
    }
  });

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

  const confirmarEdicionMatricula = async ({ seccionId, seccion }) => {
    const respuesta = await actualizarMatricula(matriculaAEditar.id, { seccionId });
    if (!respuesta.exitoso) {
      return respuesta;
    }
    establecerMatriculaAEditar(null);
    recargar();
    mostrarNotificacion(
      `Matrícula actualizada a ${seccion?.nombre ? `la sección ${seccion.nombre}` : 'la nueva sección'}.`
    );
    return respuesta;
  };

  const confirmarEliminacionMatricula = async () => {
    if (!matriculaAEliminar) return null;
    establecerEliminandoId(matriculaAEliminar.id);
    const respuesta = await eliminarMatricula(matriculaAEliminar.id);
    establecerEliminandoId(null);
    if (!respuesta.exitoso) {
      return respuesta;
    }
    establecerMatriculaAEliminar(null);
    recargar();
    mostrarNotificacion('Matrícula eliminada correctamente.');
    return respuesta;
  };

  const completarCargaMasivaMatriculas = (resumen = {}) => {
    establecerModalCargaMasivaAbierto(false);
    recargar();
    mostrarNotificacion(
      `Carga masiva completada: ${resumen.creados ?? 0} matrículas creadas.`
    );
  };

  const emitirDesdeFila = async (matricula) => {
    establecerEmitiendoId(matricula.id);
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
    mostrarNotificacion(
      `Se emitió el compromiso de matrícula de ${matricula.nombreCompletoEstudiante ?? 'el estudiante'}.`
    );
  };

  const ejecutarActualizacionEstados = async () => {
    const respuesta = await cancelarPendientesPorPeriodo();

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

  const estructuraLista = estadoEstructura === 'listo';
  const cargandoListado = estadoEstructura === 'cargando' || (estructuraLista && estado === 'cargando');
  const hayFiltros = Boolean(filtros.gradoId || filtros.seccionId || filtros.estado || busqueda.trim());
  const hayResultados = estructuraLista && estado === 'listo' && matriculas.length > 0;

  // Al cambiar de página la tabla se vuelve a montar (`key` por página), así su desplazamiento vuelve al inicio.
  const cambiarPagina = irAPagina;

  // Un solo paginador, en el pie de la tabla (siempre visible, porque la tabla es lo único que se desplaza).
  const paginador = () => (
    <Paginacion
      pagina={pagina}
      totalPaginas={totalPaginas}
      totalElementos={totalElementos}
      tamanioPagina={tamanioPagina}
      cantidadEnPagina={matriculas.length}
      alCambiarPagina={cambiarPagina}
      etiqueta="Paginación de matrículas"
      unidadSingular="matrícula"
      unidadPlural="matrículas"
      anunciarTotal
    />
  );

  // Contadores de los chips con año, grado, sección y búsqueda vigentes. Con "Todos" cada chip muestra su cantidad;
  // al elegir un estado, solo ese la muestra (mismo patrón que Pagos). Sin conteo del servidor, no se muestra ninguno.
  const opcionesEstado = OPCIONES_ESTADO.map(({ campoConteo, ...opcion }) => ({
    ...opcion,
    conteo: conteoEstados && (!filtros.estado || opcion.valor === filtros.estado)
      ? conteoEstados[campoConteo]
      : undefined
  }));

  const opcionesAnio = [
    { valor: '', etiqueta: 'Todos los años' },
    ...(estructura?.anios ?? []).map((anio) => ({ valor: String(anio.id), etiqueta: String(anio.anio) }))
  ];
  const opcionesGrado = [
    { valor: '', etiqueta: 'Todos los grados' },
    ...(estructura?.grados ?? []).map((grado) => ({ valor: String(grado.id), etiqueta: grado.nombre }))
  ];
  const opcionesSeccion = [
    { valor: '', etiqueta: 'Todas las secciones' },
    ...secciones.map((seccion) => ({ valor: String(seccion.id), etiqueta: seccion.nombre }))
  ];

  return (
    <div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      {/* Barra de título (GUI §6): título y descripción a la izquierda; a la derecha, las acciones, las dos con el
          mismo botón primario para que se vean como un conjunto. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Matrículas</h1>
          <p className={estilos.descripcion}>Consulta las matrículas y emite sus compromisos.</p>
        </div>
        <div className={estilos.acciones}>
          <MenuDesplegable
            etiquetaBoton="Acciones masivas"
            claseBoton={`${estilos.boton} ${estilos.botonPrimario}`}
            alineacion="fin"
            deshabilitado={!estructuraLista}
            contenidoBoton={<>
              Acciones masivas
              <Icono nombre="chevron-abajo" tamano={16} />
            </>}
            items={[
              {
                id: 'carga',
                etiqueta: 'Carga masiva de matrículas',
                icono: 'subir',
                alSeleccionar: () => establecerModalCargaMasivaAbierto(true)
              },
              {
                id: 'emitir',
                etiqueta: 'Emitir compromisos de matrícula',
                icono: 'archivo',
                alSeleccionar: () => establecerModalComprobanteAbierto(true)
              },
              {
                id: 'estados',
                etiqueta: 'Actualizar estados de matrícula',
                icono: 'alerta',
                tono: 'peligro',
                separadorAntes: true,
                alSeleccionar: () => establecerModalActualizarEstadosAbierto(true)
              }
            ]}
          />
          <button
            type="button"
            className={`${estilos.boton} ${estilos.botonPrimario}`}
            onClick={() => establecerModalAsignarAlumnoAbierto(true)}
          >
            <Icono nombre="agregar" tamano={16} />
            Asignar alumno
          </button>
        </div>
      </header>

      {/* El buscador va solo en la primera línea, con "Actualizar" a su costado; debajo, año, grado y sección como
          selectores y el estado como chips con su subtítulo (mismo patrón que Usuarios y Pagos). */}
      <section className={estilos.filtros} aria-label="Búsqueda y filtros del listado de matrículas">
        <BarraBusquedaListado
          alActualizar={recargar}
          actualizando={recargando}
          hayFiltros={hayFiltros}
          alLimpiar={limpiarFiltros}
        >
          <CampoBusqueda
            id="busqueda-matriculas"
            etiqueta="Buscar matrículas por nombre o código del estudiante"
            placeholder="Buscar por nombre o código"
            valor={busqueda}
            alCambiar={cambiarBusqueda}
            maxLength={100}
          />
        </BarraBusquedaListado>

        <div className={estilos.filaFiltros}>
          <SelectFiltro
            apilado
            id="filtro-anio-matriculas"
            etiqueta="Año académico"
            valor={filtros.anioId}
            opciones={opcionesAnio}
            alCambiar={(valor) => cambiarFiltro('anioId', valor)}
            deshabilitado={!estructuraLista}
          />
          <SelectFiltro
            apilado
            id="filtro-grado-matriculas"
            etiqueta="Grado"
            valor={filtros.gradoId}
            opciones={opcionesGrado}
            alCambiar={(valor) => cambiarFiltro('gradoId', valor)}
            deshabilitado={!estructuraLista}
          />
          <SelectFiltro
            apilado
            id="filtro-seccion-matriculas"
            etiqueta="Sección"
            valor={filtros.seccionId}
            opciones={opcionesSeccion}
            alCambiar={(valor) => cambiarFiltro('seccionId', valor)}
            deshabilitado={!filtros.gradoId || !filtros.anioId}
          />
        </div>

        <div className={`${estilos.grupoFiltro} ${estilos.grupoEstado}`}>
          {/* El subtítulo es visual: el grupo ya tiene su nombre accesible en `etiquetaGrupo`. */}
          <span className={estilos.rotuloFiltro} aria-hidden="true">Estado</span>
          <FiltroChips
            etiquetaGrupo="Filtrar matrículas por estado"
            opciones={opcionesEstado}
            valorSeleccionado={filtros.estado}
            alSeleccionar={(valor) => cambiarFiltro('estado', valor)}
          />
        </div>
      </section>

      <section className={estilos.tarjetaResultados} aria-busy={cargandoListado || undefined}>
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

        {estructuraLista && estado === 'cargando' && (
          <EstadoConsulta tipo="carga" filasEsqueleto={5} />
        )}

        {estructuraLista && estado === 'error' && (
          <EstadoConsulta tipo="error" mensaje={error} alReintentar={recargar} />
        )}

        {estructuraLista && estado === 'listo' && matriculas.length === 0 && (
          <EstadoConsulta
            tipo="vacio"
            mensaje="No se encontraron matrículas con los criterios indicados"
          />
        )}

        {hayResultados && (
          <>
            {recargando && <p className={estilos.actualizando}>Actualizando resultados…</p>}
            <TablaMatriculas
              key={pagina}
              matriculas={matriculas}
              alEmitir={emitirDesdeFila}
              alEditar={establecerMatriculaAEditar}
              alEliminar={establecerMatriculaAEliminar}
              emitiendoId={emitiendoId}
              eliminandoId={eliminandoId}
            />
            {/* El pie lleva siempre el selector de filas y el paginador. */}
            <div className={estilos.pie}>
              <div className={estilos.selectorFilas} role="group" aria-label="Filas por página">
                <span>Filas por página</span>
                {OPCIONES_TAMANIO_PAGINA.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    className={`${estilos.opcionFilas} ${opcion === tamanioPagina ? estilos.opcionFilasActiva : ''}`}
                    aria-pressed={opcion === tamanioPagina}
                    disabled={totalElementos < opcion}
                    onClick={() => cambiarTamanioPagina(opcion)}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
              {paginador()}
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

      {modalCargaMasivaAbierto && (
        <DialogoCargaMasivaMatriculas
          anios={estructura?.anios ?? []}
          grados={estructura?.grados ?? []}
          anioIdInicial={filtros.anioId}
          alCerrar={() => establecerModalCargaMasivaAbierto(false)}
          alCompletar={completarCargaMasivaMatriculas}
        />
      )}

      {matriculaAEditar && (
        <ModalEditarMatricula
          key={matriculaAEditar.id}
          matricula={matriculaAEditar}
          alCerrar={() => establecerMatriculaAEditar(null)}
          alGuardar={confirmarEdicionMatricula}
        />
      )}

      {matriculaAEliminar && (
        <DialogoEliminarMatricula
          matricula={matriculaAEliminar}
          alCerrar={() => establecerMatriculaAEliminar(null)}
          alConfirmar={confirmarEliminacionMatricula}
        />
      )}

      {modalComprobanteAbierto && (
        <ModalComprobante
          anios={estructura?.anios ?? []}
          anioInicialId={filtros.anioId}
          onCerrar={() => establecerModalComprobanteAbierto(false)}
          operacion={operacionMatriculas}
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
