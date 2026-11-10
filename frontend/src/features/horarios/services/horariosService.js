import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  consultarCatalogosMock,
  listarAsignacionesMock,
  crearAsignacionMock,
  actualizarAsignacionMock,
  eliminarAsignacionMock,
  obtenerHorarioMock,
  listarOcupacionesMock,
  generarSesionesContratoMock,
  listarSesionesContratoMock,
  previsualizarSesionesContratoMock,
  guardarHorarioMock,
  guardarBloquesLoteMock,
  obtenerPeriodoMatriculaMock
} from './mocks/horariosMock.js';

const BASE_BLOQUES = '/bloques-horario';
const BASE_SESIONES = '/sesiones-clase';

function falloFormato(recurso) {
  return {
    exitoso: false,
    datos: null,
    mensaje: `El backend devolvió un formato de ${recurso} no válido.`
  };
}

function identificadorLong(valor) {
  return /^\d+$/.test(String(valor)) ? Number(valor) : valor;
}

function horaCorta(hora) {
  return String(hora ?? '').slice(0, 5);
}

function nombreDocente(docente) {
  if (docente.nombreCompleto) return docente.nombreCompleto;
  return [docente.nombre, docente.apellidoPaterno, docente.apellidoMaterno]
    .filter(Boolean)
    .join(' ')
    .trim();
}

/** Body de un bloque para el CRUD individual. */
function cuerpoBloque({ dia, horaInicio, horaFin, asignacionId, aulaId }) {
  return {
    asignacionCursoId: identificadorLong(asignacionId),
    aulaId: identificadorLong(aulaId),
    diaSemana: dia,
    horaInicio: horaCorta(horaInicio),
    horaFin: horaCorta(horaFin)
  };
}

/** Body de un bloque para el reemplazo masivo. */
function cuerpoBloqueLote(bloque) {
  return {
    ...(bloque.id != null ? { id: identificadorLong(bloque.id) } : {}),
    ...cuerpoBloque(bloque)
  };
}

export async function consultarCatalogos() {
  if (USAR_MOCK) return consultarCatalogosMock();

  const endpoints = ['/grados', '/cursos', '/aulas', '/anios-academicos', '/usuarios'];
  const solicitudes = [
    ...endpoints.slice(0, 4).map((endpoint) => () => solicitar(endpoint)),
    () => solicitar('/usuarios', {
      parametros: { tipoUsuario: 'DOCENTE', activo: true, page: 0, size: 100 }
    })
  ];
  const respuestas = await Promise.all(solicitudes.map((solicitud) => solicitud()));
  const indiceError = respuestas.findIndex((respuesta) => !respuesta.exitoso);
  if (indiceError !== -1) {
    const respuesta = respuestas[indiceError];
    return {
      ...respuesta,
      mensaje: `No se pudo cargar ${endpoints[indiceError]}: ${
        respuesta.mensaje || 'verifica el endpoint y la sesión.'
      }`
    };
  }

  const [grados, cursos, aulas, anios] = respuestas.slice(0, 4).map(
    (respuesta) => respuesta.datos
  );
  const docentesPagina = respuestas[4].datos;
  const docentes = docentesPagina?.content;
  if (
    ![grados, cursos, aulas, anios].every(Array.isArray) ||
    !Array.isArray(docentes)
  ) {
    return falloFormato('los catálogos de horarios');
  }
  const docentesNormalizados = docentes
    .filter((docente) => docente.activo !== false)
    .map((docente) => ({
      ...docente,
      nombre: nombreDocente(docente)
    }));
  if (docentesNormalizados.some((docente) => docente.id == null || !docente.nombre)) {
    return falloFormato('la lista de docentes');
  }

  if (
    grados.some((grado) => grado.id === undefined || grado.id === null || !grado.nombre) ||
    cursos.some((curso) => curso.id === undefined || curso.id === null || !curso.nombre) ||
    aulas.some((aula) => aula.id === undefined || aula.id === null || !aula.nombre)
  ) {
    return falloFormato('los catálogos de horarios');
  }

  return {
    exitoso: true,
    datos: {
      grados,
      secciones: [],
      cursos,
      aulas,
      anios,
      docentes: docentesNormalizados,
      bimestres: []
    },
    mensaje: ''
  };
}

