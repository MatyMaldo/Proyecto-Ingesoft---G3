import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const { anioActual, sesion } = vi.hoisted(() => {
  const anio = new Date().getFullYear();
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const fecha = `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}-${String(lunes.getDate()).padStart(2, '0')}`;
  return {
    anioActual: anio,
    sesion: {
      id: 77,
      fecha,
      diaSemana: 'LUNES',
      horaInicio: '08:00',
      horaFin: '09:00',
      cursoNombre: 'Matemáticas',
      docenteNombre: 'Juan Perez',
      aulaNombre: 'Aula 101',
      gradoNombre: 'Primer grado',
      seccionNombre: 'B',
      estado: 'PROGRAMADA'
    }
  };
});

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({ usuario: { rol: 'ADMINISTRADOR', nombre: 'Admin' } })
}));

vi.mock('../services/visualizadoresService.js', () => ({
  horarioSeccion: vi.fn(async () => ({ exitoso: true, datos: [sesion] })),
  horarioDocente: vi.fn(),
  miHorarioDocente: vi.fn(),
  miHorarioEstudiante: vi.fn(),
  horarioApoderado: vi.fn(),
  cambiarOmisionSesion: vi.fn(),
  listarSecciones: vi.fn(async () => ({
    exitoso: true,
    datos: [{
      id: 3,
      gradoId: 1,
      gradoNombre: 'Primer grado',
      nombre: 'B',
      anioAcademicoId: 2,
      anioAcademico: anioActual
    }]
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

describe('Panel de sesión en consulta de horario', () => {
  it('abre el drawer al hacer clic en una sesión', async () => {
    render(<PaginaVisualizadorHorario />);

    await screen.findByRole('option', { name: 'Primer grado' }, { timeout: 4000 });
    fireEvent.change(screen.getByLabelText('Grado'), { target: { value: '1' } });
    await within(screen.getByLabelText('Sección')).findByRole(
      'option',
      { name: `B (${anioActual})` },
      { timeout: 4000 }
    );
    fireEvent.change(screen.getByLabelText('Sección'), { target: { value: '3' } });

    const bloque = await screen.findByRole(
      'button',
      { name: /Ver detalle de Matemáticas/ },
      { timeout: 4000 }
    );
    fireEvent.click(bloque);

    expect(await screen.findByText('Detalle de la sesión')).toBeInTheDocument();
    const panel = screen.getByRole('dialog', { name: 'Matemáticas' });
    expect(within(panel).getByText('Juan Perez')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });
});
