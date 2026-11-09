import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  emitirCompromisoPensionMock,
  emitirCompromisosPensionLoteMock,
  listarPagosAgrupadosMock,
  obtenerAlumnosMatriculadosMock,
  obtenerAnioAcademicoMock,
  obtenerGradosMock,
  obtenerPagoAdminMock,
  obtenerPeriodoMatriculaMock,
  obtenerSeccionesMock,
  rechazarPagoAdminMock,
  validarPagoAdminMock
} from './mocks/pagosMock.js';

export const TAMANIO_PAGOS = 15
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

// Obtener alumnos
export async function obtenerAlumnos(filtros = {}) {
  // Mocks aun no se implemenan
  if (USAR_MOCK) return null;

  const respuesta = await solicitar('/usuarios', {
    parametros: { tipoUsuario: 'ESTUDIANTE', activo: true, page: 0, size: 20 }
  });
  if (!respuesta.exitoso) return respuesta;

  const estudiantes = respuesta.datos?.content;
  if (!Array.isArray(estudiantes)) return falloFormato('la búsqueda de estudiantes');

  const termino = normalizarTexto(filtros.busqueda);
  return {
    ...respuesta,
    datos: {
      estudiantes: estudiantes
        .map((estudiante) => ({
          ...estudiante,
          nombre: estudiante.nombreCompleto ?? estudiante.nombre ?? ''
        }))
        .filter((estudiante) => !termino
          || [estudiante.nombre, estudiante.dni, estudiante.codigo]
            .some((valor) => normalizarTexto(valor).includes(termino)))
    }
  };
}

/**
 * Alumnos con matrícula pendiente o confirmada del año. Se usan para la tabla
 * porque `/pagos/admin` exige el grado y la sección de cada estudiante.
 * Se excluyen las matrículas canceladas.
 */
export async function obtenerAlumnosMatriculados(anioId, filtros = {}) {
  if (USAR_MOCK) return obtenerAlumnosMatriculadosMock(anioId, filtros);

  const parametros = {
    anioId: Number(anioId),
    page: 0,
    size: 100
  };
  if (filtros.gradoId !== null && filtros.gradoId !== undefined && filtros.gradoId !== '') {
    parametros.gradoId = Number(filtros.gradoId);
  }
  if (filtros.seccionId !== null && filtros.seccionId !== undefined && filtros.seccionId !== '') {
    parametros.seccionId = Number(filtros.seccionId);
  }

  const respuesta = await solicitar('/matriculas', { parametros });
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos?.content)) {
    return falloFormato('los alumnos matriculados');
  }

  return {
    exitoso: true,
    datos: {
      estudiantes: respuesta.datos.content
        .filter((matricula) => String(matricula.estado ?? '').toUpperCase() !== 'CANCELADA')
        .map((matricula) => ({
          id: matricula.estudianteId,
          matriculaId: matricula.id,
          nombre: matricula.nombreCompletoEstudiante,
          codigo: matricula.codigoEstudiante,
          estadoMatricula: matricula.estado,
          anioAcademicoId: matricula.anioAcademicoId,
          anioAcademico: matricula.anioAcademico,
          gradoId: matricula.gradoId,
          gradoNombre: matricula.gradoNombre,
          seccionId: matricula.seccionId,
          seccionNombre: matricula.seccionNombre
        }))
    },
    mensaje: ''
  };
}

// Obtener anio académico
export async function obtenerAnioAcademico() {
  if (USAR_MOCK) return obtenerAnioAcademicoMock();

  const [respuestaAnios] = await Promise.all([
    solicitar('/anios-academicos')
  ]);
  const error = [respuestaAnios].find((respuesta) => !respuesta.exitoso);
  if (error) return error;
  if (!respuestaAnios.datos) {
    return {
      exitoso: false,
      datos: null,
      mensaje: respuestaAnios.mensaje || 'No existe un año académico vigente.'
    };
  }
  return {
    exitoso: true,
    datos: { anios: respuestaAnios.datos },
    mensaje: ''
  };
}

/** Grados disponibles para filtrar el listado de pagos. */
export async function obtenerGrados() {
  if (USAR_MOCK) return obtenerGradosMock();

  const respuesta = await solicitar('/grados');
  if (!respuesta.exitoso) return respuesta;
  return Array.isArray(respuesta.datos) ? respuesta : falloFormato('los grados');
}

/** Secciones de un grado en el año académico seleccionado. */
export async function obtenerSecciones(gradoId, anioId) {
  if (USAR_MOCK) return obtenerSeccionesMock(gradoId, anioId);

  const respuesta = await solicitar('/secciones', {
    parametros: {
      gradoId: Number(gradoId),
      anioId: Number(anioId)
    }
  });
  if (!respuesta.exitoso) return respuesta;
  return Array.isArray(respuesta.datos) ? respuesta : falloFormato('las secciones');
}

// Emitir compromiso de pago de pension


