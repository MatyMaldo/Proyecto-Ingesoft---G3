// TODO(backend): datos ficticios. Eliminar al integrar los endpoints de docs/planes/auditorias.md §8.
// TODO(backend): contrato propuesto para el autor "Sistema" (D10, docs/planes/auditorias.md):
//   usuario: { nombre: 'Sistema', rol: 'SISTEMA' }. Se modela como un campo explícito (ni `null`
//   ni una cadena oculta) para que el frontend lo trate igual que cualquier otro usuario.

import { obtenerEtiquetaCategoria } from '../../constants/categoriasAuditoria.js';
import { formatearFechaHora } from '../../../../shared/utils/formatoFecha.js';

const LATENCIA_MS = 400;

/**
 * Congela un valor en profundidad (objetos y arreglos anidados), para que ningún
 * consumidor pueda mutar los datos ficticios.
 *
 * @param {*} valor
 * @returns {*}
 */
function congelarProfundo(valor) {
  if (valor !== null && typeof valor === 'object' && !Object.isFrozen(valor)) {
    Object.getOwnPropertyNames(valor).forEach((propiedad) => congelarProfundo(valor[propiedad]));
    Object.freeze(valor);
  }
  return valor;
}

/**
 * Quita tildes y pasa a minúsculas, para comparaciones de búsqueda "contiene"
 * insensibles a mayúsculas y tildes (docs/planes/auditorias.md §6.3).
 *
 * @param {string} texto
 * @returns {string}
 */
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * Copia profunda de una lista de registros (nunca se devuelven las referencias
 * originales congeladas).
 *
 * @param {Array} lista
 * @returns {Array}
 */
function clonar(lista) {
  return lista.map((registro) => JSON.parse(JSON.stringify(registro)));
}

