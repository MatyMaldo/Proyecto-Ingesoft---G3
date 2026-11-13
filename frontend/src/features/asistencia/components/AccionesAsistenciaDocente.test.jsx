import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import AccionesAsistenciaDocente from './AccionesAsistenciaDocente.jsx';

const sesion = { id: 4, cursoNombre: 'Matemáticas' };

function asistencia(overrides = {}) {
  return {
    detalle: {
      asistenciaDocente: null,
      estudiantes: [],
      puedeRegistrarDocente: true,
      puedeRegistrarEstudiantes: true,
      motivoDocente: null,
      motivoEstudiantes: null
    },
    cargando: false,
    error: '',
    guardando: false,
    registrarDocente: vi.fn(async () => ({ exitoso: true, datos: null })),
    ...overrides
  };
}

describe('AccionesAsistenciaDocente', () => {
  it('permite registrar la asistencia del docente', () => {
    const datos = asistencia();
    const alNotificar = vi.fn();
    render(
      <AccionesAsistenciaDocente
        sesion={sesion}
        asistencia={datos}
        alAbrirModal={vi.fn()}
        alNotificar={alNotificar}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Registrar mi asistencia' }));
    expect(datos.registrarDocente).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado del docente si ya está registrado', () => {
    render(
      <AccionesAsistenciaDocente
        sesion={sesion}
        asistencia={asistencia({
          detalle: {
            asistenciaDocente: { estado: 'TARDANZA', fechaHoraRegistro: '2026-11-13T08:15:00' },
            estudiantes: [],
            puedeRegistrarDocente: false,
            puedeRegistrarEstudiantes: true,
            motivoDocente: null,
            motivoEstudiantes: null
          }
        })}
        alAbrirModal={vi.fn()}
        alNotificar={vi.fn()}
      />
    );

    expect(screen.getByText('Tardanza')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar mi asistencia' })).not.toBeInTheDocument();
  });

  it('abre el modal de estudiantes', () => {
    const alAbrirModal = vi.fn();
    render(
      <AccionesAsistenciaDocente
        sesion={sesion}
        asistencia={asistencia()}
        alAbrirModal={alAbrirModal}
        alNotificar={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /asistencia de estudiantes/i }));
    expect(alAbrirModal).toHaveBeenCalledTimes(1);
  });
});
