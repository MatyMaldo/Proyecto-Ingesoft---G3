const LATENCIA_MS = 250;

const CURSOS = [
  { id: 'CUR-0001', nombre: 'Matemáticas' },
  { id: 'CUR-0002', nombre: 'Comunicación' },
  { id: 'CUR-0004', nombre: 'Historia' }
];

const ESTUDIANTES = [
  { estudianteId: 'EST-001', codigo: 'EST-001', nombreCompleto: 'María López García' },
  { estudianteId: 'EST-002', codigo: 'EST-002', nombreCompleto: 'Carlos Ramírez Soto' },
  { estudianteId: 'EST-003', codigo: 'EST-003', nombreCompleto: 'Lucas Torres Vega' }
];

const sesiones = new Map();

function esperar() {
  return new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));
}

function ok(datos) {
  return { exitoso: true, datos, mensaje: '' };
}

function fallo(mensaje) {
  return { exitoso: false, datos: null, mensaje };
}

function crearDetalle(sesion) {
  const clave = String(sesion?.id ?? sesion?.sesionId ?? '');
  return {
    sesionId: sesion?.id ?? sesion?.sesionId ?? null,
    cursoId: sesion?.cursoId ?? null,
    cursoNombre: sesion?.cursoNombre ?? 'Curso',
    seccionId: sesion?.seccionId ?? null,
    seccionNombre: sesion?.seccionNombre ?? '',
    gradoNombre: sesion?.gradoNombre ?? '',
    docenteId: sesion?.docenteId ?? null,
    docenteNombre: sesion?.docenteNombre ?? '',
    fecha: sesion?.fecha ?? null,
    horaInicio: sesion?.horaInicio ?? null,
    horaFin: sesion?.horaFin ?? null,
    estadoSesion: sesion?.estado ?? 'PROGRAMADA',
    asistenciaDocente: null,
    estudiantes: ESTUDIANTES.map((estudiante) => ({
      ...estudiante,
      estado: null,
      observaciones: ''
    })),
    puedeRegistrarDocente: true,
    puedeRegistrarEstudiantes: true,
    motivoDocente: null,
    motivoEstudiantes: null,
    clave
  };
}

export async function obtenerAsistenciaSesionMock(sesion) {
  await esperar();
  const clave = String(sesion?.id ?? sesion?.sesionId ?? '');
  if (!clave) return fallo('No se identificó la sesión.');

  if (!sesiones.has(clave)) {
    const detalle = crearDetalle(sesion);
    const estado = String(sesion?.estado ?? 'PROGRAMADA').toUpperCase();
    detalle.puedeRegistrarDocente = estado === 'PROGRAMADA' || estado === 'ACTIVA';
    detalle.puedeRegistrarEstudiantes = estado === 'PROGRAMADA' || estado === 'ACTIVA';
    if (estado === 'OMITIDA') {
      detalle.motivoDocente = 'La sesión está omitida.';
      detalle.motivoEstudiantes = 'La sesión está omitida.';
    } else if (estado === 'FINALIZADA') {
      detalle.motivoDocente = 'La sesión ya finalizó.';
      detalle.motivoEstudiantes = 'La sesión ya finalizó.';
    }
    sesiones.set(clave, detalle);
  }

  return ok({ ...sesiones.get(clave) });
}

export async function guardarAsistenciaEstudiantesMock(sesionId, asistencias) {
  await esperar();
  const clave = String(sesionId);
  const detalle = sesiones.get(clave);
  if (!detalle) return fallo('No se encontró la sesión en el mock.');
  if (!detalle.puedeRegistrarEstudiantes) {
    return fallo(detalle.motivoEstudiantes || 'No se puede registrar la asistencia.');
  }
  if (!Array.isArray(asistencias) || asistencias.length !== detalle.estudiantes.length) {
    return fallo('Debes marcar la asistencia de todos los estudiantes.');
  }

  const porId = new Map(asistencias.map((item) => [String(item.estudianteId), item]));
  const actualizado = {
    ...detalle,
    estudiantes: detalle.estudiantes.map((estudiante) => {
      const cambio = porId.get(String(estudiante.estudianteId));
      return cambio
        ? {
          ...estudiante,
          estado: cambio.estado,
          observaciones: cambio.observaciones ?? '',
          fechaHoraRegistro: new Date().toISOString()
        }
        : estudiante;
    })
  };
  sesiones.set(clave, actualizado);
  return ok({ ...actualizado });
}

