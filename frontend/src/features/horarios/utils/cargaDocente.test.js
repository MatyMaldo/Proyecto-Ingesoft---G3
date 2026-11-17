import { describe, expect, it } from 'vitest';

import { calcularCargaDocente, formatearHoras } from './cargaDocente.js';

const sesion = (id, curso, seccionId, inicio, fin, estado = 'FINALIZADA') => ({
  id,
  cursoId: curso === 'Matemáticas' ? 1 : 2,
  cursoNombre: curso,
  seccionId,
  seccionNombre: seccionId === 3 ? 'A' : 'B',
  gradoNombre: '1er Grado',
  horaInicio: `${inicio}:00`,
  horaFin: `${fin}:00`,
  estado
});

describe('calcularCargaDocente', () => {
  it('agrupa por curso y sección, suma horas y deja aparte las omitidas', () => {
    const carga = calcularCargaDocente([
      sesion(1, 'Matemáticas', 3, '08:00', '10:00'),
      sesion(2, 'Matemáticas', 3, '09:00', '10:30', 'PROGRAMADA'),
      sesion(3, 'Matemáticas', 4, '10:00', '11:00'),
      sesion(4, 'Comunicación', 3, '11:30', '12:30'),
      sesion(5, 'Matemáticas', 3, '08:00', '10:00', 'OMITIDA')
    ]);

    expect(carga.filas.map((fila) => [fila.curso, fila.seccion, fila.sesiones, fila.minutos])).toEqual([
      ['Comunicación', '1er Grado A', 1, 60],
      ['Matemáticas', '1er Grado A', 2, 210],
      ['Matemáticas', '1er Grado B', 1, 60]
    ]);
    expect(carga.totalSesiones).toBe(4);
    expect(carga.totalMinutos).toBe(330);
    expect(carga.omitidas).toBe(1);
  });

  it('sin sesiones o con todas omitidas no hay filas ni horas', () => {
    expect(calcularCargaDocente([])).toMatchObject({ filas: [], totalMinutos: 0, omitidas: 0 });
    expect(calcularCargaDocente([sesion(1, 'Matemáticas', 3, '08:00', '10:00', 'OMITIDA')]))
      .toMatchObject({ filas: [], totalMinutos: 0, omitidas: 1 });
  });
});

describe('formatearHoras', () => {
  it('muestra horas y, si hay resto, minutos', () => {
    expect(formatearHoras(300)).toBe('5 h');
    expect(formatearHoras(330)).toBe('5 h 30 min');
    expect(formatearHoras(45)).toBe('0 h 45 min');
  });
});
