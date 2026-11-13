import { DIAS } from '../../constants/horarios.js';

// TODO(backend): datos ficticios. Eliminar al integrar los endpoints de horarios.
//
// Una "asignación" es la relación Curso–Docente–Sección (en el backend, AsignacionCurso).
// Un bloque del horario referencia una asignación, un día, un rango de horas y un aula.

const LATENCIA_MS = 300;

const GRADOS = [
  { id: '1', nombre: '1ro Secundaria' },
  { id: '2', nombre: '2do Secundaria' },
  { id: '3', nombre: '3ro Secundaria' },
  { id: '4', nombre: '4to Secundaria' },
  { id: '5', nombre: '5to Secundaria' }
];

const SECCIONES = ['A', 'B', 'C'].map((nombre) => ({
  id: nombre,
  nombre,
  gradoId: '4',
  anioAcademicoId: '2',
  anioAcademico: 2026
}));

const CURSOS = [
  { id: 'CUR-0001', nombre: 'Matemáticas' },
  { id: 'CUR-0002', nombre: 'Comunicación' },
  { id: 'CUR-0003', nombre: 'Inglés' },
  { id: 'CUR-0004', nombre: 'Historia' },
  { id: 'CUR-0005', nombre: 'Química' },
  { id: 'CUR-0006', nombre: 'Arte' },
  { id: 'CUR-0007', nombre: 'Educación Física' },
  { id: 'CUR-0008', nombre: 'Geografía' }
];

const DOCENTES = [
  { id: 'DOC-01', nombre: 'Prof. García' },
  { id: 'DOC-02', nombre: 'Prof. Quispe' },
  { id: 'DOC-03', nombre: 'Prof. Torres' },
  { id: 'DOC-04', nombre: 'Prof. Mendoza' },
  { id: 'DOC-05', nombre: 'Prof. Vargas' },
  { id: 'DOC-06', nombre: 'Prof. Romero' }
];

const AULAS = [
  { id: 'AUL-201', nombre: 'Aula 201' },
  { id: 'AUL-202', nombre: 'Aula 202' },
  { id: 'AUL-LAB', nombre: 'Lab. Idiom' },
  { id: 'AUL-TAL', nombre: 'Taller A' },
  { id: 'AUL-GIM', nombre: 'Gimnasio' }
];

const ANIO = { id: '2', anio: 2026, fechaInicio: '2026-03-02', fechaFin: '2026-12-18' };

let siguienteId = 100;

let asignaciones = [
  ['CUR-0001', 'DOC-01'],
  ['CUR-0002', 'DOC-02'],
  ['CUR-0003', 'DOC-03'],
  ['CUR-0004', 'DOC-04'],
  ['CUR-0005', 'DOC-05'],
  ['CUR-0006', 'DOC-05'],
  ['CUR-0007', 'DOC-06'],
  ['CUR-0008', 'DOC-04']
].map(([cursoId, docenteId], indice) => ({
  id: `ASG-${indice + 1}`,
  gradoId: '4',
  seccion: 'B',
  cursoId,
  docenteId
}));

asignaciones.push(
  { id: 'ASG-A1', gradoId: '4', seccion: 'A', cursoId: 'CUR-0001', docenteId: 'DOC-01' },
  { id: 'ASG-A2', gradoId: '4', seccion: 'A', cursoId: 'CUR-0003', docenteId: 'DOC-03' }
);

let bloques = [
  // Bloque de dos horas: la matriz debe mostrarlo completo.
  { id: 'BLQ-1', gradoId: '4', seccion: 'B', dia: 'LUNES', horaInicio: '08:00', horaFin: '10:00', asignacionId: 'ASG-1', aulaId: 'AUL-201' },
  { id: 'BLQ-2', gradoId: '4', seccion: 'B', dia: 'LUNES', horaInicio: '10:00', horaFin: '11:00', asignacionId: 'ASG-2', aulaId: 'AUL-202' },
  { id: 'BLQ-3', gradoId: '4', seccion: 'B', dia: 'MARTES', horaInicio: '09:00', horaFin: '10:00', asignacionId: 'ASG-3', aulaId: 'AUL-LAB' },
  { id: 'BLQ-4', gradoId: '4', seccion: 'B', dia: 'MIERCOLES', horaInicio: '11:30', horaFin: '13:30', asignacionId: 'ASG-4', aulaId: 'AUL-TAL' },
  { id: 'BLQ-5', gradoId: '4', seccion: 'B', dia: 'JUEVES', horaInicio: '08:00', horaFin: '09:00', asignacionId: 'ASG-5', aulaId: 'AUL-202' },
  { id: 'BLQ-6', gradoId: '4', seccion: 'B', dia: 'VIERNES', horaInicio: '12:30', horaFin: '13:30', asignacionId: 'ASG-6', aulaId: 'AUL-201' }
];

