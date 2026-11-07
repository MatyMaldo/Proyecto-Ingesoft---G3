import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import DialogoBloque from './DialogoBloque.jsx';

const asignaciones = [
  {
    id: 21,
    cursoId: 4,
    cursoNombre: 'Matemáticas',
    docenteId: 9,
    docenteNombre: 'Prof. García'
  },
  {
    id: 22,
    cursoId: 5,
    cursoNombre: 'Comunicación',
    docenteId: 10,
    docenteNombre: 'Prof. Quispe'
  }
];

function renderDialogo(props = {}) {
  const alGuardar = vi.fn();
  render(
    <DialogoBloque
      dia="LUNES"
      horaInicioInicial="08:00"
      horaFinInicial="10:00"
      asignaciones={asignaciones}
      aulas={[{ id: 31, nombre: 'Aula 101' }]}
      ocupaciones={[]}
      alCancelar={vi.fn()}
      alGuardar={alGuardar}
      {...props}
    />
  );
  return alGuardar;
}

describe('DialogoBloque · asignación curso-docente', () => {
  it('rellena el docente y guarda el rango de horas del bloque', () => {
    const alGuardar = renderDialogo();

    fireEvent.change(screen.getByLabelText(/Curso asignado/), { target: { value: '22' } });

    const docente = screen.getByLabelText('Docente');
    expect(docente).toHaveValue('10');
    expect(docente).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Prof. Quispe' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Aula/), { target: { value: '31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar bloque' }));

    expect(alGuardar).toHaveBeenCalledWith({
      dia: 'LUNES',
      asignacionId: 22,
      aulaId: '31',
      horaInicio: '08:00',
      horaFin: '10:00'
    });
  });

  it('recupera la asignación actual aunque los IDs lleguen con tipos distintos', () => {
    renderDialogo({
      bloque: {
        id: 5,
        asignacionId: '21',
        aulaId: '31',
        horaInicio: '08:00',
        horaFin: '09:00'
      }
    });

    expect(screen.getByLabelText(/Curso asignado/)).toHaveValue('21');
    expect(screen.getByLabelText('Docente')).toHaveValue('9');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  it('rechaza un bloque que cruza el recreo', () => {
    const alGuardar = renderDialogo({ horaFinInicial: '11:30' });

    fireEvent.change(screen.getByLabelText(/Curso asignado/), { target: { value: '21' } });
    fireEvent.change(screen.getByLabelText(/Aula/), { target: { value: '31' } });
    fireEvent.change(screen.getByLabelText('Hora de inicio'), { target: { value: '10:30' } });
    fireEvent.change(screen.getByLabelText('Hora de fin'), { target: { value: '11:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar bloque' }));

    expect(screen.getByText(/no puede ocupar el recreo/i)).toBeInTheDocument();
    expect(alGuardar).not.toHaveBeenCalled();
  });
});
