import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

const { crearSeccion } = vi.hoisted(() => ({
  crearSeccion: vi.fn(async (datos) => ({
    exitoso: true,
    datos: { id: 99, nombre: datos.nombre, capacidadMaxima: Number(datos.capacidadMaxima), gradoId: 1, anioAcademicoId: 1 }
  }))
}));

vi.mock('../services/gradosSeccionesService.js', () => ({
  consultarEstructura: vi.fn(async () => ({
    exitoso: true,
    datos: {
      anios: [
        { id: 1, anio: 2026, fechaFin: '2099-12-20' },
        { id: 2, anio: 2020, fechaFin: '2020-12-20' }
      ],
      grados: [
        { id: 1, nombre: '1er Grado de Secundaria' },
        { id: 2, nombre: '2do Grado de Secundaria' }
      ],
      secciones: [
        { id: 10, nombre: 'A', capacidadMaxima: 30, matriculadosConfirmados: 18, gradoId: 1, anioAcademicoId: 1, tutorId: 7, tutorNombreCompleto: 'Ana Perez' },
        { id: 11, nombre: 'B', capacidadMaxima: 30, matriculadosConfirmados: 30, gradoId: 1, anioAcademicoId: 1, tutorId: null, tutorNombreCompleto: null }
      ],
      docentes: [{ id: 7, nombreCompleto: 'Ana Perez' }]
    }
  })),
  crearGrado: vi.fn(),
  crearSeccion,
  actualizarSeccion: vi.fn()
}));

import PaginaAnioEscolar from './PaginaAnioEscolar.jsx';

// jsdom no implementa showModal()/close() de <dialog>.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
});

const ESPERA = { timeout: 4000 };
const esperarTabla = () => screen.findByRole('table', {}, ESPERA);

describe('Año escolar', () => {
  it('pone título y descripción en la cabecera con «Crear sección» como única acción primaria', async () => {
    render(<PaginaAnioEscolar />);
    await esperarTabla();

    const cabecera = screen.getByRole('heading', { level: 1, name: 'Año escolar' }).closest('header');
    expect(within(cabecera).getAllByRole('button')).toHaveLength(1);
    expect(within(cabecera).getByRole('button', { name: 'Crear sección' })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: 'Grados y secciones' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Catálogo de grados' })).not.toBeInTheDocument();
  });

  it('muestra los grados como chips con su número de secciones y la tabla del grado elegido', async () => {
    render(<PaginaAnioEscolar />);
    const tabla = await esperarTabla();

    const grados = screen.getByRole('group', { name: 'Filtrar secciones por grado' });
    expect(within(grados).getByRole('button', { name: /^1er Grado\s*2$/ })).toHaveAttribute('aria-pressed', 'true');
    expect(within(grados).getByRole('button', { name: /^2do Grado\s*0$/ })).toHaveAttribute('aria-pressed', 'false');

    expect(within(tabla).getAllByRole('row')).toHaveLength(3);
    expect(within(tabla).getByText('Sin asignar')).toBeInTheDocument();
    expect(screen.getByText('2 secciones · 60 cupos de capacidad total')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modificar la sección A de 1er Grado de Secundaria' })).toBeInTheDocument();
  });

  it('no usa paginador ni selector de filas por página', async () => {
    render(<PaginaAnioEscolar />);
    await esperarTabla();

    expect(screen.queryByRole('group', { name: 'Filas por página' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /Paginación/ })).not.toBeInTheDocument();
  });

  it('muestra «Finalizado» como chip junto al año y no deja crear secciones en un año finalizado', async () => {
    render(<PaginaAnioEscolar />);
    await esperarTabla();

    await userEvent.selectOptions(screen.getByLabelText('Año académico'), '2');

    expect(screen.getByText('Finalizado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear sección' })).toBeDisabled();
    expect(screen.getByRole('option', { name: '2020' })).toBeInTheDocument();
  });

  it('crear una sección se hace en un diálogo, valida los campos y avisa con una notificación', async () => {
    render(<PaginaAnioEscolar />);
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Crear sección' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Crear sección' });
    expect(within(dialogo).getByText(`2026`)).toBeInTheDocument();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));
    expect(within(dialogo).getByText('Ingresa el nombre de la sección.')).toBeInTheDocument();
    expect(within(dialogo).getByText('Selecciona un tutor.')).toBeInTheDocument();
    expect(crearSeccion).not.toHaveBeenCalled();

    await userEvent.type(within(dialogo).getByLabelText('Nombre de la sección'), 'C');
    await userEvent.type(within(dialogo).getByLabelText('Capacidad máxima'), '25');
    await userEvent.selectOptions(within(dialogo).getByLabelText(/Tutor/), '7');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(crearSeccion).toHaveBeenCalled());
    expect(await screen.findByText('Sección «C» registrado correctamente.', {}, ESPERA)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Crear sección' })).not.toBeInTheDocument();
  });

  it('«Crear grado» queda como acción secundaria junto a los chips y abre su propio diálogo', async () => {
    render(<PaginaAnioEscolar />);
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Crear grado' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Crear grado' });
    expect(within(dialogo).getByLabelText('Nombre del grado')).toBeInTheDocument();
    expect(within(dialogo).queryByLabelText('Capacidad máxima')).not.toBeInTheDocument();
  });
});
