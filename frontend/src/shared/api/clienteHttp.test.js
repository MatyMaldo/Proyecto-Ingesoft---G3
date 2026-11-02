import { afterEach, describe, expect, it, vi } from 'vitest';

import { solicitar, configurarCliente } from './clienteHttp.js';

afterEach(() => {
  vi.unstubAllGlobals();
  configurarCliente();
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
        perfil: 'ADMINISTRADOR',
        identificador: 'admin@example.com',
        password: 'password'
      }
    });

    expect(respuesta).toEqual({ exitoso: true, datos: login, mensaje: '' });
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
});
