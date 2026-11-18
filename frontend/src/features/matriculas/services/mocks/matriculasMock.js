// Datos en memoria de los alumnos matriculados

const ALUMNOS = [
  {
    id: 5,
    nombre: 'Mateo Herrera Campos',
    dni: '76543210',
    codigo: 'EST-005',
  },
  {
    id: 4,
    nombre: 'Isabella Flores Ruiz',
    dni: '73456789',
    codigo: 'EST-004',
  },
  {
    id: 3,
    nombre: 'Lucas Torres Vega',
    dni: '75012378',
    codigo: 'EST-003',
  },
  {
    id: 2,
    nombre: 'Carlos Ramirez Soto',
    dni: '72341198',
    codigo: 'EST-002',
  },  
  {
    id: 1,
    nombre: 'María López García',
    dni: '74852136',
    codigo: 'EST-001',
  }
]

// Funciones para obtener los datos

const fallo = (mensaje, errores = {}) => ({ exitoso: false, datos: null, mensaje, errores });
const exito = (datos) => ({ exitoso: true, datos: structuredClone(datos), mensaje: '' });
const esperar = (operacion) => new Promise((resolve) => setTimeout(() => resolve(operacion()), 350));

// Minúsculas y sin tildes, para que "maria" encuentre "María".
const normalizarTexto = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/**
 * Simula el filtrado que hará el backend: sin `busqueda` devuelve todos los alumnos;
 * con `busqueda` devuelve los que coinciden por nombre, DNI o código.
 *
 * @param {{ busqueda?: string }} filtros
 */
export const obtenerAlumnosMock = (filtros = {}) => esperar(() => {
  const termino = normalizarTexto(filtros.busqueda ?? '');

  if (termino === '') {
    return exito(ALUMNOS);
  }

  const coincidencias = ALUMNOS.filter(({ nombre, dni, codigo }) => {
    return [nombre, dni, codigo].some((campo) => normalizarTexto(campo).includes(termino));
  });

  return exito(coincidencias);
});

const MATRICULAS_MOCK = ALUMNOS.map((alumno, indice) => {
  const estado = indice === 1 ? 'CONFIRMADA' : indice === 2 ? 'CANCELADA' : 'PENDIENTE';
  return {
    id: 100 + indice,
    fechaAsignacion: `2026-10-${String(15 + indice).padStart(2, '0')}`,
    estado,
    estudianteId: alumno.id,
    nombreCompletoEstudiante: alumno.nombre,
    codigoEstudiante: alumno.codigo,
    gradoId: 1,
    gradoNombre: '1er Grado de Secundaria',
    seccionId: indice % 2 === 0 ? 1 : 2,
    seccionNombre: indice % 2 === 0 ? 'A' : 'B',
    anioAcademicoId: 1,
    anioAcademico: 2026,
    puedeEditar: estado === 'PENDIENTE',
    puedeEliminar: estado === 'PENDIENTE',
    motivoNoEditar: estado === 'PENDIENTE' ? null : 'Solo se pueden editar matrículas pendientes.',
    motivoNoEliminar: estado === 'PENDIENTE' ? null : 'Solo se pueden eliminar matrículas pendientes.'
  };
});

/** Aplica los filtros del listado; `ignorarEstado` es para contar por estado (el estado no filtra ese conteo). */
const filtrarMatriculasMock = (filtros, { ignorarEstado = false } = {}) => {
  const termino = normalizarTexto(String(filtros.busqueda ?? ''));
  return MATRICULAS_MOCK.filter((matricula) => (
    (!termino || normalizarTexto(`${matricula.nombreCompletoEstudiante} ${matricula.codigoEstudiante}`).includes(termino))
    && (!filtros.anioId || String(matricula.anioAcademicoId) === String(filtros.anioId))
    && (!filtros.gradoId || String(matricula.gradoId) === String(filtros.gradoId))
    && (!filtros.seccionId || String(matricula.seccionId) === String(filtros.seccionId))
    && (ignorarEstado || !filtros.estado || matricula.estado === filtros.estado)
    && (!filtros.estudianteId || String(matricula.estudianteId) === String(filtros.estudianteId))
  ));
};

/** Cantidad de matrículas por estado con los filtros del listado, sin el estado (como `/matriculas/conteo-por-estado`). */
export const contarMatriculasPorEstadoMock = (filtros = {}) => esperar(() => {
  const filtradas = filtrarMatriculasMock(filtros, { ignorarEstado: true });
  const cantidad = (estado) => filtradas.filter((matricula) => matricula.estado === estado).length;
  return exito({
    total: filtradas.length,
    pendientes: cantidad('PENDIENTE'),
    confirmadas: cantidad('CONFIRMADA'),
    canceladas: cantidad('CANCELADA')
  });
});

