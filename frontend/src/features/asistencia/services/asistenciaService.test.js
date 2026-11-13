import { beforeEach, describe, expect, it, vi } from 'vitest';

const solicitar = vi.hoisted(() => vi.fn(async () => ({
  exitoso: true,
  datos: null,
  mensaje: ''
})));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../../../shared/api/clienteHttp.js', () => ({ solicitar }));

import {
  consultarHistorialAsistencia,
  guardarAsistenciaEstudiantes,
  listarEstudiantesACargo,
  obtenerAsistenciaSesion,
  registrarAsistenciaDocente
} from './asistenciaService.js';

beforeEach(() => solicitar.mockClear());

describe('asistenciaService · contrato backend', () => {
  it('consulta el detalle por sesión', async () => {
    await obtenerAsistenciaSesion({ id: 7 });

    expect(solicitar).toHaveBeenCalledWith('/asistencias/sesiones/7', {
      tiempoEsperaMs: 15000
    });
  });

  it('guarda el roster con observaciones', async () => {
    await guardarAsistenciaEstudiantes(7, [
      { estudianteId: 10, estado: 'PRESENTE', observaciones: '' },
      { estudianteId: 11, estado: 'JUSTIFICADA', observaciones: 'Cita médica' }
    ]);

    expect(solicitar).toHaveBeenCalledWith('/asistencias/sesiones/7/estudiantes', {
      metodo: 'PUT',
      cuerpo: {
        asistencias: [
          { estudianteId: 10, estado: 'PRESENTE', observaciones: '' },
          { estudianteId: 11, estado: 'JUSTIFICADA', observaciones: 'Cita médica' }
        ]
      },
      tiempoEsperaMs: 15000
    });
  });

  it('registra la asistencia docente sin cuerpo', async () => {
    await registrarAsistenciaDocente(7);

    expect(solicitar).toHaveBeenCalledWith('/asistencias/sesiones/7/docente', {
      metodo: 'PUT',
      tiempoEsperaMs: 15000
    });
  });

  it('consulta el historial con la ruta correspondiente al rol', async () => {
    await consultarHistorialAsistencia({
      rol: 'DOCENTE',
      cursoId: '3',
      desde: '2026-11-01',
      hasta: '2026-11-30',
      page: 2,
      size: 5
    });
    await consultarHistorialAsistencia({
      rol: 'ESTUDIANTE'
    });
    await consultarHistorialAsistencia({
      rol: 'APODERADO',
      estudianteId: 15
    });

    expect(solicitar.mock.calls).toEqual([
      ['/asistencias/docente/mi-asistencia', {
        parametros: {
          cursoId: 3,
          desde: '2026-11-01',
          hasta: '2026-11-30',
          page: 2,
          size: 5
        }
      }],
      ['/asistencias/estudiante/mi-asistencia', { parametros: {} }],
      ['/asistencias/apoderado/15', { parametros: {} }]
    ]);
  });

  it('lista los estudiantes a cargo del apoderado', async () => {
    await listarEstudiantesACargo();

    expect(solicitar).toHaveBeenCalledWith('/usuarios/apoderados/me/estudiantes');
  });
});
