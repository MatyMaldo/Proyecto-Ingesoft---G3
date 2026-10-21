import { describe, it, expect } from 'vitest';

import {
  esDniValido,
  esCorreoValido,
  validarIdentificador,
  validarContrasena,
  validarCredenciales
} from './validacionLogin.js';
import {
  IDENTIFICADOR_OBLIGATORIO,
  IDENTIFICADOR_FORMATO,
  CONTRASENA_OBLIGATORIA
} from '../constants/mensajesLogin.js';

describe('HU-SAT-07 · Escenario 4: campos vacíos o identificador con formato inválido', () => {
  it('reconoce un DNI válido de 8 dígitos', () => {
    expect(esDniValido('00000001')).toBe(true);
    expect(esDniValido('123')).toBe(false);
    expect(esDniValido('123456789')).toBe(false);
  });

  it('reconoce un correo electrónico válido', () => {
    expect(esCorreoValido('admin@sanmarcos.edu.pe')).toBe(true);
    expect(esCorreoValido('no-es-correo')).toBe(false);
  });

  it('indica el campo a corregir cuando el identificador está vacío', () => {
    expect(validarIdentificador('')).toBe(IDENTIFICADOR_OBLIGATORIO);
    expect(validarIdentificador('   ')).toBe(IDENTIFICADOR_OBLIGATORIO);
  });

  it('indica el campo a corregir cuando el identificador no es un correo válido ni un DNI de 8 dígitos', () => {
    expect(validarIdentificador('123')).toBe(IDENTIFICADOR_FORMATO);
    expect(validarIdentificador('correo-invalido')).toBe(IDENTIFICADOR_FORMATO);
  });

  it('no marca error cuando el identificador es un correo o un DNI válidos', () => {
    expect(validarIdentificador('admin@sanmarcos.edu.pe')).toBeNull();
    expect(validarIdentificador('00000001')).toBeNull();
  });

  it('indica el campo a corregir cuando la contraseña está vacía', () => {
    expect(validarContrasena('')).toBe(CONTRASENA_OBLIGATORIA);
  });

  it('no exige longitud ni complejidad de la contraseña en el cliente', () => {
    expect(validarContrasena('x')).toBeNull();
  });

  it('no intenta autenticar (no hay error) cuando ambos campos son válidos', () => {
    const errores = validarCredenciales({ identificador: 'admin@sanmarcos.edu.pe', contrasena: 'Admin2026!' });
    expect(errores).toEqual({});
  });

  it('reporta los dos campos cuando ambos están vacíos', () => {
    const errores = validarCredenciales({ identificador: '', contrasena: '' });
    expect(errores).toEqual({
      identificador: IDENTIFICADOR_OBLIGATORIO,
      contrasena: CONTRASENA_OBLIGATORIA
    });
  });
});
