import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar: vi.fn() }));
vi.mock('../../../shared/api/configuracionApi.js', () => ({
  USAR_MOCK: false,
  URL_BASE_API: '/api/v1',
  TIEMPO_ESPERA_MS: 15000
}));

import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  consultarCursosEstudiante,
  consultarNotasCursoEstudiante,
  mensajeParaUsuario
} from './cursosEstudianteService.js';

const USUARIO = { id: 5, nombre: 'Luis' };
const ok = (datos) => ({ exitoso: true, datos, mensaje: '' });
const falla = (estado, mensaje = 'Error') => ({ exitoso: false, datos: null, mensaje, estado });

/** Simula la API por ruta (con su query string); lo que no está definido responde 404. */
function simularApi(rutas) {
  solicitar.mockImplementation(async (ruta, opciones = {}) => {
    const query = opciones.parametros ? `?${new URLSearchParams(opciones.parametros)}` : '';
    return rutas[`${ruta}${query}`] ?? falla(404, 'Recurso no encontrado');
  });
}

const MATRICULA_2027 = {
  estudianteId: 5, anioAcademicoId: 1, anio: 2027, estado: 'CONFIRMADA',
  gradoId: 1, gradoNombre: '1er Grado de Secundaria', seccionId: 1, seccionNombre: 'A'
};
const MATRICULA_2026 = { ...MATRICULA_2027, anioAcademicoId: 2, anio: 2026, seccionId: 3 };

const RUTAS_LISTA = {
  '/anios-academicos': ok([{ id: 2, anio: 2026 }, { id: 1, anio: 2027 }]),
  '/matriculas/estudiante/5/seccion?anioId=1': ok(MATRICULA_2027),
  '/matriculas/estudiante/5/seccion?anioId=2': ok(MATRICULA_2026),
  '/asignaciones-curso?gradoId=1&seccionId=1&anioId=1': ok([
    { cursoId: 1, cursoNombre: 'Matemáticas', docenteNombre: 'Juan Perez' },
    { cursoId: 2, cursoNombre: 'Comunicación', docenteNombre: 'Maria Gomez' },
    { cursoId: 1, cursoNombre: 'Matemáticas', docenteNombre: 'Otro docente' }
  ]),
  '/bloques-horario?gradoId=1&anioId=1': ok([
    { cursoId: 1, seccionId: 1, aulaNombre: 'Aula 101' },
    { cursoId: 1, seccionId: 1, aulaNombre: 'Aula 202' },
    { cursoId: 1, seccionId: 1, aulaNombre: 'Aula 202' },
    { cursoId: 2, seccionId: 2, aulaNombre: 'Aula de otra sección' }
  ]),
  '/cursos': ok([
    { id: 1, nombre: 'Matemáticas', descripcion: 'Pensamiento lógico.' },
    { id: 2, nombre: 'Comunicación', descripcion: 'Comprensión lectora.' }
  ])
};

