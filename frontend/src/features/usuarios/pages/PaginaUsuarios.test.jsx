import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaUsuarios from './PaginaUsuarios.jsx';

describe('Usuarios · listado, filtros y acciones', () => {
  it('pone el total en el título, y búsqueda, acciones y chips de rol en la zona de filtros', () => {
    render(<PaginaUsuarios />);

    const titulo = screen.getByRole('banner');
    expect(within(titulo).getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    expect(within(titulo).getByText('8 usuarios')).toBeInTheDocument();

    const filtros = screen.getByRole('region', { name: 'Búsqueda, filtros y acciones de usuarios' });
    expect(within(filtros).getByLabelText('Buscar usuarios por nombre o DNI')).toBeInTheDocument();
    expect(within(filtros).getByRole('button', { name: 'Carga masiva CSV' })).toBeInTheDocument();
    for (const rol of ['apoderado', 'estudiante', 'docente']) {
      expect(within(filtros).getByRole('button', { name: `Registrar ${rol}` })).toBeInTheDocument();
    }
    const chips = within(filtros).getByRole('group', { name: 'Filtrar usuarios por rol' });
    for (const etiqueta of ['Todos', 'Apoderados', 'Docentes', 'Estudiantes']) {
      expect(within(chips).getByRole('button', { name: etiqueta })).toBeInTheDocument();
    }
    expect(within(chips).getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('muestra el total de usuarios y lo actualiza al filtrar', async () => {
    render(<PaginaUsuarios />);
    expect(screen.getByText('8 usuarios')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Docentes' }));
    expect(screen.getByText('2 usuarios')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Buscar usuarios por nombre o DNI'), 'jorge');
    expect(screen.getByText('1 usuario')).toBeInTheDocument();
  });

  it('filtra por rol y por texto sobre la tabla', async () => {
    render(<PaginaUsuarios />);
    const tabla = screen.getByRole('table');

    await userEvent.click(screen.getByRole('button', { name: 'Docentes' }));
    expect(screen.getByRole('button', { name: 'Docentes' })).toHaveAttribute('aria-pressed', 'true');
    const filasDocentes = within(tabla).getAllByRole('row').slice(1);
    expect(filasDocentes.length).toBeGreaterThan(0);
    for (const fila of filasDocentes) {
      expect(within(fila).getByText('Docente')).toBeInTheDocument();
    }

    await userEvent.type(screen.getByLabelText('Buscar usuarios por nombre o DNI'), 'jorge');
    expect(within(tabla).getAllByRole('row')).toHaveLength(2);
    expect(within(tabla).getByText('Jorge Herrera')).toBeInTheDocument();
  });

  it('abre el registro de un apoderado desde la barra', async () => {
    render(<PaginaUsuarios />);

    await userEvent.click(screen.getByRole('button', { name: 'Registrar apoderado' }));
    expect(screen.getByRole('heading', { name: 'Registrar apoderado' })).toBeInTheDocument();
  });

  it('muestra el mensaje vacío cuando nada coincide', async () => {
    render(<PaginaUsuarios />);

    await userEvent.type(screen.getByLabelText('Buscar usuarios por nombre o DNI'), 'zzzz-no-existe');
    expect(screen.getByText('No se encontraron usuarios.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
