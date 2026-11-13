import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import SelectorFecha from './SelectorFecha.jsx';

describe('SelectorFecha', () => {
  it('abre un calendario en español y devuelve la fecha elegida', () => {
    const alCambiar = vi.fn();
    render(
      <SelectorFecha
        id="fecha"
        etiqueta="Desde"
        valor="2026-11-06"
        alCambiar={alCambiar}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Desde/i }));

    expect(screen.getByText('noviembre 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '7' }));

    expect(alCambiar).toHaveBeenCalledWith('2026-11-07');
  });

  it('deshabilita los días fuera del rango permitido', () => {
    render(
      <SelectorFecha
        id="fecha"
        etiqueta="Desde"
        valor="2026-11-06"
        min="2026-11-06"
        alCambiar={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Desde/i }));

    expect(screen.getByRole('button', { name: '5' })).toBeDisabled();
  });

  it('renderiza el calendario dentro del diálogo cuando se usa en un modal', () => {
    render(
      <dialog open>
        <SelectorFecha
          id="fecha"
          etiqueta="Desde"
          valor="2026-11-06"
          enDialogo
          alCambiar={vi.fn()}
        />
      </dialog>
    );

    fireEvent.click(screen.getByRole('button', { name: /Desde/i }));

    expect(screen.getByText('noviembre 2026')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Calendario de Desde' }).closest('dialog'))
      .toBeInTheDocument();
  });
});
