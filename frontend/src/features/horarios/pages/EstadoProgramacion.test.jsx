import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const escenario = vi.hoisted(() => ({
  abierta: false,
  conBloques: false
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
      bloques: escenario.conBloques ? [{
        id: 1,
        diaSemana: 'LUNES',
        horaInicio: '08:00:00',
        horaFin: '10:00:00',
        cursoNombre: 'Matematicas',
        docenteNombre: 'Juan Perez',
        aulaNombre: 'Aula 101'
      }] : []
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
  listarAniosAcademicos: vi.fn(async () => ({
    exitoso: true,
    datos: [{
      anio: new Date().getFullYear(),
      fechaInicio: '2000-01-01',
      fechaFin: '2100-12-31'
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
  escenario.conBloques = false;
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

    expect(enlace).toHaveAttribute('href', '/horarios?grado=1&seccion=A');
  });

  it('permite navegar desde un bloque con programacion abierta', async () => {
    escenario.abierta = true;
    escenario.conBloques = true;

    render(<PaginaVisualizadorHorario />);
    await seleccionarSeccion();

    const curso = await screen.findByText('Matematicas');

    await waitFor(() => {
      expect(curso.closest('a')).toHaveAttribute(
        'href', '/horarios?grado=1&seccion=A'
      );
    });
  });

  it('mantiene los bloques en solo lectura cuando esta cerrada', async () => {
    escenario.abierta = false;
    escenario.conBloques = true;

    render(<PaginaVisualizadorHorario />);
    await seleccionarSeccion();

    const curso = await screen.findByText('Matematicas');

    expect(curso.closest('a')).toBeNull();
  });
});