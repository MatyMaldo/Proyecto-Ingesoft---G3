import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import MatrizHorario from './MatrizHorario.jsx';

const asignaciones = [{
  id: 21,
  cursoId: 4,
  cursoNombre: 'Matemáticas',
  docenteId: 9,
  docenteNombre: 'Prof. García'
}];

const aulas = [{ id: 31, nombre: 'Aula 101' }];

describe('MatrizHorario · bloques de varias horas', () => {
  it('muestra un bloque de tres horas en una celda con el rowSpan correcto', () => {
    render(
      <MatrizHorario
        titulo="4to B"
        bloques={{
          'bloque-1': {
            id: 1,
            dia: 'LUNES',
            horaInicio: '08:00',
            horaFin: '11:00',
            asignacionId: 21,
            aulaId: 31
          }
        }}
        bloquesGuardados={{
          'bloque-1': {
            id: 1,
            dia: 'LUNES',
            horaInicio: '08:00',
            horaFin: '11:00',
            asignacionId: 21,
            aulaId: 31
          }
        }}
        asignaciones={asignaciones}
        aulas={aulas}
        ocupaciones={[]}
        deshabilitada={false}
        alElegirBloque={vi.fn()}
        alQuitarBloque={vi.fn()}
        alMoverBloque={vi.fn()}
      />
    );

    const bloque = screen.getByRole('button', { name: /Editar Lunes 08:00 a 11:00/i });
    expect(bloque.closest('td')).toHaveAttribute('rowspan', '3');
  });

  it('muestra un bloque de dos horas en una celda con el rowSpan correcto', () => {
    render(
      <MatrizHorario
        titulo="4to B"
        bloques={{
          'bloque-1': {
            id: 1,
            dia: 'LUNES',
            horaInicio: '08:00',
            horaFin: '10:00',
            asignacionId: 21,
            aulaId: 31
          }
        }}
        bloquesGuardados={{
          'bloque-1': {
            id: 1,
            dia: 'LUNES',
            horaInicio: '08:00',
            horaFin: '10:00',
            asignacionId: 21,
            aulaId: 31
          }
        }}
        asignaciones={asignaciones}
        aulas={aulas}
        ocupaciones={[]}
        deshabilitada={false}
        alElegirBloque={vi.fn()}
        alQuitarBloque={vi.fn()}
        alMoverBloque={vi.fn()}
      />
    );

    const bloque = screen.getByRole('button', { name: /Editar Lunes 08:00 a 10:00/i });
    expect(bloque).toHaveTextContent('Matemáticas');
    expect(bloque).toHaveTextContent('08:00 – 10:00');
    expect(bloque.closest('td')).toHaveAttribute('rowspan', '2');
  });

  it('marca los bloques con conflictos devueltos por el backend', () => {
    render(
      <MatrizHorario
        titulo="4to B"
        bloques={{
          'bloque-1': {
            id: 1,
            dia: 'LUNES',
            horaInicio: '08:00',
            horaFin: '10:00',
            asignacionId: 21,
            aulaId: 31
          }
        }}
        bloquesGuardados={{}}
        asignaciones={asignaciones}
        aulas={aulas}
        ocupaciones={[]}
        conflictos={[{
          clave: 'bloque-1',
          asignacionCursoId: 21,
          diaSemana: 'LUNES',
          horaInicio: '08:00',
          horaFin: '10:00',
          tipo: 'CONFLICTO_AULA',
          mensaje: 'El aula Aula 101 está ocupada por 3ro A (Ciencias).'
        }]}
        deshabilitada={false}
        alElegirBloque={vi.fn()}
        alQuitarBloque={vi.fn()}
        alMoverBloque={vi.fn()}
      />
    );

    const bloque = screen.getByRole('button', { name: /Editar Lunes 08:00 a 10:00/i });
    expect(bloque).toHaveTextContent('Choque de aula');
    expect(bloque).toHaveAttribute(
      'aria-label',
      expect.stringContaining('El aula Aula 101 está ocupada por 3ro A (Ciencias).')
    );
  });
});
