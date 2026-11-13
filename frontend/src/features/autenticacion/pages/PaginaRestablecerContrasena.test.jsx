import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

import PaginaRestablecerContrasena from './PaginaRestablecerContrasena.jsx';

vi.mock('../services/restablecimientoService.js', async (importarOriginal) => {
  const original = await importarOriginal();
  return {
    ...original,
    solicitarCodigo: vi.fn(),
    verificarCodigo: vi.fn(),
    restablecerContrasena: vi.fn()
  };
});

const { verificarCodigo, restablecerContrasena, MOTIVOS_RECHAZO_RESTABLECIMIENTO } = await import(
  '../services/restablecimientoService.js'
);

const CORREO = 'admin@sanmarcos.edu.pe';
const CODIGO = '123456';
const CONTRASENA = 'Clave12345';

function LoginDePrueba() {
  const location = useLocation();
  return (
    <>
      <p>Pantalla de inicio de sesión</p>
      <p data-testid="estado-llegada">{JSON.stringify(location.state)}</p>
    </>
  );
}

function renderizar(estado) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/restablecer-contrasena', state: estado }]}>
      <Routes>
        <Route path="/restablecer-contrasena" element={<PaginaRestablecerContrasena />} />
        <Route path="/iniciar-sesion" element={<LoginDePrueba />} />
      </Routes>
    </MemoryRouter>
  );
}

async function completarPaso1(usuario) {
  await usuario.type(screen.getByLabelText('Correo electrónico'), CORREO);
  // Al completar los 6 dígitos el código se verifica solo, sin pulsar "Continuar".
  await usuario.type(screen.getByLabelText('Código de verificación'), CODIGO);
  await screen.findByText(/Paso 2 de 2/);
}

async function escribirCodigoRechazado(usuario) {
  await usuario.type(screen.getByLabelText('Código de verificación'), CODIGO);
  await waitFor(() => expect(screen.getByLabelText('Código de verificación')).toHaveValue(''));
}

describe('HU-SAT-03 · Restablecer contraseña en dos pasos', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    verificarCodigo.mockResolvedValue({ exitoso: true, valido: true, mensaje: '', motivo: null });
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
    expect(verificarCodigo).not.toHaveBeenCalled();
    expect(restablecerContrasena).not.toHaveBeenCalled();
  });

  it('verifica el código con el servicio y pasa al paso 2 sin restablecer todavía', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await completarPaso1(usuario);

    expect(screen.getByText(/Paso 2 de 2/)).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.queryByLabelText('Código de verificación')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument();
    expect(verificarCodigo).toHaveBeenCalledWith({ correo: CORREO, codigo: CODIGO });
    expect(restablecerContrasena).not.toHaveBeenCalled();
  });

  it('si el servicio responde que el código no es válido se queda en el paso 1 con el mensaje', async () => {
    verificarCodigo.mockResolvedValue({ exitoso: true, valido: false, mensaje: '', motivo: null });
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText('Correo electrónico'), CORREO);
    await escribirCodigoRechazado(usuario);

    expect(screen.getByText('Código inválido o vencido. Solicita uno nuevo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Código de verificación')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/Paso 1 de 2/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
  });

  it('acepta un código pegado con espacios o guiones y conserva solo los dígitos', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText('Correo electrónico'), CORREO);
    await usuario.click(screen.getByLabelText('Código de verificación'));
    await usuario.paste('123-4 56');

    await screen.findByText(/Paso 2 de 2/);
    expect(verificarCodigo).toHaveBeenCalledWith({ correo: CORREO, codigo: CODIGO });
  });

  it('tras 5 códigos rechazados avisa del bloqueo y deja "Continuar" no disponible', async () => {
    verificarCodigo.mockResolvedValue({ exitoso: true, valido: false, mensaje: '', motivo: null });
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText('Correo electrónico'), CORREO);
    for (let intento = 0; intento < 5; intento += 1) {
      await escribirCodigoRechazado(usuario);
    }

    expect(screen.getByText('Código bloqueado por intentos fallidos. Solicita uno nuevo.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveAttribute('aria-disabled', 'true');

    await usuario.type(screen.getByLabelText('Código de verificación'), CODIGO);
    expect(verificarCodigo).toHaveBeenCalledTimes(5);
  });

  it('si el correo llega desde "Solicitar código" se muestra fijo hasta pulsar "Cambiar correo"', async () => {
    const usuario = userEvent.setup();
    renderizar({ correo: CORREO, avisoSolicitud: true });

    const campoCorreo = screen.getByLabelText('Correo electrónico');
    expect(campoCorreo).toHaveValue(CORREO);
    expect(campoCorreo).toHaveAttribute('readonly');
    expect(screen.getByText('El código vence en 15 minutos.')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Cambiar correo' }));

    expect(screen.getByLabelText('Correo electrónico')).not.toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Cambiar correo' })).not.toBeInTheDocument();
  });

  it('el paso 2 indica en vivo cuando las contraseñas coinciden', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await completarPaso1(usuario);
    await usuario.type(screen.getByLabelText('Nueva contraseña'), CONTRASENA);
    expect(screen.queryByText('Las contraseñas coinciden')).not.toBeInTheDocument();

    await usuario.type(screen.getByLabelText('Confirmar contraseña'), CONTRASENA);
    expect(screen.getByText('Las contraseñas coinciden')).toBeInTheDocument();
  });

  it('si la verificación falla por un error inesperado no avanza y muestra el mensaje genérico', async () => {
    verificarCodigo.mockResolvedValue({ exitoso: false, valido: false, mensaje: '', motivo: 'ERROR_INESPERADO' });
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText('Correo electrónico'), CORREO);
    await usuario.type(screen.getByLabelText('Código de verificación'), CODIGO);

    expect(await screen.findByText('Se registró un error inesperado')).toBeInTheDocument();
    expect(screen.getByText(/Paso 1 de 2/)).toBeInTheDocument();
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
    expect(screen.getByText('Entre 8 y 72 caracteres').closest('li')).toHaveTextContent('Cumplido');
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
    expect(screen.getByTestId('estado-llegada')).toHaveTextContent(
      JSON.stringify({ contrasenaRestablecida: true, correo: CORREO })
    );
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
