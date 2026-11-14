import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import TablaAsignaciones from './TablaAsignaciones.jsx';

function crearAsignaciones(cantidad) {
  return Array.from({ length: cantidad }, (_, indice) => ({
    id: String(indice + 1),
    cursoNombre: `Curso ${indice + 1}`,
    docenteNombre: `Docente ${indice + 1}`,
    docenteId: String(indice + 1)
  }));
}

function pintar(cantidad, propiedades = {}) {
  return render(
    <TablaAsignaciones
      estado="listo"
      asignaciones={crearAsignaciones(cantidad)}
      alReintentar={vi.fn()}
      alAgregar={vi.fn()}
      alEliminar={vi.fn()}
      {...propiedades}
    />
  );
}

describe('TablaAsignaciones', () => {
  it('muestra el título de las asignaciones de la sección', () => {
    pintar(2);
    expect(
      screen.getByRole('heading', { name: 'Asignaciones de cursos y docentes de la sección' })
    ).toBeInTheDocument();
  });

  it('con 5 relaciones o menos no muestra paginador', () => {
    pintar(5);
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.queryByRole('navigation', { name: 'Paginación de asignaciones' })).not.toBeInTheDocument();
  });

  it('pagina de 5 en 5, sin selector de filas por página', async () => {
    pintar(7);

    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('Curso 1')).toBeInTheDocument();
    expect(screen.queryByText('Curso 6')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    const paginador = screen.getByRole('navigation', { name: 'Paginación de asignaciones' });
    await userEvent.click(within(paginador).getByRole('button', { name: 'Página siguiente' }));

    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Curso 6')).toBeInTheDocument();
    expect(screen.getByText('Curso 7')).toBeInTheDocument();
  });

  it('en solo lectura quita editar y eliminar pero conserva la carga horaria del docente', async () => {
    const alVerCarga = vi.fn();
    pintar(2, { soloLectura: true, alVerCarga });

    expect(screen.queryByRole('button', { name: /^Editar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Eliminar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar relación' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Carga docente de Docente 1' }));
    expect(alVerCarga).toHaveBeenCalledWith(expect.objectContaining({ docenteId: '1' }));
  });
});
