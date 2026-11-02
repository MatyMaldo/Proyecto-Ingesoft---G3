import Icono from '../../../shared/components/Icono.jsx';
import { MENSAJE_SOLICITUD_CODIGO } from '../constants/mensajesRestablecimiento.js';
import estilos from './AvisoSolicitudCodigo.module.css';

/**
 * Aviso informativo del Esc. 2 de HU-SAT-03: deliberadamente ambiguo, no
 * confirma ni niega si la cuenta existe. El contenedor `role="status"` está
 * siempre montado para que el lector lo anuncie al aparecer; el contenido
 * solo se pinta si `visible` (docs/planes/restablecer-contrasena.md §4.6).
 *
 * @param {Object} props
 * @param {boolean} props.visible
 */
export default function AvisoSolicitudCodigo({ visible }) {
  return (
    <div role="status" className={visible ? estilos.aviso : undefined}>
      {visible && (
        <>
          <Icono nombre="informacion" tamano={18} className={estilos.icono} />
          <span>{MENSAJE_SOLICITUD_CODIGO}</span>
        </>
      )}
    </div>
  );
}
