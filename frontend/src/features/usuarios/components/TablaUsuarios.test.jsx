import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TablaUsuarios from './TablaUsuarios.jsx';

const USUARIOS = [
  { id: 1, nombre: 'María', apellido: 'López', dni: '74852136', rol: 'Apoderado', correo: 'maria@email.com', activo: true },
  { id: 2, nombre: 'Carlos', apellido: 'Ramírez', dni: '70482135', rol: 'Estudiante', correo: 'carlos@email.com', activo: false, codigoEstudiante: 'EST-016' },
  { id: 3, nombre: 'Admin', apellido: 'General', dni: '10000001', rol: 'Administrador', correo: 'admin@email.com', activo: true }
];

const esProtegido = (usuario) => usuario.rol === 'Administrador';

function renderizar(sobrescritura = {}) {
  const props = { usuarios: USUARIOS, esProtegido, alEditar: vi.fn(), alCambiarEstado: vi.fn(), ...sobrescritura };
  render(<TablaUsuarios {...props} />);
  return props;
}

describe('TablaUsuarios', () => {
  it('es una tabla semántica con las columnas en el orden acordado', () => {
    renderizar();

    const encabezados = screen.getAllByRole('columnheader').map((columna) => columna.textContent);
    expect(encabezados).toEqual(['Nombre completo', 'DNI', 'Correo', 'Rol', 'Estado', 'Acciones']);
    expect(screen.getAllByRole('row')).toHaveLength(USUARIOS.length + 1);
  });

  it('muestra rol y estado con texto, y el código del estudiante', () => {
    renderizar();
    const tabla = screen.getByRole('table');

    expect(within(tabla).getByText('Apoderado')).toBeInTheDocument();
    expect(within(tabla).getAllByText('Activo')).toHaveLength(2);
    expect(within(tabla).getByText('Desactivado')).toBeInTheDocument();
    expect(within(tabla).getByText('Código: EST-016')).toBeInTheDocument();
  });

  it('ofrece Editar y Activar/Desactivar como botones de ícono con nombre accesible y avisa qué usuario se afecta', async () => {
    const { alEditar, alCambiarEstado } = renderizar();
    const tabla = screen.getByRole('table');

    await userEvent.click(within(tabla).getByRole('button', { name: 'Editar a María López' }));
    expect(alEditar).toHaveBeenCalledWith(USUARIOS[0]);

    const desactivar = within(tabla).getByRole('button', { name: 'Desactivar a María López' });
    expect(desactivar).toHaveAttribute('title', 'Desactivar');
    await userEvent.click(desactivar);
    expect(alCambiarEstado).toHaveBeenCalledWith(USUARIOS[0]);

    await userEvent.click(within(tabla).getByRole('button', { name: 'Activar a Carlos Ramírez' }));
    expect(alCambiarEstado).toHaveBeenCalledWith(USUARIOS[1]);
  });

  it('en las tarjetas móviles deja los botones Editar y Desactivar a la vista', async () => {
    const { alEditar } = renderizar();
    const lista = screen.getByRole('list', { name: 'Usuarios registrados' });

    await userEvent.click(within(lista).getByRole('button', { name: 'Editar a María López' }));
    expect(alEditar).toHaveBeenCalledWith(USUARIOS[0]);
    expect(within(lista).getByRole('button', { name: 'Desactivar a María López' })).toBeInTheDocument();
  });

  it('no ofrece acciones sobre cuentas de administrador', () => {
    renderizar();
    const tabla = screen.getByRole('table');

    expect(within(tabla).getByText('Cuenta protegida')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button', { name: /Admin General/ })).not.toBeInTheDocument();
  });

  it('permite ordenar por Nombre y Estado desde el encabezado y marca la columna activa con aria-sort', async () => {
    const alOrdenar = vi.fn();
    renderizar({ orden: { campo: 'nombre', direccion: 'asc' }, alOrdenar });
    const tabla = screen.getByRole('table');

    expect(within(tabla).getByRole('columnheader', { name: /Nombre completo/ })).toHaveAttribute('aria-sort', 'ascending');
    expect(within(tabla).getByRole('columnheader', { name: /Estado/ })).toHaveAttribute('aria-sort', 'none');
    expect(within(tabla).getByRole('columnheader', { name: 'DNI' })).not.toHaveAttribute('aria-sort');

    await userEvent.click(within(tabla).getByRole('button', { name: /Estado/ }));
    expect(alOrdenar).toHaveBeenCalledWith('estado');
  });
});
