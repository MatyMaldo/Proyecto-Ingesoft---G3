import Insignia from '../../../shared/components/Insignia.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import {
  etiquetaEstadoAsistencia,
  normalizarEstadoAsistencia,
  tonoEstadoAsistencia
} from '../utils/estadosAsistencia.js';
import estilos from './AccionesAsistenciaDocente.module.css';

/**
 * Acciones de asistencia dentro del drawer de una sesión del docente.
 * La asistencia del docente es una acción puntual; la de estudiantes abre el
 * modal con el roster completo.
 */
export default function AccionesAsistenciaDocente({
  sesion,
  asistencia,
  alAbrirModal,
  alNotificar
}) {
  const detalle = asistencia?.detalle;
  const ocupado = asistencia?.guardando === true;

  if (asistencia?.cargando) {
    return <p className={estilos.estado}>Consultando asistencia…</p>;
  }

  if (asistencia?.error) {
    return (
      <div className={estilos.estado}>
        <p role="alert">{asistencia.error}</p>
        <button type="button" className={estilos.botonSecundario} onClick={asistencia.recargar}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!detalle) return null;

  const estadoDocente = normalizarEstadoAsistencia(detalle.asistenciaDocente?.estado);

  const registrarDocente = async () => {
    const respuesta = await asistencia.registrarDocente();
    alNotificar?.(
      respuesta?.exitoso
        ? 'Asistencia del docente registrada.'
        : (respuesta?.mensaje || 'No se pudo registrar la asistencia del docente.'),
      !respuesta?.exitoso
    );
  };

  return (
    <div className={estilos.acciones}>
      <section className={estilos.bloque} aria-labelledby="asistencia-docente-titulo">
        <h3 id="asistencia-docente-titulo" className={estilos.tituloBloque}>
          Mi asistencia
        </h3>
        {detalle.asistenciaDocente ? (
          <div className={estilos.estadoFila}>
            <Insignia tono={tonoEstadoAsistencia(estadoDocente)}>
              {etiquetaEstadoAsistencia(estadoDocente)}
            </Insignia>
            <span className={estilos.hora}>
              {detalle.asistenciaDocente.fechaHoraRegistro
                ? new Date(detalle.asistenciaDocente.fechaHoraRegistro)
                  .toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                : ''}
            </span>
          </div>
        ) : detalle.puedeRegistrarDocente ? (
          <button
            type="button"
            className={estilos.botonPrimario}
            disabled={ocupado}
            onClick={registrarDocente}
          >
            <Icono nombre="verificar" tamano={18} />
            {ocupado ? 'Registrando…' : 'Registrar mi asistencia'}
          </button>
        ) : (
          <p className={estilos.motivo}>{detalle.motivoDocente}</p>
        )}
      </section>

      <section className={estilos.bloque} aria-labelledby="asistencia-estudiantes-titulo">
        <h3 id="asistencia-estudiantes-titulo" className={estilos.tituloBloque}>
          Asistencia de estudiantes
        </h3>
        {detalle.puedeRegistrarEstudiantes ? (
          <button
            type="button"
            className={estilos.botonSecundario}
            disabled={ocupado}
            onClick={alAbrirModal}
          >
            <Icono nombre="archivo" tamano={18} />
            {detalle.estudiantes?.some((estudiante) => estudiante.estado)
              ? 'Revisar asistencia de estudiantes'
              : 'Registrar asistencia de estudiantes'}
          </button>
        ) : (
          <p className={estilos.motivo}>{detalle.motivoEstudiantes}</p>
        )}
      </section>
    </div>
  );
}
