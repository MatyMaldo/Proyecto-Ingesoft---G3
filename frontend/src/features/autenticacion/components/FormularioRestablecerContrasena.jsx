import { Link } from 'react-router-dom';

import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import { RUTA_LOGIN } from '../../../shared/auth/constantesSesion.js';
import {
  TEXTO_ACEPTAR,
  TEXTO_GUARDANDO,
  TEXTO_SOLICITAR_NUEVO_CODIGO,
  TEXTO_CONTINUAR,
  TEXTO_VOLVER_PASO_1,
  TEXTO_IR_A_LOGIN,
  TEXTO_PASO_1,
  TEXTO_PASO_2,
  TEXTO_ENVIANDO,
  TEXTO_VOLVER_LOGIN,
  PLACEHOLDER_NUEVA_CONTRASENA,
  PLACEHOLDER_CONFIRMACION
} from '../constants/mensajesRestablecimiento.js';
import AvisoSolicitudCodigo from './AvisoSolicitudCodigo.jsx';
import CampoCorreo from './CampoCorreo.jsx';
import CampoCodigoVerificacion from './CampoCodigoVerificacion.jsx';
import CampoContrasena from './CampoContrasena.jsx';
import BotonConEspera from './BotonConEspera.jsx';
import RequisitosContrasena from './RequisitosContrasena.jsx';
import estilos from './FormularioRestablecerContrasena.module.css';

const ID_CORREO = 'restablecer-correo';
const ID_CODIGO = 'restablecer-codigo';
const ID_NUEVA = 'restablecer-nueva';
const ID_CONFIRMACION = 'restablecer-confirmacion';

/**
 * Formulario de la pantalla "Restablecer contraseña" (HU-SAT-03, pantalla
 * (b)): pinta los cuatro campos y delega todo en las props. No valida ni
 * llama servicios (docs/planes/restablecer-contrasena.md §4.8).
 *
 * @param {Object} props
 * @param {string} props.idTitulo
 * @param {1|2} props.paso Paso 1: correo y código. Paso 2: nueva contraseña y confirmación.
 * @param {{ correo: string, codigo: string, nuevaContrasena: string, confirmacionContrasena: string }} props.valores
 * @param {{ correo?: string, codigo?: string, nuevaContrasena?: string|string[], confirmacionContrasena?: string }} props.errores
 * @param {string|null} props.errorGeneral
 * @param {boolean} props.codigoRechazado El último rechazo fue de código (§5.2). El botón "Solicitar un nuevo
 *   código" ya está siempre visible en el orden de la pantalla; esta prop se recibe para quien la necesite, pero
 *   hoy no cambia el render.
 *   TODO(pregunta): el plan (§4.8) dice que `codigoRechazado` "muestra el atajo para pedir otro" sin precisar un
 *   elemento visual adicional al botón ya siempre presente; confirmar si falta algo (p. ej. resaltar el botón).
 * @param {boolean} props.avisoSolicitud
 * @param {boolean} props.enviando
 * @param {boolean} props.solicitandoCodigo
 * @param {number} props.segundosEspera
 * @param {{ correo: import('react').RefObject, codigo: import('react').RefObject, nuevaContrasena: import('react').RefObject, confirmacionContrasena: import('react').RefObject }} props.refs
 * @param {(nombre: string, valor: string) => void} props.alCambiarCampo
 * @param {(nombre: string) => void} props.alSalirDeCampo
 * @param {(evento: SubmitEvent) => void} props.alEnviar
 * @param {() => void} props.alSolicitarNuevoCodigo
 * @param {() => void} props.alVolverAlPaso1
 */
