import { DIAS, FRANJAS } from '../../constants/horarios.js';

// TODO(backend): datos ficticios. Eliminar al integrar los endpoints de horarios.
//
// Una "asignación" es la relación Curso–Docente–Sección (en el backend, AsignacionCurso).
// Un bloque del horario referencia una asignación, un día, una franja y un aula.

const LATENCIA_MS = 300;

const GRADOS = [
  { id: '1', nombre: '1ro Secundaria' },
  { id: '2', nombre: '2do Secundaria' },
  { id: '3', nombre: '3ro Secundaria' },
  { id: '4', nombre: '4to Secundaria' },
  { id: '5', nombre: '5to Secundaria' }
];
const SECCIONES = ['A', 'B', 'C'];

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

const BIMESTRES = [
  { id: 'B1', nombre: 'I Bimestre', inicio: '2026-03-09', fin: '2026-05-08' },
  { id: 'B2', nombre: 'II Bimestre', inicio: '2026-05-18', fin: '2026-07-17' },
  { id: 'B3', nombre: 'III Bimestre', inicio: '2026-08-03', fin: '2026-10-02' },
  { id: 'B4', nombre: 'IV Bimestre', inicio: '2026-10-12', fin: '2026-12-18' }
];

const nombreDe = (lista, id) => lista.find((elemento) => elemento.id === id)?.nombre ?? id;

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

// Otra sección (4to A) que ya ocupa a dos docentes de 4to B en ciertos bloques.
asignaciones.push(
  { id: 'ASG-A1', gradoId: '4', seccion: 'A', cursoId: 'CUR-0001', docenteId: 'DOC-01' },
  { id: 'ASG-A2', gradoId: '4', seccion: 'A', cursoId: 'CUR-0003', docenteId: 'DOC-03' }
);

let bloques = [
  ['LUNES', 'F1', 'ASG-1', 'AUL-201'],
  ['MIERCOLES', 'F1', 'ASG-3', 'AUL-LAB'],
  ['VIERNES', 'F1', 'ASG-7', 'AUL-GIM'],
  ['MARTES', 'F2', 'ASG-2', 'AUL-202'],
  ['JUEVES', 'F2', 'ASG-6', 'AUL-TAL'],
  ['LUNES', 'F3', 'ASG-4', 'AUL-202'],
  ['MIERCOLES', 'F3', 'ASG-1', 'AUL-201'],
  ['MARTES', 'F4', 'ASG-5', 'AUL-TAL'],
  ['VIERNES', 'F4', 'ASG-8', 'AUL-202']
].map(([dia, franjaId, asignacionId, aulaId]) => ({
  gradoId: '4',
  seccion: 'B',
  dia,
  franjaId,
  asignacionId,
  aulaId
}));