describe('consultarCursosEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usa el año de mayor `anio` con matrícula confirmada y arma las tarjetas con docente, descripción y aula', async () => {
    simularApi(RUTAS_LISTA);

    const respuesta = await consultarCursosEstudiante(USUARIO);

    expect(respuesta.exitoso).toBe(true);
    expect(respuesta.datos).toMatchObject({
      estudiante: { id: 5, nombre: 'Luis' },
      anioConsulta: { id: 1, anio: 2027 },
      gradoNombre: '1er Grado de Secundaria',
      seccionNombre: 'A',
      sinMatricula: false
    });
    // Un curso con dos asignaciones aparece una vez; las aulas van de la más usada a la menos usada y solo las de su sección.
    expect(respuesta.datos.cursos).toEqual([
      { id: '1', nombre: 'Matemáticas', descripcion: 'Pensamiento lógico.', docenteNombre: 'Juan Perez', aulas: ['Aula 202', 'Aula 101'] },
      { id: '2', nombre: 'Comunicación', descripcion: 'Comprensión lectora.', docenteNombre: 'Maria Gomez', aulas: [] }
    ]);
  });

  it('ignora los años sin matrícula (404) o con matrícula no confirmada', async () => {
    simularApi({
      ...RUTAS_LISTA,
      '/matriculas/estudiante/5/seccion?anioId=1': falla(404, 'No se encontró una matrícula vigente'),
      '/matriculas/estudiante/5/seccion?anioId=2': ok({ ...MATRICULA_2026, estado: 'PENDIENTE' })
    });

    const respuesta = await consultarCursosEstudiante(USUARIO);

    expect(respuesta.exitoso).toBe(true);
    expect(respuesta.datos).toMatchObject({ sinMatricula: true, cursos: [], anioConsulta: null });
  });

  it('con una matrícula confirmada solo en el año anterior, consulta ese año', async () => {
    simularApi({
      ...RUTAS_LISTA,
      '/matriculas/estudiante/5/seccion?anioId=1': falla(404),
      '/asignaciones-curso?gradoId=1&seccionId=3&anioId=2': ok([{ cursoId: 1, cursoNombre: 'Matemáticas', docenteNombre: 'Juan Perez' }]),
      '/bloques-horario?gradoId=1&anioId=2': ok([])
    });

    const respuesta = await consultarCursosEstudiante(USUARIO);

    expect(respuesta.datos.anioConsulta).toEqual({ id: 2, anio: 2026 });
    expect(respuesta.datos.cursos.map((curso) => curso.nombre)).toEqual(['Matemáticas']);
  });

  it('informa el fallo si no hay matrícula confirmada y alguna consulta falló por otro motivo', async () => {
    simularApi({
      ...RUTAS_LISTA,
      '/matriculas/estudiante/5/seccion?anioId=1': falla(500, 'Ocurrió un error inesperado'),
      '/matriculas/estudiante/5/seccion?anioId=2': falla(404)
    });

    const respuesta = await consultarCursosEstudiante(USUARIO);

    expect(respuesta.exitoso).toBe(false);
    // Un 500 no muestra detalles técnicos: la vista cae en "Se registró un error inesperado".
    expect(respuesta.mensaje).toBe('');
  });

  it('sigue mostrando los cursos si fallan el aula y la descripción', async () => {
    simularApi({
      ...RUTAS_LISTA,
      '/bloques-horario?gradoId=1&anioId=1': falla(500),
      '/cursos': falla(500)
    });

    const respuesta = await consultarCursosEstudiante(USUARIO);

    expect(respuesta.exitoso).toBe(true);
    expect(respuesta.datos.cursos[0]).toMatchObject({ nombre: 'Matemáticas', descripcion: '', aulas: [] });
  });

  it('falla si no se pueden obtener los cursos de la sección', async () => {
    simularApi({ ...RUTAS_LISTA, '/asignaciones-curso?gradoId=1&seccionId=1&anioId=1': falla(500) });

    const respuesta = await consultarCursosEstudiante(USUARIO);

    expect(respuesta.exitoso).toBe(false);
  });
});

describe('mensajeParaUsuario', () => {
  it('conserva el mensaje de negocio (4xx controlados) y oculta el resto', () => {
    expect(mensajeParaUsuario({ estado: 400, mensaje: 'El estudiante no cuenta con una matrícula confirmada.' }))
      .toBe('El estudiante no cuenta con una matrícula confirmada.');
    expect(mensajeParaUsuario({ estado: 404, mensaje: 'Recurso no encontrado: api/v1/x' })).toBe('');
    expect(mensajeParaUsuario({ estado: 500, mensaje: 'Ocurrió un error inesperado' })).toBe('');
  });
});

const CURSO = { id: '1', nombre: 'Matemáticas', descripcion: 'Pensamiento lógico.', docenteNombre: 'Juan Perez', aulas: ['Aula 101'] };
const CONTEXTO = {
  estudiante: { id: 5, nombre: 'Luis' },
  gradoNombre: '1er Grado de Secundaria',
  seccionNombre: 'A',
  anioConsulta: { id: 1, anio: 2027 }
};
const REVISION = {
  idEstudiante: 5,
  nombreEstudiante: 'Luis Ramirez',
  nombreCurso: '1er Grado de Secundaria',
  nombreSeccion: 'A',
  evaluaciones: [
    { idEvaluacion: 7, nombreEvaluacion: 'Práctica 2', descripcion: null, fecha: '2027-05-10', nombreBimestre: 'BIM_2', nombreCompetencia: 'Resuelve problemas de cantidad', valorNota: null },
    { idEvaluacion: 1, nombreEvaluacion: 'Examen Parcial', descripcion: 'Primeros temas', fecha: '2027-03-20', nombreBimestre: 'BIM_1', nombreCompetencia: 'Resuelve problemas de cantidad', valorNota: 'AD' }
  ],
  notasCompetencias: [
    { nombreCompetencia: 'Resuelve problemas de cantidad', nombreBimestre: 'BIM_1', valorNota: 'AD', conclusionDescriptiva: 'Supera el nivel esperado' }
  ]
};
const COMPETENCIAS = [
  { id: 1, nombre: 'Resuelve problemas de cantidad', descripcion: 'Estrategias de cálculo.', cursoId: 1 },
  { id: 2, nombre: 'Resuelve problemas de forma', descripcion: '', cursoId: 1 }
];

