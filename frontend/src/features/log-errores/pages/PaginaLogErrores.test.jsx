import { beforeAll, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// La pantalla siempre consulta al backend; en las pruebas se sustituye el servicio por datos fijos.
vi.mock('../services/logErroresService.js', async (importarOriginal) => {
  const real = await importarOriginal();
  const { obtenerErroresDePrueba } = await import('../pruebas/logErroresDePrueba.js');
  return { ...real, obtenerErrores: obtenerErroresDePrueba };
});

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

const paginador = () => screen.getByRole('navigation', { name: 'Paginación de logs de errores' });
const esperarListado = () => screen.findByRole('columnheader', { name: 'Mensaje' });

describe('HU-SAT-05 · Logs de errores según el contrato paginado', () => {
  it('muestra las columnas del listado, con el mensaje y sin operación ni estado HTTP', async () => {
    renderizarPagina();
    await esperarListado();

    const encabezados = screen.getAllByRole('columnheader').map((columna) => columna.textContent);
    expect(encabezados).toEqual(['Fecha y hora', 'Módulo', 'Tipo de error', 'Mensaje', 'Usuario', 'Detalle']);

    const tabla = screen.getByRole('table');
    expect(within(tabla).getByText('Valor fuera de rango: se esperaba AD/A/B/C')).toBeInTheDocument();
    expect(within(tabla).queryByText('PUT /api/v1/notas')).not.toBeInTheDocument();
    expect(within(tabla).queryByText('500')).not.toBeInTheDocument();
  });

  it('muestra el total arriba y un único paginador al pie, sin repetir el resumen', async () => {
    renderizarPagina();
    await esperarListado();

    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    expect(screen.getAllByText('1 – 10 de 18 errores')).toHaveLength(1);
    expect(within(paginador()).queryByText('1 – 10 de 18 errores')).not.toBeInTheDocument();
    expect(within(paginador()).getByLabelText('Número de página')).toHaveValue(1);
    expect(within(paginador()).getByText('de 2')).toBeInTheDocument();
    expect(within(paginador()).getByRole('button', { name: 'Primera página' })).toBeDisabled();
    expect(within(paginador()).getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await userEvent.click(within(paginador()).getByRole('button', { name: 'Página siguiente' }));

    expect(await screen.findByText('11 – 18 de 18 errores')).toBeInTheDocument();
    expect(within(paginador()).getByLabelText('Número de página')).toHaveValue(2);
    expect(within(paginador()).getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
    expect(within(paginador()).getByRole('button', { name: 'Última página' })).toBeDisabled();
  });

  it('abre en la página indicada por la URL y anuncia la página actual', async () => {
    renderizarPagina('/?pagina=2');

    expect(await screen.findByText('11 – 18 de 18 errores')).toBeInTheDocument();
    expect(within(paginador()).getByLabelText('Número de página')).toHaveValue(2);
    expect(screen.getByText('Página 2 de 2. Mostrando 8 errores')).toBeInTheDocument();
  });

  it('permite escribir el número de página (se confirma al salir del campo) y ajusta los fuera de rango', async () => {
    renderizarPagina();
    await esperarListado();

    await userEvent.clear(within(paginador()).getByLabelText('Número de página'));
    await userEvent.type(within(paginador()).getByLabelText('Número de página'), '2');
    await userEvent.tab();
    expect(await screen.findByText('11 – 18 de 18 errores')).toBeInTheDocument();

    await userEvent.clear(within(paginador()).getByLabelText('Número de página'));
    await userEvent.type(within(paginador()).getByLabelText('Número de página'), '99');
    await userEvent.tab();
    expect(within(paginador()).getByLabelText('Número de página')).toHaveValue(2);

    await userEvent.clear(within(paginador()).getByLabelText('Número de página'));
    await userEvent.type(within(paginador()).getByLabelText('Número de página'), '0');
    await userEvent.tab();
    expect(await screen.findByText('1 – 10 de 18 errores')).toBeInTheDocument();
  });

  it('filtra por módulo y por texto, y los combina', async () => {
    renderizarPagina();
    await esperarListado();

    await userEvent.selectOptions(screen.getByLabelText('Módulo'), 'AUTENTICACION');
    expect(await screen.findByText('1 – 2 de 2 errores')).toBeInTheDocument();
    expect(screen.getAllByText('Tiempo de espera agotado al validar las credenciales').length).toBeGreaterThan(0);

    await userEvent.type(screen.getByLabelText('Buscar por mensaje, tipo de error o usuario'), 'garcia');
    await waitFor(
      () => expect(screen.queryAllByText('Tiempo de espera agotado al validar las credenciales')).toHaveLength(0),
      { timeout: 3000 }
    );
    expect(screen.getAllByText('Error al invalidar la sesión').length).toBeGreaterThan(0);
  });

  it('abre el detalle con el ojo y muestra operación, estado HTTP, mensaje y detalle técnico', async () => {
    renderizarPagina();
    await esperarListado();

    await userEvent.click(screen.getAllByRole('button', { name: /^Ver detalle: Excepción no controlada/ })[0]);

    const panel = screen.getByRole('dialog');
    expect(within(panel).getByRole('heading', { name: 'Detalle del error' })).toBeInTheDocument();
    expect(within(panel).getByText('ID 9')).toBeInTheDocument();
    expect(within(panel).queryByText('Endpoint')).not.toBeInTheDocument();
    const operacion = within(panel).getByText('Operación').nextElementSibling;
    expect(within(operacion).getByText('PUT')).toBeInTheDocument();
    expect(within(operacion).getByText('/api/v1/notas')).toBeInTheDocument();
    expect(within(panel).getByText('500')).toBeInTheDocument();
    expect(within(panel).getByText('Valor fuera de rango: se esperaba AD/A/B/C')).toBeInTheDocument();
    expect(within(panel).getByText(/IllegalArgumentException/)).toBeInTheDocument();
  });

  it('abre el detalle con un clic en cualquier parte de la fila', async () => {
    renderizarPagina();
    await esperarListado();

    const tabla = screen.getByRole('table');
    await userEvent.click(within(tabla).getByText('No se pudo almacenar el comprobante en el servidor'));

    expect(screen.getByRole('heading', { name: 'Detalle del error' })).toBeInTheDocument();
    expect(screen.getByText('ID 7')).toBeInTheDocument();
  });

  it('en un proceso automático la operación del detalle es «—»', async () => {
    renderizarPagina();
    await esperarListado();

    await userEvent.click(screen.getAllByRole('button', { name: /^Ver detalle: Proceso automático/ })[0]);

    const panel = screen.getByRole('dialog');
    const operacion = within(panel).getByText('Operación');
    expect(operacion.nextElementSibling).toHaveTextContent('—');
  });

  it('copia el detalle técnico al portapapeles y lo confirma', async () => {
    const usuario = userEvent.setup();
    const escribir = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    renderizarPagina();
    await esperarListado();

    await usuario.click(screen.getAllByRole('button', { name: /^Ver detalle: Excepción no controlada/ })[0]);
    await usuario.click(screen.getByRole('button', { name: 'Copiar detalle' }));

    expect(escribir).toHaveBeenCalledWith(expect.stringContaining('IllegalArgumentException'));
    expect(await screen.findByRole('button', { name: 'Detalle copiado' })).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByRole('status')).toHaveTextContent('Detalle copiado al portapapeles');
    escribir.mockRestore();
  });

  it('muestra la fecha sin año si es del año en curso y con año si es anterior', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2027-03-01T12:00:00-05:00') });
    try {
      renderizarPagina();
      await esperarListado();
      const tabla = screen.getByRole('table');
      expect(within(tabla).getByText('19/09/2026')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }

    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-11-12T12:00:00-05:00') });
    try {
      renderizarPagina();
      await waitFor(() => expect(screen.getAllByRole('table')).toHaveLength(2));
      const tabla = screen.getAllByRole('table')[1];
      expect(within(tabla).getByText('19/09')).toBeInTheDocument();
      expect(within(tabla).queryByText('19/09/2026')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Log de errores · coherencia con Usuarios y Auditorías', () => {
  it('muestra título y descripción de solo lectura, sin el rótulo repetido del breadcrumb', async () => {
    renderizarPagina();
    await esperarListado();

    expect(screen.getByRole('heading', { level: 1, name: 'Log de Errores del Sistema' })).toBeInTheDocument();
    expect(screen.queryByText(/Módulo de administración/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Consulta de solo lectura/)).toBeInTheDocument();
  });

  it('no muestra los filtros elegidos como chips; "Limpiar filtros" aparece solo con algún criterio y lo restablece todo', async () => {
    renderizarPagina();
    await esperarListado();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Módulo'), 'PAGOS');
    await userEvent.type(screen.getByLabelText('Buscar por mensaje, tipo de error o usuario'), 'zzz');
    expect(screen.queryByRole('list', { name: 'Filtros aplicados' })).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByLabelText('Módulo')).toHaveValue('TODOS');
    expect(screen.getByLabelText('Buscar por mensaje, tipo de error o usuario')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin resultados muestra solo el mensaje: el único "Limpiar filtros" es el de la barra del buscador', async () => {
    renderizarPagina();
    await esperarListado();

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2001-01-01' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2001-01-02' } });

    const mensaje = await screen.findByText('No se encontraron errores con los criterios indicados', {}, { timeout: 3000 });
    expect(screen.queryByText('Fecha: 01/01/2001 – 02/01/2001')).not.toBeInTheDocument();
    expect(within(mensaje.parentElement).queryByRole('button')).not.toBeInTheDocument();

    const botones = screen.getAllByRole('button', { name: 'Limpiar filtros' });
    expect(botones).toHaveLength(1);
    await userEvent.click(botones[0]);
    expect(await esperarListado()).toBeInTheDocument();
    expect(screen.getByLabelText('Desde')).toHaveValue('');
  });

  it('pone el buscador con "Actualizar" en la primera línea y las fechas antes que el módulo', async () => {
    renderizarPagina();
    await esperarListado();

    const buscador = screen.getByLabelText('Buscar por mensaje, tipo de error o usuario');
    const actualizar = screen.getByRole('button', { name: 'Actualizar' });
    const desde = screen.getByLabelText('Desde');
    const hasta = screen.getByLabelText('Hasta');
    const modulo = screen.getByLabelText('Módulo');
    const viene = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(viene(buscador, actualizar)).toBe(true);
    expect(viene(actualizar, desde)).toBe(true);
    expect(viene(desde, hasta)).toBe(true);
    expect(viene(hasta, modulo)).toBe(true);

    await userEvent.click(actualizar);
    expect(await esperarListado()).toBeInTheDocument();
  });

  it('con una sola página no muestra el paginador, solo el total', async () => {
    renderizarPagina();
    await esperarListado();
    await userEvent.selectOptions(screen.getByLabelText('Módulo'), 'AUTENTICACION');

    expect(await screen.findByText('1 – 2 de 2 errores')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('no muestra tarjetas de resumen', async () => {
    renderizarPagina();
    await esperarListado();

    expect(screen.queryByRole('list', { name: 'Resumen de errores' })).not.toBeInTheDocument();
  });

  it('usa módulo neutro; rojo para la excepción, azul para el correo y gris para el proceso automático', async () => {
    renderizarPagina();
    await esperarListado();

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

  it('muestra el usuario solo con su nombre, sin avatar de iniciales', async () => {
    renderizarPagina();
    await esperarListado();

    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    const filaSistema = filas.find((fila) => within(fila).queryByText('Sistema'));
    expect(filaSistema).toBeDefined();
    expect(within(filaSistema).queryByText('S')).not.toBeInTheDocument();
  });
});
