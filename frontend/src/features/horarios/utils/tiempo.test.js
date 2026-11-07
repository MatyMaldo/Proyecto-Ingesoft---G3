import { describe, expect, it } from 'vitest';

import { semanaMasCercana, semanasDelRango } from './tiempo.js';

describe('semanasDelRango', () => {
  it('recorta la primera y la última semana al rango consultado', () => {
    const semanas = semanasDelRango('2026-03-04', '2026-03-18');

    expect(semanas.map((semana) => [semana.inicio, semana.fin])).toEqual([
      ['2026-03-04', '2026-03-06'],
      ['2026-03-09', '2026-03-13'],
      ['2026-03-16', '2026-03-18']
    ]);
    expect(semanas[0].lunes).toBe('2026-03-02');
    expect(semanas[0].viernes).toBe('2026-03-06');
  });

  it('no incluye una semana sin días hábiles dentro del rango', () => {
    // 01/03/2026 es domingo: la semana del 23/02 no tiene ningún día dentro del rango.
    const semanas = semanasDelRango('2026-03-01', '2026-03-13');

    expect(semanas.map((semana) => semana.inicio)).toEqual(['2026-03-02', '2026-03-09']);
  });

  it('devuelve vacío con un rango inválido', () => {
    expect(semanasDelRango('2026-03-10', '2026-03-01')).toEqual([]);
    expect(semanasDelRango('', '2026-03-01')).toEqual([]);
  });
});

describe('semanaMasCercana', () => {
  const semanas = semanasDelRango('2026-03-02', '2026-03-27');

  it('elige la semana que contiene la fecha', () => {
    expect(semanaMasCercana(semanas, '2026-03-11').inicio).toBe('2026-03-09');
  });

  it('en fin de semana elige la semana que acaba de terminar', () => {
    // sábado 14/03/2026
    expect(semanaMasCercana(semanas, '2026-03-14').inicio).toBe('2026-03-09');
  });

  it('antes del rango elige la primera y después del rango la última', () => {
    expect(semanaMasCercana(semanas, '2026-01-10').inicio).toBe('2026-03-02');
    expect(semanaMasCercana(semanas, '2026-11-07').inicio).toBe('2026-03-23');
  });

  it('sin semanas devuelve null', () => {
    expect(semanaMasCercana([], '2026-03-11')).toBeNull();
  });
});
