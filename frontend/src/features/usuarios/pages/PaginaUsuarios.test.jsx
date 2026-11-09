import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaUsuarios from './PaginaUsuarios.jsx';

const ETIQUETA_BUSCADOR = 'Buscar usuarios por nombre, DNI o correo';

/** Región de estado del paginador superior, que es la que anuncia el total. */
function totalMostrado() {
  return within(screen.getByRole('navigation', { name: 'Paginación de usuarios (superior)' })).getByRole('status');
}

function primeraFila() {
  return within(screen.getByRole('table')).getAllByRole('row')[1];
}

describe('Usuarios · listado, filtros y acciones', () => {
  afterEach(() => {
    delete window.matchMedia;
  });

  it('pone las acciones globales en la barra de título y la búsqueda con los filtros en su zona', () => {
    render(<PaginaUsuarios />);

    const titulo = screen.getByRole('banner');
    expect(within(titulo).getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    expect(within(titulo).getByRole('button', { name: 'Carga masiva CSV' })).toBeInTheDocument();
    expect(within(titulo).getByRole('button', { name: 'Nuevo usuario' })).toHaveAttribute('aria-haspopup', 'menu');

    const filtros = screen.getByRole('region', { name: 'Búsqueda y filtros de usuarios' });
    expect(within(filtros).getByLabelText(ETIQUETA_BUSCADOR)).toBeInTheDocument();
    // No hay rótulo "Rol": los chips se explican solos y el grupo ya tiene nombre accesible.
    expect(within(filtros).queryByText('Rol')).not.toBeInTheDocument();
    // El total ya no va junto al buscador: lo muestra el paginador.
    expect(within(filtros).queryByText(/^\d+ usuarios?$/)).not.toBeInTheDocument();

    const chipsRol = within(filtros).getByRole('group', { name: 'Filtrar usuarios por rol' });
    for (const etiqueta of ['Todos', 'Apoderados', 'Docentes', 'Estudiantes']) {
      expect(within(chipsRol).getByRole('button', { name: new RegExp(`^${etiqueta}`) })).toBeInTheDocument();
    }
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');

    // El estado es un selector desplegable, no una segunda fila de chips.
    const selectEstado = within(filtros).getByLabelText('Estado');
    expect(selectEstado.tagName).toBe('SELECT');
    expect(within(selectEstado).getAllByRole('option').map((opcion) => opcion.textContent)).toEqual([
      'Cualquier estado',
      'Activos',
      'Desactivados'
    ]);
    expect(within(filtros).queryByRole('group', { name: 'Filtrar usuarios por estado' })).not.toBeInTheDocument();
  });

  it('muestra el conteo en todos los chips de rol cuando no hay filtros', () => {
    render(<PaginaUsuarios />);

    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveTextContent('32');
    expect(within(chipsRol).getByRole('button', { name: /^Apoderados/ })).toHaveTextContent('10');
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('10');
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('12');
  });

  it('al elegir un rol, solo el chip seleccionado conserva su conteo', async () => {
    render(<PaginaUsuarios />);
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });

    await userEvent.click(within(chipsRol).getByRole('button', { name: /^Estudiantes/ }));
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('12');
    expect(within(chipsRol).getByRole('button', { name: 'Todos' })).not.toHaveTextContent(/\d/);
    expect(within(chipsRol).getByRole('button', { name: 'Apoderados' })).not.toHaveTextContent(/\d/);
    expect(within(chipsRol).getByRole('button', { name: 'Docentes' })).not.toHaveTextContent(/\d/);

    // El conteo del seleccionado refleja los demás criterios: estudiantes desactivados.
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'inactivo');
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('2');
    expect(within(chipsRol).getByRole('button', { name: 'Docentes' })).not.toHaveTextContent(/\d/);

    // Al limpiar, vuelven los conteos de todos los chips.
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('10');
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveTextContent('32');
  });

  it('con solo el filtro de estado, cada chip de rol (y "Todos") muestra su cantidad con ese estado', async () => {
    render(<PaginaUsuarios />);
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'inactivo');
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveTextContent('4');
    expect(within(chipsRol).getByRole('button', { name: /^Apoderados/ })).toHaveTextContent('1');
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('1');
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('2');
  });

  it('con solo el texto de búsqueda, cada chip de rol muestra cuántos resultados daría', async () => {
    render(<PaginaUsuarios />);
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    expect(within(chipsRol).getByRole('button', { name: /^Todos/ })).toHaveTextContent('1');
    expect(within(chipsRol).getByRole('button', { name: /^Docentes/ })).toHaveTextContent('1');
    expect(within(chipsRol).getByRole('button', { name: /^Apoderados/ })).toHaveTextContent('0');
    expect(within(chipsRol).getByRole('button', { name: /^Estudiantes/ })).toHaveTextContent('0');
  });

  it('con un rol elegido y otro filtro, solo ese chip muestra el resultado filtrado', async () => {
    render(<PaginaUsuarios />);
    const chipsRol = screen.getByRole('group', { name: 'Filtrar usuarios por rol' });

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'inactivo');
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
    render(<PaginaUsuarios />);
    expect(totalMostrado()).toHaveTextContent('1 – 15 de 32 usuarios');

    await userEvent.click(screen.getByRole('button', { name: /^Docentes/ }));
    expect(totalMostrado()).toHaveTextContent('1 – 10 de 10 usuarios');

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 usuario');
  });

  it('pone el mismo paginador arriba y abajo del listado, y solo el superior anuncia el total', () => {
    render(<PaginaUsuarios />);

    const superior = screen.getByRole('navigation', { name: 'Paginación de usuarios (superior)' });
    const inferior = screen.getByRole('navigation', { name: 'Paginación de usuarios (inferior)' });
    expect(superior).toHaveTextContent('1 – 15 de 32 usuarios');
    expect(inferior).toHaveTextContent('1 – 15 de 32 usuarios');
    expect(within(superior).getByRole('status')).toBeInTheDocument();
    expect(within(inferior).queryByRole('status')).not.toBeInTheDocument();
    expect(superior.compareDocumentPosition(screen.getByRole('table')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(inferior.compareDocumentPosition(screen.getByRole('table')) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it('filtra por rol y por texto sobre la tabla', async () => {
    render(<PaginaUsuarios />);
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

  it('filtra por estado desde el selector y lo combina con el de rol', async () => {
    render(<PaginaUsuarios />);
    const tabla = screen.getByRole('table');

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'inactivo');
    expect(within(tabla).getAllByRole('row')).toHaveLength(5);
    expect(within(tabla).getAllByText('Desactivado')).toHaveLength(4);
    expect(totalMostrado()).toHaveTextContent('1 – 4 de 4 usuarios');

    await userEvent.click(screen.getByRole('button', { name: /^Docentes/ }));
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 usuario');
    expect(within(tabla).getByText('Carmen Delgado Ríos')).toBeInTheDocument();
  });

  it('busca también por correo electrónico', async () => {
    render(<PaginaUsuarios />);

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge.herrera@');
    expect(totalMostrado()).toHaveTextContent('1 – 1 de 1 usuario');
    expect(within(screen.getByRole('table')).getByText('Jorge Herrera')).toBeInTheDocument();
  });

  it('ofrece "Limpiar filtros" solo cuando hay algún criterio activo y lo restablece todo', async () => {
    render(<PaginaUsuarios />);
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^Docentes/ }));
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'activo');
    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    expect(screen.getByLabelText(ETIQUETA_BUSCADOR)).toHaveValue('');
    expect(screen.getByLabelText('Estado')).toHaveValue('Todos');
    expect(screen.getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'true');
    expect(totalMostrado()).toHaveTextContent('1 – 15 de 32 usuarios');
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('en el mensaje vacío ofrece "Limpiar filtros" para volver al listado', async () => {
    render(<PaginaUsuarios />);

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'zzzz-no-existe');
    expect(screen.getByText('No se encontraron usuarios.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    const botones = screen.getAllByRole('button', { name: 'Limpiar filtros' });
    await userEvent.click(botones[botones.length - 1]);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('ordena por defecto por apellido paterno, apellido materno y nombre (HU-SAT-02)', () => {
    render(<PaginaUsuarios />);
    const tabla = screen.getByRole('table');

    expect(primeraFila()).toHaveTextContent('Lorena Acosta Ibarra');
    expect(within(tabla).getAllByRole('row')[2]).toHaveTextContent('Sebastián Acosta Pardo');
    expect(within(tabla).getByRole('columnheader', { name: /Nombre completo/ })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('ordena por nombre al revés y por estado desde los encabezados', async () => {
    render(<PaginaUsuarios />);
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

  it('abre el registro de un apoderado desde el menú "Nuevo usuario"', async () => {
    render(<PaginaUsuarios />);

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    for (const rol of ['apoderado', 'estudiante', 'docente']) {
      expect(screen.getByRole('menuitem', { name: `Registrar ${rol}` })).toBeInTheDocument();
    }
    expect(screen.queryByRole('menuitem', { name: 'Carga masiva CSV' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Registrar apoderado' }));
    expect(screen.getByRole('dialog', { name: 'Registrar apoderado' })).toBeInTheDocument();
  });

  it('en pantallas pequeñas mueve "Carga masiva CSV" al menú "Nuevo usuario"', async () => {
    window.matchMedia = vi.fn().mockImplementation((consulta) => ({
      matches: true,
      media: consulta,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    render(<PaginaUsuarios />);

    expect(within(screen.getByRole('banner')).queryByRole('button', { name: 'Carga masiva CSV' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Carga masiva CSV' }));
    expect(screen.getByRole('dialog', { name: 'Carga masiva de usuarios' })).toBeInTheDocument();
  });

  it('cierra el formulario con el botón Cerrar y con Escape', async () => {
    render(<PaginaUsuarios />);

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Registrar docente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Registrar docente' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el formulario de registro no tiene campos de contraseña', async () => {
    render(<PaginaUsuarios />);

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Registrar apoderado' }));

    const dialogo = screen.getByRole('dialog', { name: 'Registrar apoderado' });
    expect(dialogo.querySelectorAll('input[type="password"]')).toHaveLength(0);
    expect(within(dialogo).queryByRole('button', { name: /mostrar contraseña/i })).not.toBeInTheDocument();
  });

  it('pone el buscador, los chips de rol y el estado en la misma fila de filtros', () => {
    render(<PaginaUsuarios />);

    const fila = screen.getByLabelText(ETIQUETA_BUSCADOR).closest('section').firstElementChild;
    expect(within(fila).getByLabelText(ETIQUETA_BUSCADOR)).toBeInTheDocument();
    expect(within(fila).getByRole('group', { name: 'Filtrar usuarios por rol' })).toBeInTheDocument();
    expect(within(fila).getByLabelText('Estado')).toBeInTheDocument();
  });

  it('muestra el estado elegido como filtro aplicado (igual que Auditorías) y permite quitarlo', async () => {
    render(<PaginaUsuarios />);
    expect(screen.queryByRole('list', { name: 'Filtros aplicados' })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'inactivo');
    const aplicados = screen.getByRole('list', { name: 'Filtros aplicados' });
    expect(within(aplicados).getByText('Estado: Desactivados')).toBeInTheDocument();

    await userEvent.click(within(aplicados).getByRole('button', { name: 'Quitar filtro Estado: Desactivados' }));
    expect(screen.getByLabelText('Estado')).toHaveValue('Todos');
    expect(screen.queryByRole('list', { name: 'Filtros aplicados' })).not.toBeInTheDocument();
  });

  it('con solo texto de búsqueda ofrece "Limpiar filtros" sin chip de filtro', async () => {
    render(<PaginaUsuarios />);

    await userEvent.type(screen.getByLabelText(ETIQUETA_BUSCADOR), 'jorge');
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Filtros aplicados' })).not.toBeInTheDocument();
  });
});
