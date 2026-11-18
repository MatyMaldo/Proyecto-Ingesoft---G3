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
  within(screen.getByRole('navigation', { name: 'Paginación de matrículas' })).getByRole('status');

describe('Matrículas · listado, filtros y acciones', () => {
  it('pone en la cabecera el título y las acciones: acciones masivas (menú) y la acción principal', async () => {
    mostrar();
    await esperarTabla();

    const cabecera = screen.getByRole('banner');
    expect(within(cabecera).getByRole('heading', { name: 'Matrículas' })).toBeInTheDocument();
    expect(within(cabecera).getByRole('button', { name: 'Asignar alumno' })).toBeInTheDocument();
    expect(within(cabecera).getByRole('button', { name: 'Acciones masivas' })).toHaveAttribute('aria-haspopup', 'menu');
    // Ya no hay un botón suelto por cada acción masiva.
    expect(within(cabecera).queryByRole('button', { name: 'Emitir compromisos de matrícula' })).not.toBeInTheDocument();
    expect(within(cabecera).queryByRole('button', { name: 'Actualizar estados de matrícula' })).not.toBeInTheDocument();
  });

  it('ofrece las acciones masivas en el menú y abre su diálogo', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Acciones masivas' }));
    expect(screen.getByRole('menuitem', { name: 'Actualizar estados de matrícula' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Carga masiva de matrículas' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Emitir compromisos de matrícula' }));
    expect(screen.getByRole('dialog', { name: 'Emitir compromisos de matrícula' })).toBeInTheDocument();
  });

  it('previsualiza el archivo de matrículas con resumen, filtros y filas editables', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Acciones masivas' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Carga masiva de matrículas' }));
    const seleccion = screen.getByRole('dialog', { name: 'Carga masiva de matrículas' });

    await userEvent.selectOptions(
      within(seleccion).getByLabelText('Año académico destino'),
      '1'
    );
    await userEvent.upload(
      within(seleccion).getByLabelText(/Seleccionar archivo/i),
      new File(['DNI;Código;Año;Grado;Sección\n'], 'matriculas.csv', { type: 'text/csv' })
    );
    await userEvent.click(within(seleccion).getByRole('button', { name: 'Previsualizar' }));

    const preview = await screen.findByRole(
      'dialog',
      { name: 'Previsualizar carga masiva' },
      { timeout: 3000 }
    );
    expect(within(preview).getByText('filas en el archivo')).toBeInTheDocument();
    expect(within(preview).getByText('1 válida')).toBeInTheDocument();
    expect(within(preview).getByText('1 duplicada')).toBeInTheDocument();
    expect(within(preview).getByText('1 con error')).toBeInTheDocument();
    expect(within(preview).getByText('María López García')).toBeInTheDocument();
    expect(within(preview).getByText('Carlos Ramirez Soto')).toBeInTheDocument();
    // Las filas con problemas muestran el detalle del backend.
    expect(
      within(preview).getByText('La sección no pertenece al grado indicado.')
    ).toBeInTheDocument();
    // El archivo cargado se puede cambiar sin cerrar el diálogo.
    expect(within(preview).getByRole('button', { name: 'Cambiar archivo' })).toBeInTheDocument();
  });

  it('abre "Asignar alumno a sección" en un diálogo con los campos del formulario', async () => {
    mostrar();
    await esperarTabla();

    await userEvent.click(screen.getByRole('button', { name: 'Asignar alumno' }));
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
    // Con el período finalizado la insignia ya lo dice: no se repite en una frase, y el botón se habilita.
    expect(await within(dialogo).findByText('Finalizado')).toBeInTheDocument();
    expect(within(dialogo).queryByText(/El período de matrícula finalizó/)).not.toBeInTheDocument();
    expect(ejecutar).toBeEnabled();
  });

  it('muestra el listado con un solo paginador en el pie, y cada fila con su acción', async () => {
    mostrar();
    const tabla = await esperarTabla();

    expect(within(tabla).getAllByRole('row')).toHaveLength(6);
    expect(totalMostrado()).toHaveTextContent('1 – 5 de 5 matrículas');
    expect(screen.getAllByRole('navigation', { name: 'Paginación de matrículas' })).toHaveLength(1);
    // Con 5 matrículas ninguna opción de más filas (25, 50, 100) está disponible.
    expect(within(screen.getByRole('group', { name: 'Filas por página' })).getByRole('button', { name: '25' })).toBeDisabled();
    // El nombre accesible dice a qué estudiante afecta la acción.
    expect(within(tabla).getByRole('button', { name: 'Emitir compromiso de Mateo Herrera Campos' })).toBeInTheDocument();
    expect(within(tabla).getByRole('button', { name: 'Editar matrícula de Mateo Herrera Campos' })).toBeEnabled();
    expect(within(tabla).getByRole('button', { name: 'Eliminar matrícula de Mateo Herrera Campos' })).toBeEnabled();
    // Las matrículas que no están pendientes no tienen acción.
    expect(within(tabla).queryByRole('button', { name: /Isabella Flores Ruiz/ })).not.toBeInTheDocument();
  });

  it('abre el diálogo de edición con el año fijo y permite cancelar sin cambios', async () => {
    mostrar();
    const tabla = await esperarTabla();

    await userEvent.click(within(tabla).getByRole('button', { name: 'Editar matrícula de Mateo Herrera Campos' }));
    const dialogo = screen.getByRole('dialog', { name: 'Editar matrícula' });
    expect(within(dialogo).getByLabelText('Año académico')).toBeDisabled();
    // La sección actual viene preseleccionada: sin cambios no se puede guardar.
    expect(within(dialogo).getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('pide confirmación antes de eliminar una matrícula', async () => {
    mostrar();
    const tabla = await esperarTabla();

    await userEvent.click(within(tabla).getByRole('button', { name: 'Eliminar matrícula de Mateo Herrera Campos' }));
    const dialogo = screen.getByRole('dialog', { name: 'Eliminar matrícula' });
    expect(within(dialogo).getAllByText('Mateo Herrera Campos').length).toBeGreaterThan(0);
    expect(within(dialogo).getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