bloques.push(
  { gradoId: '4', seccion: 'A', dia: 'LUNES', franjaId: 'F2', asignacionId: 'ASG-A1', aulaId: 'AUL-201' },
  { gradoId: '4', seccion: 'A', dia: 'MARTES', franjaId: 'F1', asignacionId: 'ASG-A2', aulaId: 'AUL-LAB' }
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

function vista(asignacion) {
  return {
    ...asignacion,
    cursoNombre: nombreDe(CURSOS, asignacion.cursoId),
    docenteNombre: nombreDe(DOCENTES, asignacion.docenteId)
  };
}

const delSeccion = (gradoId, seccion) => (elemento) =>
  elemento.gradoId === gradoId && elemento.seccion === seccion;

export async function consultarCatalogosMock() {
  await esperar();
  return ok({
    grados: GRADOS,
    secciones: SECCIONES.map((nombre) => ({ id: nombre, nombre })),
    cursos: CURSOS,
    docentes: DOCENTES,
    aulas: AULAS,
    bimestres: BIMESTRES
  });
}

export async function listarAsignacionesMock({ gradoId, seccion }) {
  await esperar();
  return ok(asignaciones.filter(delSeccion(gradoId, seccion)).map(vista));
}

export async function crearAsignacionMock({ gradoId, seccion, cursoId, docenteId }) {
  await esperar();
  const repetida = asignaciones.some(
    (a) => delSeccion(gradoId, seccion)(a) && a.cursoId === cursoId && a.docenteId === docenteId
  );
  if (repetida) {
    return fallo('Esa relación curso-docente ya existe en esta sección.');
  }
  const nueva = { id: `ASG-${siguienteId++}`, gradoId, seccion, cursoId, docenteId };
  asignaciones = [...asignaciones, nueva];
  return ok(vista(nueva));
}

export async function eliminarAsignacionMock(idAsignacion) {
  await esperar();
  asignaciones = asignaciones.filter((a) => a.id !== idAsignacion);
  bloques = bloques.filter((b) => b.asignacionId !== idAsignacion);
  return ok(null);
}

export async function obtenerHorarioMock({ gradoId, seccion }) {
  await esperar();
  return ok(bloques.filter(delSeccion(gradoId, seccion)));
}

export async function listarOcupacionesMock({ gradoId, seccion }) {
  await esperar();
  const otras = bloques.filter((b) => !delSeccion(gradoId, seccion)(b));
  return ok(
    otras.map((b) => {
      const asignacion = asignaciones.find((a) => a.id === b.asignacionId);
      return {
        dia: b.dia,
        franjaId: b.franjaId,
        docenteId: asignacion?.docenteId,
        aulaId: b.aulaId,
        seccionNombre: `${nombreDe(GRADOS, b.gradoId)} ${b.seccion}`
      };
    })
  );
}

export async function guardarHorarioMock({ gradoId, seccion, bloques: nuevos }) {
  await esperar();
  bloques = [
    ...bloques.filter((b) => !delSeccion(gradoId, seccion)(b)),
    ...nuevos.map((b) => ({ ...b, gradoId, seccion }))
  ];
  return ok(nuevos);
}

// Sesiones generadas: se guardan por sección y bimestre.
const sesionesGeneradas = new Map();
const claveSesiones = ({ gradoId, seccion, bimestreId }) => `${gradoId}|${seccion}|${bimestreId}`;

/** Huella de los bloques actuales de la sección; si cambia después de generar, las sesiones quedan desactualizadas. */
function firmaBloques({ gradoId, seccion }) {
  return JSON.stringify(
    bloques
      .filter(delSeccion(gradoId, seccion))
      .map((b) => `${b.dia}|${b.franjaId}|${b.asignacionId}|${b.aulaId}`)
      .sort()
  );
}

function respuestaSesiones(consulta) {
  const guardado = sesionesGeneradas.get(claveSesiones(consulta));
  return ok({
    sesiones: guardado?.sesiones ?? [],
    desactualizada: guardado ? guardado.firma !== firmaBloques(consulta) : false
  });
}

export async function listarSesionesMock(consulta) {
  await esperar();
  return respuestaSesiones(consulta);
}

/** Crea una sesión por cada bloque guardado y cada fecha del bimestre que cae en su día de la semana. */
export async function generarSesionesMock(consulta) {
  await esperar();
  const bimestre = BIMESTRES.find((b) => b.id === consulta.bimestreId);
  if (!bimestre) {
    return fallo('El bimestre indicado no existe.');
  }
  const delaSeccion = bloques.filter(delSeccion(consulta.gradoId, consulta.seccion));
  if (delaSeccion.length === 0) {
    return fallo('La sección no tiene bloques guardados en el horario.');
  }

  // Lo ya marcado como no disponible se conserva al regenerar.
  const previas = sesionesGeneradas.get(claveSesiones(consulta))?.sesiones ?? [];
  const noDisponibles = new Set(previas.filter((s) => !s.disponible).map((s) => `${s.fecha}|${s.franjaId}`));

  const nuevas = [];
  const fin = new Date(`${bimestre.fin}T00:00:00Z`);
  for (let fecha = new Date(`${bimestre.inicio}T00:00:00Z`); fecha <= fin; fecha.setUTCDate(fecha.getUTCDate() + 1)) {
    const dia = DIAS[fecha.getUTCDay() - 1];
    if (!dia) {
      continue;
    }
    const iso = fecha.toISOString().slice(0, 10);
    delaSeccion
      .filter((bloque) => bloque.dia === dia.id)
      .forEach((bloque) => {
        const franja = FRANJAS.find((f) => f.id === bloque.franjaId);
        const asignacion = asignaciones.find((a) => a.id === bloque.asignacionId);
        nuevas.push({
          id: `SES-${iso}-${bloque.franjaId}`,
          fecha: iso,
          dia: dia.id,
          franjaId: bloque.franjaId,
          inicio: franja.inicio,
          fin: franja.fin,
          cursoNombre: nombreDe(CURSOS, asignacion.cursoId),
          docenteNombre: nombreDe(DOCENTES, asignacion.docenteId),
          aulaNombre: nombreDe(AULAS, bloque.aulaId),
          disponible: !noDisponibles.has(`${iso}|${bloque.franjaId}`)
        });
      });
  }
  nuevas.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.inicio.localeCompare(b.inicio));
  sesionesGeneradas.set(claveSesiones(consulta), { sesiones: nuevas, firma: firmaBloques(consulta) });
  return respuestaSesiones(consulta);
}

export async function guardarDisponibilidadSesionesMock({ cambios, ...consulta }) {
  await esperar();
  const actuales = sesionesGeneradas.get(claveSesiones(consulta));
  const porId = new Map(cambios.map((c) => [c.id, c.disponible]));
  if (actuales) {
    sesionesGeneradas.set(claveSesiones(consulta), {
      ...actuales,
      sesiones: actuales.sesiones.map((s) => (porId.has(s.id) ? { ...s, disponible: porId.get(s.id) } : s))
    });
  }
  return ok(null);
}
