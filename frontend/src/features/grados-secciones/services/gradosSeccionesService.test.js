import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar } = vi.hoisted(() => ({ solicitar: vi.fn() }));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  consultarEstructura,
  crearGrado,
  crearSeccion
} from './gradosSeccionesService.js';

describe('gradosSeccionesService', () => {
  beforeEach(() => solicitar.mockReset());

  it('carga años, grados, secciones y docentes desde sus endpoints', async () => {
    solicitar
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 1, anio: 2026, fechaFin: null }] })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 2, nombre: 'Primero' }] })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 3, nombre: 'A', gradoId: 2, anioAcademicoId: 1 }] })
      .mockResolvedValueOnce({ exitoso: true, datos: { content: [{ id: 4, nombreCompleto: 'Ana Pérez', activo: true }] } });

    const resultado = await consultarEstructura();

    expect(solicitar).toHaveBeenNthCalledWith(1, '/anios-academicos');
    expect(solicitar).toHaveBeenNthCalledWith(2, '/grados');
    expect(solicitar).toHaveBeenNthCalledWith(3, '/secciones');
    expect(solicitar).toHaveBeenNthCalledWith(4, '/usuarios', {
      parametros: { tipoUsuario: 'DOCENTE', activo: true, page: 0, size: 100 }
    });
    expect(resultado.datos).toMatchObject({
      anios: [{ id: 1, anio: 2026 }],
      grados: [{ id: 2, nombre: 'Primero' }],
      secciones: [{ id: 3, nombre: 'A' }],
      docentes: [{ id: 4, nombreCompleto: 'Ana Pérez' }]
    });
  });

  it('envía únicamente nombre al crear grado', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: { id: 10, nombre: 'Segundo' } });

    await crearGrado({ nombre: ' Segundo ' });

    expect(solicitar).toHaveBeenCalledWith('/grados', {
      metodo: 'POST',
      cuerpo: { nombre: 'Segundo' }
    });
  });

  it('convierte IDs y capacidad y envía tutorId nulo cuando no se selecciona tutor', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: { id: 12, nombre: 'B' } });

    await crearSeccion({
      nombre: ' B ',
      capacidadMaxima: '30',
      gradoId: '2',
      anioAcademicoId: '1',
      tutorId: ''
    });

    expect(solicitar).toHaveBeenCalledWith('/secciones', {
      metodo: 'POST',
      cuerpo: {
        nombre: 'B',
        capacidadMaxima: 30,
        gradoId: 2,
        anioAcademicoId: 1,
        tutorId: null
      }
    });
  });
});
