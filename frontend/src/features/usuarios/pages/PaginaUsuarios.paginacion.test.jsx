import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

vi.mock('../services/usuariosService.js', async (importarOriginal) => {
  const original = await importarOriginal();
  const usuarios = Array.from({ length: 20 }, (_, indice) => ({
    id: 100 + indice,
    nombre: `Usuario${String(indice + 1).padStart(2, '0')}`,
    apellido: 'Prueba',
    dni: String(70000000 + indice),
    rol: 'Docente',
    correo: `usuario${indice + 1}@colegio.pe`,
    activo: true
  }));
  return { ...original, USUARIOS_INICIAL: usuarios };
});

import PaginaUsuarios from './PaginaUsuarios.jsx';

const paginador = (posicion) => screen.getByRole('navigation', { name: `Paginación de usuarios (${posicion})` });

describe('Usuarios · paginación de 10 en 10 (HU-SAT-02, escenario 12)', () => {
  it('muestra 10 usuarios por página y permite pasar a la siguiente', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const tabla = screen.getByRole('table');

    expect(within(tabla).getAllByRole('row')).toHaveLength(11);
    expect(paginador('superior')).toHaveTextContent('1 – 10 de 20 usuarios');
    expect(within(tabla).queryByText('Usuario11 Prueba')).not.toBeInTheDocument();

    await userEvent.click(within(paginador('inferior')).getByRole('button', { name: /siguiente/i }));
    expect(within(tabla).getAllByRole('row')).toHaveLength(11);
    expect(paginador('superior')).toHaveTextContent('11 – 20 de 20 usuarios');
    expect(within(tabla).getByText('Usuario11 Prueba')).toBeInTheDocument();
  });

  it('vuelve a la primera página al cambiar la búsqueda', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    await userEvent.click(within(paginador('superior')).getByRole('button', { name: /siguiente/i }));
    await userEvent.type(screen.getByLabelText('Buscar usuarios por nombre, DNI o correo'), 'usuario0');

    const tabla = screen.getByRole('table');
    expect(within(tabla).getByText('Usuario01 Prueba')).toBeInTheDocument();
    // 9 coincidencias caben en una página: se ve el total arriba, no se repite abajo y no hay botones de página.
    expect(paginador('superior')).toHaveTextContent('1 – 9 de 9 usuarios');
    expect(screen.queryByRole('navigation', { name: 'Paginación de usuarios (inferior)' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /siguiente/i })).not.toBeInTheDocument();
  });
});
