import { describe, it, expect, beforeEach } from 'vitest';

import { leerPreferenciasLogin, guardarPreferenciasLogin, borrarPreferenciasLogin } from './preferenciasLogin.js';
import { CLAVE_PREFERENCIAS_LOGIN } from '../../../shared/auth/constantesSesion.js';

describe('HU-SAT-07 · Escenario "Recordar mi correo": persistencia solo del correo electrónico', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('no guarda nada por defecto', () => {
    expect(leerPreferenciasLogin()).toBeNull();
  });

  it('guarda únicamente el correo al marcar la casilla tras un login correcto', () => {
    guardarPreferenciasLogin({ correo: 'admin@sanmarcos.edu.pe' });

    const crudo = window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN);
    const guardado = JSON.parse(crudo);

    expect(guardado).toEqual({ correo: 'admin@sanmarcos.edu.pe' });
    expect(guardado).not.toHaveProperty('contrasena');
    expect(guardado).not.toHaveProperty('password');
    expect(guardado).not.toHaveProperty('token');
    expect(guardado).not.toHaveProperty('perfil');
  });

  it('lee las preferencias guardadas', () => {
    guardarPreferenciasLogin({ correo: 'admin@sanmarcos.edu.pe' });
    expect(leerPreferenciasLogin()).toEqual({ correo: 'admin@sanmarcos.edu.pe' });
  });

  it('borra las preferencias guardadas al desmarcar la casilla', () => {
    guardarPreferenciasLogin({ correo: 'admin@sanmarcos.edu.pe' });
    borrarPreferenciasLogin();
    expect(leerPreferenciasLogin()).toBeNull();
    expect(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN)).toBeNull();
  });

  it('ignora un valor corrupto guardado bajo la misma clave', () => {
    window.localStorage.setItem(CLAVE_PREFERENCIAS_LOGIN, '{no-es-json');
    expect(leerPreferenciasLogin()).toBeNull();
  });

  it('ignora un valor con el formato anterior (identificador y perfil, sin correo) y borra la clave', () => {
    window.localStorage.setItem(
      CLAVE_PREFERENCIAS_LOGIN,
      JSON.stringify({ identificador: 'admin@sanmarcos.edu.pe', perfil: 'ADMINISTRADOR' })
    );
    expect(leerPreferenciasLogin()).toBeNull();
    expect(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN)).toBeNull();
  });
});
