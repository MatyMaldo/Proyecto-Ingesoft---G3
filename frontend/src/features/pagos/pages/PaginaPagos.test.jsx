import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaPagos from './PaginaPagos.jsx';

function mostrar(url = '/pagos') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <PaginaPagos />
    </MemoryRouter>
  );
}

const esperarTabla = () => screen.findByRole('table', {}, { timeout: 3000 });
const chipsMatricula = () => screen.getByRole('group', { name: 'Filtrar alumnos por estado de la matrícula' });
const totalMostrado = () =>
  within(screen.getByRole('navigation', { name: 'Paginación de alumnos (superior)' })).getByRole('status');

describe('Pagos · listado de alumnos, filtros y acciones', () => {
  it('pone en la cabecera el título y la acción global, sin sobretítulo', async () => {
    mostrar();
    await esperarTabla();

    const cabecera = screen.getByRole('banner');
    expect(within(cabecera).getByRole('heading', { name: 'Pagos' })).toBeInTheDocument();
    expect(within(cabecera).getByRole('button', { name: 'Emitir compromisos de pensión' })).toBeEnabled();
    expect(within(cabecera).queryByText('Módulo de pagos')).not.toBeInTheDocument();
  });

  it('usa los filtros compartidos: selectores, buscador y chips de la matrícula con su subtítulo', async () => {
    mostrar();
    await esperarTabla();

    const filtros = screen.getByRole('region', { name: 'Búsqueda y filtros de pagos' });
    expect(within(filtros).getByLabelText('Año académico').tagName).toBe('SELECT');
    expect(within(filtros).getByLabelText('Grado').tagName).toBe('SELECT');
    expect(within(filtros).getByLabelText('Sección')).toBeDisabled();
    expect(within(filtros).getByLabelText('Buscar alumnos por nombre o código')).toBeInTheDocument();
    expect(within(filtros).getByText('Matrícula')).toBeInTheDocument();
    expect(within(chipsMatricula()).getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('pagina de 10 en 10 con el total arriba y abajo', async () => {
    mostrar();
    const tabla = await esperarTabla();

    expect(within(tabla).getAllByRole('row')).toHaveLength(11);
    expect(totalMostrado()).toHaveTextContent('1 – 10 de 14 alumnos');
    expect(screen.getByRole('navigation', { name: 'Paginación de alumnos (inferior)' })).toBeInTheDocument();

    await userEvent.click(within(screen.getByRole('navigation', { name: 'Paginación de alumnos (inferior)' }))
      .getByRole('button', { name: /siguiente/i }));
    expect(within(tabla).getAllByRole('row')).toHaveLength(5);
    expect(totalMostrado()).toHaveTextContent('11 – 14 de 14 alumnos');
  });

  it('filtra por el estado de la matrícula con chips que muestran su cantidad', async () => {
    mostrar();
    await esperarTabla();

    expect(within(chipsMatricula()).getByRole('button', { name: /^Confirmada/ })).toHaveTextContent('10');
    expect(within(chipsMatricula()).getByRole('button', { name: /^Pendiente/ })).toHaveTextContent('4');

    await userEvent.click(within(chipsMatricula()).getByRole('button', { name: /^Pendiente/ }));
    expect(totalMostrado()).toHaveTextContent('1 – 4 de 4 alumnos');
    // Con uno elegido, solo ese chip muestra la cantidad.
    expect(within(chipsMatricula()).getByRole('button', { name: /^Confirmada/ })).not.toHaveTextContent(/\d/);
  });

  it('busca por nombre o código y "Limpiar filtros" aparece solo con algún criterio y lo restablece', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.type(screen.getByLabelText('Buscar alumnos por nombre o código'), 'isabella');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 alumno');
    expect(within(screen.getByRole('table')).getByText('Isabella Flores Ruiz')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(totalMostrado()).toHaveTextContent('1 – 10 de 14 alumnos');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin resultados muestra el mensaje de los demás módulos, sin repetir "Limpiar filtros"', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.type(screen.getByLabelText('Buscar alumnos por nombre o código'), 'zzzz-no-existe');
    expect(screen.getByText('No se encontraron alumnos con los criterios indicados')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Limpiar filtros' })).toHaveLength(1);
  });

  it('recupera búsqueda y estado de la matrícula de la URL, e ignora valores inválidos', async () => {
    mostrar('/pagos?q=isabella&matricula=CONFIRMADA&pagina=abc');
    await esperarTabla();
    expect(screen.getByLabelText('Buscar alumnos por nombre o código')).toHaveValue('isabella');
    expect(within(chipsMatricula()).getByRole('button', { name: /^Confirmada/ })).toHaveAttribute('aria-pressed', 'true');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 alumno');
  });

  it('cada fila nombra al alumno en sus acciones; la pensión espera a la matrícula confirmada', async () => {
    mostrar();
    const tabla = await esperarTabla();

    expect(within(tabla).getByRole('button', { name: 'Emitir compromiso de pensión de Mateo Herrera Campos' })).toBeEnabled();
    expect(within(tabla).getByRole('button', { name: 'Ver compromisos y pagos de Mateo Herrera Campos' })).toBeInTheDocument();
    // Lucas Torres Vega tiene la matrícula pendiente: no se emite su pensión y el motivo se lee, no solo se ve.
    const pendiente = within(tabla).getByRole('button', { name: 'Emitir compromiso de pensión de Lucas Torres Vega' });
    expect(pendiente).toBeDisabled();
    expect(pendiente).toHaveAccessibleDescription('La pensión estará disponible cuando la matrícula esté confirmada.');
  });

  it('emite el compromiso de pensión de un alumno desde un diálogo y avisa con la notificación', async () => {
    mostrar();
    const tabla = await esperarTabla();

    await userEvent.click(within(tabla).getByRole('button', { name: 'Emitir compromiso de pensión de Mateo Herrera Campos' }));
    const dialogo = screen.getByRole('dialog', { name: 'Emitir compromiso de pensión' });
    const emitir = within(dialogo).getByRole('button', { name: 'Emitir compromiso' });
    expect(emitir).toBeDisabled();

    await userEvent.selectOptions(within(dialogo).getByLabelText('Mes'), 'MARZO');
    expect(emitir).toBeEnabled();
    await userEvent.click(emitir);

    expect(await screen.findByText('Se emitió el compromiso de pensión de MARZO.', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Emitir compromiso de pensión' })).not.toBeInTheDocument();
  });

  it('abre la emisión masiva de pensiones en un diálogo', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Emitir compromisos de pensión' }));
    const dialogo = screen.getByRole('dialog', { name: 'Emitir compromisos de pensión' });
    expect(within(dialogo).getByLabelText('Año académico')).toBeInTheDocument();
    expect(within(dialogo).getByLabelText('Mes')).toBeInTheDocument();
    // Hay dos "Cerrar": la X del encabezado y el botón del pie; se usa el del pie.
    await userEvent.click(within(dialogo).getAllByRole('button', { name: 'Cerrar' }).at(-1));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra los compromisos y pagos de un alumno y pide el motivo para rechazar un pago', async () => {
    mostrar();
    const tabla = await esperarTabla();

    await userEvent.click(within(tabla).getByRole('button', { name: 'Ver compromisos y pagos de Mateo Herrera Campos' }));
    const dialogo = screen.getByRole('dialog', { name: 'Mateo Herrera Campos' });
    expect(await within(dialogo).findByText('Compromiso #502', {}, { timeout: 3000 })).toBeInTheDocument();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Rechazar pago #9002' }));
    const rechazo = screen.getByRole('dialog', { name: 'Rechazar pago #9002' });
    const confirmar = within(rechazo).getByRole('button', { name: 'Rechazar pago' });
    // Acción crítica: el botón de confirmar va en rojo.
    expect(confirmar.className).toMatch(/botonPeligro/);

    await userEvent.click(confirmar);
    expect(within(rechazo).getByText('Escribe el motivo del rechazo.')).toBeInTheDocument();
  });
});
