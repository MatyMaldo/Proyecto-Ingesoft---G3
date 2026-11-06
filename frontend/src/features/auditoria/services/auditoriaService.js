import {
  listarRegistrosAuditoriaMock,
  obtenerHistorialElementoMock,
  obtenerRegistroAuditoriaMock
} from './mocks/auditoriaMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { TAMANIO_HISTORIAL_AUDITORIA, TAMANIO_PAGINA_AUDITORIA } from '../constants/paginacionAuditoria.js';

const CATEGORIAS_MOCK = Object.freeze({
  USUARIO: 'USUARIOS',
  MATRICULA: 'MATRICULAS',
  ACADEMICO: 'EVALUACIONES'
});

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
    registros: datos.content,
    pagina: datos.number,
    totalPaginas: datos.totalPages,
    totalElementos: datos.totalElements
  };
}

function crearResultadoPagina(respuesta) {
  if (!respuesta.exitoso) {
    return respuesta;
  }

  const pagina = normalizarPagina(respuesta.datos);
  if (!pagina) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió un formato de listado de auditorías no válido.'
    };
  }

  return { exitoso: true, datos: pagina, mensaje: '' };
}

/**
 * Lista auditorías usando los nombres de filtros y formato de paginación del API.
 * La búsqueda libre no forma parte del contrato y se limita a la página recibida
 * en el hook.
 */
export async function listarRegistrosAuditoria(filtros = {}, opciones = {}) {
  if (USAR_MOCK) {
    const categoriaMock = CATEGORIAS_MOCK[filtros.categoria] ?? filtros.categoria;
    const respuesta = await listarRegistrosAuditoriaMock({
      ...filtros,
      categoria: categoriaMock,
      pagina: filtros.pagina ?? 0
    });
    return crearResultadoPagina(respuesta);
  }

  const parametros = {
    categoria: filtros.categoria,
    accion: filtros.tipoAccion,
    fechaInicio: filtros.fechaDesde ? `${filtros.fechaDesde}T00:00:00` : undefined,
    fechaFin: filtros.fechaHasta ? `${filtros.fechaHasta}T23:59:59` : undefined,
    page: filtros.pagina ?? 0,
    size: TAMANIO_PAGINA_AUDITORIA,
    sort: 'fechaHora,desc'
  };

  const respuesta = await solicitar('/auditorias', { parametros, signal: opciones.signal });
  return crearResultadoPagina(respuesta);
}

/**
 * Obtiene el historial paginado de la entidad afectada por un registro.
 */
export async function obtenerHistorialAuditoria(registro, opciones = {}) {
  if (USAR_MOCK) {
    const respuesta = await obtenerHistorialElementoMock(registro.idElemento);
    if (!respuesta.exitoso) {
      return respuesta;
    }

    return {
      ...respuesta,
      datos: {
        registros: respuesta.datos,
        pagina: 0,
        totalPaginas: 1,
        totalElementos: respuesta.datos.length
      }
    };
  }

  if (registro.entidad === undefined || registro.entidadId === undefined || registro.entidadId === null) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'El registro no contiene la entidad necesaria para consultar su historial.'
    };
  }

  const entidad = encodeURIComponent(registro.entidad);
  const entidadId = encodeURIComponent(registro.entidadId);
  const respuesta = await solicitar(`/auditorias/historial/${entidad}/${entidadId}`, {
    parametros: {
      page: 0,
      size: TAMANIO_HISTORIAL_AUDITORIA,
      sort: 'fechaHora,asc'
    },
    signal: opciones.signal
  });

  return crearResultadoPagina(respuesta);
}

/**
 * Obtiene el detalle completo de un registro de auditoría.
 */
export async function obtenerRegistroAuditoria(id, opciones = {}) {
  if (USAR_MOCK) {
    return obtenerRegistroAuditoriaMock(id);
  }

  return solicitar(`/auditorias/${encodeURIComponent(id)}`, { signal: opciones.signal });
}
