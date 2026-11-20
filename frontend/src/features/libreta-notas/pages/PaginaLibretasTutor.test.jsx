import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const { usuario, servicios } = vi.hoisted(() => ({
  usuario: { id: '3', nombre: 'Docente de prueba', rol: 'DOCENTE' },
  servicios: {
    generarLibretaTutor: vi.fn(),
    listarOpcionesLibretaTutor: vi.fn(),
    listarLibretasDelEstudiante: vi.fn(),
    obtenerDetalleLibreta: vi.fn(),
    obtenerPdfLibreta: vi.fn(),
    obtenerVistaPreviaLibretaTutor: vi.fn()
  }
}));

vi.mock('../../../shared/auth/useAuth.js', () => ({ default: () => ({ usuario }) }));
vi.mock('../services/libretasService.js', () => ({
  ...servicios,
  esBimestreFinalizado: (bimestre) => Boolean(bimestre?.finalizado)
}));

import PaginaLibretasTutor from './PaginaLibretasTutor.jsx';

const contexto = {
  exitoso: true,
  datos: {
    anioAcademico: { id: 1, anio: 2026 },
    estudiantes: [{ idEstudiante: '6', nombre: 'Ana Estudiante' }],
    bimestres: [{ id: '2', nombre: 'BIM_3', finalizado: true }]
  }
};

async function abrirGeneracion() {
  const usuarioFinal = userEvent.setup();
  render(<PaginaLibretasTutor />);
  await screen.findByRole('option', { name: 'Ana Estudiante' });
  await usuarioFinal.click(screen.getByRole('button', { name: 'Generar libreta parcial' }));

  const dialogo = await screen.findByRole('dialog', { name: 'Generar libreta parcial' });
  await within(dialogo).findByText('Colegio de prueba');
  await usuarioFinal.type(within(dialogo).getByLabelText(/Comentarios finales del tutor/), 'Buen desempeño.');
  return { dialogo, usuarioFinal };
}

describe('resultado al generar una libreta de tutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    servicios.listarOpcionesLibretaTutor.mockResolvedValue(contexto);
    servicios.obtenerVistaPreviaLibretaTutor.mockResolvedValue({
      exitoso: true,
      datos: {
        nombreInstitucion: 'Colegio de prueba',
        nombreEstudiante: 'Ana Estudiante',
        nombreSeccion: '1.° A',
        nombreTutor: 'Docente de prueba',
        anioAcademico: 2026,
        nombreBimestre: 'BIM_3',
        inasistencias: 0,
        tardanzas: 0,
        notasCompetencias: []
      }
    });
  });

  it('muestra la notificación de éxito después de generar y cargar el detalle', async () => {
    servicios.generarLibretaTutor.mockResolvedValue({
      exitoso: true,
      datos: { idLibreta: 20 }
    });
    servicios.obtenerDetalleLibreta.mockResolvedValue({
      exitoso: true,
      datos: {
        idLibreta: 20,
        nombreEstudiante: 'Ana Estudiante',
        nombreBimestre: 'BIM_3',
        anioAcademico: 2026,
        notasCompetencias: []
      }
    });
    const { dialogo, usuarioFinal } = await abrirGeneracion();

    await usuarioFinal.click(within(dialogo).getByRole('button', { name: 'Generar libreta' }));

    expect(await screen.findByRole('status')).toHaveTextContent('La libreta parcial se generó correctamente.');
    expect(await screen.findByRole('dialog', { name: /Libreta parcial/ })).toBeInTheDocument();
  });

  it('muestra la notificación de error y conserva abierto el formulario si falla la generación', async () => {
    servicios.generarLibretaTutor.mockResolvedValue({
      exitoso: false,
      mensaje: 'Faltan notas de competencias.'
    });
    const { dialogo, usuarioFinal } = await abrirGeneracion();

    await usuarioFinal.click(within(dialogo).getByRole('button', { name: 'Generar libreta' }));

    const notificacion = await within(dialogo).findByText('Faltan notas de competencias.');
    expect(notificacion.closest('[role="alert"]')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Generar libreta parcial' })).toBeInTheDocument();
  });

  it('aclara que se generó la libreta si falla la carga posterior del detalle', async () => {
    servicios.generarLibretaTutor.mockResolvedValue({
      exitoso: true,
      datos: { idLibreta: 20 }
    });
    servicios.obtenerDetalleLibreta.mockResolvedValue({
      exitoso: false,
      mensaje: 'No se pudo cargar el detalle.'
    });
    const { dialogo, usuarioFinal } = await abrirGeneracion();

    await usuarioFinal.click(within(dialogo).getByRole('button', { name: 'Generar libreta' }));

    expect(await screen.findByText(/La libreta se generó, pero no se pudo cargar su detalle/)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Generar libreta parcial' })).not.toBeInTheDocument();
  });
});