bloques.push(
  { id: 'BLQ-A1', gradoId: '4', seccion: 'A', dia: 'LUNES', horaInicio: '10:00', horaFin: '11:00', asignacionId: 'ASG-A1', aulaId: 'AUL-201' },
  { id: 'BLQ-A2', gradoId: '4', seccion: 'A', dia: 'MARTES', horaInicio: '08:00', horaFin: '09:00', asignacionId: 'ASG-A2', aulaId: 'AUL-LAB' }
);

function esperar() {
  return new Promise((resolver) => {
    setTimeout(resolver, LATENCIA_MS);
  });
}

function ok(datos) {
  return { exitoso: true, datos: JSON.parse(JSON.stringify(datos)), mensaje: '' };
}

function fallo(mensaje) {
  return { exitoso: false, datos: null, mensaje };
}

function nombreDe(lista, id) {
  return lista.find((elemento) => elemento.id === id)?.nombre ?? id;
}

function vista(asignacion) {
  return {
    ...asignacion,
    cursoNombre: nombreDe(CURSOS, asignacion.cursoId),
    docenteNombre: nombreDe(DOCENTES, asignacion.docenteId)
  };
}

function bloqueVista(bloque) {
  return {
    ...bloque,
    asignacionCursoId: bloque.asignacionId,
    diaSemana: bloque.dia
  };
}

const delSeccion = (gradoId, seccion) => (elemento) =>
  elemento.gradoId === gradoId && elemento.seccion === seccion;

export async function consultarCatalogosMock() {
  await esperar();
  return ok({
    grados: GRADOS,
    secciones: SECCIONES,
    cursos: CURSOS,
    docentes: DOCENTES,
    aulas: AULAS,
    anios: [ANIO],
    bimestres: []
  });
}

export async function listarAsignacionesMock({ gradoId, seccion }) {
  await esperar();
  return ok(asignaciones.filter(delSeccion(gradoId, seccion)).map(vista));
}

export async function crearAsignacionMock({ gradoId, seccion, cursoId, docenteId }) {
  await esperar();
  const repetida = asignaciones.some(
    (asignacion) => delSeccion(gradoId, seccion)(asignacion)
      && asignacion.cursoId === cursoId
      && asignacion.docenteId === docenteId
  );
  if (repetida) {
    return fallo('Esa relación curso-docente ya existe en esta sección.');
  }
  const nueva = { id: `ASG-${siguienteId++}`, gradoId, seccion, cursoId, docenteId };
  asignaciones = [...asignaciones, nueva];
  return ok(vista(nueva));
}

export async function actualizarAsignacionMock(idAsignacion, { cursoId, docenteId }) {
  await esperar();
  const actual = asignaciones.find((asignacion) => asignacion.id === idAsignacion);
  if (!actual) return fallo('No se encontró la asignación indicada.');
  const actualizada = { ...actual, cursoId, docenteId };
  asignaciones = asignaciones.map((asignacion) =>
    asignacion.id === idAsignacion ? actualizada : asignacion
  );
  return ok(vista(actualizada));
}

export async function eliminarAsignacionMock(idAsignacion) {
  await esperar();
  asignaciones = asignaciones.filter((asignacion) => asignacion.id !== idAsignacion);
  bloques = bloques.filter((bloque) => bloque.asignacionId !== idAsignacion);
  return ok(null);
}

export async function obtenerHorarioMock({ gradoId, seccion }) {
  await esperar();
  return ok(bloques.filter(delSeccion(gradoId, seccion)).map(bloqueVista));
}

