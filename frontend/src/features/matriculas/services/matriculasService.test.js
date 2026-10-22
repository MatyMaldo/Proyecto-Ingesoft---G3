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
  obtenerSeccionesMatricula,
  crearMatricula,
  emitirCompromisoMatricula
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
      sinVersionApi: true,
      cuerpo: { estudianteId: 4, seccionId: 7 }
    });
    expect(solicitar).toHaveBeenNthCalledWith(2, '/compromisos-pago/matricula', {
      metodo: 'POST',
      sinVersionApi: true,
      cuerpo: { matriculaId: 9 }
    });
  });

  it('requiere una matrícula creada en esta sesión antes de emitir el compromiso', async () => {
    const respuesta = await emitirCompromisoMatricula('missing');

    expect(respuesta.exitoso).toBe(false);
    expect(respuesta.mensaje).toMatch(/No hay una matrícula creada en esta sesión/);
    expect(solicitar).not.toHaveBeenCalled();
  });
});
