const URL_BASE_API = import.meta.env.VITE_URL_BASE_API ?? 'http://localhost:8080/api/v1';
const URL_ASISTENCIAS = `${URL_BASE_API}/asistencias`;

async function procesarRespuesta(respuesta) {
  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    return {
      exitoso: false,
      datos: null,
      mensaje: cuerpo?.error ?? 'No se pudo completar la operación.'
    };
  }

  return {
    exitoso: true,
    datos: cuerpo?.datos ?? null,
    mensaje: ''
  };
}

/**
 * Obtiene las asistencias registradas desde la API.
 *
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string}>}
 */
export async function obtenerAsistencias() {
  try {
    const respuesta = await fetch(URL_ASISTENCIAS);
    return await procesarRespuesta(respuesta);
  } catch (error) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No fue posible comunicarse con el backend.'
    };
  }
}

/**
 * Registra la asistencia de un estudiante mediante la API.
 *
 * @param {{nombreEstudiante: string, estado: string}} datosAsistencia
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string}>}
 */
export async function registrarAsistencia(datosAsistencia) {
  try {
    const respuesta = await fetch(URL_ASISTENCIAS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosAsistencia)
    });

    return await procesarRespuesta(respuesta);
  } catch (error) {
    return {
      exitoso: false,
      datos: null,
      mensaje: 'No fue posible comunicarse con el backend.'
    };
  }
}
