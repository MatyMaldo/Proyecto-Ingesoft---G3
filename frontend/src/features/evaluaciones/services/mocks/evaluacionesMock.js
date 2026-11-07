import { listarCursosMock } from '../../../cursos/services/mocks/cursosMock.js';
import { consultarEstructuraMock } from '../../../grados-secciones/services/mocks/estructuraEscolarMock.js';
import { registrarRegistroAuditoriaMock } from '../../../auditoria/services/mocks/auditoriaMock.js';

const PAUSA = 220;
const ANIO_VIGENTE = 2026;
const BIMESTRES = [
  { id: 'B1', nombre: 'I Bimestre', inicio: '2026-03-09', fin: '2026-05-08' },
  { id: 'B2', nombre: 'II Bimestre', inicio: '2026-05-18', fin: '2026-07-17' },
  { id: 'B3', nombre: 'III Bimestre', inicio: '2026-08-03', fin: '2026-10-02' },
  { id: 'B4', nombre: 'IV Bimestre', inicio: '2026-10-12', fin: '2026-12-18' }
];

let siguientesId = 1;
let evaluaciones = [];
let notas = [];
let notasCompetencias = [];
const BIMESTRES_FINALIZADOS = BIMESTRES.filter((item) => item.id !== 'B4');
const LIBRETAS_GENERADAS = new Set(['EST-001:1:B1']);
const ESCALA_NOTAS = Object.freeze(['AD', 'A', 'B', 'C']);
const ESTUDIANTES_DEMO = [
  { id: 'EST-001', nombre: 'María López García', codigo: 'EST-001', activo: true, seccionId: 1, matriculaEstado: 'CONFIRMADA' },
  { id: 'EST-002', nombre: 'Carlos Ramírez Soto', codigo: 'EST-002', activo: true, seccionId: 1, matriculaEstado: 'CONFIRMADA' },
  { id: 'EST-003', nombre: 'Lucas Torres Vega', codigo: 'EST-003', activo: true, seccionId: 2, matriculaEstado: 'CONFIRMADA' },
  { id: 'EST-004', nombre: 'Isabella Flores Ruiz', codigo: 'EST-004', activo: true, seccionId: 2, matriculaEstado: 'CONFIRMADA' },
  { id: 'EST-005', nombre: 'Mateo Herrera Campos', codigo: 'EST-005', activo: false, seccionId: 1, matriculaEstado: 'CONFIRMADA' }
];

const esperar = () => new Promise((resolver) => setTimeout(resolver, PAUSA));
const copiar = (valor) => structuredClone(valor);
const fallo = (mensaje) => ({ exitoso: false, datos: null, mensaje });

/** Contexto de muestra: el docente demo tiene Matemáticas y Comunicación en 1.° A/B. */
export async function listarContextoDocenteMock(usuario) {
  await esperar();
  const [respuestaCursos, respuestaEstructura] = await Promise.all([
    listarCursosMock(), consultarEstructuraMock()
  ]);
  if (!respuestaCursos.exitoso) return respuestaCursos;
  if (!respuestaEstructura.exitoso) return respuestaEstructura;

  const anio = respuestaEstructura.datos.anios.find((item) => item.anio === ANIO_VIGENTE);
  if (!anio) return fallo('No se encontró el año académico vigente.');

  const cursosAsignados = String(usuario?.id) === '3' ? ['CUR-0001', 'CUR-0002'] : [];
  const gradosAsignados = new Set(['1']);
  const secciones = respuestaEstructura.datos.secciones
    .filter((seccion) => String(seccion.anioAcademicoId) === String(anio.id)
      && gradosAsignados.has(String(seccion.gradoId)))
    .map((seccion) => ({
      id: seccion.id,
      nombre: seccion.nombre,
      gradoId: seccion.gradoId,
      gradoNombre: respuestaEstructura.datos.grados.find((grado) => String(grado.id) === String(seccion.gradoId))?.nombre ?? ''
    }));

  return {
    exitoso: true,
    mensaje: '',
    datos: {
      docente: { id: usuario?.id, nombre: usuario?.nombre ?? 'Docente' },
      anioAcademico: { id: anio.id, anio: anio.anio, vigente: true },
      bimestres: copiar(BIMESTRES),
      asignaciones: respuestaCursos.datos
        .filter((curso) => cursosAsignados.includes(String(curso.id)))
        .map((curso) => ({
          cursoId: curso.id,
          cursoNombre: curso.nombre,
          gradoId: curso.grado,
          competencias: curso.competencias ?? [],
          secciones: secciones.filter((seccion) => String(seccion.gradoId) === String(curso.grado))
        }))
    }
  };
}

