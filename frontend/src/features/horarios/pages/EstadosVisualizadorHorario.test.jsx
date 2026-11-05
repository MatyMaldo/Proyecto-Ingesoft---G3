import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const escenario = vi.hoisted(() => ({
  rol: 'ESTUDIANTE',
  estado: 'SIN_MATRICULA',
  mensaje: ''
}));

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({
    usuario: { rol: escenario.rol }
  })
}));

vi.mock('../services/visualizadoresService.js', () => {
  const consultar = vi.fn(async () => ({
    exitoso: true,
    datos: {
      estado: escenario.estado,
      mensaje: escenario.mensaje,
      bloques: []
    }
  }));

  return {
    horarioSeccion: vi.fn(),
    horarioDocente: vi.fn(),
    miHorarioDocente: vi.fn(),
    miHorarioEstudiante: consultar,
    horarioApoderado: consultar,
    listarSecciones: vi.fn(),
    listarDocentes: vi.fn(),
    listarMisEstudiantes: vi.fn(async () => ({
      exitoso: true,
      datos: [{ id: 5, nombreCompleto: 'Luis Perez' }]
    }))
  };
});

import PaginaVisualizadorHorario from './PaginaVisualizadorHorario.jsx';

const SIN_MATRICULA =
  'No tiene una matrícula confirmada en el año académico activo';

const SIN_BLOQUES =
  'Aún no se le ha asignado un horario programado';

beforeEach(() => {
  escenario.rol = 'ESTUDIANTE';
  escenario.estado = 'SIN_MATRICULA';
  escenario.mensaje = SIN_MATRICULA;
});

describe('Estados vacios del visualizador', () => {
  it('estudiante sin matrícula confirmada', async () => {
    render(<PaginaVisualizadorHorario />);

    expect(
      await screen.findByText(SIN_MATRICULA)
    ).toBeInTheDocument();
  });

  it('estudiante matriculado sin bloques', async () => {
    escenario.estado = 'SIN_BLOQUES';
    escenario.mensaje = SIN_BLOQUES;

    render(<PaginaVisualizadorHorario />);

    expect(
      await screen.findByText(SIN_BLOQUES)
    ).toBeInTheDocument();
  });

  it('apoderado consulta estudiante sin matrícula', async () => {
    escenario.rol = 'APODERADO';

    render(<PaginaVisualizadorHorario />);

    const selector = await screen.findByLabelText(
      /Seleccionar estudiante a cargo/i
    );

    fireEvent.change(selector, {
      target: { value: '5' }
    });

    expect(
      await screen.findByText(SIN_MATRICULA)
    ).toBeInTheDocument();
  });

  it('apoderado consulta estudiante sin bloques', async () => {
    escenario.rol = 'APODERADO';
    escenario.estado = 'SIN_BLOQUES';
    escenario.mensaje = SIN_BLOQUES;

    render(<PaginaVisualizadorHorario />);

    const selector = await screen.findByLabelText(
      /Seleccionar estudiante a cargo/i
    );

    fireEvent.change(selector, {
      target: { value: '5' }
    });

    expect(
      await screen.findByText(SIN_BLOQUES)
    ).toBeInTheDocument();
  });
});
