import { afterEach, describe, expect, it, vi } from 'vitest';

import { solicitar } from './clienteHttp.js';

afterEach(() => {
  vi.unstubAllGlobals();
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
