import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/api/configuracionApi.js', () => ({
  USAR_MOCK: false,
  URL_BASE_API: '/api/v1',
  TIEMPO_ESPERA_MS: 15000
}));
vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({ usuario: { id: 5, nombre: 'Luis', rol: 'ESTUDIANTE' } })
}));
vi.mock('../services/cursosEstudianteService.js', async (importarOriginal) => ({
  ...(await importarOriginal()),
  consultarCursosEstudiante: vi.fn(),
  consultarNotasCursoEstudiante: vi.fn()
}));

import { consultarCursosEstudiante, consultarNotasCursoEstudiante } from '../services/cursosEstudianteService.js';
import PaginaCursosEstudiante from './PaginaCursosEstudiante.jsx';

const CURSOS = [
  { id: '1', nombre: 'Matemáticas', descripcion: 'Pensamiento lógico.', docenteNombre: 'Juan Perez', aulas: ['Aula 101', 'Aula 202'] },
  { id: '2', nombre: 'Comunicación', descripcion: 'Comprensión lectora.', docenteNombre: 'Maria Gomez', aulas: [] }
];
const LISTA = {
  exitoso: true,
  mensaje: '',
  datos: {
    estudiante: { id: 5, nombre: 'Luis' },
    anioConsulta: { id: 1, anio: 2027 },
    gradoNombre: '1er Grado de Secundaria',
    seccionNombre: 'A',
    sinMatricula: false,
    cursos: CURSOS
  }
};
const EVALUACION_BASE = {
  cursoNombre: 'Matemáticas',
  gradoNombre: '1er Grado de Secundaria',
  seccionNombre: 'A',
  docenteNombre: 'Juan Perez',
  competenciaNombre: 'Resuelve problemas de cantidad',
  estudianteNombre: 'Luis Ramirez'
};
const DETALLE = {
  exitoso: true,
  mensaje: '',
  datos: {
    estudiante: { id: 5, nombre: 'Luis Ramirez' },
    curso: { id: '1', nombre: 'Matemáticas' },
    gradoNombre: '1er Grado de Secundaria',
    seccionNombre: 'A',
    docenteNombre: 'Juan Perez',
    aulas: ['Aula 101'],
    anioConsulta: { id: 1, anio: 2027 },
    bimestres: [
      { id: 'BIM_1', nombre: 'I Bimestre' },
      { id: 'BIM_2', nombre: 'II Bimestre' },
      { id: 'BIM_3', nombre: 'III Bimestre' }
    ],
    competencias: [
      {
        id: '1',
        nombre: 'Resuelve problemas de cantidad',
        notasPorBimestre: { BIM_1: 'AD', BIM_2: 'B' }
      },
      { id: '2', nombre: 'Resuelve problemas de forma', notasPorBimestre: {} }
    ],
    evaluaciones: [
      {
        ...EVALUACION_BASE, id: '1', nombre: 'Examen Parcial', descripcion: 'Primeros temas', fecha: '2027-03-20',
        bimestreId: 'BIM_1', bimestreNombre: 'I Bimestre', nota: 'AD'
      },
      {
        ...EVALUACION_BASE, id: '2', nombre: 'Práctica 2', descripcion: '', fecha: '2027-05-10',
        bimestreId: 'BIM_2', bimestreNombre: 'II Bimestre', nota: null
      }
    ]
  }
};

async function abrirDetalleDeMatematicas() {
  await userEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Matemáticas' }));
  await screen.findByRole('heading', { name: /Matemáticas/ });
}

