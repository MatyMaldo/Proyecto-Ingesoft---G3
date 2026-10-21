import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PaginaLogErrores from './PaginaLogErrores.jsx';

describe('HU-SAT-06 · Mensaje exacto cuando ningún error cumple los filtros', () => {
  it('muestra el texto exacto "No se ha registrado ningún error que corresponda con los criterios indicados"', async () => {
    const usuario = userEvent.setup();
    render(<PaginaLogErrores />);

    // Se espera a que termine la carga inicial (texto de la región viva) antes de
    // tocar los filtros: cambiarlos mientras la carga inicial está en curso no es
    // el escenario bajo prueba aquí (ver hallazgo reportado para `useLogErrores`).
    await waitFor(() => expect(screen.getByText(/^Mostrando \d+ errores?$/)).toBeInTheDocument(), {
      timeout: 3000
    });

    await usuario.click(screen.getByRole('button', { name: 'Usuarios' }));

    // Los campos de fecha son type="date": se cambian directamente, como hace un navegador real.
    const campoDesde = screen.getByLabelText('Desde');
    const campoHasta = screen.getByLabelText('Hasta');
    fireEvent.change(campoDesde, { target: { value: '2026-01-01' } });
    fireEvent.change(campoHasta, { target: { value: '2026-01-02' } });

    await waitFor(
      () =>
        expect(
          screen.getByText(
            'No se ha registrado ningún error que corresponda con los criterios indicados'
          )
        ).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });
});

describe('HU-SAT-06 · Columna "Tipo de error" junto a "Operación"', () => {
  it('muestra ambas columnas en la tabla de resultados', async () => {
    render(<PaginaLogErrores />);

    await waitFor(() => expect(screen.getByRole('columnheader', { name: 'Operación' })).toBeInTheDocument(), {
      timeout: 3000
    });
    expect(screen.getByRole('columnheader', { name: 'Tipo de error' })).toBeInTheDocument();
  });
});

describe('HU-SAT-06 · Proceso automático con "Sistema" como usuario, sin aviso al usuario final', () => {
  it('muestra "Sistema" como un nombre de usuario más, sin ningún aviso o alerta adicional', async () => {
    render(<PaginaLogErrores />);

    await waitFor(() => expect(screen.getAllByText('Sistema').length).toBeGreaterThan(0), { timeout: 3000 });
    // No debe aparecer ningún mensaje de error visible al usuario por este registro automático.
    expect(screen.queryByText('Se registró un error inesperado')).not.toBeInTheDocument();
  });
});
