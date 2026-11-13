import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const sesionesPreview = [
  {
    bloqueHorarioId: 1,
    fecha: '2026-01-05',
    diaSemana: 'LUNES',
    horaInicio: '08:00',
    horaFin: '09:00',
    cursoNombre: 'Matemáticas',
    docenteNombre: 'Juan Perez',
    yaExiste: false
  },
  {
    bloqueHorarioId: 2,
    fecha: '2026-01-06',
    diaSemana: 'MARTES',
    horaInicio: '09:00',
    horaFin: '10:00',
    cursoNombre: 'Comunicación',
    docenteNombre: 'María Gomez',
    yaExiste: false
  },
  {
    bloqueHorarioId: 3,
    fecha: '2026-02-02',
    diaSemana: 'LUNES',
    horaInicio: '10:00',
    horaFin: '11:00',
    cursoNombre: 'Historia',
    docenteNombre: 'Juan Perez',
    yaExiste: false
  },
  {
    bloqueHorarioId: 4,
    fecha: '2026-01-07',
    diaSemana: 'MIERCOLES',
    horaInicio: '11:00',
    horaFin: '12:00',
    cursoNombre: 'Ciencias',
    docenteNombre: 'Ana Torres',
    yaExiste: true,
    estado: 'PROGRAMADA'
  }
];

vi.mock('../hooks/useSesionesHorario.js', () => ({
  default: () => ({
    fechaInicio: '2026-01-01',
    fechaFin: '2026-02-28',
    fechaMinima: '2026-03-01',
    fechaMaxima: '2026-12-20',
    establecerFechaInicio: vi.fn(),
    establecerFechaFin: vi.fn(),
    sesionesPreview,
    totalPreview: sesionesPreview.length,
    estadoPreview: 'listo',
    sesionesOmitidas: {},
    alternarOmitida: vi.fn(),
    omitirTodasDeFecha: vi.fn(),
    reiniciarPreview: vi.fn(),
    generando: false,
    previsualizar: vi.fn(),
    generar: vi.fn()
  })
}));

import DialogoSesiones from './DialogoSesiones.jsx';

describe('DialogoSesiones · agrupación por mes y semana', () => {
  it('muestra los meses, las semanas y las sesiones de cada fecha', () => {
    render(
      <DialogoSesiones
        consulta={{ seccionId: 3, anioAcademicoId: 2 }}
        tituloSeccion="1er Grado A"
        alCancelar={vi.fn()}
        alNotificar={vi.fn()}
      />
    );

    expect(screen.getByText(/enero 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/febrero 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Semana del 05\/01\/2026 al 09\/01\/2026/)).toBeInTheDocument();
    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
    expect(screen.getByText('Comunicación')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/febrero 2026/i));

    expect(screen.getByText('Historia')).toBeInTheDocument();
    const tablas = screen.getAllByRole('table');
    expect(tablas.length).toBeGreaterThanOrEqual(3);
    expect(within(tablas.at(-1)).getByText('Historia')).toBeInTheDocument();
  });

  it('muestra el estado de las sesiones existentes y no permite omitirlas', () => {
    render(
      <DialogoSesiones
        consulta={{ seccionId: 3, anioAcademicoId: 2 }}
        tituloSeccion="1er Grado A"
        alCancelar={vi.fn()}
        alNotificar={vi.fn()}
      />
    );

    const grupo = screen.getByLabelText('Sesiones del 07/01/2026');
    expect(within(grupo).getByText('Ya existe · Programada')).toBeInTheDocument();
    expect(within(grupo).getByLabelText('Omitir Ciencias del 07/01/2026')).toBeDisabled();
    expect(within(grupo).getByRole('button', { name: /Omitir todas las de esta fecha/i }))
      .toBeDisabled();
  });
});
