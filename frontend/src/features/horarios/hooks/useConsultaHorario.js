import { useEffect, useMemo, useRef, useState } from 'react';

import {
  fechaISO,
  lunesDeFecha,
  semanaMasCercana,
  semanasDelRango
} from '../utils/tiempo.js';
import {
  horarioApoderado,
  horarioDocente,
  horarioSeccion,
  listarAniosAcademicos,
  listarDocentes,
  listarMisEstudiantes,
  listarSecciones,
  miHorarioDocente,
  miHorarioEstudiante,
  obtenerPeriodo
} from '../services/visualizadoresService.js';

export const ADMIN = 'ADMINISTRADOR';
export const DOCENTE = 'DOCENTE';
export const ESTUDIANTE = 'ESTUDIANTE';
export const APODERADO = 'APODERADO';

function inicioSemanaActual() {
  return fechaISO(lunesDeFecha(fechaISO(new Date())));
}

function finSemanaActual() {
  const lunes = lunesDeFecha(fechaISO(new Date()));
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  return fechaISO(viernes);
}

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Filtros guardados en la URL (`?por=docente&grado=1&id=3&desde=…&hasta=…&semana=…`), para recargar o
 * compartir la consulta. Se lee una sola vez al abrir la pantalla; los valores inválidos se ignoran.
 */
function leerFiltrosDeUrl() {
  if (typeof window === 'undefined') return {};
  const parametros = new URLSearchParams(window.location.search);
  const fecha = (nombre) => (FECHA_ISO.test(parametros.get(nombre) ?? '') ? parametros.get(nombre) : null);
  const desde = fecha('desde');
  const hasta = fecha('hasta');
  return {
    por: ['seccion', 'docente'].includes(parametros.get('por')) ? parametros.get('por') : null,
    grado: parametros.get('grado'),
    id: parametros.get('id'),
    desde: desde && hasta && desde <= hasta ? desde : null,
    hasta: desde && hasta && desde <= hasta ? hasta : null,
    semana: fecha('semana')
  };
}

/**
 * Secciones del año académico consultado. Si la API devuelve secciones de otros años (p. ej. 2027 mientras
 * se consulta 2026), se descartan; las que no informan su año se conservan.
 */
function seccionesDelAnio(secciones, anio) {
  if (!anio?.id) return secciones;
  return secciones.filter((seccion) => (
    seccion.anioAcademicoId == null || String(seccion.anioAcademicoId) === String(anio.id)
  ));
}

/**
 * Datos y acciones de la pantalla "Consulta de horario" para todos los roles.
 * Administrador: elige sección o docente. Docente y estudiante: ven el suyo (la sesión lo resuelve el
 * backend). Apoderado: elige uno de los estudiantes a su cargo.
 *
 * @param {string|undefined} rol Rol de la sesión (`ADMINISTRADOR`, `DOCENTE`, `ESTUDIANTE`, `APODERADO`).
 * @param {string|undefined} nombreUsuario Nombre del usuario en sesión, para titular su propio horario.
 * @returns {Object} estado de filtros, sesiones por semana y acciones de la pantalla.
 */
