import { useEffect } from 'react';

import MarcoAccesoPublico from '../components/MarcoAccesoPublico.jsx';
import FormularioRestablecerContrasena from '../components/FormularioRestablecerContrasena.jsx';
import useRestablecerContrasena from '../hooks/useRestablecerContrasena.js';
import {
  TITULO_RESTABLECER,
  SUBTITULO_RESTABLECER,
  TITULO_DOCUMENTO_RESTABLECER
} from '../constants/mensajesRestablecimiento.js';

const ID_TITULO = 'restablecer-titulo';

/**
 * Página "Restablecer contraseña" (HU-SAT-03, pantalla (b),
 * `/restablecer-contrasena`). Compone la pantalla y conecta
 * `useRestablecerContrasena()` con `FormularioRestablecerContrasena`; no
 * llama servicios ni valida por sí misma (docs/planes/
 * restablecer-contrasena.md §4.9).
 */
export default function PaginaRestablecerContrasena() {
  const {
    paso,
    valores,
    errores,
    errorGeneral,
    codigoRechazado,
    codigoBloqueado,
    correoFijo,
    avisoSolicitud,
    enviando,
    solicitandoCodigo,
    segundosEspera,
    refs,
    manejarCambioCampo,
    manejarSalidaCampo,
    manejarEnvio,
    manejarSolicitudNuevoCodigo,
    manejarVolverAlPaso1,
    manejarCambiarCorreo
  } = useRestablecerContrasena();

  useEffect(() => {
    document.title = TITULO_DOCUMENTO_RESTABLECER;
  }, []);

  return (
    <MarcoAccesoPublico idTitulo={ID_TITULO} titulo={TITULO_RESTABLECER} subtitulo={SUBTITULO_RESTABLECER}>
      <FormularioRestablecerContrasena
        idTitulo={ID_TITULO}
        paso={paso}
        valores={valores}
        errores={errores}
        errorGeneral={errorGeneral}
        codigoRechazado={codigoRechazado}
        codigoBloqueado={codigoBloqueado}
        correoFijo={correoFijo}
        avisoSolicitud={avisoSolicitud}
        enviando={enviando}
        solicitandoCodigo={solicitandoCodigo}
        segundosEspera={segundosEspera}
        refs={refs}
        alCambiarCampo={manejarCambioCampo}
        alSalirDeCampo={manejarSalidaCampo}
        alEnviar={manejarEnvio}
        alSolicitarNuevoCodigo={manejarSolicitudNuevoCodigo}
        alVolverAlPaso1={manejarVolverAlPaso1}
        alCambiarCorreo={manejarCambiarCorreo}
      />
    </MarcoAccesoPublico>
  );
}
