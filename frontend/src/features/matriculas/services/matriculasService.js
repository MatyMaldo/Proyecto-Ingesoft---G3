import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  contarMatriculasPorEstadoMock,
  listarMatriculasMock,
  obtenerAlumnosMock
} from './mocks/matriculasMock.js';
import { consultarEstructura } from '../../grados-secciones/services/gradosSeccionesService.js';

const matriculasCreadasEnSesion = new Map();
let siguienteIdMock = 1;
let siguienteCompromisoMock = 1;
const TIEMPO_ESPERA_ACCION_MS = 60000;

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

/**
 * Estructura para el modal de asignación: años con período de matrícula
 * VIGENTE y grados disponibles. No reemplaza a `obtenerEstructuraMatricula`,
 * que conserva su comportamiento para otros consumidores.
 */
export async function obtenerEstructuraMatriculaVigente() {
  if (USAR_MOCK) {
    const respuesta = await consultarEstructura();
    if (!respuesta.exitoso) return respuesta;
    return {
      ...respuesta,
      datos: {
        anios: respuesta.datos.anios.map((anio) => ({
          ...anio,
          estadoPeriodo: 'VIGENTE'
        })),
        grados: respuesta.datos.grados
      }
    };
  }

  const [respuestaAnios, respuestaGrados] = await Promise.all([
    solicitar('/anios-academicos'),
    solicitar('/grados')
  ]);
  const error = [respuestaAnios, respuestaGrados].find((respuesta) => !respuesta.exitoso);
  if (error) return error;
  if (!Array.isArray(respuestaAnios.datos) || !Array.isArray(respuestaGrados.datos)) {
    return falloFormato('la estructura de matrícula');
  }

  const periodos = await Promise.all(
    respuestaAnios.datos.map(async (anio) => {
      const respuestaPeriodo = await obtenerPeriodoMatricula(anio.id);
      return respuestaPeriodo.exitoso && respuestaPeriodo.datos?.estado === 'VIGENTE'
        ? { ...anio, estadoPeriodo: respuestaPeriodo.datos.estado }
        : null;
    })
  );

  const aniosVigentes = periodos.filter(Boolean);
  if (aniosVigentes.length === 0) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No hay años académicos con período de matrícula vigente.'
    };
  }

  return {
    exitoso: true,
    datos: { anios: aniosVigentes, grados: respuestaGrados.datos },
    mensaje: ''
  };
}

function numeroOpcional(valor) {
  if (valor === '' || valor === undefined || valor === null) return undefined;
  return Number(valor);
}

/** Estructura completa para los filtros del listado administrativo. */
export async function obtenerEstructuraListadoMatriculas() {
  if (USAR_MOCK) {
    const respuesta = await consultarEstructura();
    if (!respuesta.exitoso) return respuesta;
    return {
      ...respuesta,
      datos: { anios: respuesta.datos.anios, grados: respuesta.datos.grados }
    };
  }

  const [respuestaAnios, respuestaGrados] = await Promise.all([
    solicitar('/anios-academicos'),
    solicitar('/grados')
  ]);
  const error = [respuestaAnios, respuestaGrados].find((respuesta) => !respuesta.exitoso);
  if (error) return error;
  if (!Array.isArray(respuestaAnios.datos) || !Array.isArray(respuestaGrados.datos)) {
    return falloFormato('la estructura del listado de matrículas');
  }
  return {
    exitoso: true,
    datos: { anios: respuestaAnios.datos, grados: respuestaGrados.datos },
    mensaje: ''
  };
}

/**
 * Listado administrativo paginado de matrículas.
 * El backend ordena por fechaAsignacion DESC e id DESC. `busqueda` filtra por nombre o código del estudiante.
 */
export async function listarMatriculas({
  anioId,
  gradoId,
  seccionId,
  estado,
  estudianteId,
  busqueda,
  page = 0,
  size = 10
} = {}) {
  if (USAR_MOCK) {
    return listarMatriculasMock({ anioId, gradoId, seccionId, estado, estudianteId, busqueda, page, size });
  }

  const respuesta = await solicitar('/matriculas', {
    parametros: {
      anioId: numeroOpcional(anioId),
      gradoId: numeroOpcional(gradoId),
      seccionId: numeroOpcional(seccionId),
      estado: estado || undefined,
      estudianteId: numeroOpcional(estudianteId),
      busqueda: busqueda?.trim() || undefined,
      page,
      size
    }
  });
  if (!respuesta.exitoso) return respuesta;

  const datos = respuesta.datos;
  if (
    !datos ||
    !Array.isArray(datos.content) ||
    typeof datos.totalElements !== 'number' ||
    typeof datos.totalPages !== 'number' ||
    typeof datos.number !== 'number'
  ) {
    return falloFormato('el listado de matrículas');
  }
  return respuesta;
}

/**
 * Cantidad de matrículas por estado con los filtros del listado (año, grado, sección y búsqueda; el estado no
 * filtra este conteo). Alimenta los contadores de los chips de estado.
 *
 * @returns {Promise<{ exitoso: boolean, datos: { total: number, pendientes: number, confirmadas: number,
 *   canceladas: number }|null, mensaje: string }>}
 */
export async function contarMatriculasPorEstado({ anioId, gradoId, seccionId, busqueda } = {}) {
  if (USAR_MOCK) {
    return contarMatriculasPorEstadoMock({ anioId, gradoId, seccionId, busqueda });
  }

  const respuesta = await solicitar('/matriculas/conteo-por-estado', {
    parametros: {
      anioId: numeroOpcional(anioId),
      gradoId: numeroOpcional(gradoId),
      seccionId: numeroOpcional(seccionId),
      busqueda: busqueda?.trim() || undefined
    }
  });
  if (!respuesta.exitoso) return respuesta;

  const datos = respuesta.datos;
  const camposNumericos = ['total', 'pendientes', 'confirmadas', 'canceladas'];
  if (!datos || camposNumericos.some((campo) => typeof datos[campo] !== 'number')) {
    return falloFormato('el conteo de matrículas por estado');
  }
  return respuesta;
}

