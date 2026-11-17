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

    const grupo = screen.getByRole('radiogroup', { name: 'Asistencia de María López' });
    fireEvent.click(within(grupo).getByRole('radio', { name: 'Asistió' }));

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

    const grupo = screen.getByRole('radiogroup', { name: 'Asistencia de María López' });
    expect(within(grupo).getByRole('radio', { name: 'Justificada' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Llegó tarde')).toBeInTheDocument();
  });

  it('marca como Asistió solo a los pendientes y no pisa lo ya marcado', () => {
    const alGuardar = vi.fn();
    render(
      <DialogoAsistenciaSesion
        sesion={sesion}
        detalle={detalle}
        alCerrar={vi.fn()}
        alGuardar={alGuardar}
      />
    );

    const avance = (texto) => screen.getByText((_, nodo) => nodo?.tagName === 'SPAN' && nodo.textContent === texto);
    expect(avance('1 de 2 marcados')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /como Asistió/ }));

    expect(avance('2 de 2 marcados')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /como Asistió/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar asistencia' }));
    expect(alGuardar).toHaveBeenCalledWith([
      expect.objectContaining({ estudianteId: 'EST-001', estado: 'PRESENTE' }),
      expect.objectContaining({ estudianteId: 'EST-002', estado: 'TARDANZA' })
    ]);
  });

  it('en solo lectura muestra lo registrado sin permitir cambios ni guardar', () => {
    render(
      <DialogoAsistenciaSesion
        sesion={sesion}
        detalle={detalle}
        soloLectura
        alCerrar={vi.fn()}
        alGuardar={vi.fn()}
      />
    );

    expect(screen.getByText('Asistencia de la sesión')).toBeInTheDocument();
    expect(screen.getByText('13/11/2026')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar asistencia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /como Asistió/ })).not.toBeInTheDocument();

    const grupo = screen.getByRole('radiogroup', { name: 'Asistencia de Carlos Ramírez' });
    expect(within(grupo).getByRole('radio', { name: 'Tardanza' })).toHaveAttribute('aria-checked', 'true');
    within(grupo).getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
    expect(screen.getByLabelText('Observaciones de Carlos Ramírez')).toHaveAttribute('readonly');
  });
});