export async function emitirCompromisoPension({estudianteId,anioId,mes}) {
  if (USAR_MOCK) return emitirCompromisoPensionMock();

  const respuesta = await solicitar('/compromisos-pago/pension', {
    metodo: 'POST',
    cuerpo: { 
      estudianteId: Number(estudianteId),
      anioId: Number(anioId),
      mes: mes
    },
    tiempoEsperaMs: TIEMPO_ESPERA_ACCION_MS
  });
  if(!respuesta) return { exitoso: false, datos: null, mensaje: '' };
  return respuesta;
}

/**
 * Emisión masiva de compromisos de pensión para un año y mes.
 * Los filtros de grado y sección son opcionales.
 */
export async function emitirCompromisosPensionLote({ anioId, mes, gradoId, seccionId } = {}) {
  if (USAR_MOCK) return emitirCompromisosPensionLoteMock();

  const cuerpo = {
    anioId: Number(anioId),
    mes
  };
  if (gradoId !== null && gradoId !== undefined && gradoId !== '') {
    cuerpo.gradoId = Number(gradoId);
  }
  if (seccionId !== null && seccionId !== undefined && seccionId !== '') {
    cuerpo.seccionId = Number(seccionId);
  }

  const respuesta = await solicitar('/compromisos-pago/pension/lote', {
    metodo: 'POST',
    cuerpo,
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
    return falloFormato('la emisión masiva de compromisos de pensión');
  }
  return respuesta;
}

const validarPaginaPagos = (respuesta) => {
  if (!respuesta.exitoso) return respuesta;
  const datos = respuesta.datos;
  if (
    !datos ||
    !Array.isArray(datos.content) ||
    typeof datos.totalElements !== 'number' ||
    typeof datos.totalPages !== 'number' ||
    typeof datos.number !== 'number'
  ) {
    return falloFormato('el listado de pagos');
  }
  return respuesta;
};

export async function listarPagosAdmin({
  anioAcademicoId,
  gradoId,
  seccionId,
  estudianteId,
  estado,
  tipoCompromiso,
  page = 0,
  size = 10
}) {
  const respuesta = await solicitar('/pagos/admin', {
    parametros: {
      anioAcademicoId: Number(anioAcademicoId),
      gradoId: Number(gradoId),
      seccionId: Number(seccionId),
      estudianteId: estudianteId == null ? undefined : Number(estudianteId),
      estado: estado || undefined,
      tipoCompromiso: tipoCompromiso || undefined,
      page,
      size,
      sortBy: 'fechaRegistro'
    }
  });
  return validarPaginaPagos(respuesta);
}

export async function listarPagosAgrupados({
  anioAcademicoId,
  gradoId,
  seccionId,
  estudianteId,
  estadoCompromiso,
  tipoCompromiso,
  page = 0,
  size = 10
}) {
  if (USAR_MOCK) return listarPagosAgrupadosMock({ page, size });

  const respuesta = await solicitar('/pagos/admin/agrupados', {
    parametros: {
      anioAcademicoId: Number(anioAcademicoId),
      gradoId: Number(gradoId),
      seccionId: Number(seccionId),
      estudianteId: estudianteId == null ? undefined : Number(estudianteId),
      estadoCompromiso: estadoCompromiso || undefined,
      tipoCompromiso: tipoCompromiso || undefined,
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
    return falloFormato('los pagos agrupados por compromiso');
  }
  if (datos.content.some((compromiso) =>
    compromiso.compromisoId == null || !Array.isArray(compromiso.pagos)
  )) {
    return falloFormato('los pagos agrupados por compromiso');
  }
  return respuesta;
}

export async function obtenerPagoAdmin(pagoId) {
  if (USAR_MOCK) return obtenerPagoAdminMock(pagoId);
  return solicitar(`/pagos/admin/${encodeURIComponent(pagoId)}`);
}

/** Estado del período de matrícula del año, usado para habilitar correcciones. */
export async function obtenerPeriodoMatricula(anioId) {
  if (USAR_MOCK) return obtenerPeriodoMatriculaMock(anioId);
  const respuesta = await solicitar(
    `/anios-academicos/${encodeURIComponent(anioId)}/periodo-matricula`
  );
  if (!respuesta.exitoso) return respuesta;
  const datos = respuesta.datos;
  if (!datos || typeof datos.estado !== 'string') {
    return falloFormato('el período de matrícula');
  }
  return respuesta;
}

export async function validarPagoAdmin(pagoId) {
  if (USAR_MOCK) return validarPagoAdminMock();
  return solicitar(`/pagos/admin/${encodeURIComponent(pagoId)}/validar`, {
    metodo: 'PUT',
    cuerpo: {},
    tiempoEsperaMs: TIEMPO_ESPERA_ACCION_MS
  });
}

export async function rechazarPagoAdmin(pagoId, motivo) {
  if (USAR_MOCK) return rechazarPagoAdminMock();
  return solicitar(`/pagos/admin/${encodeURIComponent(pagoId)}/rechazar`, {
    metodo: 'PUT',
    cuerpo: { motivo: motivo.trim() },
    tiempoEsperaMs: TIEMPO_ESPERA_ACCION_MS
  });
}