/** Estado del período de matrícula del año seleccionado. */
export async function obtenerPeriodoMatricula(anioId) {
  if (USAR_MOCK) {
    return {
      exitoso: true,
      datos: { anioAcademicoId: Number(anioId), estado: 'FINALIZADO' },
      mensaje: ''
    };
  }

  const respuesta = await solicitar(
    `/anios-academicos/${encodeURIComponent(anioId)}/periodo-matricula`
  );
  if (!respuesta.exitoso) return respuesta;
  if (!respuesta.datos || typeof respuesta.datos.estado !== 'string') {
    return falloFormato('el período de matrícula');
  }
  return respuesta;
}

/**
 * Cancela las matrículas pendientes de períodos vencidos.
 * Es idempotente y no modifica matrículas confirmadas ni pagos.
 */
export async function cancelarPendientesPorPeriodo() {  if (USAR_MOCK) {
    return { exitoso: true, datos: { matriculasCanceladas: 0 }, mensaje: '' };
  }

  const respuesta = await solicitar('/matriculas/cancelar-pendientes-por-periodo', {
    metodo: 'POST',
    tiempoEsperaMs: TIEMPO_ESPERA_ACCION_MS
  });
  if (!respuesta.exitoso) return respuesta;
  if (!respuesta.datos || typeof respuesta.datos.matriculasCanceladas !== 'number') {
    return falloFormato('la cancelación de matrículas pendientes');
  }
  return respuesta;
}

export async function obtenerSeccionesMatricula(gradoId, anioId) {  if (USAR_MOCK) {
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

/**
 * Emite el compromiso de una matrícula.
 *
 * Acepta `{ matriculaId }` (flujo nuevo desde el listado) o el `estudianteId`
 * de una matrícula creada durante la sesión (flujo anterior).
 */
export async function emitirCompromisoMatricula(entrada) {
  const esObjeto = entrada !== null && typeof entrada === 'object';
  const matriculaSesion = esObjeto ? null : matriculasCreadasEnSesion.get(String(entrada));
  const matriculaId = esObjeto
    ? entrada.matriculaId ?? entrada.id
    : matriculaSesion?.id;

  if (matriculaId === undefined || matriculaId === null || matriculaId === '') {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No hay una matrícula creada en esta sesión para este estudiante.'
    };
  }

  if (USAR_MOCK) {
    const datos = {
      id: siguienteCompromisoMock++,
      tipoCompromiso: 'MATRICULA',
      fechaEmision: new Date().toISOString().slice(0, 10),
      montoOriginal: 350,
      montoMora: 0,
      montoTotal: 350,
      estado: 'PENDIENTE',
      matriculaId: Number(matriculaId),
      estudianteId: esObjeto ? entrada.estudianteId ?? null : matriculaSesion?.estudianteId ?? null,
      nombreCompletoEstudiante: esObjeto
        ? entrada.nombreCompletoEstudiante ?? ''
        : matriculaSesion?.nombreCompletoEstudiante ?? '',
      nombreCompletoApoderado: ''
    };
    if (!esObjeto) matriculasCreadasEnSesion.delete(String(entrada));
    return { exitoso: true, datos, mensaje: '' };
  }

  const respuesta = await solicitar('/compromisos-pago/matricula', {
    metodo: 'POST',
    cuerpo: { matriculaId: Number(matriculaId) }
  });
  if (respuesta.exitoso && !esObjeto) {
    matriculasCreadasEnSesion.delete(String(entrada));
  }
  return respuesta;
}

/**
 * Emisión masiva de compromisos de matrícula para un año académico.
 * El backend procesa solo matrículas PENDIENTE y reporta emitidos,
 * omitidos y errores por matrícula.
 */
export async function emitirCompromisosMatriculaLote(anioId) {
  if (USAR_MOCK) {
    return {
      exitoso: true,
      datos: { emitidos: 0, omitidos: 0, errores: [] },
      mensaje: ''
    };
  }

  const respuesta = await solicitar('/compromisos-pago/matricula/lote', {
    metodo: 'POST',
    cuerpo: { anioId: Number(anioId) },
    tiempoEsperaMs: TIEMPO_ESPERA_ACCION_MS
  });
  if (!respuesta.exitoso) return respuesta;

  const datos = respuesta.datos;
  if (
    !datos ||
    typeof datos.emitidos !== 'number' ||
    typeof datos.omitidos !== 'number' ||
    !Array.isArray(datos.errores)
  ) {
    return falloFormato('la emisión masiva de compromisos de matrícula');
  }
  return respuesta;
}

/** Inicia la emisión masiva como operación asíncrona. Devuelve un jobId. */
export async function iniciarEmisionMatriculasLoteAsync(anioId, claveIdempotencia) {
  if (USAR_MOCK) {
    return {
      exitoso: true,
      datos: { jobId: 'mock-matricula-lote', estado: 'EN_COLA' },
      mensaje: ''
    };
  }

  return solicitar('/compromisos-pago/matricula/lote/async', {
    metodo: 'POST',
    cuerpo: { anioId: Number(anioId) },
    cabeceras: claveIdempotencia
      ? { 'Idempotency-Key': claveIdempotencia }
      : undefined,
    tiempoEsperaMs: 15000
  });
}
