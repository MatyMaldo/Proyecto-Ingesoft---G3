import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useLogin from './useLogin.js';
import { MOTIVOS_RECHAZO } from '../services/autenticacionService.js';
import { CLAVE_PREFERENCIAS_LOGIN } from '../../../shared/auth/constantesSesion.js';

const establecerSesionMock = vi.fn();

vi.mock('../../../shared/auth/useAuth.js', () => ({
  default: () => ({ establecerSesion: establecerSesionMock })
}));

vi.mock('../services/autenticacionService.js', async (importarOriginal) => {
  const original = await importarOriginal();
  return {
    ...original,
    iniciarSesion: vi.fn()
  };
});

import { iniciarSesion } from '../services/autenticacionService.js';

function renderizarHook(initialEntries = ['/iniciar-sesion']) {
  return renderHook(() => useLogin(), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  });
}

describe('HU-SAT-07 · Escenario 4: campos vacíos o correo con formato inválido', () => {
  beforeEach(() => {
    window.localStorage.clear();
    establecerSesionMock.mockClear();
    iniciarSesion.mockReset();
  });

  it('no llama al servicio y marca los campos cuando ambos están vacíos', async () => {
    const { result } = renderizarHook();

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    expect(iniciarSesion).not.toHaveBeenCalled();
    expect(result.current.errores.correo).toBeTruthy();
    expect(result.current.errores.contrasena).toBeTruthy();
  });

  it('no intenta autenticar con un correo de formato inválido', async () => {
    const { result } = renderizarHook();

    act(() => {
      result.current.manejarCambioCampo('correo', 'no-es-correo');
      result.current.manejarCambioCampo('contrasena', 'Admin2026!');
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    expect(iniciarSesion).not.toHaveBeenCalled();
    expect(result.current.errores.correo).toBeTruthy();
  });
});

describe('HU-SAT-07 · Escenario 3: credenciales incorrectas', () => {
  beforeEach(() => {
    window.localStorage.clear();
    establecerSesionMock.mockClear();
    iniciarSesion.mockReset();
  });

  it('muestra el mensaje exacto "Correo o contraseña incorrectos" sin marcar ningún campo', async () => {
    iniciarSesion.mockResolvedValue({
      exitoso: false,
      datos: null,
      mensaje: 'Correo o contraseña incorrectos.',
      motivo: MOTIVOS_RECHAZO.CREDENCIALES_INVALIDAS
    });

    const { result } = renderizarHook();

    act(() => {
      result.current.manejarCambioCampo('correo', 'admin@sanmarcos.edu.pe');
      result.current.manejarCambioCampo('contrasena', 'contrasena-equivocada');
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    await waitFor(() => {
      expect(result.current.errorGeneral).toBe('Correo o contraseña incorrectos');
    });
    expect(result.current.errores).toEqual({});
    expect(establecerSesionMock).not.toHaveBeenCalled();
  });
});

describe('HU-SAT-07 · Escenario 1: inicio de sesión exitoso', () => {
  beforeEach(() => {
    window.localStorage.clear();
    establecerSesionMock.mockClear();
    iniciarSesion.mockReset();
  });

  it('llama a establecerSesion con el token y el usuario recibidos', async () => {
    iniciarSesion.mockResolvedValue({
      exitoso: true,
      datos: { token: 'token-123', usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' } },
      mensaje: '',
      motivo: null
    });

    const { result } = renderizarHook();

    act(() => {
      result.current.manejarCambioCampo('correo', 'admin@sanmarcos.edu.pe');
      result.current.manejarCambioCampo('contrasena', 'Admin2026!');
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    expect(iniciarSesion).toHaveBeenCalledWith({ correo: 'admin@sanmarcos.edu.pe', password: 'Admin2026!' });
    expect(establecerSesionMock).toHaveBeenCalledWith({
      token: 'token-123',
      usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' }
    });
  });
});

describe('HU-SAT-07 · "Recordar mi sesión": persistencia solo del correo electrónico', () => {
  beforeEach(() => {
    window.localStorage.clear();
    establecerSesionMock.mockClear();
    iniciarSesion.mockReset();
  });

  it('guarda solo el correo en localStorage tras un login correcto con la casilla marcada', async () => {
    iniciarSesion.mockResolvedValue({
      exitoso: true,
      datos: { token: 'token-123', usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' } },
      mensaje: '',
      motivo: null
    });

    const { result } = renderizarHook();

    act(() => {
      result.current.manejarCambioCampo('correo', 'admin@sanmarcos.edu.pe');
      result.current.manejarCambioCampo('contrasena', 'Admin2026!');
      result.current.manejarCambioCampo('recordar', true);
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    const guardado = JSON.parse(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN));
    expect(guardado).toEqual({ correo: 'admin@sanmarcos.edu.pe' });
    expect(guardado).not.toHaveProperty('contrasena');
    expect(guardado).not.toHaveProperty('perfil');
  });

  it('no guarda nada tras un login correcto con la casilla desmarcada', async () => {
    iniciarSesion.mockResolvedValue({
      exitoso: true,
      datos: { token: 'token-123', usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' } },
      mensaje: '',
      motivo: null
    });

    const { result } = renderizarHook();

    act(() => {
      result.current.manejarCambioCampo('correo', 'admin@sanmarcos.edu.pe');
      result.current.manejarCambioCampo('contrasena', 'Admin2026!');
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    expect(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN)).toBeNull();
  });

  it('borra lo guardado en el momento en que se desmarca la casilla', async () => {
    window.localStorage.setItem(CLAVE_PREFERENCIAS_LOGIN, JSON.stringify({ correo: 'admin@sanmarcos.edu.pe' }));

    const { result } = renderizarHook();

    act(() => {
      result.current.manejarCambioCampo('recordar', false);
    });

    expect(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN)).toBeNull();
  });
});

describe('HU-SAT-07 · Esc. 9-11: aviso de cierre de sesión por invalidación', () => {
  beforeEach(() => {
    window.localStorage.clear();
    establecerSesionMock.mockClear();
    iniciarSesion.mockReset();
  });

  it('muestra el mensaje exacto de contraseña restablecida cuando llega el motivo en location.state', async () => {
    const { result } = renderizarHook([
      { pathname: '/iniciar-sesion', state: { motivoCierre: 'SESION_CONTRASENA_RESTABLECIDA' } }
    ]);

    await waitFor(() => {
      expect(result.current.errorGeneral).toBe('Tu contraseña fue restablecida. Inicia sesión nuevamente.');
    });
  });

  it('muestra el mensaje exacto de rol modificado cuando llega el motivo en location.state', async () => {
    const { result } = renderizarHook([
      { pathname: '/iniciar-sesion', state: { motivoCierre: 'SESION_ROL_MODIFICADO' } }
    ]);

    await waitFor(() => {
      expect(result.current.errorGeneral).toBe('Tu rol fue modificado. Inicia sesión nuevamente.');
    });
  });

  it('muestra el mensaje de cuenta inactiva cuando llega ese motivo', async () => {
    const { result } = renderizarHook([
      { pathname: '/iniciar-sesion', state: { motivoCierre: 'SESION_CUENTA_INACTIVA' } }
    ]);

    await waitFor(() => {
      expect(result.current.errorGeneral).toBe('Tu cuenta está inactiva. Comunícate con el administrador.');
    });
  });

  it('no muestra ningún mensaje sin motivoCierre', () => {
    const { result } = renderizarHook();
    expect(result.current.errorGeneral).toBeNull();
  });
});
