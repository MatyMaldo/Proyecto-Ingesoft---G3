import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';
import {
  consultarEstructuraMock,
  crearGradoMock,
  crearSeccionMock,
  actualizarSeccionMock
} from './mocks/estructuraEscolarMock.js';

function falloFormato(recurso) {
  return {
    exitoso: false,
    datos: null,
    mensaje: `El backend devolvió un formato de ${recurso} no válido.`
  };
}

export async function consultarEstructura() {
  if (USAR_MOCK) {
    return consultarEstructuraMock();
  }

  const [respuestaAnios, respuestaGrados, respuestaSecciones, respuestaDocentes] = await Promise.all([
    solicitar('/anios-academicos'),
    solicitar('/grados'),
    solicitar('/secciones'),
    solicitar('/usuarios', {
      parametros: { tipoUsuario: 'DOCENTE', activo: true, page: 0, size: 100 }
    })
  ]);

  const error = [respuestaAnios, respuestaGrados, respuestaSecciones, respuestaDocentes]
    .find((respuesta) => !respuesta.exitoso);
  if (error) return error;

  const docentes = respuestaDocentes.datos?.content;
  if (
    !Array.isArray(respuestaAnios.datos) ||
    !Array.isArray(respuestaGrados.datos) ||
    !Array.isArray(respuestaSecciones.datos) ||
    !Array.isArray(docentes)
  ) {
    return falloFormato('la estructura escolar');
  }

  return {
    exitoso: true,
    mensaje: '',
    datos: {
      anios: respuestaAnios.datos,
      grados: respuestaGrados.datos,
      secciones: respuestaSecciones.datos,
      docentes: docentes.map(({ id, nombreCompleto }) => ({ id, nombreCompleto }))
    }
  };
}

export async function crearGrado(datos) {
  if (USAR_MOCK) {
    return crearGradoMock(datos);
  }

  return solicitar('/grados', {
    metodo: 'POST',
    cuerpo: { nombre: datos.nombre.trim() }
  });
}

export async function crearSeccion(datos) {
  if (USAR_MOCK) {
    return crearSeccionMock(datos);
  }

  return solicitar('/secciones', {
    metodo: 'POST',
    cuerpo: {
      nombre: datos.nombre.trim().toUpperCase(),
      capacidadMaxima: Number(datos.capacidadMaxima),
      gradoId: Number(datos.gradoId),
      anioAcademicoId: Number(datos.anioAcademicoId),
      tutorId: datos.tutorId ? Number(datos.tutorId) : null
    }
  });
}

export async function actualizarSeccion(id, datos) {
  if (USAR_MOCK) {
    return actualizarSeccionMock(id, datos);
  }

  return solicitar(`/secciones/${encodeURIComponent(id)}`, {
    metodo: 'PATCH',
    cuerpo: {
      nombre: datos.nombre.trim().toUpperCase(),
      capacidadMaxima: Number(datos.capacidadMaxima),
      tutorId: datos.tutorId ? Number(datos.tutorId) : null
    }
  });
}
