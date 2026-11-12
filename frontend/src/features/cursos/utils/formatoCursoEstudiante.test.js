import { describe, expect, it } from 'vitest';

import { abreviarGrado, formatearFecha, textoDocente } from './formatoCursoEstudiante.js';

describe('formatoCursoEstudiante', () => {
  it('abrevia el grado como el prototipo', () => {
    expect(abreviarGrado('1er Grado de Secundaria')).toBe('1er Grado');
    expect(abreviarGrado('4to Grado')).toBe('4to Grado');
    expect(abreviarGrado(undefined)).toBe('');
  });

  it('antepone "Prof." al docente sin repetirlo', () => {
    expect(textoDocente('Juan Perez')).toBe('Prof. Juan Perez');
    expect(textoDocente('Prof. Quispe')).toBe('Prof. Quispe');
    expect(textoDocente('  ')).toBe('');
    expect(textoDocente(null)).toBe('');
  });

  it('da formato corto a una fecha ISO y deja intacto lo que no puede interpretar', () => {
    expect(formatearFecha('2027-03-20')).toMatch(/^20 mar\.? 2027$|^20 mar 2027$/);
    expect(formatearFecha('sin fecha')).toBe('sin fecha');
    expect(formatearFecha(null)).toBe('');
  });
});
