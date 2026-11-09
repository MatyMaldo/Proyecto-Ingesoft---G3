// TODO(backend): datos de ejemplo para trabajar sin servidor (VITE_USAR_MOCK=true). Reemplazar por la API real.
// Cubre la pantalla de administración de pagos; "Mis pagos" (apoderado) siempre usa la API.

const esperar = (operacion) => new Promise((resolve) => setTimeout(() => resolve(operacion()), 250));
const exito = (datos) => ({ exitoso: true, datos: structuredClone(datos), mensaje: '' });

// El año de ejemplo es siempre el actual y está vigente todo el año, para que las acciones no se bloqueen con el tiempo.
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = [
  { id: 1, anio: ANIO_ACTUAL, fechaInicio: `${ANIO_ACTUAL}-01-01`, fechaFin: `${ANIO_ACTUAL}-12-31` }
];

const GRADOS = [
  { id: 1, nombre: '1er Grado de Secundaria' },
  { id: 2, nombre: '2do Grado de Secundaria' }
];

const SECCIONES = [
  { id: 1, gradoId: 1, anioAcademicoId: 1, nombre: 'A' },
  { id: 2, gradoId: 1, anioAcademicoId: 1, nombre: 'B' },
  { id: 3, gradoId: 2, anioAcademicoId: 1, nombre: 'A' }
];

const NOMBRES = [
  'Mateo Herrera Campos', 'Isabella Flores Ruiz', 'Lucas Torres Vega', 'Carlos Ramírez Soto',
  'María López García', 'Valeria Ortiz Campos', 'Andrés Ortiz Campos', 'Camila Cárdenas Soto',
  'Joaquín Reyes Medina', 'Natalia Salazar Rivas', 'Diego Salinas Pardo', 'Sofía Paredes Mendoza',
  'Luis Paredes Mendoza', 'Gabriela Navarro Silva'
];

const ALUMNOS = NOMBRES.map((nombre, indice) => {
  const seccion = SECCIONES[indice % SECCIONES.length];
  const grado = GRADOS.find((item) => item.id === seccion.gradoId);
  return {
    id: 10 + indice,
    matriculaId: 100 + indice,
    nombre,
    codigo: `EST-${String(indice + 1).padStart(3, '0')}`,
    estadoMatricula: indice % 3 === 2 ? 'PENDIENTE' : 'CONFIRMADA',
    anioAcademicoId: 1,
    anioAcademico: ANIO_ACTUAL,
    gradoId: grado.id,
    gradoNombre: grado.nombre,
    seccionId: seccion.id,
    seccionNombre: seccion.nombre
  };
});

const COMPROMISOS = [
  {
    compromisoId: 501,
    tipoCompromiso: 'MATRICULA',
    mes: null,
    fechaEmision: '2026-02-20',
    montoTotal: 350,
    montoOriginal: 350,
    montoMora: 0,
    estadoCompromiso: 'PAGADO',
    pagos: [
      {
        id: 9001,
        fechaRegistro: '2026-02-25',
        montoPagado: 350,
        estado: 'VALIDADO',
        evidenciaUrl: null,
        motivo: null
      }
    ]
  },
  {
    compromisoId: 502,
    tipoCompromiso: 'PENSION',
    mes: 'MARZO',
    fechaEmision: '2026-03-02',
    montoTotal: 420,
    montoOriginal: 400,
    montoMora: 20,
    estadoCompromiso: 'PENDIENTE',
    pagos: [
      {
        id: 9002,
        fechaRegistro: '2026-03-12',
        montoPagado: 420,
        estado: 'PENDIENTE',
        evidenciaUrl: null,
        motivo: null
      },
      {
        id: 9003,
        fechaRegistro: '2026-03-10',
        montoPagado: 400,
        estado: 'RECHAZADO',
        evidenciaUrl: null,
        motivo: 'Comprobante ilegible'
      }
    ]
  },
  {
    compromisoId: 503,
    tipoCompromiso: 'PENSION',
    mes: 'ABRIL',
    fechaEmision: '2026-04-02',
    montoTotal: 400,
    montoOriginal: 400,
    montoMora: 0,
    estadoCompromiso: 'PENDIENTE',
    pagos: []
  }
];

export const obtenerAnioAcademicoMock = () => esperar(() => exito({ anios: ANIOS }));

export const obtenerGradosMock = () => esperar(() => exito(GRADOS));

export const obtenerSeccionesMock = (gradoId, anioId) => esperar(() => exito(
  SECCIONES.filter((seccion) => String(seccion.gradoId) === String(gradoId)
    && String(seccion.anioAcademicoId) === String(anioId))
));

export const obtenerAlumnosMatriculadosMock = (anioId, filtros = {}) => esperar(() => exito({
  estudiantes: ALUMNOS.filter((alumno) => String(alumno.anioAcademicoId) === String(anioId)
    && (!filtros.gradoId || String(alumno.gradoId) === String(filtros.gradoId))
    && (!filtros.seccionId || String(alumno.seccionId) === String(filtros.seccionId)))
}));

export const emitirCompromisoPensionMock = () => esperar(() => exito({}));

export const emitirCompromisosPensionLoteMock = () => esperar(() => exito({
  emitidos: ALUMNOS.filter((alumno) => alumno.estadoMatricula === 'CONFIRMADA').length,
  omitidos: 0,
  errores: []
}));

export const listarPagosAgrupadosMock = ({ page = 0, size = 10 } = {}) => esperar(() => {
  const inicio = page * size;
  return exito({
    content: COMPROMISOS.slice(inicio, inicio + size),
    totalElements: COMPROMISOS.length,
    totalPages: Math.max(1, Math.ceil(COMPROMISOS.length / size)),
    number: page,
    size
  });
});

export const obtenerPagoAdminMock = (pagoId) => esperar(() => {
  const compromiso = COMPROMISOS.find((item) => item.pagos.some((pago) => String(pago.id) === String(pagoId)));
  const pago = compromiso?.pagos.find((item) => String(item.id) === String(pagoId));
  return exito({
    ...pago,
    estudianteNombreCompleto: ALUMNOS[0].nombre,
    gradoSeccion: `${ALUMNOS[0].gradoNombre} · ${ALUMNOS[0].seccionNombre}`,
    apoderadoNombreCompleto: 'Rosa Herrera Díaz',
    compromisoId: compromiso?.compromisoId,
    tipoCompromiso: compromiso?.tipoCompromiso,
    mes: compromiso?.mes,
    estadoCompromiso: compromiso?.estadoCompromiso,
    validadorNombreCompleto: pago?.estado === 'VALIDADO' ? 'Admin' : null
  });
});

export const obtenerPeriodoMatriculaMock = (anioId) => esperar(() => exito({
  anioAcademicoId: Number(anioId),
  estado: 'VIGENTE'
}));

export const validarPagoAdminMock = () => esperar(() => exito({}));

export const rechazarPagoAdminMock = () => esperar(() => exito({}));
