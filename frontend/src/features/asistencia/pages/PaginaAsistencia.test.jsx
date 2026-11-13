import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({
    usuario: { id: 'EST-001', nombre: 'María López', rol: 'ESTUDIANTE' }
  })
}));

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
    render(<PaginaAsistencia />);

    expect(await screen.findByRole('heading', { name: 'Mi asistencia' })).toBeInTheDocument();
    expect(screen.getByText('Asistencia general')).toBeInTheDocument();
    expect(screen.getByText('77.78%')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Tardanza leve')).toBeInTheDocument();
    expect(screen.getByText('Cita médica')).toBeInTheDocument();
    expect(screen.getByText('4to Grado')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Grado' })).toBeInTheDocument();
    expect(screen.getAllByText('Justificada').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Curso')).toBeInTheDocument();
  });
});
