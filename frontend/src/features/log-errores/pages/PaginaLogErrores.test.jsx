import { beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaLogErrores from './PaginaLogErrores.jsx';

// jsdom no implementa showModal()/close() de <dialog>; se simulan para abrir el panel de detalle.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
});

function renderizarPagina(ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <PaginaLogErrores />
    </MemoryRouter>
  );
}

const paginadorSuperior = () => screen.getByRole('navigation', { name: /superior/ });
const paginadorInferior = () => screen.getByRole('navigation', { name: /inferior/ });

describe('HU-SAT-05 · Logs de errores según el contrato paginado', () => {
  it('muestra los campos del contrato y controles para la página siguiente', async () => {
    renderizarPagina();

    await screen.findByRole('columnheader', { name: 'Operación' }, { timeout: 3000 });
    expect(screen.getByRole('columnheader', { name: 'Módulo' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Mensaje' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Estado HTTP' })).not.toBeInTheDocument();
    const encabezados = screen.getAllByRole('columnheader').map((columna) => columna.textContent);
    expect(encabezados.slice(-2)).toEqual(['Usuario', 'Detalle']);
    // El mismo paginador (resumen + campo de página) aparece arriba y abajo, sincronizado.
    for (const paginador of [paginadorSuperior(), paginadorInferior()]) {
      expect(within(paginador).getByText('1 – 15 de 18 errores')).toBeInTheDocument();
      expect(within(paginador).getByLabelText('Número de página')).toHaveValue(1);
      expect(within(paginador).getByText('de 2')).toBeInTheDocument();
      expect(within(paginador).getByRole('button', { name: 'Primera página' })).toBeDisabled();
      expect(within(paginador).getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    }
    expect(screen.queryByText('18 errores')).not.toBeInTheDocument();

    await userEvent.click(within(paginadorSuperior()).getByRole('button', { name: 'Página siguiente' }));

    await waitFor(() => expect(within(paginadorInferior()).getByText('16 – 18 de 18 errores')).toBeInTheDocument(), { timeout: 3000 });
    for (const paginador of [paginadorSuperior(), paginadorInferior()]) {
      expect(within(paginador).getByLabelText('Número de página')).toHaveValue(2);
      expect(within(paginador).getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
      expect(within(paginador).getByRole('button', { name: 'Última página' })).toBeDisabled();
    }
  });

  it('abre en la página indicada por la URL y anuncia la página actual', async () => {
    renderizarPagina('/?pagina=2');

    await waitFor(() => expect(within(paginadorInferior()).getByText('16 – 18 de 18 errores')).toBeInTheDocument(), {
      timeout: 3000
    });
    expect(within(paginadorInferior()).getByLabelText('Número de página')).toHaveValue(2);
    expect(screen.getByRole('status')).toHaveTextContent('Página 2 de 2. Mostrando 3 errores');
  });

  it('permite escribir el número de página (se confirma al salir del campo) en cualquiera de los dos paginadores', async () => {
    renderizarPagina();
    await waitFor(() => expect(within(paginadorInferior()).getByText('1 – 15 de 18 errores')).toBeInTheDocument(), {
      timeout: 3000
    });

    await userEvent.clear(within(paginadorInferior()).getByLabelText('Número de página'));
    await userEvent.type(within(paginadorInferior()).getByLabelText('Número de página'), '2');
    await userEvent.tab();
    await waitFor(() => expect(within(paginadorSuperior()).getByText('16 – 18 de 18 errores')).toBeInTheDocument(), { timeout: 3000 });

    // Un número fuera de rango se ajusta al límite.
    await userEvent.clear(within(paginadorSuperior()).getByLabelText('Número de página'));
    await userEvent.type(within(paginadorSuperior()).getByLabelText('Número de página'), '99');
    await userEvent.tab();
    expect(within(paginadorSuperior()).getByLabelText('Número de página')).toHaveValue(2);

    await userEvent.clear(within(paginadorSuperior()).getByLabelText('Número de página'));
    await userEvent.type(within(paginadorSuperior()).getByLabelText('Número de página'), '0');
    await userEvent.tab();
    await waitFor(() => expect(within(paginadorInferior()).getByText('1 – 15 de 18 errores')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('filtra por módulo y por texto, y los combina', async () => {
    renderizarPagina();
    await waitFor(() => expect(within(paginadorInferior()).getByText('1 – 15 de 18 errores')).toBeInTheDocument(), { timeout: 3000 });

    await userEvent.selectOptions(screen.getByLabelText('Módulo'), 'AUTENTICACION');
    await waitFor(() => expect(within(paginadorInferior()).getByText('1 – 2 de 2 errores')).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getAllByText('Iniciar sesión').length).toBeGreaterThan(0);

    await userEvent.type(screen.getByLabelText('Buscar por operación, mensaje o usuario'), 'garcia');
    await waitFor(() => expect(screen.queryAllByText('Iniciar sesión')).toHaveLength(0), { timeout: 3000 });
    expect(screen.getAllByText('Cerrar sesión').length).toBeGreaterThan(0);
  });

  it('abre el detalle con el ojo y muestra mensaje y detalle técnico en un panel de solo lectura', async () => {
    renderizarPagina();
    await screen.findAllByRole('button', { name: /^Ver detalle/ }, { timeout: 3000 });

    await userEvent.click(screen.getAllByRole('button', { name: /^Ver detalle: Excepción no controlada/ })[0]);

    expect(screen.getByRole('heading', { name: 'Detalle del error 9' })).toBeInTheDocument();
    expect(screen.getAllByText('Valor fuera de rango: se esperaba AD/A/B/C').length).toBeGreaterThan(0);
    expect(screen.getByText(/IllegalArgumentException/)).toBeInTheDocument();
    expect(screen.getByText('PUT /api/v1/notas')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('muestra la operación en la tabla y deja endpoint y estado HTTP solo en el detalle', async () => {
    renderizarPagina();

    await screen.findAllByText('Guardar calificación', {}, { timeout: 3000 });
    expect(screen.queryByText('PUT /api/v1/notas')).not.toBeInTheDocument();
    expect(screen.queryByText('500')).not.toBeInTheDocument();
  });
});
