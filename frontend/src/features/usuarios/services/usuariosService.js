import { USUARIOS_INICIAL, CODIGOS_ESTUDIANTE_HISTORICOS } from './mocks/usuariosMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import { separarTelefono } from '../utils/telefono.js';

const ROLES_API = Object.freeze({
  APODERADO: 'Apoderado',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
  ADMIN: 'Administrador',
  ADMINISTRADOR: 'Administrador'
});

function transformarUsuario(usuario) {
  const tipoUsuario = usuario.tipoUsuario?.replace(/\$HIBERNATEPROXY\$.*$/i, '');
  const partesApellido = [usuario.apellidoPaterno, usuario.apellidoMaterno].filter(Boolean);
  const nombreCompleto = usuario.nombreCompleto?.trim();
  const apoderado = usuario.apoderado ?? usuario.apoderadoAsignado ?? null;
  const partesNombreApoderado = [
    apoderado?.nombre ?? apoderado?.nombreCompleto?.split(' ')[0],
    apoderado?.apellidoPaterno ?? apoderado?.apellido,
    apoderado?.apellidoMaterno
  ].filter(Boolean);
  const apoderadoId = usuario.apoderadoId ?? apoderado?.id ?? usuario.estudiante?.apoderadoId;
  const apoderadoNombre = usuario.apoderadoNombre?.trim()
    ?? apoderado?.nombreCompleto?.trim()
    ?? partesNombreApoderado.join(' ');
  const apoderadoDni = usuario.apoderadoDni ?? usuario.dniApoderado ?? apoderado?.dni;

  return {
    id: usuario.id,
    nombre: usuario.nombre ?? nombreCompleto?.split(' ')[0] ?? '',
    apellido: partesApellido.join(' ') || nombreCompleto?.split(' ').slice(1).join(' ') || '',
    apellidoPaterno: usuario.apellidoPaterno ?? '',
    apellidoMaterno: usuario.apellidoMaterno ?? '',
    dni: usuario.dni ?? '',
    rol: ROLES_API[tipoUsuario] ?? tipoUsuario,
    correo: usuario.email ?? '',
    activo: Boolean(usuario.activo),
    telefono: usuario.telefono ?? '',
    codigoEstudiante: usuario.codigo,
    ...(apoderadoId != null ? { apoderadoId } : {}),
    ...(apoderadoNombre ? { apoderadoNombre } : {}),
    ...(apoderadoDni ? { apoderadoDni } : {})
  };
}

/**
 * Lista usuarios desde el backend y convierte la página Spring a la forma que
 * consume la pantalla. El mock conserva el conjunto de demostración existente.
 *
 * @param {{ page?: number, size?: number, tipoUsuario?: string, activo?: boolean }} [filtros]
 */
export async function listarUsuarios(filtros = {}) {
  if (USAR_MOCK) {
    return { exitoso: true, datos: USUARIOS_INICIAL, mensaje: '' };
  }

  const paginaInicial = filtros.page ?? 0;
  const pedirPagina = async (page) => {
    const respuesta = await solicitar('/usuarios', {
      parametros: {
        page,
        size: filtros.size ?? TAMANO_PAGINA_LISTADO,
        tipoUsuario: filtros.tipoUsuario,
        activo: filtros.activo
      }
    });

    if (!respuesta.exitoso) {
      return respuesta;
    }

    if (!Array.isArray(respuesta.datos?.content) || typeof respuesta.datos.last !== 'boolean') {
      return {
        exitoso: false,
        datos: null,
        mensaje: 'El backend devolvió un formato de listado de usuarios no válido.'
      };
    }

    return respuesta;
  };

  const primera = await pedirPagina(paginaInicial);
  if (!primera.exitoso) {
    return primera;
  }

  const paginas = [primera.datos.content];
  const totalPaginas = primera.datos.totalPages;

  if (!primera.datos.last && Number.isInteger(totalPaginas) && totalPaginas > paginaInicial + 1) {
    // Con el total de páginas conocido, las demás se piden a la vez (con un tope) en vez de una tras otra:
    // cada petición cuesta más de un segundo con la base de datos remota, y en serie se sumaban.
    const pendientes = Array.from({ length: totalPaginas - paginaInicial - 1 }, (_, i) => paginaInicial + 1 + i);
    const respuestas = await pedirEnParalelo(pendientes, pedirPagina, MAX_PAGINAS_SIMULTANEAS);
    const fallida = respuestas.find((respuesta) => !respuesta.exitoso);
    if (fallida) {
      return fallida;
    }
    respuestas.forEach((respuesta) => paginas.push(respuesta.datos.content));
  } else if (!primera.datos.last) {
    // Sin `totalPages` no se sabe cuántas faltan: se sigue pidiendo hasta la última.
    let ultima = primera;
    let page = paginaInicial + 1;
    while (!ultima.datos.last) {
      ultima = await pedirPagina(page);
      if (!ultima.exitoso) {
        return ultima;
      }
      paginas.push(ultima.datos.content);
      page += 1;
    }
  }

  return { exitoso: true, datos: paginas.flat().map(transformarUsuario), mensaje: '' };
}

