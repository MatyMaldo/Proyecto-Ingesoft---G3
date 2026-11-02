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

describe('HU-SAT-04 · Selectores en cascada de Módulo y Tipo de transacción', () => {
  it('el tipo de transacción está deshabilitado hasta elegir un módulo', async () => {
    await renderizarYEsperar();

    const selectTipo = screen.getByLabelText('Tipo de transacción');
    expect(selectTipo).toBeDisabled();
    expect(within(selectTipo).getByRole('option', { name: 'Elige un módulo primero' })).toBeInTheDocument();
  });

  it('al elegir un módulo habilita el tipo y lista solo los tipos de ese módulo', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'MATRICULAS');

    const selectTipo = screen.getByLabelText('Tipo de transacción');
    expect(selectTipo).toBeEnabled();
    const opciones = within(selectTipo).getAllByRole('option').map((opcion) => opcion.textContent);
    expect(opciones).toEqual(['Todos los tipos', 'Registro de matrícula', 'Cancelación automática de matrícula']);
  });

  it('al volver a "Todos los módulos" el tipo se deshabilita y se reinicia', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');
    await usuario.selectOptions(screen.getByLabelText('Tipo de transacción'), 'Validación de pago');
    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'TODOS');

    const selectTipo = screen.getByLabelText('Tipo de transacción');
    expect(selectTipo).toBeDisabled();
    expect(selectTipo).toHaveValue('');
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
    await usuario.selectOptions(screen.getByLabelText('Tipo de transacción'), 'Validación de pago');

    expect(screen.getByRole('button', { name: /Filtros 2 filtros activos/ })).toBeInTheDocument();
  });
});
