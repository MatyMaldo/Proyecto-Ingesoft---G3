// TODO(backend): mock del log de errores. Reemplazar por las llamadas reales
// descritas en docs/planes/log-errores.md §6.5 cuando el backend exponga los
// endpoints `GET /log-errores` y `GET /log-errores/resumen`.

const ESPERA_SIMULADA_MS = 400;

const ERRORES = [
  {
    id: 9,
    fechaHora: '2026-09-19T08:33:00-05:00',
    modulo: 'NOTAS',
    operacion: 'Guardar calificación',
    tipoError: 'ValidationError',
    mensaje: 'Valor fuera de rango: se esperaba AD/A/B/C',
    usuario: 'Prof. García'
  },
  // Decisión (2026-10-20): se mantienen "Autenticación" y "Reportes" tal cual en
  // este registro y en el id 1, porque pertenecen a esos módulos; no se reasignan
  // al catálogo de chips de Duda U4. Se muestran sin chip y con tono gris (código
  // fuera del catálogo de filtro).
  {
    id: 8,
    fechaHora: '2026-09-18T19:47:00-05:00',
    modulo: 'AUTENTICACION',
    operacion: 'Restablecer contraseña',
    tipoError: 'MailSendException',
    mensaje: 'No se pudo enviar el correo de restablecimiento',
    usuario: null
  },
  {
    id: 7,
    fechaHora: '2026-09-18T11:20:00-05:00',
    modulo: 'PAGOS',
    operacion: 'Registrar comprobante',
    tipoError: 'FileStorageException',
    mensaje: 'No se pudo almacenar el comprobante en el servidor',
    usuario: 'Sra. Ramírez'
  },
  {
    id: 6,
    fechaHora: '2026-09-17T17:14:00-05:00',
    modulo: 'NOTAS',
    operacion: 'Exportar PDF',
    tipoError: 'TimeoutException',
    mensaje: 'Tiempo de espera agotado al generar el documento',
    usuario: 'Prof. Delgado'
  },
  {
    id: 5,
    fechaHora: '2026-09-17T09:05:00-05:00',
    modulo: 'MATRICULAS',
    operacion: 'Confirmar matrícula',
    tipoError: 'DataIntegrityViolationException',
    mensaje: 'Ya existe una matrícula del estudiante en el periodo indicado',
    usuario: 'Administrador'
  },
  {
    id: 4,
    fechaHora: '2026-09-16T15:38:00-05:00',
    modulo: 'HORARIOS',
    operacion: 'Asignar bloque horario',
    tipoError: 'NullPointerException',
    mensaje: 'Referencia nula al obtener el aula del bloque horario',
    usuario: 'Administrador'
  },
  {
    id: 3,
    fechaHora: '2026-09-16T10:12:00-05:00',
    modulo: 'USUARIOS',
    operacion: 'Registrar usuario',
    tipoError: 'TimeoutException',
    mensaje: 'Tiempo de espera agotado al consultar la base de datos',
    usuario: 'Administrador'
  },
  {
    id: 2,
    fechaHora: '2026-09-15T14:26:00-05:00',
    modulo: 'ASISTENCIA',
    operacion: 'Registrar asistencia',
    tipoError: 'ValidationError',
    mensaje: 'Estado de asistencia no reconocido: se esperaba Asistió, Tardanza o Falta',
    usuario: 'Prof. Quispe'
  },
  {
    id: 1,
    fechaHora: '2026-09-15T08:02:00-05:00',
    modulo: 'REPORTES',
    operacion: 'Consultar reporte de asistencia',
    tipoError: 'NullPointerException',
    mensaje: 'Referencia nula al obtener el periodo académico',
    usuario: 'Est. Huamán'
  },
  // Registros agregados en la actualización 2026-10-20 (HU-SAT-06 E3 y E4, §6.6 del plan).
  // Los ids no siguen el orden cronológico; no importa, porque el mock y el hook ordenan por `fechaHora`.
  {
    id: 10,
    fechaHora: '2026-09-16T00:05:00-05:00',
    modulo: 'MATRICULAS',
    operacion: 'Cierre del periodo de matrícula',
    tipoError: 'NullPointerException',
    mensaje: 'Referencia nula al obtener el periodo de matrícula vigente',
    usuario: 'Sistema'
  },
  // TODO(pregunta): usuario del fallo de correo (Duda U8). HU-SAT-06 E4 no lo menciona
  // entre los campos registrados; se deja `null` (sin línea de usuario) hasta aclarar.
  {
    id: 11,
    fechaHora: '2026-09-18T11:21:00-05:00',
    modulo: 'PAGOS',
    operacion: 'Envío de notificación por correo',
    tipoError: 'MailSendException',
    mensaje: 'No se pudo enviar el correo de notificación del comprobante registrado',
    usuario: null
  }
];

