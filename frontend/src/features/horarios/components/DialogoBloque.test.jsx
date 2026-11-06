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
      franja={{ id: 'F1', inicio: '08:00', fin: '09:00' }}
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
  it('rellena el docente y guarda la asignación existente al elegir el curso', () => {
    const alGuardar = renderDialogo();

    fireEvent.change(screen.getByLabelText(/Curso asignado/), { target: { value: '22' } });

    const docente = screen.getByLabelText('Docente');
    expect(docente).toHaveValue('10');
    expect(docente).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Prof. Quispe' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Aula/), { target: { value: '31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(alGuardar).toHaveBeenCalledWith({ asignacionId: 22, aulaId: '31' });
  });

  it('recupera la asignación actual aunque los IDs lleguen con tipos distintos', () => {
    renderDialogo({
      bloque: { asignacionId: '21', aulaId: '31' }
    });

    expect(screen.getByLabelText(/Curso asignado/)).toHaveValue('21');
    expect(screen.getByLabelText('Docente')).toHaveValue('9');
  });
});
