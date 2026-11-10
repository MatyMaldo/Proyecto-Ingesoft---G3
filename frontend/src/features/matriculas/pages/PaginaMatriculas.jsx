import { useRef, useState } from 'react';

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
import TablaMatriculas from '../components/TablaMatriculas.jsx';
import useListadoMatriculas from '../hooks/useListadoMatriculas.js';
import {
  cancelarPendientesPorPeriodo,
  crearMatricula,
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
  const refInicioListado = useRef(null);

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

  // Al cambiar de página (sobre todo desde el paginador inferior), devuelve la vista al inicio del listado.
  const cambiarPagina = (nuevaPagina) => {
    irAPagina(nuevaPagina);
    const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    refInicioListado.current?.scrollIntoView?.({ block: 'start', behavior: reducirMovimiento ? 'auto' : 'smooth' });
  };

  // El mismo paginador (con el total y el campo de página) va arriba y abajo del listado, como en Usuarios.
  const paginador = (posicion) => (
    <Paginacion
      pagina={pagina}
      totalPaginas={totalPaginas}
      totalElementos={totalElementos}
      tamanioPagina={tamanioPagina}
      cantidadEnPagina={matriculas.length}
      alCambiarPagina={cambiarPagina}
      etiqueta={`Paginación de matrículas (${posicion})`}
      unidadSingular="matrícula"
      unidadPlural="matrículas"
      anunciarTotal={posicion === 'superior'}
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

      {/* Barra de título (GUI §6): título a la izquierda; a la derecha, las acciones masivas (secundaria) y la
          acción principal. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Matrículas</h1>
          <p className={estilos.descripcion}>
            Consulta las matrículas registradas y emite compromisos desde cada matrícula.
          </p>
        </div>
        <div className={estilos.acciones}>
          <MenuDesplegable
            etiquetaBoton="Acciones masivas"
            claseBoton={`${estilos.boton} ${estilos.botonSecundario}`}
            alineacion="fin"
            deshabilitado={!estructuraLista}
            contenidoBoton={<>
              Acciones masivas
              <Icono nombre="chevron-abajo" tamano={16} />
            </>}
            items={[
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
            Asignar alumno a sección
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

        <div className={estilos.grupoFiltro}>
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

      {/* Total y paginación arriba del listado: el total queda a la vista sin bajar hasta el final. */}
      {hayResultados && <div ref={refInicioListado} className={estilos.barraPaginacion}>{paginador('superior')}</div>}

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
              matriculas={matriculas}
              alEmitir={emitirDesdeFila}
              emitiendoId={emitiendoId}
            />
            {/* Con una sola página el total ya está arriba: no se repite abajo. */}
            {totalPaginas > 1 && <div className={estilos.pie}>{paginador('inferior')}</div>}
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
