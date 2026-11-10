import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  previsualizarCargaMasiva,
  confirmarCargaMasiva,
  descargarPlantillaBloques,
  guardarArchivo
} = vi.hoisted(() => ({
  previsualizarCargaMasiva: vi.fn(),
  confirmarCargaMasiva: vi.fn(),
  descargarPlantillaBloques: vi.fn(),
  guardarArchivo: vi.fn()
}));

vi.mock('../services/horariosService.js', () => ({
  previsualizarCargaMasiva,
  confirmarCargaMasiva,
  descargarPlantillaBloques
}));
vi.mock('../utils/guardarArchivo.js', () => ({ guardarArchivo }));

import DialogoCargaMasiva from './DialogoCargaMasiva.jsx';

const anios = [{ id: 7, anio: 2027 }];
const aulas = [{ id: 4, nombre: '101' }];

const preview = {
  resumen: {
    archivos: 1,
    filas: 1,
    validas: 1,
    conError: 0,
    duplicadas: 0,
    conflictos: 0
  },
  archivos: [{ nombre: 'horarios.csv', filas: 1, errores: 0 }],
  bloques: [
    {
      previewId: 'p-1',
      archivo: 'horarios.csv',
      fila: 2,
      asignacionCursoId: 12,
      seccionId: 3,
      gradoNombre: '1er Grado de Secundaria',
      seccionNombre: 'A',
      cursoId: 5,
      cursoNombre: 'Matemática',
      docenteId: 9,
      docenteNombre: 'Luis Pérez',
      aulaId: 4,
      aulaNombre: '101',
      diaSemana: 'LUNES',
      horaInicio: '08:00',
      horaFin: '09:00',
      estado: 'VALIDO',
      errores: []
    }
  ]
};

function renderDialogo() {
  const alCompletar = vi.fn();
  const { container } = render(
    <DialogoCargaMasiva
      anios={anios}
      aulas={aulas}
      alCompletar={alCompletar}
      alCancelar={vi.fn()}
    />
  );
  const entrada = container.querySelector('input[type="file"]');
  return { alCompletar, entrada };
}

function elegir(entrada, nombre) {
  const archivo = new File(['x'], nombre, { type: 'text/csv' });
  fireEvent.change(entrada, { target: { files: [archivo] } });
  return archivo;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DialogoCargaMasiva', () => {
  it('descarga la plantilla CSV', async () => {
    const plantilla = new Blob(['ID Sección;Grado']);
    descargarPlantillaBloques.mockResolvedValue({ exitoso: true, datos: plantilla, mensaje: '' });
    renderDialogo();

    fireEvent.click(screen.getByRole('button', { name: 'Plantilla CSV' }));

    await waitFor(() => {
      expect(descargarPlantillaBloques).toHaveBeenCalledWith('csv');
      expect(guardarArchivo).toHaveBeenCalledWith(plantilla, 'plantilla-horarios.csv');
    });
  });

  it('mantiene deshabilitado el botón de previsualizar hasta elegir un archivo', () => {
    const { entrada } = renderDialogo();
    const previsualizar = screen.getByRole('button', { name: 'Previsualizar' });
    expect(previsualizar).toBeDisabled();

    elegir(entrada, 'horarios.xlsx');
    expect(previsualizar).toBeEnabled();
  });

  it('previsualiza, edita y confirma la carga', async () => {
    previsualizarCargaMasiva.mockResolvedValue({ exitoso: true, datos: preview, mensaje: '' });
    confirmarCargaMasiva.mockResolvedValue({
      exitoso: true,
      datos: { bloquesCreados: 1, errores: [] },
      mensaje: ''
    });

    const { alCompletar, entrada } = renderDialogo();
    const archivo = elegir(entrada, 'horarios.csv');
    fireEvent.change(screen.getByLabelText('Año académico'), { target: { value: '7' } });

    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }));

    expect(await screen.findByText('Confirmar creación')).toBeInTheDocument();
    expect(previsualizarCargaMasiva).toHaveBeenCalledWith([archivo], '7');

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar creación' }));

    await waitFor(() => expect(alCompletar).toHaveBeenCalledWith({
      filasProcesadas: 1,
      bloquesCreados: 1
    }));
    expect(confirmarCargaMasiva).toHaveBeenCalledWith({
      anioAcademicoId: '7',
      bloques: [{
        asignacionCursoId: 12,
        aulaId: 4,
        diaSemana: 'LUNES',
        horaInicio: '08:00',
        horaFin: '09:00',
        origen: 'horarios.csv#2'
      }]
    });
  });

  it('muestra los errores del servidor al confirmar', async () => {
    previsualizarCargaMasiva.mockResolvedValue({ exitoso: true, datos: preview, mensaje: '' });
    confirmarCargaMasiva.mockResolvedValue({
      exitoso: true,
      datos: {
        bloquesCreados: 0,
        errores: [{ origen: 'horarios.csv#2', mensaje: 'El aula ya está ocupada.' }]
      },
      mensaje: ''
    });

    const { alCompletar, entrada } = renderDialogo();
    elegir(entrada, 'horarios.csv');
    fireEvent.change(screen.getByLabelText('Año académico'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }));
    await screen.findByText('Confirmar creación');

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar creación' }));

    expect(await screen.findByText(/El aula ya está ocupada/)).toBeInTheDocument();
    expect(alCompletar).not.toHaveBeenCalled();
  });
});
