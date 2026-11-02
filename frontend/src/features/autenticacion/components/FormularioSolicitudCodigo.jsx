import { Link } from 'react-router-dom';

import Icono from '../../../shared/components/Icono.jsx';
import { RUTA_RESTABLECER_CONTRASENA, RUTA_LOGIN } from '../../../shared/auth/constantesSesion.js';
import {
  TEXTO_ENVIAR_CODIGO,
  TEXTO_ENVIANDO,
  TEXTO_YA_TENGO_CODIGO,
  TEXTO_VOLVER_LOGIN
} from '../constants/mensajesRestablecimiento.js';
import CampoCorreo from './CampoCorreo.jsx';
import BotonConEspera from './BotonConEspera.jsx';
import estilos from './FormularioSolicitudCodigo.module.css';

const ID_CORREO = 'solicitud-correo';

/**
 * Formulario de la pantalla "Solicitar código" (HU-SAT-03, pantalla (a)):
 * pinta los campos y delega todo en las props. No valida ni llama servicios
 * (docs/planes/restablecer-contrasena.md §4.7).
 *
 * @param {Object} props
 * @param {string} props.idTitulo
 * @param {string} props.correo
 * @param {string} [props.errorCorreo]
 * @param {string|null} props.errorGeneral
 * @param {boolean} props.enviando
 * @param {number} props.segundosEspera
 * @param {import('react').RefObject<HTMLInputElement>} props.refCorreo
 * @param {{ correo: string } | null} props.estadoEnlaceCodigo
 * @param {(valor: string) => void} props.alCambiarCorreo
 * @param {() => void} props.alSalirDeCorreo
 * @param {(evento: SubmitEvent) => void} props.alEnviar
 */
export default function FormularioSolicitudCodigo({
  idTitulo,
  correo,
  errorCorreo,
  errorGeneral,
  enviando,
  segundosEspera,
  refCorreo,
  estadoEnlaceCodigo,
  alCambiarCorreo,
  alSalirDeCorreo,
  alEnviar
}) {
  return (
    <form noValidate onSubmit={alEnviar} aria-busy={enviando} aria-labelledby={idTitulo} className={estilos.formulario}>
      <CampoCorreo
        id={ID_CORREO}
        valor={correo}
        error={errorCorreo}
        refInput={refCorreo}
        alCambiar={alCambiarCorreo}
        alSalir={alSalirDeCorreo}
      />

      <div role="alert" className={errorGeneral ? estilos.alertaGeneral : undefined}>
        {errorGeneral && (
          <>
            <Icono nombre="alerta" tamano={18} />
            <span>{errorGeneral}</span>
          </>
        )}
      </div>

      <BotonConEspera
        tipo="submit"
        variante="primario"
        texto={TEXTO_ENVIAR_CODIGO}
        textoEnviando={TEXTO_ENVIANDO}
        segundosRestantes={segundosEspera}
        enviando={enviando}
      />

      <div className={estilos.filaEnlaces}>
        <Link
          to={RUTA_RESTABLECER_CONTRASENA}
          state={estadoEnlaceCodigo ?? undefined}
          className={estilos.enlace}
        >
          {TEXTO_YA_TENGO_CODIGO}
        </Link>
        <Link to={RUTA_LOGIN} className={estilos.enlace}>
          {TEXTO_VOLVER_LOGIN}
        </Link>
      </div>
    </form>
  );
}
