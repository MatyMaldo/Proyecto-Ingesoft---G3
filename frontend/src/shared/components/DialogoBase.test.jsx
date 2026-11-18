import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DialogoBase from './DialogoBase.jsx';

function mostrar(propiedades = {}) {
  const acciones = {
    alSolicitarCierre: vi.fn(),
    alPulsarCancelar: vi.fn(),
    alCancelar: vi.fn(),
    alConfirmar: vi.fn((evento) => evento.preventDefault())
  };
  render(
    <DialogoBase
      idTitulo="dialogo-prueba"
      titulo="Prueba"
      textoConfirmar="Aceptar"
      textoCancelar="Atrás"
      {...acciones}
      {...propiedades}
    >
      <p>Contenido</p>
    </DialogoBase>
  );
  return acciones;
}

describe('DialogoBase · botón del pie distinto de la X', () => {
  it('con alPulsarCancelar, el botón del pie lo llama y no pide el cierre', async () => {
    const acciones = mostrar();

    await userEvent.click(screen.getByRole('button', { name: 'Atrás' }));

    expect(acciones.alPulsarCancelar).toHaveBeenCalledTimes(1);
    expect(acciones.alSolicitarCierre).not.toHaveBeenCalled();
  });

  it('la X sigue pidiendo el cierre aunque haya alPulsarCancelar', async () => {
    const acciones = mostrar();

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(acciones.alSolicitarCierre).toHaveBeenCalledTimes(1);
    expect(acciones.alPulsarCancelar).not.toHaveBeenCalled();
  });

  it('sin alPulsarCancelar, el botón del pie pide el cierre como la X', async () => {
    const acciones = mostrar({ alPulsarCancelar: undefined });

    await userEvent.click(screen.getByRole('button', { name: 'Atrás' }));

    expect(acciones.alSolicitarCierre).toHaveBeenCalledTimes(1);
  });
});
