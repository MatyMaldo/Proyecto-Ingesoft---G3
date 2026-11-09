import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar, consultarEstructura } = vi.hoisted(() => ({
  solicitar: vi.fn(),
  consultarEstructura: vi.fn()
}));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));
vi.mock('../../grados-secciones/services/gradosSeccionesService.js', () => ({ consultarEstructura }));

import {
  obtenerAlumnos,
  obtenerEstructuraMatricula,
  obtenerEstructuraMatriculaVigente,
  obtenerEstructuraListadoMatriculas,
  obtenerPeriodoMatricula,
  cancelarPendientesPorPeriodo,
  listarMatriculas,
  obtenerSeccionesMatricula,
  crearMatricula,
  emitirCompromisoMatricula,
  emitirCompromisosMatriculaLote
} from './matriculasService.js';

describe('matriculasService', () => {
  beforeEach(() => {
    solicitar.mockReset();
    consultarEstructura.mockReset();
  });

  it('busca estudiantes activos y filtra la página por nombre, DNI o código', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        content: [
          { id: 1, nombreCompleto: 'María López', dni: '12345678', codigo: 'EST-1' },
          { id: 2, nombreCompleto: 'Juan Pérez', dni: '87654321', codigo: 'EST-2' }
        ]
      }
    });

    const resultado = await obtenerAlumnos({ busqueda: 'maria' });

    expect(solicitar).toHaveBeenCalledWith('/usuarios', {
      parametros: { tipoUsuario: 'ESTUDIANTE', activo: true, page: 0, size: 20 }
    });
    expect(resultado.datos).toEqual([
      { id: 1, nombreCompleto: 'María López', nombre: 'María López', dni: '12345678', codigo: 'EST-1' }
    ]);
  });

  it('obtiene el año con período de matrícula vigente y los grados', async () => {
    solicitar
      .mockResolvedValueOnce({ exitoso: true, datos: { id: 1, anio: 2026 } })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 2, nombre: 'Primero' }] });

    const resultado = await obtenerEstructuraMatricula();

    expect(solicitar).toHaveBeenNthCalledWith(1, '/anios-academicos/con-periodo-matricula-vigente');
    expect(solicitar).toHaveBeenNthCalledWith(2, '/grados');
    expect(resultado.datos).toEqual({
      anios: [{ id: 1, anio: 2026 }],
      grados: [{ id: 2, nombre: 'Primero' }]
    });
    expect(consultarEstructura).not.toHaveBeenCalled();
  });

  it('informa cuando no existe un año con período de matrícula vigente', async () => {
    solicitar
      .mockResolvedValueOnce({
        exitoso: true,
        datos: null,
        mensaje: 'No existe un año académico futuro con período de matrícula vigente.'
      })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 2, nombre: 'Primero' }] });

    const resultado = await obtenerEstructuraMatricula();

    expect(resultado).toEqual({
      exitoso: false,
      datos: null,
      mensaje: 'No existe un año académico futuro con período de matrícula vigente.'
    });
  });

  it('obtiene solo los años con período de matrícula vigente para el modal de asignación', async () => {
    solicitar
      .mockResolvedValueOnce({
        exitoso: true,
        datos: [
          { id: 1, anio: 2027 },
          { id: 2, anio: 2026 }
        ]
      })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 1, nombre: 'Primero' }] })
      .mockResolvedValueOnce({ exitoso: true, datos: { estado: 'VIGENTE' } })
      .mockResolvedValueOnce({ exitoso: true, datos: { estado: 'FINALIZADO' } });

    const resultado = await obtenerEstructuraMatriculaVigente();

    expect(solicitar).toHaveBeenNthCalledWith(1, '/anios-academicos');
    expect(solicitar).toHaveBeenNthCalledWith(2, '/grados');
    expect(solicitar).toHaveBeenNthCalledWith(3, '/anios-academicos/1/periodo-matricula');
    expect(solicitar).toHaveBeenNthCalledWith(4, '/anios-academicos/2/periodo-matricula');
    expect(resultado.datos.anios).toEqual([
      { id: 1, anio: 2027, estadoPeriodo: 'VIGENTE' }
    ]);
    expect(resultado.datos.grados).toEqual([{ id: 1, nombre: 'Primero' }]);
  });

  it('obtiene la estructura completa para el listado administrativo', async () => {    solicitar
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 1, anio: 2026 }] })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 2, nombre: 'Primero' }] });

    const resultado = await obtenerEstructuraListadoMatriculas();

    expect(solicitar).toHaveBeenNthCalledWith(1, '/anios-academicos');
    expect(solicitar).toHaveBeenNthCalledWith(2, '/grados');
    expect(resultado.datos).toEqual({
      anios: [{ id: 1, anio: 2026 }],
      grados: [{ id: 2, nombre: 'Primero' }]
    });
  });

  it('lista matrículas con filtros y paginación', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        content: [{
          id: 12,
          estado: 'CONFIRMADA',
          nombreCompletoEstudiante: 'Luis Ramirez'
        }],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 15
      }
    });

    const resultado = await listarMatriculas({
      anioId: '1',
      gradoId: '',
      seccionId: '2',
      estado: 'CONFIRMADA',
      page: 0,
      size: 15
    });

    expect(solicitar).toHaveBeenCalledWith('/matriculas', {
      parametros: {
        anioId: 1,
        gradoId: undefined,
        seccionId: 2,
        estado: 'CONFIRMADA',
        estudianteId: undefined,
        page: 0,
        size: 15
      }
    });
    expect(resultado.datos.content[0].id).toBe(12);
  });

  it('rechaza un listado de matrículas con formato inválido', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { content: [], totalElements: 0 }
    });

    const resultado = await listarMatriculas();

    expect(resultado.exitoso).toBe(false);
    expect(resultado.mensaje).toMatch(/listado de matrículas/);
  });

  it('consulta secciones por grado y año académico', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: [{ id: 3, nombre: 'A' }] });

    await obtenerSeccionesMatricula(2, 2026);

    expect(solicitar).toHaveBeenCalledWith('/secciones', {
      parametros: { gradoId: 2, anioId: 2026 }
    });
  });

  it('crea matrícula usando los IDs de estudiante y sección y guarda la respuesta para el compromiso', async () => {
    solicitar
      .mockResolvedValueOnce({ exitoso: true, datos: { id: 9, estado: 'PENDIENTE', estudianteId: 4 } })
      .mockResolvedValueOnce({ exitoso: true, datos: { id: 10, estado: 'PENDIENTE', matriculaId: 9 } });

    await crearMatricula({ alumno: { id: '4' }, seccion: { id: '7' } });
    await emitirCompromisoMatricula('4');

    expect(solicitar).toHaveBeenNthCalledWith(1, '/matriculas', {
      metodo: 'POST',
      cuerpo: { estudianteId: 4, seccionId: 7 }
    });
    expect(solicitar).toHaveBeenNthCalledWith(2, '/compromisos-pago/matricula', {
      metodo: 'POST',
      cuerpo: { matriculaId: 9 }
    });
  });

  it('emite el compromiso directamente desde el id de una matrícula existente', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: { id: 10, matriculaId: 12 } });

    await emitirCompromisoMatricula({ matriculaId: '12' });

    expect(solicitar).toHaveBeenCalledWith('/compromisos-pago/matricula', {
      metodo: 'POST',
      cuerpo: { matriculaId: 12 }
    });
  });

  it('requiere una matrícula creada en esta sesión antes de emitir el compromiso', async () => {
    const respuesta = await emitirCompromisoMatricula('missing');

    expect(respuesta.exitoso).toBe(false);
    expect(respuesta.mensaje).toMatch(/No hay una matrícula creada en esta sesión/);
    expect(solicitar).not.toHaveBeenCalled();
  });

  it('consulta el estado del período de matrícula del año', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { anioAcademicoId: 1, estado: 'FINALIZADO' }
    });

    const resultado = await obtenerPeriodoMatricula(1);

    expect(solicitar).toHaveBeenCalledWith('/anios-academicos/1/periodo-matricula');
    expect(resultado.datos.estado).toBe('FINALIZADO');
  });

  it('cancela matrículas pendientes de períodos vencidos con timeout extendido', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { matriculasCanceladas: 2 }
    });

    const resultado = await cancelarPendientesPorPeriodo();

    expect(solicitar).toHaveBeenCalledWith('/matriculas/cancelar-pendientes-por-periodo', {
      metodo: 'POST',
      tiempoEsperaMs: 60000
    });
    expect(resultado.datos.matriculasCanceladas).toBe(2);
  });

  it('emite compromisos de matrícula en lote para un año', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: { emitidos: 2, omitidos: 1, errores: [] }
    });

    const resultado = await emitirCompromisosMatriculaLote(2);

    expect(solicitar).toHaveBeenCalledWith('/compromisos-pago/matricula/lote', {
      metodo: 'POST',
      cuerpo: { anioId: 2 },
      tiempoEsperaMs: 60000
    });
    expect(resultado.datos).toEqual({ emitidos: 2, omitidos: 1, errores: [] });
  });
});
