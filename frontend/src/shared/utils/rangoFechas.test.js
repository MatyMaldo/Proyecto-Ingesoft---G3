import { describe, it, expect } from 'vitest';

import { obtenerMensajeRangoFechas, MENSAJE_RANGO_FECHAS_INVALIDO } from './rangoFechas.js';

describe('HU-SAT-06 · Escenario filtro combinado: rango de fechas inválido (Desde posterior a Hasta)', () => {
  it('no marca error cuando los dos extremos están vacíos', () => {
    expect(obtenerMensajeRangoFechas('', '')).toBe('');
  });

  it('no marca error cuando solo "Desde" tiene valor', () => {
    expect(obtenerMensajeRangoFechas('2026-09-15', '')).toBe('');
  });

  it('no marca error cuando solo "Hasta" tiene valor', () => {
    expect(obtenerMensajeRangoFechas('', '2026-09-15')).toBe('');
  });

  it('no marca error cuando "Desde" es anterior o igual a "Hasta"', () => {
    expect(obtenerMensajeRangoFechas('2026-09-15', '2026-09-18')).toBe('');
    expect(obtenerMensajeRangoFechas('2026-09-15', '2026-09-15')).toBe('');
  });

  it('devuelve el mensaje exacto cuando "Desde" es posterior a "Hasta"', () => {
    const mensaje = obtenerMensajeRangoFechas('2026-09-18', '2026-09-15');
    expect(mensaje).toBe(MENSAJE_RANGO_FECHAS_INVALIDO);
    expect(mensaje).toBe('La fecha «Desde» no puede ser posterior a la fecha «Hasta».');
  });
});
