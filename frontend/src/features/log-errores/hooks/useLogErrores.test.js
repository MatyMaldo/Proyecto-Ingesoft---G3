import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import useLogErrores from './useLogErrores.js';

async function esperarCargaInicial(result) {
  await waitFor(() => expect(result.current.estado).toBe('listo'), { timeout: 3000 });
}

describe('HU-SAT-06 · integración del contrato paginado de logs de errores', () => {
  it('adapta los campos del log y pagina de 15 en 15', async () => {
    const { result } = renderHook(() => useLogErrores());
    await esperarCargaInicial(result);

    expect(result.current.errores).toHaveLength(15);
    expect(result.current.totalElementos).toBe(18);
    expect(result.current.totalPaginas).toBe(2);
    expect(result.current.errores[0]).toMatchObject({
      id: 9,
      endpoint: '/notas',
      metodoHttp: 'GET',
      codigoEstado: 500,
      tipoError: 'Excepción no controlada'
    });

    act(() => result.current.irAPagina(1));
    await waitFor(() => expect(result.current.pagina).toBe(1));
    await waitFor(() => expect(result.current.recargando).toBe(false));

    expect(result.current.errores).toHaveLength(3);
    expect(result.current.errores.map((error) => error.id)).toEqual([16, 17, 18]);
  });

  it('aplica fechas inclusivas y rechaza rangos inválidos sin cambiar la consulta', async () => {
    const { result } = renderHook(() => useLogErrores());
    await esperarCargaInicial(result);

    act(() => result.current.establecerFechaDesde('2026-09-18'));
    act(() => result.current.establecerFechaHasta('2026-09-18'));
    await waitFor(() => expect(result.current.recargando).toBe(false));

    expect(result.current.errores.map((error) => error.id)).toEqual([8, 11, 7]);

    act(() => result.current.establecerFechaDesde('2026-09-19'));
    act(() => result.current.establecerFechaHasta('2026-09-15'));

    expect(result.current.mensajeErrorRango).toBe(
      'La fecha «Desde» no puede ser posterior a la fecha «Hasta».'
    );
    expect(result.current.errores.map((error) => error.id)).toEqual([8, 11, 7]);
  });

  it('muestra el nombre del usuario nulo como Sistema y expone el total del contrato', async () => {
    const { result } = renderHook(() => useLogErrores());
    await esperarCargaInicial(result);

    const automatico = result.current.errores.find((error) => error.id === 10);
    expect(automatico.usuarioId).toBeNull();
    expect(automatico.usuario).toBe('Sistema');
    expect(result.current.textoInsignia).toBe('18 errores');
  });
});
