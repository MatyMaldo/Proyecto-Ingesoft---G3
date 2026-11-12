import { describe, expect, it } from 'vitest';

import { describirUsuario } from '../utils/usuarioAuditoria.js';
import { obtenerEtiquetaRol } from './categoriasAuditoria.js';

describe('autor "No determinado" (HU-SAT-04: intento fallido con un correo sin cuenta)', () => {
  it('traduce el rol NO_DETERMINADO a su etiqueta', () => {
    expect(obtenerEtiquetaRol('NO_DETERMINADO')).toBe('No determinado');
  });

  it('se muestra una sola vez, sin repetir el rol junto al nombre', () => {
    const usuario = { nombre: 'No determinado', rol: obtenerEtiquetaRol('NO_DETERMINADO') };

    expect(describirUsuario(usuario)).toBe('No determinado');
  });
});
