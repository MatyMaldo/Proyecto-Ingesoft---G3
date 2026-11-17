import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import InicioDocente from './InicioDocente.jsx';

const activa = {
  id: 7,
  fecha: '2026-11-17',
  horaInicio: '09:00:00',
  horaFin: '10:00:00',
  estado: 'ACTIVA',
  cursoNombre: 'Matemáticas',
  gradoNombre: '1er Grado',
  seccionNombre: 'A',
  aulaNombre: 'Aula 201',
  asistenciaDocente: null,
  asistenciaEstudiantesRegistrada: false
};

const asistencia = {
  detalle: {
    asistenciaDocente: null,
    estudiantes: [],
    puedeRegistrarDocente: true,
    puedeRegistrarEstudiantes: true,
    horaFin: '10:00:00'
  },
  cargando: false,
  error: '',
  guardando: false,
  registrarDocente: vi.fn(async () => ({ exitoso: true }))
};

function dibujar(props = {}) {
  const alAbrirSesion = vi.fn();
  const alAbrirModal = vi.fn();
  render(
    <InicioDocente
      destacada={{ sesion: activa, tipo: 'ahora' }}
      sesionesHoy={[activa]}
      omitidasHoy={0}
      hoy="2026-11-17"
      asistencia={asistencia}
      alAbrirSesion={alAbrirSesion}
      alAbrirModal={alAbrirModal}
      alNotificar={vi.fn()}
      {...props}
    />
  );
  return { alAbrirSesion, alAbrirModal };
}

describe('InicioDocente', () => {
  it('muestra la clase de ahora con las acciones de asistencia a un clic', () => {
    const { alAbrirModal } = dibujar();

    expect(screen.getByText('Ahora')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Matemáticas · 1er Grado A/ })).toBeInTheDocument();
    expect(screen.getByText('Puedes registrar hasta las 10:00.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar mi asistencia' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar asistencia de estudiantes' }));
    expect(alAbrirModal).toHaveBeenCalledTimes(1);
  });

  it('lista las clases de hoy con sus indicadores y abre la sesión elegida', () => {
    const { alAbrirSesion } = dibujar();

    const lista = screen.getByRole('list');
    expect(within(lista).getByText('Mi asistencia · Pendiente')).toBeInTheDocument();
    expect(within(lista).getByText('Estudiantes · Pendiente')).toBeInTheDocument();
    fireEvent.click(within(lista).getByRole('button', { name: /Abrir Matemáticas de 09:00 a 10:00/ }));
    expect(alAbrirSesion).toHaveBeenCalledWith(activa);
  });

  it('una clase de otro día no ofrece acciones de asistencia y dice cuándo es', () => {
    dibujar({
      destacada: { sesion: { ...activa, fecha: '2026-11-19', estado: 'PROGRAMADA' }, tipo: 'proxima' },
      sesionesHoy: []
    });

    expect(screen.getByText('Próxima clase')).toBeInTheDocument();
    expect(screen.getByText(/Jueves 19\/11/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar mi asistencia' })).not.toBeInTheDocument();
    expect(screen.getByText('Hoy no tienes clases.')).toBeInTheDocument();
  });

  it('avisa cuando hoy hay sesiones omitidas y cuando no hay clases próximas', () => {
    dibujar({ destacada: null, sesionesHoy: [], omitidasHoy: 2 });

    expect(screen.getByText('Sin clases próximas')).toBeInTheDocument();
    expect(screen.getByText('2 sesiones omitidas hoy no se muestran.')).toBeInTheDocument();
  });
});
