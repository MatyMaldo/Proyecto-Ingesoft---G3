import { describe, it, expect } from 'vitest';

import { iniciarSesionMock } from './autenticacionMock.js';
import { ROLES } from '../../../../shared/auth/roles.js';

describe('HU-SAT-07 · Fix del bug de DNI compartido: cada cuenta autentica con su propio perfil', () => {
  it('autentica como Administrador cuando el DNI compartido se usa con el perfil Administrador', async () => {
    const resultado = await iniciarSesionMock({
      perfil: ROLES.ADMIN,
      identificador: '00000001',
      password: 'Admin2026!'
    });

    expect(resultado.exitoso).toBe(true);
    expect(resultado.datos.usuario.rol).toBe(ROLES.ADMIN);
    expect(resultado.datos.usuario.nombre).toBe('Admin');
  });

  it('autentica como Docente (otra cuenta) cuando el mismo DNI compartido se usa con el perfil Docente', async () => {
    const resultado = await iniciarSesionMock({
      perfil: ROLES.DOCENTE,
      identificador: '00000001',
      password: 'DocenteAna2026!'
    });

    expect(resultado.exitoso).toBe(true);
    expect(resultado.datos.usuario.rol).toBe(ROLES.DOCENTE);
    expect(resultado.datos.usuario.nombre).toBe('Ana Torres');
  });

  it('nunca devuelve la contraseña en una respuesta exitosa', async () => {
    const resultado = await iniciarSesionMock({
      perfil: ROLES.ADMIN,
      identificador: '00000001',
      password: 'Admin2026!'
    });

    expect(resultado.datos.usuario).not.toHaveProperty('contrasena');
    expect(resultado.datos.usuario).not.toHaveProperty('password');
  });
});

describe('HU-SAT-07 · Escenario 3: credenciales incorrectas o perfil que no corresponde a la cuenta', () => {
  it('rechaza con 401 un identificador no registrado', async () => {
    const resultado = await iniciarSesionMock({
      perfil: ROLES.ADMIN,
      identificador: '99999999',
      password: 'cualquiera'
    });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(401);
  });

  it('rechaza con 401 una contraseña incorrecta', async () => {
    const resultado = await iniciarSesionMock({
      perfil: ROLES.ADMIN,
      identificador: '00000001',
      password: 'contrasena-equivocada'
    });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(401);
  });

  it('rechaza con 401 cuando el DNI es correcto pero el perfil elegido no corresponde a ninguna cuenta con ese perfil', async () => {
    // El DNI 00000001 tiene cuentas de Admin y Docente, pero ninguna de Apoderado.
    const resultado = await iniciarSesionMock({
      perfil: ROLES.APODERADO,
      identificador: '00000001',
      password: 'Admin2026!'
    });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(401);
  });

  it('usa el mismo mensaje y el mismo código de rechazo en los tres casos, sin indicar cuál dato falló', async () => {
    const [noRegistrado, contrasenaErronea, perfilDistinto] = await Promise.all([
      iniciarSesionMock({ perfil: ROLES.ADMIN, identificador: '99999999', password: 'x' }),
      iniciarSesionMock({ perfil: ROLES.ADMIN, identificador: '00000001', password: 'x' }),
      iniciarSesionMock({ perfil: ROLES.APODERADO, identificador: '00000001', password: 'Admin2026!' })
    ]);

    expect(noRegistrado.mensaje).toBe(contrasenaErronea.mensaje);
    expect(contrasenaErronea.mensaje).toBe(perfilDistinto.mensaje);
    expect(noRegistrado.estado).toBe(401);
    expect(contrasenaErronea.estado).toBe(401);
    expect(perfilDistinto.estado).toBe(401);
  });
});

describe('HU-SAT-07 · Escenario 5: usuario desactivado', () => {
  it('rechaza con 403 el ingreso de una cuenta desactivada', async () => {
    const resultado = await iniciarSesionMock({
      perfil: ROLES.ADMIN,
      identificador: '00000002',
      password: 'Inactivo2026!'
    });

    expect(resultado.exitoso).toBe(false);
    expect(resultado.estado).toBe(403);
  });
});
