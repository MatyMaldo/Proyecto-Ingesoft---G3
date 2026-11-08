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

const MATRICULAS_MOCK = ALUMNOS.map((alumno, indice) => ({
  id: 100 + indice,
  fechaAsignacion: `2026-10-${String(15 + indice).padStart(2, '0')}`,
  estado: indice === 1 ? 'CONFIRMADA' : indice === 2 ? 'CANCELADA' : 'PENDIENTE',
  estudianteId: alumno.id,
  nombreCompletoEstudiante: alumno.nombre,
  codigoEstudiante: alumno.codigo,
  gradoId: 1,
  gradoNombre: '1er Grado de Secundaria',
  seccionId: indice % 2 === 0 ? 1 : 2,
  seccionNombre: indice % 2 === 0 ? 'A' : 'B',
  anioAcademicoId: 1,
  anioAcademico: 2026
}));

export const listarMatriculasMock = (filtros = {}) => esperar(() => {
  const filtradas = MATRICULAS_MOCK.filter((matricula) => (
    (!filtros.anioId || String(matricula.anioAcademicoId) === String(filtros.anioId))
    && (!filtros.gradoId || String(matricula.gradoId) === String(filtros.gradoId))
    && (!filtros.seccionId || String(matricula.seccionId) === String(filtros.seccionId))
    && (!filtros.estado || matricula.estado === filtros.estado)
    && (!filtros.estudianteId || String(matricula.estudianteId) === String(filtros.estudianteId))
  ));
  const page = Number(filtros.page ?? 0);
  const size = Number(filtros.size ?? 15);
  const inicio = page * size;

  return exito({
    content: filtradas.slice(inicio, inicio + size),
    totalElements: filtradas.length,
    totalPages: Math.max(1, Math.ceil(filtradas.length / size)),
    number: page,
    size
  });
});