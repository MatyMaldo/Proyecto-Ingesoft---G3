import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import PaginaUsuarios from './PaginaUsuarios.jsx';

async function abrirRegistro(tipo) {
  await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
  await userEvent.click(screen.getByRole('menuitem', { name: `Registrar ${tipo}` }));
  return screen.getByRole('dialog', { name: `Registrar ${tipo}` });
}

/** Clic directo sobre el fondo oscuro: en un <dialog> modal, el objetivo es el propio elemento. */
function clicEnElFondo(dialogo) {
  fireEvent.click(dialogo);
}

describe('Usuarios · formularios en diálogo', () => {
  it('enfoca el primer campo al abrir el registro', async () => {
    render(<PaginaUsuarios />);
    const dialogo = await abrirRegistro('apoderado');

    expect(within(dialogo).getByLabelText(/^Nombre/)).toHaveFocus();
  });

  it('asocia cada etiqueta con su campo: el clic en la etiqueta enfoca el campo', async () => {
    render(<PaginaUsuarios />);
    const dialogo = await abrirRegistro('estudiante');

    for (const etiqueta of ['Nombre', 'Apellido paterno', 'Apellido materno', 'Fecha de nacimiento', 'DNI', 'Teléfono', 'Correo', 'Contraseña inicial', 'Confirmar contraseña', 'DNI del apoderado']) {
      const exacta = new RegExp("^" + etiqueta + "( [*])?$");
      const campo = within(dialogo).getByLabelText(exacta);
      await userEvent.click(within(dialogo).getByText(exacta, { selector: 'label' }));
      expect(campo).toHaveFocus();
    }
  });

  it('agrupa los campos en secciones con título', async () => {
    render(<PaginaUsuarios />);
    const dialogo = await abrirRegistro('docente');

    for (const titulo of ['Datos personales', 'Contacto', 'Acceso']) {
      expect(within(dialogo).getByRole('region', { name: titulo })).toBeInTheDocument();
    }
    expect(within(dialogo).getByRole('region', { name: 'Acceso' }).querySelectorAll('input[type="password"]')).toHaveLength(2);
    // El estudiante suma la sección del apoderado.
    expect(within(dialogo).queryByRole('region', { name: 'Apoderado' })).not.toBeInTheDocument();
  });

  it('mantiene autocomplete="new-password" en los campos de contraseña', async () => {
    render(<PaginaUsuarios />);
    const dialogo = await abrirRegistro('apoderado');

    for (const campo of dialogo.querySelectorAll('input[type="password"]')) {
      expect(campo).toHaveAttribute('autocomplete', 'new-password');
    }
  });

  it('muestra los errores con ícono y texto, marca el campo y enfoca el primero inválido', async () => {
    render(<PaginaUsuarios />);
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

  it('el clic en el fondo oscuro no cierra el formulario de registro', async () => {
    render(<PaginaUsuarios />);
    const dialogo = await abrirRegistro('apoderado');

    clicEnElFondo(dialogo);
    expect(screen.getByRole('dialog', { name: 'Registrar apoderado' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '¿Descartar los cambios?' })).not.toBeInTheDocument();
  });

  it('sin datos escritos, la X y Escape cierran el formulario sin preguntar', async () => {
    render(<PaginaUsuarios />);
    await abrirRegistro('apoderado');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await abrirRegistro('apoderado');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con datos escritos, la X y Escape piden confirmar antes de descartar', async () => {
    render(<PaginaUsuarios />);
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
    render(<PaginaUsuarios />);
    const dialogo = await abrirRegistro('apoderado');

    await userEvent.type(within(dialogo).getByLabelText(/^Nombre/), 'Ana');
    await userEvent.type(within(dialogo).getByLabelText(/^Apellido/), 'Lopez');
    await userEvent.type(within(dialogo).getByLabelText(/^Edad/), '35');
    await userEvent.type(within(dialogo).getByLabelText(/^Documento de identidad/), '91234567');
    await userEvent.type(within(dialogo).getByLabelText(/^Correo/), 'ana.lopez@correo.com');
    await userEvent.type(within(dialogo).getByLabelText(/^Contraseña/, { selector: 'input' }), 'clave-segura-1');
    await userEvent.type(within(dialogo).getByLabelText(/^Confirmar contraseña/), 'clave-segura-1');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Registrar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('El apoderado ha sido registrado correctamente.')).toBeInTheDocument();
  });

  it('el estudiante necesita un apoderado: busca por DNI, lo muestra y permite quitarlo', async () => {
    render(<PaginaUsuarios />);
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
    render(<PaginaUsuarios />);
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
    render(<PaginaUsuarios />);
    await userEvent.click(screen.getAllByRole('button', { name: /^Desactivar|^Activar/ })[0]);
    const dialogo = screen.getByRole('dialog', { name: /(Desactivar|Activar) usuario/ });

    clicEnElFondo(dialogo);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('la carga CSV no se cierra con el fondo y pide confirmar solo cuando hay un archivo elegido', async () => {
    render(<PaginaUsuarios />);
    await userEvent.click(screen.getByRole('button', { name: 'Carga masiva CSV' }));
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
