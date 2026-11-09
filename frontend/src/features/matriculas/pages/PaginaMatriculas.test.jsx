import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaMatriculas from './PaginaMatriculas.jsx';

/** Muestra la página en una URL dada; `anio=todos` evita depender del año que se elige por defecto. */
function mostrar(url = '/matriculas?anio=todos') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <PaginaMatriculas />
    </MemoryRouter>
  );
}

const esperarTabla = () => screen.findByRole('table', {}, { timeout: 3000 });
const chipsEstado = () => screen.getByRole('group', { name: 'Filtrar matrículas por estado' });
const totalMostrado = () =>
  within(screen.getByRole('navigation', { name: 'Paginación de matrículas (superior)' })).getByRole('status');

describe('Matrículas · listado, filtros y acciones', () => {
  it('pone en la cabecera el título y las acciones: acciones masivas (menú) y la acción principal', async () => {
    mostrar();
    await esperarTabla();

    const cabecera = screen.getByRole('banner');
    expect(within(cabecera).getByRole('heading', { name: 'Matrículas' })).toBeInTheDocument();
    expect(within(cabecera).getByRole('button', { name: 'Asignar alumno a sección' })).toBeInTheDocument();
    expect(within(cabecera).getByRole('button', { name: 'Acciones masivas' })).toHaveAttribute('aria-haspopup', 'menu');
    // Ya no hay un botón suelto por cada acción masiva.
    expect(within(cabecera).queryByRole('button', { name: 'Emitir compromisos de matrícula' })).not.toBeInTheDocument();
    expect(within(cabecera).queryByRole('button', { name: 'Actualizar estados de matrícula' })).not.toBeInTheDocument();
  });

  it('ofrece las dos acciones masivas en el menú y abre su diálogo', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Acciones masivas' }));
    expect(screen.getByRole('menuitem', { name: 'Actualizar estados de matrícula' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Emitir compromisos de matrícula' }));
    expect(screen.getByRole('dialog', { name: 'Emitir compromisos de matrícula' })).toBeInTheDocument();
  });

  it('abre "Asignar alumno a sección" en un diálogo con los campos del formulario', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Asignar alumno a sección' }));
    const dialogo = screen.getByRole('dialog', { name: 'Asignar alumno a sección' });
    expect(within(dialogo).getByLabelText('Buscar alumno')).toBeInTheDocument();
    expect(within(dialogo).getByLabelText('Año académico')).toBeInTheDocument();
    expect(within(dialogo).getByLabelText('Grado académico')).toBeInTheDocument();
    // Sin alumno ni sección elegidos no se puede asignar.
    expect(within(dialogo).getByRole('button', { name: 'Asignar' })).toBeDisabled();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('"Actualizar estados" es una acción crítica: su botón de confirmar va en rojo y espera al período', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Acciones masivas' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Actualizar estados de matrícula' }));
    const dialogo = screen.getByRole('dialog', { name: 'Actualizar estados de matrícula' });
    const ejecutar = within(dialogo).getByRole('button', { name: 'Ejecutar actualización' });
    expect(ejecutar.className).toMatch(/botonPeligro/);
    expect(await within(dialogo).findByText(/El período de matrícula finalizó/)).toBeInTheDocument();
    expect(ejecutar).toBeEnabled();
  });

  it('muestra el listado con el total arriba, sin repetirlo abajo si cabe en una página, y cada fila con su acción', async () => {
    mostrar();
    const tabla = await esperarTabla();

    expect(within(tabla).getAllByRole('row')).toHaveLength(6);
    expect(totalMostrado()).toHaveTextContent('1 – 5 de 5 matrículas');
    expect(screen.queryByRole('navigation', { name: 'Paginación de matrículas (inferior)' })).not.toBeInTheDocument();
    // El nombre accesible dice a qué estudiante afecta la acción.
    expect(within(tabla).getByRole('button', { name: 'Emitir compromiso de Mateo Herrera Campos' })).toBeInTheDocument();
    // Las matrículas que no están pendientes no tienen acción.
    expect(within(tabla).queryByRole('button', { name: /Isabella Flores Ruiz/ })).not.toBeInTheDocument();
  });

  it('el estado se filtra con chips, y "Limpiar filtros" aparece solo con algún filtro y lo restablece', async () => {
    mostrar();
    await esperarTabla();
    expect(within(chipsEstado()).getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    await userEvent.click(within(chipsEstado()).getByRole('button', { name: /^Pendiente/ }));
    await vi.waitFor(() => expect(totalMostrado()).toHaveTextContent('1 – 3 de 3 matrículas'));
    expect(within(chipsEstado()).getByRole('button', { name: /^Pendiente/ })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    await vi.waitFor(() => expect(totalMostrado()).toHaveTextContent('1 – 5 de 5 matrículas'));
    expect(within(chipsEstado()).getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('los chips de estado muestran su cantidad según los filtros; al elegir uno, solo ese conserva el contador', async () => {
    mostrar();
    await esperarTabla();

    // Con "Todos", cada chip muestra su cantidad (el de "Todos" es el total).
    await vi.waitFor(() => expect(within(chipsEstado()).getByRole('button', { name: /^Todos\s*5$/ })).toBeInTheDocument());
    expect(within(chipsEstado()).getByRole('button', { name: /^Pendiente\s*3$/ })).toBeInTheDocument();
    expect(within(chipsEstado()).getByRole('button', { name: /^Confirmada\s*1$/ })).toBeInTheDocument();
    expect(within(chipsEstado()).getByRole('button', { name: /^Cancelada\s*1$/ })).toBeInTheDocument();

    // Al elegir "Pendiente", solo ese chip conserva su contador.
    await userEvent.click(within(chipsEstado()).getByRole('button', { name: /^Pendiente/ }));
    await vi.waitFor(() => expect(totalMostrado()).toHaveTextContent('1 – 3 de 3 matrículas'));
    expect(within(chipsEstado()).getByRole('button', { name: /^Pendiente\s*3$/ })).toBeInTheDocument();
    expect(within(chipsEstado()).getByRole('button', { name: /^Todos/ })).toBeInTheDocument();
    expect(within(chipsEstado()).getByRole('button', { name: /^Confirmada/ })).toBeInTheDocument();
  });

  it('los contadores de los chips siguen a la búsqueda', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.type(screen.getByLabelText('Buscar matrículas por nombre o código del estudiante'), 'mateo');
    await vi.waitFor(() => {
      expect(within(chipsEstado()).getByRole('button', { name: /^Todos\s*1$/ })).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(within(chipsEstado()).getByRole('button', { name: /^Pendiente\s*1$/ })).toBeInTheDocument();
    expect(within(chipsEstado()).getByRole('button', { name: /^Confirmada\s*0$/ })).toBeInTheDocument();
    expect(within(chipsEstado()).getByRole('button', { name: /^Cancelada\s*0$/ })).toBeInTheDocument();
  });

  it('los selectores de año, grado y sección usan el selector compartido; la sección espera a grado y año', async () => {
    mostrar();
    await esperarTabla();

    const filtros = screen.getByRole('region', { name: 'Búsqueda y filtros del listado de matrículas' });
    expect(within(filtros).getByLabelText('Año académico').tagName).toBe('SELECT');
    expect(within(filtros).getByLabelText('Grado').tagName).toBe('SELECT');
    expect(within(filtros).getByLabelText('Sección')).toBeDisabled();
    expect(within(filtros).getByText('Estado')).toBeInTheDocument();
  });

  it('busca por nombre o código del estudiante, con "Actualizar" a su costado y encima de los selectores', async () => {
    mostrar();
    await esperarTabla();

    const buscador = screen.getByLabelText('Buscar matrículas por nombre o código del estudiante');
    const actualizar = screen.getByRole('button', { name: 'Actualizar' });
    const selectorAnio = screen.getByLabelText('Año académico');
    const viene = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(viene(buscador, actualizar)).toBe(true);
    expect(viene(actualizar, selectorAnio)).toBe(true);

    await userEvent.type(buscador, 'mateo');
    await vi.waitFor(() => expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 matrícula'), { timeout: 3000 });
    expect(within(screen.getByRole('table')).getByText('Mateo Herrera Campos')).toBeInTheDocument();

    // "Limpiar filtros" también vacía la búsqueda.
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(buscador).toHaveValue('');
    await vi.waitFor(() => expect(totalMostrado()).toHaveTextContent('1 – 5 de 5 matrículas'), { timeout: 3000 });
  });

  it('recupera la búsqueda de la URL y "Actualizar" vuelve a pedir el listado con los mismos filtros', async () => {
    mostrar('/matriculas?anio=todos&q=mateo');
    await esperarTabla();
    expect(screen.getByLabelText('Buscar matrículas por nombre o código del estudiante')).toHaveValue('mateo');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 matrícula');

    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Actualizar' })).toBeEnabled(), { timeout: 3000 });
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 matrícula');
  });

  it('recupera el estado y la página de la URL y ignora valores inválidos', async () => {
    mostrar('/matriculas?anio=todos&estado=CANCELADA');
    await esperarTabla();
    expect(within(chipsEstado()).getByRole('button', { name: /^Cancelada/ })).toHaveAttribute('aria-pressed', 'true');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 matrícula');
  });

  it('ignora un estado inválido de la URL', async () => {
    mostrar('/matriculas?anio=todos&estado=RARO&pagina=abc');
    await esperarTabla();
    expect(within(chipsEstado()).getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');
    expect(totalMostrado()).toHaveTextContent('1 – 5 de 5 matrículas');
  });

  it('sin resultados muestra solo el mensaje: el único "Limpiar filtros" es el de la barra del buscador', async () => {
    mostrar('/matriculas?anio=todos&seccion=99');
    const mensaje = await screen.findByText('No se encontraron matrículas con los criterios indicados', {}, { timeout: 3000 });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(within(mensaje.parentElement).queryByRole('button')).not.toBeInTheDocument();

    const botones = screen.getAllByRole('button', { name: 'Limpiar filtros' });
    expect(botones).toHaveLength(1);
    await userEvent.click(botones[0]);
    await esperarTabla();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });
});
