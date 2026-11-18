import { describe, expect, it } from 'vitest';

import { buscarAnioAcademicoVigente, elegirAnioProgramacion, resolverAnioProgramacion } from './useHorarios.js';

describe('buscarAnioAcademicoVigente', () => {
  const anioVigente = new Date().getFullYear();
  const anios = [
    { id: 11, anio: anioVigente - 1 },
    { id: 2026, anio: 2026 },
    { id: 13, anio: anioVigente + 1 }
  ];

  it('obtiene el registro y el ID del año académico vigente', () => {
    expect(buscarAnioAcademicoVigente(anios)).toEqual({ id: 2026, anio: 2026 });
  });

  it('acepta los años como texto y devuelve undefined cuando el actual no existe', () => {
    expect(buscarAnioAcademicoVigente([{ id: 7, anio: String(anioVigente) }])).toEqual({
      id: 7,
      anio: String(anioVigente)
    });
    expect(buscarAnioAcademicoVigente(anios, anioVigente + 2)).toBeUndefined();
  });
});

describe('elegirAnioProgramacion', () => {
  const anios = [
    { id: 1, anio: 2027 },
    { id: 2, anio: 2026 },
    { id: 3, anio: 2028 }
  ];
  const periodos = (fechas) => new Map(Object.entries(fechas).map(([id, fechaFin]) => [Number(id), { fechaFin }]));

  it('elige el año cuya matrícula todavía no terminó, aunque no sea el año del calendario', () => {
    // 2026: matrícula terminada en enero; 2027: matrícula abierta hasta febrero de 2027.
    const porAnio = periodos({ 2: '2026-01-31', 1: '2027-02-01', 3: '2028-02-01' });
    expect(elegirAnioProgramacion(anios, porAnio, '2026-11-17')).toEqual({ id: 1, anio: 2027 });
  });

  it('en plena matrícula del año en curso elige ese año', () => {
    const porAnio = periodos({ 2: '2026-01-31', 1: '2027-02-01', 3: '2028-02-01' });
    expect(elegirAnioProgramacion(anios, porAnio, '2026-01-10')).toEqual({ id: 2, anio: 2026 });
  });

  it('el último día de la matrícula todavía cuenta', () => {
    const porAnio = periodos({ 2: '2026-01-31', 1: '2027-02-01' });
    expect(elegirAnioProgramacion(anios, porAnio, '2026-01-31')).toEqual({ id: 2, anio: 2026 });
  });

  it('sin periodos usa el año del calendario y, si no existe, el último registrado', () => {
    const actual = new Date().getFullYear();
    expect(elegirAnioProgramacion([{ id: 9, anio: actual }, { id: 8, anio: actual - 1 }], new Map()))
      .toEqual({ id: 9, anio: actual });
    expect(elegirAnioProgramacion([{ id: 5, anio: 2001 }, { id: 6, anio: 2002 }], new Map()))
      .toEqual({ id: 6, anio: 2002 });
    expect(elegirAnioProgramacion([], new Map())).toBeNull();
  });
});

describe('resolverAnioProgramacion', () => {
  const anios = [
    { id: 1, anio: 2027 },
    { id: 2, anio: 2026 },
    { id: 3, anio: 2028 }
  ];
  const porAnio = new Map([
    [2, { fechaFin: '2026-01-31' }],
    [1, { fechaFin: '2027-02-01' }],
    [3, { fechaFin: '2028-02-01' }]
  ]);

  it('respeta el año elegido aunque otro tenga matrícula abierta', () => {
    expect(resolverAnioProgramacion(anios, porAnio, '3', '2026-11-17'))
      .toEqual({ id: 3, anio: 2028 });
  });

  it('vuelve a la elección automática si el año elegido no existe', () => {
    expect(resolverAnioProgramacion(anios, porAnio, '999', '2026-11-17'))
      .toEqual({ id: 1, anio: 2027 });
  });

  it('sin elección usa la elección automática por periodo', () => {
    expect(resolverAnioProgramacion(anios, porAnio, '', '2026-11-17'))
      .toEqual({ id: 1, anio: 2027 });
  });
});