export async function listarEvaluacionesMock() {
  await esperar();
  return { exitoso: true, datos: copiar(evaluaciones), mensaje: '' };
}

export async function listarEstudiantesEvaluacionMock(evaluacion) {
  await esperar();
  const datos = ESTUDIANTES_DEMO.filter((estudiante) => estudiante.activo
    && estudiante.matriculaEstado === 'CONFIRMADA'
    && String(estudiante.seccionId) === String(evaluacion.seccionId));
  return { exitoso: true, datos: copiar(datos), mensaje: '' };
}

export async function listarNotasEvaluacionMock(evaluacionId) {
  await esperar();
  return {
    exitoso: true,
    datos: copiar(notas.filter((nota) => String(nota.evaluacionId) === String(evaluacionId))),
    mensaje: ''
  };
}

export async function listarBimestresCompetenciasMock(usuario, cursoId, seccionId) {
  await esperar();
  return { exitoso: true, datos: copiar(BIMESTRES_FINALIZADOS), mensaje: '' };
}

export async function listarNotasCompetenciasMock(cursoId, seccionId, bimestreId, estudianteId) {
  await esperar();
  if (LIBRETAS_GENERADAS.has(`${estudianteId}:${seccionId}:${bimestreId}`)) {
    return fallo('Las notas están bloqueadas porque la libreta ya fue generada.');
  }
  return {
    exitoso: true,
    datos: copiar(notasCompetencias.find((registro) => String(registro.cursoId) === String(cursoId)
      && String(registro.seccionId) === String(seccionId)
      && String(registro.bimestreId) === String(bimestreId)
      && String(registro.estudianteId) === String(estudianteId))?.competencias ?? []),
    mensaje: ''
  };
}

export async function guardarNotasCompetenciasMock(usuario, datos) {
  await esperar();
  if (!BIMESTRES_FINALIZADOS.some((item) => item.id === datos.bimestreId)) {
    return fallo('Las notas de competencias se registran una vez finalizado el bimestre.');
  }
  if (LIBRETAS_GENERADAS.has(`${datos.estudianteId}:${datos.seccionId}:${datos.bimestreId}`)) {
    return fallo('Las notas están bloqueadas porque la libreta ya fue generada.');
  }
  for (const competencia of datos.competencias ?? []) {
    if (!ESCALA_NOTAS.includes(competencia.nota)) return fallo(`${competencia.nombre}: la nota debe ser AD, A, B o C.`);
    const conclusion = String(competencia.conclusionDescriptiva ?? '').trim();
    if (!conclusion) return fallo(`${competencia.nombre}: La conclusión descriptiva es obligatoria.`);
    if (conclusion.length > 120) return fallo(`${competencia.nombre}: La conclusión descriptiva no puede superar los 120 caracteres.`);
  }
  const clave = (item) => String(item.cursoId) === String(datos.cursoId)
    && String(item.seccionId) === String(datos.seccionId)
    && String(item.bimestreId) === String(datos.bimestreId)
    && String(item.estudianteId) === String(datos.estudianteId);
  const anterior = notasCompetencias.find(clave);
  const registro = {
    ...datos,
    competencias: datos.competencias.map((item) => ({ ...item, conclusionDescriptiva: item.conclusionDescriptiva.trim() })),
    docenteId: usuario?.id,
    docenteNombre: usuario?.nombre ?? 'Docente',
    auditoria: [...(anterior?.auditoria ?? []), {
      accion: anterior ? 'MODIFICACION' : 'REGISTRO',
      usuarioId: usuario?.id,
      usuarioNombre: usuario?.nombre ?? 'Docente',
      fechaHora: new Date().toISOString()
    }]
  };
  notasCompetencias = anterior
    ? notasCompetencias.map((item) => clave(item) ? registro : item)
    : [...notasCompetencias, registro];
  for (const competencia of registro.competencias) {
    registrarRegistroAuditoriaMock({
      idElemento: `COMP-${datos.cursoId}-${datos.seccionId}-${datos.bimestreId}-${datos.estudianteId}-${competencia.competenciaId}`,
      fechaHora: new Date().toISOString(),
      usuario: { nombre: registro.docenteNombre, rol: 'DOCENTE' },
      categoria: 'EVALUACIONES',
      tipoAccion: anterior ? 'ACTUALIZAR' : 'CREAR',
      tipoTransaccion: anterior ? 'Modificación de nota de competencia' : 'Registro de nota de competencia',
      valoresAntes: null,
      valoresDespues: [
        { campo: 'Estudiante', valor: datos.estudianteNombre },
        { campo: 'Curso', valor: datos.cursoNombre },
        { campo: 'Competencia', valor: competencia.nombre },
        { campo: 'Bimestre', valor: datos.bimestreId },
        { campo: 'Nota', valor: competencia.nota },
        { campo: 'Conclusión descriptiva', valor: competencia.conclusionDescriptiva }
      ]
    });
  }
  return { exitoso: true, datos: copiar(registro), mensaje: '' };
}

