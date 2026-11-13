import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar } = vi.hoisted(() => ({ solicitar: vi.fn() }));

vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));
vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));

import {
  crearEvaluacion,
  guardarNotaEvaluacion,
  guardarNotasCompetencias,
  listarBimestresAnio,
  listarContextoDocenteEvaluaciones,
  listarEstudiantesAsignacion,
  listarEvaluaciones,
  listarNotasCompetencias,
  listarNotasEvaluacion
} from './evaluacionesService.js';

describe('contratos del servicio de evaluaciones', () => {
  beforeEach(() => solicitar.mockReset());

  it('adapta el contexto implementado al modelo que consume la pantalla', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        anioAcademico: { id: 2026, anio: 2026, fechaInicio: '2026-01-01', fechaFin: '2026-12-31' },
        asignaciones: [{
          idAsignacionCurso: 91,
          idCurso: 3,
          nombreCurso: 'Matemática',
          idSeccion: 7,
          nombreSeccion: 'A',
          idGrado: 2,
          nombreGrado: 'Primero'
        }],
        bimestres: [{
          id: 4,
          nombre: 'I_BIMESTRE',
          fechaInicio: '2026-03-01',
          fechaFin: '2026-05-01',
          finalizado: true
        }],
        secciones: [],
        competencias: [{ id: 5, nombre: 'Resuelve problemas', idCurso: 3 }]
      }
    });

    const respuesta = await listarContextoDocenteEvaluaciones({ id: 12, nombre: 'Docente' });

    expect(solicitar).toHaveBeenCalledWith('/evaluaciones/contexto-docente');
    expect(respuesta.datos.asignaciones[0]).toMatchObject({
      cursoId: 3,
      cursoNombre: 'Matemática',
      competencias: [{ id: 5, nombre: 'Resuelve problemas' }],
      secciones: [{
        id: 7,
        idAsignacionCurso: 91,
        nombre: 'A',
        gradoNombre: 'Primero'
      }]
    });
    expect(respuesta.datos.bimestres[0]).toMatchObject({
      inicio: '2026-03-01',
      fin: '2026-05-01',
      finalizado: true
    });
  });

  it('consulta bimestres por año y normaliza sus fechas', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: [{
        id: 4,
        nombre: 'BIM_1',
        fechaInicio: '2026-03-01',
        fechaFin: '2026-05-01',
        finalizado: true
      }]
    });

    const respuesta = await listarBimestresAnio(2026);

    expect(solicitar).toHaveBeenCalledWith('/anios-academicos/2026/bimestres');
    expect(respuesta.datos[0]).toMatchObject({
      nombre: 'I Bimestre',
      inicio: '2026-03-01',
      fin: '2026-05-01',
      finalizado: true
    });
  });

  it('obtiene estudiantes confirmados desde la asignación y compone sus nombres', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: [
        {
          idEstudiante: 8,
          codigo: 'MAT-2026-008',
          nombre: 'Ana',
          apellidoPaterno: 'Pérez',
          apellidoMaterno: 'Díaz',
          estadoMatricula: 'CONFIRMADA'
        },
        {
          idEstudiante: 9,
          nombre: 'Luis',
          apellidoPaterno: 'Rojas',
          apellidoMaterno: '',
          estadoMatricula: 'CANCELADA'
        }
      ]
    });

    const respuesta = await listarEstudiantesAsignacion(91);

    expect(solicitar).toHaveBeenCalledWith('/asignaciones-curso/91/estudiantes');
    expect(respuesta.datos).toEqual([expect.objectContaining({
      id: 8,
      nombre: 'Ana Pérez Díaz',
      codigo: 'MAT-2026-008',
      estadoMatricula: 'CONFIRMADA',
      activo: true
    })]);
  });

  it('consulta evaluaciones por asignación y asocia los identificadores que no vienen en la respuesta', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: [{
        id: 20,
        nombre: 'Control',
        descripcion: 'Unidad 1',
        fecha: '2026-04-01',
        nombreBimestre: 'I_BIMESTRE',
        nombreCompetencia: 'Resuelve problemas',
        nombreCurso: 'Matemática',
        nombreSeccion: 'A'
      }]
    });
    const asignacion = { idAsignacionCurso: 91, cursoId: 3, cursoNombre: 'Matemática', seccionId: 7 };
    const anioAcademico = { id: 2026, anio: 2026 };

    const respuesta = await listarEvaluaciones(91, asignacion, anioAcademico);

    expect(solicitar).toHaveBeenCalledWith('/evaluaciones', { parametros: { idAsignacionCurso: 91 } });
    expect(respuesta.datos[0]).toMatchObject({
      id: 20,
      cursoId: 3,
      seccionId: 7,
      idAsignacionCurso: 91,
      competenciaNombre: 'Resuelve problemas',
      anioAcademicoId: 2026
    });
  });

  it('crea evaluaciones enviando solo los campos del contrato', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: { id: 20, nombre: 'Control' } });
    const datos = {
      nombre: 'Control',
      descripcion: 'Unidad 1',
      fecha: '2026-04-01',
      idCompetencia: '5',
      idAsignacionCurso: '91'
    };
    const asignacion = {
      idAsignacionCurso: 91,
      cursoId: 3,
      cursoNombre: 'Matemática',
      seccionId: 7,
      seccionNombre: 'A',
      anioAcademico: { id: 2026, anio: 2026 }
    };

    await crearEvaluacion(datos, asignacion, { id: 12 }, { nombre: 'Resuelve problemas' });

    expect(solicitar).toHaveBeenCalledWith('/evaluaciones', {
      metodo: 'POST',
      cuerpo: {
        nombre: 'Control',
        descripcion: 'Unidad 1',
        fecha: '2026-04-01',
        idCompetencia: 5,
        idAsignacionCurso: 91
      }
    });
  });

  it('registra una nota con POST y adapta la respuesta al modelo de la pantalla', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        idNota: 30,
        idEvaluacion: 20,
        nombreEvaluacion: 'Control',
        idEstudiante: 8,
        nombreEstudiante: 'Ana',
        valorNota: 'AD',
        fechaRegistro: '2026-04-02'
      }
    });
    const evaluacion = { id: 20, anioAcademicoId: 2026 };

    const respuesta = await guardarNotaEvaluacion(
      evaluacion,
      { id: '8' },
      'AD',
      {},
      { id: 2026 }
    );

    expect(solicitar).toHaveBeenCalledWith('/evaluaciones/20/notas', {
      metodo: 'POST',
      cuerpo: { idEstudiante: 8, valorNota: 'AD' }
    });
    expect(respuesta.datos).toMatchObject({
      idNota: 30,
      evaluacionId: 20,
      estudianteId: 8,
      estudianteNombre: 'Ana',
      nota: 'AD'
    });
  });

  it('consulta notas de evaluación y adapta los campos de identificación', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: [{
        idNota: 30,
        idEvaluacion: 20,
        idEstudiante: 8,
        nombreEstudiante: 'Ana',
        valorNota: 'A'
      }]
    });

    const respuesta = await listarNotasEvaluacion({ id: 20 });

    expect(solicitar).toHaveBeenCalledWith('/evaluaciones/20/notas');
    expect(respuesta.datos[0]).toMatchObject({
      estudianteId: 8,
      estudianteNombre: 'Ana',
      nota: 'A'
    });
  });

  it('consulta notas de competencias con filtros válidos del contrato', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: [{
        idCompetencia: 5,
        nombreCompetencia: 'Resuelve problemas',
        nombreBimestre: 'I_BIMESTRE',
        valorNota: 'A',
        conclusionDescriptiva: 'Buen avance'
      }]
    });

    const respuesta = await listarNotasCompetencias(3, 4, 8, [{ id: 5, nombre: 'Resuelve problemas' }]);

    expect(solicitar).toHaveBeenCalledWith('/notas-competencias', {
      parametros: { idEstudiante: 8, idBimestre: 4, idCurso: 3 }
    });
    expect(respuesta.datos[0]).toMatchObject({
      competenciaId: 5,
      nota: 'A',
      nombre: 'Resuelve problemas'
    });
  });

  it('asocia notas de competencias por ID aunque existan nombres repetidos', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: [{
        idCompetencia: 6,
        nombreCompetencia: 'Resuelve problemas',
        nombreBimestre: 'I_BIMESTRE',
        valorNota: 'AD',
        conclusionDescriptiva: 'Avance destacado'
      }]
    });

    const respuesta = await listarNotasCompetencias(3, 4, 8, [
      { id: 5, nombre: 'Resuelve problemas' },
      { id: 6, nombre: 'Resuelve problemas' }
    ]);

    expect(respuesta.datos[0].competenciaId).toBe(6);
  });

  it('registra notas finales con el método, ruta y contrato implementados', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: {} });

    await guardarNotasCompetencias({}, {
      idAsignacionCurso: '91',
      idEstudiante: '8',
      idBimestre: '4',
      idCurso: 3,
      idSeccion: 7,
      estudianteNombre: 'Ana',
      calificaciones: [{
        idCompetencia: 5,
        nombre: 'Resuelve problemas',
        valorNota: 'A',
        conclusionDescriptiva: '  Buen avance  '
      }]
    });

    expect(solicitar).toHaveBeenCalledWith('/notas-competencias', {
      metodo: 'POST',
      cuerpo: {
        idAsignacionCurso: 91,
        idEstudiante: 8,
        idBimestre: 4,
        calificaciones: [{
          idCompetencia: 5,
          valorNota: 'A',
          conclusionDescriptiva: 'Buen avance'
        }]
      }
    });
  });
});
