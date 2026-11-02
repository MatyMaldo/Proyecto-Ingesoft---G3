import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import useAuditoria from './useAuditoria.js';

async function esperarCargaInicial(result) {
  await waitFor(() => expect(result.current.estado).toBe('listo'), { timeout: 3000 });
}

describe('HU-SAT-04 · Escenario 4: búsqueda general con filtros combinados, del más reciente al más antiguo', () => {
  it('ordena el listado inicial del más reciente al más antiguo', async () => {
    const { result } = renderHook(() => useAuditoria());
    await esperarCargaInicial(result);

    const fechas = result.current.registros.map((registro) => new Date(registro.fechaHoraIso).getTime());
    const ordenadoDescendente = [...fechas].sort((a, b) => b - a);
    expect(fechas).toEqual(ordenadoDescendente);
    expect(result.current.registros.length).toBeGreaterThan(0);
  });

  it('combina categoría, tipo de transacción y rango de fechas (Y lógico) y mantiene el orden descendente', async () => {
    const { result } = renderHook(() => useAuditoria());
    await esperarCargaInicial(result);

    act(() => {
      result.current.establecerCategoria('PAGOS');
    });
    await waitFor(() => expect(result.current.actualizando).toBe(false));

    act(() => {
      result.current.establecerFechaDesde('2026-09-17');
    });
    await waitFor(() => expect(result.current.actualizando).toBe(false));

    act(() => {
      result.current.establecerFechaHasta('2026-09-17');
    });
    await waitFor(() => expect(result.current.actualizando).toBe(false));

    // Solo quedan los registros de PAGOS del 2026-09-17: AUD-0014 (08:30) y AUD-0007 (09:15).
    expect(result.current.registros.map((registro) => registro.id)).toEqual(['AUD-0007', 'AUD-0014']);
    expect(result.current.registros.every((registro) => registro.modulo.codigo === 'PAGOS')).toBe(true);

    act(() => {
      result.current.establecerTipoTransaccion('Validación de pago');
    });
    await waitFor(() => expect(result.current.actualizando).toBe(false));

    expect(result.current.registros.map((registro) => registro.id)).toEqual(['AUD-0007']);
  });

  it('no consulta con un rango inválido (Desde posterior a Hasta) y conserva el resultado anterior', async () => {
    const { result } = renderHook(() => useAuditoria());
    await esperarCargaInicial(result);

    const totalInicial = result.current.registros.length;

    act(() => {
      result.current.establecerFechaDesde('2026-09-18');
    });
    act(() => {
      result.current.establecerFechaHasta('2026-09-15');
    });

    expect(result.current.mensajeErrorRango).toBe(
      'La fecha «Desde» no puede ser posterior a la fecha «Hasta».'
    );
    expect(result.current.registros.length).toBe(totalInicial);
  });
});

describe('HU-SAT-04 · Escenario 3: historial del mismo elemento, del más antiguo al más reciente', () => {
  it('muestra el historial de un pago registrado y rechazado en orden ascendente', async () => {
    const { result } = renderHook(() => useAuditoria());
    await esperarCargaInicial(result);

    const registroPago = result.current.registros.find((registro) => registro.idElemento === 'PAGO-0006');
    expect(registroPago).toBeDefined();

    act(() => {
      result.current.detalle.abrir(registroPago, null);
    });

    await waitFor(() => expect(result.current.detalle.historial.estado).toBe('listo'), { timeout: 2000 });

    const idsHistorial = result.current.detalle.historial.registros.map((registro) => registro.id);
    // Registrado -> rechazado (orden cronológico ascendente). Tras el rechazo, el apoderado
    // registra un pago NUEVO (PAGO-0007, docs/planes/auditorias.md §E, 2026-11-01).
    expect(idsHistorial).toEqual(['AUD-0006', 'AUD-0013']);

    const fechas = result.current.detalle.historial.registros.map((registro) =>
      new Date(registro.fechaHoraIso).getTime()
    );
    expect(fechas).toEqual([...fechas].sort((a, b) => a - b));
  });

  it('muestra el historial del pago nuevo (registrado tras el rechazo) con su validación', async () => {
    const { result } = renderHook(() => useAuditoria());
    await esperarCargaInicial(result);

    const registroPago = result.current.registros.find((registro) => registro.idElemento === 'PAGO-0007');
    expect(registroPago).toBeDefined();

    act(() => {
      result.current.detalle.abrir(registroPago, null);
    });

    await waitFor(() => expect(result.current.detalle.historial.estado).toBe('listo'), { timeout: 2000 });

    const idsHistorial = result.current.detalle.historial.registros.map((registro) => registro.id);
    expect(idsHistorial).toEqual(['AUD-0014', 'AUD-0007']);
  });
});

describe('HU-SAT-04 · Escenario 5: registro de una operación automática del sistema', () => {
  it('incluye un registro con "Sistema" como autor, con la misma forma que cualquier otro registro', async () => {
    const { result } = renderHook(() => useAuditoria());
    await esperarCargaInicial(result);

    const registroSistema = result.current.registros.find((registro) => registro.usuario.nombre === 'Sistema');
    expect(registroSistema).toBeDefined();
    expect(registroSistema.usuario.rol).toBe('Sistema');
    expect(registroSistema).toHaveProperty('tipoTransaccion');
    expect(registroSistema).toHaveProperty('fecha');
    expect(registroSistema).toHaveProperty('valoresAntes');
    expect(registroSistema).toHaveProperty('valoresDespues');
  });
});

describe('HU-SAT-04 · Selector en cascada: el tipo de transacción depende del módulo', () => {
  it('al cambiar de módulo, el tipo de transacción vuelve a "Todos los tipos"', async () => {
    const { result } = renderHook(() => useAuditoria());
    await esperarCargaInicial(result);

    act(() => {
      result.current.establecerCategoria('PAGOS');
    });
    await waitFor(() => expect(result.current.actualizando).toBe(false));

    act(() => {
      result.current.establecerTipoTransaccion('Validación de pago');
    });
    await waitFor(() => expect(result.current.actualizando).toBe(false));
    expect(result.current.tipoTransaccion).toBe('Validación de pago');

    act(() => {
      result.current.establecerCategoria('NOTAS');
    });
    await waitFor(() => expect(result.current.actualizando).toBe(false));

    expect(result.current.tipoTransaccion).toBe('');
    expect(result.current.registros.every((registro) => registro.modulo.codigo === 'NOTAS')).toBe(true);
    expect(result.current.registros.length).toBeGreaterThan(0);
  });
});
