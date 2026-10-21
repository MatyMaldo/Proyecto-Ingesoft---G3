export const CAPACIDAD_MAXIMA_TECNICA = 65535;

export function validarGrado({ nombre = '' }) {
  const errores = {};
  if (!nombre.trim()) errores.nombre = 'Ingresa el nombre del grado.';
  else if (nombre.trim().length > 60) errores.nombre = 'El nombre admite hasta 60 caracteres.';
  return errores;
}

export function validarSeccion(datos) {
  const errores = {};
  if (!datos.anioAcademicoId) errores.anioAcademicoId = 'Selecciona un año académico.';
  if (!datos.gradoId) errores.gradoId = 'Selecciona un grado.';
  if (!datos.nombre?.trim()) errores.nombre = 'Ingresa el nombre de la sección.';
  else if (datos.nombre.trim().length > 40) errores.nombre = 'El nombre admite hasta 40 caracteres.';
  if (!/^\d+$/.test(String(datos.capacidadMaxima)) || Number(datos.capacidadMaxima) < 1 || Number(datos.capacidadMaxima) > CAPACIDAD_MAXIMA_TECNICA) {
    errores.capacidadMaxima = 'Ingresa un entero entre 1 y 65535.';
  }
  return errores;
}

// Regla provisional: el año termina al finalizar su fecha de fin, en hora local.
export function esAnioFinalizado(anio, hoy = new Date()) {
  const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  return Boolean(anio?.fechaFin && anio.fechaFin < fecha);
}

export function normalizarNombre(nombre) {
  return nombre.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}
