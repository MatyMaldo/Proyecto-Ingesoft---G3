import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import EstadoPeriodo from './EstadoPeriodo.jsx';

const props = {
  periodo: { estado: 'SIN_INICIAR' },
  error: '',
  asignacionesAbiertas: true,
  bloquesAbiertos: false,
  sesionesAbiertas: false
};

describe('EstadoPeriodo', () => {
  it('muestra el año junto al periodo de matrícula', () => {
    render(<EstadoPeriodo {...props} estado="listo" anio={2027} />);

    expect(screen.getByText('Periodo de matrícula · 2027')).toBeInTheDocument();
    expect(screen.getByText('En preparación')).toBeInTheDocument();
  });

  it('incluye el año mientras consulta el periodo', () => {
    render(<EstadoPeriodo {...props} estado="cargando" anio={2027} />);

    expect(
      screen.getByText('Consultando el periodo de matrícula de 2027…')
    ).toBeInTheDocument();
  });
});
