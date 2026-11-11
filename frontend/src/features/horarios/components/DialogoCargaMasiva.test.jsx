import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const {
  previsualizarCargaMasiva,
  iniciarConfirmacionCargaMasivaAsync,
  descargarPlantillaBloques,
  guardarArchivo
} = vi.hoisted(() => ({
  previsualizarCargaMasiva: vi.fn(),
  iniciarConfirmacionCargaMasivaAsync: vi.fn(),
  descargarPlantillaBloques: vi.fn(),
  guardarArchivo: vi.fn()
}));

vi.mock('../services/horariosService.js', () => ({
  previsualizarCargaMasiva,
  iniciarConfirmacionCargaMasivaAsync,
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

function renderDialogo({ job = null } = {}) {
  const alCancelar = vi.fn();
  const operacion = {
    job,
    iniciando: false,
    enCurso: Boolean(job),
    error: '',
    iniciar: vi.fn(async (fn) => fn()),
    reiniciar: vi.fn()
  };
  const { container } = render(
    <DialogoCargaMasiva
      anios={anios}
      aulas={aulas}
      alCancelar={alCancelar}
      operacion={operacion}
    />
  );
  const entrada = container.querySelector('input[type="file"]');
  return { operacion, entrada, alCancelar };
}

function elegir(entrada, nombre) {
  const archivo = new File(['x'], nombre, { type: 'text/csv' });
  fireEvent.change(entrada, { target: { files: [archivo] } });
  return archivo;
}

/** Una vista previa de `cantidad` bloques: uno de cada diez (el primero incluido) está en conflicto. */
function crearPreview(cantidad) {
  return {
    ...preview,
    resumen: { ...preview.resumen, filas: cantidad, validas: cantidad },
    bloques: Array.from({ length: cantidad }, (_, i) => ({
      ...preview.bloques[0],
      previewId: `p-${i + 1}`,
      fila: i + 2,
      asignacionCursoId: 12 + i,
      estado: i % 10 === 0 ? 'CONFLICTO' : 'VALIDO',
      errores: i % 10 === 0 ? ['El docente ya tiene clase en ese horario.'] : []
    }))
  };
}

async function abrirPreview(cantidad, ajustar = (datos) => datos) {
  previsualizarCargaMasiva.mockResolvedValue({
    exitoso: true,
    datos: ajustar(crearPreview(cantidad)),
    mensaje: ''
  });
  const contexto = renderDialogo();
  elegir(contexto.entrada, 'horarios.csv');
  fireEvent.change(screen.getByLabelText('Año académico'), { target: { value: '7' } });
  fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }));
  await screen.findByRole('button', { name: /^Crear/ });
  return contexto;
}

