import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// El hook siempre consulta al backend; en las pruebas se sustituye el servicio por datos fijos.
vi.mock('../services/logErroresService.js', async (importarOriginal) => {
  const real = await importarOriginal();
  const { obtenerErroresDePrueba } = await import('../pruebas/logErroresDePrueba.js');
  return { ...real, obtenerErrores: obtenerErroresDePrueba };
});

import useLogErrores, { obtenerTonoCodigoEstado } from './useLogErrores.js';

function renderizarHook(ruta = '/') {
  return renderHook(() => useLogErrores(), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
  });
}

async function esperarCargaInicial(result) {
  await waitFor(() => expect(result.current.estado).toBe('listo'), { timeout: 3000 });
}

describe('HU-SAT-06 · integración del contrato paginado de logs de errores', () => {
  it('adapta los campos del log y pagina de 10 en 10', async () => {
    const { result } = renderizarHook();
    await esperarCargaInicial(result);

    expect(result.current.errores).toHaveLength(10);
    expect(result.current.totalElementos).toBe(18);
    expect(result.current.totalPaginas).toBe(2);
    expect(result.current.errores[0]).toMatchObject({
      id: 9,
      endpoint: '/api/v1/notas',
      metodoHttp: 'PUT',
      codigoEstado: 500,
      tipoError: 'Excepción no controlada'
    });

    act(() => result.current.irAPagina(1));
    await waitFor(() => expect(result.current.pagina).toBe(1));
    await waitFor(() => expect(result.current.recargando).toBe(false));

    expect(result.current.errores).toHaveLength(8);
    expect(result.current.errores.map((error) => error.id).slice(-3)).toEqual([16, 17, 18]);
  });

  it('aplica fechas inclusivas y rechaza rangos inválidos sin cambiar la consulta', async () => {
    const { result } = renderizarHook();
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

  it('filtra por módulo y vuelve a la primera página', async () => {
    const { result } = renderizarHook();
    await esperarCargaInicial(result);

    act(() => result.current.irAPagina(1));
    await waitFor(() => expect(result.current.pagina).toBe(1));

    act(() => result.current.establecerModulo('USUARIOS'));
    await waitFor(() => expect(result.current.totalElementos).toBe(4));

    expect(result.current.pagina).toBe(0);
    expect(result.current.errores.every((error) => error.moduloEtiqueta === 'Usuarios')).toBe(true);
  });

  it('muestra el nombre del usuario nulo como Sistema y expone el total del contrato', async () => {
    const { result } = renderizarHook();
    await esperarCargaInicial(result);

    const automatico = result.current.errores.find((error) => error.id === 10);
    expect(automatico.usuarioId).toBeNull();
    expect(automatico.usuario).toBe('Sistema');
  });

  it('lee la página desde la URL y vuelve a la última si está fuera de rango', async () => {
    const { result } = renderizarHook('/?pagina=2');
    await esperarCargaInicial(result);
    expect(result.current.pagina).toBe(1);
    expect(result.current.errores.map((error) => error.id).slice(-3)).toEqual([16, 17, 18]);

    const fuera = renderizarHook('/?pagina=99');
    await waitFor(() => expect(fuera.result.current.pagina).toBe(1), { timeout: 3000 });
    await waitFor(() => expect(fuera.result.current.estado).toBe('listo'), { timeout: 3000 });
    expect(fuera.result.current.errores).toHaveLength(8);

    const invalida = renderizarHook('/?pagina=abc');
    await esperarCargaInicial(invalida.result);
    expect(invalida.result.current.pagina).toBe(0);
  });

  it('asigna el tono del estado HTTP según su rango', () => {
    expect(obtenerTonoCodigoEstado(500)).toBe('rojo');
    expect(obtenerTonoCodigoEstado(504)).toBe('rojo');
    expect(obtenerTonoCodigoEstado(404)).toBe('ambar');
    expect(obtenerTonoCodigoEstado(200)).toBe('gris');
    expect(obtenerTonoCodigoEstado(null)).toBe('gris');
  });
});
