import { solicitar } from '../../../shared/api/clienteHttp.js';

const BASE = '/visualizadores-horario';

// HU-GEMIH-03: Administrador - sección
export function horarioSeccion(seccionId) {
  return solicitar(`${BASE}/secciones/${seccionId}`);
}

// HU-GEMIH-04: Administrador - docente
export function horarioDocente(docenteId) {
  return solicitar(`${BASE}/docentes/${docenteId}`);
}

// HU-GEMIH-05: Docente autenticado
export function miHorarioDocente() {
  return solicitar(`${BASE}/mi-horario/docente`);
}

// HU-GEMIH-06: Estudiante autenticado
export function miHorarioEstudiante() {
  return solicitar(`${BASE}/mi-horario/estudiante`);
}

// HU-GEMIH-07: Apoderado - estudiante vinculado
export function horarioApoderado(estudianteId) {
  return solicitar(`${BASE}/apoderado/${estudianteId}`);
}
// Listas para los selectores del administrador
export function listarSecciones() {
  return solicitar('/secciones');
}


export function listarDocentes() {
  return Promise.resolve({
    exitoso: false,
    datos: null,
    mensaje: 'El contrato del backend no incluye GET /usuarios/docentes para listar docentes.'
  });
}



export function listarMisEstudiantes() {
  return solicitar('/visualizadores-horario/apoderado/mis-estudiantes');
}

export function consultarEstadoProgramacion(seccionId) {
  return solicitar(`${BASE}/estado-programacion/${seccionId}`);
}
export function listarAniosAcademicos() {
  return solicitar('/anios-academicos');
}
