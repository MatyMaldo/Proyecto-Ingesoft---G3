import { beforeEach, describe, expect, it, vi } from 'vitest';
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

const { alternarOmitida, establecerOmision, estadoHook } = vi.hoisted(() => ({
  alternarOmitida: vi.fn(),
  establecerOmision: vi.fn(),
  estadoHook: { sesionesOmitidas: {} }
}));

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
    sesionesOmitidas: estadoHook.sesionesOmitidas,
    alternarOmitida,
    establecerOmision,
    reiniciarPreview: vi.fn(),
    generando: false,
    previsualizar: vi.fn(),
    generar: vi.fn(),
    construirSolicitud: vi.fn()
  })
}));

import DialogoSesiones from './DialogoSesiones.jsx';

function renderizar() {
  return render(
    <DialogoSesiones
      consulta={{ seccionId: 3, anioAcademicoId: 2 }}
      tituloSeccion="1er Grado A"
      alCancelar={vi.fn()}
      alNotificar={vi.fn()}
    />
  );
}

beforeEach(() => {
  alternarOmitida.mockClear();
  establecerOmision.mockClear();
  estadoHook.sesionesOmitidas = {};
});

describe('DialogoSesiones · vista previa en una sola tabla', () => {
  it('muestra todas las sesiones en una única tabla, ordenadas por fecha', () => {
    renderizar();

    expect(screen.getAllByRole('table')).toHaveLength(1);
    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(4);
    expect(filas.map((fila) => within(fila).getAllByRole('cell')[3].textContent)).toEqual([
      'Matemáticas', 'Comunicación', 'Ciencias', 'Historia'
    ]);
    expect(screen.queryByRole('button', { name: /Omitir todas las de esta fecha/i })).not.toBeInTheDocument();
  });

  it('resume el estado de las sesiones y filtra al pulsar un chip', () => {
    renderizar();

    expect(screen.getByRole('button', { name: '3 por crear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1 ya existe' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '1 ya existe' }));

    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(1);
    expect(within(filas[0]).getByText('Ciencias')).toBeInTheDocument();
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(5);
  });

  it('filtra por mes y por curso', () => {
    renderizar();

    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2026-02' } });
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
    expect(within(screen.getByRole('table')).getByText('Historia')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Curso'), { target: { value: 'Matemáticas' } });
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
  });

  it('sin resultados muestra el mensaje centrado y se puede volver a limpiar los filtros', () => {
    renderizar();

    fireEvent.change(screen.getByLabelText('Curso'), { target: { value: 'Historia' } });
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2026-01' } });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No hay sesiones con los filtros seleccionados.');

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('muestra el estado de las sesiones existentes y no permite omitirlas', () => {
    renderizar();

    const fila = within(screen.getByRole('table')).getByText('Ciencias').closest('tr');
    expect(within(fila).getByText('Ya existe · Programada')).toBeInTheDocument();
    expect(within(fila).getByLabelText('Omitir Ciencias del 07/01/2026')).toBeDisabled();
  });

  it('omite una sesión desde su casilla', () => {
    renderizar();

    fireEvent.click(screen.getByLabelText('Omitir Matemáticas del 05/01/2026'));

    expect(alternarOmitida).toHaveBeenCalledWith(expect.objectContaining({ bloqueHorarioId: 1, fecha: '2026-01-05' }));
  });

  it('marca como omitida la fila y la casilla de todas omite solo las sesiones nuevas', () => {
    estadoHook.sesionesOmitidas = { '1|2026-01-05': { bloqueHorarioId: 1, fecha: '2026-01-05' } };
    renderizar();

    expect(screen.getByLabelText('Omitir Matemáticas del 05/01/2026')).toBeChecked();
    expect(screen.getByText('Omitida (nueva)')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Omitir todas las sesiones nuevas (3)'));

    const [lista, omitir] = establecerOmision.mock.calls[0];
    expect(omitir).toBe(true);
    expect(lista.map((sesion) => sesion.bloqueHorarioId).sort()).toEqual([1, 2, 3]);
  });

  it('no muestra paginación cuando todas caben en una página', () => {
    renderizar();

    expect(screen.queryByRole('navigation', { name: 'Paginación de la vista previa' })).not.toBeInTheDocument();
  });
});
