import { describe, expect, it } from 'vitest';

import { armarMatrizBimestre, bimestreInicial } from './matrizNotas.js';

const BIMESTRES = [{ id: 'BIM_1', nombre: 'I Bimestre' }, { id: 'BIM_2', nombre: 'II Bimestre' }, { id: 'BIM_3', nombre: 'III Bimestre' }];
const evaluacion = (id, bimestreId, fecha, nota = null) => ({
  id, nombre: `Ev ${id}`, bimestreId, fecha, nota
});

const DATOS = {
  bimestres: BIMESTRES,
  competencias: [
    { id: '1', nombre: 'Cantidad', notasPorBimestre: { BIM_1: 'A', BIM_2: 'B' } },
    { id: '2', nombre: 'Forma', notasPorBimestre: {} }
  ],
  evaluaciones: [
    evaluacion('3', 'BIM_1', '2027-04-02', 'B'),
    evaluacion('1', 'BIM_1', '2027-03-10', 'AD'),
    evaluacion('2', 'BIM_1', '2027-03-20'),
    evaluacion('4', 'BIM_2', '2027-05-20', 'A')
  ]
};

describe('armarMatrizBimestre', () => {
  it('conserva los logros bimestrales por competencia y lista evaluaciones por fecha, sin asociarlas', () => {
    const matriz = armarMatrizBimestre(DATOS, 'BIM_1');

    expect(matriz.filas.map((fila) => fila.nombre)).toEqual(['Cantidad', 'Forma']);
    expect(matriz.filas[0].notasPorBimestre).toEqual({ BIM_1: 'A', BIM_2: 'B' });
    expect(matriz.filas[1].notasPorBimestre).toEqual({});
    expect(matriz.evaluaciones.map((actual) => actual.id)).toEqual(['1', '2', '3']);
    expect(matriz.evaluaciones[0]).not.toHaveProperty('competenciaNombre');
    expect(matriz).not.toHaveProperty('columnas');
    expect(matriz.filas[0]).not.toHaveProperty('evaluaciones');
    expect(matriz.filas[0]).not.toHaveProperty('notaFinal');
  });

  it('reconoce el bimestre por su nombre cuando la evaluación no trae el id (datos simulados)', () => {
    const matriz = armarMatrizBimestre({
      ...DATOS,
      evaluaciones: [{ id: '1', nombre: 'Ev', bimestreNombre: 'II Bimestre', fecha: '2027-05-01', nota: 'A' }]
    }, 'BIM_2');

    expect(matriz.evaluaciones.map((actual) => actual.id)).toEqual(['1']);
  });

  it('un bimestre sin evaluaciones conserva las competencias y sus notas', () => {
    const matriz = armarMatrizBimestre(DATOS, 'BIM_3');

    expect(matriz.evaluaciones).toEqual([]);
    expect(matriz.filas.map((fila) => fila.nombre)).toEqual(['Cantidad', 'Forma']);
  });
});

describe('bimestreInicial', () => {
  it('es el último bimestre con evaluaciones o notas de competencia', () => {
    expect(bimestreInicial(DATOS)).toBe('BIM_2');
  });

  it('cuenta también un bimestre que solo tiene nota de competencia', () => {
    const datos = { ...DATOS, evaluaciones: [], competencias: [{ ...DATOS.competencias[0], notasPorBimestre: { BIM_3: 'B' } }] };

    expect(bimestreInicial(datos)).toBe('BIM_3');
  });

  it('sin datos abre el primero', () => {
    expect(bimestreInicial({ ...DATOS, evaluaciones: [], competencias: [] })).toBe('BIM_1');
    expect(bimestreInicial({ bimestres: [], evaluaciones: [], competencias: [] })).toBe('');
  });
});
