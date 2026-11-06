import { afterEach, describe, expect, it, vi } from 'vitest';

import { solicitar, configurarCliente } from './clienteHttp.js';

afterEach(() => {
  vi.unstubAllGlobals();
  configurarCliente();
});

describe('cliente HTTP · errores con detalle', () => {
  it('conserva `datos` cuando el backend responde 4xx con el detalle por fila', async () => {
    const detalle = { filasProcesadas: 2, bloquesCreados: 0, errores: [{ fila: 2, mensaje: 'Aula inexistente' }] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ datos: detalle, error: null }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/bloques-horario/carga-masiva', { metodo: 'POST' });

    expect(respuesta).toMatchObject({ exitoso: false, datos: detalle, estado: 400 });
  });
});

describe('cliente HTTP · formatos de respuesta exitosa del backend', () => {
  it('extrae el contenido cuando el backend responde con la propiedad datos', async () => {
    const cursos = [{ id: 1, nombre: 'Matemáticas', descripcion: 'Curso' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ datos: cursos, error: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/cursos');

    expect(respuesta).toEqual({ exitoso: true, datos: cursos, mensaje: '' });
  });

  it('acepta el objeto raíz usado por el endpoint de login', async () => {
    const login = {
      token: 'jwt-token',
      usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' }
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify(login),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/auth/login', {
      metodo: 'POST',
      cuerpo: {
        identificador: 'admin@example.com',
        password: 'password'
      }
    });

    expect(respuesta).toEqual({ exitoso: true, datos: login, mensaje: '' });
  });

  it('envía multipart sin fijar Content-Type y devuelve archivos como Blob', async () => {
    const archivoCsv = new Blob(['file,fila\n']);
    const formulario = new FormData();
    formulario.append('file', new File(['file,fila\n'], 'horarios.csv'));
    const fetch = vi.fn().mockResolvedValue(new Response(archivoCsv, {
      status: 200,
      headers: { 'Content-Type': 'text/csv' }
    }));
    vi.stubGlobal('fetch', fetch);

    const respuesta = await solicitar('/bloques-horario/carga-masiva', {
      metodo: 'POST',
      cuerpoFormulario: formulario
    });

    expect(fetch.mock.calls[0][1].body).toBe(formulario);
    expect(fetch.mock.calls[0][1].headers).toEqual({});
    expect(respuesta.exitoso).toBe(true);

    fetch.mockResolvedValueOnce(new Response(archivoCsv, { status: 200 }));
    const descarga = await solicitar('/bloques-horario/plantilla-csv', { respuestaArchivo: true });
    expect(descarga.datos).toBeInstanceOf(Blob);
    expect(descarga.datos.size).toBeGreaterThan(0);
  });

  it('quita correctamente el sufijo de una versión de API de varios dígitos', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    await solicitar('/log-errores', { sinVersionApi: true });

    expect(fetch.mock.calls[0][0]).toBe('/api/log-errores');
  });
});

describe('cliente HTTP · 401 con código de invalidación de sesión (docs/planes/login.md §U2)', () => {
  it('expone el código de negocio en la respuesta y lo pasa a alSesionExpirada', async () => {
    const alSesionExpirada = vi.fn();
    configurarCliente({ obtenerToken: () => 'token-vigente', alSesionExpirada });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: 'Tu rol fue modificado.', codigo: 'SESION_ROL_MODIFICADO' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/administracion/auditorias');

    expect(respuesta.exitoso).toBe(false);
    expect(respuesta.estado).toBe(401);
    expect(respuesta.codigo).toBe('SESION_ROL_MODIFICADO');
    expect(alSesionExpirada).toHaveBeenCalledWith({ estado: 401, codigo: 'SESION_ROL_MODIFICADO' });
  });

  it('pasa codigo: null cuando el backend no envía código de negocio', async () => {
    const alSesionExpirada = vi.fn();
    configurarCliente({ obtenerToken: () => 'token-vigente', alSesionExpirada });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: 'Sesión inválida.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/administracion/auditorias');

    expect(respuesta.codigo).toBeNull();
    expect(alSesionExpirada).toHaveBeenCalledWith({ estado: 401, codigo: null });
  });

  it('prioriza el campo message de errores del backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({
        status: 400,
        error: 'Bad Request',
        message: 'El correo electrónico o DNI es obligatorio.'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/auth/login', {
      metodo: 'POST',
      cuerpo: { identificador: '', password: 'password' }
    });

    expect(respuesta.mensaje).toBe('El correo electrónico o DNI es obligatorio.');
  });
});
