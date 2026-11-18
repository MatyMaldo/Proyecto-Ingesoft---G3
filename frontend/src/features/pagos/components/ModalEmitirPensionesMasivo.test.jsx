import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../matriculas/services/matriculasService.js', () => ({
  contarMatriculasPorEstado: vi.fn(async () => ({
    exitoso: true,
    datos: { confirmadas: 3 }
  }))
}));

import ModalEmitirPensionesMasivo from './ModalEmitirPensionesMasivo.jsx';

const anios = [{ id: 1, anio: 2026 }];

function job(estado) {
  return {
    estado,
    porcentaje: estado === 'FALLIDO' ? 0 : 40,
    procesados: estado === 'FALLIDO' ? 0 : 1,
    total: 3,
    exitosos: 0,
    omitidos: 0,
    errores: estado === 'FALLIDO' ? 1 : 0,
    detalleErrores: estado === 'FALLIDO' ? ['El año académico no está vigente.'] : [],
    fase: estado === 'FALLIDO' ? 'FALLIDO' : 'EN_PROCESO'
  };
}

function operacion(sobrescrituras = {}) {
  return {
    job: null,
    jobId: null,
    iniciando: false,
    error: '',
    enCurso: false,
    iniciar: vi.fn(async () => ({ exitoso: true })),
    reiniciar: vi.fn(),
    ...sobrescrituras
  };
}

function mostrar(operacionPension) {
  return render(
    <ModalEmitirPensionesMasivo
      anios={anios}
      anioInicialId="1"
      onCerrar={vi.fn()}
      operacion={operacionPension}
    />
  );
}

describe('ModalEmitirPensionesMasivo', () => {
  it('limpia una operación anterior ya terminada al abrir el diálogo', async () => {
    const op = operacion({ job: job('FALLIDO') });
    mostrar(op);

    await waitFor(() => expect(op.reiniciar).toHaveBeenCalledTimes(1));
  });

  it('conserva la operación si todavía está en curso', () => {
    const op = operacion({ job: job('EN_PROCESO'), enCurso: true });
    mostrar(op);

    expect(op.reiniciar).not.toHaveBeenCalled();
  });

  it('permite reintentar un fallo sin cerrar el diálogo', async () => {
    const op = operacion({ job: job('EN_PROCESO'), enCurso: true });
    const { rerender } = mostrar(op);
    expect(op.reiniciar).not.toHaveBeenCalled();

    rerender(
      <ModalEmitirPensionesMasivo
        anios={anios}
        anioInicialId="1"
        onCerrar={vi.fn()}
        operacion={{ ...op, job: job('FALLIDO'), enCurso: false }}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(op.reiniciar).toHaveBeenCalledTimes(1);
  });
});