export default function FormularioRestablecerContrasena({
  idTitulo,
  paso,
  valores,
  errores,
  errorGeneral,
  avisoSolicitud,
  enviando,
  solicitandoCodigo,
  segundosEspera,
  refs,
  alCambiarCampo,
  alSalirDeCampo,
  alEnviar,
  alSolicitarNuevoCodigo,
  alVolverAlPaso1
}) {
  return (
    <form noValidate onSubmit={alEnviar} aria-busy={enviando} aria-labelledby={idTitulo} className={estilos.formulario}>
      <div className={estilos.filaPaso}>
        {paso === 1 ? (
          <Link to={RUTA_LOGIN} className={estilos.botonAtras} aria-label={TEXTO_VOLVER_LOGIN}>
            <Icono nombre="flecha-izquierda" tamano={16} />
            {TEXTO_IR_A_LOGIN}
          </Link>
        ) : (
          <button type="button" className={estilos.botonAtras} onClick={alVolverAlPaso1}>
            <Icono nombre="flecha-izquierda" tamano={16} />
            {TEXTO_VOLVER_PASO_1}
          </button>
        )}
        <p className={estilos.indicadorPaso}>{paso === 1 ? TEXTO_PASO_1 : TEXTO_PASO_2}</p>
      </div>

      {paso === 1 && (
        <>
          <AvisoSolicitudCodigo visible={avisoSolicitud} />

          <CampoCorreo
            id={ID_CORREO}
            valor={valores.correo}
            error={errores.correo}
            refInput={refs.correo}
            alCambiar={(valor) => alCambiarCampo('correo', valor)}
            alSalir={() => alSalirDeCampo('correo')}
          />

          <CampoCodigoVerificacion
            id={ID_CODIGO}
            valor={valores.codigo}
            error={errores.codigo}
            refInput={refs.codigo}
            alCambiar={(valor) => alCambiarCampo('codigo', valor)}
            alSalir={() => alSalirDeCampo('codigo')}
          />


          <BotonConEspera
            tipo="button"
            variante="enlace"
            texto={TEXTO_SOLICITAR_NUEVO_CODIGO}
            textoEnviando={TEXTO_ENVIANDO}
            segundosRestantes={segundosEspera}
            enviando={solicitandoCodigo}
            alPulsar={alSolicitarNuevoCodigo}
          />
        </>
      )}

      {paso === 2 && (
        <>
          <CampoContrasena
            id={ID_NUEVA}
            valor={valores.nuevaContrasena}
            error={errores.nuevaContrasena}
            autoComplete="new-password"
            refInput={refs.nuevaContrasena}
            alCambiar={(valor) => alCambiarCampo('nuevaContrasena', valor)}
            alSalir={() => alSalirDeCampo('nuevaContrasena')}
            etiqueta="Nueva contraseña"
            nombre="nuevaContrasena"
            conOjo
            placeholder={PLACEHOLDER_NUEVA_CONTRASENA}
          />

          {!Array.isArray(errores.nuevaContrasena) && (
            <RequisitosContrasena id="restablecer-requisitos" valor={valores.nuevaContrasena} />
          )}

          <CampoContrasena
            id={ID_CONFIRMACION}
            valor={valores.confirmacionContrasena}
            error={errores.confirmacionContrasena}
            autoComplete="new-password"
            refInput={refs.confirmacionContrasena}
            alCambiar={(valor) => alCambiarCampo('confirmacionContrasena', valor)}
            alSalir={() => alSalirDeCampo('confirmacionContrasena')}
            etiqueta="Confirmar contraseña"
            nombre="confirmacionContrasena"
            conOjo={false}
            placeholder={PLACEHOLDER_CONFIRMACION}
          />

        </>
      )}

      <div role="alert" className={errorGeneral ? estilos.alertaGeneral : undefined}>
        {errorGeneral && (
          <>
            <Icono nombre="alerta" tamano={18} />
            <span>{errorGeneral}</span>
          </>
        )}
      </div>

      <button type="submit" className={estilos.botonAceptar} aria-disabled={enviando ? 'true' : undefined}>
        {enviando ? (
          <>
            <Icono nombre="cargando" tamano={18} className={estilos.iconoCargando} />
            {TEXTO_GUARDANDO}
          </>
        ) : paso === 1 ? (
          TEXTO_CONTINUAR
        ) : (
          TEXTO_ACEPTAR
        )}
      </button>
      <span role="status" className={estilosUtil.ocultoVisualmente}>
        {enviando ? TEXTO_GUARDANDO : ''}
      </span>

      {paso === 2 && (
        <Link to={RUTA_LOGIN} className={estilos.enlace}>
          {TEXTO_VOLVER_LOGIN}
        </Link>
      )}
    </form>
  );
}
