// Datos de prueba del log de errores. Solo los usan las pruebas (Vitest): la pantalla real
// siempre consulta al backend. Tienen la forma de `LogErrorResponse`.

const TAMANIO_PAGINA = 10;

const ERRORES = [
  {
    id: 9,
    fechaHora: '2026-09-19T08:33:00-05:00',
    modulo: 'NOTAS',
    tipoError: 'Excepción no controlada',
    mensaje: 'Valor fuera de rango: se esperaba AD/A/B/C',
    nombreUsuario: 'Prof. García',
    metodoHttp: 'PUT',
    endpoint: '/api/v1/notas',
    codigoEstado: 500,
    detalle: 'IllegalArgumentException: Valor fuera de rango: se esperaba AD/A/B/C\n  at com.educoders.evaluacion.service.NotaService.validarEscala(NotaService.java:88)'
  },
  // Fallo de correo del restablecimiento de contraseña (HU-SAT-03/HU-SAT-06 LV8,
  // actualización 2026-11-01, Duda U10 resuelta por `docs/frontend-contexto.md`):
  // el módulo pasa de "AUTENTICACION" a "USUARIOS" y el usuario, al no haber sesión
  // iniciada, se muestra como "No determinado" (regla única de usuario involucrado).
  {
    id: 8,
    fechaHora: '2026-09-18T19:47:00-05:00',
    modulo: 'USUARIOS',
    tipoError: 'Notificación por correo',
    mensaje: 'No se pudo enviar el correo de restablecimiento',
    nombreUsuario: 'No determinado',
    metodoHttp: 'POST',
    endpoint: '/api/v1/auth/solicitar-codigo',
    codigoEstado: 200,
    detalle: 'MailSendException: Fallo al enviar el correo de restablecimiento (SMTP 554)'
  },
  {
    id: 7,
    fechaHora: '2026-09-18T11:20:00-05:00',
    modulo: 'PAGOS',
    tipoError: 'Excepción no controlada',
    mensaje: 'No se pudo almacenar el comprobante en el servidor',
    nombreUsuario: 'Sra. Ramírez',
    metodoHttp: 'POST',
    endpoint: '/api/v1/pagos/comprobantes',
    codigoEstado: 500,
    detalle: 'IOException: No se pudo escribir el archivo en el almacenamiento\n  at com.educoders.pago.service.ComprobanteService.guardar(ComprobanteService.java:61)'
  },
  {
    id: 6,
    fechaHora: '2026-09-17T17:14:00-05:00',
    modulo: 'NOTAS',
    tipoError: 'Excepción no controlada',
    mensaje: 'Tiempo de espera agotado al generar el documento',
    nombreUsuario: 'Prof. Delgado',
    metodoHttp: 'GET',
    endpoint: '/api/v1/notas/libretas/pdf',
    codigoEstado: 504,
    detalle: 'TimeoutException: Tiempo de espera agotado al generar el documento'
  },
  {
    id: 5,
    fechaHora: '2026-09-17T09:05:00-05:00',
    modulo: 'MATRICULAS',
    tipoError: 'Excepción no controlada',
    mensaje: 'Ya existe una matrícula del estudiante en el periodo indicado',
    nombreUsuario: 'Administrador',
    metodoHttp: 'PATCH',
    endpoint: '/api/v1/matriculas/45/confirmar',
    codigoEstado: 500,
    detalle: 'IllegalStateException: Ya existe una matrícula del estudiante en el periodo indicado'
  },
  {
    id: 4,
    fechaHora: '2026-09-16T15:38:00-05:00',
    modulo: 'HORARIOS',
    tipoError: 'Excepción no controlada',
    mensaje: 'Referencia nula al obtener el aula del bloque horario',
    nombreUsuario: 'Administrador',
    metodoHttp: 'POST',
    endpoint: '/api/v1/horarios/bloques',
    codigoEstado: 500,
    detalle: 'NullPointerException: aula es null\n  at com.educoders.horario.service.BloqueHorarioService.asignar(BloqueHorarioService.java:104)'
  },
  {
    id: 3,
    fechaHora: '2026-09-16T10:12:00-05:00',
    modulo: 'USUARIOS',
    tipoError: 'Excepción no controlada',
    mensaje: 'Tiempo de espera agotado al consultar la base de datos',
    nombreUsuario: 'Administrador',
    metodoHttp: 'POST',
    endpoint: '/api/v1/usuarios',
    codigoEstado: 500,
    detalle: 'QueryTimeoutException: Tiempo de espera agotado al consultar la base de datos'
  },
  {
    id: 2,
    fechaHora: '2026-09-15T14:26:00-05:00',
    modulo: 'ASISTENCIA',
    tipoError: 'Excepción no controlada',
    mensaje: 'Estado de asistencia no reconocido: se esperaba Asistió, Tardanza o Falta',
    nombreUsuario: 'Prof. Quispe',
    metodoHttp: 'POST',
    endpoint: '/api/v1/asistencias',
    codigoEstado: 500,
    detalle: 'IllegalArgumentException: Estado de asistencia no reconocido'
  },
  // Reporte de inasistencias (HU-SAT-06 LV8, actualización 2026-11-01, Duda U10
  // resuelta por `docs/frontend-contexto.md`): el módulo pasa de "REPORTES" a
  // "ASISTENCIA" ("los errores de los reportes de inasistencias y tardanzas se
  // registran en Asistencia").
  {
    id: 1,
    fechaHora: '2026-09-15T08:02:00-05:00',
    modulo: 'ASISTENCIA',
    tipoError: 'Excepción no controlada',
    mensaje: 'Referencia nula al obtener el periodo académico',
    nombreUsuario: 'Est. Huamán',
    metodoHttp: 'GET',
    endpoint: '/api/v1/asistencias/reportes',
    codigoEstado: 500,
    detalle: 'NullPointerException: periodoAcademico es null\n  at com.educoders.asistencia.service.ReporteService.generar(ReporteService.java:72)'
  },
  // Registros agregados en la actualización 2026-10-20 (HU-SAT-06 E3 y E4, §6.6 del plan).
  // Los ids no siguen el orden cronológico; no importa, porque el mock y el hook ordenan por `fechaHora`.
  {
    id: 10,
    fechaHora: '2026-09-16T00:05:00-05:00',
    modulo: 'MATRICULAS',
    tipoError: 'Proceso automático',
    mensaje: 'Referencia nula al obtener el periodo de matrícula vigente',
    nombreUsuario: 'Sistema',
    metodoHttp: null,
    endpoint: null,
    codigoEstado: null,
    detalle: 'NullPointerException: periodo de matrícula vigente es null\n  at com.educoders.matricula.job.CierrePeriodoJob.ejecutar(CierrePeriodoJob.java:39)'
  },
  // Fallo del correo de notificación de un comprobante registrado (HU-SAT-06 E4,
  // actualización 2026-11-01, Duda U8 resuelta por la regla única de usuario
  // involucrado de HU-SAT-06 LV): el usuario es quien ejecutaba la operación
  // original (id 7, "Sra. Ramírez"), no el destinatario del correo.
  {
    id: 11,
    fechaHora: '2026-09-18T11:21:00-05:00',
    modulo: 'PAGOS',
    tipoError: 'Notificación por correo',
    mensaje: 'No se pudo enviar el correo de notificación del comprobante registrado',
    nombreUsuario: 'Sra. Ramírez',
    metodoHttp: 'POST',
    endpoint: '/api/v1/pagos/comprobantes',
    codigoEstado: 201,
    detalle: 'MailSendException: Fallo al enviar la notificación del comprobante (tiempo de espera SMTP)'
  },
  // Registros agregados en la actualización 2026-11-01 (§A11.4 del plan): cubren
  // Autenticación, Configuración, Otros, "No determinado" y un proceso automático
  // fuera de Matrícula. Fechas anteriores al 15/09 para no alterar los casos de
  // verificación existentes por rango de fechas.
  {
    id: 12,
    fechaHora: '2026-09-14T18:40:00-05:00',
    modulo: 'AUTENTICACION',
    tipoError: 'Excepción no controlada',
    mensaje: 'Tiempo de espera agotado al validar las credenciales',
    nombreUsuario: 'No determinado',
    metodoHttp: 'POST',
    endpoint: '/api/v1/auth/login',
    codigoEstado: 500,
    detalle: 'QueryTimeoutException: Tiempo de espera agotado al validar las credenciales'
  },
  {
    id: 13,
    fechaHora: '2026-09-14T10:15:00-05:00',
    modulo: 'CONFIGURACION',
    tipoError: 'Excepción no controlada',
    mensaje: 'Referencia nula al obtener el grado de la sección',
    nombreUsuario: 'Administrador',
    metodoHttp: 'POST',
    endpoint: '/api/v1/configuracion/secciones',
    codigoEstado: 500,
    detalle: 'NullPointerException: grado es null\n  at com.educoders.configuracion.service.SeccionService.registrar(SeccionService.java:57)'
  },
  {
    id: 14,
    fechaHora: '2026-09-13T23:00:00-05:00',
    modulo: 'ASISTENCIA',
    tipoError: 'Proceso automático',
    mensaje: 'No se pudo procesar el cierre de la sesión de clase',
    nombreUsuario: 'Sistema',
    metodoHttp: null,
    endpoint: null,
    codigoEstado: null,
    detalle: 'IllegalStateException: No se pudo procesar el cierre de la sesión de clase\n  at com.educoders.asistencia.job.FaltaAutomaticaJob.ejecutar(FaltaAutomaticaJob.java:48)'
  },
  // Id 15 = correo del alta de una cuenta (usuario: el administrador que la
  // registró). Id 16 = correo de "¿Olvidaste tu contraseña?" (sin sesión). Ambos
  // en USUARIOS (HU-SAT-03 LV y HU-SAT-06 LV8).
  {
    id: 15,
    fechaHora: '2026-09-12T16:20:00-05:00',
    modulo: 'USUARIOS',
    tipoError: 'Notificación por correo',
    mensaje: 'No se pudo enviar el correo con el código de verificación',
    nombreUsuario: 'Administrador',
    metodoHttp: 'POST',
    endpoint: '/api/v1/usuarios',
    codigoEstado: 201,
    detalle: 'MailSendException: Fallo al enviar el correo con el código de verificación (SMTP 554)'
  },
  {
    id: 16,
    fechaHora: '2026-09-12T07:55:00-05:00',
    modulo: 'USUARIOS',
    tipoError: 'Notificación por correo',
    mensaje: 'No se pudo enviar el correo con el código de verificación',
    nombreUsuario: 'No determinado',
    metodoHttp: 'POST',
    endpoint: '/api/v1/auth/solicitar-codigo',
    codigoEstado: 200,
    detalle: 'MailSendException: Fallo al enviar el correo con el código de verificación (SMTP 554)'
  },
  {
    id: 17,
    fechaHora: '2026-09-11T12:30:00-05:00',
    modulo: 'OTROS',
    tipoError: 'Excepción no controlada',
    mensaje: 'Referencia nula al cargar las opciones del rol',
    nombreUsuario: 'Prof. Quispe',
    metodoHttp: 'GET',
    endpoint: '/api/v1/menu',
    codigoEstado: 500,
    detalle: 'NullPointerException: opciones del rol es null\n  at com.educoders.shared.service.MenuService.obtener(MenuService.java:33)'
  },
  {
    id: 18,
    fechaHora: '2026-09-10T09:00:00-05:00',
    modulo: 'AUTENTICACION',
    tipoError: 'Excepción no controlada',
    mensaje: 'Error al invalidar la sesión',
    nombreUsuario: 'Prof. García',
    metodoHttp: 'POST',
    endpoint: '/api/v1/auth/logout',
    codigoEstado: 500,
    detalle: 'IllegalStateException: Error al invalidar la sesión'
  }
];

