import { describe, expect, it } from 'vitest';

import { buscarAnioAcademicoVigente } from './useHorarios.js';

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
