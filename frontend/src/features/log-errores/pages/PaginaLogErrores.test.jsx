import { beforeAll, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

    await userEvent.type(screen.getByLabelText('Buscar por mensaje, tipo de error o usuario'), 'garcia');
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

describe('Log de errores · coherencia con Usuarios y Auditorías', () => {
  it('muestra título y descripción de solo lectura, sin el rótulo repetido del breadcrumb', async () => {
    renderizarPagina();
    await screen.findByRole('columnheader', { name: 'Operación' }, { timeout: 3000 });

    expect(screen.getByRole('heading', { level: 1, name: 'Log de Errores del Sistema' })).toBeInTheDocument();
    expect(screen.queryByText(/Módulo de administración/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Consulta de solo lectura/)).toBeInTheDocument();
  });

  it('muestra el módulo como filtro aplicado y permite quitarlo o limpiar todo', async () => {
    renderizarPagina();
    await screen.findByRole('columnheader', { name: 'Operación' }, { timeout: 3000 });
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Módulo'), 'USUARIOS');
    const chips = await screen.findByRole('list', { name: 'Filtros aplicados' });
    expect(within(chips).getByText('Módulo: Usuarios')).toBeInTheDocument();

    await userEvent.click(within(chips).getByRole('button', { name: 'Quitar filtro Módulo: Usuarios' }));
    expect(screen.getByLabelText('Módulo')).toHaveValue('TODOS');

    await userEvent.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');
    await userEvent.type(screen.getByLabelText('Buscar por mensaje, tipo de error o usuario'), 'zzz');
    await userEvent.click(await screen.findByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByLabelText('Módulo')).toHaveValue('TODOS');
    expect(screen.getByLabelText('Buscar por mensaje, tipo de error o usuario')).toHaveValue('');
  });

  it('el rango de fechas se ve como filtro aplicado y el mensaje de sin resultados ofrece limpiar', async () => {
    renderizarPagina();
    await screen.findByRole('columnheader', { name: 'Operación' }, { timeout: 3000 });

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2001-01-01' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2001-01-02' } });

    expect(await screen.findByText('Fecha: 01/01/2001 – 02/01/2001')).toBeInTheDocument();
    expect(await screen.findByText('No se encontraron errores con los criterios indicados', {}, { timeout: 3000 })).toBeInTheDocument();

    const botones = screen.getAllByRole('button', { name: 'Limpiar filtros' });
    await userEvent.click(botones[botones.length - 1]);
    expect(await screen.findByRole('columnheader', { name: 'Operación' }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByLabelText('Desde')).toHaveValue('');
  });

  it('no muestra tarjetas de resumen', async () => {
    renderizarPagina();
    await screen.findByRole('columnheader', { name: 'Operación' }, { timeout: 3000 });

    expect(screen.queryByRole('list', { name: 'Resumen de errores' })).not.toBeInTheDocument();
  });

  it('usa módulo neutro; rojo para la excepción, azul para el correo y gris para el proceso automático', async () => {
    renderizarPagina();
    await screen.findByRole('columnheader', { name: 'Operación' }, { timeout: 3000 });

    const tabla = screen.getByRole('table');
    const filas = within(tabla).getAllByRole('row').slice(1);
    const insignias = filas.flatMap((fila) => [...fila.querySelectorAll('span[style*="--tono-fondo"]')]);
    const tonoDe = (texto) => insignias.find((i) => i.textContent === texto)?.style.getPropertyValue('--tono-fondo');
    expect(tonoDe('Excepción no controlada')).toBe('var(--tono-rojo-fondo)');
    expect(tonoDe('Notificación por correo')).toBe('var(--tono-azul-fondo)');
    expect(tonoDe('Proceso automático')).toBe('var(--tono-gris-fondo)');
    // Los módulos (Notas, Usuarios, Pagos...) son neutros.
    for (const texto of ['Notas', 'Usuarios', 'Pagos']) {
      expect(tonoDe(texto)).toBe('var(--tono-gris-fondo)');
    }
    expect(screen.queryByRole('columnheader', { name: /HTTP|código/i })).not.toBeInTheDocument();
  });

  it('muestra el avatar con iniciales junto al usuario, incluido "Sistema"', async () => {
    renderizarPagina();
    await screen.findByRole('columnheader', { name: 'Operación' }, { timeout: 3000 });

    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    const filaSistema = filas.find((fila) => within(fila).queryByText('Sistema'));
    expect(filaSistema).toBeDefined();
    expect(within(filaSistema).getByText('S')).toBeInTheDocument();
  });
});
