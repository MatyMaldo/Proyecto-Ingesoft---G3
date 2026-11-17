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
  const campo = await screen.findByRole('combobox', { name: 'Sección' }, ESPERA);
  fireEvent.click(campo);
  fireEvent.mouseDown(await screen.findByRole('option', { name: 'Primer grado · B' }, ESPERA));
}

describe('Consulta de horario del administrador', () => {
  it('indica qué elegir antes de consultar', async () => {
    render(<PaginaVisualizadorHorario />);

    expect(
      await screen.findByText('Selecciona una sección para consultar su horario.', {}, ESPERA)
    ).toBeInTheDocument();
  });

  it('solo ofrece secciones del año académico consultado, en un solo campo de grado y sección', async () => {
    render(<PaginaVisualizadorHorario />);

    const campo = await screen.findByRole('combobox', { name: 'Sección' }, ESPERA);
    expect(screen.queryByLabelText('Grado')).not.toBeInTheDocument();
    fireEvent.click(campo);

    expect(await screen.findByRole('option', { name: 'Primer grado · B' }, ESPERA)).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Primer grado · A' })).not.toBeInTheDocument();
  });

  it('ofrece "Limpiar filtros" junto a "Actualizar" solo cuando hay filtros, sin chips de resultado', async () => {
    render(<PaginaVisualizadorHorario />);
    await screen.findByRole('combobox', { name: 'Sección' }, ESPERA);

    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    await elegirSeccion();

    const limpiar = await screen.findByRole('button', { name: 'Limpiar filtros' }, ESPERA);
    expect(screen.queryByRole('list', { name: 'Filtros aplicados' })).not.toBeInTheDocument();
    expect(screen.queryByText('Grado: Primer grado')).not.toBeInTheDocument();
    const filaModo = screen.getByRole('button', { name: 'Actualizar' }).closest('div[class*="filaModo"]');
    expect(filaModo).toContainElement(limpiar);

    fireEvent.click(limpiar);

    expect(
      await screen.findByText('Selecciona una sección para consultar su horario.', {}, ESPERA)
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Sección' })).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('pone los selectores debajo de "Consultar por" y "Actualizar" a su lado', async () => {
    render(<PaginaVisualizadorHorario />);
    await screen.findByRole('radio', { name: 'Ver por sección' }, ESPERA);

    const filaModo = screen.getByRole('radio', { name: 'Ver por sección' }).closest('div[class*="filaModo"]');
    expect(within(filaModo).getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    expect(within(filaModo).queryByRole('combobox', { name: 'Sección' })).not.toBeInTheDocument();
    expect(
      filaModo.compareDocumentPosition(screen.getByRole('combobox', { name: 'Sección' }))
        & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('cambia entre ver por sección y ver por docente con el control segmentado', async () => {
    render(<PaginaVisualizadorHorario />);

    const porSeccion = await screen.findByRole('radio', { name: 'Ver por sección' }, ESPERA);
    expect(porSeccion).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('combobox', { name: 'Sección' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Ver por docente' }));

    expect(screen.getByRole('radio', { name: 'Ver por docente' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByRole('combobox', { name: 'Sección' })).not.toBeInTheDocument();
    expect(await screen.findByRole('combobox', { name: 'Docente' }, ESPERA)).toBeInTheDocument();
  });

  it('restaura la consulta desde la URL', async () => {
    window.history.replaceState(null, '', '/consulta-horarios?grado=1&id=3');

    render(<PaginaVisualizadorHorario />);

    await waitFor(
      () => expect(screen.getByRole('combobox', { name: 'Sección' })).toHaveValue('Primer grado · B'),
      ESPERA
    );
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
      await screen.findByText('Selecciona una sección para consultar su horario.', {}, ESPERA)
    ).toBeInTheDocument();
  });
});