export const listarMatriculasMock = (filtros = {}) => esperar(() => {
  const filtradas = filtrarMatriculasMock(filtros);
  const page = Number(filtros.page ?? 0);
  const size = Number(filtros.size ?? 10);
  const inicio = page * size;

  return exito({
    content: filtradas.slice(inicio, inicio + size),
    totalElements: filtradas.length,
    totalPages: Math.max(1, Math.ceil(filtradas.length / size)),
    number: page,
    size
  });
});

const SECCIONES_MOCK = [
  { id: 1, nombre: 'A', gradoId: 1, gradoNombre: '1er Grado de Secundaria', anioAcademicoId: 1 },
  { id: 2, nombre: 'B', gradoId: 1, gradoNombre: '1er Grado de Secundaria', anioAcademicoId: 1 },
  { id: 3, nombre: 'C', gradoId: 1, gradoNombre: '1er Grado de Secundaria', anioAcademicoId: 1 }
];

export const actualizarMatriculaMock = (id, datos = {}) => esperar(() => {
  const matricula = MATRICULAS_MOCK.find((item) => String(item.id) === String(id));
  if (!matricula) return fallo('No se encontró la matrícula.');
  if (matricula.estado !== 'PENDIENTE') {
    return fallo('Solo se pueden editar matrículas pendientes.');
  }
  const seccion = SECCIONES_MOCK.find(
    (item) => String(item.id) === String(datos.seccionId)
  );
  if (!seccion) return fallo('No se encontró la sección seleccionada.');

  Object.assign(matricula, {
    seccionId: seccion.id,
    seccionNombre: seccion.nombre,
    gradoNombre: seccion.gradoNombre
  });
  return exito(matricula);
});

export const eliminarMatriculaMock = (id) => esperar(() => {
  const indice = MATRICULAS_MOCK.findIndex((item) => String(item.id) === String(id));
  if (indice < 0) return fallo('No se encontró la matrícula.');
  if (MATRICULAS_MOCK[indice].estado !== 'PENDIENTE') {
    return fallo('Solo se pueden eliminar matrículas pendientes.');
  }
  MATRICULAS_MOCK.splice(indice, 1);
  return exito({ id });
});

export const descargarPlantillaMatriculasMock = () => esperar(() => exito(
  new Blob([
    '\uFEFFDNI;Código;Año;Grado;Sección\n',
    '74852136;EST-001;2026;1er Grado de Secundaria;A\n'
  ], { type: 'text/csv;charset=utf-8' })
));

export const exportarMatriculasMock = () => esperar(() => exito(
  new Blob([
    '\uFEFFDNI;Código;Año;Grado;Sección\n',
    '74852136;EST-001;2026;1er Grado de Secundaria;A\n'
  ], { type: 'text/csv;charset=utf-8' })
));

export const previsualizarCargaMasivaMatriculasMock = ({ anioId } = {}) => esperar(() => exito({
  resumen: { filas: 3, validas: 1, conError: 1, duplicadas: 1, conflictos: 0 },
  secciones: SECCIONES_MOCK.map((seccion) => ({
    ...seccion,
    anioAcademicoId: anioId ?? seccion.anioAcademicoId
  })),
  filas: [
    {
      previewId: 'm-1',
      origen: 'matriculas.csv#2',
      fila: 2,
      estudianteId: 1,
      dni: '74852136',
      codigo: 'EST-001',
      nombreCompleto: 'María López García',
      anioAcademicoId: anioId ?? 1,
      gradoId: 1,
      gradoNombre: '1er Grado de Secundaria',
      seccionId: 2,
      seccionNombre: 'B',
      estado: 'VALIDO',
      errores: []
    },
    {
      previewId: 'm-2',
      origen: 'matriculas.csv#3',
      fila: 3,
      estudianteId: 2,
      dni: '72341198',
      codigo: 'EST-002',
      nombreCompleto: 'Carlos Ramirez Soto',
      anioAcademicoId: anioId ?? 1,
      gradoId: 1,
      gradoNombre: '1er Grado de Secundaria',
      seccionId: 3,
      seccionNombre: 'C',
      estado: 'ERROR',
      errores: ['La sección no pertenece al grado indicado.']
    },
    {
      previewId: 'm-3',
      origen: 'matriculas.csv#4',
      fila: 4,
      estudianteId: 3,
      dni: '75012378',
      codigo: 'EST-003',
      nombreCompleto: 'Lucas Torres Vega',
      anioAcademicoId: anioId ?? 1,
      gradoId: 1,
      gradoNombre: '1er Grado de Secundaria',
      seccionId: 1,
      seccionNombre: 'A',
      estado: 'DUPLICADO',
      errores: ['El estudiante ya tiene una matrícula en este año académico.']
    }
  ]
}));

export const confirmarCargaMasivaMatriculasMock = ({ filas = [] } = {}) => esperar(() => exito({
  creados: filas.length,
  errores: []
}));