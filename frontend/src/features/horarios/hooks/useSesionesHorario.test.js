import { describe, expect, it } from 'vitest';

import { calcularRangoSesiones } from './useSesionesHorario.js';

describe('calcularRangoSesiones', () => {
  it('prioriza el inicio del primer bimestre cuando backend lo expone', () => {
    expect(calcularRangoSesiones({
      anio: 2026,
      fechaInicioAnio: '2026-02-20',
      fechaFinAnio: '2026-12-18',
      fechaInicioPrimerBimestre: '2026-03-09',
      fechaFinPeriodo: '2026-02-28'
    })).toEqual({
      fechaMinima: '2026-03-09',
      fechaMaxima: '2026-12-18'
    });
  });

  it('usa el día siguiente al periodo de matrícula cuando no hay bimestre', () => {
    expect(calcularRangoSesiones({
      anio: 2026,
      fechaInicioAnio: '2026-02-20',
      fechaFinAnio: '2026-12-18',
      fechaFinPeriodo: '2026-02-28'
    })).toEqual({
      fechaMinima: '2026-03-01',
      fechaMaxima: '2026-12-18'
    });
  });

  it('cae al inicio del año o al 1 de marzo y limita el fin al 20 de diciembre', () => {
    expect(calcularRangoSesiones({
      anio: 2027,
      fechaInicioAnio: '2027-01-05',
      fechaFinAnio: '2027-12-31'
    })).toEqual({
      fechaMinima: '2027-03-01',
      fechaMaxima: '2027-12-20'
    });
  });
});
