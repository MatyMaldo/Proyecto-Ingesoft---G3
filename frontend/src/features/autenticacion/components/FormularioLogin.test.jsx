import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import FormularioLogin from './FormularioLogin.jsx';
import { PERFILES_ACCESO } from '../constants/perfilesAcceso.js';

const VALORES_BASE = { perfil: 'ADMINISTRADOR', identificador: '', contrasena: '', recordar: false };

function renderizar(props = {}) {
  return render(
    <FormularioLogin
      valores={VALORES_BASE}
      errores={{}}
      errorGeneral={null}
      enviando={false}
      perfiles={PERFILES_ACCESO}
      refIdentificador={{ current: null }}
      refContrasena={{ current: null }}
      alCambiarCampo={vi.fn()}
      alSalirDeCampo={vi.fn()}
      alEnviar={vi.fn((evento) => evento.preventDefault())}
      {...props}
    />
  );
}

describe('HU-SAT-07 · Lista de verificación: texto exacto del botón "Iniciar sesión"', () => {
  it('muestra el botón con el texto exacto "Iniciar sesión"', () => {
    renderizar();
    expect(screen.getByRole('button', { name: /Iniciar sesión/ })).toBeInTheDocument();
  });

  it('muestra los campos obligatorios: identificador y contraseña', () => {
    renderizar();
    expect(screen.getByLabelText('Correo electrónico o DNI')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Recordar mi sesión')).toBeInTheDocument();
  });
});

describe('HU-SAT-07 · Escenario 4: campos vacíos o identificador con formato inválido', () => {
  it('indica el campo a corregir con el mensaje recibido', () => {
    renderizar({
      errores: {
        identificador: 'Ingresa tu correo electrónico o DNI.',
        contrasena: 'Ingresa tu contraseña.'
      }
    });

    expect(screen.getByText('Ingresa tu correo electrónico o DNI.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico o DNI')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('HU-SAT-07 · Escenario 3: credenciales incorrectas o perfil que no corresponde a la cuenta', () => {
  it('muestra el mensaje general exacto sin marcar ningún campo como inválido', () => {
    renderizar({ errorGeneral: 'Correo/DNI o contraseña incorrectos' });

    expect(screen.getByRole('alert')).toHaveTextContent('Correo/DNI o contraseña incorrectos');
    expect(screen.getByLabelText('Correo electrónico o DNI')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Contraseña')).not.toHaveAttribute('aria-invalid');
  });
});
