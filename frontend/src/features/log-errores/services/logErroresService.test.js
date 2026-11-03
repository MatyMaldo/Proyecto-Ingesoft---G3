import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar } = vi.hoisted(() => ({ solicitar: vi.fn() }));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import { obtenerErrores } from './logErroresService.js';

describe('servicio de logs de errores · contrato backend', () => {
  beforeEach(() => solicitar.mockReset());

  it('consulta la ruta admin sin v1 con filtros, paginación y orden acordados', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        content: [{
          id: 1,
          fechaHora: '2026-11-03T14:30:00',
          usuarioId: null,
          nombreUsuario: null,
          tipoError: 'NullPointerException',
          mensaje: 'Error al procesar',
          detalle: 'Stack trace',
          endpoint: '/api/v1/estudiantes/123/libretas',
          metodoHttp: 'GET',
          codigoEstado: 500
        }],
        number: 1,
        totalPages: 3,
        totalElements: 31
      },
      mensaje: ''
    });

    const resultado = await obtenerErrores({
      fechaDesde: '2026-11-03',
      fechaHasta: '2026-11-04',
      page: 1
    });

    expect(solicitar).toHaveBeenCalledWith('/admin/logs-error', {
      sinVersionApi: true,
      parametros: {
        fechaInicio: '2026-11-03T00:00:00',
        fechaFin: '2026-11-04T23:59:59',
        page: 1,
        size: 15,
        sortBy: 'fechaHora',
        sortDirection: 'DESC'
      },
      signal: undefined
    });
    expect(resultado.datos).toMatchObject({
      pagina: 1,
      totalPaginas: 3,
      totalElementos: 31,
      registros: [{ usuarioId: null, nombreUsuario: null, codigoEstado: 500 }]
    });
  });

  it('informa si la respuesta no trae una página Spring válida', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: [], mensaje: '' });

    const resultado = await obtenerErrores();

    expect(resultado).toMatchObject({
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió un formato de logs de errores no válido.'
    });
  });
});