// LAB05: 17 registros, 4 días (2026-09-15 a 2026-09-18), 9 módulos, 6 usuarios.
// AUD-0004 (SISTEMA) y AUD-0009 (EVALUACIONES) se mantienen sin cambios hasta
// resolver D9 (decisión pendiente, docs/planes/auditorias.md §15).
const REGISTROS = congelarProfundo([
  {
    id: 'AUD-0001',
    idElemento: 'USUARIO-0045',
    fechaHora: '2026-09-15T08:10:00-05:00',
    usuario: { nombre: 'Administrador', rol: 'ADMINISTRADOR' },
    categoria: 'USUARIOS',
    tipoTransaccion: 'Creó usuario',
    valoresAntes: null,
    valoresDespues: [
      { campo: 'DNI', valor: '45871236' },
      { campo: 'Nombre', valor: 'Lucía Paredes Soto' },
      { campo: 'Rol', valor: 'Apoderado' },
      { campo: 'Estado', valor: 'Activo' }
    ]
  },
  {
    id: 'AUD-0015',
    idElemento: 'SECCION-2026-3B',
    fechaHora: '2026-09-15T08:40:00-05:00',
    usuario: { nombre: 'Administrador', rol: 'ADMINISTRADOR' },
    categoria: 'CONFIGURACION',
    tipoTransaccion: 'Registró sección',
    valoresAntes: null,
    valoresDespues: [
      { campo: 'Año académico', valor: '2026' },
      { campo: 'Grado', valor: '3.°' },
      { campo: 'Sección', valor: 'B' }
    ]
  },
  {
    id: 'AUD-0002',
    idElemento: 'MATRICULA-0102',
    fechaHora: '2026-09-15T09:30:00-05:00',
    usuario: { nombre: 'Administrador', rol: 'ADMINISTRADOR' },
    categoria: 'MATRICULAS',
    tipoTransaccion: 'Confirmó matrícula',
    valoresAntes: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Sección', valor: '3.° A' },
      { campo: 'Estado', valor: 'Pendiente' }
    ],
    valoresDespues: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Sección', valor: '3.° A' },
      { campo: 'Estado', valor: 'Confirmada' }
    ]
  },
  {
    id: 'AUD-0003',
    idElemento: 'NOTA-0301',
    fechaHora: '2026-09-15T10:05:00-05:00',
    usuario: { nombre: 'Prof. Delgado', rol: 'DOCENTE' },
    categoria: 'NOTAS',
    tipoTransaccion: 'Registró calificación',
    valoresAntes: null,
    valoresDespues: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Curso', valor: 'Matemática' },
      { campo: 'Competencia', valor: 'Resuelve problemas de cantidad' },
      { campo: 'Calificación', valor: 'B' }
    ]
  },
  {
    id: 'AUD-0016',
    idElemento: 'MATRICULA-0110',
    fechaHora: '2026-09-16T00:05:00-05:00',
    usuario: { nombre: 'Sistema', rol: 'SISTEMA' },
    categoria: 'MATRICULAS',
    tipoTransaccion: 'Canceló matrícula al finalizar el periodo de matrícula',
    valoresAntes: [
      { campo: 'Estudiante', valor: 'Carlos Ríos Vega' },
      { campo: 'Sección', valor: '3.° B' },
      { campo: 'Estado', valor: 'Pendiente' }
    ],
    valoresDespues: [
      { campo: 'Estudiante', valor: 'Carlos Ríos Vega' },
      { campo: 'Sección', valor: '3.° B' },
      { campo: 'Estado', valor: 'Cancelada' }
    ]
  },
  {
    id: 'AUD-0004',
    idElemento: 'SESION-0877',
    fechaHora: '2026-09-16T07:00:00-05:00',
    usuario: { nombre: 'Sistema', rol: 'SISTEMA' },
    // D9 (sin decisión): esta categoría "SISTEMA" no está en la HU; se mantiene tal cual.
    categoria: 'SISTEMA',
    tipoTransaccion: 'Cambió estado de sesión de clase',
    valoresAntes: [
      { campo: 'Sesión', valor: 'Matemática · 3.° A · 2026-09-15' },
      { campo: 'Estado', valor: 'Activa' }
    ],
    valoresDespues: [
      { campo: 'Sesión', valor: 'Matemática · 3.° A · 2026-09-15' },
      { campo: 'Estado', valor: 'Finalizada' }
    ]
  },
  {
    id: 'AUD-0005',
    idElemento: 'NOTA-0301',
    fechaHora: '2026-09-16T11:20:00-05:00',
    usuario: { nombre: 'Prof. Delgado', rol: 'DOCENTE' },
    categoria: 'NOTAS',
    tipoTransaccion: 'Modificó calificación',
    valoresAntes: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Curso', valor: 'Matemática' },
      { campo: 'Competencia', valor: 'Resuelve problemas de cantidad' },
      { campo: 'Calificación', valor: 'B' }
    ],
    valoresDespues: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Curso', valor: 'Matemática' },
      { campo: 'Competencia', valor: 'Resuelve problemas de cantidad' },
      { campo: 'Calificación', valor: 'A' }
    ]
  },
  {
    id: 'AUD-0006',
    idElemento: 'PAGO-0006',
    fechaHora: '2026-09-16T15:40:00-05:00',
    usuario: { nombre: 'Lucía Paredes', rol: 'APODERADO' },
    categoria: 'PAGOS',
    tipoTransaccion: 'Registró comprobante de pago',
    valoresAntes: null,
    valoresDespues: [
      { campo: 'Concepto', valor: 'Pensión de septiembre' },
      { campo: 'Comprobante', valor: 'comprobante-septiembre.pdf' },
      { campo: 'Estado', valor: 'Pendiente de validación' }
    ]
  },
  {
    id: 'AUD-0013',
    idElemento: 'PAGO-0006',
    fechaHora: '2026-09-16T18:20:00-05:00',
    usuario: { nombre: 'Administrador', rol: 'ADMINISTRADOR' },
    categoria: 'PAGOS',
    tipoTransaccion: 'Observó pago',
    valoresAntes: [
      { campo: 'Concepto', valor: 'Pensión de septiembre' },
      { campo: 'Estado', valor: 'Pendiente de validación' }
    ],
    valoresDespues: [
      { campo: 'Concepto', valor: 'Pensión de septiembre' },
      { campo: 'Estado', valor: 'Observado' },
      { campo: 'Motivo', valor: 'El comprobante no es legible' }
    ]
  },
  {
    id: 'AUD-0014',
    idElemento: 'PAGO-0006',
    fechaHora: '2026-09-17T08:30:00-05:00',
    usuario: { nombre: 'Lucía Paredes', rol: 'APODERADO' },
    categoria: 'PAGOS',
    tipoTransaccion: 'Reenvió comprobante de pago',
    valoresAntes: [
      { campo: 'Concepto', valor: 'Pensión de septiembre' },
      { campo: 'Comprobante', valor: 'comprobante-septiembre.pdf' },
      { campo: 'Estado', valor: 'Observado' },
      { campo: 'Motivo', valor: 'El comprobante no es legible' }
    ],
    valoresDespues: [
      { campo: 'Concepto', valor: 'Pensión de septiembre' },
      { campo: 'Comprobante', valor: 'comprobante-septiembre-v2.pdf' },
      { campo: 'Estado', valor: 'Pendiente de validación' }
    ]
  },
  {
    id: 'AUD-0007',
    idElemento: 'PAGO-0006',
    fechaHora: '2026-09-17T09:15:00-05:00',
    usuario: { nombre: 'Administrador', rol: 'ADMINISTRADOR' },
    categoria: 'PAGOS',
    tipoTransaccion: 'Validó pago',
    valoresAntes: [
      { campo: 'Concepto', valor: 'Pensión de septiembre' },
      { campo: 'Estado', valor: 'Pendiente de validación' }
    ],
    valoresDespues: [
      { campo: 'Concepto', valor: 'Pensión de septiembre' },
      { campo: 'Estado', valor: 'Validado' }
    ]
  },
  {
    id: 'AUD-0008',
    idElemento: 'BLOQUE-0058',
    fechaHora: '2026-09-17T10:30:00-05:00',
    usuario: { nombre: 'Administrador', rol: 'ADMINISTRADOR' },
    categoria: 'HORARIOS',
    tipoTransaccion: 'Modificó bloque de horario',
    valoresAntes: [
      { campo: 'Día', valor: 'Martes' },
      { campo: 'Bloque', valor: '08:00 – 09:30' },
      { campo: 'Curso', valor: 'Matemática' },
      { campo: 'Docente', valor: 'Prof. Delgado' },
      { campo: 'Aula', valor: 'A-201' }
    ],
    valoresDespues: [
      { campo: 'Día', valor: 'Martes' },
      { campo: 'Bloque', valor: '08:00 – 09:30' },
      { campo: 'Curso', valor: 'Matemática' },
      { campo: 'Docente', valor: 'Prof. Delgado' },
      { campo: 'Aula', valor: 'B-105' }
    ]
  },
  {
    id: 'AUD-0009',
    idElemento: 'LIBRETA-0021',
    fechaHora: '2026-09-17T16:45:00-05:00',
    usuario: { nombre: 'Prof. Huamán', rol: 'TUTOR' },
    // D9 (sin decisión): esta categoría "EVALUACIONES" no está en la HU; se mantiene tal cual.
    categoria: 'EVALUACIONES',
    tipoTransaccion: 'Generó libreta',
    valoresAntes: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Sección', valor: '3.° A' },
      { campo: 'Estado', valor: 'No generada' }
    ],
    valoresDespues: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Sección', valor: '3.° A' },
      { campo: 'Estado', valor: 'Generada' }
    ]
  },
  {
    id: 'AUD-0010',
    idElemento: 'NOTA-0301',
    fechaHora: '2026-09-18T08:05:00-05:00',
    usuario: { nombre: 'Prof. Delgado', rol: 'DOCENTE' },
    categoria: 'NOTAS',
    tipoTransaccion: 'Modificó calificación',
    valoresAntes: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Curso', valor: 'Matemática' },
      { campo: 'Competencia', valor: 'Resuelve problemas de cantidad' },
      { campo: 'Calificación', valor: 'A' }
    ],
    valoresDespues: [
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Curso', valor: 'Matemática' },
      { campo: 'Competencia', valor: 'Resuelve problemas de cantidad' },
      { campo: 'Calificación', valor: 'AD' }
    ]
  },
  {
    id: 'AUD-0011',
    idElemento: 'ASISTENCIA-0411',
    fechaHora: '2026-09-18T11:50:00-05:00',
    usuario: { nombre: 'Prof. Delgado', rol: 'DOCENTE' },
    categoria: 'ASISTENCIA',
    tipoTransaccion: 'Registró asistencia',
    valoresAntes: null,
    valoresDespues: [
      { campo: 'Sesión', valor: 'Matemática · 3.° A · 2026-09-18' },
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Estado', valor: 'Asistió' }
    ]
  },
  {
    id: 'AUD-0017',
    // TODO(pregunta): a qué elemento pertenece un registro con varios elementos (D11,
    // docs/planes/auditorias.md §15 y §8.7). Se usa una sola clave opaca de ejemplo
    // (la evaluación/formulario), sin que el frontend decida la regla de agrupación.
    idElemento: 'EVALUACION-0042',
    fechaHora: '2026-09-18T12:30:00-05:00',
    usuario: { nombre: 'Prof. Delgado', rol: 'DOCENTE' },
    categoria: 'NOTAS',
    tipoTransaccion: 'Registró notas de evaluación',
    valoresAntes: null,
    // Registro de varios elementos (LAB05): un mismo nombre de campo se repite a propósito
    // (una nota por estudiante). La UI usa clave por índice, no por `campo` (§4.3).
    valoresDespues: [
      { campo: 'Evaluación', valor: 'Práctica 2 · Matemática · 3.° A' },
      { campo: 'Estudiante', valor: 'Diego Paredes Soto' },
      { campo: 'Calificación', valor: 'A' },
      { campo: 'Estudiante', valor: 'Ana Torres Ríos' },
      { campo: 'Calificación', valor: 'B' }
    ]
  },
  {
    id: 'AUD-0012',
    idElemento: 'ASISTENCIA-0412',
    fechaHora: '2026-09-18T17:55:00-05:00',
    usuario: { nombre: 'Prof. Quispe', rol: 'DOCENTE' },
    categoria: 'ASISTENCIA',
    tipoTransaccion: 'Registró asistencia',
    valoresAntes: null,
    valoresDespues: [
      { campo: 'Sesión', valor: 'Comunicación · 3.° A · 2026-09-18' },
      { campo: 'Estudiante', valor: 'Ana Torres Ríos' },
      { campo: 'Estado', valor: 'Tardanza' }
    ]
  }
]);

