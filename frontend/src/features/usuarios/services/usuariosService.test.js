import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar } = vi.hoisted(() => ({ solicitar: vi.fn() }));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  cambiarEstadoUsuario,
  listarUsuarios,
  listarSeccionesTutor,
  actualizarUsuario,
  registrarApoderado,
  registrarDocente,
  registrarEstudiante
} from './usuariosService.js';

describe('usuariosService', () => {
  beforeEach(() => {
    solicitar.mockReset();
  });

  it('consulta usuarios paginados y adapta los datos al modelo de la pantalla', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        last: true,
        content: [{
          id: 12,
          nombre: 'Juan',
          apellidoPaterno: 'Pérez',
          apellidoMaterno: 'García',
          nombreCompleto: 'Juan Pérez García',
          dni: '87654321',
          email: 'juan@example.com',
          tipoUsuario: 'DOCENTE',
          activo: true
        }]
      },
      mensaje: ''
    });

    const resultado = await listarUsuarios({ activo: true });

    expect(solicitar).toHaveBeenCalledWith('/usuarios', {
      parametros: { page: 0, size: 100, tipoUsuario: undefined, activo: true }
    });
    expect(resultado.datos).toEqual([{
      id: 12,
      nombre: 'Juan',
      apellido: 'Pérez García',
      dni: '87654321',
      rol: 'Docente',
      correo: 'juan@example.com',
      activo: true,
      telefono: '',
      codigoEstudiante: undefined,
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'García'
    }]);
  });

  it('informa cuando la respuesta paginada no contiene content', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: {}, mensaje: '' });

    const resultado = await listarUsuarios();

    expect(resultado).toMatchObject({
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió un formato de listado de usuarios no válido.'
    });
  });

  it('solicita las páginas siguientes hasta llegar a la última', async () => {
    solicitar
      .mockResolvedValueOnce({
        exitoso: true,
        datos: { content: [{ id: 1, tipoUsuario: 'ESTUDIANTE' }], last: false },
        mensaje: ''
      })
      .mockResolvedValueOnce({
        exitoso: true,
        datos: { content: [{ id: 2, tipoUsuario: 'DOCENTE' }], last: true },
        mensaje: ''
      });

    const resultado = await listarUsuarios();

    expect(solicitar).toHaveBeenNthCalledWith(1, '/usuarios', {
      parametros: { page: 0, size: 100, tipoUsuario: undefined, activo: undefined }
    });
    expect(solicitar).toHaveBeenNthCalledWith(2, '/usuarios', {
      parametros: { page: 1, size: 100, tipoUsuario: undefined, activo: undefined }
    });
    expect(resultado.datos.map(usuario => usuario.id)).toEqual([1, 2]);
  });

  it('registra estudiante con el DTO esperado y adapta la respuesta', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        id: 31,
        nombre: 'Carlos',
        apellidoPaterno: 'López',
        apellidoMaterno: 'García',
        nombreCompleto: 'Carlos López García',
        dni: '12345678',
        email: 'carlos@example.com',
        telefono: '987654321',
        codigo: 'EST-001',
        activo: true
      },
      mensaje: ''
    });
    const request = {
      nombre: 'Carlos',
      apellidoPaterno: 'López',
      apellidoMaterno: 'García',
      dni: '12345678',
      email: 'carlos@example.com',
      telefono: '+51987654321',
      password: 'Password123',
      codigo: 'EST-001',
      fechaNacimiento: '2010-05-15',
      apoderadoId: 10
    };

    const resultado = await registrarEstudiante(request);

    expect(solicitar).toHaveBeenCalledWith('/usuarios/estudiantes', {
      metodo: 'POST',
      cuerpo: request
    });
    expect(resultado.datos).toMatchObject({
      id: 31,
      nombre: 'Carlos',
      apellido: 'López García',
      rol: 'Estudiante',
      codigoEstudiante: 'EST-001'
    });
  });

  it.each([
    ['apoderado', registrarApoderado, '/usuarios/apoderados', { edad: 35 }],
    ['docente', registrarDocente, '/usuarios/docentes', {}]
  ])('registra %s con su endpoint y transforma la respuesta', async (rol, registrar, ruta, camposExtra) => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        id: 52,
        nombre: 'Juan',
        apellidoPaterno: 'Pérez',
        apellidoMaterno: 'García',
        nombreCompleto: 'Juan Pérez García',
        dni: '12345678',
        email: 'juan@example.com',
        telefono: '987654321',
        activo: true
      },
      mensaje: ''
    });
    const request = {
      nombre: 'Juan',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'García',
      dni: '12345678',
      email: 'juan@example.com',
      telefono: '987654321',
      password: 'Password123',
      ...camposExtra
    };

    const resultado = await registrar(request);

    expect(solicitar).toHaveBeenCalledWith(ruta, { metodo: 'POST', cuerpo: request });
    expect(resultado.datos).toMatchObject({
      id: 52,
      nombre: 'Juan',
      apellido: 'Pérez García',
      rol: rol === 'apoderado' ? 'Apoderado' : 'Docente'
    });
  });

  it('envía PATCH únicamente al usuario seleccionado y adapta la respuesta', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        id: 12,
        nombre: 'Carlos',
        apellidoPaterno: 'Pérez',
        apellidoMaterno: 'García',
        nombreCompleto: 'Carlos Pérez García',
        dni: '12345678',
        username: '12345678',
        email: 'carlos@example.com',
        telefono: '987654321',
        tipoUsuario: 'ESTUDIANTE',
        activo: true
      },
      mensaje: ''
    });
    const request = { nombre: 'Carlos', telefono: '987654321' };

    const resultado = await actualizarUsuario(12, request);

    expect(solicitar).toHaveBeenCalledWith('/usuarios/12', {
      metodo: 'PATCH',
      cuerpo: request
    });
    expect(resultado.datos).toMatchObject({
      id: 12,
      nombre: 'Carlos',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'García',
      rol: 'Estudiante',
      correo: 'carlos@example.com'
    });
  });

  it.each([
    [true, '/usuarios/12/desactivar'],
    [false, '/usuarios/12/reactivar']
  ])('usa PATCH para cambiar activo=%s', async (activo, ruta) => {
    solicitar.mockResolvedValue({ exitoso: true, datos: null, mensaje: '' });

    await cambiarEstadoUsuario(12, activo);

    expect(solicitar).toHaveBeenCalledWith(ruta, { metodo: 'PATCH' });
  });

  it('lista sección y grado asignados al tutor seleccionado', async () => {
    solicitar
      .mockResolvedValueOnce({
        exitoso: true,
        datos: [
          { id: 8, nombre: 'A', gradoId: 2, tutorId: 12, anioAcademico: 2027 },
          { id: 9, nombre: 'B', gradoId: 2, tutorId: 15 }
        ],
        mensaje: ''
      })
      .mockResolvedValueOnce({
        exitoso: true,
        datos: [{ id: 2, nombre: 'Primero de secundaria' }],
        mensaje: ''
      });

    const resultado = await listarSeccionesTutor(12);

    expect(solicitar).toHaveBeenNthCalledWith(1, '/secciones');
    expect(solicitar).toHaveBeenNthCalledWith(2, '/grados');
    expect(resultado.datos).toEqual([{
      seccionNombre: 'A',
      gradoNombre: 'Primero de secundaria',
      anioAcademico: 2027
    }]);
  });

  it('informa si no puede identificar el grado de una sección asignada', async () => {
    solicitar
      .mockResolvedValueOnce({
        exitoso: true,
        datos: [{ id: 8, nombre: 'A', gradoId: 2, tutorId: 12 }],
        mensaje: ''
      })
      .mockResolvedValueOnce({ exitoso: true, datos: [], mensaje: '' });

    const resultado = await listarSeccionesTutor(12);

    expect(resultado).toMatchObject({
      exitoso: false,
      datos: null,
      mensaje: 'No fue posible identificar la sección y el grado asignados al docente.'
    });
  });
});
