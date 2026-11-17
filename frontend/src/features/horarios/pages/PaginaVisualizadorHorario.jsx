import { useCallback, useEffect, useMemo, useState } from 'react';

import useAuth from '../../../shared/auth/useAuth.js';
import BotonActualizar from '../../../shared/components/BotonActualizar.jsx';
import ControlSegmentado from '../../../shared/components/ControlSegmentado.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltrosActivos from '../../../shared/components/FiltrosActivos.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import SelectorBuscable from '../../../shared/components/SelectorBuscable.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import AccionesAsistenciaDocente from '../../asistencia/components/AccionesAsistenciaDocente.jsx';
import DialogoAsistenciaSesion from '../../asistencia/components/DialogoAsistenciaSesion.jsx';
import useAsistenciaSesion from '../../asistencia/hooks/useAsistenciaSesion.js';
import CargaDocente from '../components/CargaDocente.jsx';
import InicioDocente from '../components/InicioDocente.jsx';
import MatrizSesiones from '../components/MatrizSesiones.jsx';
import PanelSesionHorario from '../components/PanelSesionHorario.jsx';
import SelectorFecha from '../components/SelectorFecha.jsx';
import useConsultaHorario, { ADMIN, APODERADO, DOCENTE } from '../hooks/useConsultaHorario.js';
import {
  etiquetaEstadoSesion,
  normalizarEstadoSesion,
  tonoEstadoSesion
} from '../utils/estadosSesion.js';
import {
  elegirSesionDestacada,
  indicadoresDeDetalle,
  sesionesDelDia
} from '../utils/sesionesDocente.js';
import { aMinutos, fechaISO, formatearFecha } from '../utils/tiempo.js';
import estilos from './PaginaVisualizadorHorario.module.css';

const OPCIONES_TIPO = [
  { valor: 'seccion', etiqueta: 'Ver por sección' },
  { valor: 'docente', etiqueta: 'Ver por docente' }
];

/** Orden en que se listan los estados en la leyenda; los demás van después, en el orden en que aparecen. */
const ORDEN_ESTADOS = ['PROGRAMADA', 'ACTIVA', 'FINALIZADA', 'OMITIDA'];

