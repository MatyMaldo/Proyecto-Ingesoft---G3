import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FiltrosHorario from './FiltrosHorario.jsx';

function mostrar(sobrescrituras = {}) {
  const props = {
    anios: [
      { id: 1, anio: 2027 },
      { id: 2, anio: 2026 },
      { id: 3, anio: 2028 }
    ],
    grados: [{ id: 10, nombre: '1er Grado' }],
    secciones: [],
    filtros: { anioId: '1', gradoId: '', seccion: '', completos: false },
    deshabilitado: false,
    alCambiarAnio: vi.fn(),
    alCambiarGrado: vi.fn(),
    alCambiarSeccion: vi.fn(),
    alVerHorario: vi.fn(),
    ...sobrescrituras
  };
  render(<FiltrosHorario {...props} />);
  return props;
}

describe('FiltrosHorario', () => {
  it('muestra el año académico seleccionado y lo ordena del más reciente al más antiguo', () => {
    mostrar();
    const anio = screen.getByLabelText(/^Año académico/);

    expect(anio).toHaveValue('1');
    const opciones = within(anio).getAllByRole('option').map((opcion) => opcion.textContent);
    expect(opciones).toEqual(['Seleccionar año...', '2028', '2027', '2026']);
  });

  it('avisa del año elegido sin tocar grado ni sección', async () => {
    const props = mostrar();
    await userEvent.selectOptions(screen.getByLabelText(/^Año académico/), '3');

    expect(props.alCambiarAnio).toHaveBeenCalledWith('3');
    expect(props.alCambiarGrado).not.toHaveBeenCalled();
    expect(props.alCambiarSeccion).not.toHaveBeenCalled();
  });

  it('mantiene deshabilitado "Ver horario" hasta tener año, grado y sección', () => {
    mostrar();
    expect(screen.getByRole('button', { name: 'Ver horario' })).toBeDisabled();
  });
});
