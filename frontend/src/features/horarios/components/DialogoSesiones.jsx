import { memo, useEffect, useMemo, useRef, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import ProgresoOperacionMasiva from '../../../shared/components/ProgresoOperacionMasiva.jsx';
import { crearClaveIdempotencia } from '../../../shared/api/operacionesMasivasService.js';
import useSesionesHorario from '../hooks/useSesionesHorario.js';
import { iniciarGeneracionSesionesAsync } from '../services/horariosService.js';
import { etiquetaEstadoSesion, normalizarEstadoSesion, tonoEstadoSesion } from '../utils/estadosSesion.js';
import { formatearFecha, lunesDeFecha, fechaISO } from '../utils/tiempo.js';
import SelectorFecha from './SelectorFecha.jsx';
import estilos from './DialogoSesiones.module.css';

/** Mismo tamaño de página que usa la vista previa de la carga masiva de bloques. */
const FILAS_POR_PAGINA = 100;

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DIAS = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves', VIERNES: 'Viernes'
};

/** Estado de una fila de la vista previa: lo que ocurrirá con esa sesión al generar. */
const ESTADOS_FILA = [
  { clave: 'NUEVA', singular: 'por crear', plural: 'por crear', tono: 'azul', icono: 'calendario' },
  { clave: 'OMITIDA', singular: 'omitida', plural: 'omitidas', tono: 'ambar', icono: 'alerta' },
  { clave: 'EXISTENTE', singular: 'ya existe', plural: 'ya existen', tono: 'gris', icono: 'verificar' }
];

const FILTROS_VACIOS = Object.freeze({ mes: '', semana: '', curso: '', docente: '', estado: '' });

function claveSesion(sesion) {
  return `${sesion.bloqueHorarioId}|${sesion.fecha}`;
}

function etiquetaMes(claveMes) {
  const [anio, mes] = claveMes.split('-');
  return `${MESES[Number(mes) - 1] ?? mes} ${anio}`;
}

function claveSemana(fecha) {
  return fechaISO(lunesDeFecha(fecha));
}

function etiquetaSemana(lunes) {
  const viernes = new Date(`${lunes}T00:00:00`);
  viernes.setDate(viernes.getDate() + 4);
  return `${formatearFecha(lunes)} al ${formatearFecha(fechaISO(viernes))}`;
}

function plural(cantidad, singular, pluralTexto) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;
}

/**
 * Fila de la vista previa. Está memorizada: al omitir o restaurar una sesión solo se repinta esa fila y no
 * las demás de la página.
 */
const FilaSesion = memo(function FilaSesion({ sesion, estadoFila, alAlternar }) {
  const existente = estadoFila === 'EXISTENTE';
  const omitida = estadoFila === 'OMITIDA';
  const definicion = ESTADOS_FILA.find((estado) => estado.clave === estadoFila);
  const estadoSesion = normalizarEstadoSesion(sesion.estado);

  return (
    <tr className={omitida ? estilos.filaOmitida : undefined}>
      <td data-label="Omitir">
        <input
          type="checkbox"
          className={estilos.casilla}
          checked={omitida}
          disabled={existente}
          title={existente ? 'Las sesiones existentes se omiten o restauran desde Consulta de horario.' : undefined}
          aria-label={`Omitir ${sesion.cursoNombre} del ${formatearFecha(sesion.fecha)}`}
          onChange={() => alAlternar(sesion)}
        />
      </td>
      <td data-label="Fecha">
        <span className={estilos.celdaPrincipal}>{formatearFecha(sesion.fecha)}</span>
        <span className={estilos.celdaSecundaria}>{DIAS[sesion.diaSemana] ?? ''}</span>
      </td>
      <td data-label="Horario" className={estilos.celdaHora}>
        {sesion.horaInicio?.slice(0, 5)} – {sesion.horaFin?.slice(0, 5)}
      </td>
      <td data-label="Curso">
        <span className={estilos.celdaPrincipal}>{sesion.cursoNombre}</span>
        {sesion.aulaNombre && <span className={estilos.celdaSecundaria}>{sesion.aulaNombre}</span>}
      </td>
      <td data-label="Docente">{sesion.docenteNombre}</td>
      <td data-label="Estado">
        <Insignia
          tono={existente && estadoSesion ? tonoEstadoSesion(estadoSesion) : definicion.tono}
          className={estilos.insigniaIcono}
        >
          <Icono nombre={definicion.icono} tamano={14} />
          {existente
            ? `Ya existe${estadoSesion ? ` · ${etiquetaEstadoSesion(estadoSesion)}` : ''}`
            : omitida ? 'Omitida (nueva)' : 'Por crear'}
        </Insignia>
      </td>
    </tr>
  );
});