/**
 * Usuarios por página al pedir el listado completo: con la base de datos remota cada petición cuesta más de un
 * segundo, así que conviene pedir pocas páginas grandes en vez de muchas pequeñas.
 */
const TAMANO_PAGINA_LISTADO = 500;

/** Páginas del listado que se piden a la vez: acota la carga sobre el backend (su pool de conexiones es de 10). */
const MAX_PAGINAS_SIMULTANEAS = 4;

/**
 * Ejecuta `tarea` para cada elemento con a lo sumo `limite` en vuelo y devuelve los resultados en el mismo orden.
 *
 * @param {Array} elementos
 * @param {(elemento: *) => Promise<*>} tarea
 * @param {number} limite
 */
async function pedirEnParalelo(elementos, tarea, limite) {
  const resultados = new Array(elementos.length);
  let siguiente = 0;
  const trabajador = async () => {
    while (siguiente < elementos.length) {
      const indice = siguiente;
      siguiente += 1;
      resultados[indice] = await tarea(elementos[indice]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limite, elementos.length) }, trabajador));
  return resultados;
}

/**
 * Registra un estudiante con el contrato RegistrarEstudianteRequest del backend.
 *
 * @param {{ nombre: string, apellidoPaterno: string, apellidoMaterno: string,
 *   dni: string, email: string, telefono: string, password: string, codigo: string,
 *   fechaNacimiento: string, apoderadoId: string|number }} datos
 */
export async function registrarEstudiante(datos) {
  return registrarUsuario('/usuarios/estudiantes', datos, 'ESTUDIANTE', 'estudiante');
}

/**
 * Registra un apoderado y transforma su respuesta al modelo de la pantalla.
 *
 * @param {Object} datos
 */
export async function registrarApoderado(datos) {
  return registrarUsuario('/usuarios/apoderados', datos, 'APODERADO', 'apoderado');
}

/**
 * Registra un docente y transforma su respuesta al modelo de la pantalla.
 *
 * @param {Object} datos
 */
export async function registrarDocente(datos) {
  return registrarUsuario('/usuarios/docentes', datos, 'DOCENTE', 'docente');
}

/** Una fila de la carga masiva con el contrato `CargaMasivaUsuariosRequest.Fila` del backend. */
function filaParaCargaMasiva(fila) {
  return {
    linea: fila.linea,
    tipoUsuario: String(fila.tipoUsuario).toUpperCase(),
    nombre: fila.nombre,
    apellidoPaterno: fila.apellidoPaterno,
    apellidoMaterno: fila.apellidoMaterno || null,
    dni: fila.dni,
    email: fila.correo,
    // El backend exige exactamente 9 dígitos, sin prefijo +51.
    telefono: separarTelefono(fila.telefono) || null,
    edad: fila.edad ? Number(fila.edad) : null,
    fechaNacimiento: fila.fechaNacimiento || null,
    dniApoderado: fila.dniApoderado || null,
    codigo: fila.codigo || null
  };
}

