import { validarGrado, validarSeccion, esAnioFinalizado, normalizarNombre } from '../../utils/validacionesGradosSecciones.js';

// Datos de demostración en memoria; recargar la página restablece el prototipo.
const estructura = {
  anios: [
    { id: 1, anio: 2026, fechaInicio: '2026-03-09', fechaFin: '2026-12-18' },
    { id: 2, anio: 2025, fechaInicio: '2025-03-10', fechaFin: '2025-12-19' }
  ],
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
    const seccion = { id: Math.max(0, ...estructura.secciones.map((item) => item.id)) + 1, nombre: datos.nombre.trim(), capacidadMaxima: Number(datos.capacidadMaxima), gradoId: grado.id, anioAcademicoId: anio.id };
    estructura.secciones.push(seccion);
    return exito(seccion);
  });
}
