import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PaginaAuditorias from './PaginaAuditorias.jsx';

async function renderizarYEsperar() {
  render(<PaginaAuditorias />);
  await waitFor(() => expect(screen.getByText(/^Mostrando \d+ registros?$/)).toBeInTheDocument(), {
    timeout: 3000
  });
}

describe('HU-SAT-04 · Selectores independientes de Módulo y Tipo de acción', () => {
  it('el tipo de acción está habilitado desde el inicio y ofrece los cinco tipos', async () => {
    await renderizarYEsperar();

    const selectAccion = screen.getByLabelText('Tipo de acción');
    expect(selectAccion).toBeEnabled();
    const opciones = within(selectAccion).getAllByRole('option').map((opcion) => opcion.textContent);
    expect(opciones).toEqual([
      'Todas las acciones',
      'Crear',
      'Actualizar',
      'Eliminar',
      'Login',
      'Cambio de estado'
    ]);
  });

  it('cambiar el módulo no reinicia el tipo de acción', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.selectOptions(screen.getByLabelText('Tipo de acción'), 'CAMBIO_ESTADO');
    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');

    expect(screen.getByLabelText('Tipo de acción')).toHaveValue('CAMBIO_ESTADO');
  });

  it('un tipo de acción sin registros muestra el mensaje de sin resultados', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.selectOptions(screen.getByLabelText('Tipo de acción'), 'ELIMINAR');
    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');

    expect(
      await screen.findByText('No se encontraron registros de auditoría con los criterios indicados')
    ).toBeInTheDocument();
  });
});

describe('HU-SAT-04 · Botón "Filtros" (vista compacta)', () => {
  it('alterna el panel de filtros y muestra cuántos filtros hay activos', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    const boton = screen.getByRole('button', { name: /^Filtros/ });
    expect(boton).toHaveAttribute('aria-expanded', 'false');

    await usuario.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');

    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');
    await usuario.selectOptions(screen.getByLabelText('Tipo de acción'), 'CAMBIO_ESTADO');

    expect(screen.getByRole('button', { name: /Filtros 2 filtros activos/ })).toBeInTheDocument();
  });
});
