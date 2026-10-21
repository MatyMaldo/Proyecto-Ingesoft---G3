import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import useLogErrores from './useLogErrores.js';

async function esperarCargaInicial(result) {
  await waitFor(() => expect(result.current.estado).toBe('listo'), { timeout: 3000 });
}

describe('HU-SAT-06 · Filtro combinado de rango de fechas y módulo', () => {
  it('combina módulo y rango de fechas con Y lógico, ordenado del más reciente al más antiguo', async () => {
    const { result } = renderHook(() => useLogErrores());
    await esperarCargaInicial(result);

    act(() => {
      result.current.establecerModulo('PAGOS');
    });
    await waitFor(() => expect(result.current.recargando).toBe(false));

    act(() => {
      result.current.establecerFechaDesde('2026-09-18');
    });
    await waitFor(() => expect(result.current.recargando).toBe(false));

    act(() => {
      result.current.establecerFechaHasta('2026-09-18');
    });
    await waitFor(() => expect(result.current.recargando).toBe(false));

    // Solo los errores de PAGOS del 2026-09-18: id 7 (11:20) e id 11 (11:21).
    expect(result.current.errores.map((error) => error.id)).toEqual([11, 7]);
  });

  it('con "Desde" posterior a "Hasta" no aplica el rango y conserva la lista anterior', async () => {
    const { result } = renderHook(() => useLogErrores());
    await esperarCargaInicial(result);

    const totalInicial = result.current.errores.length;

    act(() => {
      result.current.establecerFechaDesde('2026-09-19');
    });
    act(() => {
      result.current.establecerFechaHasta('2026-09-15');
    });

    expect(result.current.mensajeErrorRango).toBe(
      'La fecha «Desde» no puede ser posterior a la fecha «Hasta».'
    );
    expect(result.current.errores.length).toBe(totalInicial);
  });

  it('no deja ningún error cuando el módulo y el rango de fechas no tienen coincidencias', async () => {
    const { result } = renderHook(() => useLogErrores());
    await esperarCargaInicial(result);

    act(() => {
      result.current.establecerModulo('USUARIOS');
    });
    await waitFor(() => expect(result.current.recargando).toBe(false));

    act(() => {
      result.current.establecerFechaDesde('2026-01-01');
    });
    await waitFor(() => expect(result.current.recargando).toBe(false));

    act(() => {
      result.current.establecerFechaHasta('2026-01-02');
    });
    await waitFor(() => expect(result.current.recargando).toBe(false));

    expect(result.current.errores).toEqual([]);
  });
});

describe('HU-SAT-06 · Escenario 3: registro de un error en un proceso automático con "Sistema" como usuario', () => {
  it('incluye el registro del proceso automático con "Sistema" como usuario, con la misma forma que cualquier otro', async () => {
    const { result } = renderHook(() => useLogErrores());
    await esperarCargaInicial(result);

    const registroSistema = result.current.errores.find((error) => error.usuario === 'Sistema');
    expect(registroSistema).toBeDefined();
    expect(registroSistema.moduloEtiqueta).toBeTruthy();
    expect(registroSistema).toHaveProperty('operacion');
    expect(registroSistema).toHaveProperty('tipoError');
    expect(registroSistema).toHaveProperty('mensaje');
  });
});

describe('HU-SAT-06 · Condición de carrera entre la carga inicial y un cambio de filtro', () => {
  it('aplica el filtro de módulo aunque se cambie antes de que termine la carga inicial', async () => {
    const { result } = renderHook(() => useLogErrores());

    // Cambia el filtro ANTES de esperar a que la carga inicial termine (estado
    // sigue en 'cargando' en este punto): este era exactamente el escenario del bug.
    act(() => {
      result.current.establecerModulo('PAGOS');
    });

    await esperarCargaInicial(result);
    await waitFor(() => expect(result.current.recargando).toBe(false));

    // Debe quedar filtrado por PAGOS (ids 7 y 11), no con la lista completa sin filtrar.
    expect(result.current.errores.every((error) => error.moduloEtiqueta === 'Pagos')).toBe(true);
    expect(result.current.errores.map((error) => error.id).sort((a, b) => a - b)).toEqual([7, 11]);
    expect(result.current.resumen).not.toBeNull();
  });
});

describe('HU-SAT-06 · Columna "Tipo de error"', () => {
  it('cada fila adaptada conserva el tipo de error además de la operación', async () => {
    const { result } = renderHook(() => useLogErrores());
    await esperarCargaInicial(result);

    expect(result.current.errores.length).toBeGreaterThan(0);
    result.current.errores.forEach((error) => {
      expect(error).toHaveProperty('operacion');
      expect(error).toHaveProperty('tipoError');
    });
  });
});