describe('PaginaCursosEstudiante (HU-EVAL-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra los cursos del estudiante con docente, descripción y aula, y el resumen del encabezado', async () => {
    consultarCursosEstudiante.mockResolvedValue(LISTA);
    render(<PaginaCursosEstudiante />);

    expect(await screen.findByRole('heading', { name: 'Mis Cursos' })).toBeInTheDocument();
    expect(screen.getByText('Portal del estudiante')).toBeInTheDocument();
    expect(screen.getByText('Luis — 1er Grado A')).toBeInTheDocument();
    expect(screen.getByText('2 cursos')).toBeInTheDocument();

    const lista = screen.getByRole('list', { name: 'Mis cursos' });
    const matematicas = within(lista).getAllByRole('article')[0];
    expect(within(matematicas).getByRole('heading', { name: 'Matemáticas' })).toBeInTheDocument();
    expect(within(matematicas).getByText('Prof. Juan Perez')).toBeInTheDocument();
    expect(within(matematicas).getByText('Pensamiento lógico.')).toBeInTheDocument();
    // Con varias aulas se muestra la principal y cuántas más hay.
    expect(within(matematicas).getByText('Aula 101 +1')).toBeInTheDocument();
    // Un curso sin bloques horarios no inventa un aula.
    expect(within(within(lista).getAllByRole('article')[1]).queryByText(/Aula/)).not.toBeInTheDocument();
  });

  it('explica cuándo no hay matrícula confirmada', async () => {
    consultarCursosEstudiante.mockResolvedValue({
      exitoso: true,
      mensaje: '',
      datos: { ...LISTA.datos, anioConsulta: null, cursos: [], sinMatricula: true }
    });
    render(<PaginaCursosEstudiante />);

    expect(await screen.findByText('No hay cursos con matrícula confirmada para el año académico de consulta.')).toBeInTheDocument();
    expect(screen.queryByText(/cursos?$/)).not.toBeInTheDocument();
  });

  it('muestra el error genérico y permite reintentar', async () => {
    consultarCursosEstudiante
      .mockResolvedValueOnce({ exitoso: false, datos: null, mensaje: '', estado: 500 })
      .mockResolvedValue(LISTA);
    render(<PaginaCursosEstudiante />);

    expect(await screen.findByText('Se registró un error inesperado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('list', { name: 'Mis cursos' })).toBeInTheDocument();
    expect(consultarCursosEstudiante).toHaveBeenCalledTimes(2);
  });

  it('abre el detalle con la cabecera del curso, el aviso de solo lectura y evaluaciones', async () => {
    consultarCursosEstudiante.mockResolvedValue(LISTA);
    consultarNotasCursoEstudiante.mockResolvedValue(DETALLE);
    render(<PaginaCursosEstudiante />);

    await abrirDetalleDeMatematicas();

    expect(screen.getByRole('heading', { name: 'Matemáticas — 1er Grado A', level: 2 })).toBeInTheDocument();
    expect(consultarNotasCursoEstudiante).toHaveBeenCalledWith(
      expect.objectContaining({ id: 5 }),
      expect.objectContaining({ id: '1', nombre: 'Matemáticas' }),
      expect.objectContaining({ gradoNombre: '1er Grado de Secundaria' })
    );
    expect(screen.getByText('Solo lectura')).toBeInTheDocument();
    const datos = screen.getByRole('list', { name: 'Datos del curso' });
    expect(within(datos).getByText('Prof. Juan Perez')).toBeInTheDocument();
    expect(within(datos).getByText('Aula 101')).toBeInTheDocument();
    expect(within(datos).getByText('1er Grado de Secundaria')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Evaluaciones y Notas', level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByText('Asistencia Diaria')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Volver a Mis Cursos' }));
    expect(await screen.findByRole('list', { name: 'Mis cursos' })).toBeInTheDocument();
  });

  it('muestra la matriz de competencias con las notas de las evaluaciones del bimestre y el logro por bimestre, sin nota final', async () => {
    consultarCursosEstudiante.mockResolvedValue(LISTA);
    consultarNotasCursoEstudiante.mockResolvedValue(DETALLE);
    render(<PaginaCursosEstudiante />);
    await abrirDetalleDeMatematicas();

    // Se abre el último bimestre con datos (el II): su evaluación aún no tiene nota.
    const selector = await screen.findByLabelText('Bimestre');
    expect(selector).toHaveValue('BIM_2');
    const tabla = screen.getByRole('table', { name: 'Notas por competencia del II Bimestre' });
    expect(within(tabla).getByRole('columnheader', { name: 'Ev. 1' })).toBeInTheDocument();
    // El curso no tiene nota final: el grupo es "Logro por competencia", con una columna por bimestre.
    expect(within(tabla).queryByText(/nota final/i)).not.toBeInTheDocument();
    expect(within(tabla).getByRole('columnheader', { name: 'Logro por competencia' })).toBeInTheDocument();
    for (const nombre of ['I Bimestre', 'II Bimestre', 'III Bimestre']) {
      expect(within(tabla).getByRole('columnheader', { name: nombre })).toBeInTheDocument();
    }
    const listaII = screen.getByRole('region', { name: 'Evaluaciones · II Bimestre' });
    expect(within(listaII).getAllByText('no hay nota registrada').length).toBeGreaterThan(0);

    // Logro por competencia: la nota de cada bimestre que ya está registrada y el aviso en los que no.
    const filaCantidad = within(tabla).getByRole('row', { name: /Resuelve problemas de cantidad/ });
    expect(within(filaCantidad).getByText('AD')).toBeInTheDocument();
    expect(within(filaCantidad).getByText('B')).toBeInTheDocument();
    expect(within(filaCantidad).getAllByText('no hay nota de competencia registrada')).toHaveLength(1);
    expect(within(within(tabla).getByRole('row', { name: /Resuelve problemas de forma/ }))
      .getAllByText('no hay nota de competencia registrada')).toHaveLength(3);
    // La conclusión descriptiva no se muestra aquí (solo en la libreta).
    expect(screen.queryByText('Supera el nivel esperado')).not.toBeInTheDocument();

    await userEvent.selectOptions(selector, 'BIM_1');

    const tablaI = screen.getByRole('table', { name: 'Notas por competencia del I Bimestre' });
    const fila = within(tablaI).getByRole('row', { name: /Resuelve problemas de cantidad/ });
    // La nota de la evaluación (Ev. 1) y la de la competencia en el I Bimestre.
    expect(within(fila).getAllByText('AD')).toHaveLength(2);
    // La otra competencia no tiene evaluaciones en el bimestre.
    const filaForma = within(tablaI).getByRole('row', { name: /Resuelve problemas de forma/ });
    expect(within(filaForma).getByText('sin evaluación')).toBeInTheDocument();

    // La lista de evaluaciones trae, en su detalle, los campos que pide la HU.
    const items = within(screen.getByRole('region', { name: 'Evaluaciones · I Bimestre' })).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByText('Examen Parcial', { selector: 'strong' })).toBeInTheDocument();
    expect(within(items[0]).getByText(/Ev\. 1 · 20 mar/)).toBeInTheDocument();
    expect(within(items[0]).getByText('Luis Ramirez')).toBeInTheDocument();

    await userEvent.selectOptions(selector, 'BIM_3');
    expect(screen.getByText('No hay evaluaciones registradas en este bimestre.')).toBeInTheDocument();
  });

  it('muestra el mensaje de negocio si el detalle falla y reintenta la consulta', async () => {
    consultarCursosEstudiante.mockResolvedValue(LISTA);
    consultarNotasCursoEstudiante
      .mockResolvedValueOnce({ exitoso: false, datos: null, mensaje: 'El estudiante no cuenta con una matrícula confirmada.', estado: 400 })
      .mockResolvedValue(DETALLE);
    render(<PaginaCursosEstudiante />);

    await userEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Matemáticas' }));
    expect(await screen.findByText('El estudiante no cuenta con una matrícula confirmada.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByLabelText('Bimestre')).toBeInTheDocument();
  });

  it('un curso sin evaluaciones ni competencias lo indica', async () => {
    consultarCursosEstudiante.mockResolvedValue(LISTA);
    consultarNotasCursoEstudiante.mockResolvedValue({
      ...DETALLE,
      datos: { ...DETALLE.datos, evaluaciones: [], competencias: [] }
    });
    render(<PaginaCursosEstudiante />);

    await userEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Matemáticas' }));

    expect(await screen.findByText('No hay evaluaciones registradas en este bimestre.')).toBeInTheDocument();
    expect(screen.getByText('El curso aún no tiene competencias establecidas.')).toBeInTheDocument();
  });
});
