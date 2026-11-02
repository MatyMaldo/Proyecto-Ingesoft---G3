import { useEffect } from 'react';

import MarcoAccesoPublico from '../components/MarcoAccesoPublico.jsx';
import FormularioSolicitudCodigo from '../components/FormularioSolicitudCodigo.jsx';
import useSolicitudCodigo from '../hooks/useSolicitudCodigo.js';
import { TITULO_SOLICITUD, SUBTITULO_SOLICITUD, TITULO_DOCUMENTO_SOLICITUD } from '../constants/mensajesRestablecimiento.js';

const ID_TITULO = 'solicitud-titulo';

/**
 * Página de solicitud del código de verificación (HU-SAT-03, pantalla (a),
 * `/solicitar-codigo`). Compone la pantalla y conecta `useSolicitudCodigo()`
 * con `FormularioSolicitudCodigo`; no llama servicios ni valida por sí misma
 * (docs/planes/restablecer-contrasena.md §4.9).
 */
export default function PaginaSolicitarCodigo() {
  const {
    correo,
    errorCorreo,
    errorGeneral,
    enviando,
    segundosEspera,
    refCorreo,
    estadoEnlaceCodigo,
    manejarCambioCorreo,
    manejarSalidaCorreo,
    manejarEnvio
  } = useSolicitudCodigo();

  useEffect(() => {
    document.title = TITULO_DOCUMENTO_SOLICITUD;
  }, []);

  return (
    <MarcoAccesoPublico idTitulo={ID_TITULO} titulo={TITULO_SOLICITUD} subtitulo={SUBTITULO_SOLICITUD}>
      <FormularioSolicitudCodigo
        idTitulo={ID_TITULO}
        correo={correo}
        errorCorreo={errorCorreo}
        errorGeneral={errorGeneral}
        enviando={enviando}
        segundosEspera={segundosEspera}
        refCorreo={refCorreo}
        estadoEnlaceCodigo={estadoEnlaceCodigo}
        alCambiarCorreo={manejarCambioCorreo}
        alSalirDeCorreo={manejarSalidaCorreo}
        alEnviar={manejarEnvio}
      />
    </MarcoAccesoPublico>
  );
}
