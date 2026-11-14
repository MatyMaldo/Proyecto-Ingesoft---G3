import Insignia from '../../../shared/components/Insignia.jsx';
import { etiquetaPeriodo, tonoPeriodo } from '../utils/periodo.js';
import estilos from './EstadoPeriodo.module.css';

/**
 * Franja sobre los filtros con el periodo de matrícula y qué acciones de horarios habilita:
 * de ello dependen las relaciones curso-docente, la carga masiva, el guardado de bloques y las sesiones.
 *
 * @param {Object} props
 * @param {'inactivo'|'cargando'|'listo'|'error'} props.estado
 * @param {{ estado: string }|null} props.periodo
 * @param {string} props.error
 * @param {boolean} props.asignacionesAbiertas
 * @param {boolean} props.bloquesAbiertos
 * @param {boolean} props.sesionesAbiertas
 */
export default function EstadoPeriodo({
  estado,
  periodo,
  error,
  asignacionesAbiertas,
  bloquesAbiertos,
  sesionesAbiertas
}) {
  if (estado === 'error') {
    return (
      <p className={estilos.error} role="alert">
        {error} Las acciones de horario quedan deshabilitadas.
      </p>
    );
  }
  if (estado === 'cargando') {
    return <p className={estilos.cargando}>Consultando el periodo de matrícula…</p>;
  }
  if (estado !== 'listo' || !periodo) {
    return null;
  }

  const ventanas = [
    { id: 'asignaciones', etiqueta: 'Asignaciones', abierta: asignacionesAbiertas },
    { id: 'bloques', etiqueta: 'Bloques y carga masiva', abierta: bloquesAbiertos },
    { id: 'sesiones', etiqueta: 'Sesiones', abierta: sesionesAbiertas }
  ];

  return (
    <section className={estilos.franja} aria-label="Periodo de matrícula">
      <span className={estilos.titulo}>Periodo de matrícula</span>
      <Insignia tono={tonoPeriodo(periodo.estado)}>{etiquetaPeriodo(periodo.estado)}</Insignia>
      <ul className={estilos.ventanas}>
        {ventanas.map((ventana) => (
          <li
            key={ventana.id}
            className={ventana.abierta ? `${estilos.ventana} ${estilos.abierta}` : estilos.ventana}
          >
            <span className={estilos.punto} aria-hidden="true" />
            {ventana.etiqueta}: {ventana.abierta ? 'abiertas' : 'cerradas'}
          </li>
        ))}
      </ul>
    </section>
  );
}
