import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

const compromisos = [
  {
    compromisoId: 11,
    tipoCompromiso: 'PENSION',
    mes: 'MARZO',
    estadoCompromiso: 'PENDIENTE',
    fechaEmision: '2026-03-01',
    montoOriginal: 280,
    montoMora: 5,
    montoTotal: 285,
    pagos: [
      { id: 7, estado: 'PENDIENTE', fechaRegistro: '2026-03-10', montoPagado: 280, evidenciaUrl: null }
    ]
  },
  {
    compromisoId: 10,
    tipoCompromiso: 'MATRICULA',
    estadoCompromiso: 'PAGADO',
    fechaEmision: '2026-02-01',
    montoOriginal: 450,
    montoMora: 0,
    montoTotal: 450,
    pagos: [
      { id: 5, estado: 'VALIDADO', fechaRegistro: '2026-02-03', montoPagado: 450, evidenciaUrl: null },
      { id: 6, estado: 'VALIDADO', fechaRegistro: '2026-02-04', montoPagado: 0, evidenciaUrl: null }
    ]
  },
  {
    compromisoId: 12,
    tipoCompromiso: 'PENSION',
    mes: 'ABRIL',
    estadoCompromiso: 'PENDIENTE',
    fechaEmision: '2026-04-01',
    montoOriginal: 280,
    montoMora: 0,
    montoTotal: 280,
    pagos: []
  }
];

vi.mock('../services/pagosService.js', () => ({
  listarPagosAgrupados: vi.fn(async () => ({
    exitoso: true,
    datos: { content: compromisos, totalElements: 3, totalPages: 1 }
  })),
  obtenerPeriodoMatricula: vi.fn(async () => ({ exitoso: true, datos: { estado: 'VIGENTE' } })),
  validarPagoAdmin: vi.fn(),
  rechazarPagoAdmin: vi.fn()
}));

import ModalPagosEstudiante from './ModalPagosEstudiante.jsx';

const ALUMNO = {
  id: 3,
  nombre: 'Luis Ramirez Torres',
  anioAcademicoId: 2,
  gradoId: 1,
  seccionId: 3,
  gradoNombre: '1er Grado',
  seccionNombre: 'A',
  anioAcademico: 2026
};

async function abrir() {
  render(<ModalPagosEstudiante alumno={ALUMNO} anio={{ id: 2, anio: 2026 }} onCerrar={vi.fn()} />);
  await screen.findByText('Compromiso #11', {}, { timeout: 4000 });
}

describe('ModalPagosEstudiante · compromisos desplegables', () => {
  it('muestra en la cabecera cuántos pagos tiene cada compromiso, sin el botón «Ver pagos»', async () => {
    await abrir();

    expect(screen.getByRole('button', { name: /pagos de Pensión · MARZO \(1 pago\)/ })).toHaveTextContent('1 pago');
    expect(screen.getByRole('button', { name: /pagos de Matrícula \(2 pagos\)/ })).toHaveTextContent('2 pagos');
    expect(screen.queryByRole('button', { name: /Ver pagos/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ocultar pagos/ })).not.toBeInTheDocument();
  });

  it('un compromiso sin pagos no se puede desplegar', async () => {
    await abrir();

    const abril = screen.getByText('Compromiso #12').closest('section');
    expect(within(abril).getByText('Sin pagos')).toBeInTheDocument();
    expect(within(abril).queryByRole('button')).not.toBeInTheDocument();
    expect(within(abril).queryByRole('table')).not.toBeInTheDocument();
  });

  it('al pulsar la cabecera se abre y se cierra la tabla de pagos', async () => {
    await abrir();

    // El pagado y sin pagos por validar empieza plegado.
    const matricula = screen.getByText('Compromiso #10').closest('section');
    expect(within(matricula).queryByRole('table')).not.toBeInTheDocument();

    await userEvent.click(within(matricula).getByText('Matrícula'));
    expect(within(matricula).getByRole('table')).toBeInTheDocument();
    expect(within(matricula).getByRole('button', { name: /Ocultar los pagos/ })).toHaveAttribute('aria-expanded', 'true');

    // El contador (un botón) también alterna, y una sola vez.
    await userEvent.click(within(matricula).getByRole('button', { name: /Ocultar los pagos/ }));
    expect(within(matricula).queryByRole('table')).not.toBeInTheDocument();
  });

  it('el compromiso con un pago por validar empieza abierto', async () => {
    await abrir();

    const marzo = screen.getByText('Compromiso #11').closest('section');
    expect(within(marzo).getByRole('table')).toBeInTheDocument();
  });
});