function esperar(milisegundos) {
  return new Promise((resolver) => setTimeout(resolver, milisegundos));
}

function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * Los datos del mock llevan el mismo desfase horario que la zona del colegio
 * (`-05:00`), así que la porción de fecha del ISO ya corresponde al día local.
 */
function obtenerFechaLocal(fechaIso) {
  return fechaIso.slice(0, 10);
}

function coincideConFiltros(registro, filtros) {
  if (filtros.modulo && registro.modulo !== filtros.modulo) {
    return false;
  }

  const fechaRegistro = obtenerFechaLocal(registro.fechaHora);

  if (filtros.fechaDesde && fechaRegistro < filtros.fechaDesde) {
    return false;
  }

  if (filtros.fechaHasta && fechaRegistro > filtros.fechaHasta) {
    return false;
  }

  if (filtros.busqueda) {
    const consulta = normalizar(filtros.busqueda);
    const texto = normalizar(`${registro.mensaje} ${registro.tipoError} ${registro.modulo}`);

    if (!texto.includes(consulta)) {
      return false;
    }
  }

  return true;
}

/**
 * Mock de la lista filtrada del log de errores (misma firma que el servicio real).
 *
 * @param {{modulo?: string, fechaDesde?: string, fechaHasta?: string, busqueda?: string}} filtros
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function obtenerErroresMock(filtros = {}) {
  await esperar(ESPERA_SIMULADA_MS);

  const datos = ERRORES.filter((registro) => coincideConFiltros(registro, filtros)).sort(
    (a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)
  );

  return { exitoso: true, datos, mensaje: '' };
}

/**
 * Mock del resumen global del log de errores. Se calcula a partir de `ERRORES`
 * para que siempre cuadre con la lista.
 *
 * @returns {Promise<{exitoso: boolean, datos: {totalErrores: number, modulosAfectados: number,
 *   usuariosInvolucrados: number, fechaPrimerError: string|null, fechaUltimoError: string|null}|null,
 *   mensaje: string}>}
 */
export async function obtenerResumenErroresMock() {
  await esperar(ESPERA_SIMULADA_MS);

  if (ERRORES.length === 0) {
    return {
      exitoso: true,
      datos: {
        totalErrores: 0,
        modulosAfectados: 0,
        usuariosInvolucrados: 0,
        fechaPrimerError: null,
        fechaUltimoError: null
      },
      mensaje: ''
    };
  }

  const modulos = new Set(ERRORES.map((registro) => registro.modulo));
  // "Sistema" no cuenta como usuario involucrado (decisión del dueño del producto,
  // 2026-10-20, Duda U5): es un proceso automático, no una persona.
  const usuarios = new Set(
    ERRORES.map((registro) => registro.usuario).filter((usuario) => usuario && usuario !== 'Sistema')
  );
  const ordenadasPorFecha = [...ERRORES].sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

  return {
    exitoso: true,
    datos: {
      totalErrores: ERRORES.length,
      modulosAfectados: modulos.size,
      usuariosInvolucrados: usuarios.size,
      fechaPrimerError: ordenadasPorFecha[0].fechaHora,
      fechaUltimoError: ordenadasPorFecha[ordenadasPorFecha.length - 1].fechaHora
    },
    mensaje: ''
  };
}
