import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar } = vi.hoisted(() => ({ solicitar: vi.fn() }));

vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  actualizarCompetencia,
  actualizarCurso,
  crearCurso,
  crearCompetenciaCurso,
  eliminarCompetenciaCurso,
  eliminarCurso,
  listarCompetenciasCurso
} from './cursosService.js';

describe('operaciones CRUD de cursos', () => {
  beforeEach(() => solicitar.mockReset());

  it('crea un curso', async () => {
    const curso = { nombre: 'Historia', descripcion: 'Historia universal' };

    await crearCurso(curso);

    expect(solicitar).toHaveBeenCalledWith('/cursos', {
      metodo: 'POST',
      cuerpo: curso
    });
  });

  it('actualiza un curso usando su identificador codificado', async () => {
    const curso = { nombre: 'Historia', descripcion: 'Historia universal' };

    await actualizarCurso('curso/4', curso);

    expect(solicitar).toHaveBeenCalledWith('/cursos/curso%2F4', {
      metodo: 'PUT',
      cuerpo: curso
    });
  });

  it('elimina un curso usando su identificador codificado', async () => {
    await eliminarCurso('curso/4');

    expect(solicitar).toHaveBeenCalledWith('/cursos/curso%2F4', {
      metodo: 'DELETE'
    });
  });

  it('lista las competencias bajo la ruta de su curso', async () => {
    await listarCompetenciasCurso('curso/4');

    expect(solicitar).toHaveBeenCalledWith('/cursos/curso%2F4/competencias', {});
  });

  it('crea una competencia bajo la ruta de su curso', async () => {
    const competencia = { nombre: 'Resuelve problemas', descripcion: 'Descripción' };

    await crearCompetenciaCurso('curso/4', competencia);

    expect(solicitar).toHaveBeenCalledWith('/cursos/curso%2F4/competencias', {
      metodo: 'POST',
      cuerpo: competencia,
      signal: undefined
    });
  });

  it('actualiza una competencia con los IDs de curso y competencia en la ruta', async () => {
    const competencia = { nombre: 'Resuelve problemas', descripcion: 'Descripción' };

    await actualizarCompetencia('curso/4', 'competencia/7', competencia);

    expect(solicitar).toHaveBeenCalledWith(
      '/cursos/curso%2F4/competencias/competencia%2F7',
      { metodo: 'PUT', cuerpo: competencia, signal: undefined }
    );
  });

  it('elimina una competencia bajo la ruta de su curso', async () => {
    await eliminarCompetenciaCurso('curso/4', 'competencia/7');

    expect(solicitar).toHaveBeenCalledWith(
      '/cursos/curso%2F4/competencias/competencia%2F7',
      { metodo: 'DELETE', signal: undefined }
    );
  });
});
