import estilos from './ProgresoOperacionMasiva.module.css';

const ETIQUETAS_ESTADO = {
  EN_COLA: 'En cola',
  EN_PROCESO: 'En proceso',
  COMPLETADO: 'Completado',
  COMPLETADO_CON_ERRORES: 'Completado con errores',
  FALLIDO: 'Fallido',
  CANCELADO: 'Cancelado'
};

function etiquetaEstado(estado) {
  return ETIQUETAS_ESTADO[String(estado ?? '').toUpperCase()] ?? estado;
}

/**
 * Estado visual de una operación masiva asíncrona.
 *
 * @param {Object} props
 * @param {Object|null} props.job
 * @param {string} [props.error]
 * @param {() => void} [props.onReintentar]
 * @param {string} [props.titulo]
 */
export default function ProgresoOperacionMasiva({
  job,
  error,
  onReintentar,
  titulo = 'Progreso de la operación'
}) {
  if (!job && !error) return null;

  const porcentaje = Math.max(0, Math.min(100, Number(job?.porcentaje ?? 0)));
  const detalleErrores = Array.isArray(job?.detalleErrores) ? job.detalleErrores : [];
  const fallido = String(job?.estado ?? '').toUpperCase() === 'FALLIDO';

  return (
    <section className={estilos.contenedor} aria-label={titulo} role="status">
      <div className={estilos.cabecera}>
        <p className={estilos.titulo}>{titulo}</p>
        {job && (
          <span className={estilos.estado}>{etiquetaEstado(job.estado)}</span>
        )}
      </div>

      {job && (
        <>
          <div
            className={estilos.barra}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={porcentaje}
          >
            <span className={estilos.relleno} style={{ width: `${porcentaje}%` }} />
          </div>
          <p className={estilos.texto}>
            {job.procesados ?? 0} / {job.total ?? 0} procesados
            {' · '}
            {porcentaje}%
            {job.fase ? ` · ${job.fase}` : ''}
          </p>
          <dl className={estilos.contadores}>
            <div>
              <dt>Exitosos</dt>
              <dd>{job.exitosos ?? 0}</dd>
            </div>
            <div>
              <dt>Omitidos</dt>
              <dd>{job.omitidos ?? 0}</dd>
            </div>
            <div>
              <dt>Errores</dt>
              <dd>{job.errores ?? 0}</dd>
            </div>
          </dl>
        </>
      )}

      {error && <p className={estilos.error} role="alert">{error}</p>}

      {detalleErrores.length > 0 && (
        <details className={estilos.detalles}>
          <summary>Ver detalle de errores</summary>
          <ul>
            {detalleErrores.slice(0, 100).map((detalle, indice) => (
              <li key={`${indice}-${detalle}`}>{detalle}</li>
            ))}
          </ul>
        </details>
      )}

      {fallido && onReintentar && (
        <button type="button" className={estilos.reintentar} onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </section>
  );
}
