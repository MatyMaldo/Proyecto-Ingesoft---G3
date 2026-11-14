import { describe, expect, it } from 'vitest';

import { etiquetaPeriodo, tonoPeriodo } from './periodo.js';

describe('estado del periodo de matrícula', () => {
  it('muestra «En preparación» cuando el backend envía SIN_INICIAR', () => {
    expect(etiquetaPeriodo('SIN_INICIAR')).toBe('En preparación');
    expect(tonoPeriodo('SIN_INICIAR')).toBe('ambar');
  });

  it('da texto legible a los demás estados conocidos', () => {
    expect(etiquetaPeriodo('VIGENTE')).toBe('Vigente');
    expect(etiquetaPeriodo('FINALIZADO')).toBe('Finalizado');
    expect(tonoPeriodo('VIGENTE')).toBe('verde');
  });

  it('no deja un estado nuevo del backend como código crudo', () => {
    expect(etiquetaPeriodo('EN_REVISION')).toBe('En revision');
    expect(tonoPeriodo('EN_REVISION')).toBe('gris');
    expect(etiquetaPeriodo(undefined)).toBe('');
  });
});
