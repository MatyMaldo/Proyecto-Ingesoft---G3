import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { obtenerAlumnosMock } from './mocks/matriculasMock.js';
import { consultarEstructura } from '../../grados-secciones/services/gradosSeccionesService.js';

const matriculasCreadasEnSesion = new Map();
let siguienteIdMock = 1;
let siguienteCompromisoMock = 1;

const falloFormato = (recurso) => ({
  exitoso: false,
  datos: null,
  mensaje: `El backend devolvió un formato de ${recurso} no válido.`
});

const normalizarTexto = (texto) => String(texto ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es')
  .trim();

/**
 * Busca estudiantes activos en la primera página contractual y filtra por nombre, DNI o código.
 *
 * @param {{ busqueda?: string }} filtros
 * @returns {Promise<{ exitoso: boolean, datos: Array|null, mensaje: string }>}
 */
export async function obtenerAlumnos(filtros = {}) {
  if (USAR_MOCK) return obtenerAlumnosMock(filtros);

  const respuesta = await solicitar('/usuarios', {
    parametros: { tipoUsuario: 'ESTUDIANTE', activo: true, page: 0, size: 20 }
  });
  if (!respuesta.exitoso) return respuesta;

  const estudiantes = respuesta.datos?.content;
  if (!Array.isArray(estudiantes)) return falloFormato('la búsqueda de estudiantes');

  const termino = normalizarTexto(filtros.busqueda);
  return {
    ...respuesta,
    datos: estudiantes
      .map((estudiante) => ({
        ...estudiante,
        nombre: estudiante.nombreCompleto ?? estudiante.nombre ?? ''
      }))
      .filter((estudiante) => !termino
        || [estudiante.nombre, estudiante.dni, estudiante.codigo]
          .some((valor) => normalizarTexto(valor).includes(termino)))
  };
}

export async function obtenerEstructuraMatricula() {
  if (USAR_MOCK) {
    const respuesta = await consultarEstructura();
    if (!respuesta.exitoso) return respuesta;
    return {
      ...respuesta,
      datos: { anios: respuesta.datos.anios, grados: respuesta.datos.grados }
    };
  }

  const [respuestaAnios, respuestaGrados] = await Promise.all([
    solicitar('/anios-academicos/con-periodo-matricula-vigente'),
    solicitar('/grados')
  ]);
  const error = [respuestaAnios, respuestaGrados].find((respuesta) => !respuesta.exitoso);
  if (error) return error;
  if (!respuestaAnios.datos) {
    return {
      exitoso: false,
      datos: null,
      mensaje: respuestaAnios.mensaje || 'No existe un año académico futuro con período de matrícula vigente.'
    };
  }
  if (!Array.isArray(respuestaGrados.datos)) {
    return falloFormato('la estructura de matrícula');
  }
  return {
    exitoso: true,
    datos: { anios: [respuestaAnios.datos], grados: respuestaGrados.datos },
    mensaje: ''
  };
}

export async function obtenerSeccionesMatricula(gradoId, anioId) {
  if (USAR_MOCK) {
    const respuesta = await consultarEstructura();
    if (!respuesta.exitoso) return respuesta;
    return {
      ...respuesta,
      datos: respuesta.datos.secciones.filter((seccion) => String(seccion.gradoId) === String(gradoId)
        && String(seccion.anioAcademicoId) === String(anioId))
    };
  }

  const respuesta = await solicitar('/secciones', {
    parametros: { gradoId, anioId }
  });
  if (!respuesta.exitoso) return respuesta;
  return Array.isArray(respuesta.datos) ? respuesta : falloFormato('las secciones disponibles');
}

export async function crearMatricula(asignacion) {
  if (USAR_MOCK) {
    const datos = {
      id: siguienteIdMock++,
      fechaAsignacion: new Date().toISOString().slice(0, 10),
      estado: 'PENDIENTE',
      estudianteId: asignacion.alumno.id,
      nombreCompletoEstudiante: asignacion.alumno.nombre,
      codigoEstudiante: asignacion.alumno.codigo,
      seccionId: asignacion.seccion.id,
      nombreSeccion: asignacion.seccion.nombre,
      nombreGrado: asignacion.grado.nombre,
      anioAcademico: asignacion.seccion.anioAcademico
    };
    matriculasCreadasEnSesion.set(String(datos.estudianteId), datos);
    return { exitoso: true, datos, mensaje: '' };
  }

  const respuesta = await solicitar('/matriculas', {
    metodo: 'POST',
    sinVersionApi: true,
    cuerpo: {
      estudianteId: Number(asignacion.alumno.id),
      seccionId: Number(asignacion.seccion.id)
    }
  });
  if (respuesta.exitoso && respuesta.datos?.id != null) {
    matriculasCreadasEnSesion.set(String(respuesta.datos.estudianteId), respuesta.datos);
  }
  return respuesta;
}

export async function emitirCompromisoMatricula(estudianteId) {
  if (USAR_MOCK) {
    const matricula = matriculasCreadasEnSesion.get(String(estudianteId));
    if (!matricula) {
      return { exitoso: false, datos: null, mensaje: 'No hay matrícula pendiente para este estudiante en esta sesión.' };
    }
    const datos = {
      id: siguienteCompromisoMock++,
      tipoCompromiso: 'MATRICULA',
      fechaEmision: new Date().toISOString().slice(0, 10),
      montoOriginal: 350,
      montoMora: 0,
      montoTotal: 350,
      estado: 'PENDIENTE',
      matriculaId: matricula.id,
      estudianteId: matricula.estudianteId,
      nombreCompletoEstudiante: matricula.nombreCompletoEstudiante,
      nombreCompletoApoderado: ''
    };
    matriculasCreadasEnSesion.delete(String(estudianteId));
    return { exitoso: true, datos, mensaje: '' };
  }

  const matricula = matriculasCreadasEnSesion.get(String(estudianteId));
  if (!matricula) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No hay una matrícula creada en esta sesión para este estudiante. El backend aún no permite consultar matrículas existentes.'
    };
  }

  const respuesta = await solicitar('/compromisos-pago/matricula', {
    metodo: 'POST',
    sinVersionApi: true,
    cuerpo: { matriculaId: Number(matricula.id) }
  });
  if (respuesta.exitoso) matriculasCreadasEnSesion.delete(String(estudianteId));
  return respuesta;
}
