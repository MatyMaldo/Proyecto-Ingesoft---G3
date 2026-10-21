import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';

import DetalleTransaccion from './DetalleTransaccion.jsx';

// jsdom no implementa showModal()/close() de <dialog>; se simulan para que el
// componente pueda abrir el diálogo en el entorno de pruebas.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
});

function construirRegistro(sobrescritura = {}) {
  return {
    id: 'AUD-0006',
    idElemento: 'PAGO-0006',
    fechaHoraIso: '2026-09-16T15:40:00-05:00',
    fecha: '2026-09-16',
    hora: '15:40',
    fechaHoraCompleta: '2026-09-16 15:40:00',
    usuario: { nombre: 'Lucía Paredes', rol: 'Apoderado', iniciales: 'LP' },
    modulo: { codigo: 'PAGOS', etiqueta: 'Pagos', tono: 'turquesa' },
    tipoTransaccion: 'Registró comprobante de pago',
    valoresAntes: null,
    valoresDespues: [{ campo: 'Estado', valor: 'Pendiente de validación' }],
    ...sobrescritura
  };
}

const HISTORIAL_ASCENDENTE = [
  construirRegistro({ id: 'AUD-0006', tipoTransaccion: 'Registró comprobante de pago' }),
  construirRegistro({
    id: 'AUD-0013',
    fecha: '2026-09-16',
    hora: '18:20',
    tipoTransaccion: 'Observó pago',
    usuario: { nombre: 'Administrador', rol: 'Administrador', iniciales: 'A' }
  }),
  construirRegistro({ id: 'AUD-0014', fecha: '2026-09-17', hora: '08:30', tipoTransaccion: 'Reenvió comprobante de pago' }),
  construirRegistro({
    id: 'AUD-0007',
    fecha: '2026-09-17',
    hora: '09:15',
    tipoTransaccion: 'Validó pago',
    usuario: { nombre: 'Administrador', rol: 'Administrador', iniciales: 'A' }
  })
];

describe('HU-SAT-04 · Escenario 1: ningún botón de editar o eliminar en el detalle de solo lectura', () => {
  it('solo ofrece los botones Cerrar (y Reintentar en caso de error)', () => {
    render(
      <DetalleTransaccion
        registro={construirRegistro()}
        historial={{ estado: 'listo', registros: HISTORIAL_ASCENDENTE }}
        alReintentarHistorial={vi.fn()}
        alCerrar={vi.fn()}
      />
    );

    const botones = screen.getAllByRole('button');
    botones.forEach((boton) => {
      const nombreAccesible = boton.getAttribute('aria-label') ?? boton.textContent;
      expect(nombreAccesible).not.toMatch(/editar/i);
      expect(nombreAccesible).not.toMatch(/eliminar/i);
    });
    expect(screen.getByRole('button', { name: 'Cerrar detalle' })).toBeInTheDocument();
    expect(screen.getByText('Solo lectura')).toBeInTheDocument();
  });
});

describe('HU-SAT-04 · Escenario 3: historial de la transacción, del más antiguo al más reciente', () => {
  it('muestra los registros del historial en el mismo orden ascendente recibido', () => {
    render(
      <DetalleTransaccion
        registro={HISTORIAL_ASCENDENTE[0]}
        historial={{ estado: 'listo', registros: HISTORIAL_ASCENDENTE }}
        alReintentarHistorial={vi.fn()}
        alCerrar={vi.fn()}
      />
    );

    expect(screen.getByText(/Del más antiguo al más reciente/)).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    // Verifica el orden de los tipos de transacción tal como aparecen en el documento.
    const textos = items.map((item) => item.textContent);
    expect(textos[0]).toMatch(/Registró comprobante de pago/);
    expect(textos[1]).toMatch(/Observó pago/);
    expect(textos[2]).toMatch(/Reenvió comprobante de pago/);
    expect(textos[3]).toMatch(/Validó pago/);
  });

  it('muestra el estado de carga y el de error del historial, con el botón Reintentar', () => {
    const alReintentarHistorial = vi.fn();
    const { rerender } = render(
      <DetalleTransaccion
        registro={construirRegistro()}
        historial={{ estado: 'cargando', registros: [] }}
        alReintentarHistorial={alReintentarHistorial}
        alCerrar={vi.fn()}
      />
    );
    expect(screen.getByText('Cargando…')).toBeInTheDocument();

    rerender(
      <DetalleTransaccion
        registro={construirRegistro()}
        historial={{ estado: 'error', registros: [] }}
        alReintentarHistorial={alReintentarHistorial}
        alCerrar={vi.fn()}
      />
    );
    expect(screen.getByText('Se registró un error inesperado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
  });
});
