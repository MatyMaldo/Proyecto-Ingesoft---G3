import { describe, expect, it } from 'vitest';
import {
  esBimestreFinalizado,
  normalizarContextoTutor
} from './libretasService.js';

describe('normalización del contexto de libretas del tutor', () => {
  it('elimina estudiantes duplicados y conserva el identificador', () => {
    const contexto = normalizarContextoTutor({
      estudiantes: [
        { idEstudiante: 15, nombre: 'Ana' },
        { estudianteId: 15, nombreCompleto: 'Ana Torres', codigo: 'EST-015' },
        { idEstudiante: 20, nombre: 'Luis' }
      ],
      bimestres: []
    });

    expect(contexto.estudiantes).toHaveLength(2);
    expect(contexto.estudiantes[0]).toMatchObject({
      idEstudiante: 15,
      nombreCompleto: 'Ana Torres',
      codigo: 'EST-015'
    });
  });

  it('reconoce variantes usadas por el backend para un bimestre finalizado', () => {
    expect(esBimestreFinalizado({ estado: 'FINALIZADO' })).toBe(true);
    expect(esBimestreFinalizado({ estadoBimestre: 'cerrado' })).toBe(true);
    expect(esBimestreFinalizado({ esFinalizado: true })).toBe(true);
    expect(esBimestreFinalizado({ isFinalizado: 1 })).toBe(true);
    expect(esBimestreFinalizado({ estado: 'EN_CURSO' })).toBe(false);
  });

  it('marca explícitamente finalizado al normalizar el contexto', () => {
    const contexto = normalizarContextoTutor({
      estudiantes: [],
      bimestres: [
        { idBimestre: 3, nombreBimestre: 'BIM_3', estado: 'FINALIZADO' },
        { id: 4, nombre: 'BIM_4', estado: 'EN_CURSO' }
      ]
    });

    expect(contexto.bimestres[0]).toMatchObject({
      id: 3,
      nombre: 'BIM_3',
      finalizado: true
    });
    expect(contexto.bimestres[1].finalizado).toBe(false);
  });
});
