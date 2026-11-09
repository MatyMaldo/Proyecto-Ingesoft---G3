import { beforeEach, describe, expect, it, vi } from 'vitest';

const solicitar = vi.hoisted(() => vi.fn());

vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  listarCompromisosApoderado,
  listarEstudiantesApoderado,
  listarPagosCompromiso,
  registrarPagoApoderado
} from './pagosApoderadoService.js';

describe('pagosApoderadoService', () => {
  beforeEach(() => {
    solicitar.mockReset();
    solicitar.mockResolvedValue({ exitoso: true, datos: [], mensaje: '' });
  });

  it('consulta estudiantes del apoderado por año', async () => {
    await listarEstudiantesApoderado(2);

    expect(solicitar).toHaveBeenCalledWith('/usuarios/apoderados/me/estudiantes', {
      parametros: { anioId: 2 }
    });
  });

  it('consulta compromisos y pagos del estudiante', async () => {
    await listarCompromisosApoderado(5, 2026);
    await listarPagosCompromiso(11);

    expect(solicitar).toHaveBeenNthCalledWith(
      1,
      '/compromisos-pago/apoderado/estudiante/5',
      { parametros: { anio: 2026 } }
    );
    expect(solicitar).toHaveBeenNthCalledWith(
      2,
      '/pagos/apoderado/compromiso/11'
    );
  });

  it('registra el pago como multipart con comprobante PDF', async () => {
    const comprobante = new File(['pdf'], 'boleta.pdf', { type: 'application/pdf' });

    await registrarPagoApoderado({
      compromisoId: 11,
      montoPagado: 280.5,
      comprobante
    });

    const [, opciones] = solicitar.mock.calls[0];
    expect(solicitar.mock.calls[0][0]).toBe('/pagos/apoderado/registrar');
    expect(opciones.metodo).toBe('POST');
    expect(opciones.tiempoEsperaMs).toBe(60000);
    expect(opciones.cuerpoFormulario.get('compromisoId')).toBe('11');
    expect(opciones.cuerpoFormulario.get('montoPagado')).toBe('280.5');
    expect(opciones.cuerpoFormulario.get('comprobante')).toBe(comprobante);
  });
});
