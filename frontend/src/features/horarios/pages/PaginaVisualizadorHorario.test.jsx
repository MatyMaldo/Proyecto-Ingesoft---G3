import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    cambiarOmisionSesion: vi.fn(),
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

// Con toda la suite en paralelo la primera carga puede superar el segundo por defecto de `findBy*`.
const ESPERA = { timeout: 4000 };

/**
 * Espera el resumen con la semana que tiene sesiones: un instante antes se ve la primera semana del rango, sin
 * sesiones, y «Ver horario» aún está deshabilitado.
 */
async function esperarResumen() {
  const boton = await screen.findByRole('button', { name: 'Ver horario' }, ESPERA);
  await waitFor(() => expect(boton).toBeEnabled(), ESPERA);
  return boton;
}

/** Espera el resumen y abre el diálogo con la matriz («Ver horario»). */
async function abrirHorario() {
  fireEvent.click(await esperarResumen());
  return screen.findByRole('dialog', { name: /^Horario/ }, ESPERA);
}

describe('Resumen de la consulta', () => {
  it('muestra las cifras y los estados de la semana sin la matriz hasta pulsar «Ver horario»', async () => {
    render(<PaginaVisualizadorHorario />);

    await esperarResumen();
    const resumen = screen.getByRole('region', { name: 'Resumen del horario' });
    expect(within(resumen).getByText('Sesiones').nextSibling).toHaveTextContent('3');
    expect(within(resumen).getByText('Cursos').nextSibling).toHaveTextContent('3');
    expect(within(resumen).getByText('Días con clase').nextSibling).toHaveTextContent('3');
    expect(within(resumen).getByText('Horas de clase').nextSibling).toHaveTextContent('4 h');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('Matematicas')).not.toBeInTheDocument();
  });

  it('abre el horario en un diálogo y lo cierra con «Cerrar»', async () => {
    render(<PaginaVisualizadorHorario />);

    const dialogo = await abrirHorario();
    expect(within(dialogo).getByText('Matematicas')).toBeInTheDocument();

    fireEvent.click(within(dialogo).getAllByRole('button', { name: 'Cerrar' }).at(-1));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('Matriz semanal de horarios', () => {
  it('muestra cursos, aulas y rangos de hora de las sesiones', async () => {
    render(<PaginaVisualizadorHorario />);
    const dialogo = await abrirHorario();

    expect(within(dialogo).getByText('Matematicas')).toBeInTheDocument();
    expect(within(dialogo).getByText('Comunicacion')).toBeInTheDocument();
    expect(within(dialogo).getByText('Historia')).toBeInTheDocument();

    expect(within(dialogo).getByText(/Aula 101/)).toBeInTheDocument();
    expect(within(dialogo).getByText(/Aula 102/)).toBeInTheDocument();
    expect(within(dialogo).getByText(/Aula 103/)).toBeInTheDocument();

    expect(within(dialogo).getAllByText('08:00 – 10:00').length).toBeGreaterThan(0);
    expect(within(dialogo).getAllByText('08:00 – 09:00').length).toBeGreaterThan(0);
    expect(within(dialogo).getAllByText('10:00 – 11:00').length).toBeGreaterThan(0);

    expect(within(dialogo).getByLabelText('Semana anterior')).toBeInTheDocument();
    expect(within(dialogo).getByLabelText('Semana siguiente')).toBeInTheDocument();
  });

  it('ubica cada curso en el día correspondiente', async () => {
    render(<PaginaVisualizadorHorario />);
    const dialogo = await abrirHorario();

    const encabezados = within(dialogo).getAllByRole('columnheader').slice(0, 6);
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

describe('Estructura de la pantalla', () => {
  it('no tiene acción general en la cabecera y usa el actualizar compartido', async () => {
    render(<PaginaVisualizadorHorario />);
    await esperarResumen();

    const cabecera = screen.getByRole('heading', { level: 1, name: 'Consulta de horario' }).closest('header');
    expect(within(cabecera).queryByRole('button')).not.toBeInTheDocument();
    expect(within(cabecera).queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
  });

  it('muestra el estado de las sesiones de la semana con su cantidad', async () => {
    render(<PaginaVisualizadorHorario />);
    await esperarResumen();

    const leyenda = screen.getByRole('list', { name: 'Estados de las sesiones de la semana' });
    expect(within(leyenda).getAllByRole('listitem')).toHaveLength(1);
    // El contador está dentro del chip del estado, no al lado.
    const chip = within(leyenda).getByText('Programada');
    expect(chip).toHaveTextContent('Programada3');
    expect(within(chip).getByText('3')).toBeInTheDocument();
  });
});

describe('Navegación de semanas', () => {
  it('ofrece mes, semanas del mes con aviso de sesiones y salto a hoy en el resumen', async () => {
    render(<PaginaVisualizadorHorario />);

    await esperarResumen();

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
    const dialogo = await abrirHorario();

    const bloque = within(dialogo).getByText('Matematicas').parentElement;
    expect(bloque).not.toHaveTextContent(/\d{2}\/\d{2}\/\d{4}/);
    // Matemáticas dura 2 horas (2 filas): conserva su rango; Comunicación ocupa 1 fila y no lo repite.
    expect(bloque).toHaveTextContent('08:00 – 10:00');
    expect(within(dialogo).getByText('Comunicacion').parentElement).not.toHaveTextContent('08:00 – 09:00');
  });

  it('ofrece pestañas por día con su fecha para la vista móvil', async () => {
    render(<PaginaVisualizadorHorario />);
    const dialogo = await abrirHorario();

    const dias = within(dialogo).getByRole('group', { name: 'Día de la semana' });
    expect(within(dias).getAllByRole('button')).toHaveLength(5);
    expect(within(dias).getByRole('button', { name: /^Lunes \d{2}\/\d{2}\/\d{4}$/ })).toBeInTheDocument();
    expect(within(dias).getAllByRole('button').filter(
      (boton) => boton.getAttribute('aria-pressed') === 'true'
    )).toHaveLength(1);
  });
});
