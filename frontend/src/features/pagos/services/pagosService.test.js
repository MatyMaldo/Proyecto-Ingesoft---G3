import { beforeEach, describe, expect, it, vi } from 'vitest';

const solicitar = vi.hoisted(() => vi.fn());

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  emitirCompromisosPensionLote,
  listarPagosAdmin,
  listarPagosAgrupados,
  obtenerAlumnosMatriculados,
  obtenerGrados,
  obtenerPagoAdmin,
  obtenerPeriodoMatricula,
  obtenerSecciones,
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

  it('carga alumnos con matrícula pendiente o confirmada del año', async () => {
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
        page: 0,
        size: 100
      }
    });
    expect(resultado.datos.estudiantes[0]).toMatchObject({
      id: 5,
      nombre: 'Luis Ramirez Torres',
      estadoMatricula: 'CONFIRMADA',
      gradoId: 1,
      seccionId: 3,
      anioAcademicoId: 2
    });
  });

  it('incluye matrículas pendientes y excluye las canceladas', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        content: [
          { id: 1, estado: 'PENDIENTE', estudianteId: 7, nombreCompletoEstudiante: 'Julio Cesar' },
          { id: 2, estado: 'CONFIRMADA', estudianteId: 8, nombreCompletoEstudiante: 'Ana Ramirez' },
          { id: 3, estado: 'CANCELADA', estudianteId: 9, nombreCompletoEstudiante: 'Alumno Cancelado' }
        ],
        totalElements: 3,
        totalPages: 1,
        number: 0
      }
    });

    const resultado = await obtenerAlumnosMatriculados(2);

    expect(resultado.datos.estudiantes).toHaveLength(2);
    expect(resultado.datos.estudiantes.map((alumno) => alumno.nombre)).toEqual([
      'Julio Cesar',
      'Ana Ramirez'
    ]);
    expect(resultado.datos.estudiantes[0].estadoMatricula).toBe('PENDIENTE');
  });

  it('envía filtros de grado y sección al listar alumnos', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { content: [], totalElements: 0, totalPages: 0, number: 0 }
    });

    await obtenerAlumnosMatriculados(2, { gradoId: '1', seccionId: 3 });

    expect(solicitar).toHaveBeenCalledWith('/matriculas', {
      parametros: {
        anioId: 2,
        page: 0,
        size: 100,
        gradoId: 1,
        seccionId: 3
      }
    });
  });

  it('consulta grados y secciones para los filtros', async () => {
    solicitar
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 1, nombre: 'Primero' }] })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 3, nombre: 'A' }] });

    const grados = await obtenerGrados();
    const secciones = await obtenerSecciones(1, 2);

    expect(solicitar).toHaveBeenNthCalledWith(1, '/grados');
    expect(solicitar).toHaveBeenNthCalledWith(2, '/secciones', {
      parametros: { gradoId: 1, anioId: 2 }
    });
    expect(grados.datos).toEqual([{ id: 1, nombre: 'Primero' }]);
    expect(secciones.datos).toEqual([{ id: 3, nombre: 'A' }]);
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
      cuerpo: {},
      tiempoEsperaMs: 60000
    });
    expect(solicitar).toHaveBeenNthCalledWith(2, '/pagos/admin/20/rechazar', {
      metodo: 'PUT',
      cuerpo: { motivo: 'Comprobante ilegible' },
      tiempoEsperaMs: 60000
    });
  });

  it('consulta el período de matrícula para habilitar correcciones', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { anioAcademicoId: 1, estado: 'VIGENTE' }
    });

    const resultado = await obtenerPeriodoMatricula(1);

    expect(solicitar).toHaveBeenCalledWith('/anios-academicos/1/periodo-matricula');
    expect(resultado.datos.estado).toBe('VIGENTE');
  });

  it('emite compromisos de pensión en lote con año y mes', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { emitidos: 3, omitidos: 1, errores: [] }
    });

    const resultado = await emitirCompromisosPensionLote({
      anioId: 2,
      mes: 'NOVIEMBRE'
    });

    expect(solicitar).toHaveBeenCalledWith('/compromisos-pago/pension/lote', {
      metodo: 'POST',
      cuerpo: { anioId: 2, mes: 'NOVIEMBRE' },
      tiempoEsperaMs: 60000
    });
    expect(resultado.datos).toEqual({ emitidos: 3, omitidos: 1, errores: [] });
  });

  it('incluye grado y sección en la emisión masiva de pensión cuando se envían', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { emitidos: 0, omitidos: 0, errores: [] }
    });

    await emitirCompromisosPensionLote({
      anioId: 2,
      mes: 'NOVIEMBRE',
      gradoId: 1,
      seccionId: 3
    });

    expect(solicitar).toHaveBeenCalledWith('/compromisos-pago/pension/lote', {
      metodo: 'POST',
      cuerpo: {
        anioId: 2,
        mes: 'NOVIEMBRE',
        gradoId: 1,
        seccionId: 3
      },
      tiempoEsperaMs: 60000
    });
  });
});