export default function useConsultaHorario(rol, nombreUsuario) {
  const [inicial] = useState(leerFiltrosDeUrl);
  // Lo que viene de la URL y aún no se pudo aplicar porque depende de listas que llegan después.
  const pendientes = useRef({ id: inicial.id, semana: inicial.semana });

  const [tipo, establecerTipoConsulta] = useState(rol === ADMIN && inicial.por ? inicial.por : 'seccion');
  const [anio, establecerAnio] = useState(null);
  const [anios, establecerAnios] = useState([]);
  const [gradoId, establecerGradoId] = useState(rol === ADMIN ? (inicial.grado ?? '') : '');
  const [id, establecerId] = useState('');
  const [opciones, establecerOpciones] = useState([]);
  const [estudiantes, establecerEstudiantes] = useState([]);
  const [periodo, establecerPeriodo] = useState(null);
  // Administrador y apoderado dependen de listas que llegan después del primer render: se parte "cargando"
  // para no mostrar un instante el aviso de "selecciona…" antes del esqueleto.
  const [cargandoOpciones, establecerCargandoOpciones] = useState(rol === ADMIN || rol === APODERADO);
  const [errorOpciones, establecerErrorOpciones] = useState('');

  const [fechaInicio, establecerFechaInicio] = useState(inicioSemanaActual);
  const [fechaFin, establecerFechaFin] = useState(finSemanaActual);
  const [datos, establecerDatos] = useState([]);
  // Parte "cargando": hasta conocer el año académico no hay nada que mostrar y así no parpadea un vacío.
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState('');
  const [recarga, establecerRecarga] = useState(0);
  const [semanaSeleccionada, establecerSemanaSeleccionada] = useState(null);

  // Año académico vigente: define el rango por defecto y las secciones que se ofrecen.
  useEffect(() => {
    let activo = true;
    listarAniosAcademicos().then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        establecerErrorOpciones(respuesta.mensaje || 'No se pudieron cargar los años académicos.');
        establecerCargandoOpciones(false);
        return;
      }
      const actual = respuesta.datos.find(
        (elemento) => Number(elemento.anio) === new Date().getFullYear()
      ) ?? respuesta.datos.at(-1) ?? null;
      if (!actual) {
        establecerErrorOpciones('No hay años académicos configurados.');
        establecerCargandoOpciones(false);
        return;
      }

      const inicio = actual.fechaInicio ?? `${actual.anio}-01-01`;
      const fin = actual.fechaFin ?? `${actual.anio}-12-31`;
      establecerAnios(respuesta.datos);
      establecerAnio(actual);
      establecerFechaInicio(inicial.desde ?? String(inicio).slice(0, 10));
      establecerFechaFin(inicial.hasta ?? String(fin).slice(0, 10));
    });
    return () => { activo = false; };
  }, []);

  // Administrador: secciones del año o docentes, según lo que se consulte.
  useEffect(() => {
    if (rol !== ADMIN) return undefined;
    if (tipo === 'seccion' && !anio?.id) return undefined;

    let activo = true;
    establecerOpciones([]);
    establecerId('');
    establecerCargandoOpciones(true);
    establecerErrorOpciones('');

    const consulta = tipo === 'seccion'
      ? listarSecciones(anio.id)
      : listarDocentes();

    consulta.then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        establecerErrorOpciones(respuesta.mensaje || 'No se pudieron cargar las opciones.');
        establecerCargandoOpciones(false);
        return;
      }
      const lista = tipo === 'seccion' ? seccionesDelAnio(respuesta.datos, anio) : respuesta.datos;
      establecerOpciones(lista);
      establecerCargandoOpciones(false);

      const idPendiente = pendientes.current.id;
      pendientes.current.id = null;
      const encontrada = idPendiente
        ? lista.find((opcion) => String(opcion.id) === String(idPendiente))
        : null;
      if (encontrada) {
        if (tipo === 'seccion') establecerGradoId(String(encontrada.gradoId));
        establecerId(String(encontrada.id));
      }
    });

    return () => { activo = false; };
  }, [rol, tipo, anio]);

  // Apoderado: estudiantes a su cargo para el año seleccionado.
  useEffect(() => {
    if (rol !== APODERADO) return undefined;
    if (!anio?.id) return undefined;

    let activo = true;
    establecerCargandoOpciones(true);
    establecerErrorOpciones('');
    establecerEstudiantes([]);

    listarMisEstudiantes(anio.id).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        establecerErrorOpciones(respuesta.mensaje || 'No se pudieron cargar los estudiantes.');
        establecerCargandoOpciones(false);
        return;
      }
      establecerEstudiantes(respuesta.datos);
      establecerCargandoOpciones(false);

      const idPendiente = pendientes.current.id;
      pendientes.current.id = null;
      if (idPendiente && respuesta.datos.some((estudiante) => String(estudiante.id) === String(idPendiente))) {
        establecerId(String(idPendiente));
      }
    });
    return () => { activo = false; };
  }, [rol, anio?.id]);

  const seccionSeleccionada = useMemo(
    () => opciones.find((opcion) => String(opcion.id) === String(id)),
    [opciones, id]
  );

  // Periodo de matrícula de la sección elegida: decide si se ofrece "Editar horario".
  useEffect(() => {
    if (rol !== ADMIN || tipo !== 'seccion' || !id) {
      establecerPeriodo(null);
      return undefined;
    }
    const anioId = seccionSeleccionada?.anioAcademicoId ?? anio?.id;
    if (!anioId) return undefined;

    let activo = true;
    obtenerPeriodo(anioId).then((respuesta) => {
      if (!activo) return;
      establecerPeriodo(respuesta.exitoso ? respuesta.datos : null);
    });
    return () => { activo = false; };
  }, [rol, tipo, id, seccionSeleccionada, anio?.id]);

  // Sesiones del rango consultado.
  useEffect(() => {
    let activo = true;

    if (!anio) {
      establecerDatos([]);
      establecerError('');
      return () => { activo = false; };
    }
    if ((rol === ADMIN || rol === APODERADO) && !id) {
      establecerDatos([]);
      establecerError('');
      establecerCargando(false);
      return () => { activo = false; };
    }
    if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) {
      establecerDatos([]);
      establecerError('Selecciona un rango de fechas válido.');
      establecerCargando(false);
      return () => { activo = false; };
    }

    establecerCargando(true);
    establecerError('');

    let consulta;
    if (rol === ADMIN) {
      consulta = tipo === 'seccion'
        ? horarioSeccion(id, { fechaInicio, fechaFin })
        : horarioDocente(id, { fechaInicio, fechaFin });
    } else if (rol === DOCENTE) {
      consulta = miHorarioDocente({ fechaInicio, fechaFin });
    } else if (rol === ESTUDIANTE) {
      consulta = miHorarioEstudiante({ fechaInicio, fechaFin });
    } else if (rol === APODERADO) {
      consulta = horarioApoderado(id, { fechaInicio, fechaFin });
    } else {
      establecerCargando(false);
      return () => { activo = false; };
    }

    consulta.then((respuesta) => {
      if (!activo) return;
      if (respuesta.exitoso) {
        establecerDatos(Array.isArray(respuesta.datos) ? respuesta.datos : []);
      } else if (!respuesta.cancelada) {
        establecerDatos([]);
        establecerError(respuesta.mensaje || 'No se pudo consultar el horario.');
      }
      establecerCargando(false);
    });

    return () => { activo = false; };
  }, [rol, tipo, id, fechaInicio, fechaFin, recarga, anio]);

  const grados = useMemo(() => [...new Map(
    opciones.map((seccion) => [
      String(seccion.gradoId),
      { id: seccion.gradoId, nombre: seccion.gradoNombre ?? String(seccion.gradoId) }
    ])
  ).values()], [opciones]);

  const seccionesFiltradas = useMemo(
    () => opciones.filter((seccion) => String(seccion.gradoId) === String(gradoId)),
    [opciones, gradoId]
  );

  const programacionAbierta = Boolean(
    periodo?.crudBloquesHorarioAbierta || periodo?.asignacionCursoDocenteAbierta
  );

  const rutaEdicion = seccionSeleccionada
    ? `/horarios?anio=${encodeURIComponent(seccionSeleccionada.anioAcademicoId ?? anio?.id ?? '')}`
      + `&grado=${encodeURIComponent(String(seccionSeleccionada.gradoId))}`
      + `&seccion=${encodeURIComponent(String(seccionSeleccionada.id))}`
    : '/horarios';

  const estudianteSeleccionado = estudiantes.find(
    (estudiante) => String(estudiante.id) === String(id)
  );

  let tituloConsulta = nombreUsuario ?? '';
  if (rol === ADMIN) {
    if (tipo === 'seccion') {
      tituloConsulta = seccionSeleccionada?.nombre
        ? `${seccionSeleccionada.gradoNombre ?? ''} ${seccionSeleccionada.nombre}`.trim()
        : '';
    } else {
      tituloConsulta = opciones.find((docente) => String(docente.id) === String(id))?.nombre ?? '';
    }
  } else if (rol === APODERADO) {
    tituloConsulta = estudianteSeleccionado?.nombreCompleto ?? '';
  }

  const semanas = useMemo(
    () => semanasDelRango(fechaInicio, fechaFin).map((semana) => ({
      ...semana,
      sesiones: datos.filter((sesion) => sesion.fecha >= semana.inicio && sesion.fecha <= semana.fin)
    })),
    [fechaInicio, fechaFin, datos]
  );

  const meses = useMemo(() => {
    const mapa = new Map();
    semanas.forEach((semana) => {
      const clave = semana.inicio.slice(0, 7);
      if (!mapa.has(clave)) {
        const fecha = new Date(`${clave}-01T00:00:00`);
        const etiqueta = fecha.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
        mapa.set(clave, {
          clave,
          etiqueta: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1),
          semanas: []
        });
      }
      mapa.get(clave).semanas.push(semana);
    });
    return [...mapa.values()];
  }, [semanas]);

  // Al cambiar el rango se vuelve a elegir una semana útil; no se conserva la última visitada.
  useEffect(() => {
    establecerSemanaSeleccionada(null);
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    if (semanas.length === 0) {
      establecerSemanaSeleccionada(null);
      return;
    }
    if (semanas.some((semana) => semana.inicio === semanaSeleccionada)) return;
    const semanaPendiente = anio ? semanas.find((semana) => semana.inicio === pendientes.current.semana) : null;
    if (semanaPendiente) {
      pendientes.current.semana = null;
      establecerSemanaSeleccionada(semanaPendiente.inicio);
      return;
    }
    establecerSemanaSeleccionada(semanaMasCercana(semanas, fechaISO(new Date())).inicio);
  }, [semanas, semanaSeleccionada, anio]);

  const indiceSemana = semanas.findIndex((semana) => semana.inicio === semanaSeleccionada);
  const semanaActual = semanas[indiceSemana] ?? semanas[0] ?? null;

  const irSemanaAnterior = () => {
    if (indiceSemana > 0) establecerSemanaSeleccionada(semanas[indiceSemana - 1].inicio);
  };
  const irSemanaSiguiente = () => {
    if (indiceSemana >= 0 && indiceSemana < semanas.length - 1) {
      establecerSemanaSeleccionada(semanas[indiceSemana + 1].inicio);
    }
  };

  const claveMesActual = semanaActual?.inicio.slice(0, 7) ?? '';
  const semanaDeHoy = semanaMasCercana(semanas, fechaISO(new Date()));
  const esSemanaDeHoy = Boolean(semanaActual && semanaDeHoy?.inicio === semanaActual.inicio);

  /** Salta a la semana de hoy (o a la más cercana del rango). */
  const irSemanaDeHoy = () => {
    if (semanaDeHoy) establecerSemanaSeleccionada(semanaDeHoy.inicio);
  };

  /** Cambia de mes y deja seleccionada la semana de ese mes más cercana a hoy. */
  const seleccionarMes = (clave) => {
    const mes = meses.find((elemento) => elemento.clave === clave);
    if (!mes) return;
    establecerSemanaSeleccionada(semanaMasCercana(mes.semanas, fechaISO(new Date())).inicio);
  };

  const seleccionarTipo = (nuevoTipo) => {
    establecerTipoConsulta(nuevoTipo);
    establecerId('');
    establecerGradoId('');
  };

  const seleccionarGrado = (nuevoGradoId) => {
    establecerGradoId(nuevoGradoId);
    establecerId('');
  };

  const seleccionarAnio = (valor) => {
    const nuevoAnio = anios.find((elemento) => String(elemento.id) === String(valor));
    if (!nuevoAnio) return;
    pendientes.current.id = null;
    establecerAnio(nuevoAnio);
    establecerFechaInicio(String(nuevoAnio.fechaInicio ?? `${nuevoAnio.anio}-01-01`).slice(0, 10));
    establecerFechaFin(String(nuevoAnio.fechaFin ?? `${nuevoAnio.anio}-12-31`).slice(0, 10));
    establecerEstudiantes([]);
    establecerId('');
    establecerSemanaSeleccionada(null);
  };

  /** Rango completo del año académico: es el que se aplica al entrar y al restablecer. */
  const rangoAnio = useMemo(() => (anio
    ? {
      fechaInicio: String(anio.fechaInicio ?? `${anio.anio}-01-01`).slice(0, 10),
      fechaFin: String(anio.fechaFin ?? `${anio.anio}-12-31`).slice(0, 10)
    }
    : null), [anio]);

  const rangoPersonalizado = Boolean(
    rangoAnio && (fechaInicio !== rangoAnio.fechaInicio || fechaFin !== rangoAnio.fechaFin)
  );

  const restablecerRango = () => {
    if (!rangoAnio) return;
    establecerFechaInicio(rangoAnio.fechaInicio);
    establecerFechaFin(rangoAnio.fechaFin);
  };

  /** Vuelve al rango del año académico y quita la selección de sección, docente o estudiante. */
  const limpiarFiltros = () => {
    restablecerRango();
    establecerGradoId('');
    establecerId('');
  };

  // Mantiene la URL al día con los filtros; sin recargar ni añadir entradas al historial.
  const semanaEnUrl = semanaActual && !esSemanaDeHoy ? semanaActual.inicio : '';
  useEffect(() => {
    if (!anio || typeof window === 'undefined') return;
    const parametros = new URLSearchParams();
    if (rol === ADMIN && tipo === 'docente') parametros.set('por', 'docente');
    if (rol === ADMIN && tipo === 'seccion' && gradoId) parametros.set('grado', gradoId);
    if ((rol === ADMIN || rol === APODERADO) && id) parametros.set('id', id);
    if (rangoPersonalizado) {
      parametros.set('desde', fechaInicio);
      parametros.set('hasta', fechaFin);
    }
    if (semanaEnUrl) parametros.set('semana', semanaEnUrl);

    const consulta = parametros.toString();
    const destino = `${window.location.pathname}${consulta ? `?${consulta}` : ''}${window.location.hash}`;
    if (destino !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', destino);
    }
  }, [anio, rol, tipo, gradoId, id, rangoPersonalizado, fechaInicio, fechaFin, semanaEnUrl]);

  return {
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
    seccionSeleccionada,
    semanas,
    meses,
    semanaActual,
    indiceSemana,
    establecerId,
    establecerFechaInicio,
    establecerFechaFin,
    establecerSemanaSeleccionada,
    seleccionarTipo,
    seleccionarGrado,
    seleccionarAnio,
    irSemanaAnterior,
    irSemanaSiguiente,
    claveMesActual,
    esSemanaDeHoy,
    irSemanaDeHoy,
    seleccionarMes,
    rangoPersonalizado,
    restablecerRango,
    limpiarFiltros,
    recargar: () => establecerRecarga((actual) => actual + 1)
  };
}
