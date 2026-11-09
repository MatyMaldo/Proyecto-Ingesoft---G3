import useAuth from '../../../shared/auth/useAuth.js';
import ControlSegmentado from '../../../shared/components/ControlSegmentado.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltrosActivos from '../../../shared/components/FiltrosActivos.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import MatrizSesiones from '../components/MatrizSesiones.jsx';
import SelectorFecha from '../components/SelectorFecha.jsx';
import useConsultaHorario, { ADMIN, APODERADO } from '../hooks/useConsultaHorario.js';
import { formatearFecha } from '../utils/tiempo.js';
import estilos from './PaginaVisualizadorHorario.module.css';

const OPCIONES_TIPO = [
  { valor: 'seccion', etiqueta: 'Ver por sección' },
  { valor: 'docente', etiqueta: 'Ver por docente' }
];

/** Rango de días de una semana para el botón: "02 – 06". */
function etiquetaDias(semana) {
  return semana.inicio === semana.fin
    ? semana.inicio.slice(8)
    : `${semana.inicio.slice(8)} – ${semana.fin.slice(8)}`;
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
 */
export default function PaginaVisualizadorHorario() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;
  const esAdmin = rol === ADMIN;
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
    seccionSeleccionada,
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
    restablecerRango,
    limpiarFiltros,
    recargar
  } = useConsultaHorario(rol, usuario?.nombre);

  const necesitaSeleccion = (esAdmin || esApoderado) && !id;
  const consultaPorSeccion = esAdmin && tipo === 'seccion';
  const hayFiltros = rangoPersonalizado || Boolean(id) || Boolean(gradoId);

  const etiquetaConsulta = esApoderado ? 'Estudiante' : tipo === 'seccion' ? 'Sección' : 'Docente';
  const valorConsulta = consultaPorSeccion ? seccionSeleccionada?.nombre : tituloConsulta;
  const nombreGrado = grados.find((grado) => String(grado.id) === String(gradoId))?.nombre;
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

  const chipsActivos = [
    ...(consultaPorSeccion && gradoId && nombreGrado
      ? [{ id: 'grado', etiqueta: `Grado: ${nombreGrado}`, alQuitar: () => seleccionarGrado('') }]
      : []),
    ...(id && valorConsulta
      ? [{ id: 'consulta', etiqueta: `${etiquetaConsulta}: ${valorConsulta}`, alQuitar: () => establecerId('') }]
      : []),
    ...(rangoPersonalizado
      ? [{
        id: 'fechas',
        etiqueta: `Del ${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)}`,
        alQuitar: restablecerRango
      }]
      : [])
  ];

  const opcionesGrado = [
    { valor: '', etiqueta: 'Seleccione un grado' },
    ...grados.map((grado) => ({ valor: String(grado.id), etiqueta: grado.nombre }))
  ];

  const opcionesSeccion = [
    { valor: '', etiqueta: 'Seleccione una opción' },
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
    { valor: '', etiqueta: 'Seleccione un estudiante' },
    ...estudiantes.map((estudiante) => ({
      valor: String(estudiante.id),
      etiqueta: estudiante.estadoMatricula
        ? estudiante.nombreCompleto
        : `${estudiante.nombreCompleto} (sin matrícula)`
    }))
  ];

  const cuerpoSemana = () => (
    <div className={estilos.semanas}>
      <h2 className={estilos.tituloSemana} aria-live="polite">
        {tituloConsulta ? `${tituloConsulta} · ` : ''}
        {semanaActual.inicio === semanaActual.fin
          ? `Día ${formatearFecha(semanaActual.inicio)}`
          : `Semana del ${formatearFecha(semanaActual.inicio)} al ${formatearFecha(semanaActual.fin)}`}
      </h2>

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
          </div>
        </div>

        <button
          type="button"
          className={estilos.botonSecundario}
          onClick={irSemanaDeHoy}
          disabled={esSemanaDeHoy}
        >
          Ir a hoy
        </button>
      </div>

      {semanaActual.sesiones.length === 0 ? (
        <div className={estilos.sinSesiones}>
          <EstadoConsulta tipo="vacio" mensaje={MENSAJE_SIN_SESIONES_SEMANA} />
        </div>
      ) : (
        <MatrizSesiones
          key={semanaActual.inicio}
          lunes={semanaActual.lunes}
          titulo={`${tituloConsulta} ${formatearFecha(semanaActual.inicio)}`}
          sesiones={semanaActual.sesiones}
          mostrarSeccion={!esAdmin || tipo === 'docente'}
        />
      )}
    </div>
  );

  let contenido;
  if (errorOpciones || error) {
    contenido = (
      <EstadoConsulta
        tipo="error"
        mensaje={errorOpciones || error}
        alReintentar={errorOpciones ? undefined : recargar}
      />
    );
  } else if (cargando || (cargandoOpciones && necesitaSeleccion)) {
    contenido = <EstadoConsulta tipo="carga" filasEsqueleto={5} />;
  } else if (necesitaSeleccion) {
    contenido = <EstadoConsulta tipo="vacio" mensaje={mensajeSinSeleccion(rol, tipo)} />;
  } else if (semanas.length === 0) {
    contenido = <EstadoConsulta tipo="vacio" mensaje={MENSAJE_SIN_SESIONES_RANGO} />;
  } else if (semanaActual) {
    contenido = cuerpoSemana();
  }

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <h1 className={estilos.titulo}>Consulta de horario</h1>
        <p className={estilos.descripcion}>
          <Icono nombre="candado" tamano={16} />
          <span>
            Consulta de solo lectura. Selecciona un rango de fechas para consultar las sesiones programadas.
          </span>
        </p>
      </header>

      <section className={estilos.filtros} aria-label="Filtros de consulta de horario">
        <div className={estilos.areaModo}>
          {esAdmin && (
            <ControlSegmentado
              id="consulta-horario-tipo"
              etiqueta="Consultar por"
              valor={tipo}
              opciones={OPCIONES_TIPO}
              alCambiar={seleccionarTipo}
            />
          )}
        </div>

        <div className={estilos.areaAccion}>
          <button
            type="button"
            className={estilos.botonSecundario}
            onClick={recargar}
            disabled={cargando}
          >
            <Icono nombre="reintentar" tamano={16} />
            Actualizar horario
          </button>
        </div>

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
        </div>

        <div className={estilos.areaChips}>
          {esApoderado && estudianteSeleccionado && (
            <p className={estilos.contextoEstudiante}>
              <Icono nombre="usuario" tamano={16} />
              <span>
                {contextoEstudiante || 'Sin matrícula confirmada para el año seleccionado.'}
              </span>
            </p>
          )}
          <FiltrosActivos filtros={chipsActivos} hayFiltros={hayFiltros} alLimpiar={limpiarFiltros} />
        </div>

        {consultaPorSeccion && programacionAbierta && (
          <div className={estilos.areaEnlace}>
            <a className={estilos.enlaceEdicion} href={rutaEdicion}>Editar horario</a>
          </div>
        )}
      </section>

      <section className={estilos.tarjetaResultados} aria-label="Horario" aria-busy={cargando || undefined}>
        {contenido}
      </section>
    </div>
  );
}
