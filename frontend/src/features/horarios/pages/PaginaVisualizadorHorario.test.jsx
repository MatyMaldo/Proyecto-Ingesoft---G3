import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({ usuario: { rol: 'DOCENTE' } })
}));

vi.mock('../services/visualizadoresService.js', () => ({
  horarioSeccion: vi.fn(),
  horarioDocente: vi.fn(),
  miHorarioDocente: vi.fn(async () => ({
    exitoso: true,
    datos: {
      estado: 'OK',
      mensaje: '',
      bloques: [
        {
          id: 1,
          diaSemana: 'LUNES',
          horaInicio: '08:00:00',
          horaFin: '10:00:00',
          cursoNombre: 'Matematicas',
          docenteNombre: 'Juan Perez',
          aulaNombre: 'Aula 101',
          seccionNombre: 'A'
        },
        {
          id: 2,
          diaSemana: 'MARTES',
          horaInicio: '08:00:00',
          horaFin: '09:00:00',
          cursoNombre: 'Comunicacion',
          docenteNombre: 'Juan Perez',
          aulaNombre: 'Aula 102',
          seccionNombre: 'B'
        },
        {
          id: 3,
          diaSemana: 'MIERCOLES',
          horaInicio: '10:00:00',
          horaFin: '11:00:00',
          cursoNombre: 'Historia',
          docenteNombre: 'Juan Perez',
          aulaNombre: 'Aula 103',
          seccionNombre: 'A'
        }
      ]
    }
  })),
  miHorarioEstudiante: vi.fn(),
  horarioApoderado: vi.fn(),
  listarSecciones: vi.fn(),
  listarDocentes: vi.fn(),
  listarMisEstudiantes: vi.fn()
}));

import PaginaVisualizadorHorario from './PaginaVisualizadorHorario.jsx';

describe('Matriz semanal de horarios', () => {
  it('muestra cursos, aulas y horas de tres bloques', async () => {
    render(<PaginaVisualizadorHorario />);

    expect(
      await screen.findByText('Matematicas')
    ).toBeInTheDocument();

    expect(screen.getByText('Comunicacion')).toBeInTheDocument();
    expect(screen.getByText('Historia')).toBeInTheDocument();

    expect(screen.getByText('Aula 101')).toBeInTheDocument();
    expect(screen.getByText('Aula 102')).toBeInTheDocument();
    expect(screen.getByText('Aula 103')).toBeInTheDocument();

    expect(screen.getByText('08:00 - 10:00')).toBeInTheDocument();
    expect(screen.getAllByText('08:00 - 09:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10:00 - 11:00').length).toBeGreaterThan(0);
  });

  it('ubica cada curso en el dia correspondiente', async () => {
    render(<PaginaVisualizadorHorario />);

    await screen.findByText('Matematicas');

    const encabezados = screen.getAllByRole('columnheader').slice(0, 6);
    expect(encabezados.map(h => h.textContent)).toEqual([
      'Horario', 'Lunes', 'Martes', 'Miércoles',
      'Jueves', 'Viernes'
    ]);

    const filas = screen.getAllByRole('row');
    const filaMatematicas = filas.find(f =>
      f.textContent.includes('08:00 - 10:00')
    );

    expect(filaMatematicas).toBeTruthy();

    const celdas = within(filaMatematicas).getAllByRole('cell');
    expect(within(celdas[0]).getByText('Matematicas'))
      .toBeInTheDocument();
  });
});


