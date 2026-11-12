import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import DetalleError from './DetalleError.jsx';

const trazaLarga = [
  'java.lang.IllegalStateException: Cuota 7 no pertenece al cronograma',
  ...Array.from({ length: 30 }, (_, i) => `\tat paquete.Clase.metodo${i}(Clase.java:${i})`),
  'Caused by: java.sql.SQLIntegrityConstraintViolationException: Duplicate entry'
].join('\n');

const errorConTraza = {
  id: 21,
  fecha: '2026-11-12',
  hora: '10:56',
  fechaHora: '2026-11-12T10:56:00',
  moduloEtiqueta: 'Pagos',
  moduloTono: 'neutro',
  metodoHttp: 'POST',
  endpoint: '/api/v1/pagos/cuotas/7?incluirMora=true',
  tipoError: 'Excepción no controlada',
  tipoErrorTono: 'peligro',
  usuario: 'Admin Sistema',
  codigoEstado: 500,
  codigoEstadoTono: 'peligro',
  mensaje: 'No se pudo registrar el pago',
  detalle: trazaLarga
};

beforeAll(() => {
  // jsdom no implementa showModal/close de <dialog>.
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.open = false;
  };
});

describe('DetalleError', () => {
  it('separa método, ruta y parámetros de la operación', () => {
    render(<DetalleError error={errorConTraza} alCerrar={vi.fn()} />);

    const operacion = screen.getByText('Operación').nextElementSibling;
    expect(within(operacion).getByText('POST')).toBeInTheDocument();
    expect(within(operacion).getByText('/api/v1/pagos/cuotas/7')).toBeInTheDocument();
    expect(within(operacion).getByText('?incluirMora=true')).toBeInTheDocument();
  });

  it('resume una traza larga conservando la causa y permite verla completa', async () => {
    render(<DetalleError error={errorConTraza} alCerrar={vi.fn()} />);
    const traza = screen.getByLabelText('Detalle técnico');

    expect(traza).toHaveTextContent('líneas omitidas');
    expect(traza).toHaveTextContent('Caused by: java.sql.SQLIntegrityConstraintViolationException');
    expect(traza).not.toHaveTextContent('metodo29');

    await userEvent.click(screen.getByRole('button', { name: 'Ver traza completa (32 líneas)' }));

    expect(traza).toHaveTextContent('metodo29');
    expect(screen.getByRole('button', { name: 'Ver menos' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('copia la operación completa y confirma solo en su botón', async () => {
    const usuario = userEvent.setup();
    const escribir = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<DetalleError error={errorConTraza} alCerrar={vi.fn()} />);

    await usuario.click(screen.getByRole('button', { name: 'Copiar operación' }));

    expect(escribir).toHaveBeenCalledWith('POST /api/v1/pagos/cuotas/7?incluirMora=true');
    expect(await screen.findByRole('button', { name: 'Operación copiada' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copiar detalle' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Operación copiada al portapapeles');
    escribir.mockRestore();
  });

  it('un proceso automático sin petición no ofrece copiar la operación', () => {
    render(<DetalleError error={{ ...errorConTraza, metodoHttp: null, endpoint: null }} alCerrar={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Copiar operación' })).not.toBeInTheDocument();
  });

  it('copia siempre la traza completa, aunque se muestre resumida', async () => {
    const usuario = userEvent.setup();
    const escribir = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<DetalleError error={errorConTraza} alCerrar={vi.fn()} />);

    await usuario.click(screen.getByRole('button', { name: 'Copiar detalle' }));

    expect(escribir).toHaveBeenCalledWith(trazaLarga);
    escribir.mockRestore();
  });
});
