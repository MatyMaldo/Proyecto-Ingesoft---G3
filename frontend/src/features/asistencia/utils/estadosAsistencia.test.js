import { describe, expect, it } from 'vitest';

import { formatearHoraRegistro, resumirAsistencia } from './estadosAsistencia.js';

describe('resumirAsistencia', () => {
  it('cuenta asistió y tardanza como asistencia y deja fuera las justificadas del porcentaje', () => {
    const resumen = resumirAsistencia([
      { estado: 'PRESENTE' },
      { estado: 'TARDANZA' },
      { estado: 'FALTA' },
      { estado: 'JUSTIFICADA' },
      { estado: 'JUSTIFICADA' }
    ]);

    expect(resumen.justificadas).toBe(2);
    expect(resumen.porcentaje).toBe(66.67);
  });

  it('devuelve 0 cuando solo hay justificadas o no hay registros', () => {
    expect(resumirAsistencia([{ estado: 'JUSTIFICADA' }]).porcentaje).toBe(0);
    expect(resumirAsistencia([]).porcentaje).toBe(0);
  });
});

describe('formatearHoraRegistro', () => {
  it('muestra HH:MM en 24 horas y «—» si no hay hora', () => {
    expect(formatearHoraRegistro('2026-11-17T09:34:28')).toBe('09:34');
    expect(formatearHoraRegistro('2026-11-17T14:05:00')).toBe('14:05');
    expect(formatearHoraRegistro(null)).toBe('—');
    expect(formatearHoraRegistro('no-es-fecha')).toBe('—');
  });
});
