import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const { cargarBloquesCsv, descargarPlantillaBloquesCsv, guardarArchivo } = vi.hoisted(() => ({
  cargarBloquesCsv: vi.fn(),
  descargarPlantillaBloquesCsv: vi.fn(),
  guardarArchivo: vi.fn()
}));

vi.mock('../services/horariosService.js', () => ({ cargarBloquesCsv, descargarPlantillaBloquesCsv }));
vi.mock('../utils/guardarArchivo.js', () => ({ guardarArchivo }));

import DialogoCargaMasiva from './DialogoCargaMasiva.jsx';

const anios = [{ id: 7, anio: 2027 }];

function renderDialogo() {
  const alCompletar = vi.fn();
  const { container } = render(
    <DialogoCargaMasiva anios={anios} alCompletar={alCompletar} alCancelar={vi.fn()} />
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
  it('descarga la plantilla y avisa que la descarga fue solicitada', async () => {
    const plantilla = new Blob(['Grado;Sección']);
    descargarPlantillaBloquesCsv.mockResolvedValue({ exitoso: true, datos: plantilla, mensaje: '' });
    renderDialogo();

    fireEvent.click(screen.getByRole('button', { name: 'Descargar plantilla CSV' }));

    expect(await screen.findByText(/Descarga solicitada/)).toBeInTheDocument();
    expect(guardarArchivo).toHaveBeenCalledWith(plantilla, 'plantilla-horarios.csv');
  });

  it('mantiene deshabilitado el botón de cargar hasta elegir un archivo y rechaza otras extensiones', () => {
    const { entrada } = renderDialogo();
    const cargar = screen.getByRole('button', { name: 'Cargar horarios' });
    expect(cargar).toBeDisabled();

    elegir(entrada, 'horarios.xlsx');
    expect(screen.getByText('Selecciona un archivo con extensión .csv.')).toBeInTheDocument();
    expect(cargar).toBeDisabled();

    elegir(entrada, 'horarios.csv');
    expect(cargar).toBeEnabled();
  });

  it('envía el archivo con el año elegido y notifica al completar', async () => {
    cargarBloquesCsv.mockResolvedValue({
      exitoso: true,
      datos: { filasProcesadas: 3, bloquesCreados: 3, errores: [] },
      mensaje: ''
    });
    const { alCompletar, entrada } = renderDialogo();
    const archivo = elegir(entrada, 'horarios.csv');
    fireEvent.change(screen.getByLabelText('Año académico'), { target: { value: '7' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cargar horarios' }));

    await waitFor(() => expect(alCompletar).toHaveBeenCalledWith({
      filasProcesadas: 3,
      bloquesCreados: 3,
      errores: []
    }));
    expect(cargarBloquesCsv).toHaveBeenCalledWith(archivo, '7');
  });

  it('lista los errores por fila cuando el backend rechaza el archivo', async () => {
    cargarBloquesCsv.mockResolvedValue({
      exitoso: false,
      datos: {
        filasProcesadas: 2,
        bloquesCreados: 0,
        errores: [{ fila: 3, mensaje: "No existe el aula 'Z9'." }]
      },
      mensaje: 'No se pudo completar la operación.'
    });
    const { alCompletar, entrada } = renderDialogo();
    elegir(entrada, 'horarios.csv');

    fireEvent.click(screen.getByRole('button', { name: 'Cargar horarios' }));

    expect(await screen.findByText("Fila 3: No existe el aula 'Z9'.")).toBeInTheDocument();
    expect(alCompletar).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del servidor cuando falla sin detalle por fila', async () => {
    cargarBloquesCsv.mockResolvedValue({
      exitoso: false,
      datos: null,
      mensaje: 'La programación de horarios está cerrada.'
    });
    const { entrada } = renderDialogo();
    elegir(entrada, 'horarios.csv');

    fireEvent.click(screen.getByRole('button', { name: 'Cargar horarios' }));

    expect(await screen.findByText('La programación de horarios está cerrada.')).toBeInTheDocument();
  });
});
