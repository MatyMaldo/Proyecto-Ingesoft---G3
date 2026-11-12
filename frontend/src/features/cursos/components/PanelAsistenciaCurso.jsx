import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';

/**
 * Pestaña "Asistencia Diaria" del detalle de un curso (HU-ASI-03).
 *
 * La asistencia sale de una API distinta a la de evaluaciones y notas, así que este panel cargará sus propios datos
 * (con su hook y su servicio) cuando exista el endpoint; no depende de lo que se cargó para Evaluaciones y Notas.
 * TODO(backend, 2026-11-11): el backend no expone todavía la asistencia del estudiante por curso (HU-ASI-03).
 */
export default function PanelAsistenciaCurso() {
  return <EstadoConsulta tipo="vacio" mensaje="La asistencia de este curso aún no está disponible." />;
}
