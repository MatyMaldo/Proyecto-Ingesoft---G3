import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const escenario = vi.hoisted(() => ({
  abierta: false
}));

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({
    usuario: { rol: 'ADMINISTRADOR' }
  })
}));

vi.mock('../services/visualizadoresService.js', () => ({
  horarioSeccion: vi.fn(async () => ({
    exitoso: true,
    datos: {
      estado: 'SIN_BLOQUES',
      mensaje: 'Aún no se ha registrado un horario para esta sección',
      bloques: []
    }
  })),
  horarioDocente: vi.fn(),
  miHorarioDocente: vi.fn(),
  miHorarioEstudiante: vi.fn(),
  horarioApoderado: vi.fn(),
  listarSecciones: vi.fn(async () => ({
    exitoso: true,
    datos: [{
      id: 3,
      gradoId: 1,
      gradoNombre: 'Primer grado',
      nombre: 'A',
      anioAcademico: new Date().getFullYear()
    }]
  })),
  listarDocentes: vi.fn(),
  listarMisEstudiantes: vi.fn(),
  consultarEstadoProgramacion: vi.fn(async () => ({
    exitoso: true,
    datos: {
      seccionId: 3,
      anioAcademico: new Date().getFullYear(),
      programacionAbierta: escenario.abierta
    }
  }))
}));

import PaginaVisualizadorHorario from './PaginaVisualizadorHorario.jsx';
import { consultarEstadoProgramacion } from '../services/visualizadoresService.js';

async function seleccionarSeccion() {
  const grado = await screen.findByLabelText(/Seleccionar grado/i);
  fireEvent.change(grado, { target: { value: '1' } });

  const seccion = screen.getByLabelText(/Seleccionar sección/i);
  fireEvent.change(seccion, { target: { value: '3' } });

  await waitFor(() => {
    expect(consultarEstadoProgramacion).toHaveBeenCalledWith('3');
  });
}

beforeEach(() => {
  escenario.abierta = false;
  vi.clearAllMocks();
});

describe('HU-GEMIH-03 - Navegacion al editor', () => {
  it('oculta editar horario cuando la programacion esta cerrada', async () => {
    render(<PaginaVisualizadorHorario />);
    await seleccionarSeccion();

    await screen.findByText(
      'Aún no se ha registrado un horario para esta sección'
    );

    expect(
      screen.queryByRole('link', { name: 'Editar horario' })
    ).not.toBeInTheDocument();
  });

  it('muestra editar horario cuando la programacion esta abierta', async () => {
    escenario.abierta = true;

    render(<PaginaVisualizadorHorario />);
    await seleccionarSeccion();

    const enlace = await screen.findByRole('link', {
      name: 'Editar horario'
    });

    expect(enlace).toHaveAttribute('href', '/horarios');
  });
});