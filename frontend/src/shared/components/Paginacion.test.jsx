import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Paginacion from './Paginacion.jsx';

function renderizar(propiedades = {}) {
  const alCambiarPagina = vi.fn();
  render(
    <Paginacion
      pagina={0}
      totalPaginas={5}
      totalElementos={50}
      tamanioPagina={10}
      cantidadEnPagina={10}
      alCambiarPagina={alCambiarPagina}
      {...propiedades}
    />
  );
  return { alCambiarPagina };
}

describe('Paginacion', () => {
  it('no contiene un <form>, para poder usarse dentro de un formulario', () => {
    const { container } = render(
      <form>
        <Paginacion pagina={0} totalPaginas={3} totalElementos={30} tamanioPagina={10} cantidadEnPagina={10} alCambiarPagina={() => {}} />
      </form>
    );

    expect(container.querySelectorAll('form')).toHaveLength(1);
  });

  it('Enter en el campo confirma la página sin enviar el formulario que lo contiene', async () => {
    const alEnviar = vi.fn((evento) => evento.preventDefault());
    const alCambiarPagina = vi.fn();
    render(
      <form onSubmit={alEnviar}>
        <Paginacion pagina={0} totalPaginas={5} totalElementos={50} tamanioPagina={10} cantidadEnPagina={10} alCambiarPagina={alCambiarPagina} />
      </form>
    );

    const campo = screen.getByRole('spinbutton', { name: 'Número de página' });
    await userEvent.clear(campo);
    await userEvent.type(campo, '3{Enter}');

    expect(alCambiarPagina).toHaveBeenCalledWith(2);
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('un número fuera de rango se ajusta al límite y los botones navegan', () => {
    const { alCambiarPagina } = renderizar();

    const campo = screen.getByRole('spinbutton', { name: 'Número de página' });
    fireEvent.change(campo, { target: { value: '99' } });
    fireEvent.keyDown(campo, { key: 'Enter' });
    expect(alCambiarPagina).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(alCambiarPagina).toHaveBeenCalledWith(1);
  });
});
