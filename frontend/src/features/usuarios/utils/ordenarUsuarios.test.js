import { describe, expect, it } from 'vitest';

import { ORDEN_INICIAL, ordenarUsuarios, separarApellidos } from './ordenarUsuarios.js';

const USUARIOS = [
  { id: 1, nombre: 'Rosa', apellido: 'Mendoza Quispe', activo: true },
  { id: 2, nombre: 'Ana', apellido: 'Torres', activo: false },
  { id: 3, nombre: 'Álvaro', apellido: 'Mendoza Aguilar', activo: true },
  { id: 4, nombre: 'Beatriz', apellido: 'Mendoza Quispe', activo: false },
  { id: 5, nombre: 'Óscar', apellido: 'Bravo', activo: true }
];

const ids = (lista) => lista.map((usuario) => usuario.id);

describe('ordenarUsuarios', () => {
  it('ordena por apellido paterno, apellido materno y nombre, sin distinguir tildes', () => {
    expect(ids(ordenarUsuarios(USUARIOS, ORDEN_INICIAL))).toEqual([5, 3, 4, 1, 2]);
  });

  it('invierte el orden por nombre en descendente', () => {
    expect(ids(ordenarUsuarios(USUARIOS, { campo: 'nombre', direccion: 'desc' }))).toEqual([2, 1, 4, 3, 5]);
  });

  it('ordena por estado con los activos primero y desempata por nombre', () => {
    expect(ids(ordenarUsuarios(USUARIOS, { campo: 'estado', direccion: 'asc' }))).toEqual([5, 3, 1, 4, 2]);
    expect(ids(ordenarUsuarios(USUARIOS, { campo: 'estado', direccion: 'desc' }))).toEqual([4, 2, 5, 3, 1]);
  });

  it('no modifica el arreglo original', () => {
    const copia = [...USUARIOS];
    ordenarUsuarios(USUARIOS);
    expect(USUARIOS).toEqual(copia);
  });

  it('usa los apellidos separados de la API cuando existen', () => {
    expect(separarApellidos({ apellidoPaterno: 'Quispe', apellidoMaterno: 'Rojas', apellido: 'Quispe Rojas' })).toEqual({
      paterno: 'Quispe',
      materno: 'Rojas'
    });
    expect(separarApellidos({ apellido: 'Torres' })).toEqual({ paterno: 'Torres', materno: '' });
  });
});
