import { beforeEach, describe, expect, it, vi } from 'vitest';

const solicitar = vi.hoisted(() => vi.fn());

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  listarPagosAdmin,
  listarPagosAgrupados,
  obtenerAlumnosMatriculados,
  obtenerPagoAdmin,
  rechazarPagoAdmin,
  validarPagoAdmin
} from './pagosService.js';

const paginaPagos = {
  content: [{
    id: 20,
    fechaRegistro: '2026-10-16',
    montoPagado: 450,
    estado: 'PENDIENTE',
    tipoCompromiso: 'MATRICULA',
    estudianteId: 5,
    estudianteNombreCompleto: 'Luis Ramirez Torres'
  }],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10
};

describe('pagosService · panel admin', () => {
  beforeEach(() => {
    solicitar.mockReset();
  });

  it('carga alumnos desde matrículas confirmadas del año', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        content: [{
          id: 10,
          estado: 'CONFIRMADA',
          estudianteId: 5,
          nombreCompletoEstudiante: 'Luis Ramirez Torres',
          codigoEstudiante: '91000005',
          anioAcademicoId: 2,
          anioAcademico: 2026,
          gradoId: 1,
          gradoNombre: '1er Grado de Secundaria',
          seccionId: 3,
          seccionNombre: 'A'
        }],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 100
      }
    });

    const resultado = await obtenerAlumnosMatriculados(2);

    expect(solicitar).toHaveBeenCalledWith('/matriculas', {
      parametros: {
        anioId: 2,
        estado: 'CONFIRMADA',
        page: 0,
        size: 100
      }
    });
    expect(resultado.datos.estudiantes[0]).toMatchObject({
      id: 5,
      nombre: 'Luis Ramirez Torres',
      gradoId: 1,
      seccionId: 3,
      anioAcademicoId: 2
    });
  });

  it('lista todos los pagos del estudiante enviando sortBy=fechaRegistro', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: paginaPagos });

    await listarPagosAdmin({
      anioAcademicoId: 2,
      gradoId: 1,
      seccionId: 3,
      estudianteId: 5,
      page: 0,
      size: 10
    });

    expect(solicitar).toHaveBeenCalledWith('/pagos/admin', {
      parametros: {
        anioAcademicoId: 2,
        gradoId: 1,
        seccionId: 3,
        estudianteId: 5,
        estado: undefined,
        tipoCompromiso: undefined,
        page: 0,
        size: 10,
        sortBy: 'fechaRegistro'
      }
    });
  });

  it('lista pagos agrupados por compromiso sin enviar sortBy', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        content: [{
          compromisoId: 11,
          tipoCompromiso: 'PENSION',
          mes: 'MARZO',
          estadoCompromiso: 'PENDIENTE',
          pagos: []
        }],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      }
    });

    const resultado = await listarPagosAgrupados({
      anioAcademicoId: 2,
      gradoId: 1,
      seccionId: 3,
      estudianteId: 5
    });

    expect(solicitar).toHaveBeenCalledWith('/pagos/admin/agrupados', {
      parametros: {
        anioAcademicoId: 2,
        gradoId: 1,
        seccionId: 3,
        estudianteId: 5,
        estadoCompromiso: undefined,
        tipoCompromiso: undefined,
        page: 0,
        size: 10
      }
    });
    expect(resultado.datos.content[0].compromisoId).toBe(11);
  });

  it('obtiene el detalle de un pago', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: { id: 20 } });

    await obtenerPagoAdmin(20);

    expect(solicitar).toHaveBeenCalledWith('/pagos/admin/20');
  });

  it('valida y rechaza pagos con los endpoints administrativos', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: null });

    await validarPagoAdmin(20);
    await rechazarPagoAdmin(20, '  Comprobante ilegible  ');

    expect(solicitar).toHaveBeenNthCalledWith(1, '/pagos/admin/20/validar', {
      metodo: 'PUT',
      cuerpo: {}
    });
    expect(solicitar).toHaveBeenNthCalledWith(2, '/pagos/admin/20/rechazar', {
      metodo: 'PUT',
      cuerpo: { motivo: 'Comprobante ilegible' }
    });
  });
});