export async function registrarAsistenciaDocenteMock(sesionId) {
  await esperar();
  const clave = String(sesionId);
  const detalle = sesiones.get(clave);
  if (!detalle) return fallo('No se encontró la sesión en el mock.');
  if (!detalle.puedeRegistrarDocente) {
    return fallo(detalle.motivoDocente || 'No se puede registrar la asistencia docente.');
  }
  if (detalle.asistenciaDocente) return ok({ ...detalle });

  const ahora = new Date();
  const inicio = new Date(`${detalle.fecha}T${String(detalle.horaInicio).slice(0, 8)}`);
  const minutos = Math.max(0, Math.floor((ahora.getTime() - inicio.getTime()) / 60000));
  const estado = minutos <= 10 ? 'PRESENTE' : 'TARDANZA';
  const actualizado = {
    ...detalle,
    asistenciaDocente: {
      estado,
      fechaHoraRegistro: ahora.toISOString()
    }
  };
  sesiones.set(clave, actualizado);
  return ok(actualizado.asistenciaDocente);
}

const REGISTROS = [
  {
    id: 'ASI-001',
    fecha: '2026-09-19',
    cursoId: 'CUR-0002',
    cursoNombre: 'Comunicación',
    seccionNombre: 'B',
    gradoNombre: '4to Grado',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'PRESENTE',
    observaciones: ''
  },
  {
    id: 'ASI-002',
    fecha: '2026-09-16',
    cursoId: 'CUR-0002',
    cursoNombre: 'Comunicación',
    seccionNombre: 'B',
    gradoNombre: '4to Grado',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'PRESENTE',
    observaciones: ''
  },
  {
    id: 'ASI-003',
    fecha: '2026-09-11',
    cursoId: 'CUR-0002',
    cursoNombre: 'Comunicación',
    seccionNombre: 'B',
    gradoNombre: '4to Grado',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'PRESENTE',
    observaciones: ''
  },
  {
    id: 'ASI-004',
    fecha: '2026-09-09',
    cursoId: 'CUR-0002',
    cursoNombre: 'Comunicación',
    seccionNombre: 'B',
    gradoNombre: '4to Grado',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'TARDANZA',
    observaciones: 'Tardanza leve'
  },
  {
    id: 'ASI-005',
    fecha: '2026-09-04',
    cursoId: 'CUR-0001',
    cursoNombre: 'Matemáticas',
    seccionNombre: 'B',
    gradoNombre: '4to Grado',
    horaInicio: '10:00',
    horaFin: '12:00',
    estado: 'FALTA',
    observaciones: 'No asistió'
  },
  {
    id: 'ASI-006',
    fecha: '2026-09-02',
    cursoId: 'CUR-0001',
    cursoNombre: 'Matemáticas',
    seccionNombre: 'B',
    gradoNombre: '4to Grado',
    horaInicio: '10:00',
    horaFin: '12:00',
    estado: 'PRESENTE',
    observaciones: ''
  },
  {
    id: 'ASI-007',
    fecha: '2026-08-28',
    cursoId: 'CUR-0004',
    cursoNombre: 'Historia',
    seccionNombre: 'B',
    gradoNombre: '4to Grado',
    horaInicio: '08:00',
    horaFin: '09:00',
    estado: 'JUSTIFICADA',
    observaciones: 'Cita médica'
  }
];

export async function consultarHistorialAsistenciaMock({
  cursoId,
  desde,
  hasta,
  page,
  size
} = {}) {
  await esperar();
  const registrosFiltrados = REGISTROS
    .filter((registro) => !cursoId || String(registro.cursoId) === String(cursoId))
    .filter((registro) => !desde || registro.fecha >= desde)
    .filter((registro) => !hasta || registro.fecha <= hasta)
    .sort((a, b) => (
      b.fecha.localeCompare(a.fecha)
      || String(b.horaInicio).localeCompare(String(a.horaInicio))
    ));

  const tamano = Number.isInteger(size) && size > 0 ? Math.min(size, 100) : 10;
  const pagina = Number.isInteger(page) && page >= 0 ? page : 0;
  const totalRegistros = registrosFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistros / tamano);
  const registros = registrosFiltrados.slice(pagina * tamano, (pagina + 1) * tamano);
  const totalPresentes = registrosFiltrados.filter((registro) => registro.estado === 'PRESENTE').length;
  const totalTardanzas = registrosFiltrados.filter((registro) => registro.estado === 'TARDANZA').length;
  const totalFaltas = registrosFiltrados.filter((registro) => registro.estado === 'FALTA').length;
  const totalJustificadas = registrosFiltrados.filter((registro) => registro.estado === 'JUSTIFICADA').length;
  const porcentajeAsistencia = totalRegistros > 0
    ? Number((((totalPresentes + totalTardanzas) / totalRegistros) * 100).toFixed(2))
    : 0;

  return ok({
    cursos: CURSOS,
    registros,
    pagina,
    tamano,
    totalRegistros,
    totalPaginas,
    totalPresentes,
    totalTardanzas,
    totalFaltas,
    totalJustificadas,
    porcentajeAsistencia
  });
}

export async function listarEstudiantesACargoMock() {
  await esperar();
  return ok([
    { id: 'EST-001', nombre: 'María López García', codigo: 'EST-001' },
    { id: 'EST-004', nombre: 'Isabella Flores Ruiz', codigo: 'EST-004' }
  ]);
}
