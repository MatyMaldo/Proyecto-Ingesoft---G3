import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const { registrarCierreSesion } = vi.hoisted(() => ({ registrarCierreSesion: vi.fn() }));

vi.mock('./sesionService.js', () => ({ registrarCierreSesion }));

import { AuthProvider } from './AuthContext.jsx';
import { CLAVE_SESION } from './constantesSesion.js';
import useAuth from './useAuth.js';

function BotonSalir() {
  const { cerrarSesion } = useAuth();
  return <button onClick={cerrarSesion}>Salir</button>;
}

describe('AuthContext · cierre de sesión voluntario (HU-SAT-07 Esc. 7)', () => {
  beforeEach(() => {
    registrarCierreSesion.mockReset();
    window.sessionStorage.clear();
    window.sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({ token: 'jwt-valido', usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' } })
    );
  });

  it('avisa al backend antes de borrar la sesión y lleva al inicio de sesión', () => {
    let sesionAlAvisar = null;
    registrarCierreSesion.mockImplementation(() => {
      sesionAlAvisar = window.sessionStorage.getItem(CLAVE_SESION);
    });

    const { getByText, getByTestId } = render(
      <MemoryRouter initialEntries={['/inicio']}>
        <AuthProvider>
          <Routes>
            <Route path="/inicio" element={<BotonSalir />} />
            <Route path="/iniciar-sesion" element={<div data-testid="login" />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(getByText('Salir'));

    expect(registrarCierreSesion).toHaveBeenCalledTimes(1);
    expect(sesionAlAvisar).not.toBeNull();
    expect(window.sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(getByTestId('login')).toBeInTheDocument();
  });
});
