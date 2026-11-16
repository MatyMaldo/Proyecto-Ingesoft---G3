import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const { listarEstudiantesEvaluacion, listarNotasEvaluacion, guardarNotaEvaluacion } = vi.hoisted(() => ({
  listarEstudiantesEvaluacion: vi.fn(),
  listarNotasEvaluacion: vi.fn(),
  guardarNotaEvaluacion: vi.fn()
}));

vi.mock('../services/evaluacionesService.js', () => ({
  ESCALA_NOTAS_EVALUACION: ['AD', 'A', 'B', 'C'],
  listarEstudiantesEvaluacion,
  listarNotasEvaluacion,
  guardarNotaEvaluacion
}));

import DialogoNotasEvaluacion from './DialogoNotasEvaluacion.jsx';

const ESTUDIANTES = Array.from({ length: 14 }, (_, indice) => ({
  id: indice + 1,
  nombre: `Estudiante ${String(indice + 1).padStart(2, '0')}`,
  codigo: `EST-${String(indice + 1).padStart(3, '0')}`
}));
const EVALUACION = {
  id: 7,
  nombre: 'Examen final',
  cursoNombre: 'Matemáticas',
  seccionNombre: 'A',
  bimestreNombre: 'I Bimestre',
  fecha: '2026-04-15'
};

function mostrar(propiedades = {}) {
  listarEstudiantesEvaluacion.mockResolvedValue({ exitoso: true, datos: ESTUDIANTES });
  listarNotasEvaluacion.mockResolvedValue({ exitoso: true, datos: [] });
  const alCerrar = vi.fn();
  const alGuardar = vi.fn();
  render(
    <DialogoNotasEvaluacion
      evaluacion={EVALUACION}
      usuario={{ id: 1 }}
      anioVigente={{ id: 1, anio: 2026 }}
      vigente
      alCerrar={alCerrar}
      alGuardar={alGuardar}
      {...propiedades}
    />
  );
  return { alCerrar, alGuardar };
}

describe('DialogoNotasEvaluacion', () => {
  it('pagina de 6 en 6 sin selector de filas y conserva los cambios al cambiar de página', async () => {
    mostrar();
    const dialogo = await screen.findByRole('dialog', { name: 'Notas · Examen final' });
    const lista = await within(dialogo).findByRole('list', { name: 'Estudiantes de la sección' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(6);
    expect(within(dialogo).queryByRole('group', { name: 'Filas por página' })).not.toBeInTheDocument();
    expect(within(dialogo).getByText(/de 14 con nota/)).toBeInTheDocument();
    expect(within(dialogo).queryByText('Competencia')).not.toBeInTheDocument();

    await userEvent.click(within(within(lista).getAllByRole('radiogroup')[0]).getByRole('radio', { name: 'AD' }));
    const paginacion = within(dialogo).getByRole('navigation', { name: 'Paginación de estudiantes' });
    await userEvent.click(within(paginacion).getByRole('button', { name: /siguiente/i }));
    const segunda = within(dialogo).getByRole('list', { name: 'Estudiantes de la sección' });
    expect(within(segunda).getByText('Estudiante 07')).toBeInTheDocument();
    expect(within(dialogo).getByText('1 sin guardar')).toBeInTheDocument();
  });

  it('guarda solo las notas cambiadas y conserva como pendientes las que fallan', async () => {
    const { alGuardar } = mostrar();
    guardarNotaEvaluacion
      .mockResolvedValueOnce({ exitoso: true, datos: { nota: 'A' } })
      .mockResolvedValueOnce({ exitoso: false, mensaje: 'Servidor no disponible' });
    const dialogo = await screen.findByRole('dialog', { name: 'Notas · Examen final' });
    const lista = await within(dialogo).findByRole('list', { name: 'Estudiantes de la sección' });
    const grupos = within(lista).getAllByRole('radiogroup');
    await userEvent.click(within(grupos[0]).getByRole('radio', { name: 'A' }));
    await userEvent.click(within(grupos[1]).getByRole('radio', { name: 'B' }));

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar notas' }));
    expect(guardarNotaEvaluacion).toHaveBeenCalledTimes(2);
    expect(await within(dialogo).findByText('No se pudo guardar 1 nota. Revisa la fila marcada.')).toBeInTheDocument();
    expect(within(dialogo).getByText('Servidor no disponible')).toBeInTheDocument();
    expect(within(dialogo).getByText('1 sin guardar')).toBeInTheDocument();
    expect(alGuardar).not.toHaveBeenCalled();
  });

  it('con el año no vigente solo informa y no ofrece guardar', async () => {
    mostrar({ vigente: false });
    const dialogo = await screen.findByRole('dialog', { name: 'Notas · Examen final' });
    expect(within(dialogo).getByText('Las notas de las evaluaciones solo se registran con el año académico vigente')).toBeInTheDocument();
    expect(within(dialogo).queryByRole('button', { name: 'Guardar notas' })).not.toBeInTheDocument();
    expect(listarEstudiantesEvaluacion).not.toHaveBeenCalled();
  });
});
