import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import MatrizSesiones from './MatrizSesiones.jsx';

const sesionBase = {
  id: 1,
  fecha: '2099-01-05',
  diaSemana: 'LUNES',
  horaInicio: '08:00',
  horaFin: '09:00',
  cursoNombre: 'Matemáticas',
  docenteNombre: 'Prof. García',
  aulaNombre: 'Aula 101',
  gradoNombre: '1er Grado',
  seccionNombre: 'A',
  estado: 'PROGRAMADA'
};

function renderMatriz(props = {}) {
  render(
    <MatrizSesiones
      titulo="1er Grado A"
      sesiones={[sesionBase]}
      lunes="2099-01-05"
      {...props}
    />
  );
}

describe('MatrizSesiones · selección para el panel de detalle', () => {
  it('abre el detalle al hacer clic en una sesión', () => {
    const alSeleccionarSesion = vi.fn();
    renderMatriz({ alSeleccionarSesion });

    fireEvent.click(screen.getByRole('button', {
      name: 'Ver detalle de Matemáticas del 05/01/2099'
    }));

    expect(alSeleccionarSesion).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, cursoNombre: 'Matemáticas' })
    );
  });

  it('deja el bloque como texto cuando no hay acción de detalle', () => {
    renderMatriz();

    expect(screen.queryByRole('button', {
      name: /Ver detalle de Matemáticas/
    })).not.toBeInTheDocument();
    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
  });

  it('mantiene los estados visuales de las sesiones', () => {
    const { rerender } = render(
      <MatrizSesiones
        titulo="1er Grado A"
        sesiones={[{ ...sesionBase, estado: 'OMITIDA' }]}
        lunes="2099-01-05"
        alSeleccionarSesion={vi.fn()}
      />
    );

    expect(screen.getByText('Omitida')).toBeInTheDocument();

    rerender(
      <MatrizSesiones
        titulo="1er Grado A"
        sesiones={[{ ...sesionBase, estado: 'FINALIZADA' }]}
        lunes="2099-01-05"
        alSeleccionarSesion={vi.fn()}
      />
    );

    expect(screen.getByText('Finalizada')).toBeInTheDocument();
  });

  it('expande la matriz para mostrar una sesión posterior al fin de jornada', () => {
    render(
      <MatrizSesiones
        titulo="1er Grado A"
        sesiones={[{
          ...sesionBase,
          horaInicio: '15:00',
          horaFin: '16:00'
        }]}
        lunes="2099-01-05"
        alSeleccionarSesion={vi.fn()}
      />
    );

    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '15:00 – 16:00' })).toBeInTheDocument();
  });
});
