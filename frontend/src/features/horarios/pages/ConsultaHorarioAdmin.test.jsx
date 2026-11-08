import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const anioActual = new Date().getFullYear();

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({ usuario: { rol: 'ADMINISTRADOR', nombre: 'Admin' } })
}));

vi.mock('../services/visualizadoresService.js', () => ({
  horarioSeccion: vi.fn(async () => ({ exitoso: true, datos: [] })),
  horarioDocente: vi.fn(),
  miHorarioDocente: vi.fn(),
  miHorarioEstudiante: vi.fn(),
  horarioApoderado: vi.fn(),
  // El backend devuelve secciones de dos años; la pantalla solo debe ofrecer las del año consultado.
  listarSecciones: vi.fn(async () => ({
    exitoso: true,
    datos: [
      { id: 1, gradoId: 1, gradoNombre: 'Primer grado', nombre: 'A', anioAcademicoId: 3, anioAcademico: anioActual + 1 },
      { id: 3, gradoId: 1, gradoNombre: 'Primer grado', nombre: 'B', anioAcademicoId: 2, anioAcademico: anioActual }
    ]
  })),
  listarDocentes: vi.fn(async () => ({ exitoso: true, datos: [] })),
  listarMisEstudiantes: vi.fn(),
  listarAniosAcademicos: vi.fn(async () => ({
    exitoso: true,
    datos: [{ id: 2, anio: anioActual }]
  })),
  obtenerPeriodo: vi.fn(async () => ({ exitoso: true, datos: {} }))
}));

import PaginaVisualizadorHorario from './PaginaVisualizadorHorario.jsx';

// Con toda la suite en paralelo la primera carga puede superar el segundo por defecto de `findBy*`.
const ESPERA = { timeout: 4000 };

async function elegirSeccion() {
  await screen.findByRole('option', { name: 'Primer grado' }, ESPERA);
  fireEvent.change(screen.getByLabelText('Grado'), { target: { value: '1' } });
  await within(screen.getByLabelText('Sección')).findByRole('option', { name: `B (${anioActual})` }, ESPERA);
  fireEvent.change(screen.getByLabelText('Sección'), { target: { value: '3' } });
}

describe('Consulta de horario del administrador', () => {
  it('indica qué elegir antes de consultar', async () => {
    render(<PaginaVisualizadorHorario />);

    expect(
      await screen.findByText('Selecciona un grado y una sección para consultar su horario.', {}, ESPERA)
    ).toBeInTheDocument();
  });

  it('solo ofrece secciones del año académico consultado', async () => {
    render(<PaginaVisualizadorHorario />);

    await screen.findByRole('option', { name: 'Primer grado' }, ESPERA);
    fireEvent.change(screen.getByLabelText('Grado'), { target: { value: '1' } });

    const selector = screen.getByLabelText('Sección');
    expect(await within(selector).findByRole('option', { name: `B (${anioActual})` }, ESPERA)).toBeInTheDocument();
    expect(within(selector).queryByRole('option', { name: `A (${anioActual + 1})` })).not.toBeInTheDocument();
  });

  it('muestra grado y sección como filtros aplicados y los quita con "Limpiar filtros"', async () => {
    render(<PaginaVisualizadorHorario />);

    await elegirSeccion();

    expect(await screen.findByText('Grado: Primer grado', {}, ESPERA)).toBeInTheDocument();
    expect(screen.getByText('Sección: B')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    expect(
      await screen.findByText('Selecciona un grado y una sección para consultar su horario.', {}, ESPERA)
    ).toBeInTheDocument();
    expect(screen.queryByText('Grado: Primer grado')).not.toBeInTheDocument();
  });

  it('al quitar el grado también se quita la sección elegida', async () => {
    render(<PaginaVisualizadorHorario />);

    await elegirSeccion();
    fireEvent.click(await screen.findByRole('button', { name: 'Quitar filtro Grado: Primer grado' }));

    expect(screen.queryByText('Sección: B')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Grado')).toHaveValue('');
  });

  it('cambia entre ver por sección y ver por docente con el control segmentado', async () => {
    render(<PaginaVisualizadorHorario />);

    const porSeccion = await screen.findByRole('radio', { name: 'Ver por sección' }, ESPERA);
    expect(porSeccion).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Grado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Ver por docente' }));

    expect(screen.getByRole('radio', { name: 'Ver por docente' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByLabelText('Grado')).not.toBeInTheDocument();
    expect(await screen.findByLabelText('Docente', {}, ESPERA)).toBeInTheDocument();
  });

  it('restaura la consulta desde la URL', async () => {
    window.history.replaceState(null, '', '/consulta-horarios?grado=1&id=3');

    render(<PaginaVisualizadorHorario />);

    expect(await screen.findByText('Sección: B', {}, ESPERA)).toBeInTheDocument();
    expect(screen.getByText('Grado: Primer grado')).toBeInTheDocument();
  });

  it('guarda los filtros elegidos en la URL', async () => {
    window.history.replaceState(null, '', '/consulta-horarios');

    render(<PaginaVisualizadorHorario />);
    await elegirSeccion();

    await waitFor(() => {
      expect(window.location.search).toBe('?grado=1&id=3');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    await waitFor(() => {
      expect(window.location.search).toBe('');
    });
  });

  it('ignora en la URL un id que no existe y valores inválidos', async () => {
    window.history.replaceState(null, '', '/consulta-horarios?id=999&desde=ayer&semana=xx');

    render(<PaginaVisualizadorHorario />);

    expect(
      await screen.findByText('Selecciona un grado y una sección para consultar su horario.', {}, ESPERA)
    ).toBeInTheDocument();
  });
});
