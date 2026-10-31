import { USUARIOS_INICIAL, CODIGOS_ESTUDIANTE_HISTORICOS } from './mocks/usuariosMock.js';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

const ROLES_API = Object.freeze({
  APODERADO: 'Apoderado',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
  ADMIN: 'Administrador',
  ADMINISTRADOR: 'Administrador'
});

function transformarUsuario(usuario) {
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
    rol: ROLES_API[usuario.tipoUsuario] ?? usuario.tipoUsuario,
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

  const usuarios = [];
  let page = filtros.page ?? 0;
  let ultimaPagina = false;

  do {
    const respuesta = await solicitar('/usuarios', {
      parametros: {
        page,
        size: filtros.size ?? 100,
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

    usuarios.push(...respuesta.datos.content.map(transformarUsuario));
    ultimaPagina = respuesta.datos.last;
    page += 1;
  } while (!ultimaPagina);

  return { exitoso: true, datos: usuarios, mensaje: '' };
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