export async function listarSeccionesHorario({ gradoId, anioId, anio }) {
  if (USAR_MOCK) {
    const respuesta = await consultarCatalogosMock();
    if (!respuesta.exitoso) return respuesta;
    return {
      ...respuesta,
      datos: respuesta.datos.secciones.filter((seccion) =>
        String(seccion.gradoId) === String(gradoId)
        && Number(seccion.anioAcademico) === Number(anio)
      )
    };
  }

  const respuesta = await solicitar('/secciones', {
    parametros: {
      gradoId: identificadorLong(gradoId),
      anioId: identificadorLong(anioId)
    }
  });
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) return falloFormato('las secciones');

  const secciones = respuesta.datos.map((seccion) => ({
    ...seccion,
    nombre: seccion.nombre ?? seccion.nombreSeccion,
    gradoId: seccion.gradoId ?? seccion.grado?.id,
    anioAcademicoId: seccion.anioAcademicoId ?? seccion.anioId ?? anioId,
    anioAcademico: seccion.anioAcademico ?? seccion.anio ?? anio
  }));
  if (secciones.some((seccion) =>
    seccion.id == null || !seccion.nombre || seccion.gradoId == null
    || seccion.anioAcademicoId == null || seccion.anioAcademico == null
  )) {
    return falloFormato('las secciones');
  }

  return { ...respuesta, datos: secciones };
}

export async function listarAsignaciones({
  gradoId,
  seccionId,
  seccion,
  anioId,
  anioAcademicoId,
  docenteId
}) {
  if (USAR_MOCK) return listarAsignacionesMock({ gradoId, seccion });
  return solicitar('/asignaciones-curso', {
    parametros: {
      gradoId: identificadorLong(gradoId),
      seccionId: identificadorLong(seccionId ?? seccion),
      anioId: identificadorLong(anioId ?? anioAcademicoId),
      docenteId: docenteId == null ? undefined : identificadorLong(docenteId)
    }
  });
}

export async function obtenerAsignacion(id) {
  return solicitar(`/asignaciones-curso/${encodeURIComponent(id)}`);
}

export async function crearAsignacion(datos) {
  const { cursoId, docenteId, seccionId, seccion } = datos;
  if (USAR_MOCK) return crearAsignacionMock(datos);
  return solicitar('/asignaciones-curso', {
    metodo: 'POST',
    cuerpo: {
      cursoId: identificadorLong(cursoId),
      docenteId: identificadorLong(docenteId),
      seccionId: identificadorLong(seccionId ?? seccion)
    }
  });
}

