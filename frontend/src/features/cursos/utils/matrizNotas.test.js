import { describe, expect, it } from 'vitest';

import { armarMatrizBimestre, bimestreInicial } from './matrizNotas.js';

const BIMESTRES = [{ id: 'BIM_1', nombre: 'I Bimestre' }, { id: 'BIM_2', nombre: 'II Bimestre' }, { id: 'BIM_3', nombre: 'III Bimestre' }];
const evaluacion = (id, competenciaNombre, bimestreId, fecha, nota = null) => ({
  id, nombre: `Ev ${id}`, competenciaNombre, bimestreId, fecha, nota
});

const DATOS = {
  bimestres: BIMESTRES,
  competencias: [
    { id: '1', nombre: 'Cantidad', notasPorBimestre: { BIM_1: 'A', BIM_2: 'B' } },
    { id: '2', nombre: 'Forma', notasPorBimestre: {} }
  ],
  evaluaciones: [
    evaluacion('3', 'Cantidad', 'BIM_1', '2027-04-02', 'B'),
    evaluacion('1', 'Cantidad', 'BIM_1', '2027-03-10', 'AD'),
    evaluacion('2', 'Forma', 'BIM_1', '2027-03-20'),
    evaluacion('4', 'Cantidad', 'BIM_2', '2027-05-20', 'A')
  ]
};

describe('armarMatrizBimestre', () => {
  it('numera las evaluaciones de cada competencia por fecha y rellena hasta el máximo de columnas', () => {
    const matriz = armarMatrizBimestre(DATOS, 'BIM_1');

    expect(matriz.columnas).toBe(2);
    expect(matriz.filas.map((fila) => fila.nombre)).toEqual(['Cantidad', 'Forma']);
    expect(matriz.filas[0].evaluaciones.map((actual) => actual?.id)).toEqual(['1', '3']);
    expect(matriz.filas[1].evaluaciones.map((actual) => actual?.id)).toEqual(['2', undefined]);
    // Cada fila trae la nota de la competencia en todos los bimestres; no hay nota final del curso.
    expect(matriz.filas[0].notasPorBimestre).toEqual({ BIM_1: 'A', BIM_2: 'B' });
    expect(matriz.filas[1].notasPorBimestre).toEqual({});
    expect(matriz.filas[0]).not.toHaveProperty('notaFinal');
  });

  it('lista las evaluaciones del bimestre por fecha, con su número dentro de la competencia', () => {
    const { evaluaciones } = armarMatrizBimestre(DATOS, 'BIM_1');

    expect(evaluaciones.map((actual) => [actual.id, actual.numero])).toEqual([['1', 1], ['2', 1], ['3', 2]]);
  });

  it('un bimestre sin evaluaciones no tiene columnas pero conserva las competencias', () => {
    const matriz = armarMatrizBimestre(DATOS, 'BIM_3');

    expect(matriz.columnas).toBe(0);
    expect(matriz.evaluaciones).toEqual([]);
    expect(matriz.filas.map((fila) => fila.evaluaciones)).toEqual([[], []]);
  });

  it('agrega una fila por una competencia que aparece en una evaluación pero no en el catálogo', () => {
    const matriz = armarMatrizBimestre(
      { ...DATOS, evaluaciones: [evaluacion('9', 'Otra', 'BIM_1', '2027-03-01', 'C')] },
      'BIM_1'
    );

    expect(matriz.filas.map((fila) => fila.nombre)).toEqual(['Cantidad', 'Forma', 'Otra']);
  });

  it('reconoce el bimestre por su nombre cuando la evaluación no trae el id (datos simulados)', () => {
    const matriz = armarMatrizBimestre({
      ...DATOS,
      evaluaciones: [{ id: '1', nombre: 'Ev', competenciaNombre: 'Cantidad', bimestreNombre: 'II Bimestre', fecha: '2027-05-01', nota: 'A' }]
    }, 'BIM_2');

    expect(matriz.columnas).toBe(1);
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
