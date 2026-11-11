import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import DialogoBase from './DialogoBase.jsx';

function renderDialogo(props = {}) {
  const alCancelar = vi.fn();
  const alSolicitarCierre = vi.fn();
  render(
    <DialogoBase
      idTitulo="dialogo-prueba"
      titulo="Diálogo de prueba"
      textoConfirmar="Aceptar"
      textoEnviando="Enviando…"
      alCancelar={alCancelar}
      alConfirmar={(evento) => evento.preventDefault()}
      {...props}
    >
      <input type="file" data-testid="archivo" />
    </DialogoBase>
  );
  return { alCancelar, alSolicitarCierre };
}

describe('DialogoBase', () => {
  it('no se cierra cuando se cancela el explorador de archivos de un input interno', () => {
    const alCancelar = vi.fn();
    const alSolicitarCierre = vi.fn();
    renderDialogo({ alCancelar, alSolicitarCierre });

    // Chrome dispara `cancel` (con burbujeo) en el input al cerrar el explorador sin elegir un archivo.
    fireEvent(screen.getByTestId('archivo'), new Event('cancel', { bubbles: true, cancelable: true }));

    expect(alSolicitarCierre).not.toHaveBeenCalled();
    expect(alCancelar).not.toHaveBeenCalled();
    expect(document.querySelector('dialog')).toHaveAttribute('open');
  });

  it('con alSolicitarCierre, Esc sobre el diálogo solo solicita el cierre', () => {
    const alCancelar = vi.fn();
    const alSolicitarCierre = vi.fn();
    renderDialogo({ alCancelar, alSolicitarCierre });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(alSolicitarCierre).toHaveBeenCalledTimes(1);
    expect(alCancelar).not.toHaveBeenCalled();
    expect(document.querySelector('dialog')).toHaveAttribute('open');
  });

  it('sin alSolicitarCierre, Esc cierra el diálogo', () => {
    const alCancelar = vi.fn();
    renderDialogo({ alCancelar });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(alCancelar).toHaveBeenCalledTimes(1);
  });

  it('mientras se envía, Esc no cierra ni solicita el cierre', () => {
    const alCancelar = vi.fn();
    const alSolicitarCierre = vi.fn();
    renderDialogo({ alCancelar, alSolicitarCierre, enviando: true });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(alSolicitarCierre).not.toHaveBeenCalled();
    expect(alCancelar).not.toHaveBeenCalled();
    expect(document.querySelector('dialog')).toHaveAttribute('open');
  });
});