export async function actualizarAsignacion(id, { cursoId, docenteId, seccionId, seccion }) {
  if (USAR_MOCK) return actualizarAsignacionMock(id, { cursoId, docenteId });
  return solicitar(`/asignaciones-curso/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    cuerpo: {
      cursoId: identificadorLong(cursoId),
      docenteId: identificadorLong(docenteId),
      seccionId: identificadorLong(seccionId ?? seccion)
    }
  });
}

export async function eliminarAsignacion(idAsignacion) {
  if (USAR_MOCK) return eliminarAsignacionMock(idAsignacion);
  return solicitar(`/asignaciones-curso/${encodeURIComponent(idAsignacion)}`, { metodo: 'DELETE' });
}

export async function listarBloquesHorario(parametros = {}) {
  return solicitar(BASE_BLOQUES, { parametros });
}

/** Bloques planificados de un docente para el año académico. */
export async function listarBloquesDocente({ docenteId, anioId }) {
  if (USAR_MOCK) return { exitoso: true, datos: [], mensaje: '' };
  return listarBloquesHorario({
    docenteId: identificadorLong(docenteId),
    anioId: identificadorLong(anioId)
  });
}

export async function crearBloqueHorario(datos) {
  return solicitar(BASE_BLOQUES, { metodo: 'POST', cuerpo: datos });
}

export async function obtenerBloqueHorario(id) {
  return solicitar(`${BASE_BLOQUES}/${encodeURIComponent(id)}`);
}

export async function actualizarBloqueHorario(id, datos) {
  return solicitar(`${BASE_BLOQUES}/${encodeURIComponent(id)}`, { metodo: 'PUT', cuerpo: datos });
}

export async function eliminarBloqueHorario(id) {
  return solicitar(`${BASE_BLOQUES}/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}

export async function descargarPlantillaBloquesCsv() {
  return solicitar(`${BASE_BLOQUES}/plantilla-csv`, { respuestaArchivo: true });
}

export async function descargarPlantillaBloques(formato = 'csv') {
  return solicitar(`${BASE_BLOQUES}/plantilla`, {
    parametros: { formato: formato === 'xlsx' ? 'xlsx' : 'csv' },
    respuestaArchivo: true
  });
}

export async function previsualizarCargaMasiva(archivos, anioAcademicoId) {
  const formulario = new FormData();
  for (const archivo of archivos ?? []) {
    formulario.append('files', archivo);
  }
  formulario.append('anioAcademicoId', String(anioAcademicoId));

  const respuesta = await solicitar(`${BASE_BLOQUES}/carga-masiva/preview`, {
    metodo: 'POST',
    cuerpoFormulario: formulario,
    tiempoEsperaMs: 60000
  });
  if (!respuesta.exitoso) return respuesta;
  if (!respuesta.datos || !Array.isArray(respuesta.datos.bloques)) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió una vista previa de carga masiva no válida.'
    };
  }
  return respuesta;
}

function cuerpoConfirmacionCarga({ anioAcademicoId, bloques }) {
  return {
    anioAcademicoId: identificadorLong(anioAcademicoId),
    bloques: (bloques ?? []).map((bloque) => ({
      asignacionCursoId: identificadorLong(bloque.asignacionCursoId),
      aulaId: identificadorLong(bloque.aulaId),
      diaSemana: bloque.diaSemana,
      horaInicio: horaCorta(bloque.horaInicio),
      horaFin: horaCorta(bloque.horaFin),
      origen: bloque.origen
    }))
  };
}

export async function confirmarCargaMasiva({ anioAcademicoId, bloques }) {
  const respuesta = await solicitar(`${BASE_BLOQUES}/carga-masiva/confirmar`, {
    metodo: 'POST',
    cuerpo: cuerpoConfirmacionCarga({ anioAcademicoId, bloques }),
    tiempoEsperaMs: 60000
  });
  if (!respuesta.exitoso) return respuesta;
  if (!respuesta.datos || typeof respuesta.datos.bloquesCreados !== 'number') {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió un resultado de confirmación no válido.'
    };
  }
  return respuesta;
}

/** Inicia la confirmación de bloques como operación asíncrona. */
export async function iniciarConfirmacionCargaMasivaAsync(
  { anioAcademicoId, bloques },
  claveIdempotencia
) {
  if (USAR_MOCK) {
    return {
      exitoso: true,
      datos: { jobId: 'mock-carga-horarios', estado: 'EN_COLA' },
      mensaje: ''
    };
  }

  return solicitar(`${BASE_BLOQUES}/carga-masiva/confirmar/async`, {
    metodo: 'POST',
    cuerpo: cuerpoConfirmacionCarga({ anioAcademicoId, bloques }),
    cabeceras: claveIdempotencia
      ? { 'Idempotency-Key': claveIdempotencia }
      : undefined,
    tiempoEsperaMs: 15000
  });
}

export async function exportarBloques({
  anioId,
  gradoId,
  seccionId,
  docenteId,
  formato = 'csv'
}) {
  return solicitar(`${BASE_BLOQUES}/exportar`, {
    parametros: {
      anioId: identificadorLong(anioId),
      gradoId: identificadorLong(gradoId),
      seccionId: identificadorLong(seccionId),
      docenteId: identificadorLong(docenteId),
      formato: formato === 'xlsx' ? 'xlsx' : 'csv'
    },
    respuestaArchivo: true
  });
}