export async function listarOcupacionesMock({ gradoId, seccion }) {
  await esperar();
  const otras = bloques.filter((bloque) => !delSeccion(gradoId, seccion)(bloque));
  return ok(
    otras.map((bloque) => {
      const asignacion = asignaciones.find((elemento) => elemento.id === bloque.asignacionId);
      return {
        dia: bloque.dia,
        horaInicio: bloque.horaInicio,
        horaFin: bloque.horaFin,
        docenteId: asignacion?.docenteId,
        aulaId: bloque.aulaId,
        seccionNombre: `${nombreDe(GRADOS, bloque.gradoId)} ${bloque.seccion}`
      };
    })
  );
}

export async function guardarHorarioMock({ gradoId, seccion, bloques: nuevos }) {
  await esperar();
  const previos = bloques.filter(delSeccion(gradoId, seccion));
  const idsPrevios = new Set(previos.map((bloque) => String(bloque.id)));
  const idsNuevos = new Set(
    nuevos.filter((bloque) => bloque.id != null).map((bloque) => String(bloque.id))
  );
  const creados = nuevos.filter(
    (bloque) => bloque.id == null || !idsPrevios.has(String(bloque.id))
  ).length;
  const actualizados = nuevos.filter(
    (bloque) => bloque.id != null && idsPrevios.has(String(bloque.id))
  ).length;
  const eliminados = previos.filter(
    (bloque) => !idsNuevos.has(String(bloque.id))
  ).length;

  const guardados = nuevos.map((bloque) => ({
    ...bloque,
    id: bloque.id ?? `BLQ-${siguienteId++}`,
    gradoId,
    seccion
  }));
  bloques = [
    ...bloques.filter((bloque) => !delSeccion(gradoId, seccion)(bloque)),
    ...guardados
  ];

  return ok({
    bloques: guardados.map(bloqueVista),
    creados,
    actualizados,
    eliminados
  });
}

export async function guardarBloquesLoteMock({ seccionId, bloques: nuevos }) {
  await esperar();
  bloques = [
    ...bloques.filter((bloque) => String(bloque.seccion) !== String(seccionId)),
    ...nuevos.map((bloque) => ({
      ...bloque,
      id: bloque.id ?? `BLQ-${siguienteId++}`,
      seccion: seccionId
    }))
  ];
  return ok(null);
}

export async function obtenerPeriodoMatriculaMock(anioId) {
  await esperar();
  return ok({
    periodoId: 1,
    anioAcademicoId: anioId,
    anio: 2026,
    fechaInicio: '2026-10-01',
    fechaFin: '2027-03-01',
    estado: 'VIGENTE',
    asignacionCursoDocenteAbierta: false,
    crudBloquesHorarioAbierta: true,
    generacionSesionesAbierta: false
  });
}

export async function listarBimestresMock(anioId) {
  await esperar();
  return ok([
    { id: 1, nombre: 'BIM_1', fechaInicio: '2026-03-09', fechaFin: '2026-05-08' },
    { id: 2, nombre: 'BIM_2', fechaInicio: '2026-05-18', fechaFin: '2026-07-17' },
    { id: 3, nombre: 'BIM_3', fechaInicio: '2026-08-03', fechaFin: '2026-10-02' },
    { id: 4, nombre: 'BIM_4', fechaInicio: '2026-10-12', fechaFin: '2026-12-18' }
  ].map((bimestre) => ({ ...bimestre, anioAcademicoId: anioId })));
}

function fechasEntre(inicio, fin) {
  const fechas = [];
  const final = new Date(`${fin}T00:00:00Z`);
  for (let fecha = new Date(`${inicio}T00:00:00Z`); fecha <= final; fecha.setUTCDate(fecha.getUTCDate() + 1)) {
    fechas.push(new Date(fecha));
  }
  return fechas;
}

