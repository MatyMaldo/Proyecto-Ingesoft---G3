import { beforeEach, describe, expect, it, vi } from 'vitest';

const solicitar = vi.hoisted(() => vi.fn(async () => ({
  exitoso: true,
  datos: null,
  mensaje: ''
})));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  consultarCatalogos,
  actualizarBloqueHorario,
  actualizarAsignacion,
  cargarBloquesCsv,
  crearBloqueHorario,
  crearAsignacion,
  descargarPlantillaBloquesCsv,
  eliminarAsignacion,
  eliminarBloqueHorario,
  generarSesiones,
  listarAsignaciones,
  listarBloquesHorario,
  listarSesiones,
  obtenerAsignacion,
  obtenerBloqueHorario,
  previsualizarSesiones,
  guardarHorario
} from './horariosService.js';

beforeEach(() => solicitar.mockClear());

describe('servicio de horarios · contrato API v1', () => {
  it('carga los catálogos desde los endpoints publicados y asocia sección, grado y año', async () => {
    solicitar
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 2, nombre: 'Primero' }] })
      .mockResolvedValueOnce({
        exitoso: true,
        datos: [{ id: 7, nombre: 'A', gradoId: 2, anioId: 2026 }]
      })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 3, nombre: 'Matemáticas' }] })
      .mockResolvedValueOnce({ exitoso: true, datos: [{ id: 4, nombre: 'Aula 101' }] })
      .mockResolvedValueOnce({
        exitoso: true,
        datos: [{ id: 2026, anio: 2026, fechaInicio: '2026-01-01', fechaFin: '2026-12-31' }]
      })
      .mockResolvedValueOnce({
        exitoso: true,
        datos: {
          content: [
            { id: 9, nombreCompleto: 'Rosa García', activo: true },
            { id: 10, nombreCompleto: 'Docente inactivo', activo: false }
          ],
          totalElements: 2,
          totalPages: 1,
          number: 0,
          size: 100
        }
      });

    const respuesta = await consultarCatalogos();

    expect(solicitar.mock.calls).toEqual([
      ['/grados'],
      ['/secciones'],
      ['/cursos'],
      ['/aulas'],
      ['/anios-academicos'],
      ['/usuarios', {
        parametros: { tipoUsuario: 'DOCENTE', activo: true, page: 0, size: 100 }
      }]
    ]);
    expect(respuesta.exitoso).toBe(true);
    expect(respuesta.datos.secciones[0]).toMatchObject({
      id: 7,
      nombre: 'A',
      gradoId: 2,
      anioAcademicoId: 2026,
      anioAcademico: 2026
    });
    expect(respuesta.datos.docentes).toEqual([
      { id: 9, nombreCompleto: 'Rosa García', activo: true, nombre: 'Rosa García' }
    ]);
  });

  it('identifica el endpoint de catálogo fallido en su mensaje de error', async () => {
    solicitar
      .mockResolvedValueOnce({ exitoso: true, datos: [] })
      .mockResolvedValueOnce({ exitoso: false, datos: null, mensaje: 'No autorizado.' });

    const respuesta = await consultarCatalogos();

    expect(respuesta.exitoso).toBe(false);
    expect(respuesta.mensaje).toBe('No se pudo cargar /secciones: No autorizado.');
    expect(solicitar).toHaveBeenCalledTimes(6);
  });

  it('consulta las asignaciones con los filtros contractuales', async () => {
    await listarAsignaciones({
      gradoId: '2',
      seccion: 'A',
      seccionId: '7',
      anioAcademicoId: '2026'
    });

    expect(solicitar).toHaveBeenCalledWith('/asignaciones-curso', {
      parametros: { gradoId: 2, seccionId: 7, anioId: 2026 }
    });
  });

  it('crea, obtiene, actualiza y elimina asignaciones usando los DTO del contrato', async () => {
    await crearAsignacion({ cursoId: '4', docenteId: '9', seccionId: '7' });
    await obtenerAsignacion(23);
    await actualizarAsignacion(23, { cursoId: '5', docenteId: '10' });
    await eliminarAsignacion(23);

    expect(solicitar.mock.calls).toEqual([
      ['/asignaciones-curso', {
        metodo: 'POST',
        cuerpo: { cursoId: 4, docenteId: 9, seccionId: 7 }
      }],
      ['/asignaciones-curso/23'],
      ['/asignaciones-curso/23', {
        metodo: 'PUT',
        cuerpo: { cursoId: 5, docenteId: 10 }
      }],
      ['/asignaciones-curso/23', { metodo: 'DELETE' }]
    ]);
  });

  it('lista y administra bloques en las rutas documentadas', async () => {
    await listarBloquesHorario({ seccionId: 3, anioId: 2026 });
    await crearBloqueHorario({
      asignacionCursoId: 8,
      aulaId: 4,
      diaSemana: 'LUNES',
      horaInicio: '08:00',
      horaFin: '09:00'
    });
    await obtenerBloqueHorario(12);
    await actualizarBloqueHorario(12, { diaSemana: 'MARTES' });
    await eliminarBloqueHorario(12);

    expect(solicitar.mock.calls).toEqual([
      ['/bloques-horario', { parametros: { seccionId: 3, anioId: 2026 } }],
      ['/bloques-horario', { metodo: 'POST', cuerpo: expect.objectContaining({ asignacionCursoId: 8 }) }],
      ['/bloques-horario/12'],
      ['/bloques-horario/12', { metodo: 'PUT', cuerpo: { diaSemana: 'MARTES' } }],
      ['/bloques-horario/12', { metodo: 'DELETE' }]
    ]);
  });

  it('usa la plantilla CSV y multipart con los campos establecidos', async () => {
    const archivo = new File(['csv'], 'horarios.csv', { type: 'text/csv' });
    await descargarPlantillaBloquesCsv();
    await cargarBloquesCsv(archivo, 2026);

    expect(solicitar).toHaveBeenNthCalledWith(1, '/bloques-horario/plantilla-csv', {
      respuestaArchivo: true
    });
    const [ruta, opciones] = solicitar.mock.calls[1];
    expect(ruta).toBe('/bloques-horario/carga-masiva');
    expect(opciones.metodo).toBe('POST');
    expect(opciones.cuerpoFormulario.get('file')).toBe(archivo);
    expect(opciones.cuerpoFormulario.get('anioAcademicoId')).toBe('2026');
  });

  it('construye las consultas y generación de sesiones según el contrato', async () => {
    const rango = {
      anioAcademicoId: 2026,
      seccionId: 3,
      fechaInicio: '2026-01-01',
      fechaFin: '2026-12-31'
    };
    await previsualizarSesiones(rango);
    await generarSesiones({ ...rango, sesionesOmitidas: [{ fecha: '2026-01-15', motivo: 'Feriado' }] });
    await listarSesiones({ seccionId: 3, fechaInicio: rango.fechaInicio, fechaFin: rango.fechaFin });

    expect(solicitar.mock.calls).toEqual([
      ['/sesiones-clase/preview', { metodo: 'POST', cuerpo: rango }],
      ['/sesiones-clase/generar', {
        metodo: 'POST',
        cuerpo: { ...rango, sesionesOmitidas: [{ fecha: '2026-01-15', motivo: 'Feriado' }] }
      }],
      ['/sesiones-clase', {
        parametros: { seccionId: 3, fechaInicio: rango.fechaInicio, fechaFin: rango.fechaFin }
      }]
    ]);
  });

  it('guarda los cambios de matriz usando CRUD por bloque', async () => {
    await guardarHorario({
      seccion: 3,
      bloquesGuardados: {
        'LUNES|F1': { id: 11, asignacionId: 21, aulaId: 31 },
        'MARTES|F1': { id: 12, asignacionId: 22, aulaId: 32 }
      },
      bloques: {
        'LUNES|F1': { id: 11, asignacionId: 21, aulaId: 33 },
        'MIERCOLES|F2': { asignacionId: 23, aulaId: 34 }
      }
    });

    expect(solicitar.mock.calls).toEqual([
      ['/bloques-horario/11', {
        metodo: 'PUT',
        cuerpo: {
          asignacionCursoId: 21,
          aulaId: 33,
          diaSemana: 'LUNES',
          horaInicio: '08:00',
          horaFin: '09:00'
        }
      }],
      ['/bloques-horario/12', { metodo: 'DELETE' }],
      ['/bloques-horario', {
        metodo: 'POST',
        cuerpo: {
          asignacionCursoId: 23,
          aulaId: 34,
          diaSemana: 'MIERCOLES',
          horaInicio: '09:00',
          horaFin: '10:00'
        }
      }]
    ]);
  });
});
