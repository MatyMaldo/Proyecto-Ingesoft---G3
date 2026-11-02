import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import PaginaRestablecerContrasena from './PaginaRestablecerContrasena.jsx';

vi.mock('../services/restablecimientoService.js', async (importarOriginal) => {
  const original = await importarOriginal();
  return {
    ...original,
    solicitarCodigo: vi.fn(),
    restablecerContrasena: vi.fn()
  };
});

const { restablecerContrasena, MOTIVOS_RECHAZO_RESTABLECIMIENTO } = await import(
  '../services/restablecimientoService.js'
);

const CORREO = 'admin@sanmarcos.edu.pe';
const CODIGO = '123456';
const CONTRASENA = 'Clave12345';

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/restablecer-contrasena']}>
      <Routes>
        <Route path="/restablecer-contrasena" element={<PaginaRestablecerContrasena />} />
        <Route path="/iniciar-sesion" element={<p>Pantalla de inicio de sesión</p>} />
      </Routes>
    </MemoryRouter>
  );
}

async function completarPaso1(usuario) {
  await usuario.type(screen.getByLabelText('Correo electrónico'), CORREO);
  await usuario.type(screen.getByLabelText('Código de verificación'), CODIGO);
  await usuario.click(screen.getByRole('button', { name: 'Continuar' }));
}

describe('HU-SAT-03 · Restablecer contraseña en dos pasos', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('el paso 1 pide solo correo y código, sin los campos de contraseña', () => {
    renderizar();

    expect(screen.getByText(/Paso 1 de 2/)).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Confirmar contraseña')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Solicitar un nuevo código/ })).toBeInTheDocument();
  });

  it('no avanza al paso 2 si faltan datos y muestra los errores del paso 1', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText(/Paso 1 de 2/)).toBeInTheDocument();
    expect(screen.getByText('Ingresa el código de verificación.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
    expect(restablecerContrasena).not.toHaveBeenCalled();
  });

  it('con correo y código válidos pasa al paso 2 sin llamar al servicio todavía', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await completarPaso1(usuario);

    expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.queryByLabelText('Código de verificación')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument();
    expect(restablecerContrasena).not.toHaveBeenCalled();
  });

  it('el paso 1 ofrece volver al inicio de sesión desde la parte superior', () => {
    renderizar();

    const enlace = screen.getByRole('link', { name: 'Volver a iniciar sesión' });
    expect(enlace).toHaveAttribute('href', '/iniciar-sesion');
  });

  it('el botón de retroceso del paso 2 regresa al paso 1 conservando lo escrito', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await completarPaso1(usuario);
    await usuario.click(screen.getByRole('button', { name: 'Volver al paso anterior' }));

    expect(screen.getByText(/Paso 1 de 2/)).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue(CORREO);
    expect(screen.getByLabelText('Código de verificación')).toHaveValue(CODIGO);
  });

  it('la lista de requisitos marca cada requisito con texto mientras se escribe', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await completarPaso1(usuario);

    const itemNumero = () => screen.getByText('Al menos un número').closest('li');
    expect(itemNumero()).toHaveTextContent('Pendiente');

    await usuario.type(screen.getByLabelText('Nueva contraseña'), 'Abcdefghij');
    expect(screen.getByText('Al menos una letra').closest('li')).toHaveTextContent('Cumplido');
    expect(screen.getByText('Entre 9 y 15 caracteres').closest('li')).toHaveTextContent('Cumplido');
    expect(itemNumero()).toHaveTextContent('Pendiente');

    await usuario.type(screen.getByLabelText('Nueva contraseña'), '1');
    expect(itemNumero()).toHaveTextContent('Cumplido');
  });

  it('envía correo, código y contraseñas, y redirige al inicio de sesión si el servicio acepta', async () => {
    restablecerContrasena.mockResolvedValue({ exitoso: true });
    const usuario = userEvent.setup();
    renderizar();

    await completarPaso1(usuario);
    await usuario.type(screen.getByLabelText('Nueva contraseña'), CONTRASENA);
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), CONTRASENA);
    await usuario.click(screen.getByRole('button', { name: 'Aceptar' }));

    await waitFor(() => expect(screen.getByText('Pantalla de inicio de sesión')).toBeInTheDocument());
    expect(restablecerContrasena).toHaveBeenCalledWith({
      correo: CORREO,
      codigo: CODIGO,
      nuevaContrasena: CONTRASENA,
      confirmacionContrasena: CONTRASENA
    });
  });

  it('si las contraseñas no coinciden se queda en el paso 2 y no llama al servicio', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await completarPaso1(usuario);
    await usuario.type(screen.getByLabelText('Nueva contraseña'), CONTRASENA);
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'Otra123456');
    await usuario.click(screen.getByRole('button', { name: 'Aceptar' }));

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument();
    expect(restablecerContrasena).not.toHaveBeenCalled();
  });

  it('si el servicio rechaza el código vuelve al paso 1 con el mensaje de código inválido', async () => {
    restablecerContrasena.mockResolvedValue({
      exitoso: false,
      motivo: MOTIVOS_RECHAZO_RESTABLECIMIENTO.CODIGO_INVALIDO
    });
    const usuario = userEvent.setup();
    renderizar();

    await completarPaso1(usuario);
    await usuario.type(screen.getByLabelText('Nueva contraseña'), CONTRASENA);
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), CONTRASENA);
    await usuario.click(screen.getByRole('button', { name: 'Aceptar' }));

    await waitFor(() => expect(screen.getByText(/Paso 1 de 2/)).toBeInTheDocument());
    expect(screen.getByText('Código inválido o vencido. Solicita uno nuevo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument();
  });
});
