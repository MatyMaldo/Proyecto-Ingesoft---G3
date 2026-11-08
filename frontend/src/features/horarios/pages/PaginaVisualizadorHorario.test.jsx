import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({ usuario: { rol: 'DOCENTE', nombre: 'Juan Perez' } })
}));

vi.mock('../services/visualizadoresService.js', () => {
  const fechaDe = (offset) => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7) + offset);
    const anio = lunes.getFullYear();
    const mes = String(lunes.getMonth() + 1).padStart(2, '0');
    const dia = String(lunes.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  };

  return {
    horarioSeccion: vi.fn(),
    horarioDocente: vi.fn(),
    miHorarioDocente: vi.fn(async () => ({
      exitoso: true,
      datos: [
        {
          id: 1,
          fecha: fechaDe(0),
          diaSemana: 'LUNES',
          horaInicio: '08:00',
          horaFin: '10:00',
          cursoNombre: 'Matematicas',
          docenteNombre: 'Juan Perez',
          aulaNombre: 'Aula 101',
          seccionNombre: 'A',
          gradoNombre: 'Primero',
          estado: 'PROGRAMADA'
        },
        {
          id: 2,
          fecha: fechaDe(1),
          diaSemana: 'MARTES',
          horaInicio: '08:00',
          horaFin: '09:00',
          cursoNombre: 'Comunicacion',
          docenteNombre: 'Juan Perez',
          aulaNombre: 'Aula 102',
          seccionNombre: 'B',
          gradoNombre: 'Primero',
          estado: 'PROGRAMADA'
        },
        {
          id: 3,
          fecha: fechaDe(2),
          diaSemana: 'MIERCOLES',
          horaInicio: '10:00',
          horaFin: '11:00',
          cursoNombre: 'Historia',
          docenteNombre: 'Juan Perez',
          aulaNombre: 'Aula 103',
          seccionNombre: 'A',
          gradoNombre: 'Primero',
          estado: 'PROGRAMADA'
        }
      ]
    })),
    miHorarioEstudiante: vi.fn(),
    horarioApoderado: vi.fn(),
    listarSecciones: vi.fn(),
    listarDocentes: vi.fn(),
    listarMisEstudiantes: vi.fn(),
    listarAniosAcademicos: vi.fn(async () => ({
      exitoso: true,
      datos: [{ id: 2, anio: new Date().getFullYear() }]
    })),
    obtenerPeriodo: vi.fn()
  };
});

import PaginaVisualizadorHorario from './PaginaVisualizadorHorario.jsx';

describe('Matriz semanal de horarios', () => {
  it('muestra cursos, aulas y rangos de hora de las sesiones', async () => {
    render(<PaginaVisualizadorHorario />);

    expect(await screen.findByText('Matematicas')).toBeInTheDocument();
    expect(screen.getByText('Comunicacion')).toBeInTheDocument();
    expect(screen.getByText('Historia')).toBeInTheDocument();

    expect(screen.getByText(/Aula 101/)).toBeInTheDocument();
    expect(screen.getByText(/Aula 102/)).toBeInTheDocument();
    expect(screen.getByText(/Aula 103/)).toBeInTheDocument();

    expect(screen.getAllByText('08:00 – 10:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('08:00 – 09:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10:00 – 11:00').length).toBeGreaterThan(0);

    expect(screen.getByLabelText('Semana anterior')).toBeInTheDocument();
    expect(screen.getByLabelText('Semana siguiente')).toBeInTheDocument();
    expect(screen.getByLabelText('Ir a semana')).toBeInTheDocument();
  });

  it('ubica cada curso en el día correspondiente', async () => {
    render(<PaginaVisualizadorHorario />);

    await screen.findByText('Matematicas');

    const encabezados = screen.getAllByRole('columnheader').slice(0, 6);
    // Cada columna lleva el día y, debajo, su fecha (la de hoy dice "Hoy").
    expect(encabezados.map((h) => h.textContent)).toEqual([
      'Hora',
      expect.stringMatching(/^Lunes(Hoy · )?\d{2}\/\d{2}$/),
      expect.stringMatching(/^Martes(Hoy · )?\d{2}\/\d{2}$/),
      expect.stringMatching(/^Miércoles(Hoy · )?\d{2}\/\d{2}$/),
      expect.stringMatching(/^Jueves(Hoy · )?\d{2}\/\d{2}$/),
      expect.stringMatching(/^Viernes(Hoy · )?\d{2}\/\d{2}$/)
    ]);
  });
});

describe('Navegación de semanas', () => {
  it('ofrece mes, semanas del mes con aviso de sesiones y salto a hoy', async () => {
    render(<PaginaVisualizadorHorario />);

    await screen.findByText('Matematicas');

    expect(screen.getByLabelText('Mes')).toBeInTheDocument();
    const semanas = screen.getByRole('group', { name: 'Ir a semana' });
    const activa = within(semanas).getAllByRole('button').find(
      (boton) => boton.getAttribute('aria-pressed') === 'true'
    );
    expect(activa).toHaveAccessibleName(/, con sesiones$/);
    expect(screen.getByRole('button', { name: 'Ir a hoy' })).toBeDisabled();
  });
});

describe('Bloques y días de la matriz', () => {
  it('no repite la fecha dentro del bloque y muestra la hora solo si abarca varias filas', async () => {
    render(<PaginaVisualizadorHorario />);

    await screen.findByText('Matematicas');

    const bloque = screen.getByText('Matematicas').parentElement;
    expect(bloque).not.toHaveTextContent(/\d{2}\/\d{2}\/\d{4}/);
    // Matemáticas dura 2 horas (2 filas): conserva su rango; Comunicación ocupa 1 fila y no lo repite.
    expect(bloque).toHaveTextContent('08:00 – 10:00');
    expect(screen.getByText('Comunicacion').parentElement).not.toHaveTextContent('08:00 – 09:00');
  });

  it('ofrece pestañas por día con su fecha para la vista móvil', async () => {
    render(<PaginaVisualizadorHorario />);

    await screen.findByText('Matematicas');

    const dias = screen.getByRole('group', { name: 'Día de la semana' });
    expect(within(dias).getAllByRole('button')).toHaveLength(5);
    expect(within(dias).getByRole('button', { name: /^Lunes \d{2}\/\d{2}\/\d{4}$/ })).toBeInTheDocument();
    expect(within(dias).getAllByRole('button').filter(
      (boton) => boton.getAttribute('aria-pressed') === 'true'
    )).toHaveLength(1);
  });
});
