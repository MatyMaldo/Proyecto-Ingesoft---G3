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
    usuario: { rol: escenario.rol, nombre: 'Alumno' }
  })
}));

vi.mock('../services/visualizadoresService.js', () => {
  const consultar = vi.fn(async () => {
    if (escenario.estado === 'SIN_MATRICULA') {
      return { exitoso: false, datos: null, mensaje: escenario.mensaje };
    }
    return { exitoso: true, datos: [] };
  });

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
    })),
    listarAniosAcademicos: vi.fn(async () => ({
      exitoso: true,
      datos: [{ id: 2, anio: new Date().getFullYear() }]
    })),
    obtenerPeriodo: vi.fn()
  };
});

import PaginaVisualizadorHorario from './PaginaVisualizadorHorario.jsx';

const SIN_MATRICULA = 'No tiene una matrícula confirmada en el año académico activo';
const SIN_SESIONES = 'No hay sesiones en esta semana.';

beforeEach(() => {
  escenario.rol = 'ESTUDIANTE';
  escenario.estado = 'SIN_MATRICULA';
  escenario.mensaje = SIN_MATRICULA;
});

describe('Estados vacíos del visualizador', () => {
  it('estudiante sin matrícula confirmada', async () => {
    render(<PaginaVisualizadorHorario />);

    expect(await screen.findByText(SIN_MATRICULA)).toBeInTheDocument();
  });

  it('estudiante matriculado sin sesiones', async () => {
    escenario.estado = 'SIN_SESIONES';

    render(<PaginaVisualizadorHorario />);

    expect(await screen.findByText(SIN_SESIONES)).toBeInTheDocument();
  });

  it('apoderado consulta el horario del estudiante seleccionado', async () => {
    escenario.rol = 'APODERADO';
    escenario.estado = 'SIN_SESIONES';

    render(<PaginaVisualizadorHorario />);

    const selector = await screen.findByLabelText(/Estudiante a cargo/i);
    fireEvent.change(selector, { target: { value: '5' } });

    expect(await screen.findByText(SIN_SESIONES)).toBeInTheDocument();
  });
});
