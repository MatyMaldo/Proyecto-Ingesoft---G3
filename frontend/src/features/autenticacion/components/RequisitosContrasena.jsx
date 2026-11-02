import Icono from '../../../shared/components/Icono.jsx';
import {
  TEXTO_REQUISITOS_CONTRASENA,
  REQUISITOS_CORTOS_CONTRASENA,
  ORDEN_REQUISITOS_POLITICA,
  TEXTO_REQUISITO_CUMPLIDO,
  TEXTO_REQUISITO_PENDIENTE
} from '../constants/mensajesRestablecimiento.js';
import { evaluarPoliticaContrasena } from '../utils/validacionRestablecimiento.js';
import estilos from './RequisitosContrasena.module.css';

/**
 * Lista de requisitos de la política de contraseñas que se marca mientras se
 * escribe. Cada requisito comunica su estado con ícono y texto, no solo con
 * color. Solo presentación: reutiliza `evaluarPoliticaContrasena`.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.valor Nueva contraseña escrita hasta ahora.
 */
export default function RequisitosContrasena({ id, valor }) {
  const incumplidos = evaluarPoliticaContrasena(valor);

  return (
    <div id={id} className={estilos.contenedor}>
      <p className={estilos.rotulo}>{TEXTO_REQUISITOS_CONTRASENA}</p>
      <ul className={estilos.lista}>
        {ORDEN_REQUISITOS_POLITICA.map((clave) => {
          const cumplido = valor.length > 0 && !incumplidos.includes(clave);

          return (
            <li key={clave} className={cumplido ? estilos.cumplido : estilos.pendiente}>
              <span className={estilos.marca} aria-hidden="true">
                {cumplido ? <Icono nombre="verificar" tamano={14} /> : null}
              </span>
              {REQUISITOS_CORTOS_CONTRASENA[clave]}
              <span className={estilos.estado}>
                {' '}
                — {cumplido ? TEXTO_REQUISITO_CUMPLIDO : TEXTO_REQUISITO_PENDIENTE}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
