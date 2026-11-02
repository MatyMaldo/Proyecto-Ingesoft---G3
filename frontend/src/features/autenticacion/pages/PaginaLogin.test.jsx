import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import PaginaLogin from './PaginaLogin.jsx';

const manejarEnvioMock = vi.fn((evento) => evento?.preventDefault?.());

function crearValoresHook(overrides = {}) {
  return {
    valores: { correo: '', contrasena: '', recordar: false },
    errores: {},
    errorGeneral: null,
    enviando: false,
    refCorreo: { current: null },
    refContrasena: { current: null },
    manejarCambioCampo: vi.fn(),
    manejarSalidaCampo: vi.fn(),
    manejarEnvio: manejarEnvioMock,
    ...overrides
  };
}

let valoresHookActuales = crearValoresHook();

vi.mock('../hooks/useLogin.js', () => ({
  default: () => valoresHookActuales
}));

function renderizar(initialEntries = ['/iniciar-sesion']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <PaginaLogin />
    </MemoryRouter>
  );
}

describe('HU-SAT-07 · Lista de verificación: título exacto de la pantalla de inicio de sesión', () => {
  it('muestra el título "Iniciar sesión" como único encabezado de nivel 1', () => {
    valoresHookActuales = crearValoresHook();
    renderizar();

    const titulo = screen.getByRole('heading', { level: 1 });
    expect(titulo).toHaveTextContent('Iniciar sesión');
  });

  it('muestra el botón de envío con el texto exacto "Iniciar sesión"', () => {
    valoresHookActuales = crearValoresHook();
    renderizar();
    expect(screen.getByRole('button', { name: /Iniciar sesión/ })).toBeInTheDocument();
  });

  it('no muestra selector de perfil ni recuadro "Ingresando como"', () => {
    valoresHookActuales = crearValoresHook();
    renderizar();
    expect(screen.queryByText('Perfil de acceso')).not.toBeInTheDocument();
    expect(screen.queryByText('Ingresando como')).not.toBeInTheDocument();
  });
});

describe('HU-SAT-07 · Esc. 9-11: aviso de cierre de sesión', () => {
  it('muestra el literal exacto cuando useLogin reporta un errorGeneral de cierre de sesión', () => {
    valoresHookActuales = crearValoresHook({ errorGeneral: 'Tu rol fue modificado. Inicia sesión nuevamente.' });
    renderizar();

    expect(screen.getByRole('alert')).toHaveTextContent('Tu rol fue modificado. Inicia sesión nuevamente.');
  });
});