export default function DialogoSesiones({
  consulta,
  periodo,
  primerBimestre,
  tituloSeccion,
  alCancelar,
  alNotificar,
  operacion
}) {
  const sesiones = useSesionesHorario(consulta, periodo, primerBimestre);
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [filtros, establecerFiltros] = useState(FILTROS_VACIOS);
  const [pagina, establecerPagina] = useState(0);
  const claveRef = useRef(null);
  const { sesionesPreview, sesionesOmitidas, alternarOmitida, establecerOmision } = sesiones;

  // Cada vista previa nueva empieza sin filtros y en la primera página.
  useEffect(() => {
    establecerFiltros(FILTROS_VACIOS);
    establecerPagina(0);
  }, [sesionesPreview]);

  const estadoDeFila = (sesion) => {
    if (sesion.yaExiste === true) return 'EXISTENTE';
    return Object.hasOwn(sesionesOmitidas, claveSesion(sesion)) ? 'OMITIDA' : 'NUEVA';
  };

  const opciones = useMemo(() => {
    const meses = new Set();
    const semanas = new Set();
    const cursos = new Map();
    const docentes = new Map();
    sesionesPreview.forEach((sesion) => {
      if (!sesion.fecha) return;
      meses.add(sesion.fecha.slice(0, 7));
      semanas.add(claveSemana(sesion.fecha));
      cursos.set(String(sesion.cursoId ?? sesion.cursoNombre), sesion.cursoNombre);
      docentes.set(String(sesion.docenteId ?? sesion.docenteNombre), sesion.docenteNombre);
    });
    return {
      meses: [...meses].sort(),
      semanas: [...semanas].sort(),
      cursos: [...cursos.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es')),
      docentes: [...docentes.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'))
    };
  }, [sesionesPreview]);

  const ordenadas = useMemo(() => [...sesionesPreview].sort(
    (a, b) => a.fecha.localeCompare(b.fecha)
      || String(a.horaInicio).localeCompare(String(b.horaInicio))
      || a.bloqueHorarioId - b.bloqueHorarioId
  ), [sesionesPreview]);

  const conEstado = useMemo(
    () => ordenadas.map((sesion) => ({ sesion, estado: estadoDeFila(sesion) })),
    // `estadoDeFila` depende solo de `sesionesOmitidas`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ordenadas, sesionesOmitidas]
  );

  const conteos = useMemo(() => {
    const cuenta = { NUEVA: 0, OMITIDA: 0, EXISTENTE: 0 };
    conEstado.forEach(({ estado }) => { cuenta[estado] += 1; });
    return cuenta;
  }, [conEstado]);

  const filtradas = useMemo(() => conEstado.filter(({ sesion, estado }) => {
    if (filtros.mes && !sesion.fecha.startsWith(filtros.mes)) return false;
    if (filtros.semana && claveSemana(sesion.fecha) !== filtros.semana) return false;
    if (filtros.curso && String(sesion.cursoId ?? sesion.cursoNombre) !== filtros.curso) return false;
    if (filtros.docente && String(sesion.docenteId ?? sesion.docenteNombre) !== filtros.docente) return false;
    if (filtros.estado && estado !== filtros.estado) return false;
    return true;
  }), [conEstado, filtros]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const inicio = paginaActual * FILAS_POR_PAGINA;
  const filasPagina = filtradas.slice(inicio, inicio + FILAS_POR_PAGINA);

  // Casilla "omitir todas": solo cuentan las sesiones filtradas que todavía no existen.
  const omisibles = filtradas.filter(({ estado }) => estado !== 'EXISTENTE');
  const omitidasFiltradas = omisibles.filter(({ estado }) => estado === 'OMITIDA').length;
  const todasOmitidas = omisibles.length > 0 && omitidasFiltradas === omisibles.length;
  const algunasOmitidas = omitidasFiltradas > 0 && !todasOmitidas;
  const hayFiltros = Object.values(filtros).some(Boolean);
  const etiquetaTodas = hayFiltros
    ? `Omitir las ${omisibles.length} sesiones nuevas filtradas`
    : `Omitir todas las sesiones nuevas (${omisibles.length})`;

  function cambiarFiltro(campo, valor) {
    establecerFiltros((actual) => ({ ...actual, [campo]: valor }));
    establecerPagina(0);
  }

  function quitarFiltros() {
    establecerFiltros(FILTROS_VACIOS);
    establecerPagina(0);
  }

  async function previsualizar() {
    establecerErrorGeneral(null);
    const error = await sesiones.previsualizar();
    if (error) establecerErrorGeneral(error);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    establecerErrorGeneral(null);

    const datos = sesiones.construirSolicitud();
    if (!Number.isSafeInteger(Number(datos.anioAcademicoId))
      || !Number.isSafeInteger(Number(datos.seccionId))) {
      establecerErrorGeneral('Falta el identificador de año académico o sección.');
      return;
    }
    if (!datos.fechaInicio || !datos.fechaFin || datos.fechaFin < datos.fechaInicio) {
      establecerErrorGeneral('Selecciona un rango de fechas válido.');
      return;
    }

    if (!claveRef.current || operacion?.job) {
      claveRef.current = crearClaveIdempotencia('generar-sesiones');
    }
    const respuesta = await operacion.iniciar(() => (
      iniciarGeneracionSesionesAsync(datos, claveRef.current)
    ));
    if (respuesta && !respuesta.exitoso) {
      establecerErrorGeneral(
        respuesta.mensaje || 'No fue posible iniciar la generación de sesiones.'
      );
    }
  }

  const faltaAnio = !consulta?.anioAcademicoId && !consulta?.anioId;
  const listo = sesiones.estadoPreview === 'listo';
  const resumen = listo
    ? `${plural(sesiones.totalPreview, 'sesión prevista', 'sesiones previstas')} · ${conteos.OMITIDA} por omitir`
      + (conteos.EXISTENTE > 0 ? ` · ${conteos.EXISTENTE} ya existen` : '')
    : undefined;

  return (
    <DialogoBase
      idTitulo="dialogo-sesiones-titulo"
      titulo="Generar sesiones"
      subtitulo={tituloSeccion}
      anchoMaximo="56rem"
      textoConfirmar="Generar sesiones"
      textoEnviando="Generando…"
      enviando={operacion?.iniciando ?? false}
      confirmarDeshabilitado={
        !listo || faltaAnio
        || Boolean(operacion?.enCurso) || Boolean(operacion?.job)
      }
      error={errorGeneral || operacion?.error || null}
      notaPie={resumen}
      cerrarAlClicFuera={false}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      <div className={estilos.contenido}>
        <div className={estilos.filtros}>
          <label className={estilos.campoFecha}>
            Desde
            <SelectorFecha
              id="sesiones-desde"
              etiqueta="Desde"
              valor={sesiones.fechaInicio}
              min={sesiones.fechaMinima}
              max={sesiones.fechaFin}
              enDialogo
              alCambiar={(valor) => {
                sesiones.establecerFechaInicio(valor);
                sesiones.reiniciarPreview();
              }}
            />
          </label>
          <label className={estilos.campoFecha}>
            Hasta
            <SelectorFecha
              id="sesiones-hasta"
              etiqueta="Hasta"
              valor={sesiones.fechaFin}
              min={sesiones.fechaInicio}
              max={sesiones.fechaMaxima}
              enDialogo
              alCambiar={(valor) => {
                sesiones.establecerFechaFin(valor);
                sesiones.reiniciarPreview();
              }}
            />
          </label>
          <button
            type="button"
            className={estilos.botonGenerar}
            disabled={sesiones.generando || faltaAnio || operacion?.enCurso || Boolean(operacion?.job)}
            onClick={previsualizar}
          >
            Previsualizar
          </button>
        </div>

        {faltaAnio && (
          <p role="alert">La sección seleccionada no tiene un año académico asociado.</p>
        )}
        {sesiones.estadoPreview === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={2} />}
        {listo && sesionesPreview.length === 0 && (
          <p className={estilos.vistaPrevia}>No hay sesiones en el rango seleccionado.</p>
        )}

        {listo && sesionesPreview.length > 0 && (
          <>
            <div className={estilos.resumen}>
              <div className={estilos.resumenTotal}>
                <span className={estilos.cifra}>{sesionesPreview.length}</span>
                <span className={estilos.rotuloCifra}>
                  {sesionesPreview.length === 1 ? 'sesión prevista' : 'sesiones previstas'}
                </span>
              </div>
              <dl className={estilos.grupos}>
                <div className={estilos.grupo}>
                  <dt className={estilos.etiquetaGrupo}>Estado</dt>
                  <dd className={estilos.chips}>
                    {ESTADOS_FILA.filter((estado) => conteos[estado.clave] > 0).map((estado) => (
                      <button
                        key={estado.clave}
                        type="button"
                        className={estilos.chipFiltro}
                        aria-pressed={filtros.estado === estado.clave}
                        title="Filtrar la tabla por este estado"
                        onClick={() => cambiarFiltro('estado', filtros.estado === estado.clave ? '' : estado.clave)}
                      >
                        <Insignia tono={estado.tono} className={estilos.insigniaIcono}>
                          <Icono nombre={estado.icono} tamano={14} />
                          {plural(conteos[estado.clave], estado.singular, estado.plural)}
                        </Insignia>
                      </button>
                    ))}
                  </dd>
                  {hayFiltros && (
                    <dd className={estilos.chips}>
                      <button type="button" className={estilos.limpiarFiltros} onClick={quitarFiltros}>
                        <Icono nombre="cerrar" tamano={14} />
                        Limpiar filtros
                      </button>
                    </dd>
                  )}
                </div>
              </dl>
            </div>

            <div className={estilos.filtrosPreview}>
              <label className={estilos.campoFiltro}>
                Mes
                <select
                  className={estilos.select}
                  value={filtros.mes}
                  onChange={(evento) => cambiarFiltro('mes', evento.target.value)}
                >
                  <option value="">Todos</option>
                  {opciones.meses.map((mes) => (
                    <option key={mes} value={mes}>{etiquetaMes(mes)}</option>
                  ))}
                </select>
              </label>
              <label className={estilos.campoFiltro}>
                Semana
                <select
                  className={estilos.select}
                  value={filtros.semana}
                  onChange={(evento) => cambiarFiltro('semana', evento.target.value)}
                >
                  <option value="">Todas</option>
                  {opciones.semanas.map((semana) => (
                    <option key={semana} value={semana}>{etiquetaSemana(semana)}</option>
                  ))}
                </select>
              </label>
              <label className={estilos.campoFiltro}>
                Curso
                <select
                  className={estilos.select}
                  value={filtros.curso}
                  onChange={(evento) => cambiarFiltro('curso', evento.target.value)}
                >
                  <option value="">Todos</option>
                  {opciones.cursos.map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>{etiqueta}</option>
                  ))}
                </select>
              </label>
              <label className={estilos.campoFiltro}>
                Docente
                <select
                  className={estilos.select}
                  value={filtros.docente}
                  onChange={(evento) => cambiarFiltro('docente', evento.target.value)}
                >
                  <option value="">Todos</option>
                  {opciones.docentes.map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>{etiqueta}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={estilos.tablaContenedor}>
              {filtradas.length === 0 ? (
                <EstadoConsulta
                  tipo="vacio"
                  mensaje="No hay sesiones con los filtros seleccionados."
                />
              ) : (
                <table className={estilos.tabla}>
                  <caption className={estilos.soloLectores}>Vista previa de las sesiones a generar</caption>
                  <thead>
                    <tr>
                      <th scope="col" className={estilos.colOmitir}>
                        <input
                          type="checkbox"
                          className={estilos.casilla}
                          aria-label={etiquetaTodas}
                          title={etiquetaTodas}
                          checked={todasOmitidas}
                          ref={(casilla) => { if (casilla) casilla.indeterminate = algunasOmitidas; }}
                          disabled={omisibles.length === 0}
                          onChange={() => establecerOmision(omisibles.map(({ sesion }) => sesion), !todasOmitidas)}
                        />
                        <span className={estilos.soloLectores}>Omitir</span>
                      </th>
                      <th scope="col" className={estilos.colFecha}>Fecha</th>
                      <th scope="col" className={estilos.colHorario}>Horario</th>
                      <th scope="col">Curso</th>
                      <th scope="col">Docente</th>
                      <th scope="col" className={estilos.colEstado}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasPagina.map(({ sesion, estado }) => (
                      <FilaSesion
                        key={claveSesion(sesion)}
                        sesion={sesion}
                        estadoFila={estado}
                        alAlternar={alternarOmitida}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {filtradas.length > FILAS_POR_PAGINA && (
              <Paginacion
                pagina={paginaActual}
                totalPaginas={totalPaginas}
                totalElementos={filtradas.length}
                tamanioPagina={FILAS_POR_PAGINA}
                cantidadEnPagina={filasPagina.length}
                alCambiarPagina={establecerPagina}
                etiqueta="Paginación de la vista previa"
                unidadSingular="sesión"
                unidadPlural="sesiones"
              />
            )}
          </>
        )}

        {operacion?.job && (
          <ProgresoOperacionMasiva
            job={operacion.job}
            error={operacion.error}
            titulo="Generación de sesiones"
          />
        )}
      </div>
    </DialogoBase>
  );
}
