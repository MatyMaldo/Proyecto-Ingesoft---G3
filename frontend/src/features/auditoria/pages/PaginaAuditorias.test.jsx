import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaAuditorias from './PaginaAuditorias.jsx';

const PAGINADOR_SUPERIOR = { name: 'Paginación de auditorías (superior)' };
const PAGINADOR_INFERIOR = { name: 'Paginación de auditorías (inferior)' };

async function renderizarYEsperar() {
  render(<PaginaAuditorias />);
  await waitFor(() => expect(screen.getByRole('navigation', PAGINADOR_SUPERIOR)).toBeInTheDocument(), {
    timeout: 3000
  });
}

function totalMostrado() {
  return within(screen.getByRole('navigation', PAGINADOR_SUPERIOR)).getByRole('status');
}

describe('HU-SAT-04 · Selectores independientes de Módulo y Tipo de acción', () => {
  it('el tipo de acción está habilitado desde el inicio y ofrece los cinco tipos', async () => {
    await renderizarYEsperar();

    const selectAccion = screen.getByLabelText('Tipo de acción');
    expect(selectAccion).toBeEnabled();
    const opciones = within(selectAccion).getAllByRole('option').map((opcion) => opcion.textContent);
    expect(opciones).toEqual([
      'Todas las acciones',
      'Crear',
      'Actualizar',
      'Eliminar',
      'Login',
      'Cambio de estado'
    ]);
  });

  it('cambiar el módulo no reinicia el tipo de acción', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.selectOptions(screen.getByLabelText('Tipo de acción'), 'CAMBIO_ESTADO');
    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');

    expect(screen.getByLabelText('Tipo de acción')).toHaveValue('CAMBIO_ESTADO');
  });

  it('un tipo de acción sin registros muestra el mensaje de sin resultados', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.selectOptions(screen.getByLabelText('Tipo de acción'), 'ELIMINAR');
    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');

    expect(
      await screen.findByText('No se encontraron registros de auditoría con los criterios indicados')
    ).toBeInTheDocument();
  });
});

describe('HU-SAT-04 · Botón "Filtros" (vista compacta)', () => {
  it('alterna el panel de filtros y muestra cuántos filtros hay activos', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    const boton = screen.getByRole('button', { name: /^Filtros/ });
    expect(boton).toHaveAttribute('aria-expanded', 'false');

    await usuario.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');

    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');
    await usuario.selectOptions(screen.getByLabelText('Tipo de acción'), 'CAMBIO_ESTADO');

    expect(screen.getByRole('button', { name: /Filtros 2 filtros activos/ })).toBeInTheDocument();
  });
});

describe('HU-SAT-04 · Encabezado', () => {
  it('muestra solo el título y la descripción, sin el rótulo repetido del breadcrumb ni la insignia del total', async () => {
    await renderizarYEsperar();

    expect(screen.getByRole('heading', { level: 1, name: 'Auditorías del Sistema' })).toBeInTheDocument();
    expect(screen.queryByText(/Módulo de administración/i)).not.toBeInTheDocument();
    // El total ya lo da el paginador; no se repite como insignia.
    expect(screen.queryByText(/^\d+ registros$/)).not.toBeInTheDocument();
    expect(screen.getByText(/Consulta de solo lectura/)).toBeInTheDocument();
  });
});

describe('HU-SAT-04 · Paginación de 15 en 15 (Esc. 4)', () => {
  it('muestra 15 registros por página y el mismo paginador arriba y abajo, con total solo en el superior', async () => {
    await renderizarYEsperar();

    expect(totalMostrado()).toHaveTextContent('1 – 15 de 26 registros');
    const inferior = screen.getByRole('navigation', PAGINADOR_INFERIOR);
    expect(inferior).toHaveTextContent('1 – 15 de 26 registros');
    expect(within(inferior).queryByRole('status')).not.toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(16);
  });

  it('cambia de página y conserva los filtros; al cambiar un filtro vuelve a la primera', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.click(within(screen.getByRole('navigation', PAGINADOR_SUPERIOR)).getByRole('button', { name: 'Página siguiente' }));
    await waitFor(() => expect(totalMostrado()).toHaveTextContent('16 – 26 de 26 registros'));
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(12);

    // Un filtro nuevo regresa a la primera página.
    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'NOTAS');
    await waitFor(() => expect(screen.getByRole('list', { name: 'Filtros aplicados' })).toBeInTheDocument());
    await waitFor(() => expect(totalMostrado()).toHaveTextContent(/^1 – \d+ de \d+ registros?$/));
  });
});

describe('HU-SAT-04 · Filtros aplicados y "Limpiar filtros"', () => {
  it('no ofrece limpiar mientras no haya filtros', async () => {
    await renderizarYEsperar();

    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Filtros aplicados' })).not.toBeInTheDocument();
  });

  it('muestra un chip por filtro, permite quitarlo por separado y limpiar todo', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'NOTAS');
    await usuario.selectOptions(screen.getByLabelText('Tipo de acción'), 'CREAR');

    const chips = await screen.findByRole('list', { name: 'Filtros aplicados' });
    expect(within(chips).getByText('Módulo: Notas')).toBeInTheDocument();
    expect(within(chips).getByText('Acción: Crear')).toBeInTheDocument();

    await usuario.click(within(chips).getByRole('button', { name: 'Quitar filtro Módulo: Notas' }));
    expect(screen.getByLabelText('Módulo')).toHaveValue('TODOS');
    expect(screen.getByLabelText('Tipo de acción')).toHaveValue('CREAR');

    await usuario.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByLabelText('Tipo de acción')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
    await waitFor(() => expect(totalMostrado()).toHaveTextContent('1 – 15 de 26 registros'));
  });

  it('limpiar también vacía la búsqueda y las fechas', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.type(screen.getByLabelText('Buscar usuario o descripción en la página'), 'zzz');
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-09-17' } });
    await usuario.click(await screen.findByRole('button', { name: 'Limpiar filtros' }));

    expect(screen.getByLabelText('Buscar usuario o descripción en la página')).toHaveValue('');
    expect(screen.getByLabelText('Desde')).toHaveValue('');
    expect(screen.getByLabelText('Hasta')).toHaveValue('');
  });

  it('el mensaje de sin resultados también ofrece limpiar los filtros', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    await usuario.selectOptions(screen.getByLabelText('Tipo de acción'), 'ELIMINAR');
    await usuario.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');
    await screen.findByText('No se encontraron registros de auditoría con los criterios indicados');

    const botones = screen.getAllByRole('button', { name: 'Limpiar filtros' });
    await usuario.click(botones[botones.length - 1]);
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });
});

describe('HU-SAT-04 · Rango de fechas como filtro aplicado', () => {
  it('muestra el rango escrito como chip y quitarlo vacía las fechas', async () => {
    const usuario = userEvent.setup();
    await renderizarYEsperar();

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-09-17' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-09-18' } });

    const chips = await screen.findByRole('list', { name: 'Filtros aplicados' });
    expect(within(chips).getByText('Fecha: 17/09/2026 – 18/09/2026')).toBeInTheDocument();

    await usuario.click(within(chips).getByRole('button', { name: /^Quitar filtro Fecha/ }));
    expect(screen.getByLabelText('Desde')).toHaveValue('');
    expect(screen.getByLabelText('Hasta')).toHaveValue('');
  });

  it('no ofrece atajos de fecha (Hoy, Últimos 7 días...)', async () => {
    await renderizarYEsperar();

    expect(screen.queryByRole('button', { name: 'Hoy' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Atajos de fecha' })).not.toBeInTheDocument();
  });
});
