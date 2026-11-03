import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar } = vi.hoisted(() => ({ solicitar: vi.fn() }));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import { iniciarSesion, MOTIVOS_RECHAZO } from './autenticacionService.js';

describe('servicio de autenticación con backend', () => {
  beforeEach(() => solicitar.mockReset());

  it('envía identificador y password al endpoint de login', async () => {
    solicitar.mockResolvedValue({
      exitoso: true,
      datos: {
        token: 'jwt-token',
        usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' }
      },
      mensaje: ''
    });

    const resultado = await iniciarSesion({
      correo: 'admin@colegio.com',
      password: '123456'
    });

    expect(solicitar).toHaveBeenCalledWith('/auth/login', {
      metodo: 'POST',
      cuerpo: { identificador: 'admin@colegio.com', password: '123456' }
    });
    expect(resultado.exitoso).toBe(true);
    expect(resultado.datos.usuario.rol).toBe('ADMINISTRADOR');
  });

  it('conserva el mensaje de validación devuelto por el backend', async () => {
    solicitar.mockResolvedValue({
      exitoso: false,
      datos: null,
      mensaje: 'El correo electrónico o DNI es obligatorio.',
      estado: 400
    });

    const resultado = await iniciarSesion({ correo: '', password: '123456' });

    expect(resultado.motivo).toBe(MOTIVOS_RECHAZO.DATOS_INVALIDOS);
    expect(resultado.mensaje).toBe('El correo electrónico o DNI es obligatorio.');
  });
});