export async function guardarNotaEvaluacionMock(evaluacion, estudiante, valor, usuario) {
  await esperar();
  if (!ESCALA_NOTAS.includes(valor)) {
    return fallo('La nota debe ser uno de los valores permitidos: AD, A, B o C.');
  }
  if (Number(evaluacion.anioAcademico) !== ANIO_VIGENTE) {
    return fallo('Las notas de las evaluaciones solo se registran con el año académico vigente.');
  }

  const existente = notas.find((nota) => String(nota.evaluacionId) === String(evaluacion.id)
    && String(nota.estudianteId) === String(estudiante.id));
  const accion = existente ? 'MODIFICACION' : 'REGISTRO';
  const eventoAuditoria = {
    accion,
    usuarioId: usuario?.id,
    usuarioNombre: usuario?.nombre ?? 'Docente',
    fechaHora: new Date().toISOString(),
    valorAnterior: existente?.nota ?? null,
    valorNuevo: valor
  };
  const actualizada = {
    ...(existente ?? {}),
    evaluacionId: evaluacion.id,
    estudianteId: estudiante.id,
    estudianteNombre: estudiante.nombre,
    estudianteCodigo: estudiante.codigo,
    nota: valor,
    auditoria: [...(existente?.auditoria ?? []), eventoAuditoria]
  };
  notas = existente
    ? notas.map((nota) => nota === existente ? actualizada : nota)
    : [...notas, actualizada];
  registrarRegistroAuditoriaMock({
    idElemento: `NOTA-${evaluacion.id}-${estudiante.id}`,
    fechaHora: eventoAuditoria.fechaHora,
    usuario: { nombre: eventoAuditoria.usuarioNombre, rol: 'DOCENTE' },
    categoria: 'EVALUACIONES',
    tipoAccion: existente ? 'ACTUALIZAR' : 'CREAR',
    tipoTransaccion: existente ? 'Modificación de nota de evaluación' : 'Registro de nota de evaluación',
    valoresAntes: existente ? [{ campo: 'Nota', valor: existente.nota }] : null,
    valoresDespues: [
      { campo: 'Evaluación', valor: evaluacion.nombre },
      { campo: 'Estudiante', valor: estudiante.nombre },
      { campo: 'Curso', valor: evaluacion.cursoNombre },
      { campo: 'Sección', valor: evaluacion.seccionNombre },
      { campo: 'Nota', valor }
    ]
  });
  return { exitoso: true, datos: copiar(actualizada), mensaje: '' };
}

export async function crearEvaluacionMock(datos, docente) {
  await esperar();
  if (!datos.nombre?.trim() || !datos.descripcion?.trim() || !datos.fecha || !datos.competenciaId) {
    return fallo('Completa el nombre, la descripción, la fecha y la competencia.');
  }
  if (!datos.fecha.startsWith(`${ANIO_VIGENTE}-`)) {
    return fallo(`La fecha debe pertenecer al año académico vigente (${ANIO_VIGENTE}).`);
  }
  const bimestre = BIMESTRES.find((item) => datos.fecha >= item.inicio && datos.fecha <= item.fin);
  if (!bimestre) return fallo('La fecha seleccionada no pertenece a ningún bimestre del calendario académico vigente.');

  const nueva = {
    ...datos,
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    bimestreId: bimestre.id,
    bimestreNombre: bimestre.nombre,
    docenteCreadorId: docente?.id,
    docenteCreadorNombre: docente?.nombre ?? 'Docente',
    id: `EVA-${String(siguientesId++).padStart(4, '0')}`,
    creadoEn: new Date().toISOString()
  };
  evaluaciones = [...evaluaciones, nueva];
  return { exitoso: true, datos: copiar(nueva), mensaje: '' };
}
