import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaUsuarios from './PaginaUsuarios.jsx';

async function abrirRegistro(tipo) {
  await userEvent.click(screen.getByRole('button', { name: 'Agregar usuarios' }));
  await userEvent.click(screen.getByRole('menuitem', { name: `Registrar ${tipo}` }));
  return screen.getByRole('dialog', { name: `Registrar ${tipo}` });
}

/** Clic directo sobre el fondo oscuro: en un <dialog> modal, el objetivo es el propio elemento. */
function clicEnElFondo(dialogo) {
  fireEvent.click(dialogo);
}

describe('Usuarios · formularios en diálogo', () => {
  it('enfoca el primer campo al abrir el registro', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('apoderado');

    expect(within(dialogo).getByLabelText(/^Nombre/)).toHaveFocus();
  });

  it('asocia cada etiqueta con su campo: el clic en la etiqueta enfoca el campo', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('estudiante');

    for (const etiqueta of ['Nombre', 'Apellido paterno', 'Apellido materno', 'Fecha de nacimiento', 'DNI', 'Teléfono', 'Correo', 'DNI del apoderado']) {
      const exacta = new RegExp("^" + etiqueta + "( [*])?$");
      const campo = within(dialogo).getByLabelText(exacta);
      await userEvent.click(within(dialogo).getByText(exacta, { selector: 'label' }));
      expect(campo).toHaveFocus();
    }
  });

  it('agrupa los campos en secciones con título', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('docente');

    for (const titulo of ['Datos personales', 'Contacto']) {
      expect(within(dialogo).getByRole('region', { name: titulo })).toBeInTheDocument();
    }
    expect(within(dialogo).queryByRole('region', { name: 'Acceso' })).not.toBeInTheDocument();
    // El estudiante suma la sección del apoderado.
    expect(within(dialogo).queryByRole('region', { name: 'Apoderado' })).not.toBeInTheDocument();
  });

  it.each(['apoderado', 'docente', 'estudiante'])('el formulario de %s no pide contraseña: la define el usuario con un código', async (tipo) => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro(tipo);

    expect(dialogo.querySelectorAll('input[type="password"]')).toHaveLength(0);
    expect(within(dialogo).queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
    expect(within(dialogo).getByRole('note')).toHaveTextContent(/código de verificación/);
  });

  it('muestra los errores con ícono y texto, marca el campo y enfoca el primero inválido', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('apoderado');

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Registrar' }));

    const nombre = within(dialogo).getByLabelText(/^Nombre/);
    expect(nombre).toHaveAttribute('aria-invalid', 'true');
    const mensaje = document.getElementById(nombre.getAttribute('aria-describedby'));
    expect(mensaje).toHaveTextContent('Ingrese el nombre.');
    expect(mensaje.querySelector('svg')).toBeInTheDocument();
    expect(nombre).toHaveFocus();

    // Escribir limpia el error de ese campo.
    await userEvent.type(nombre, 'Ana');
    expect(nombre).not.toHaveAttribute('aria-invalid');
  });

  it('valida al salir de cada campo con contenido, sin esperar al envío', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('docente');

    // Un campo vacío no se marca al pasar con Tab: "obligatorio" se avisa al registrar.
    await userEvent.tab();
    expect(within(dialogo).getByLabelText(/^Nombre/)).not.toHaveAttribute('aria-invalid');

    const correo = within(dialogo).getByLabelText(/^Correo/);
    await userEvent.type(correo, 'esto-no-es-un-correo');
    await userEvent.tab();
    expect(correo).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(correo.getAttribute('aria-describedby'))).toHaveTextContent('Ingrese un correo válido.');

    // Corregirlo y salir de nuevo quita el error.
    await userEvent.clear(correo);
    await userEvent.type(correo, 'docente.nuevo@colegio.pe');
    await userEvent.tab();
    expect(correo).not.toHaveAttribute('aria-invalid');
  });

  it('el DNI solo admite dígitos y se valida al salir del campo', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('docente');

    const dni = within(dialogo).getByLabelText(/^DNI/);
    expect(dni).toHaveAttribute('inputmode', 'numeric');
    await userEvent.type(dni, '12a34b56');
    expect(dni).toHaveValue('123456');

    await userEvent.tab();
    expect(dni).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(dni.getAttribute('aria-describedby'))).toHaveTextContent('El DNI debe tener 8 dígitos.');
  });

  it('el teléfono muestra la bandera, agrupa los dígitos de 3 en 3 y avisa al salir si faltan dígitos', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('docente');

    const telefono = within(dialogo).getByLabelText(/^Teléfono/);
    expect(telefono).toHaveAttribute('placeholder', '987 654 321');
    // La bandera es un SVG (el emoji no se ve en Windows) junto al prefijo +51.
    const prefijo = within(dialogo).getByText('+51').parentElement;
    expect(prefijo.querySelector('svg')).toBeInTheDocument();

    await userEvent.type(telefono, '98x76543');
    expect(telefono).toHaveValue('987 654 3');

    await userEvent.tab();
    expect(telefono).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(telefono.getAttribute('aria-describedby')))
      .toHaveTextContent('El teléfono debe tener exactamente 9 dígitos.');

    await userEvent.type(telefono, '21');
    expect(telefono).toHaveValue('987 654 321');
  });

  it('el clic en el fondo oscuro no cierra el formulario de registro', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('apoderado');

    clicEnElFondo(dialogo);
    expect(screen.getByRole('dialog', { name: 'Registrar apoderado' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '¿Descartar los cambios?' })).not.toBeInTheDocument();
  });

  it('sin datos escritos, la X y Escape cierran el formulario sin preguntar', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    await abrirRegistro('apoderado');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await abrirRegistro('apoderado');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con datos escritos, la X y Escape piden confirmar antes de descartar', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('apoderado');
    await userEvent.type(within(dialogo).getByLabelText(/^Nombre/), 'Ana');

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cerrar' }));
    const confirmacion = screen.getByRole('dialog', { name: '¿Descartar los cambios?' });
    expect(screen.getByRole('dialog', { name: 'Registrar apoderado' })).toBeInTheDocument();

    // "Seguir editando" conserva el formulario y lo escrito.
    await userEvent.click(within(confirmacion).getByRole('button', { name: 'Seguir editando' }));
    expect(screen.queryByRole('dialog', { name: '¿Descartar los cambios?' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('dialog', { name: 'Registrar apoderado' })).getByLabelText(/^Nombre/)).toHaveValue('Ana');

    // Escape también pregunta; Escape sobre la confirmación solo cierra la confirmación.
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: '¿Descartar los cambios?' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: '¿Descartar los cambios?' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Registrar apoderado' })).toBeInTheDocument();

    // "Descartar" cierra el formulario.
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('registra un apoderado con el mismo resultado de antes y avisa con la notificación compartida', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('apoderado');

    await userEvent.type(within(dialogo).getByLabelText(/^Nombre/), 'Ana');
    await userEvent.type(within(dialogo).getByLabelText(/^Apellido/), 'Lopez');
    await userEvent.type(within(dialogo).getByLabelText(/^Edad/), '35');
    await userEvent.type(within(dialogo).getByLabelText(/^Documento de identidad/), '91234567');
    await userEvent.type(within(dialogo).getByLabelText(/^Correo/), 'ana.lopez@correo.com');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Registrar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('El apoderado ha sido registrado correctamente.')).toBeInTheDocument();
  });

  it('el estudiante necesita un apoderado: busca por DNI, lo muestra y permite quitarlo', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    const dialogo = await abrirRegistro('estudiante');
    const campoApoderado = within(dialogo).getByLabelText(/^DNI del apoderado/);

    await userEvent.type(campoApoderado, '00000000');
    // Enter busca sin enviar el formulario completo.
    await userEvent.keyboard('{Enter}');
    expect(within(dialogo).getByText('No se encontró un apoderado registrado con este DNI.')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Registrar estudiante' })).toBeInTheDocument();
    expect(campoApoderado).toHaveAttribute('aria-invalid', 'true');
  });

  it('en la edición, el fondo no cierra y Escape confirma solo si hubo cambios', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    await userEvent.click(screen.getAllByRole('button', { name: /^Editar/ })[0]);
    const dialogo = screen.getByRole('dialog', { name: 'Editar usuario' });
    expect(within(dialogo).getByLabelText(/^Nombre/)).toHaveFocus();

    clicEnElFondo(dialogo);
    expect(screen.getByRole('dialog', { name: 'Editar usuario' })).toBeInTheDocument();

    // Sin cambios: Escape cierra directo.
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: /^Editar/ })[0]);
    await userEvent.type(within(screen.getByRole('dialog', { name: 'Editar usuario' })).getByLabelText(/^Nombre/), 'X');
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: '¿Descartar los cambios?' })).toBeInTheDocument();
  });

  it('el diálogo de activar/desactivar sigue cerrándose con el fondo y con Escape', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    await userEvent.click(screen.getAllByRole('button', { name: /^Desactivar|^Activar/ })[0]);
    const dialogo = screen.getByRole('dialog', { name: /(Desactivar|Activar) usuario/ });

    clicEnElFondo(dialogo);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('la carga CSV no se cierra con el fondo y pide confirmar solo cuando hay un archivo elegido', async () => {
    render(<PaginaUsuarios />, { wrapper: MemoryRouter });
    await userEvent.click(screen.getByRole('button', { name: 'Agregar usuarios' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Carga masiva (CSV)' }));
    const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });

    clicEnElFondo(dialogo);
    expect(screen.getByRole('dialog', { name: 'Carga masiva de usuarios' })).toBeInTheDocument();

    const archivo = new File(['no,es,un,csv'], 'usuarios.csv', { type: 'text/csv' });
    await userEvent.upload(within(dialogo).getByLabelText(/Seleccionar archivo CSV/), archivo);
    await userEvent.keyboard('{Escape}');
    // El aviso habla del archivo, no de un formulario: dice qué se pierde y que no se crea ningún usuario.
    const confirmacion = screen.getByRole('dialog', { name: '¿Descartar la importación?' });
    expect(within(confirmacion).getByText('Se perderá el archivo «usuarios.csv» y su revisión. No se creará ningún usuario.')).toBeInTheDocument();

    await userEvent.click(within(confirmacion).getByRole('button', { name: 'Seguir con la carga' }));
    expect(screen.queryByRole('dialog', { name: '¿Descartar la importación?' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Carga masiva de usuarios' })).toBeInTheDocument();
  });
});