function crearVistaPreviaContrato({ gradoId, seccion, fechaInicio, fechaFin }) {
  const bloquesSeccion = bloques.filter((bloque) =>
    String(bloque.seccion) === String(seccion)
      && (gradoId === undefined || String(bloque.gradoId) === String(gradoId))
  );
  const sesiones = [];
  fechasEntre(fechaInicio, fechaFin).forEach((fecha) => {
    const dia = DIAS[fecha.getUTCDay() - 1];
    if (!dia) return;
    const iso = fecha.toISOString().slice(0, 10);
    bloquesSeccion.filter((bloque) => bloque.dia === dia.id).forEach((bloque) => {
      const asignacion = asignaciones.find((elemento) => elemento.id === bloque.asignacionId);
      sesiones.push({
        bloqueHorarioId: bloque.id,
        fecha: iso,
        horaInicio: bloque.horaInicio,
        horaFin: bloque.horaFin,
        diaSemana: dia.id,
        aulaId: bloque.aulaId,
        aulaNombre: nombreDe(AULAS, bloque.aulaId),
        cursoId: asignacion?.cursoId,
        cursoNombre: nombreDe(CURSOS, asignacion?.cursoId),
        docenteId: asignacion?.docenteId,
        docenteNombre: nombreDe(DOCENTES, asignacion?.docenteId),
        yaExiste: false,
        estado: null
      });
    });
  });
  return sesiones;
}

export async function previsualizarSesionesContratoMock(datos) {
  await esperar();
  const sesiones = crearVistaPreviaContrato(datos);
  return ok({ sesiones, total: sesiones.length });
}

const sesionesContrato = new Map();

export async function generarSesionesContratoMock(datos) {
  await esperar();
  const preview = crearVistaPreviaContrato(datos);
  const omisiones = new Set(
    (datos.sesionesOmitidas ?? []).map(({ bloqueHorarioId, fecha }) => `${bloqueHorarioId}|${fecha}`)
  );
  const clave = `${datos.seccionId}|${datos.fechaInicio}|${datos.fechaFin}`;
  const existentes = new Map(
    (sesionesContrato.get(clave) ?? []).map((sesion) => [
      `${sesion.bloqueHorarioId}|${sesion.fecha}`,
      sesion
    ])
  );

  let sesionesCreadas = 0;
  let sesionesOmitidasCreadas = 0;
  let sesionesOmitidasExistentes = 0;
  let sesionesYaExistentes = 0;

  const generadas = preview.map((sesion, indice) => {
    const claveSesion = `${sesion.bloqueHorarioId}|${sesion.fecha}`;
    const existente = existentes.get(claveSesion);
    if (existente) {
      if (omisiones.has(claveSesion) && existente.estado === 'OMITIDA') {
        sesionesOmitidasExistentes += 1;
      } else {
        sesionesYaExistentes += 1;
      }
      return existente;
    }

    const estado = omisiones.has(claveSesion) ? 'OMITIDA' : 'PROGRAMADA';
    if (estado === 'OMITIDA') sesionesOmitidasCreadas += 1;
    else sesionesCreadas += 1;

    return {
      ...sesion,
      id: `${sesion.fecha}-${sesion.bloqueHorarioId}-${indice + 1}`,
      estado
    };
  });

  sesionesContrato.set(clave, generadas);
  return ok({
    totalBloquesProcesados: new Set(preview.map((sesion) => sesion.bloqueHorarioId)).size,
    sesionesCreadas,
    sesionesYaExistentes,
    sesionesOmitidas: sesionesOmitidasCreadas + sesionesOmitidasExistentes,
    sesionesOmitidasCreadas,
    sesionesOmitidasExistentes,
    errores: []
  });
}

export async function cambiarOmisionSesionMock(sesionId, omitida) {
  await esperar();
  for (const [clave, lista] of sesionesContrato.entries()) {
    const indice = lista.findIndex((sesion) => String(sesion.id) === String(sesionId));
    if (indice < 0) continue;
    const actualizada = {
      ...lista[indice],
      estado: omitida ? 'OMITIDA' : 'PROGRAMADA'
    };
    const siguiente = [...lista];
    siguiente[indice] = actualizada;
    sesionesContrato.set(clave, siguiente);
    return ok(actualizada);
  }
  return { exitoso: false, datos: null, mensaje: 'No se encontró la sesión en el mock.' };
}

export async function listarSesionesContratoMock({ seccionId, fechaInicio, fechaFin }) {
  await esperar();
  const clave = `${seccionId}|${fechaInicio}|${fechaFin}`;
  return ok(sesionesContrato.get(clave) ?? []);
}
