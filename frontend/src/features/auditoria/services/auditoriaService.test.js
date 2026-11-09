import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar } = vi.hoisted(() => ({ solicitar: vi.fn() }));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  listarRegistrosAuditoria,
  obtenerHistorialAuditoria,
  obtenerRegistroAuditoria
} from './auditoriaService.js';

describe('servicio de auditoría · contrato backend', () => {
  beforeEach(() => solicitar.mockReset());

  it('lista con nombres de parámetros y valores de categoría/acción del contrato', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { content: [], number: 0, totalPages: 0, totalElements: 0 },
      mensaje: ''
    });

    const resultado = await listarRegistrosAuditoria({
      categoria: 'MATRICULA',
      tipoAccion: 'CAMBIO_ESTADO',
      fechaDesde: '2026-11-03',
      fechaHasta: '2026-11-04',
      busqueda: 'ignorada por el API',
      pagina: 0
    });

    expect(solicitar).toHaveBeenCalledWith('/auditorias', {
      parametros: {
        categoria: 'MATRICULA',
        accion: 'CAMBIO_ESTADO',
        fechaInicio: '2026-11-03T00:00:00',
        fechaFin: '2026-11-04T23:59:59',
        page: 0,
        size: 10,
        sort: 'fechaHora,desc'
      },
      signal: undefined
    });
    expect(resultado.datos).toEqual({
      registros: [],
      pagina: 0,
      totalPaginas: 0,
      totalElementos: 0
    });
  });

  it('consulta historial por entidad e ID con paginación cronológica', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { content: [], number: 0, totalPages: 0, totalElements: 0 },
      mensaje: ''
    });

    await obtenerHistorialAuditoria({ entidad: 'Matrícula', entidadId: 7 });

    expect(solicitar).toHaveBeenCalledWith('/auditorias/historial/Matr%C3%ADcula/7', {
      parametros: { page: 0, size: 20, sort: 'fechaHora,asc' },
      signal: undefined
    });
  });

  it('consulta el detalle de auditoría por su ID', async () => {
    const registro = { id: 21, detalles: [] };
    solicitar.mockResolvedValue({ exitoso: true, datos: registro, mensaje: '' });

    await obtenerRegistroAuditoria(21);

    expect(solicitar).toHaveBeenCalledWith('/auditorias/21', { signal: undefined });
  });
});