/**
 * Inicia la carga masiva de usuarios como operación asíncrona: todas las filas viajan en una sola petición y el
 * servidor las valida en bloque y las guarda por lotes. Responde con el `jobId` para consultar el avance y, al
 * terminar, el desenlace de cada fila en `resultado`.
 *
 * @param {Array<Object>} filas Filas ya validadas, con los nombres de campo de la pantalla (`correo`, `telefono`…)
 *   y el `codigo` reservado para cada estudiante.
 * @param {string} [claveIdempotencia] Evita duplicar la operación si se reintenta el mismo envío.
 */
export async function iniciarCargaMasivaUsuarios(filas, claveIdempotencia) {
  return solicitar('/usuarios/carga-masiva/async', {
    metodo: 'POST',
    cuerpo: { filas: filas.map(filaParaCargaMasiva) },
    cabeceras: claveIdempotencia ? { 'Idempotency-Key': claveIdempotencia } : undefined,
    tiempoEsperaMs: 15000
  });
}

/**
 * Actualiza los campos permitidos por ActualizarUsuarioRequest.
 *
 * @param {string|number} id
 * @param {Object} datos
 */
export async function actualizarUsuario(id, datos) {
  const respuesta = await solicitar(`/usuarios/${encodeURIComponent(id)}`, {
    metodo: 'PATCH',
    cuerpo: datos
  });

  if (!respuesta.exitoso || !respuesta.datos) {
    return respuesta.exitoso
      ? { exitoso: false, datos: null, mensaje: 'El backend no devolvió el usuario actualizado.' }
      : respuesta;
  }

  return {
    ...respuesta,
    datos: transformarUsuario(respuesta.datos)
  };
}

export async function listarSeccionesTutor(id) {
  if (USAR_MOCK) {
    return { exitoso: true, datos: [], mensaje: '' };
  }

  const [respuestaSecciones, respuestaGrados] = await Promise.all([
    solicitar('/secciones'),
    solicitar('/grados')
  ]);
  const error = [respuestaSecciones, respuestaGrados].find((respuesta) => !respuesta.exitoso);
  if (error) return error;

  if (!Array.isArray(respuestaSecciones.datos) || !Array.isArray(respuestaGrados.datos)) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'El backend devolvió un formato de secciones o grados no válido.'
    };
  }

  const gradosPorId = new Map(respuestaGrados.datos.map((grado) => [String(grado.id), grado.nombre]));
  const secciones = respuestaSecciones.datos
    .filter((seccion) => String(seccion.tutorId) === String(id))
    .map((seccion) => ({
      seccionNombre: seccion.nombre ?? seccion.seccionNombre ?? '',
      gradoNombre: seccion.gradoNombre ?? gradosPorId.get(String(seccion.gradoId)) ?? '',
      anioAcademico: seccion.anioAcademico ?? null
    }));

  if (secciones.some((seccion) => !seccion.seccionNombre || !seccion.gradoNombre)) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No fue posible identificar la sección y el grado asignados al docente.'
    };
  }

  return { exitoso: true, datos: secciones, mensaje: '' };
}

async function registrarUsuario(ruta, datos, tipoUsuario, etiqueta) {
  const respuesta = await solicitar(ruta, {
    metodo: 'POST',
    cuerpo: datos
  });
  if (!respuesta.exitoso || !respuesta.datos) {
    return respuesta.exitoso
      ? { exitoso: false, datos: null, mensaje: `El backend no devolvió el ${etiqueta} creado.` }
      : respuesta;
  }

  return {
    ...respuesta,
    datos: transformarUsuario({ ...respuesta.datos, tipoUsuario })
  };
}

/**
 * Cambia el estado de un usuario usando los endpoints de activación del backend.
 *
 * @param {string|number} id
 * @param {boolean} activo
 */
export function cambiarEstadoUsuario(id, activo) {
  if (USAR_MOCK) {
    return Promise.resolve({ exitoso: true, datos: null, mensaje: '' });
  }

  const accion = activo ? 'desactivar' : 'reactivar';
  return solicitar(`/usuarios/${encodeURIComponent(id)}/${accion}`, { metodo: 'PATCH' });
}

export { USUARIOS_INICIAL, CODIGOS_ESTUDIANTE_HISTORICOS };
