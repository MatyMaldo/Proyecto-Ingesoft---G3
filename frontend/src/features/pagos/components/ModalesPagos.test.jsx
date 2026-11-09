import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModalRechazarPago from './ModalRechazarPago.jsx';
import ModalRegistrarPago from './ModalRegistrarPago.jsx';

describe('Pagos · diálogos de registrar y rechazar un pago', () => {
  describe('Registrar pago', () => {
    const compromiso = { id: 7, tipoCompromiso: 'PENSION', mes: 'MARZO', montoTotal: 400 };

    it('es un diálogo con el compromiso en el subtítulo y el monto del compromiso ya escrito', () => {
      render(<ModalRegistrarPago compromiso={compromiso} onCerrar={vi.fn()} onRegistrar={vi.fn()} />);

      const dialogo = screen.getByRole('dialog', { name: 'Registrar pago' });
      expect(within(dialogo).getByText(/Pensión · MARZO/)).toBeInTheDocument();
      expect(within(dialogo).getByLabelText('Monto pagado')).toHaveValue(400);
    });

    it('pide el comprobante en PDF y avisa con ícono y texto, en el propio diálogo', async () => {
      const alRegistrar = vi.fn();
      render(<ModalRegistrarPago compromiso={compromiso} onCerrar={vi.fn()} onRegistrar={alRegistrar} />);
      const dialogo = screen.getByRole('dialog', { name: 'Registrar pago' });

      await userEvent.click(within(dialogo).getByRole('button', { name: 'Registrar pago' }));
      expect(within(dialogo).getByRole('alert')).toHaveTextContent('Selecciona el comprobante en PDF.');
      expect(alRegistrar).not.toHaveBeenCalled();
    });

    it('rechaza un archivo que no es PDF', async () => {
      render(<ModalRegistrarPago compromiso={compromiso} onCerrar={vi.fn()} onRegistrar={vi.fn()} />);
      const dialogo = screen.getByRole('dialog', { name: 'Registrar pago' });

      const imagen = new File(['x'], 'foto.png', { type: 'image/png' });
      await userEvent.upload(within(dialogo).getByLabelText('Comprobante PDF'), imagen, { applyAccept: false });
      expect(within(dialogo).getByRole('alert')).toHaveTextContent('El comprobante debe ser un archivo PDF.');
    });

    it('registra el pago con el monto y el PDF, y muestra el error que devuelva el servidor', async () => {
      const alRegistrar = vi.fn().mockResolvedValue('El monto no coincide.');
      render(<ModalRegistrarPago compromiso={compromiso} onCerrar={vi.fn()} onRegistrar={alRegistrar} />);
      const dialogo = screen.getByRole('dialog', { name: 'Registrar pago' });

      const pdf = new File(['%PDF'], 'voucher.pdf', { type: 'application/pdf' });
      await userEvent.upload(within(dialogo).getByLabelText('Comprobante PDF'), pdf);
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Registrar pago' }));

      expect(alRegistrar).toHaveBeenCalledWith({ compromisoId: 7, montoPagado: 400, comprobante: pdf });
      expect(await within(dialogo).findByRole('alert')).toHaveTextContent('El monto no coincide.');
    });
  });

  describe('Rechazar pago', () => {
    it('no deja rechazar sin motivo y marca el campo como inválido', async () => {
      const alConfirmar = vi.fn();
      render(<ModalRechazarPago pago={{ id: 12 }} onCerrar={vi.fn()} onConfirmar={alConfirmar} />);
      const dialogo = screen.getByRole('dialog', { name: 'Rechazar pago #12' });

      await userEvent.click(within(dialogo).getByRole('button', { name: 'Rechazar pago' }));
      const motivo = within(dialogo).getByLabelText(/Motivo del rechazo/);
      expect(motivo).toHaveAttribute('aria-invalid', 'true');
      expect(within(dialogo).getByText('Escribe el motivo del rechazo.')).toBeInTheDocument();
      expect(alConfirmar).not.toHaveBeenCalled();
    });

    it('entrega el motivo sin espacios sobrantes y muestra el error del servidor', async () => {
      const alConfirmar = vi.fn();
      render(
        <ModalRechazarPago
          pago={{ id: 12 }}
          errorServicio="No se pudo rechazar el pago."
          onCerrar={vi.fn()}
          onConfirmar={alConfirmar}
        />
      );
      const dialogo = screen.getByRole('dialog', { name: 'Rechazar pago #12' });

      await userEvent.type(within(dialogo).getByLabelText(/Motivo del rechazo/), '  Comprobante ilegible  ');
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Rechazar pago' }));

      expect(alConfirmar).toHaveBeenCalledWith('Comprobante ilegible');
      expect(within(dialogo).getByRole('alert')).toHaveTextContent('No se pudo rechazar el pago.');
    });

    it('cuenta los caracteres del motivo', async () => {
      render(<ModalRechazarPago pago={{ id: 12 }} onCerrar={vi.fn()} onConfirmar={vi.fn()} />);
      const dialogo = screen.getByRole('dialog', { name: 'Rechazar pago #12' });

      await userEvent.type(within(dialogo).getByLabelText(/Motivo del rechazo/), 'Ilegible');
      expect(within(dialogo).getByText('8/300 caracteres')).toBeInTheDocument();
    });
  });
});