/**
 * Simula la latencia de red de una llamada a la API.
 *
 * @param {() => *} calcularDatos
 * @returns {Promise<{exitoso: boolean, datos: *, mensaje: string}>}
 */
function simularLatencia(calcularDatos) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        resolve({ exitoso: true, datos: calcularDatos(), mensaje: '' });
      } catch (error) {
        resolve({ exitoso: false, datos: null, mensaje: 'No se pudo completar la operación.' });
      }
    }, LATENCIA_MS);
  });
}

/**
 * Lista los registros de auditoría que cumplen los filtros indicados (mock).
 * LAB05: además de categoría y búsqueda, filtra por rango de fechas (ambos
 * extremos incluidos, en días de calendario de la hora del colegio) y por
 * tipo de transacción (filtro explícito y separado, D2/D14).
 *
 * @param {{ categoria?: string|null, busqueda?: string, fechaDesde?: string, fechaHasta?: string, tipoTransaccion?: string }} filtros
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export function listarRegistrosAuditoriaMock(filtros = {}) {
  return simularLatencia(() => {
    const categoria = filtros?.categoria;
    const busquedaNormalizada = filtros?.busqueda ? normalizarTexto(filtros.busqueda.trim()) : '';
    const fechaDesde = filtros?.fechaDesde || '';
    const fechaHasta = filtros?.fechaHasta || '';
    const tipoTransaccion = filtros?.tipoTransaccion || '';

    const filtrados = REGISTROS.filter((registro) => {
      const coincideCategoria = !categoria || categoria === 'TODOS' || registro.categoria === categoria;
      if (!coincideCategoria) {
        return false;
      }

      if (tipoTransaccion && registro.tipoTransaccion !== tipoTransaccion) {
        return false;
      }

      const { fecha } = formatearFechaHora(registro.fechaHora);
      if (fechaDesde && fecha < fechaDesde) {
        return false;
      }
      if (fechaHasta && fecha > fechaHasta) {
        return false;
      }

      if (!busquedaNormalizada) {
        return true;
      }

      const etiquetaCategoria = obtenerEtiquetaCategoria(registro.categoria);
      const campos = [registro.usuario.nombre, registro.tipoTransaccion, etiquetaCategoria];
      return campos.some((campo) => normalizarTexto(campo).includes(busquedaNormalizada));
    });

    const ordenados = [...filtrados].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
    return clonar(ordenados);
  });
}

/**
 * Calcula el resumen global de auditorías (mock). No depende de los filtros.
 *
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string}>}
 */
export function obtenerResumenAuditoriaMock() {
  return simularLatencia(() => {
    const categorias = new Set(REGISTROS.map((registro) => registro.categoria));
    const usuarios = new Set(REGISTROS.map((registro) => registro.usuario.nombre));
    const fechas = [...REGISTROS.map((registro) => registro.fechaHora)].sort();

    return {
      totalAcciones: REGISTROS.length,
      modulosActivos: categorias.size,
      usuariosUnicos: usuarios.size,
      fechaPrimerRegistro: fechas[0] ?? null,
      fechaUltimoRegistro: fechas[fechas.length - 1] ?? null
    };
  });
}

/**
 * Obtiene el historial del mismo elemento (el mismo pago, nota, bloque horario,
 * usuario…), en orden ascendente por fecha (mock; LAB05, reemplaza a
 * `obtenerHistorialTransaccionMock`, docs/planes/auditorias.md §8.6).
 *
 * @param {string} idElemento
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export function obtenerHistorialElementoMock(idElemento) {
  return simularLatencia(() => {
    const historial = REGISTROS.filter((registro) => registro.idElemento === idElemento);
    const ordenado = [...historial].sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
    return clonar(ordenado);
  });
}
