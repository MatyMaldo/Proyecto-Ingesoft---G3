import estilos from './ModalPagos.module.css';

/**
 * Vista previa del comprobante de un pago (PDF) con un enlace para abrirlo en otra pestaña. La comparten el detalle
 * del administrador y el del apoderado.
 *
 * @param {Object} props
 * @param {string|null|undefined} props.evidenciaUrl URL del comprobante; sin ella se avisa que no está disponible.
 * @param {string} props.titulo Texto accesible del visor (título del `<iframe>`).
 */
export default function VistaPreviaComprobante({ evidenciaUrl, titulo }) {
  return (
    <aside className={estilos.preview} aria-label="Vista previa del comprobante">
      <div className={estilos.previewCabecera}>
        <span>Comprobante</span>
        {evidenciaUrl && (
          <a className={estilos.evidencia} href={evidenciaUrl} target="_blank" rel="noreferrer">
            Abrir en pestaña nueva
          </a>
        )}
      </div>

      {evidenciaUrl ? (
        <iframe className={estilos.pdf} src={evidenciaUrl} title={titulo} loading="lazy" />
      ) : (
        <p className={estilos.previewVacio}>Comprobante no disponible.</p>
      )}
    </aside>
  );
}
