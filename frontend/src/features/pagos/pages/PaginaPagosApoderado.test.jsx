import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../services/pagosApoderadoService.js', () => ({
  listarAniosAcademicos: vi.fn(),
  listarEstudiantesApoderado: vi.fn(),
  listarCompromisosApoderado: vi.fn(),
  listarPagosCompromiso: vi.fn(),
  registrarPagoApoderado: vi.fn()
}));

import {
  listarAniosAcademicos,
  listarCompromisosApoderado,
  listarEstudiantesApoderado,
  listarPagosCompromiso
} from '../services/pagosApoderadoService.js';
import PaginaPagosApoderado from './PaginaPagosApoderado.jsx';

const ok = (datos) => Promise.resolve({ exitoso: true, datos, mensaje: '' });

beforeEach(() => {
  const anioActual = new Date().getFullYear();
  listarAniosAcademicos.mockReturnValue(ok([
    { id: 1, anio: anioActual, fechaInicio: `${anioActual}-01-01`, fechaFin: `${anioActual}-12-31` }
  ]));
  listarEstudiantesApoderado.mockReturnValue(ok([
    { id: 5, nombreCompleto: 'Mateo Herrera Campos', gradoNombre: '1er Grado de Secundaria', seccionNombre: 'A', anioAcademico: anioActual },
    { id: 6, nombreCompleto: 'Lucía Herrera Campos', gradoNombre: '3er Grado de Secundaria', seccionNombre: 'B', anioAcademico: anioActual }
  ]));
  listarCompromisosApoderado.mockReturnValue(ok([
    {
      id: 77,
      tipoCompromiso: 'PENSION',
      mes: 'MARZO',
      fechaEmision: `${anioActual}-03-02`,
      montoTotal: 400,
      montoOriginal: 400,
      montoMora: 0,
      estadoCompromiso: 'PENDIENTE',
      sePuedeRegistrarPago: true
    }
  ]));
  listarPagosCompromiso.mockReturnValue(ok([]));
});

describe('Mis pagos (apoderado)', () => {
  it('usa el título sin sobretítulo y los selectores compartidos, sin tarjeta alrededor de los filtros', async () => {
    render(<PaginaPagosApoderado />);
    expect(await screen.findByText('Compromiso #77')).toBeInTheDocument();

    const cabecera = screen.getAllByRole('banner')[0];
    expect(within(cabecera).getByRole('heading', { name: 'Mis pagos' })).toBeInTheDocument();
    expect(within(cabecera).queryByText('Módulo de pagos')).not.toBeInTheDocument();

    const filtros = screen.getByRole('region', { name: 'Filtros de pagos' });
    expect(within(filtros).getByLabelText('Año académico').tagName).toBe('SELECT');
    const estudiante = within(filtros).getByLabelText('Estudiante a cargo');
    expect(estudiante).toHaveValue('5');
    expect(within(filtros).getByRole('button', { name: 'Actualizar' })).toBeEnabled();
  });

  it('cambia de estudiante y consulta sus compromisos', async () => {
    render(<PaginaPagosApoderado />);
    await screen.findByText('Compromiso #77');

    await userEvent.selectOptions(screen.getByLabelText('Estudiante a cargo'), '6');
    await vi.waitFor(() => expect(listarCompromisosApoderado).toHaveBeenLastCalledWith('6', expect.any(Number)));
  });

  it('abre "Registrar pago" en un diálogo con el compromiso elegido', async () => {
    render(<PaginaPagosApoderado />);
    await screen.findByText('Compromiso #77');

    await userEvent.click(screen.getByRole('button', { name: 'Registrar pago' }));
    const dialogo = screen.getByRole('dialog', { name: 'Registrar pago' });
    expect(within(dialogo).getByLabelText('Comprobante PDF')).toBeInTheDocument();
  });
});
