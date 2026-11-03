import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaLogErrores from './PaginaLogErrores.jsx';

describe('HU-SAT-05 · Logs de errores según el contrato paginado', () => {
  it('muestra los campos del contrato y controles para la página siguiente', async () => {
    render(<PaginaLogErrores />);

    await screen.findByRole('columnheader', { name: 'Endpoint' }, { timeout: 3000 });
    expect(screen.getByRole('columnheader', { name: 'Detalle' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Estado HTTP' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Usuario' })).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 2 · 18 registros')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => expect(screen.getByText('Página 2 de 2 · 18 registros')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('muestra la operación y el código HTTP', async () => {
    render(<PaginaLogErrores />);

    await screen.findAllByText('GET', {}, { timeout: 3000 });
    expect(screen.getAllByText('500').length).toBeGreaterThan(0);
  });
});
