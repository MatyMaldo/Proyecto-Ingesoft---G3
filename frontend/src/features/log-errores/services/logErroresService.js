import { obtenerErroresMock } from './mocks/logErroresMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

export const TAMANIO_PAGINA_LOG_ERRORES = 15;

function normalizarRegistro(registro) {
  return {
    ...registro,
    nombreUsuario: registro.nombreUsuario ?? null,
    detalle: registro.detalle ?? ''
  };
}

function normalizarPagina(datos) {
  if (
    !datos ||
    !Array.isArray(datos.content) ||
    typeof datos.number !== 'number' ||
    typeof datos.totalPages !== 'number' ||
    typeof datos.totalElements !== 'number'
  ) {
    return null;
  }

  return {
    registros: datos.content.map(normalizarRegistro),
    pagina: datos.number,
    totalPaginas: datos.totalPages,
    totalElementos: datos.totalElements
  };
}

/**
 * Lista logs de errores con el contrato GET /api/admin/logs-error.
 * Las fechas recibidas son inclusivas y se convierten al inicio/final del día.
 */
export async function obtenerErrores(filtros = {}, opciones = {}) {
  if (USAR_MOCK) {
    const respuesta = await obtenerErroresMock(filtros);
    if (!respuesta.exitoso) {
      return respuesta;
    }

    const todos = respuesta.datos.map((registro) => ({
      id: registro.id,
      fechaHora: registro.fechaHora,
      usuarioId: registro.usuarioId ?? null,
      nombreUsuario: registro.nombreUsuario ?? registro.usuario ?? null,
      tipoError: registro.tipoError,
      mensaje: registro.mensaje,
      detalle: registro.detalle ?? '',
      endpoint: registro.endpoint ?? `/${registro.modulo?.toLowerCase() ?? 'sistema'}`,
      metodoHttp: registro.metodoHttp ?? 'GET',
      codigoEstado: registro.codigoEstado ?? 500
    }));
    const pagina = filtros.page ?? 0;
    const totalElementos = todos.length;
    const totalPaginas = Math.ceil(totalElementos / TAMANIO_PAGINA_LOG_ERRORES);
    const inicio = pagina * TAMANIO_PAGINA_LOG_ERRORES;

    return {
      exitoso: true,
      datos: {
        registros: todos.slice(inicio, inicio + TAMANIO_PAGINA_LOG_ERRORES),
        pagina,
        totalPaginas,
        totalElementos
      },
      mensaje: ''
    };
  }

  const respuesta = await solicitar('/admin/logs-error', {
    sinVersionApi: true,
    parametros: {
      fechaInicio: filtros.fechaDesde ? `${filtros.fechaDesde}T00:00:00` : undefined,
      fechaFin: filtros.fechaHasta ? `${filtros.fechaHasta}T23:59:59` : undefined,
      page: filtros.page ?? 0,
      size: TAMANIO_PAGINA_LOG_ERRORES,
      sortBy: 'fechaHora',
      sortDirection: 'DESC'
    },
    signal: opciones.signal
  });

  if (!respuesta.exitoso) {
    return respuesta;
  }

  const pagina = normalizarPagina(respuesta.datos);
  if (!pagina) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió un formato de logs de errores no válido.'
    };
  }

  return { exitoso: true, datos: pagina, mensaje: '' };
}
