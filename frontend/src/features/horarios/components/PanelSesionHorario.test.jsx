import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import PanelSesionHorario from './PanelSesionHorario.jsx';

const sesionBase = {
  id: 12,
  fecha: '2099-01-05',
  horaInicio: '08:00',
  horaFin: '09:00',
  cursoNombre: 'Matemáticas',
  docenteNombre: 'Prof. García',
  aulaNombre: 'Aula 101',
  gradoNombre: '1er Grado',
  seccionNombre: 'A',
  estado: 'PROGRAMADA'
};

function renderPanel(props = {}) {
  const alCambiarOmision = vi.fn();
  const alCerrar = vi.fn();
  render(
    <PanelSesionHorario
      sesion={sesionBase}
      alCambiarOmision={alCambiarOmision}
      alCerrar={alCerrar}
      {...props}
    />
  );
  return { alCambiarOmision, alCerrar };
}

describe('PanelSesionHorario', () => {
  it('permite omitir una sesión programada futura', () => {
    const { alCambiarOmision } = renderPanel();

    expect(screen.getByText('Prof. García')).toBeInTheDocument();
    expect(screen.getByText('05/01/2099')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Omitir sesión' }));
    expect(alCambiarOmision).toHaveBeenCalledWith(
      expect.objectContaining({ id: 12 }),
      true
    );
  });

  it('permite restaurar una sesión omitida futura', () => {
    const { alCambiarOmision } = renderPanel({
      sesion: { ...sesionBase, estado: 'OMITIDA' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar sesión' }));
    expect(alCambiarOmision).toHaveBeenCalledWith(
      expect.objectContaining({ id: 12 }),
      false
    );
  });

  it('no ofrece acción para sesiones finalizadas', () => {
    renderPanel({ sesion: { ...sesionBase, estado: 'FINALIZADA' } });

    expect(screen.getByText('Esta sesión ya no se puede modificar.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Omitir sesión|Restaurar sesión/ }))
      .not.toBeInTheDocument();
  });

  it('no ofrece acción para sesiones que ya comenzaron', () => {
    renderPanel({
      sesion: { ...sesionBase, fecha: '2000-01-05' }
    });

    expect(screen.getByText('Solo se puede modificar antes de que comience la sesión.'))
      .toBeInTheDocument();
  });

  it('deshabilita la acción mientras se actualiza', () => {
    renderPanel({ cambiando: true });

    expect(screen.getByRole('button', { name: /Actualizando/ })).toBeDisabled();
  });

  it('cierra el panel con el botón de cerrar', () => {
    const { alCerrar } = renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle de la sesión' }));
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });
});
