import { validarGrado, validarSeccion, esAnioFinalizado, normalizarNombre } from '../../utils/validacionesGradosSecciones.js';

// Datos de demostración en memoria; recargar la página restablece el prototipo.
const estructura = {
  anios: [
    { id: 1, anio: 2026, fechaInicio: '2026-03-09', fechaFin: '2026-12-18' },
    { id: 2, anio: 2025, fechaInicio: '2025-03-10', fechaFin: '2025-12-19' }
  ],
  docentes: [{ id: 1, nombreCompleto: 'Docente de demostración' }],
  grados: [1, 2, 3, 4, 5].map((id) => ({ id, nombre: `${id}.° de secundaria` })),
  secciones: [
    { id: 1, nombre: 'A', capacidadMaxima: 30, gradoId: 1, anioAcademicoId: 1 },
    { id: 2, nombre: 'B', capacidadMaxima: 30, gradoId: 1, anioAcademicoId: 1 },
    { id: 3, nombre: 'A', capacidadMaxima: 25, gradoId: 2, anioAcademicoId: 1 },
    { id: 4, nombre: 'A', capacidadMaxima: 30, gradoId: 1, anioAcademicoId: 2 }
  ]
};

const fallo = (mensaje, errores = {}) => ({ exitoso: false, datos: null, mensaje, errores });
const exito = (datos) => ({ exitoso: true, datos: structuredClone(datos), mensaje: '' });
const esperar = (operacion) => new Promise((resolve) => setTimeout(() => resolve(operacion()), 350));

export const consultarEstructuraMock = () => esperar(() => exito(estructura));

export function crearGradoMock(datos) {
  return esperar(() => {
    const errores = validarGrado(datos);
    if (Object.keys(errores).length) return fallo('Revisa los campos indicados.', errores);
    if (estructura.grados.some((grado) => normalizarNombre(grado.nombre) === normalizarNombre(datos.nombre))) {
      return fallo('El grado ya existe.', { nombre: 'El grado ya existe.' });
    }
    const grado = { id: Math.max(0, ...estructura.grados.map((item) => item.id)) + 1, nombre: datos.nombre.trim() };
    estructura.grados.push(grado);
    return exito(grado);
  });
}

export function crearSeccionMock(datos) {
  return esperar(() => {
    const errores = validarSeccion(datos);
    if (Object.keys(errores).length) return fallo('Revisa los campos indicados.', errores);
    const anio = estructura.anios.find((item) => item.id === Number(datos.anioAcademicoId));
    const grado = estructura.grados.find((item) => item.id === Number(datos.gradoId));
    if (!anio || !grado) return fallo('El año académico o el grado ya no están disponibles.');
    if (esAnioFinalizado(anio)) return fallo('No se pueden crear secciones en un año finalizado.');
    if (estructura.secciones.some((item) => item.gradoId === grado.id && item.anioAcademicoId === anio.id && normalizarNombre(item.nombre) === normalizarNombre(datos.nombre))) {
      return fallo('La sección ya existe para este grado y año.', { nombre: 'La sección ya existe para este grado y año.' });
    }
    if (estructura.secciones.some((item) => item.anioAcademicoId === anio.id && String(item.tutorId) === String(datos.tutorId))) {
      return fallo('El tutor ya está asignado a una sección en este año.', { tutorId: 'El tutor ya está asignado a una sección en este año.' });
    }
    const docente = estructura.docentes.find((item) => String(item.id) === String(datos.tutorId));
    const seccion = {
      id: Math.max(0, ...estructura.secciones.map((item) => item.id)) + 1,
      nombre: datos.nombre.trim().toUpperCase(),
      capacidadMaxima: Number(datos.capacidadMaxima),
      gradoId: grado.id,
      gradoNombre: grado.nombre,
      anioAcademicoId: anio.id,
      anioAcademico: anio.anio,
      tutorId: Number(datos.tutorId),
      tutorNombreCompleto: docente?.nombreCompleto
    };
    estructura.secciones.push(seccion);
    return exito(seccion);
  });
}

export function actualizarSeccionMock(id, datos) {
  return esperar(() => {
    const seccion = estructura.secciones.find((item) => String(item.id) === String(id));
    if (!seccion) return fallo('No se encontró la sección.');

    const errores = validarSeccion({
      ...datos,
      gradoId: seccion.gradoId,
      anioAcademicoId: seccion.anioAcademicoId
    }, { exigirTutor: false });
    if (Object.keys(errores).length) return fallo('Revisa los campos indicados.', errores);

    if (estructura.secciones.some((item) => item.id !== seccion.id
      && item.gradoId === seccion.gradoId
      && item.anioAcademicoId === seccion.anioAcademicoId
      && normalizarNombre(item.nombre) === normalizarNombre(datos.nombre))) {
      return fallo('La sección ya existe para este grado y año.', { nombre: 'La sección ya existe para este grado y año.' });
    }
    if (datos.tutorId && estructura.secciones.some((item) => item.id !== seccion.id
      && item.anioAcademicoId === seccion.anioAcademicoId
      && String(item.tutorId) === String(datos.tutorId))) {
      return fallo('El tutor ya está asignado a una sección en este año.', { tutorId: 'El tutor ya está asignado a una sección en este año.' });
    }

    const docente = estructura.docentes.find((item) => String(item.id) === String(datos.tutorId));
    Object.assign(seccion, {
      nombre: datos.nombre.trim().toUpperCase(),
      capacidadMaxima: Number(datos.capacidadMaxima),
      tutorId: datos.tutorId ? Number(datos.tutorId) : null,
      tutorNombreCompleto: docente?.nombreCompleto ?? null
    });
    return exito(seccion);
  });
}