/** Exporta la grilla actual sin guardarla en la base de datos. */
export async function exportarBorrador({ anioAcademicoId, formato = 'csv', bloques }) {
  return solicitar(`${BASE_BLOQUES}/exportar-borrador`, {
    metodo: 'POST',
    cuerpo: {
      anioAcademicoId: identificadorLong(anioAcademicoId),
      formato: formato === 'xlsx' ? 'xlsx' : 'csv',
      bloques: (bloques ?? []).map((bloque) => ({
        asignacionCursoId: identificadorLong(bloque.asignacionId ?? bloque.asignacionCursoId),
        aulaId: identificadorLong(bloque.aulaId),
        diaSemana: bloque.dia ?? bloque.diaSemana,
        horaInicio: horaCorta(bloque.horaInicio),
        horaFin: horaCorta(bloque.horaFin),
        origen: bloque.origen
      }))
    },
    respuestaArchivo: true
  });
}

export async function cargarBloquesCsv(archivo, anioAcademicoId) {
  const formulario = new FormData();
  formulario.append('file', archivo);
  if (anioAcademicoId !== undefined && anioAcademicoId !== null && anioAcademicoId !== '') {
    formulario.append('anioAcademicoId', String(anioAcademicoId));
  }
  return solicitar(`${BASE_BLOQUES}/carga-masiva`, {
    metodo: 'POST',
    cuerpoFormulario: formulario,
    tiempoEsperaMs: 60000
  });
}

export async function obtenerHorario({ gradoId, seccion, seccionId, anioId, anioAcademicoId }) {
  if (USAR_MOCK) return obtenerHorarioMock({ gradoId, seccion });
  return listarBloquesHorario({
    gradoId: identificadorLong(gradoId),
    seccionId: identificadorLong(seccionId ?? seccion),
    anioId: identificadorLong(anioId ?? anioAcademicoId)
  });
}

export async function listarOcupaciones({ gradoId, seccion, seccionId, anioId, anioAcademicoId }) {
  if (USAR_MOCK) return listarOcupacionesMock({ gradoId, seccion });

  const respuesta = await listarBloquesHorario({
    gradoId: identificadorLong(gradoId),
    anioId: identificadorLong(anioId ?? anioAcademicoId)
  });
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) return falloFormato('los bloques horarios');
  return {
    ...respuesta,
    datos: respuesta.datos
      .filter((bloque) => String(bloque.seccionId) !== String(seccionId ?? seccion))
      .map((bloque) => ({
        dia: bloque.diaSemana,
        horaInicio: horaCorta(bloque.horaInicio),
        horaFin: horaCorta(bloque.horaFin),
        docenteId: bloque.docenteId,
        aulaId: bloque.aulaId,
        seccionNombre: bloque.seccionNombre
      }))
  };
}

/**
 * Reemplaza el horario completo de una sección.
 *
 * El front deja esta llamada preparada; el backend debe implementar
 * `PUT /api/v1/bloques-horario/seccion/{seccionId}` con semántica de estado final.
 */
export async function guardarBloquesHorarioLote({ seccionId, anioAcademicoId, bloques }) {
  if (USAR_MOCK) {
    return guardarBloquesLoteMock({ seccionId, anioAcademicoId, bloques });
  }
  return solicitar(`${BASE_BLOQUES}/seccion/${encodeURIComponent(seccionId)}`, {
    metodo: 'PUT',
    cuerpo: {
      anioAcademicoId: identificadorLong(anioAcademicoId),
      bloques: (bloques ?? []).map(cuerpoBloqueLote)
    },
    tiempoEsperaMs: 60000
  });
}

/**
 * Guarda el estado final completo del horario de la sección usando el endpoint
 * masivo. Los bloques existentes conservan su `id`; los nuevos van sin `id`; los
 * que no se envían se eliminan en el backend.
 */
