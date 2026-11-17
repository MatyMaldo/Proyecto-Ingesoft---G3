import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import SelectorBuscable from './SelectorBuscable.jsx';

const OPCIONES = [
  { valor: '2', etiqueta: 'Juan Perez Lopez' },
  { valor: '3', etiqueta: 'María Gómez Silva' },
  { valor: '9', etiqueta: 'José Torres' }
];

function dibujar(valor = '') {
  const alCambiar = vi.fn();
  render(
    <SelectorBuscable id="docente" etiqueta="Docente" valor={valor} opciones={OPCIONES} alCambiar={alCambiar} />
  );
  return { alCambiar, campo: screen.getByRole('combobox', { name: 'Docente' }) };
}

describe('SelectorBuscable', () => {
  it('filtra al escribir sin distinguir tildes ni mayúsculas y elige con el ratón', async () => {
    const { alCambiar, campo } = dibujar();

    await userEvent.type(campo, 'MARIA');
    const lista = screen.getByRole('listbox', { name: 'Docente' });
    expect(lista.querySelectorAll('[role=option]')).toHaveLength(1);

    fireEvent.mouseDown(screen.getByRole('option', { name: 'María Gómez Silva' }));
    expect(alCambiar).toHaveBeenCalledWith('3');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('se maneja con el teclado: flechas, Enter y Escape', async () => {
    const { alCambiar, campo } = dibujar();

    await userEvent.click(campo);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(alCambiar).toHaveBeenCalledWith('3');

    await userEvent.click(campo);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('muestra la opción elegida, permite quitarla y avisa cuando no hay resultados', async () => {
    const { alCambiar, campo } = dibujar('2');
    expect(campo).toHaveValue('Juan Perez Lopez');

    await userEvent.click(screen.getByRole('button', { name: 'Quitar selección de Docente' }));
    expect(alCambiar).toHaveBeenCalledWith('');

    await userEvent.clear(campo);
    await userEvent.type(campo, 'zzz');
    expect(screen.getByText('No se encontraron resultados.')).toBeInTheDocument();
  });
});
