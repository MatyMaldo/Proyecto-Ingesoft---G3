import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TablaMatriculas from './TablaMatriculas.jsx';

const pendiente = {
  id: 1,
  nombreCompletoEstudiante: 'Alumno PorValidar',
  codigoEstudiante: 'EST-1',
  anioAcademico: 2027,
  fechaAsignacion: '2026-10-15',
  gradoNombre: '1er Grado de Secundaria',
  seccionNombre: 'A',
  estado: 'PENDIENTE'
};

function mostrar(matricula, acciones = {}) {
  const props = { alEmitir: vi.fn(), alEditar: vi.fn(), alEliminar: vi.fn(), ...acciones };
  render(<TablaMatriculas matriculas={[matricula]} {...props} />);
  return { props, tabla: screen.getByRole('table') };
}

describe('TablaMatriculas · acciones en el menú ⋯', () => {
  it('la cabecera de la fecha cabe en una línea y las acciones van en una sola columna con menú', () => {
    const { tabla } = mostrar(pendiente);

    expect(within(tabla).getByRole('columnheader', { name: 'Fecha asignación' })).toBeInTheDocument();
    expect(within(tabla).getAllByRole('button')).toHaveLength(1);
  });

  it('cada opción del menú llama a su acción con la matrícula de la fila', async () => {
    const { props, tabla } = mostrar(pendiente);
    const abrir = () => userEvent.click(within(tabla).getByRole('button', { name: 'Más acciones de Alumno PorValidar' }));

    await abrir();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Editar matrícula de Alumno PorValidar' }));
    expect(props.alEditar).toHaveBeenCalledWith(pendiente);

    await abrir();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Emitir compromiso de Alumno PorValidar' }));
    expect(props.alEmitir).toHaveBeenCalledWith(pendiente);

    await abrir();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Eliminar matrícula de Alumno PorValidar' }));
    expect(props.alEliminar).toHaveBeenCalledWith(pendiente);
  });

  it('una opción bloqueada muestra su motivo y no ejecuta la acción', async () => {
    const bloqueada = {
      ...pendiente,
      puedeEliminar: false,
      motivoNoEliminar: 'La matrícula tiene pagos registrados.'
    };
    const { props, tabla } = mostrar(bloqueada);

    await userEvent.click(within(tabla).getByRole('button', { name: 'Más acciones de Alumno PorValidar' }));
    const eliminar = screen.getByRole('menuitem', { name: 'Eliminar matrícula de Alumno PorValidar' });

    expect(eliminar).toHaveAttribute('aria-disabled', 'true');
    expect(eliminar).toHaveAccessibleDescription('La matrícula tiene pagos registrados.');
    await userEvent.click(eliminar);
    expect(props.alEliminar).not.toHaveBeenCalled();
    // El menú sigue abierto para poder leer el motivo.
    expect(screen.getByRole('menu')).toBeInTheDocument();
    // Las demás opciones siguen disponibles.
    expect(screen.getByRole('menuitem', { name: 'Editar matrícula de Alumno PorValidar' })).not.toHaveAttribute('aria-disabled');
  });

  it('mientras se emite el compromiso el botón del menú queda deshabilitado', () => {
    const { tabla } = mostrar(pendiente, { emitiendoId: 1 });

    expect(within(tabla).getByRole('button', { name: 'Más acciones de Alumno PorValidar' })).toBeDisabled();
  });

  it('las matrículas que no están pendientes no tienen menú', () => {
    const { tabla } = mostrar({ ...pendiente, estado: 'CONFIRMADA' });

    expect(within(tabla).queryByRole('button')).not.toBeInTheDocument();
  });
});
