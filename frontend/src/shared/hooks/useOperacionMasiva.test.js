import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const { consultarOperacionMasiva } = vi.hoisted(() => ({
  consultarOperacionMasiva: vi.fn()
}));

vi.mock('../api/operacionesMasivasService.js', () => ({
  consultarOperacionMasiva,
  esEstadoTerminal: (estado) => [
    'COMPLETADO',
    'COMPLETADO_CON_ERRORES',
    'FALLIDO',
    'CANCELADO'
  ].includes(String(estado ?? '').toUpperCase())
}));

import useOperacionMasiva from './useOperacionMasiva.js';

beforeEach(() => {
  consultarOperacionMasiva.mockReset();
});

describe('useOperacionMasiva', () => {
  it('inicia el job y consulta hasta un estado terminal', async () => {
    consultarOperacionMasiva
      .mockResolvedValueOnce({
        exitoso: true,
        datos: {
          jobId: 'job-1',
          estado: 'EN_PROCESO',
          total: 10,
          procesados: 4,
          exitosos: 3,
          omitidos: 1,
          errores: 0,
          porcentaje: 40
        }
      })
      .mockResolvedValueOnce({
        exitoso: true,
        datos: {
          jobId: 'job-1',
          estado: 'COMPLETADO',
          total: 10,
          procesados: 10,
          exitosos: 9,
          omitidos: 1,
          errores: 0,
          porcentaje: 100
        }
      });

    const alTerminar = vi.fn();
    const { result } = renderHook(() => useOperacionMasiva({ intervaloMs: 10, alTerminar }));

    await act(async () => {
      await result.current.iniciar(async () => ({
        exitoso: true,
        datos: { jobId: 'job-1', estado: 'EN_COLA' }
      }));
    });

    await waitFor(() => expect(result.current.job?.estado).toBe('COMPLETADO'));
    expect(consultarOperacionMasiva).toHaveBeenCalledWith('job-1');
    expect(alTerminar).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: 'job-1', estado: 'COMPLETADO', exitosos: 9 })
    );
    expect(result.current.enCurso).toBe(false);
  });

  it('muestra el error si no puede iniciar el job', async () => {
    const { result } = renderHook(() => useOperacionMasiva({ intervaloMs: 10 }));

    await act(async () => {
      await result.current.iniciar(async () => ({
        exitoso: false,
        datos: null,
        mensaje: 'Servidor ocupado.'
      }));
    });

    expect(result.current.error).toBe('Servidor ocupado.');
    expect(result.current.job).toBeNull();
    expect(consultarOperacionMasiva).not.toHaveBeenCalled();
  });
});