const filasPintadas = () => screen.queryAllByLabelText(/^Día del bloque/);
const casillasDeFila = () => screen.getAllByLabelText(/^Incluir bloque/);
const casillasSinMarcar = () => casillasDeFila().filter((casilla) => !casilla.checked);

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
    iniciarConfirmacionCargaMasivaAsync.mockResolvedValue({
      exitoso: true,
      datos: { jobId: 'job-1', estado: 'EN_COLA' },
      mensaje: ''
    });

    const { operacion, entrada } = renderDialogo();
    const archivo = elegir(entrada, 'horarios.csv');
    fireEvent.change(screen.getByLabelText('Año académico'), { target: { value: '7' } });

    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }));

    expect(await screen.findByRole('button', { name: 'Crear 1 bloque' })).toBeInTheDocument();
    expect(previsualizarCargaMasiva).toHaveBeenCalledWith([archivo], '7');

    fireEvent.click(screen.getByRole('button', { name: 'Crear 1 bloque' }));

    await waitFor(() => expect(operacion.iniciar).toHaveBeenCalled());
    expect(iniciarConfirmacionCargaMasivaAsync).toHaveBeenCalledWith({
      anioAcademicoId: '7',
      bloques: [{
        asignacionCursoId: 12,
        aulaId: 4,
        diaSemana: 'LUNES',
        horaInicio: '08:00',
        horaFin: '09:00',
        origen: 'horarios.csv#2'
      }]
    }, expect.any(String));
  });

  it('muestra los errores del servidor al iniciar la confirmación', async () => {
    previsualizarCargaMasiva.mockResolvedValue({ exitoso: true, datos: preview, mensaje: '' });
    iniciarConfirmacionCargaMasivaAsync.mockResolvedValue({
      exitoso: false,
      datos: null,
      mensaje: 'El aula ya está ocupada.'
    });

    const { entrada } = renderDialogo();
    elegir(entrada, 'horarios.csv');
    fireEvent.change(screen.getByLabelText('Año académico'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }));
    await screen.findByRole('button', { name: 'Crear 1 bloque' });

    fireEvent.click(screen.getByRole('button', { name: 'Crear 1 bloque' }));

    expect(await screen.findByText(/El aula ya está ocupada/)).toBeInTheDocument();
  });

  describe('preparación de los archivos', () => {
    function archivos(cantidad, nombre = (i) => `horarios-${i}.csv`) {
      return Array.from({ length: cantidad }, (_, i) => new File(['x'], nombre(i), { type: 'text/csv' }));
    }

    it('presenta los pasos, el año académico y el formato del archivo', () => {
      renderDialogo();

      expect(screen.getByRole('heading', { name: 'Descarga la plantilla' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Elige el año y sube tus archivos' })).toBeInTheDocument();
      expect(screen.getByText('Ver formato del archivo')).toBeInTheDocument();
      expect(screen.getByText('Selecciona al menos un archivo para continuar.')).toBeInTheDocument();
    });

    it('lista los archivos elegidos y permite quitarlos', () => {
      const { entrada } = renderDialogo();
      fireEvent.change(entrada, { target: { files: archivos(2) } });

      expect(screen.getByText('2 archivos seleccionados')).toBeInTheDocument();
      const lista = screen.getByRole('list', { name: 'Archivos seleccionados' });
      expect(lista).toHaveTextContent('horarios-0.csv');
      expect(lista).toHaveTextContent('horarios-1.csv');

      fireEvent.click(screen.getByRole('button', { name: 'Quitar archivos' }));
      expect(screen.queryByRole('list', { name: 'Archivos seleccionados' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previsualizar' })).toBeDisabled();
    });

    it('acepta archivos soltados sobre la zona de carga', () => {
      renderDialogo();
      const zona = screen.getByText('o arrástralos y suéltalos aquí').closest('label');

      fireEvent.drop(zona, { dataTransfer: { files: archivos(1) } });

      expect(screen.getByText('1 archivo seleccionado')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previsualizar' })).toBeEnabled();
    });

    it('rechaza más de 10 archivos', () => {
      const { entrada } = renderDialogo();
      fireEvent.change(entrada, { target: { files: archivos(11) } });

      expect(screen.getByText('Se permiten como máximo 10 archivos por carga.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previsualizar' })).toBeDisabled();
    });

    it('rechaza extensiones que no son csv, xlsx o xls', () => {
      const { entrada } = renderDialogo();
      fireEvent.change(entrada, {
        target: { files: [new File(['x'], 'notas.txt', { type: 'text/plain' })] }
      });

      expect(screen.getByText('«notas.txt» no es un archivo .csv, .xlsx o .xls.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previsualizar' })).toBeDisabled();
    });

    it('rechaza archivos de más de 10 MB', () => {
      const { entrada } = renderDialogo();
      const grande = new File(['x'], 'enorme.csv', { type: 'text/csv' });
      Object.defineProperty(grande, 'size', { value: 11 * 1024 * 1024 });
      fireEvent.change(entrada, { target: { files: [grande] } });

      expect(screen.getByText('«enorme.csv» supera los 10 MB.')).toBeInTheDocument();
    });

    it('cierra sin preguntar cuando no hay archivos', () => {
      const { alCancelar } = renderDialogo();

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(alCancelar).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Cambios sin guardar')).not.toBeInTheDocument();
    });

    it('pide confirmación antes de descartar archivos ya elegidos', () => {
      const { entrada, alCancelar } = renderDialogo();
      fireEvent.change(entrada, { target: { files: archivos(1) } });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(screen.getByText('Cambios sin guardar')).toBeInTheDocument();
      expect(alCancelar).not.toHaveBeenCalled();

      // "Cancelar" del aviso: se sigue en la carga.
      fireEvent.click(screen.getAllByRole('button', { name: 'Cancelar' }).at(-1));
      expect(screen.queryByText('Cambios sin guardar')).not.toBeInTheDocument();
      expect(alCancelar).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
      expect(alCancelar).toHaveBeenCalled();
    });
  });

  describe('vista previa', () => {
    it('junta curso y docente y omite el origen cuando hay un solo archivo', async () => {
      await abrirPreview(3);

      expect(screen.getByRole('columnheader', { name: 'Curso - docente' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Grado - sección' })).toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: 'Curso' })).not.toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: 'Docente' })).not.toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: 'Origen' })).not.toBeInTheDocument();
      // La casilla de cada fila no lleva cabecera visible: solo un texto para lectores de pantalla.
      expect(screen.getByRole('columnheader', { name: 'Incluir' })).toBeInTheDocument();
      // La columna de estado tampoco muestra título: es un icono, con el nombre solo para lectores de pantalla.
      expect(screen.getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument();
      expect(casillasDeFila()).toHaveLength(3);
      expect(screen.queryByRole('button', { name: 'Volver a carga de archivos' })).not.toBeInTheDocument();
      // La fila del archivo sigue a la vista, bajo el grado y la sección.
      expect(screen.getAllByText(/Sección A · Fila 2/)).toHaveLength(1);
    });

    it('muestra la columna Origen y el resumen por archivo cuando hay varios archivos', async () => {
      await abrirPreview(3, (datos) => {
        datos.bloques[1].archivo = 'otro.csv';
        return datos;
      });

      expect(screen.getByRole('columnheader', { name: 'Origen' })).toBeInTheDocument();
      expect(screen.getByText(/2 filas · 1 con problema/)).toBeInTheDocument();
      expect(screen.getByText(/1 fila · sin problemas/)).toBeInTheDocument();
    });

    it('junta las horas de inicio y fin en la columna Horario, junto a la columna Día', async () => {
      await abrirPreview(3);

      expect(screen.getByRole('columnheader', { name: 'Día' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Horario' })).toBeInTheDocument();
      expect(screen.getByLabelText('Hora de inicio del bloque p-2')).toBeInTheDocument();
      expect(screen.getByLabelText('Hora de fin del bloque p-2')).toBeInTheDocument();
    });

    it('pone primero las filas con problemas', async () => {
      await abrirPreview(30, (datos) => {
        Object.assign(datos.bloques[2], {
          estado: 'ERROR',
          asignacionCursoId: null,
          errores: ["No existe el curso 'Biología'."]
        });
        return datos;
      });

      const dias = filasPintadas().map((control) => control.getAttribute('aria-label'));
      // Primero el error (p-3), luego los conflictos (p-1, p-11, p-21) y al final los válidos.
      expect(dias.slice(0, 4)).toEqual([
        'Día del bloque p-3',
        'Día del bloque p-1',
        'Día del bloque p-11',
        'Día del bloque p-21'
      ]);
      expect(dias[4]).toBe('Día del bloque p-2');
    });

    it('incluye por defecto solo los bloques válidos y deja sin marcar los demás', async () => {
      await abrirPreview(30);

      expect(screen.getByText('27 seleccionadas')).toBeInTheDocument();
      expect(screen.getByText('Se crearán 27 bloques de 30.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Crear 27 bloques' })).toBeEnabled();
      expect(casillasSinMarcar()).toHaveLength(3);
      expect(screen.getByLabelText('Incluir bloque p-1')).not.toBeChecked();
      expect(screen.getByLabelText('Incluir bloque p-2')).toBeChecked();
    });

    it('incluye o excluye una fila con su casilla', async () => {
      await abrirPreview(30);

      // Un bloque válido se excluye...
      fireEvent.click(screen.getByLabelText('Incluir bloque p-2'));
      expect(screen.getByLabelText('Incluir bloque p-2')).not.toBeChecked();
      expect(screen.getByText('26 seleccionadas')).toBeInTheDocument();
      expect(screen.getByText('Se crearán 26 bloques de 30.')).toBeInTheDocument();

      // ...y uno en conflicto se incluye a propósito.
      fireEvent.click(screen.getByLabelText('Incluir bloque p-1'));
      expect(screen.getByLabelText('Incluir bloque p-1')).toBeChecked();
      expect(screen.getByRole('button', { name: 'Crear 27 bloques' })).toBeEnabled();
    });

    it('no deja incluir un bloque sin relación curso-docente', async () => {
      await abrirPreview(30, (datos) => {
        Object.assign(datos.bloques[2], { estado: 'ERROR', asignacionCursoId: null, errores: ['No existe el curso.'] });
        return datos;
      });

      expect(screen.getByLabelText('Incluir bloque p-3')).toBeDisabled();
      expect(screen.getByLabelText('Incluir bloque p-3')).not.toBeChecked();
    });

    it('incluye un bloque conflictivo cuando se corrige a mano', async () => {
      await abrirPreview(30);

      fireEvent.change(screen.getByLabelText('Hora de inicio del bloque p-1'), { target: { value: '09:00' } });

      expect(screen.getByText('Se crearán 28 bloques de 30.')).toBeInTheDocument();
      expect(screen.getByLabelText('Incluir bloque p-1')).toBeChecked();
      expect(casillasSinMarcar()).toHaveLength(2);
      expect(screen.getByText('editado')).toBeInTheDocument();
    });

    it('filtra por estado desde los chips del resumen', async () => {
      await abrirPreview(30);

      const chip = screen.getByRole('button', { name: /3 en conflicto/ });
      expect(chip).toHaveAttribute('aria-pressed', 'false');
      expect(filasPintadas()).toHaveLength(30);

      fireEvent.click(chip);
      expect(chip).toHaveAttribute('aria-pressed', 'true');
      expect(filasPintadas()).toHaveLength(3);

      fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }));
      expect(chip).toHaveAttribute('aria-pressed', 'false');
      expect(filasPintadas()).toHaveLength(30);
    });

    it('incluye o excluye todas las filas con una sola casilla, que también refleja la selección parcial', async () => {
      await abrirPreview(30);

      // Al abrir hay 27 de 30 incluidas: selección parcial.
      const todas = screen.getByLabelText('Incluir todas las filas (30)');
      expect(todas).not.toBeChecked();
      expect(todas.indeterminate).toBe(true);

      // Con la selección parcial, un clic incluye todas.
      fireEvent.click(todas);
      expect(screen.getByText('30 seleccionadas')).toBeInTheDocument();
      expect(todas).toBeChecked();
      expect(todas.indeterminate).toBe(false);

      // Con todas incluidas, otro clic las excluye.
      fireEvent.click(todas);
      expect(screen.getByText('0 seleccionadas')).toBeInTheDocument();
      expect(todas).not.toBeChecked();
      expect(todas.indeterminate).toBe(false);
      expect(screen.getByRole('button', { name: 'Crear bloques' })).toBeDisabled();
    });

    it('la casilla de todas actúa solo sobre las filas filtradas', async () => {
      await abrirPreview(30);

      fireEvent.click(screen.getByRole('button', { name: /3 en conflicto/ }));
      const filtradas = screen.getByLabelText('Incluir las 3 filas filtradas');
      expect(filtradas).not.toBeChecked();
      expect(filtradas.indeterminate).toBe(false);

      fireEvent.click(filtradas);
      expect(screen.getByText('30 seleccionadas')).toBeInTheDocument();
      expect(filtradas).toBeChecked();

      fireEvent.click(filtradas);
      expect(screen.getByText('27 seleccionadas')).toBeInTheDocument();

      // Sin filtros se ven de nuevo todas las filas.
      fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }));
      expect(screen.getByLabelText('Incluir todas las filas (30)').indeterminate).toBe(true);
    });

    it('indica cuántas filas se ven y ofrece quitar los filtros solo cuando hay filtros', async () => {
      await abrirPreview(30);
      expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Quitar filtros' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /3 en conflicto/ }));

      expect(screen.getByText(/Mostrando 3 de 30 filas/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Quitar filtros' })).toBeInTheDocument();
    });

    it('no incluye bloques sin relación curso-docente al incluir todas las filas', async () => {
      await abrirPreview(30, (datos) => {
        Object.assign(datos.bloques[2], { estado: 'ERROR', asignacionCursoId: null, errores: ['No existe el curso.'] });
        return datos;
      });

      fireEvent.click(screen.getByLabelText('Incluir todas las filas (30)'));

      // 26 válidos + 3 conflictos; el error sin relación no se puede incluir.
      expect(screen.getByText('29 seleccionadas')).toBeInTheDocument();
      expect(screen.getByLabelText('Incluir bloque p-3')).not.toBeChecked();
    });

    it('deshabilita la casilla de todas cuando ninguna fila filtrada se puede incluir', async () => {
      await abrirPreview(3, (datos) => {
        datos.bloques.forEach((bloque) => {
          Object.assign(bloque, { estado: 'ERROR', asignacionCursoId: null, errores: ['No existe el curso.'] });
        });
        return datos;
      });

      expect(screen.getByLabelText('Incluir todas las filas (3)')).toBeDisabled();
    });

    describe('paginación', () => {
      it('pinta 100 filas por página y navega entre páginas', async () => {
        await abrirPreview(250);

        expect(filasPintadas()).toHaveLength(100);
        expect(screen.getByText('1 – 100 de 250 bloques')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
        expect(screen.getByText('101 – 200 de 250 bloques')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
        expect(filasPintadas()).toHaveLength(50);
        expect(screen.getByText('201 – 250 de 250 bloques')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
      });

      it('no muestra la paginación cuando caben en una sola página', async () => {
        await abrirPreview(100);

        expect(filasPintadas()).toHaveLength(100);
        expect(screen.queryByRole('navigation', { name: 'Paginación de la vista previa' }))
          .not.toBeInTheDocument();
      });

      it('conserva la selección entre páginas y crea todos los bloques incluidos', async () => {
        iniciarConfirmacionCargaMasivaAsync.mockResolvedValue({
          exitoso: true,
          datos: { jobId: 'job-1', estado: 'EN_COLA' },
          mensaje: ''
        });
        await abrirPreview(250);

        // 25 conflictos quedan excluidos; los 225 válidos, incluidos aunque estén en otras páginas.
        expect(screen.getByText('225 seleccionadas')).toBeInTheDocument();
        // Se excluye a mano un válido de la primera página (p-2) y se incluye un conflicto (p-1).
        fireEvent.click(screen.getByLabelText('Incluir bloque p-2'));
        fireEvent.click(screen.getByLabelText('Incluir bloque p-1'));
        fireEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
        fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
        expect(screen.getByLabelText('Incluir bloque p-2')).not.toBeChecked();
        expect(screen.getByLabelText('Incluir bloque p-1')).toBeChecked();
        expect(screen.getByText('225 seleccionadas')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Crear 225 bloques' }));

        await waitFor(() => expect(iniciarConfirmacionCargaMasivaAsync).toHaveBeenCalled());
        const { bloques } = iniciarConfirmacionCargaMasivaAsync.mock.calls[0][0];
        const origenes = bloques.map((bloque) => bloque.origen);
        expect(bloques).toHaveLength(225);
        expect(origenes).toContain('horarios.csv#2');
        expect(origenes).not.toContain('horarios.csv#3');
        expect(origenes).toContain('horarios.csv#4');
        expect(origenes).toContain('horarios.csv#251');
      });

      it('vuelve a la primera página al cambiar un filtro', async () => {
        await abrirPreview(250);

        fireEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
        expect(screen.getByRole('spinbutton', { name: 'Número de página' })).toHaveValue(2);

        fireEvent.click(screen.getByRole('button', { name: /225 válidas/ }));
        expect(screen.getByText('1 – 100 de 225 bloques')).toBeInTheDocument();
        expect(screen.getByRole('spinbutton', { name: 'Número de página' })).toHaveValue(1);

        fireEvent.click(screen.getByRole('button', { name: /25 en conflicto/ }));
        expect(filasPintadas()).toHaveLength(25);
        expect(screen.queryByRole('navigation', { name: 'Paginación de la vista previa' }))
          .not.toBeInTheDocument();
      });
    });
  });

  describe('avance y resultado de la creación', () => {
    const jobBase = {
      jobId: 'job-1',
      tipo: 'CONFIRMAR_HORARIOS_LOTE',
      total: 10,
      procesados: 5,
      exitosos: 5,
      omitidos: 0,
      errores: 0,
      porcentaje: 50,
      detalleErrores: []
    };

    it('muestra la barra de avance y deja cerrar sin confirmar', () => {
      const { alCancelar, operacion } = renderDialogo({
        job: { ...jobBase, estado: 'EN_PROCESO', fase: 'GUARDANDO' }
      });

      expect(screen.getByText('5 de 10 bloques guardados')).toBeInTheDocument();
      expect(screen.getByText('Guardando los bloques…')).toBeInTheDocument();
      const barra = screen.getByRole('progressbar', { name: 'Avance de la creación' });
      expect(barra).toHaveAttribute('value', '5');
      expect(barra).toHaveAttribute('max', '10');
      expect(screen.getByText(/Puedes cerrar esta ventana/)).toBeInTheDocument();
      expect(screen.queryByText('Ver formato del archivo')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Crear/ })).not.toBeInTheDocument();
      // Una operación en curso se conserva al abrir el diálogo.
      expect(operacion.reiniciar).not.toHaveBeenCalled();

      // Hay dos botones "Cerrar": la X del encabezado y el del pie.
      fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' }).at(-1));
      expect(alCancelar).toHaveBeenCalledTimes(1);
    });

    it('muestra la fase de validación mientras se revisan los bloques', () => {
      renderDialogo({ job: { ...jobBase, estado: 'EN_PROCESO', fase: 'VALIDANDO', procesados: 3 } });

      expect(screen.getByText('3 de 10 bloques procesados')).toBeInTheDocument();
      expect(screen.getByText('Validando los bloques…')).toBeInTheDocument();
    });

    it('muestra el resultado de una creación exitosa y se cierra con Listo', () => {
      const { alCancelar } = renderDialogo({
        job: { ...jobBase, estado: 'COMPLETADO', fase: 'FINALIZADO', procesados: 30, total: 30, exitosos: 30, porcentaje: 100 }
      });

      expect(screen.getByText('Carga completada')).toBeInTheDocument();
      expect(screen.getAllByText(/30 bloques creados/).length).toBeGreaterThan(0);
      expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Listo' }));
      expect(alCancelar).toHaveBeenCalledTimes(1);
    });

    it('lista los errores cuando no se creó nada y permite volver a la vista previa', () => {
      const { operacion } = renderDialogo({
        job: {
          ...jobBase,
          estado: 'COMPLETADO_CON_ERRORES',
          fase: 'VALIDACION_CON_ERRORES',
          procesados: 3,
          total: 3,
          exitosos: 0,
          errores: 2,
          detalleErrores: [
            'horarios.csv#2: El aula Aula 101 está ocupada por 1er Grado A (Matemáticas) el lunes de 08:00 a 09:00.',
            'horarios.csv#3: El docente Juan Perez ya tiene clase en 1er Grado B.'
          ]
        }
      });

      const lista = screen.getByRole('list', { name: 'Errores de la carga' });
      expect(lista).toHaveTextContent('horarios.csv#2');
      expect(lista).toHaveTextContent('horarios.csv#3');
      expect(screen.getByText(/No se creó ningún bloque: la carga es todo o nada/)).toBeInTheDocument();
      expect(screen.getByText('2 errores')).toBeInTheDocument();

      const llamadasAlAbrir = operacion.reiniciar.mock.calls.length;
      fireEvent.click(screen.getByRole('button', { name: 'Corregir en la vista previa' }));
      expect(operacion.reiniciar.mock.calls.length).toBe(llamadasAlAbrir + 1);
      expect(screen.getAllByRole('button', { name: 'Cerrar' })).toHaveLength(2);
    });

    it('avisa cuando hay más errores que los detallados', () => {
      renderDialogo({
        job: {
          ...jobBase,
          estado: 'COMPLETADO_CON_ERRORES',
          exitosos: 0,
          errores: 250,
          detalleErrores: Array.from({ length: 100 }, (_, i) => `horarios.csv#${i + 2}: error`)
        }
      });

      expect(screen.getByText('Se muestran los primeros 100 de 250 errores.')).toBeInTheDocument();
    });

    it('descarta el resultado de una operación anterior al abrir el diálogo', () => {
      const { operacion } = renderDialogo({
        job: { ...jobBase, estado: 'COMPLETADO', fase: 'FINALIZADO', exitosos: 10 }
      });

      expect(operacion.reiniciar).toHaveBeenCalledTimes(1);
    });
  });
});
