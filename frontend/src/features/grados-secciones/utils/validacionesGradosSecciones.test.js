import { describe, expect, it } from 'vitest';
import { validarSeccion } from './validacionesGradosSecciones.js';

const seccionValida = {
  anioAcademicoId: '1',
  gradoId: '1',
  nombre: 'A',
  capacidadMaxima: '30',
  tutorId: '1'
};

describe('validarSeccion', () => {
  it.each(['A', 'b', 'Z'])('acepta la letra %s', (nombre) => {
    expect(validarSeccion({ ...seccionValida, nombre })).not.toHaveProperty('nombre');
  });

  it.each(['AB', '1', 'Ñ', 'A1'])('rechaza "%s" como nombre de sección', (nombre) => {
    expect(validarSeccion({ ...seccionValida, nombre }).nombre)
      .toBe('La sección debe ser una sola letra de la A a la Z.');
  });

  it('requiere seleccionar un tutor', () => {
    expect(validarSeccion({ ...seccionValida, tutorId: '' }).tutorId).toBe('Selecciona un tutor.');
  });

  it('permite quitar el tutor al editar una sección', () => {
    expect(validarSeccion({ ...seccionValida, tutorId: '' }, { exigirTutor: false })).not.toHaveProperty('tutorId');
  });
});
