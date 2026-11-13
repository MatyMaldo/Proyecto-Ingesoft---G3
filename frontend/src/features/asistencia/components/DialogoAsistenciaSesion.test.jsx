import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import DialogoAsistenciaSesion from './DialogoAsistenciaSesion.jsx';

const sesion = {
  id: 4,
  cursoNombre: 'Matemáticas',
  seccionNombre: 'A',
  gradoNombre: '1er Grado',
  docenteNombre: 'Prof. García',
  fecha: '2026-11-13',
  horaInicio: '08:00',
  horaFin: '09:00'
};

const detalle = {
  estudiantes: [
    {
      estudianteId: 'EST-001',
      codigo: 'EST-001',
      nombreCompleto: 'María López',
      estado: null,
      observaciones: ''
    },
    {
      estudianteId: 'EST-002',
      codigo: 'EST-002',
      nombreCompleto: 'Carlos Ramírez',
      estado: 'TARDANZA',
      observaciones: 'Llegó tarde'
    }
  ]
};

describe('DialogoAsistenciaSesion', () => {
  it('exige marcar a todos los estudiantes antes de guardar', () => {
    const alGuardar = vi.fn();
    render(
      <DialogoAsistenciaSesion
        sesion={sesion}
        detalle={detalle}
        alCerrar={vi.fn()}
        alGuardar={alGuardar}
      />
    );

    const guardar = screen.getByRole('button', { name: 'Guardar asistencia' });
    expect(guardar).toBeDisabled();
    expect(screen.getByText('Faltan 1 estudiante por marcar.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Asistencia de María López'), {
      target: { value: 'PRESENTE' }
    });

    expect(guardar).toBeEnabled();
    fireEvent.click(guardar);

    expect(alGuardar).toHaveBeenCalledWith([
      expect.objectContaining({ estudianteId: 'EST-001', estado: 'PRESENTE' }),
      expect.objectContaining({
        estudianteId: 'EST-002',
        estado: 'TARDANZA',
        observaciones: 'Llegó tarde'
      })
    ]);
  });

  it('incluye el estado Justificada y conserva las observaciones', () => {
    render(
      <DialogoAsistenciaSesion
        sesion={sesion}
        detalle={detalle}
        alCerrar={vi.fn()}
        alGuardar={vi.fn()}
      />
    );

    const selector = screen.getByLabelText('Asistencia de María López');
    expect(within(selector).getByRole('option', { name: 'Justificada' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Llegó tarde')).toBeInTheDocument();
  });
});
