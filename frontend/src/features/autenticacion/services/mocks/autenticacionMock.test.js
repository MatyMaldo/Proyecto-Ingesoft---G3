import { describe, it, expect } from 'vitest';

import { iniciarSesionMock } from './autenticacionMock.js';
import { ROLES } from '../../../../shared/auth/roles.js';
import { MOTIVOS_RECHAZO } from '../autenticacionService.js';

describe('HU-SAT-07 · Escenario 1: inicio de sesión exitoso', () => {
  it('autentica con el correo y la contraseña del Administrador', async () => {
    const resultado = await iniciarSesionMock({ correo: 'admin@sanmarcos.edu.pe', password: 'Admin2026!' });

    expect(resultado.exitoso).toBe(true);
    expect(resultado.datos.usuario.rol).toBe(ROLES.ADMIN);
    expect(resultado.datos.usuario.nombre).toBe('Admin');
  });

  it('no distingue mayúsculas en el correo', async () => {
    const resultado = await iniciarSesionMock({ correo: 'ADMIN@SANMARCOS.EDU.PE', password: 'Admin2026!' });
    expect(resultado.exitoso).toBe(true);
  });

  it('nunca devuelve la contraseña en una respuesta exitosa', async () => {
    const resultado = await iniciarSesionMock({ correo: 'admin@sanmarcos.edu.pe', password: 'Admin2026!' });

    expect(resultado.datos.usuario).not.toHaveProperty('contrasena');
    expect(resultado.datos.usuario).not.toHaveProperty('password');
  });
});

describe('HU-SAT-07 · Escenario 3: correo no registrado, contraseña incorrecta o cuenta sin contraseña', () => {
  it('rechaza con 401 un correo no registrado', async () => {
    const resultado = await iniciarSesionMock({ correo: 'noexiste@sanmarcos.edu.pe', password: 'cualquiera' });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(401);
  });

  it('rechaza con 401 una contraseña incorrecta', async () => {
    const resultado = await iniciarSesionMock({ correo: 'admin@sanmarcos.edu.pe', password: 'contrasena-equivocada' });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(401);
  });

  it('rechaza con el mismo 401 una cuenta activa que aún no definió su contraseña (HU-SAT-03)', async () => {
    const resultado = await iniciarSesionMock({ correo: 'sincontrasena@sanmarcos.edu.pe', password: 'cualquiera' });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(401);
  });

  it('usa el mismo mensaje y el mismo código en los tres casos, sin indicar cuál dato falló', async () => {
    const [noRegistrado, contrasenaErronea, sinContrasena] = await Promise.all([
      iniciarSesionMock({ correo: 'noexiste@sanmarcos.edu.pe', password: 'x' }),
      iniciarSesionMock({ correo: 'admin@sanmarcos.edu.pe', password: 'x' }),
      iniciarSesionMock({ correo: 'sincontrasena@sanmarcos.edu.pe', password: 'x' })
    ]);

    expect(noRegistrado.mensaje).toBe(contrasenaErronea.mensaje);
    expect(contrasenaErronea.mensaje).toBe(sinContrasena.mensaje);
    expect(noRegistrado.estado).toBe(401);
    expect(contrasenaErronea.estado).toBe(401);
    expect(sinContrasena.estado).toBe(401);
  });
});

describe('HU-SAT-07 · Escenario 5: usuario desactivado', () => {
  it('rechaza con 403 el ingreso de una cuenta desactivada', async () => {
    const resultado = await iniciarSesionMock({ correo: 'inactivo@sanmarcos.edu.pe', password: 'Inactivo2026!' });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(403);
    expect(resultado.codigo).toBe('CUENTA_INACTIVA');
  });
});

describe('HU-SAT-07 · §U3: rol no habilitado (alcance Sprint 1)', () => {
  it('rechaza con 403 y el código ROL_NO_HABILITADO a una cuenta docente con credenciales correctas', async () => {
    const resultado = await iniciarSesionMock({ correo: 'docente@sanmarcos.edu.pe', password: 'Docente2026!' });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(403);
    expect(resultado.codigo).toBe(MOTIVOS_RECHAZO.ROL_NO_HABILITADO);
  });
});

describe('HU-SAT-07 · disparador de error no controlado (desarrollo)', () => {
  it('responde 500 para el correo disparador de error simulado', async () => {
    const resultado = await iniciarSesionMock({ correo: 'error500@sanmarcos.edu.pe', password: 'cualquiera' });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(500);
  });
});
