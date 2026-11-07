import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { fechaISO, lunesDeFecha } from '../utils/tiempo.js';

const escenario = vi.hoisted(() => ({
  abierta: false
}));

const lunes = fechaISO(lunesDeFecha(fechaISO(new Date())));

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({
    usuario: { rol: 'ADMINISTRADOR', nombre: 'Admin' }
  })
}));

vi.mock('../services/visualizadoresService.js', () => ({
  horarioSeccion: vi.fn(async () => ({
    exitoso: true,
    datos: [{
      id: 1,
      fecha: lunes,
      diaSemana: 'LUNES',
      horaInicio: '08:00',
      horaFin: '09:00',
      cursoNombre: 'Matematicas',
      docenteNombre: 'Juan Perez',
      aulaNombre: 'Aula 101',
      seccionNombre: 'A',
      gradoNombre: 'Primer grado',
      estado: 'PROGRAMADA'
    }]
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
      anioAcademicoId: 2,
      anioAcademico: new Date().getFullYear()
    }]
  })),
  listarDocentes: vi.fn(async () => ({ exitoso: true, datos: [] })),
  listarMisEstudiantes: vi.fn(),
  listarAniosAcademicos: vi.fn(async () => ({
    exitoso: true,
    datos: [{ id: 2, anio: new Date().getFullYear() }]
  })),
  obtenerPeriodo: vi.fn(async () => ({
    exitoso: true,
    datos: {
      anioAcademicoId: 2,
      estado: escenario.abierta ? 'VIGENTE' : 'SIN_INICIAR',
      asignacionCursoDocenteAbierta: false,
      crudBloquesHorarioAbierta: escenario.abierta,
      generacionSesionesAbierta: false
    }
  }))
}));

import PaginaVisualizadorHorario from './PaginaVisualizadorHorario.jsx';
import { obtenerPeriodo } from '../services/visualizadoresService.js';

async function seleccionarSeccion() {
  await screen.findByRole('option', { name: 'Primer grado' });
  const grado = screen.getByLabelText(/Grado/i);
  fireEvent.change(grado, { target: { value: '1' } });

  await screen.findByRole('option', { name: /A \(/ });
  const seccion = screen.getByLabelText(/Sección/i);
  fireEvent.change(seccion, { target: { value: '3' } });

  await waitFor(() => {
    expect(obtenerPeriodo).toHaveBeenCalledWith(2);
  });
}

beforeEach(() => {
  escenario.abierta = false;
  vi.clearAllMocks();
});

describe('HU-GEMIH-03 - Navegación al editor', () => {
  it('oculta editar horario cuando la programación está cerrada', async () => {
    render(<PaginaVisualizadorHorario />);
    await seleccionarSeccion();

    await screen.findByText('Matematicas');

    expect(screen.queryByRole('link', { name: 'Editar horario' })).not.toBeInTheDocument();
  });

  it('muestra editar horario cuando la programación está abierta', async () => {
    escenario.abierta = true;

    render(<PaginaVisualizadorHorario />);
    await seleccionarSeccion();

    const enlace = await screen.findByRole('link', { name: 'Editar horario' });
    expect(enlace).toHaveAttribute('href', '/horarios?anio=2&grado=1&seccion=3');
  });
});
