import { describe, expect, it } from 'vitest';

import {
  elegirSesionDestacada,
  indicadoresAsistencia,
  indicadoresDeDetalle,
  sesionesDelDia
} from './sesionesDocente.js';

const sesion = (id, fecha, inicio, fin, estado = 'PROGRAMADA', extra = {}) => ({
  id, fecha, horaInicio: `${inicio}:00`, horaFin: `${fin}:00`, estado, cursoNombre: 'Matemáticas', ...extra
});

// Martes 17/11/2026, 09:30 (hora local).
const AHORA = new Date('2026-11-17T09:30:00');

describe('elegirSesionDestacada', () => {
  it('prefiere la clase en curso', () => {
    const r = elegirSesionDestacada([
      sesion(1, '2026-11-17', '12:00', '13:00'),
      sesion(2, '2026-11-17', '09:00', '10:00', 'ACTIVA')
    ], AHORA);
    expect(r.sesion.id).toBe(2);
    expect(r.tipo).toBe('ahora');
  });

  it('sin clase en curso, elige la siguiente de hoy', () => {
    const r = elegirSesionDestacada([sesion(1, '2026-11-17', '12:00', '13:00')], AHORA);
    expect(r).toMatchObject({ tipo: 'hoy', sesion: { id: 1 } });
  });

  it('si hoy ya no hay más, elige la próxima de otro día', () => {
    const r = elegirSesionDestacada([
      sesion(1, '2026-11-17', '08:00', '09:00', 'FINALIZADA'),
      sesion(2, '2026-11-19', '08:00', '09:00')
    ], AHORA);
    expect(r).toMatchObject({ tipo: 'proxima', sesion: { id: 2 } });
  });

  it('ignora omitidas y finalizadas, y devuelve null si no queda ninguna', () => {
    expect(elegirSesionDestacada([
      sesion(1, '2026-11-17', '09:00', '10:00', 'OMITIDA'),
      sesion(2, '2026-11-18', '09:00', '10:00', 'FINALIZADA')
    ], AHORA)).toBeNull();
  });
});

describe('sesionesDelDia', () => {
  it('lista las del día por hora y deja fuera las omitidas salvo que se pidan', () => {
    const lista = [
      sesion(1, '2026-11-17', '10:00', '11:00'),
      sesion(2, '2026-11-17', '08:00', '09:00'),
      sesion(3, '2026-11-17', '09:00', '10:00', 'OMITIDA'),
      sesion(4, '2026-11-18', '08:00', '09:00')
    ];
    expect(sesionesDelDia(lista, '2026-11-17').map((s) => s.id)).toEqual([2, 1]);
    expect(sesionesDelDia(lista, '2026-11-17', { incluirOmitidas: true })).toHaveLength(3);
  });
});

describe('indicadoresAsistencia', () => {
  const base = { asistenciaEstudiantesRegistrada: false, asistenciaDocente: null };

  it('marca pendiente en una sesión activa sin registros', () => {
    const r = indicadoresAsistencia(sesion(1, '2026-11-17', '09:00', '10:00', 'ACTIVA', base));
    expect(r.map((i) => i.texto)).toEqual(['Mi asistencia · Pendiente', 'Estudiantes · Pendiente']);
    expect(r.every((i) => i.tono === 'ambar')).toBe(true);
  });

  it('muestra el estado del docente y que los estudiantes ya están registrados', () => {
    const r = indicadoresAsistencia(sesion(1, '2026-11-17', '09:00', '10:00', 'ACTIVA',
      { asistenciaDocente: 'TARDANZA', asistenciaEstudiantesRegistrada: true }));
    expect(r.map((i) => i.texto)).toEqual(['Mi asistencia · Tardanza', 'Estudiantes · Registrada']);
  });

  it('en una finalizada sin registro dice «Sin registro»', () => {
    const r = indicadoresAsistencia(sesion(1, '2026-11-17', '09:00', '10:00', 'FINALIZADA', base));
    expect(r.map((i) => i.texto)).toEqual(['Mi asistencia · Sin registro', 'Estudiantes · Sin registro']);
  });

  it('no hay indicadores en programadas, omitidas ni cuando la respuesta no los trae', () => {
    expect(indicadoresAsistencia(sesion(1, '2026-11-17', '09:00', '10:00', 'PROGRAMADA', base))).toEqual([]);
    expect(indicadoresAsistencia(sesion(1, '2026-11-17', '09:00', '10:00', 'OMITIDA', base))).toEqual([]);
    expect(indicadoresAsistencia(sesion(1, '2026-11-17', '09:00', '10:00', 'ACTIVA'))).toEqual([]);
  });
});

describe('indicadoresDeDetalle', () => {
  it('resume el detalle de asistencia de una sesión', () => {
    expect(indicadoresDeDetalle({
      asistenciaDocente: { estado: 'PRESENTE' },
      estudiantes: [{ estado: null }, { estado: 'FALTA' }]
    })).toEqual({ asistenciaDocente: 'PRESENTE', asistenciaEstudiantesRegistrada: true });
    expect(indicadoresDeDetalle({ asistenciaDocente: null, estudiantes: [{ estado: null }] }))
      .toEqual({ asistenciaDocente: null, asistenciaEstudiantesRegistrada: false });
  });
});
