import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { FRANJAS } from '../constants/horarios.js';
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
  guardarHorarioMock
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

function cuerpoBloque({ dia, franjaId, asignacionId, aulaId }) {
  const franja = FRANJAS.find((elemento) => elemento.id === franjaId);
  return {
    asignacionCursoId: identificadorLong(asignacionId),
    aulaId: identificadorLong(aulaId),
    diaSemana: dia,
    horaInicio: franja?.inicio,
    horaFin: franja?.fin
  };
}

export async function consultarCatalogos() {
  if (USAR_MOCK) return consultarCatalogosMock();

  const endpoints = ['/grados', '/secciones', '/cursos', '/aulas', '/anios-academicos', '/usuarios'];
  const solicitudes = [
    ...endpoints.slice(0, 5).map((endpoint) => () => solicitar(endpoint)),
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

  const [grados, secciones, cursos, aulas, anios] = respuestas.slice(0, 5).map(
    (respuesta) => respuesta.datos
  );
  const docentesPagina = respuestas[5].datos;
  const docentes = docentesPagina?.content;
  if (
    ![grados, secciones, cursos, aulas, anios].every(Array.isArray) ||
    !Array.isArray(docentes)
  ) {
    return falloFormato('los catálogos de horarios');
  }
  const docentesNormalizados = docentes
    .filter((docente) => docente.activo !== false)
    .map((docente) => ({
      ...docente,
      nombre: docente.nombreCompleto ?? docente.nombre ?? ''
    }));
  if (docentesNormalizados.some((docente) => docente.id == null || !docente.nombre)) {
    return falloFormato('la lista de docentes');
  }

  const seccionesNormalizadas = secciones.map((seccion) => {
    const anioRelacionado = anios.find((anio) =>
      String(anio.id) === String(seccion.anioAcademicoId ?? seccion.anioId)
      || String(anio.anio) === String(seccion.anioAcademico ?? seccion.anio)
    );
    return {
      ...seccion,
      id: seccion.id,
      nombre: seccion.nombre ?? seccion.nombreSeccion,
      gradoId: seccion.gradoId ?? seccion.grado?.id,
      anioAcademicoId: seccion.anioAcademicoId ?? seccion.anioId ?? anioRelacionado?.id,
      anioAcademico: seccion.anioAcademico ?? seccion.anio ?? anioRelacionado?.anio
    };
  });

  if (
    grados.some((grado) => grado.id === undefined || grado.id === null || !grado.nombre) ||
    seccionesNormalizadas.some((seccion) =>
      seccion.id === undefined || seccion.id === null || !seccion.nombre
      || seccion.gradoId === undefined || seccion.gradoId === null
    ) ||
    cursos.some((curso) => curso.id === undefined || curso.id === null || !curso.nombre) ||
    aulas.some((aula) => aula.id === undefined || aula.id === null || !aula.nombre)
  ) {
    return falloFormato('los catálogos de horarios');
  }

  return {
    exitoso: true,
    datos: {
      grados,
      secciones: seccionesNormalizadas,
      cursos,
      aulas,
      anios,
      docentes: docentesNormalizados,
      bimestres: []
    },
    mensaje: ''
  };
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

export async function actualizarAsignacion(id, { cursoId, docenteId }) {
  if (USAR_MOCK) return actualizarAsignacionMock(id, { cursoId, docenteId });
  return solicitar(`/asignaciones-curso/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    cuerpo: {
      cursoId: identificadorLong(cursoId),
      docenteId: identificadorLong(docenteId)
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

export async function cargarBloquesCsv(archivo, anioAcademicoId) {
  const formulario = new FormData();
  formulario.append('file', archivo);
  if (anioAcademicoId !== undefined && anioAcademicoId !== null) {
    formulario.append('anioAcademicoId', String(anioAcademicoId));
  }
  return solicitar(`${BASE_BLOQUES}/carga-masiva`, {
    metodo: 'POST',
    cuerpoFormulario: formulario
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

export async function listarOcupaciones({ gradoId, seccion, anioId, anioAcademicoId }) {
  if (USAR_MOCK) return listarOcupacionesMock({ gradoId, seccion });

  const respuesta = await listarBloquesHorario({
    gradoId: identificadorLong(gradoId),
    anioId: identificadorLong(anioId ?? anioAcademicoId)
  });
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos)) return falloFormato('los bloques horarios');
  return {
    ...respuesta,
    datos: (respuesta.datos ?? [])
      .filter((bloque) => String(bloque.seccionId) !== String(seccion))
      .map((bloque) => ({
        dia: bloque.diaSemana,
        franjaId: FRANJAS.find(
          (franja) => franja.inicio === bloque.horaInicio?.slice(0, 5)
            && franja.fin === bloque.horaFin?.slice(0, 5)
        )?.id,
        docenteId: bloque.docenteId,
        aulaId: bloque.aulaId,
        seccionNombre: bloque.seccionNombre
      }))
  };
}

/**
 * Guarda el diferencial entre el horario actual y el último cargado usando las operaciones CRUD
 * individuales del contrato. Si una operación falla, se detiene y la pantalla vuelve a consultar
 * el estado persistido antes de permitir otro intento.
 */
export async function guardarHorario({ gradoId, seccion, bloques, bloquesGuardados }) {
  if (USAR_MOCK) {
    const serializados = Object.entries(bloques).map(([clave, bloque]) => {
      const [dia, franjaId] = clave.split('|');
      return { dia, franjaId, asignacionId: bloque.asignacionId, aulaId: bloque.aulaId };
    });
    return guardarHorarioMock({ gradoId, seccion, bloques: serializados });
  }

  const operaciones = [];
  for (const [clave, guardado] of Object.entries(bloquesGuardados)) {
    const actual = bloques[clave];
    if (!actual) {
      operaciones.push(() => eliminarBloqueHorario(guardado.id));
    } else if (
      actual.asignacionId !== guardado.asignacionId ||
      actual.aulaId !== guardado.aulaId
    ) {
      const [dia, franjaId] = clave.split('|');
      operaciones.push(() => actualizarBloqueHorario(guardado.id, cuerpoBloque({
        dia, franjaId, ...actual
      })));
    }
  }

  for (const [clave, actual] of Object.entries(bloques)) {
    if (bloquesGuardados[clave]) continue;
    const [dia, franjaId] = clave.split('|');
    operaciones.push(() => crearBloqueHorario(cuerpoBloque({ dia, franjaId, ...actual })));
  }

  for (const ejecutar of operaciones) {
    const resultado = await ejecutar();
    if (!resultado.exitoso) return resultado;
  }
  return { exitoso: true, datos: null, mensaje: '' };
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
    }
  });
}

export async function generarSesiones(datos) {
  if (USAR_MOCK) return generarSesionesContratoMock(datos);
  return solicitar(`${BASE_SESIONES}/generar`, {
    metodo: 'POST',
    cuerpo: {
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      anioAcademicoId: identificadorLong(datos.anioAcademicoId),
      seccionId: identificadorLong(datos.seccionId),
      sesionesOmitidas: datos.sesionesOmitidas ?? []
    }
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
