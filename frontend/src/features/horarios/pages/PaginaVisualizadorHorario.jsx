import { useEffect, useState } from 'react';

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
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import AccionesAsistenciaDocente from '../../asistencia/components/AccionesAsistenciaDocente.jsx';
import DialogoAsistenciaSesion from '../../asistencia/components/DialogoAsistenciaSesion.jsx';
import useAsistenciaSesion from '../../asistencia/hooks/useAsistenciaSesion.js';
import MatrizSesiones from '../components/MatrizSesiones.jsx';
import PanelSesionHorario from '../components/PanelSesionHorario.jsx';
import SelectorFecha from '../components/SelectorFecha.jsx';
import useConsultaHorario, { ADMIN, APODERADO, DOCENTE } from '../hooks/useConsultaHorario.js';
import {
  etiquetaEstadoSesion,
  normalizarEstadoSesion,
  tonoEstadoSesion
} from '../utils/estadosSesion.js';
import { aMinutos, formatearFecha } from '../utils/tiempo.js';
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
    ? 'Selecciona un grado y una sección para consultar su horario.'
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
    seleccionarGrado,
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

  function abrirDialogoAsistencia() {
    establecerErrorAsistencia(null);
    establecerDialogoAsistencia(true);
  }

  async function guardarAsistencia(filas) {
    establecerErrorAsistencia(null);
    const respuesta = await asistenciaSesion.guardarEstudiantes(filas);
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

  const opcionesGrado = [
    { valor: '', etiqueta: 'Seleccionar grado...' },
    ...grados.map((grado) => ({ valor: String(grado.id), etiqueta: grado.nombre }))
  ];

  const opcionesSeccion = [
    { valor: '', etiqueta: tipo === 'seccion' ? 'Seleccionar sección...' : 'Seleccionar docente...' },
    ...(tipo === 'seccion' ? seccionesFiltradas : opciones).map((opcion) => ({
      valor: String(opcion.id),
      etiqueta: tipo === 'seccion'
        ? `${opcion.nombre} (${opcion.anioAcademico ?? anio?.anio ?? ''})`
        : opcion.nombre
    }))
  ];

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

  const sesionesSemana = semanaActual?.sesiones ?? [];
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
    const minutos = sesionesSemana.reduce((total, sesion) => {
      const inicio = aMinutos(sesion.horaInicio);
      const fin = aMinutos(sesion.horaFin);
      return inicio !== null && fin !== null && fin > inicio ? total + fin - inicio : total;
    }, 0);
    return [
      { id: 'sesiones', etiqueta: 'Sesiones', valor: sesionesSemana.length },
      {
        id: 'cursos',
        etiqueta: 'Cursos',
        valor: new Set(sesionesSemana.map((sesion) => sesion.cursoId ?? sesion.cursoNombre)).size
      },
      {
        id: 'dias',
        etiqueta: 'Días con clase',
        valor: new Set(sesionesSemana.map((sesion) => sesion.diaSemana)).size
      },
      { id: 'horas', etiqueta: 'Horas de clase', valor: formatearHoras(minutos) }
    ];
  };

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
      <p className={estilos.notaRango}>Mes y semana se mueven dentro del rango de fechas elegido arriba.</p>

      {sesionesSemana.length === 0 ? (
        <EstadoConsulta tipo="vacio" icono="calendario" mensaje={MENSAJE_SIN_SESIONES_SEMANA} />
      ) : (
        <>
          <dl className={estilos.datosResumen}>
            {datosSemana().map((dato) => (
              <div key={dato.id} className={estilos.dato}>
                <dt>{dato.etiqueta}</dt>
                <dd>{dato.valor}</dd>
              </div>
            ))}
          </dl>

          <div className={estilos.leyenda}>
            <span className={estilos.etiquetaLeyenda}>Estado de la sesión</span>
            <ul className={estilos.listaLeyenda} aria-label="Estados de las sesiones de la semana">
              {estadosDeLaSemana(sesionesSemana).map((estado) => (
                <li key={estado} className={estilos.itemEstado}>
                  {/* El contador va dentro del chip: «Omitida 4» son 4 sesiones omitidas esta semana. */}
                  <Insignia tono={tonoEstadoSesion(estado)}>
                    {etiquetaEstadoSesion(estado)}
                    <span className={estilos.cantidadEstado}>
                      {sesionesSemana.filter((sesion) => normalizarEstadoSesion(sesion.estado) === estado).length}
                    </span>
                  </Insignia>
                </li>
              ))}
            </ul>
          </div>
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
              alAbrirModal={abrirDialogoAsistencia}
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

  return (
    <div className={estilos.pagina}>
      {/* Sin acción general: solo título y descripción. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Consulta de horario</h1>
          <p className={estilos.descripcion}>
            {esAdmin
              ? 'Consulta de solo lectura de las sesiones programadas.'
              : 'Consulta de solo lectura. Elige un rango de fechas para ver las sesiones.'}
          </p>
        </div>
      </header>

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
          {consultaPorSeccion && (
            <SelectFiltro
              id="consulta-horario-grado"
              etiqueta="Grado"
              valor={gradoId}
              opciones={opcionesGrado}
              alCambiar={seleccionarGrado}
              apilado
            />
          )}

          {esAdmin && (
            <SelectFiltro
              id="consulta-horario-opcion"
              etiqueta={tipo === 'seccion' ? 'Sección' : 'Docente'}
              valor={id}
              opciones={opcionesSeccion}
              alCambiar={establecerId}
              apilado
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

          {/* Sin selector de modo, «Actualizar» va al final de la fila de filtros, alineado con los campos. */}
          {!esAdmin && (
            <div className={estilos.botonFila}>
              <BotonActualizar alActualizar={recargar} actualizando={cargando} />
            </div>
          )}
        </div>

        {!esAdmin && <FiltrosActivos filtros={[]} hayFiltros={hayFiltros} alLimpiar={limpiarFiltros} />}

        {esApoderado && estudianteSeleccionado && (
          <p className={estilos.contextoEstudiante}>
            <Icono nombre="usuario" tamano={16} />
            <span>
              {contextoEstudiante || 'Sin matrícula confirmada para el año seleccionado.'}
            </span>
          </p>
        )}
      </section>

      {mostrarSemana ? resumenSemana() : (
        <section className={estilos.tarjetaResultados} aria-label="Horario" aria-busy={cargando || undefined}>
          {contenido}
        </section>
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
              ) : (
                <MatrizSesiones
                  key={semanaActual.inicio}
                  ajustarAlto
                  lunes={semanaActual.lunes}
                  titulo={`${tituloConsulta} ${formatearFecha(semanaActual.inicio)}`}
                  sesiones={sesionesSemana}
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

      {dialogoAsistencia && asistenciaSesion.detalle && (
        <DialogoAsistenciaSesion
          sesion={sesionSeleccionada}
          detalle={asistenciaSesion.detalle}
          guardando={asistenciaSesion.guardando}
          error={errorAsistencia || asistenciaSesion.errorGuardado || null}
          alCerrar={() => establecerDialogoAsistencia(false)}
          alGuardar={guardarAsistencia}
        />
      )}
    </div>
  );
}
