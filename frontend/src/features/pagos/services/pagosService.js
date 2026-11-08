import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

export const TAMANIO_PAGOS = 15

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
 * Alumnos con matrícula confirmada del año. Se usan para la tabla porque
 * `/pagos/admin` exige el grado y la sección de cada estudiante.
 */
export async function obtenerAlumnosMatriculados(anioId) {
  if (USAR_MOCK) return { exitoso: true, datos: { estudiantes: [] }, mensaje: '' };

  const respuesta = await solicitar('/matriculas', {
    parametros: {
      anioId: Number(anioId),
      estado: 'CONFIRMADA',
      page: 0,
      size: 100
    }
  });
  if (!respuesta.exitoso) return respuesta;
  if (!Array.isArray(respuesta.datos?.content)) {
    return falloFormato('los alumnos matriculados');
  }

  return {
    exitoso: true,
    datos: {
      estudiantes: respuesta.datos.content.map((matricula) => ({
        id: matricula.estudianteId,
        matriculaId: matricula.id,
        nombre: matricula.nombreCompletoEstudiante,
        codigo: matricula.codigoEstudiante,
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
  if (USAR_MOCK) {
    return null;
  }

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

// Emitir compromiso de pago de pension


export async function emitirCompromisoPension({estudianteId,anioId,mes}) {
  if (USAR_MOCK) {
    return { exitoso: false, datos, mensaje: '' }; // Moccks no implementados
  }

  const respuesta = await solicitar('/compromisos-pago/pension', {
    metodo: 'POST',
    cuerpo: { 
      estudianteId: Number(estudianteId),
      anioId: Number(anioId),
      mes: mes
    }
  });
  if(!respuesta) return { exitoso: false, datos: null, mensaje: '' };
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
  return solicitar(`/pagos/admin/${encodeURIComponent(pagoId)}`);
}

export async function validarPagoAdmin(pagoId) {
  return solicitar(`/pagos/admin/${encodeURIComponent(pagoId)}/validar`, {
    metodo: 'PUT',
    cuerpo: {}
  });
}

export async function rechazarPagoAdmin(pagoId, motivo) {
  return solicitar(`/pagos/admin/${encodeURIComponent(pagoId)}/rechazar`, {
    metodo: 'PUT',
    cuerpo: { motivo: motivo.trim() }
  });
}
