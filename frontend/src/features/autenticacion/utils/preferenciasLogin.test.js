import { describe, it, expect, beforeEach } from 'vitest';

import { leerPreferenciasLogin, guardarPreferenciasLogin, borrarPreferenciasLogin } from './preferenciasLogin.js';
import { CLAVE_PREFERENCIAS_LOGIN } from '../../../shared/auth/constantesSesion.js';

describe('HU-SAT-07 · Escenario "Recordar mi sesión": persistencia de identificador y perfil', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('no guarda nada por defecto', () => {
    expect(leerPreferenciasLogin()).toBeNull();
  });

  it('guarda únicamente el identificador y el perfil al marcar la casilla tras un login correcto', () => {
    guardarPreferenciasLogin({ identificador: 'admin@sanmarcos.edu.pe', perfil: 'ADMINISTRADOR' });

    const crudo = window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN);
    const guardado = JSON.parse(crudo);

    expect(guardado).toEqual({ identificador: 'admin@sanmarcos.edu.pe', perfil: 'ADMINISTRADOR' });
    expect(guardado).not.toHaveProperty('contrasena');
    expect(guardado).not.toHaveProperty('password');
    expect(guardado).not.toHaveProperty('token');
  });

  it('lee las preferencias guardadas', () => {
    guardarPreferenciasLogin({ identificador: '00000001', perfil: 'ADMINISTRADOR' });
    expect(leerPreferenciasLogin()).toEqual({ identificador: '00000001', perfil: 'ADMINISTRADOR' });
  });

  it('borra las preferencias guardadas al desmarcar la casilla', () => {
    guardarPreferenciasLogin({ identificador: '00000001', perfil: 'ADMINISTRADOR' });
    borrarPreferenciasLogin();
    expect(leerPreferenciasLogin()).toBeNull();
    expect(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN)).toBeNull();
  });

  it('ignora un valor corrupto guardado bajo la misma clave', () => {
    window.localStorage.setItem(CLAVE_PREFERENCIAS_LOGIN, '{no-es-json');
    expect(leerPreferenciasLogin()).toBeNull();
  });

  it('ignora un valor con forma inesperada (por ejemplo, sin perfil)', () => {
    window.localStorage.setItem(CLAVE_PREFERENCIAS_LOGIN, JSON.stringify({ identificador: '00000001' }));
    expect(leerPreferenciasLogin()).toBeNull();
  });
});
