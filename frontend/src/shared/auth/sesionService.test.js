import { beforeEach, describe, expect, it, vi } from 'vitest';

const { solicitar, config } = vi.hoisted(() => ({ solicitar: vi.fn(), config: { USAR_MOCK: false } }));

vi.mock('../api/clienteHttp.js', () => ({ solicitar }));
vi.mock('../api/configuracionApi.js', () => ({
  get USAR_MOCK() {
    return config.USAR_MOCK;
  }
}));

import { registrarCierreSesion } from './sesionService.js';

describe('sesionService · cierre de sesión (HU-SAT-04 / HU-SAT-07 Esc. 7)', () => {
  beforeEach(() => {
    solicitar.mockReset();
    config.USAR_MOCK = false;
  });

  it('avisa al backend con POST /auth/logout para que quede en la auditoría', async () => {
    solicitar.mockResolvedValue({ exitoso: true, datos: null, mensaje: '' });

    await registrarCierreSesion();

    expect(solicitar).toHaveBeenCalledWith('/auth/logout', { metodo: 'POST' });
  });

  it('no lanza aunque el backend no responda', async () => {
    solicitar.mockResolvedValue({ exitoso: false, datos: null, mensaje: 'No fue posible comunicarse con el backend.' });

    await expect(registrarCierreSesion()).resolves.toBeUndefined();
  });

  it('con datos simulados no llama al backend', async () => {
    config.USAR_MOCK = true;

    await registrarCierreSesion();

    expect(solicitar).not.toHaveBeenCalled();
  });
});