describe('consultarNotasCursoEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adapta la revisión de notas: evaluaciones por fecha, competencias del curso con o sin nota y datos de la tarjeta', async () => {
    simularApi({
      '/estudiantes/5/revision-notas/cursos/1': ok(REVISION),
      '/cursos/1/competencias': ok(COMPETENCIAS)
    });

    const { exitoso, datos } = await consultarNotasCursoEstudiante(USUARIO, CURSO, CONTEXTO);

    expect(exitoso).toBe(true);
    expect(datos.evaluaciones.map((evaluacion) => evaluacion.id)).toEqual(['1', '7']);
    expect(datos.evaluaciones[0]).toMatchObject({
      nombre: 'Examen Parcial',
      bimestreNombre: 'I Bimestre',
      competenciaNombre: 'Resuelve problemas de cantidad',
      nota: 'AD',
      // Curso, grado, sección y docente salen de la tarjeta, no del `nombreCurso` del backend (que trae el grado).
      cursoNombre: 'Matemáticas',
      gradoNombre: '1er Grado de Secundaria',
      seccionNombre: 'A',
      docenteNombre: 'Juan Perez',
      estudianteNombre: 'Luis Ramirez'
    });
    expect(datos.evaluaciones[1].nota).toBeNull();
    expect(datos.curso).toMatchObject({ id: '1', nombre: 'Matemáticas' });
    expect(datos.bimestres.map((bimestre) => bimestre.nombre)).toEqual(['I Bimestre', 'II Bimestre', 'III Bimestre', 'IV Bimestre']);
    expect(datos.competencias).toHaveLength(2);
    // La conclusión descriptiva no se muestra en esta pantalla (HU-EVAL-03): solo la nota de la competencia.
    expect(datos.competencias[0]).toEqual({
      id: '1',
      nombre: 'Resuelve problemas de cantidad',
      descripcion: 'Estrategias de cálculo.',
      notasPorBimestre: { BIM_1: 'AD' }
    });
    expect(datos.competencias[1].notasPorBimestre).toEqual({});
  });

  it('trata el 400 "No hay evaluaciones registradas" como un curso sin evaluaciones, no como un error', async () => {
    simularApi({
      '/estudiantes/5/revision-notas/cursos/1': falla(400, 'No hay evaluaciones registradas para este curso.'),
      '/cursos/1/competencias': ok(COMPETENCIAS)
    });

    const { exitoso, datos } = await consultarNotasCursoEstudiante(USUARIO, CURSO, CONTEXTO);

    expect(exitoso).toBe(true);
    expect(datos.evaluaciones).toEqual([]);
    expect(datos.competencias).toHaveLength(2);
    expect(datos.estudiante.nombre).toBe('Luis');
  });

  it('propaga cualquier otro fallo', async () => {
    simularApi({
      '/estudiantes/5/revision-notas/cursos/1': falla(400, 'El estudiante no cuenta con una matrícula confirmada.'),
      '/cursos/1/competencias': ok(COMPETENCIAS)
    });

    const respuesta = await consultarNotasCursoEstudiante(USUARIO, CURSO, CONTEXTO);

    expect(respuesta.exitoso).toBe(false);
    expect(respuesta.mensaje).toBe('El estudiante no cuenta con una matrícula confirmada.');
  });

  it('pide las notas con el id de la sesión y el del curso', async () => {
    simularApi({ '/estudiantes/5/revision-notas/cursos/1': ok(REVISION) });

    await consultarNotasCursoEstudiante(USUARIO, CURSO, CONTEXTO);

    expect(solicitar).toHaveBeenCalledWith('/estudiantes/5/revision-notas/cursos/1');
  });
});
