import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaUsuarios from './PaginaUsuarios.jsx';

const ETIQUETA_BUSCADOR = 'Buscar usuarios por nombre, DNI o correo';

/** Región de estado del paginador superior, que es la que anuncia el total. */
function totalMostrado() {
  return within(screen.getByRole('navigation', { name: 'Paginación de usuarios (superior)' })).getByRole('status');
}

/** Pulsa un chip del grupo de estado ("Activos", "Desactivados" o "Todos"). */
async function elegirEstado(etiqueta) {
  const grupo = screen.getByRole('group', { name: 'Filtrar usuarios por estado' });
  await userEvent.click(within(grupo).getByRole('button', { name: new RegExp(`^${etiqueta}`) }));
}

function primeraFila() {
  return within(screen.getByRole('table')).getAllByRole('row')[1];
}

describe('Usuarios · listado, filtros y acciones', () => {
  afterEach(() => {
    delete window.matchMedia;
  });

  it('pone las acciones globales en la barra de título y la búsqueda con los filtros en su zona', () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    const titulo = screen.getByRole('banner');
    expect(within(titulo).getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    // Una sola acción global: el registro individual y la carga masiva viven en el mismo menú.
    expect(within(titulo).getByRole('button', { name: 'Agregar usuarios' })).toHaveAttribute('aria-haspopup', 'menu');
    expect(within(titulo).getAllByRole('button')).toHaveLength(1);

    const filtros = screen.getByRole('region', { name: 'Búsqueda y filtros de usuarios' });
    expect(within(filtros).getByLabelText(ETIQUETA_BUSCADOR)).toBeInTheDocument();
    // Cada grupo de chips lleva su subtítulo ("Rol" y "Estado") para no confundir los dos "Todos".
    expect(within(filtros).getByText('Rol')).toBeInTheDocument();
    expect(within(filtros).getByText('Estado')).toBeInTheDocument();
    // El total ya no va junto al buscador: lo muestra el paginador.
    expect(within(filtros).queryByText(/^\d+ usuarios?$/)).not.toBeInTheDocument();

    const chipsRol = within(filtros).getByRole('group', { name: 'Filtrar usuarios por rol' });
    for (const etiqueta of ['Todos', 'Apoderados', 'Docentes', 'Estudiantes']) {
      expect(within(chipsRol).getByRole('button', { name: new RegExp(`^${etiqueta}`) })).toBeInTheDocument();
    }
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');

    // El estado también son chips (con su conteo), en un grupo aparte del de rol.
    const chipsEstado = within(filtros).getByRole('group', { name: 'Filtrar usuarios por estado' });
    expect(within(chipsEstado).getAllByRole('button').map((boton) => boton.textContent.replace(/\d+$/, ''))).toEqual([
      'Todos',
      'Activos',
      'Desactivados'
    ]);
    expect(within(chipsEstado).getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');
    expect(within(filtros).queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('muestra el conteo en todos los chips de rol cuando no hay filtros', () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveTextContent('32');
    expect(within(chipsRol).getByRole('button', { name: /^Apoderados/ })).toHaveTextContent('10');
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('10');
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('12');
  });

  it('al elegir un rol, solo el chip seleccionado conserva su conteo', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });

    await userEvent.click(within(chipsRol).getByRole('button', { name: /^Estudiantes/ }));
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('12');
    expect(within(chipsRol).getByRole('button', { name: 'Todos' })).not.toHaveTextContent(/\d/);
    expect(within(chipsRol).getByRole('button', { name: 'Apoderados' })).not.toHaveTextContent(/\d/);
    expect(within(chipsRol).getByRole('button', { name: 'Docentes' })).not.toHaveTextContent(/\d/);

    // El conteo del seleccionado refleja los demás criterios: estudiantes desactivados.
    await elegirEstado('Desactivados');
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('2');
    expect(within(chipsRol).getByRole('button', { name: 'Docentes' })).not.toHaveTextContent(/\d/);

    // Al limpiar, vuelven los conteos de todos los chips.
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('10');
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveTextContent('32');
  });

  it('con solo el filtro de estado, cada chip de rol (y "Todos") muestra su cantidad con ese estado', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });

    await elegirEstado('Desactivados');
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveTextContent('4');
    expect(within(chipsRol).getByRole('button', { name: /^Apoderados/ })).toHaveTextContent('1');
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('1');
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('2');
  });

  it('con solo el texto de búsqueda, cada chip de rol muestra cuántos resultados daría', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveTextContent('1');
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('1');
    expect(within(chipsRol).getByRole('button', { name: /^Apoderados/ })).toHaveTextContent('0');
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('0');
  });

  it('con un rol elegido y otro filtro, solo ese chip muestra el resultado filtrado', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });

    await elegirEstado('Desactivados');
    await userEvent.click(within(chipsRol).getByRole('button', { name: /^Estudiantes/ }));
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('2');
    for (const etiqueta of ['Todos', 'Apoderados', 'Docentes']) {
      expect(within(chipsRol).getByRole('button', { name: etiqueta })).not.toHaveTextContent(/\d/);
    }

    // Volver a "Todos" restituye el conteo de cada chip con el estado vigente.
    await userEvent.click(within(chipsRol).getByRole('button', { name: 'Todos' }));
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('1');
  });

  it('muestra el total en el paginador superior, como región de estado, y lo actualiza al filtrar', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    expect(totalMostrado()).toHaveTextContent('1 – 10 de 32 usuarios');

    await userEvent.click(screen.getByRole('button', { name: /^Docentes/ }));
    expect(totalMostrado()).toHaveTextContent('1 – 10 de 10 usuarios');

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 usuario');
  });

  it('pone el mismo paginador arriba y abajo del listado, y solo el superior anuncia el total', () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    const superior = screen.getByRole('navigation', { name: 'Paginación de usuarios (superior)' });
    const inferior = screen.getByRole('navigation', { name: 'Paginación de usuarios (inferior)' });
    expect(superior).toHaveTextContent('1 – 10 de 32 usuarios');
    expect(inferior).toHaveTextContent('1 – 10 de 32 usuarios');
    expect(within(superior).getByRole('status')).toBeInTheDocument();
    expect(within(inferior).queryByRole('status')).not.toBeInTheDocument();
    expect(superior.compareDocumentPosition(screen.getByRole('table')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(inferior.compareDocumentPosition(screen.getByRole('table')) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it('filtra por rol y por texto sobre la tabla', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const tabla = screen.getByRole('table');

    await userEvent.click(screen.getByRole('button', { name: /^Docentes/ }));
    expect(screen.getByRole('button', { name: /^Docentes/ })).toHaveAttribute('aria-pressed', 'true');
    const filasDocentes = within(tabla).getAllByRole('row').slice(1);
    expect(filasDocentes.length).toBeGreaterThan(0);
    for (const fila of filasDocentes) {
      expect(within(fila).getByText('Docente')).toBeInTheDocument();
    }

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    expect(within(tabla).getAllByRole('row')).toHaveLength(2);
    expect(within(tabla).getByText('Jorge Herrera')).toBeInTheDocument();
  });

  it('filtra por estado desde los chips y lo combina con el de rol', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const tabla = screen.getByRole('table');

    await elegirEstado('Desactivados');
    expect(within(tabla).getAllByRole('row')).toHaveLength(5);
    expect(within(tabla).getAllByText('Desactivado')).toHaveLength(4);
    expect(totalMostrado()).toHaveTextContent('1 – 4 de 4 usuarios');

    await userEvent.click(screen.getByRole('button', { name: /^Docentes/ }));
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 usuario');
    expect(within(tabla).getByText('Carmen Delgado Ríos')).toBeInTheDocument();
  });

  it('busca también por correo electrónico', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge.herrera@');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 usuario');
    expect(within(screen.getByRole('table')).getByText('Jorge Herrera')).toBeInTheDocument();
  });

  it('ofrece "Limpiar filtros" solo cuando hay algún criterio activo y lo restablece todo', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^Docentes/ }));
    await elegirEstado('Activos');
    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    expect(screen.getByLabelText(ETIQUETA_BUSCADOR)).toHaveValue('');
    expect(within(screen.getByRole('group', { name: 'Filtrar usuarios por estado' })).getByRole('button', { name: /^Todos/ }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('group', { name: 'Filtrar usuarios por rol' })).getByRole('button', { name: /^Todos/ }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(totalMostrado()).toHaveTextContent('1 – 10 de 32 usuarios');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin resultados, el mensaje vacío no repite "Limpiar filtros": basta el botón junto al buscador', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'zzzz-no-existe');
    expect(screen.getByText('No se encontraron usuarios con los criterios indicados')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('ordena por defecto por apellido paterno, apellido materno y nombre (HU-SAT-02)', () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const tabla = screen.getByRole('table');

    expect(primeraFila()).toHaveTextContent('Lorena Acosta Ibarra');
    expect(within(tabla).getAllByRole('row')[2]).toHaveTextContent('Sebastián Acosta Pardo');
    expect(within(tabla).getByRole('columnheader', { name: /Nombre completo/ })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('ordena por nombre al revés y por estado desde los encabezados', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const tabla = screen.getByRole('table');

    await userEvent.click(within(tabla).getByRole('button', { name: /Nombre completo/ }));
    expect(within(tabla).getByRole('columnheader', { name: /Nombre completo/ })).toHaveAttribute('aria-sort', 'descending');
    expect(primeraFila()).toHaveTextContent('Héctor Villanueva Paz');

    await userEvent.click(within(tabla).getByRole('button', { name: /Estado/ }));
    expect(within(tabla).getByRole('columnheader', { name: /Estado/ })).toHaveAttribute('aria-sort', 'ascending');
    expect(primeraFila()).toHaveTextContent('Activo');

    await userEvent.click(within(tabla).getByRole('button', { name: /Estado/ }));
    expect(within(tabla).getByRole('columnheader', { name: /Estado/ })).toHaveAttribute('aria-sort', 'descending');
    expect(primeraFila()).toHaveTextContent('Camila Cárdenas Soto');
    expect(primeraFila()).toHaveTextContent('Desactivado');
  });

  it('abre el registro de un apoderado desde el menú "Agregar usuarios"', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    await userEvent.click(screen.getByRole('button', { name: 'Agregar usuarios' }));
    for (const rol of ['apoderado', 'estudiante', 'docente']) {
      expect(screen.getByRole('menuitem', { name: `Registrar ${rol}` })).toBeInTheDocument();
    }
    expect(screen.getByRole('menuitem', { name: 'Carga masiva (CSV)' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Registrar apoderado' }));
    expect(screen.getByRole('dialog', { name: 'Registrar apoderado' })).toBeInTheDocument();
  });

  it('abre la carga masiva desde el mismo menú "Agregar usuarios", en cualquier tamaño de pantalla', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    await userEvent.click(screen.getByRole('button', { name: 'Agregar usuarios' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Carga masiva (CSV)' }));
    expect(screen.getByRole('dialog', { name: 'Carga masiva de usuarios' })).toBeInTheDocument();
  });

  it('cierra el formulario con el botón Cerrar y con Escape', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    await userEvent.click(screen.getByRole('button', { name: 'Agregar usuarios' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Registrar docente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Agregar usuarios' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Registrar docente' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el formulario de registro no tiene campos de contraseña', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    await userEvent.click(screen.getByRole('button', { name: 'Agregar usuarios' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Registrar apoderado' }));

    const dialogo = screen.getByRole('dialog', { name: 'Registrar apoderado' });
    expect(dialogo.querySelectorAll('input[type="password"]')).toHaveLength(0);
    expect(within(dialogo).queryByRole('button', { name: /mostrar contraseña/i })).not.toBeInTheDocument();
  });

  it('pone el buscador en su fila y, debajo, los chips de rol y de estado en una misma fila, cada grupo con su subtítulo', () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    const seccion = screen.getByLabelText(ETIQUETA_BUSCADOR).closest('section');
    const [filaBusqueda, filaChips] = seccion.children;
    expect(within(filaBusqueda).getByLabelText(ETIQUETA_BUSCADOR)).toBeInTheDocument();
    expect(within(filaBusqueda).queryByRole('group')).not.toBeInTheDocument();

    const grupoRol = within(filaChips).getByRole('group', { name: 'Filtrar usuarios por rol' });
    const grupoEstado = within(filaChips).getByRole('group', { name: 'Filtrar usuarios por estado' });
    expect(within(grupoRol.parentElement).getByText('Rol')).toBeInTheDocument();
    expect(within(grupoEstado.parentElement).getByText('Estado')).toBeInTheDocument();
  });

  it('marca el estado elegido en sus chips (con su conteo) y se quita con "Limpiar filtros"', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const chipsEstado = screen.getByRole('group', { name: 'Filtrar usuarios por estado' });
    // Sin estado elegido, los tres chips muestran su cantidad.
    expect(within(chipsEstado).getByRole('button', { name: /^Todos/ })).toHaveTextContent('32');
    expect(within(chipsEstado).getByRole('button', { name: /^Activos/ })).toHaveTextContent('28');
    expect(within(chipsEstado).getByRole('button', { name: /^Desactivados/ })).toHaveTextContent('4');

    await elegirEstado('Desactivados');
    expect(within(chipsEstado).getByRole('button', { name: /^Desactivados/ })).toHaveAttribute('aria-pressed', 'true');
    // Con un estado elegido solo ese chip muestra la cantidad.
    expect(within(chipsEstado).getByRole('button', { name: /^Activos/ })).not.toHaveTextContent(/\d/);
    // Ya no hay un segundo chip "Estado: …" repetido debajo.
    expect(screen.queryByRole('list', { name: 'Filtros aplicados' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(within(chipsEstado).getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('guarda búsqueda, filtros y página en la URL y los recupera al volver a la pantalla', async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/usuarios?rol=Docente&estado=activo&q=jorge']}>
        <PaginaUsuarios />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(ETIQUETA_BUSCADOR)).toHaveValue('jorge');
    expect(screen.getByRole('button', { name: /^Docentes/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Activos/ })).toHaveAttribute('aria-pressed', 'true');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 usuario');
    unmount();
  });

  it('ignora valores de filtro inválidos de la URL', () => {
    render(
      <MemoryRouter initialEntries={['/usuarios?rol=Inventado&estado=raro&pagina=abc']}>
        <PaginaUsuarios />
      </MemoryRouter>
    );
    expect(within(screen.getByRole('group', { name: 'Filtrar usuarios por rol' })).getByRole('button', { name: /^Todos/ }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('group', { name: 'Filtrar usuarios por estado' })).getByRole('button', { name: /^Todos/ }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(totalMostrado()).toHaveTextContent('1 – 10 de 32 usuarios');
  });

  it('"Limpiar filtros" va junto al buscador y solo aparece con algún criterio activo', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const filaBusqueda = screen.getByLabelText(ETIQUETA_BUSCADOR).closest('section').firstElementChild;
    expect(within(filaBusqueda).queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    expect(within(filaBusqueda).getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();
  });

  it('con rol y estado elegidos, el total sale en el chip del rol y en el paginador, pero no se repite en el del estado', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });
    const chipsEstado = screen.getByRole('group', { name: 'Filtrar usuarios por estado' });

    // Solo el estado: el total sale en su chip (y en el paginador).
    await elegirEstado('Desactivados');
    expect(within(chipsEstado).getByRole('button', { name: /^Desactivados/ })).toHaveTextContent('4');

    // Rol y estado: el número se queda en el chip del rol y en el paginador.
    await userEvent.click(within(chipsRol).getByRole('button', { name: /^Estudiantes/ }));
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('2');
    expect(within(chipsEstado).getByRole('button', { name: /^Desactivados/ })).not.toHaveTextContent(/\d/);
    expect(totalMostrado()).toHaveTextContent('1 – 2 de 2 usuarios');
  });

  it('con solo texto de búsqueda ofrece "Limpiar filtros" sin chip de filtro', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Filtros aplicados' })).not.toBeInTheDocument();
  });
});