/** Minutos como horas de clase: "7 h" o "7 h 30 min". */
function formatearHoras(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

/** Rango de días de una semana para el botón: "02 – 06". */
function etiquetaDias(semana) {
  return semana.inicio === semana.fin
    ? semana.inicio.slice(8)
    : `${semana.inicio.slice(8)} – ${semana.fin.slice(8)}`;
}

/** Estados distintos de las sesiones de la semana, para la leyenda. */
function estadosDeLaSemana(sesiones) {
  const presentes = [...new Set(sesiones.map((sesion) => normalizarEstadoSesion(sesion.estado)).filter(Boolean))];
  const posicion = (estado) => {
    const indice = ORDEN_ESTADOS.indexOf(estado);
    return indice === -1 ? ORDEN_ESTADOS.length : indice;
  };
  return presentes.sort((a, b) => posicion(a) - posicion(b));
}

const MENSAJE_SIN_SESIONES_RANGO = 'Aún no hay sesiones programadas en el rango seleccionado.';
const MENSAJE_SIN_SESIONES_SEMANA = 'No hay sesiones en esta semana.';

function mensajeSinSeleccion(rol, tipo) {
  if (rol === APODERADO) return 'Selecciona un estudiante para consultar su horario.';
  return tipo === 'seccion'
    ? 'Selecciona una sección para consultar su horario.'
    : 'Selecciona un docente para consultar su horario.';
}

/**
 * Página "Consulta de horario" (solo lectura). Compone la pantalla a partir de `useConsultaHorario`; no
 * llama a servicios ni calcula semanas por su cuenta. El administrador elige sección o docente, el
 * apoderado a un estudiante a su cargo; docente y estudiante ven su propio horario.
 *
 * No tiene una acción general: la cabecera solo lleva título y descripción. «Editar horario» (solo
 * administrador) es un acceso secundario al final de la fila de filtros.
 */
export default function PaginaVisualizadorHorario() {
  const { usuario } = useAuth();
  const { notificacion, mostrarNotificacion } = useNotificacion();
  const [sesionSeleccionada, establecerSesionSeleccionada] = useState(null);
  const [dialogoAsistencia, establecerDialogoAsistencia] = useState(false);
  const [errorAsistencia, establecerErrorAsistencia] = useState(null);
  // Desde dónde se abrió el registro de asistencia: el panel de una sesión o la tarjeta «Ahora» del inicio.
  const [origenDialogo, establecerOrigenDialogo] = useState('panel');
  // Docente: el rango de fechas va plegado y las sesiones omitidas ocultas, salvo que lo pida.
  const [rangoAbierto, establecerRangoAbierto] = useState(false);
  const [mostrarOmitidas, establecerMostrarOmitidas] = useState(false);
  // Estado elegido en la leyenda para ver solo esas sesiones en el horario (`null`: todas).
  const [estadoFiltro, establecerEstadoFiltro] = useState(null);
  // Docente: asistencia registrada en esta pantalla, para refrescar los indicadores sin recargar el horario.
  const [indicadoresLocales, establecerIndicadoresLocales] = useState({});
  // Diálogo con la matriz de la semana elegida («Ver horario»).
  const [horarioAbierto, establecerHorarioAbierto] = useState(false);
  const rol = usuario?.rol;
  const esAdmin = rol === ADMIN;
  const esDocente = rol === DOCENTE;
  const esApoderado = rol === APODERADO;

  const {
    tipo,
    anio,
    anios,
    gradoId,
    id,
    grados,
    opciones,
    seccionesFiltradas,
    estudiantes,
    cargandoOpciones,
    errorOpciones,
    fechaInicio,
    fechaFin,
    cargando,
    error,
    tituloConsulta,
    programacionAbierta,
    rutaEdicion,
    semanas,
    meses,
    semanaActual,
    indiceSemana,
    claveMesActual,
    esSemanaDeHoy,
    irSemanaDeHoy,
    seleccionarMes,
    establecerId,
    establecerFechaInicio,
    establecerFechaFin,
    establecerSemanaSeleccionada,
    seleccionarTipo,
    seleccionarSeccion,
    seleccionarAnio,
    irSemanaAnterior,
    irSemanaSiguiente,
    rangoPersonalizado,
    limpiarFiltros,
    cambiandoOmision,
    cambiarOmision,
    recargar
  } = useConsultaHorario(rol, usuario?.nombre);

  const asistenciaSesion = useAsistenciaSesion(esDocente ? sesionSeleccionada : null);

  const conIndicadores = useCallback((sesion) => (
    esDocente && indicadoresLocales[sesion.id] ? { ...sesion, ...indicadoresLocales[sesion.id] } : sesion
  ), [esDocente, indicadoresLocales]);
  const todasLasSesiones = useMemo(
    () => (esDocente ? semanas.flatMap((semana) => semana.sesiones).map(conIndicadores) : []),
    [esDocente, semanas, conIndicadores]
  );
  const hoyISO = fechaISO(new Date());
  const destacada = esDocente ? elegirSesionDestacada(todasLasSesiones) : null;
  // La tarjeta «Ahora» necesita el detalle de asistencia de su sesión; una clase de otro día no lo necesita.
  const asistenciaDestacada = useAsistenciaSesion(
    destacada && destacada.tipo !== 'proxima' ? destacada.sesion : null
  );
  const sesionesHoy = esDocente ? sesionesDelDia(todasLasSesiones, hoyISO) : [];
  const omitidasHoy = esDocente
    ? sesionesDelDia(todasLasSesiones, hoyISO, { incluirOmitidas: true }).length - sesionesHoy.length
    : 0;

  useEffect(() => {
    const detalle = asistenciaSesion.detalle;
    if (esDocente && detalle?.sesionId != null) {
      establecerIndicadoresLocales((actuales) => ({ ...actuales, [detalle.sesionId]: indicadoresDeDetalle(detalle) }));
    }
  }, [esDocente, asistenciaSesion.detalle]);

  useEffect(() => {
    const detalle = asistenciaDestacada.detalle;
    if (esDocente && detalle?.sesionId != null) {
      establecerIndicadoresLocales((actuales) => ({ ...actuales, [detalle.sesionId]: indicadoresDeDetalle(detalle) }));
    }
  }, [esDocente, asistenciaDestacada.detalle]);

  const sesionDelDialogo = origenDialogo === 'tarjeta' ? (destacada?.sesion ?? null) : sesionSeleccionada;
  const asistenciaDelDialogo = origenDialogo === 'tarjeta' ? asistenciaDestacada : asistenciaSesion;

  const necesitaSeleccion = (esAdmin || esApoderado) && !id;
  const consultaPorSeccion = esAdmin && tipo === 'seccion';
  const hayFiltros = rangoPersonalizado || Boolean(id) || Boolean(gradoId);

  useEffect(() => {
    establecerSesionSeleccionada(null);
  }, [tipo, id, fechaInicio, fechaFin, semanaActual?.inicio]);

  useEffect(() => {
    establecerDialogoAsistencia(false);
    establecerErrorAsistencia(null);
  }, [sesionSeleccionada?.id]);

  function abrirDialogoAsistencia(origen = 'panel') {
    establecerOrigenDialogo(origen);
    establecerErrorAsistencia(null);
    establecerDialogoAsistencia(true);
  }

  async function guardarAsistencia(filas) {
    establecerErrorAsistencia(null);
    const respuesta = await asistenciaDelDialogo.guardarEstudiantes(filas);
    if (!respuesta?.exitoso) {
      establecerErrorAsistencia(
        respuesta?.mensaje || 'No se pudo guardar la asistencia.'
      );
      return;
    }
    establecerDialogoAsistencia(false);
    mostrarNotificacion('Asistencia de estudiantes guardada.');
  }

  async function alternarOmisionSesion(sesion, omitida) {
    const respuesta = await cambiarOmision(sesion, omitida);
    if (!respuesta?.exitoso) {
      mostrarNotificacion(
        respuesta?.mensaje || 'No se pudo actualizar la omisión de la sesión.',
        true
      );
      return;
    }
    establecerSesionSeleccionada((actual) => (
      actual && String(actual.id) === String(sesion.id)
        ? { ...actual, ...(respuesta.datos ?? {}) }
        : actual
    ));
    mostrarNotificacion(
      omitida ? 'Sesión marcada como omitida.' : 'Sesión restaurada.'
    );
  }

  const estudianteSeleccionado = estudiantes.find(
    (estudiante) => String(estudiante.id) === String(id)
  );
  const contextoEstudiante = estudianteSeleccionado
    ? [
      estudianteSeleccionado.gradoNombre,
      estudianteSeleccionado.seccionNombre ? `Sección ${estudianteSeleccionado.seccionNombre}` : null,
      estudianteSeleccionado.anioAcademico
    ].filter(Boolean).join(' · ')
    : '';

  const opcionesSeccion = opciones
    .filter((seccion) => tipo === 'seccion')
    .slice()
    .sort((a, b) => (Number(a.gradoId) - Number(b.gradoId)) || String(a.nombre).localeCompare(String(b.nombre), 'es'))
    .map((seccion) => ({
      valor: String(seccion.id),
      etiqueta: `${seccion.gradoNombre ?? `Grado ${seccion.gradoId}`} · ${seccion.nombre}`
    }));

  const opcionesDocente = opciones.map((docente) => ({
    valor: String(docente.id),
    etiqueta: docente.activo === false ? `${docente.nombre} (inactivo)` : docente.nombre
  }));

  const opcionesAnio = anios.map((elemento) => ({
    valor: String(elemento.id),
    etiqueta: String(elemento.anio)
  }));

  const opcionesEstudiante = [
    { valor: '', etiqueta: 'Seleccionar estudiante...' },
    ...estudiantes.map((estudiante) => ({
      valor: String(estudiante.id),
      etiqueta: estudiante.estadoMatricula
        ? estudiante.nombreCompleto
        : `${estudiante.nombreCompleto} (sin matrícula)`
    }))
  ];

  const hayError = Boolean(errorOpciones || error);
  const estaCargando = !hayError && (cargando || (cargandoOpciones && necesitaSeleccion));
  const mostrarSemana = !hayError && !estaCargando && !necesitaSeleccion
    && semanas.length > 0 && Boolean(semanaActual);

  const sesionesSemana = (semanaActual?.sesiones ?? []).map(conIndicadores);
  const omitidasSemana = sesionesSemana.filter((sesion) => normalizarEstadoSesion(sesion.estado) === 'OMITIDA').length;
  const estadosSemana = estadosDeLaSemana(sesionesSemana);
  // Si el estado elegido no existe en la semana que se está viendo, no hay filtro.
  const filtroActivo = estadoFiltro && estadosSemana.includes(estadoFiltro) ? estadoFiltro : null;
  let sesionesMatriz = sesionesSemana;
  if (filtroActivo) {
    sesionesMatriz = sesionesSemana.filter((sesion) => normalizarEstadoSesion(sesion.estado) === filtroActivo);
  } else if (esDocente && !mostrarOmitidas) {
    sesionesMatriz = sesionesSemana.filter((sesion) => normalizarEstadoSesion(sesion.estado) !== 'OMITIDA');
  }
  const etiquetaSemanaActual = semanaActual
    ? (semanaActual.inicio === semanaActual.fin
      ? `Día ${formatearFecha(semanaActual.inicio)}`
      : `Semana del ${formatearFecha(semanaActual.inicio)} al ${formatearFecha(semanaActual.fin)}`)
    : '';

  // Cuando deja de haber semana que mostrar (otro filtro, error, recarga) el diálogo del horario se cierra.
  useEffect(() => {
    if (!mostrarSemana) establecerHorarioAbierto(false);
  }, [mostrarSemana]);

  /** Mes, semanas con flechas e «Ir a hoy»: elegir la semana es parte del resumen, no del horario. */
  const controlesSemana = () => (
      <div className={estilos.selectorSemana}>
        <SelectFiltro
          id="consulta-horario-mes"
          etiqueta="Mes"
          valor={claveMesActual}
          opciones={meses.map((mes) => ({ valor: mes.clave, etiqueta: mes.etiqueta }))}
          alCambiar={seleccionarMes}
          apilado
        />

        <div className={estilos.campoFiltro}>
          <span id="consulta-horario-semanas-etiqueta" className={estilos.etiquetaFiltro}>Semana</span>
          <div className={estilos.semanasConFlechas}>
            <button
              type="button"
              className={estilos.flecha}
              aria-label="Semana anterior"
              disabled={indiceSemana <= 0}
              onClick={irSemanaAnterior}
            >
              <Icono nombre="flecha-izquierda" tamano={16} />
            </button>

            <div
              className={estilos.semanasDelMes}
              role="group"
              aria-label="Ir a semana"
            >
              {(meses.find((mes) => mes.clave === claveMesActual)?.semanas ?? []).map((semana) => {
                const activa = semana.inicio === semanaActual.inicio;
                const conSesiones = semana.sesiones.length > 0;
                return (
                  <button
                    key={semana.inicio}
                    type="button"
                    className={estilos.semanaBoton}
                    aria-pressed={activa}
                    aria-label={
                      `Semana del ${formatearFecha(semana.inicio)} al ${formatearFecha(semana.fin)}`
                      + (conSesiones ? ', con sesiones' : ', sin sesiones')
                    }
                    onClick={() => establecerSemanaSeleccionada(semana.inicio)}
                  >
                    {etiquetaDias(semana)}
                    <span
                      className={conSesiones ? estilos.puntoConSesiones : estilos.puntoSinSesiones}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={estilos.flecha}
              aria-label="Semana siguiente"
              disabled={indiceSemana >= semanas.length - 1}
              onClick={irSemanaSiguiente}
            >
              <Icono nombre="flecha-derecha" tamano={16} />
            </button>

            <button
              type="button"
              className={estilos.botonHoy}
              onClick={irSemanaDeHoy}
              disabled={esSemanaDeHoy}
            >
              Ir a hoy
            </button>
          </div>
        </div>
      </div>
  );

  /** Cifras de la semana elegida: sesiones, cursos, días con clase y horas semanales. */
  const datosSemana = () => {
    // Las omitidas no se dictan: no suman a las cifras (la leyenda de estados ya cuenta cuántas hay).
    const dictadas = sesionesSemana.filter((sesion) => normalizarEstadoSesion(sesion.estado) !== 'OMITIDA');
    const minutos = dictadas.reduce((total, sesion) => {
      const inicio = aMinutos(sesion.horaInicio);
      const fin = aMinutos(sesion.horaFin);
      return inicio !== null && fin !== null && fin > inicio ? total + fin - inicio : total;
    }, 0);
    return [
      { id: 'sesiones', etiqueta: 'Sesiones', valor: dictadas.length },
      {
        id: 'cursos',
        etiqueta: 'Cursos',
        valor: new Set(dictadas.map((sesion) => sesion.cursoId ?? sesion.cursoNombre)).size
      },
      {
        id: 'dias',
        etiqueta: 'Días con clase',
        valor: new Set(dictadas.map((sesion) => sesion.diaSemana)).size
      },
      { id: 'horas', etiqueta: 'Horas de clase', valor: formatearHoras(minutos) }
    ];
  };

  const cifrasSemana = () => (
    <dl className={estilos.datosResumen}>
      {datosSemana().map((dato) => (
        <div key={dato.id} className={estilos.dato}>
          <dt>{dato.etiqueta}</dt>
          <dd>{dato.valor}</dd>
        </div>
      ))}
    </dl>
  );

  /**
   * Resumen de la consulta: quién y qué semana, el selector de mes y semana, las cifras y el estado de las sesiones.
   * El horario en sí se ve con «Ver horario», en una pantalla propia con espacio para apreciarlo.
   */
  const resumenSemana = () => (
    <section className={estilos.resumen} aria-label="Resumen del horario" aria-busy={cargando || undefined}>
      <header className={estilos.cabeceraResumen}>
        <div className={estilos.textoResumen}>
          <h2 className={estilos.tituloSemana} aria-live="polite">{tituloConsulta || 'Horario'}</h2>
          <p className={estilos.subtituloSemana}>{etiquetaSemanaActual}</p>
        </div>
        <button
          type="button"
          className={estilos.botonPrimario}
          disabled={sesionesSemana.length === 0}
          title={sesionesSemana.length === 0 ? MENSAJE_SIN_SESIONES_SEMANA : undefined}
          onClick={() => establecerHorarioAbierto(true)}
        >
          <Icono nombre="calendario" tamano={18} />
          Ver horario
        </button>
      </header>

      {controlesSemana()}
      {!esDocente && (
        <p className={estilos.notaRango}>Mes y semana se mueven dentro del rango de fechas elegido arriba.</p>
      )}

      {sesionesSemana.length === 0 ? (
        <EstadoConsulta tipo="vacio" icono="calendario" mensaje={MENSAJE_SIN_SESIONES_SEMANA} />
      ) : (
        <>
          {!esDocente && cifrasSemana()}

          <div className={estilos.leyenda}>
            <span className={estilos.etiquetaLeyenda}>Estado de la sesión</span>
            <ul className={estilos.listaLeyenda} aria-label="Estados de las sesiones de la semana">
              {estadosSemana.map((estado) => (
                <li key={estado} className={estilos.itemEstado}>
                  {/* Cada chip filtra el horario por ese estado; el contador son las sesiones de esa semana. */}
                  <button
                    type="button"
                    className={estilos.chipEstado}
                    aria-pressed={filtroActivo === estado}
                    title={filtroActivo === estado ? 'Quitar el filtro' : `Ver solo sesiones con estado ${etiquetaEstadoSesion(estado)} en el horario`}
                    onClick={() => establecerEstadoFiltro(filtroActivo === estado ? null : estado)}
                  >
                    {/* El contador va dentro del chip: «Omitida 4» son 4 sesiones omitidas esta semana. */}
                    <Insignia tono={tonoEstadoSesion(estado)}>
                      {etiquetaEstadoSesion(estado)}
                      <span className={estilos.cantidadEstado}>
                        {sesionesSemana.filter((sesion) => normalizarEstadoSesion(sesion.estado) === estado).length}
                      </span>
                    </Insignia>
                  </button>
                </li>
              ))}
            </ul>
            <span className={estilos.notaFiltro} role="status">
              {filtroActivo
                ? `El horario muestra solo sesiones con estado ${etiquetaEstadoSesion(filtroActivo)}.`
                : 'Elige un estado para ver solo esas sesiones en el horario.'}
            </span>
          </div>

          {esDocente && cifrasSemana()}
          {esAdmin && tipo === 'docente' && <CargaDocente sesiones={sesionesSemana} />}
        </>
      )}
    </section>
  );

  /** Esc, X y «Cerrar» cierran primero el detalle de la sesión y, después, el horario. */
  const cerrarHorario = () => {
    if (sesionSeleccionada) establecerSesionSeleccionada(null);
    else establecerHorarioAbierto(false);
  };

  /** Detalle de una sesión (drawer). Dentro del diálogo del horario se monta en él, para que siga siendo operable. */
  const panelesSesion = (enDialogo) => (
    <>
      {esAdmin && sesionSeleccionada && (
        <PanelSesionHorario
          enDialogo={enDialogo}
          sesion={sesionSeleccionada}
          cambiando={cambiandoOmision.includes(String(sesionSeleccionada.id))}
          alCerrar={() => establecerSesionSeleccionada(null)}
          alCambiarOmision={alternarOmisionSesion}
        />
      )}

      {esDocente && sesionSeleccionada && (
        <PanelSesionHorario
          enDialogo={enDialogo}
          sesion={sesionSeleccionada}
          alCerrar={() => establecerSesionSeleccionada(null)}
          acciones={(
            <AccionesAsistenciaDocente
              sesion={sesionSeleccionada}
              asistencia={asistenciaSesion}
              alAbrirModal={() => abrirDialogoAsistencia('panel')}
              alNotificar={mostrarNotificacion}
            />
          )}
        />
      )}
    </>
  );

  let contenido;
  if (hayError) {
    contenido = (
      <EstadoConsulta
        tipo="error"
        mensaje={errorOpciones || error}
        alReintentar={errorOpciones ? undefined : recargar}
      />
    );
  } else if (estaCargando) {
    contenido = <EstadoConsulta tipo="carga" filasEsqueleto={5} />;
  } else if (necesitaSeleccion) {
    contenido = <EstadoConsulta tipo="vacio" icono="calendario" mensaje={mensajeSinSeleccion(rol, tipo)} />;
  } else if (semanas.length === 0) {
    contenido = <EstadoConsulta tipo="vacio" icono="calendario" mensaje={MENSAJE_SIN_SESIONES_RANGO} />;
  }

  const camposFecha = (
    <>
      <div className={`${estilos.campoFiltro} ${estilos.campoFecha}`}>
        <span className={estilos.etiquetaFiltro}>Desde</span>
        <SelectorFecha
          id="consulta-horario-desde"
          etiqueta="Desde"
          valor={fechaInicio}
          max={fechaFin}
          alCambiar={establecerFechaInicio}
        />
      </div>

      <div className={`${estilos.campoFiltro} ${estilos.campoFecha}`}>
        <span className={estilos.etiquetaFiltro}>Hasta</span>
        <SelectorFecha
          id="consulta-horario-hasta"
          etiqueta="Hasta"
          valor={fechaFin}
          min={fechaInicio}
          alCambiar={establecerFechaFin}
        />
      </div>
    </>
  );

  const seccionFiltros = (
      <section className={estilos.filtros} aria-label="Filtros de consulta de horario">
        {/* Administrador: fila superior con el modo de consulta y, a su lado, «Actualizar» y «Limpiar filtros». */}
        {esAdmin && (
          <div className={estilos.filaModo}>
            <ControlSegmentado
              id="consulta-horario-tipo"
              etiqueta="Consultar por"
              valor={tipo}
              opciones={OPCIONES_TIPO}
              alCambiar={seleccionarTipo}
            />
            <BotonActualizar alActualizar={recargar} actualizando={cargando} />
            <FiltrosActivos filtros={[]} hayFiltros={hayFiltros} alLimpiar={limpiarFiltros} />
            {consultaPorSeccion && programacionAbierta && (
              <a className={estilos.enlaceEdicion} href={rutaEdicion}>Editar horario</a>
            )}
          </div>
        )}

        {/* Debajo, los selectores y el rango de fechas. */}
        <div className={estilos.filaFiltros}>
          {/* Grado y sección en un solo campo con búsqueda: «1er Grado · A». */}
          {esAdmin && tipo === 'seccion' && (
            <SelectorBuscable
              id="consulta-horario-opcion"
              etiqueta="Sección"
              valor={id}
              opciones={opcionesSeccion}
              alCambiar={seleccionarSeccion}
              placeholder="Buscar grado o sección…"
              mensajeSinResultados="No se encontró ninguna sección."
            />
          )}

          {/* Los docentes pueden ser muchos: se busca por nombre en lugar de recorrer una lista. */}
          {esAdmin && tipo === 'docente' && (
            <SelectorBuscable
              id="consulta-horario-opcion"
              etiqueta="Docente"
              valor={id}
              opciones={opcionesDocente}
              alCambiar={establecerId}
              placeholder="Buscar docente…"
              mensajeSinResultados="No se encontró ningún docente."
            />
          )}

          {esApoderado && (
            <div className={estilos.campoAnio}>
              <SelectFiltro
                id="consulta-horario-anio"
                etiqueta="Año académico"
                valor={anio?.id == null ? '' : String(anio.id)}
                opciones={opcionesAnio}
                alCambiar={seleccionarAnio}
                apilado
              />
            </div>
          )}

          {esApoderado && (
            <div className={estilos.campoEstudiante}>
              <SelectFiltro
                id="consulta-horario-estudiante"
                etiqueta="Estudiante a cargo"
                valor={id}
                opciones={opcionesEstudiante}
                alCambiar={establecerId}
                apilado
              />
            </div>
          )}

          {!esDocente && camposFecha}

          {/* Docente: el rango de fechas es un filtro avanzado, plegado; lo habitual es moverse por semanas. */}
          {esDocente && (
            <button
              type="button"
              className={estilos.botonSecundario}
              aria-expanded={rangoAbierto}
              aria-controls="consulta-horario-rango"
              onClick={() => establecerRangoAbierto((abierto) => !abierto)}
            >
              <Icono nombre="calendario" tamano={16} />
              Rango de fechas: {formatearFecha(fechaInicio)} – {formatearFecha(fechaFin)}
            </button>
          )}

          {/* Sin selector de modo, «Actualizar» va al final de la fila de filtros, alineado con los campos. */}
          {!esAdmin && (
            <div className={estilos.botonFila}>
              <BotonActualizar alActualizar={recargar} actualizando={cargando} />
            </div>
          )}

          {/* Docente con el rango plegado: «Limpiar filtros» queda en esta misma fila. */}
          {esDocente && !rangoAbierto && (
            <div className={estilos.botonFila}>
              <FiltrosActivos filtros={[]} hayFiltros={hayFiltros} alLimpiar={limpiarFiltros} />
            </div>
          )}
        </div>

        {/* Docente con el rango desplegado: «Limpiar filtros» va en la misma fila que las fechas. */}
        {esDocente && rangoAbierto && (
          <div id="consulta-horario-rango" className={estilos.filaFiltros}>
            {camposFecha}
            <div className={estilos.botonFila}>
              <FiltrosActivos filtros={[]} hayFiltros={hayFiltros} alLimpiar={limpiarFiltros} />
            </div>
          </div>
        )}

        {!esAdmin && !esDocente && (
          <FiltrosActivos filtros={[]} hayFiltros={hayFiltros} alLimpiar={limpiarFiltros} />
        )}

        {esApoderado && estudianteSeleccionado && (
          <p className={estilos.contextoEstudiante}>
            <Icono nombre="usuario" tamano={16} />
            <span>
              {contextoEstudiante || 'Sin matrícula confirmada para el año seleccionado.'}
            </span>
          </p>
        )}
      </section>
  );

  return (
    <div className={estilos.pagina}>
      {/* Sin acción general: solo título y descripción. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>{esDocente ? 'Mi horario' : 'Consulta de horario'}</h1>
          <p className={estilos.descripcion}>
            {esAdmin && 'Consulta las sesiones programadas. Abre una sesión para omitirla o restaurarla.'}
            {esDocente && 'Tus clases de hoy y de la semana. Abre una sesión para registrar asistencia.'}
            {!esAdmin && !esDocente && 'Consulta de solo lectura. Elige un rango de fechas para ver las sesiones.'}
          </p>
        </div>
      </header>

      {!esDocente && seccionFiltros}

      {mostrarSemana ? (
        <>
          {esDocente && (
            <InicioDocente
              destacada={destacada}
              sesionesHoy={sesionesHoy}
              omitidasHoy={omitidasHoy}
              hoy={hoyISO}
              asistencia={asistenciaDestacada}
              alAbrirSesion={establecerSesionSeleccionada}
              alAbrirModal={() => abrirDialogoAsistencia('tarjeta')}
              alNotificar={mostrarNotificacion}
            />
          )}
          {esDocente && seccionFiltros}
          {resumenSemana()}
        </>
      ) : (
        <>
          {esDocente && seccionFiltros}
          <section className={estilos.tarjetaResultados} aria-label="Horario" aria-busy={cargando || undefined}>
            {contenido}
          </section>
        </>
      )}

      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      {/* Con el horario abierto, el detalle de la sesión se monta dentro de su diálogo (ver abajo). */}
      {!horarioAbierto && panelesSesion(false)}

      {horarioAbierto && mostrarSemana && (
        <DialogoBase
          idTitulo="consulta-horario-dialogo"
          titulo={`Horario · ${tituloConsulta || 'Consulta'}`}
          subtitulo={etiquetaSemanaActual}
          anchoMaximo="80rem"
          cerrarAlClicFuera={false}
          sinConfirmar
          sinCancelar
          accionesPie={(
            <>
              {filtroActivo && (
                <button
                  type="button"
                  className={estilos.botonSecundario}
                  onClick={() => establecerEstadoFiltro(null)}
                >
                  Quitar filtro: {etiquetaEstadoSesion(filtroActivo)}
                </button>
              )}
              {esDocente && !filtroActivo && omitidasSemana > 0 && (
                <label className={estilos.alternarOmitidas}>
                  <input
                    type="checkbox"
                    checked={mostrarOmitidas}
                    onChange={(evento) => establecerMostrarOmitidas(evento.target.checked)}
                  />
                  Mostrar omitidas ({omitidasSemana})
                </label>
              )}
              <button
                type="button"
                className={estilos.botonSecundario}
                onClick={irSemanaDeHoy}
                disabled={esSemanaDeHoy}
              >
                Ir a hoy
              </button>
              <button type="button" className={estilos.botonSecundario} onClick={cerrarHorario}>
                Cerrar
              </button>
            </>
          )}
          alSolicitarCierre={cerrarHorario}
          alCancelar={() => establecerHorarioAbierto(false)}
          alConfirmar={(evento) => evento.preventDefault()}
        >
          {/* Las flechas de semana van a cada costado del horario y la matriz es lo único que se desplaza. */}
          <div className={estilos.horarioConFlechas}>
            <button
              type="button"
              className={`${estilos.flecha} ${estilos.flechaAnterior}`}
              aria-label="Semana anterior"
              disabled={indiceSemana <= 0}
              onClick={irSemanaAnterior}
            >
              <Icono nombre="flecha-izquierda" tamano={16} />
            </button>

            <div className={estilos.matrizDialogo}>
              {sesionesSemana.length === 0 ? (
                <EstadoConsulta tipo="vacio" icono="calendario" mensaje={MENSAJE_SIN_SESIONES_SEMANA} />
              ) : sesionesMatriz.length === 0 ? (
                <EstadoConsulta
                  tipo="vacio"
                  icono="calendario"
                  mensaje="Todas las sesiones de esta semana están omitidas."
                />
              ) : (
                <MatrizSesiones
                  key={semanaActual.inicio}
                  ajustarAlto
                  ocultarDocente={esDocente}
                  mostrarAsistencia={esDocente}
                  lunes={semanaActual.lunes}
                  titulo={`${tituloConsulta} ${formatearFecha(semanaActual.inicio)}`}
                  sesiones={sesionesMatriz}
                  mostrarSeccion={!esAdmin || tipo === 'docente'}
                  alSeleccionarSesion={(esAdmin || esDocente) ? establecerSesionSeleccionada : undefined}
                />
              )}
            </div>

            <button
              type="button"
              className={`${estilos.flecha} ${estilos.flechaSiguiente}`}
              aria-label="Semana siguiente"
              disabled={indiceSemana >= semanas.length - 1}
              onClick={irSemanaSiguiente}
            >
              <Icono nombre="flecha-derecha" tamano={16} />
            </button>
          </div>

          {panelesSesion(true)}
        </DialogoBase>
      )}

      {dialogoAsistencia && asistenciaDelDialogo.detalle && (
        <DialogoAsistenciaSesion
          sesion={sesionDelDialogo}
          detalle={asistenciaDelDialogo.detalle}
          soloLectura={!asistenciaDelDialogo.detalle.puedeRegistrarEstudiantes}
          guardando={asistenciaDelDialogo.guardando}
          error={errorAsistencia || asistenciaDelDialogo.errorGuardado || null}
          alCerrar={() => establecerDialogoAsistencia(false)}
          alGuardar={guardarAsistencia}
        />
      )}
    </div>
  );
}
