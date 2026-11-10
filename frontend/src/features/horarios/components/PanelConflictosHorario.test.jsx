import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import PanelConflictosHorario from './PanelConflictosHorario.jsx';

const asignaciones = [
  { id: 21, cursoNombre: 'Matemáticas' },
  { id: 22, cursoNombre: 'Historia' }
];

function renderPanel(props = {}) {
  const alSeleccionar = vi.fn();
  const alCerrar = vi.fn();
  const alDescartar = vi.fn();
  render(
    <PanelConflictosHorario
      conflictos={[]}
      asignaciones={asignaciones}
      alSeleccionar={alSeleccionar}
      alCerrar={alCerrar}
      alDescartar={alDescartar}
      {...props}
    />
  );
  return { alSeleccionar, alCerrar, alDescartar };
}

const conflictos = [
  {
    clave: 'bloque-10',
    asignacionCursoId: 21,
    diaSemana: 'LUNES',
    horaInicio: '08:00:00',
    horaFin: '09:30:00',
    tipo: 'CONFLICTO_AULA',
    mensaje: 'El aula Aula 201 está ocupada por 3ro A (Ciencias).'
  },
  {
    clave: 'bloque-10',
    asignacionCursoId: 21,
    diaSemana: 'LUNES',
    horaInicio: '08:00:00',
    horaFin: '09:30:00',
    tipo: 'CONFLICTO_SECCION',
    mensaje: 'La sección 2do B ya tiene Historia el lunes de 08:00 a 09:30.'
  }
];

describe('PanelConflictosHorario', () => {
  it('agrupa los conflictos por bloque y muestra todos los mensajes', () => {
    renderPanel({ conflictos });

    expect(screen.getByText('No se guardó el horario')).toBeInTheDocument();
    expect(screen.getByText('Hay 2 conflictos que impiden guardar. Corrige los bloques marcados.'))
      .toBeInTheDocument();
    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
    expect(screen.getByText(/Lunes · 08:00–09:30/)).toBeInTheDocument();
    expect(screen.getByText('El aula Aula 201 está ocupada por 3ro A (Ciencias).'))
      .toBeInTheDocument();
    expect(screen.getByText('La sección 2do B ya tiene Historia el lunes de 08:00 a 09:30.'))
      .toBeInTheDocument();
  });

  it('avisa al seleccionar el bloque y al descartar o cerrar', () => {
    const { alSeleccionar, alCerrar, alDescartar } = renderPanel({ conflictos });

    fireEvent.click(screen.getByRole('button', { name: /Matemáticas/ }));
    expect(alSeleccionar).toHaveBeenCalledWith(expect.objectContaining({
      clave: 'bloque-10',
      tipo: 'CONFLICTO_AULA'
    }));

    fireEvent.click(screen.getByRole('button', { name: 'Descartar cambios' }));
    expect(alDescartar).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Corregir' }));
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });
});
