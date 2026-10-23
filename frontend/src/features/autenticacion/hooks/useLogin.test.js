import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

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

describe('HU-SAT-07 · Escenario 4: campos vacíos o identificador con formato inválido', () => {
  beforeEach(() => {
    window.localStorage.clear();
    establecerSesionMock.mockClear();
    iniciarSesion.mockReset();
  });

  it('no llama al servicio y marca los campos cuando ambos están vacíos', async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    expect(iniciarSesion).not.toHaveBeenCalled();
    expect(result.current.errores.identificador).toBeTruthy();
    expect(result.current.errores.contrasena).toBeTruthy();
  });

  it('no intenta autenticar con un identificador de formato inválido', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.manejarCambioCampo('identificador', 'no-es-correo-ni-dni');
      result.current.manejarCambioCampo('contrasena', 'Admin2026!');
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    expect(iniciarSesion).not.toHaveBeenCalled();
    expect(result.current.errores.identificador).toBeTruthy();
  });
});

describe('HU-SAT-07 · Escenario 3: credenciales incorrectas o perfil que no corresponde a la cuenta', () => {
  beforeEach(() => {
    window.localStorage.clear();
    establecerSesionMock.mockClear();
    iniciarSesion.mockReset();
  });

  it('muestra el mensaje exacto "Correo/DNI o contraseña incorrectos" sin marcar ningún campo', async () => {
    iniciarSesion.mockResolvedValue({
      exitoso: false,
      datos: null,
      mensaje: 'Credenciales o perfil incorrectos.',
      motivo: MOTIVOS_RECHAZO.CREDENCIALES_INVALIDAS
    });

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.manejarCambioCampo('identificador', 'admin@sanmarcos.edu.pe');
      result.current.manejarCambioCampo('contrasena', 'contrasena-equivocada');
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    await waitFor(() => {
      expect(result.current.errorGeneral).toBe('Correo/DNI o contraseña incorrectos');
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

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.manejarCambioCampo('identificador', 'admin@sanmarcos.edu.pe');
      result.current.manejarCambioCampo('contrasena', 'Admin2026!');
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    expect(establecerSesionMock).toHaveBeenCalledWith({
      token: 'token-123',
      usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' }
    });
  });
});

describe('HU-SAT-07 · "Recordar mi sesión": persistencia de identificador y perfil (nunca la contraseña)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    establecerSesionMock.mockClear();
    iniciarSesion.mockReset();
  });

  it('guarda identificador y perfil en localStorage tras un login correcto con la casilla marcada', async () => {
    iniciarSesion.mockResolvedValue({
      exitoso: true,
      datos: { token: 'token-123', usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' } },
      mensaje: '',
      motivo: null
    });

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.manejarCambioCampo('identificador', 'admin@sanmarcos.edu.pe');
      result.current.manejarCambioCampo('contrasena', 'Admin2026!');
      result.current.manejarCambioCampo('recordar', true);
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    const guardado = JSON.parse(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN));
    expect(guardado).toEqual({ identificador: 'admin@sanmarcos.edu.pe', perfil: 'ADMINISTRADOR' });
    expect(guardado).not.toHaveProperty('contrasena');
  });

  it('no guarda nada tras un login correcto con la casilla desmarcada', async () => {
    iniciarSesion.mockResolvedValue({
      exitoso: true,
      datos: { token: 'token-123', usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' } },
      mensaje: '',
      motivo: null
    });

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.manejarCambioCampo('identificador', 'admin@sanmarcos.edu.pe');
      result.current.manejarCambioCampo('contrasena', 'Admin2026!');
    });

    await act(async () => {
      await result.current.manejarEnvio({ preventDefault: () => {} });
    });

    expect(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN)).toBeNull();
  });

  it('borra lo guardado en el momento en que se desmarca la casilla', async () => {
    window.localStorage.setItem(
      CLAVE_PREFERENCIAS_LOGIN,
      JSON.stringify({ identificador: 'admin@sanmarcos.edu.pe', perfil: 'ADMINISTRADOR' })
    );

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.manejarCambioCampo('recordar', false);
    });

    expect(window.localStorage.getItem(CLAVE_PREFERENCIAS_LOGIN)).toBeNull();
  });
});