export async function guardarHorario({
  gradoId,
  seccion,
  seccionId,
  anioId,
  anioAcademicoId,
  bloques
}) {
  const listaBloques = Array.isArray(bloques) ? bloques : Object.values(bloques ?? {});

  if (USAR_MOCK) {
    return guardarHorarioMock({
      gradoId,
      seccion,
      bloques: listaBloques
    });
  }

  return guardarBloquesHorarioLote({
    seccionId: seccionId ?? seccion,
    anioAcademicoId: anioAcademicoId ?? anioId,
    bloques: listaBloques
  });
}

export async function obtenerPeriodoMatricula(anioId) {
  if (USAR_MOCK) return obtenerPeriodoMatriculaMock(anioId);
  return solicitar(`/anios-academicos/${encodeURIComponent(anioId)}/periodo-matricula`);
}

export async function listarSesiones({ seccionId, fechaInicio, fechaFin }) {
  if (USAR_MOCK) return listarSesionesContratoMock({ seccionId, fechaInicio, fechaFin });
  return solicitar(BASE_SESIONES, { parametros: { seccionId, fechaInicio, fechaFin } });
}

export async function previsualizarSesiones(datos) {
  if (USAR_MOCK) {
    return previsualizarSesionesContratoMock({
      ...datos,
      gradoId: datos.gradoId,
      seccion: datos.seccion ?? datos.seccionId
    });
  }
  return solicitar(`${BASE_SESIONES}/preview`, {
    metodo: 'POST',
    cuerpo: {
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      anioAcademicoId: identificadorLong(datos.anioAcademicoId),
      seccionId: identificadorLong(datos.seccionId)
    },
    tiempoEsperaMs: 60000
  });
}

function cuerpoGeneracionSesiones(datos) {
  const sesionesOmitidas = (datos.sesionesOmitidas ?? []).map((omitida) => ({
    bloqueHorarioId: identificadorLong(omitida.bloqueHorarioId),
    fecha: omitida.fecha
  }));
  return {
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    anioAcademicoId: identificadorLong(datos.anioAcademicoId),
    seccionId: identificadorLong(datos.seccionId),
    sesionesOmitidas
  };
}

export async function generarSesiones(datos) {
  if (USAR_MOCK) {
    return generarSesionesContratoMock({
      ...datos,
      sesionesOmitidas: cuerpoGeneracionSesiones(datos).sesionesOmitidas
    });
  }
  return solicitar(`${BASE_SESIONES}/generar`, {
    metodo: 'POST',
    cuerpo: cuerpoGeneracionSesiones(datos),
    tiempoEsperaMs: 60000
  });
}

/** Inicia la generación de sesiones como operación asíncrona. */
export async function iniciarGeneracionSesionesAsync(datos, claveIdempotencia) {
  if (USAR_MOCK) {
    return {
      exitoso: true,
      datos: { jobId: 'mock-generar-sesiones', estado: 'EN_COLA' },
      mensaje: ''
    };
  }

  return solicitar(`${BASE_SESIONES}/generar/async`, {
    metodo: 'POST',
    cuerpo: cuerpoGeneracionSesiones(datos),
    cabeceras: claveIdempotencia
      ? { 'Idempotency-Key': claveIdempotencia }
      : undefined,
    tiempoEsperaMs: 15000
  });
}

export async function listarSesionesDocente(docenteId, parametros) {
  return solicitar(`${BASE_SESIONES}/docente/${encodeURIComponent(docenteId)}`, { parametros });
}

export async function miHorarioSesionesDocente(parametros) {
  return solicitar(`${BASE_SESIONES}/mi-horario/docente`, { parametros });
}

export async function miHorarioSesionesEstudiante(parametros) {
  return solicitar(`${BASE_SESIONES}/mi-horario/estudiante`, { parametros });
}

export async function listarSesionesApoderado(estudianteId, parametros) {
  return solicitar(`${BASE_SESIONES}/apoderado/${encodeURIComponent(estudianteId)}`, { parametros });
}

export async function obtenerSesion(id) {
  return solicitar(`${BASE_SESIONES}/${encodeURIComponent(id)}`);
}
