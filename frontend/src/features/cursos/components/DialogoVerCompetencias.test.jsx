import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import DialogoVerCompetencias from './DialogoVerCompetencias.jsx';

const COMPETENCIAS = [
  { id: 1, nombre: 'Resuelve problemas de cantidad', descripcion: 'Aplica estrategias de cálculo.' },
  { id: 2, nombre: 'Resuelve problemas de forma', descripcion: '' }
];

function pintar(propiedades = {}) {
  const props = {
    nombreCurso: 'Matemáticas',
    competencias: COMPETENCIAS,
    cargando: false,
    error: null,
    errorEliminar: null,
    idEliminando: null,
    alCerrar: vi.fn(),
    alAgregar: vi.fn(),
    alEditar: vi.fn(),
    alEliminar: vi.fn(async () => true),
    ...propiedades
  };
  render(<DialogoVerCompetencias {...props} />);
  return props;
}

describe('DialogoVerCompetencias', () => {
  it('indica cuántas competencias hay y deja «Agregar competencia» siempre a la vista', () => {
    const props = pintar();

    expect(screen.getByText('2 competencias')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar competencia' }));
    expect(props.alAgregar).toHaveBeenCalled();
  });

  it('numera las competencias y ofrece editar y eliminar con su nombre accesible', () => {
    const props = pintar();

    const lista = screen.getByRole('list');
    expect(within(lista).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Sin descripción.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar Resuelve problemas de cantidad' }));
    expect(props.alEditar).toHaveBeenCalledWith(COMPETENCIAS[0]);
  });

  it('tiene un solo botón de cierre, sin «Cancelar» y «Listo» repetidos', () => {
    pintar();

    const dialogo = screen.getByRole('dialog', { name: 'Gestionar competencias' });
    expect(within(dialogo).queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    expect(within(dialogo).queryByRole('button', { name: 'Listo' })).not.toBeInTheDocument();
    expect(within(dialogo).getAllByRole('button', { name: 'Cerrar' }).length).toBeGreaterThan(0);
  });

  it('pide confirmación antes de eliminar', async () => {
    const props = pintar();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Resuelve problemas de forma' }));
    const confirmacion = screen.getByRole('dialog', { name: 'Eliminar competencia' });
    expect(props.alEliminar).not.toHaveBeenCalled();

    fireEvent.click(within(confirmacion).getByRole('button', { name: 'Eliminar' }));
    expect(props.alEliminar).toHaveBeenCalledWith(COMPETENCIAS[1]);
  });

  it('sin competencias muestra el estado vacío y mientras carga deshabilita agregar', () => {
    pintar({ competencias: [] });
    expect(screen.getByText('Este curso todavía no tiene competencias.')).toBeInTheDocument();
    expect(screen.getByText('0 competencias')).toBeInTheDocument();
  });

  it('mientras carga no permite agregar', () => {
    pintar({ competencias: [], cargando: true });

    expect(screen.getByRole('button', { name: 'Agregar competencia' })).toBeDisabled();
    expect(screen.getByText('Cargando competencias…', { selector: 'p' })).toBeInTheDocument();
  });
});
