import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import PaginaLogin from './PaginaLogin.jsx';
import { PERFILES_ACCESO } from '../constants/perfilesAcceso.js';

vi.mock('../hooks/useLogin.js', () => ({
  default: () => ({
    valores: { perfil: 'ADMINISTRADOR', identificador: '', contrasena: '', recordar: false },
    errores: {},
    errorGeneral: null,
    enviando: false,
    perfiles: PERFILES_ACCESO,
    refIdentificador: { current: null },
    refContrasena: { current: null },
    manejarCambioCampo: vi.fn(),
    manejarSalidaCampo: vi.fn(),
    manejarEnvio: vi.fn((evento) => evento?.preventDefault?.())
  })
}));

describe('HU-SAT-07 · Lista de verificación: título exacto de la pantalla de inicio de sesión', () => {
  it('muestra el título "Iniciar sesión" como único encabezado de nivel 1', () => {
    render(<PaginaLogin />);

    const titulo = screen.getByRole('heading', { level: 1 });
    expect(titulo).toHaveTextContent('Iniciar sesión');
  });

  it('muestra el botón de envío con el texto exacto "Iniciar sesión"', () => {
    render(<PaginaLogin />);
    expect(screen.getByRole('button', { name: /Iniciar sesión/ })).toBeInTheDocument();
  });
});
