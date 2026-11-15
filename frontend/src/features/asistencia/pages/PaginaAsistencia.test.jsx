import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const { sesion } = vi.hoisted(() => ({
  sesion: { usuario: { id: 'EST-001', nombre: 'María López', rol: 'ESTUDIANTE' } }
}));

vi.mock('../../../shared/auth/useAuth.js', () => ({ default: () => sesion }));

vi.mock('../services/asistenciaService.js', () => ({
  consultarHistorialAsistencia: vi.fn(async () => ({
    exitoso: true,
    datos: {
      cursos: [{ id: 'CUR-0002', nombre: 'Comunicación' }],
      totalRegistros: 45,
      pagina: 0,
      tamano: 10,
      totalPaginas: 5,
      totalPresentes: 30,
      totalTardanzas: 5,
      totalFaltas: 8,
      totalJustificadas: 2,
      porcentajeAsistencia: 77.78,
      registros: [
        {
          id: 'A1',
          fecha: '2026-09-19',
          cursoNombre: 'Comunicación',
          gradoNombre: '4to Grado',
          seccionNombre: 'B',
          horaInicio: '08:00',
          horaFin: '10:00',
          estado: 'PRESENTE',
          observaciones: ''
        },
        {
          id: 'A2',
          fecha: '2026-09-16',
          cursoNombre: 'Comunicación',
          seccionNombre: 'B',
          horaInicio: '08:00',
          horaFin: '10:00',
          estado: 'TARDANZA',
          observaciones: 'Tardanza leve'
        },
        {
          id: 'A3',
          fecha: '2026-09-11',
          cursoNombre: 'Comunicación',
          seccionNombre: 'B',
          horaInicio: '08:00',
          horaFin: '10:00',
          estado: 'FALTA',
          observaciones: ''
        },
        {
          id: 'A4',
          fecha: '2026-09-09',
          cursoNombre: 'Comunicación',
          seccionNombre: 'B',
          horaInicio: '08:00',
          horaFin: '10:00',
          estado: 'JUSTIFICADA',
          observaciones: 'Cita médica'
        }
      ]
    },
    mensaje: ''
  })),
  listarEstudiantesACargo: vi.fn()
}));

import PaginaAsistencia from './PaginaAsistencia.jsx';

describe('PaginaAsistencia', () => {
  it('muestra el historial y el resumen del estudiante', async () => {
    sesion.usuario = { id: 'EST-001', nombre: 'María López', rol: 'ESTUDIANTE' };
    render(<PaginaAsistencia />);

    expect(await screen.findByRole('heading', { name: 'Mi asistencia' })).toBeInTheDocument();
    expect(screen.getByText('Asistencia general')).toBeInTheDocument();
    expect(screen.getByText('77.78%')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    // La tabla (escritorio) y las tarjetas (móvil) conviven en el DOM; el CSS muestra una u otra.
    const tabla = screen.getByRole('table');
    expect(within(tabla).getByText('Tardanza leve')).toBeInTheDocument();
    expect(within(tabla).getByText('Cita médica')).toBeInTheDocument();
    expect(within(tabla).getByText('4to Grado')).toBeInTheDocument();
    expect(within(tabla).getByRole('columnheader', { name: 'Grado' })).toBeInTheDocument();
    expect(within(tabla).getAllByText('Justificada').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Curso')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Registros de asistencia' })).toBeInTheDocument();
  });

  it('pone título y descripción en una línea, sin sobretítulo, y filtros planos con «Actualizar»', async () => {
    sesion.usuario = { id: 'DOC-001', nombre: 'Juan', rol: 'DOCENTE' };
    render(<PaginaAsistencia />);

    const cabecera = (await screen.findByRole('heading', { level: 1, name: 'Asistencia' })).closest('header');
    expect(within(cabecera).getByText(/historial de asistencia de tus cursos/)).toBeInTheDocument();
    expect(screen.queryByText('Seguimiento académico')).not.toBeInTheDocument();

    const filtros = screen.getByRole('region', { name: 'Filtros de asistencia' });
    expect(within(filtros).getByLabelText('Curso').tagName).toBe('SELECT');
    expect(within(filtros).getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    // Sin ningún filtro cambiado no hay «Limpiar filtros».
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('«Limpiar filtros» aparece al cambiar un filtro y los restablece', async () => {
    sesion.usuario = { id: 'EST-001', nombre: 'María López', rol: 'ESTUDIANTE' };
    render(<PaginaAsistencia />);
    await screen.findByRole('table');

    await userEvent.selectOptions(screen.getByLabelText('Curso'), 'CUR-0002');
    const limpiar = await screen.findByRole('button', { name: 'Limpiar filtros' });
    await userEvent.click(limpiar);

    expect(screen.getByLabelText('Curso')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('lleva en el pie el selector de filas por página y el paginador', async () => {
    sesion.usuario = { id: 'EST-001', nombre: 'María López', rol: 'ESTUDIANTE' };
    render(<PaginaAsistencia />);
    await screen.findByRole('table');

    const filas = screen.getByRole('group', { name: 'Filas por página' });
    expect(within(filas).getByRole('button', { name: '10' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(filas).getByRole('button', { name: '25' })).toBeEnabled();
    expect(screen.getByRole('navigation', { name: 'Paginación del historial de asistencia' })).toBeInTheDocument();
  });
});
