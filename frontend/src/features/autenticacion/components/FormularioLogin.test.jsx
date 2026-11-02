import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import FormularioLogin from './FormularioLogin.jsx';

const VALORES_BASE = { correo: '', contrasena: '', recordar: false };

function renderizar(props = {}) {
  return render(
    <MemoryRouter>
      <FormularioLogin
        valores={VALORES_BASE}
        errores={{}}
        errorGeneral={null}
        enviando={false}
        refCorreo={{ current: null }}
        refContrasena={{ current: null }}
        alCambiarCampo={vi.fn()}
        alSalirDeCampo={vi.fn()}
        alEnviar={vi.fn((evento) => evento.preventDefault())}
        {...props}
      />
    </MemoryRouter>
  );
}

describe('HU-SAT-07 · Lista de verificación: formulario solo con correo y contraseña', () => {
  it('muestra el botón con el texto exacto "Iniciar sesión"', () => {
    renderizar();
    expect(screen.getByRole('button', { name: /Iniciar sesión/ })).toBeInTheDocument();
  });

  it('muestra los campos obligatorios: correo y contraseña, sin selector de perfil', () => {
    renderizar();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Recordar mi sesión')).toBeInTheDocument();
    expect(screen.queryByText('Perfil de acceso')).not.toBeInTheDocument();
    expect(screen.queryByText('Ingresando como')).not.toBeInTheDocument();
  });

  it('el campo de correo es type="email" y tiene un placeholder instructivo', () => {
    renderizar();
    const campo = screen.getByLabelText('Correo electrónico');
    expect(campo).toHaveAttribute('type', 'email');
    expect(campo).toHaveAttribute('placeholder');
  });
});

describe('HU-SAT-07 · Escenario 4: campos vacíos o correo con formato inválido', () => {
  it('indica el campo a corregir con el mensaje recibido', () => {
    renderizar({
      errores: {
        correo: 'Ingresa tu correo electrónico.',
        contrasena: 'Ingresa tu contraseña.'
      }
    });

    expect(screen.getByText('Ingresa tu correo electrónico.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('HU-SAT-03 · Esc. 2: enlace "¿Olvidaste tu contraseña?" habilitado', () => {
  it('es un enlace real a /solicitar-codigo, no un control no disponible', () => {
    renderizar();

    const enlace = screen.getByRole('link', { name: '¿Olvidaste tu contraseña?' });
    expect(enlace).toHaveAttribute('href', '/solicitar-codigo');
    expect(enlace).not.toHaveAttribute('aria-disabled');
  });
});

describe('HU-SAT-07 · Escenario 3: credenciales incorrectas', () => {
  it('muestra el mensaje general exacto sin marcar ningún campo como inválido', () => {
    renderizar({ errorGeneral: 'Correo o contraseña incorrectos' });

    expect(screen.getByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
    expect(screen.getByLabelText('Correo electrónico')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Contraseña')).not.toHaveAttribute('aria-invalid');
  });
});
