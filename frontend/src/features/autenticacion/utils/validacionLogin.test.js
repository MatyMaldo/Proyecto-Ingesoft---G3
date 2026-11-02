import { describe, it, expect } from 'vitest';

import { esCorreoValido, validarCorreo, validarContrasena, validarCredenciales } from './validacionLogin.js';
import { CORREO_OBLIGATORIO, CORREO_FORMATO, CONTRASENA_OBLIGATORIA } from '../constants/mensajesLogin.js';

describe('HU-SAT-07 · Escenario 4: campos vacíos o correo con formato inválido', () => {
  it('reconoce un correo electrónico válido', () => {
    expect(esCorreoValido('admin@sanmarcos.edu.pe')).toBe(true);
    expect(esCorreoValido('no-es-correo')).toBe(false);
  });

  it('indica el campo a corregir cuando el correo está vacío', () => {
    expect(validarCorreo('')).toBe(CORREO_OBLIGATORIO);
    expect(validarCorreo('   ')).toBe(CORREO_OBLIGATORIO);
  });

  it('indica el campo a corregir cuando el correo no tiene formato válido', () => {
    expect(validarCorreo('123')).toBe(CORREO_FORMATO);
    expect(validarCorreo('correo-invalido')).toBe(CORREO_FORMATO);
    expect(validarCorreo('admin@')).toBe(CORREO_FORMATO);
  });

  it('no marca error cuando el correo es válido', () => {
    expect(validarCorreo('admin@sanmarcos.edu.pe')).toBeNull();
  });

  it('indica el campo a corregir cuando la contraseña está vacía', () => {
    expect(validarContrasena('')).toBe(CONTRASENA_OBLIGATORIA);
  });

  it('no exige longitud ni complejidad de la contraseña en el cliente', () => {
    expect(validarContrasena('x')).toBeNull();
  });

  it('no intenta autenticar (no hay error) cuando ambos campos son válidos', () => {
    const errores = validarCredenciales({ correo: 'admin@sanmarcos.edu.pe', contrasena: 'Admin2026!' });
    expect(errores).toEqual({});
  });

  it('reporta los dos campos cuando ambos están vacíos', () => {
    const errores = validarCredenciales({ correo: '', contrasena: '' });
    expect(errores).toEqual({
      correo: CORREO_OBLIGATORIO,
      contrasena: CONTRASENA_OBLIGATORIA
    });
  });
});
