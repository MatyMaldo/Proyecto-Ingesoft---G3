import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { solicitar } from '../../../shared/api/clienteHttp.js';

export const TAMANIO_PAGOS = 15

const falloFormato = (recurso) => ({
  exitoso: false,
  datos: null,
  mensaje: `El backend devolvió un formato de ${recurso} no válido.`
});

const normalizarTexto = (texto) => String(texto ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es')
  .trim();

// Obtener alumnos
export async function obtenerAlumnos(filtros = {}) {
  // Mocks aun no se implemenan
  if (USAR_MOCK) return null;

  const respuesta = await solicitar('/usuarios', {
    parametros: { tipoUsuario: 'ESTUDIANTE', activo: true, page: 0, size: 20 }
  });
  if (!respuesta.exitoso) return respuesta;

  const estudiantes = respuesta.datos?.content;
  if (!Array.isArray(estudiantes)) return falloFormato('la búsqueda de estudiantes');

  const termino = normalizarTexto(filtros.busqueda);
  return {
    ...respuesta,
    datos: {
      estudiantes: estudiantes
        .map((estudiante) => ({
          ...estudiante,
          nombre: estudiante.nombreCompleto ?? estudiante.nombre ?? ''
        }))
        .filter((estudiante) => !termino
          || [estudiante.nombre, estudiante.dni, estudiante.codigo]
            .some((valor) => normalizarTexto(valor).includes(termino)))
    }
  };
}

// Obtener anio académico
export async function obtenerAnioAcademico() {
  if (USAR_MOCK) {
    return null;
  }

  const [respuestaAnios] = await Promise.all([
    solicitar('/anios-academicos/con-periodo-matricula-vigente')
  ]);
  const error = [respuestaAnios].find((respuesta) => !respuesta.exitoso);
  if (error) return error;
  if (!respuestaAnios.datos) {
    return {
      exitoso: false,
      datos: null,
      mensaje: respuestaAnios.mensaje || 'No existe un año académico vigente.'
    };
  }
  return {
    exitoso: true,
    datos: { anios: [respuestaAnios.datos] },
    mensaje: ''
  };
}

// Emitir compromiso de pago de pension

/*
export async function emitirCompromisoPension(estudianteId,mes,anioId) {
  if (USAR_MOCK) {
    return { exitoso: false, datos, mensaje: '' }; // Moccks no implementados
  }

  const respuesta = await solicitar('/compromisos-pago/pension', {
    metodo: 'POST',
    cuerpo: { 
      estudiante_id: Number(estudianteId),
      mes: mes,
      anio_academico_id: Number(anioId)
    }
  });
  if (respuesta.exitoso) matriculasCreadasEnSesion.delete(String(estudianteId));
  return respuesta;
}
*/