function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function coincideConFiltros(registro, filtros) {
  if (filtros.modulo && registro.modulo !== filtros.modulo) {
    return false;
  }

  // Los datos llevan el desfase de la zona del colegio (`-05:00`): la fecha del ISO ya es la local.
  const fechaRegistro = registro.fechaHora.slice(0, 10);

  if (filtros.fechaDesde && fechaRegistro < filtros.fechaDesde) {
    return false;
  }

  if (filtros.fechaHasta && fechaRegistro > filtros.fechaHasta) {
    return false;
  }

  if (filtros.busqueda) {
    // Igual que el backend: mensaje, endpoint y usuario.
    const texto = normalizar(`${registro.mensaje} ${registro.endpoint ?? ''} ${registro.nombreUsuario ?? ''}`);
    return texto.includes(normalizar(filtros.busqueda));
  }

  return true;
}

/**
 * Sustituto de `obtenerErrores` para las pruebas: filtra, ordena por fecha descendente y pagina
 * de 10 en 10, con el mismo contrato de respuesta que el servicio real.
 *
 * @param {{modulo?: string, fechaDesde?: string, fechaHasta?: string, busqueda?: string, page?: number}} filtros
 * @returns {Promise<{exitoso: boolean, datos: Object, mensaje: string}>}
 */
export async function obtenerErroresDePrueba(filtros = {}) {
  const todos = ERRORES.filter((registro) => coincideConFiltros(registro, filtros))
    .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
    .map((registro) => ({ usuarioId: null, ...registro }));
  const pagina = filtros.page ?? 0;
  const desde = pagina * TAMANIO_PAGINA;

  return {
    exitoso: true,
    datos: {
      registros: todos.slice(desde, desde + TAMANIO_PAGINA),
      pagina,
      totalPaginas: Math.ceil(todos.length / TAMANIO_PAGINA),
      totalElementos: todos.length
    },
    mensaje: ''
  };
}
