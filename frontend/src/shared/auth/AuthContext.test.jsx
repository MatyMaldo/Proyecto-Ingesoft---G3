import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './AuthContext.jsx';
import { CLAVE_SESION } from './constantesSesion.js';
import { solicitar } from '../api/clienteHttp.js';

function PaginaProtegidaDemo() {
  return (
    <button
      onClick={() => {
        solicitar('/administracion/auditorias');
      }}
    >
      Disparar solicitud
    </button>
  );
}

function PaginaLoginDemo() {
  const location = useLocation();
  return <div data-testid="login">{location.state?.motivoCierre ?? 'sin-motivo'}</div>;
}

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/administracion/auditorias']}>
      <AuthProvider>
        <Routes>
          <Route path="/administracion/auditorias" element={<PaginaProtegidaDemo />} />
          <Route path="/iniciar-sesion" element={<PaginaLoginDemo />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('AuthContext · cierre de sesión por invalidación (Esc. 9-11, docs/planes/login.md §U2)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({ token: 'jwt-valido', usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' } })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('navega a /iniciar-sesion con el motivoCierre y borra la sesión ante un 401 con código conocido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Tu rol fue modificado.', codigo: 'SESION_ROL_MODIFICADO' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const { getByText, findByTestId } = renderizar();

    fireEvent.click(getByText('Disparar solicitud'));

    const login = await findByTestId('login');
    expect(login).toHaveTextContent('SESION_ROL_MODIFICADO');
    expect(window.sessionStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it('cierra la sesión sin mensaje (sin state) ante un 401 sin código', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Sesión inválida.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const { getByText, findByTestId } = renderizar();

    fireEvent.click(getByText('Disparar solicitud'));

    const login = await findByTestId('login');
    expect(login).toHaveTextContent('sin-motivo');
    expect(window.sessionStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it('no hace nada ante un 401 si ya no hay sesión (401 del propio login)', async () => {
    window.sessionStorage.clear();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Correo o contraseña incorrectos' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const { getByText, queryByTestId } = renderizar();

    fireEvent.click(getByText('Disparar solicitud'));

    await waitFor(() => {
      expect(queryByTestId('login')).not.toBeInTheDocument();
    });
  });
});
