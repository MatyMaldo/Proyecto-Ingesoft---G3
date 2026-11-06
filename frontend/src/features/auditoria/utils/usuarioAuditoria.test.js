import { describe, expect, it } from 'vitest';
import { debeMostrarRol, describirUsuario } from './usuarioAuditoria.js';

describe('usuarioAuditoria', () => {
  it('omite el rol cuando es igual al nombre (sin importar mayúsculas ni tildes)', () => {
    expect(debeMostrarRol({ nombre: 'Administrador', rol: 'Administrador' })).toBe(false);
    expect(debeMostrarRol({ nombre: 'Sistema', rol: 'sistema' })).toBe(false);
    expect(describirUsuario({ nombre: 'Administrador', rol: 'Administrador' })).toBe('Administrador');
  });

  it('muestra el rol cuando aporta información', () => {
    expect(debeMostrarRol({ nombre: 'Prof. Quispe', rol: 'Docente' })).toBe(true);
    expect(describirUsuario({ nombre: 'Prof. Quispe', rol: 'Docente' })).toBe('Prof. Quispe (Docente)');
  });

  it('no muestra un rol vacío', () => {
    expect(debeMostrarRol({ nombre: 'Ana', rol: '' })).toBe(false);
  });
});
