import { useId } from 'react';
import Icono from '../../../shared/components/Icono.jsx';
import estilos from './CampoUsuario.module.css';

/**
 * Campo de formulario con etiqueta asociada (clic en la etiqueta enfoca el campo), ayuda opcional y error con
 * ícono y texto (GUI §5). El error nunca se comunica solo con el color.
 *
 * @param {Object} props
 * @param {string} props.etiqueta
 * @param {string} props.valor
 * @param {(valor: string) => void} props.alCambiar Recibe el texto ya extraído del evento.
 * @param {string} [props.error] Mensaje de error; si existe, el campo se marca como inválido.
 * @param {string} [props.ayuda] Texto de apoyo bajo el campo (se oculta mientras haya error).
 * @param {boolean} [props.requerido] Muestra el asterisco y marca el campo como obligatorio.
 * @param {boolean} [props.anchoCompleto] Ocupa toda la fila de la cuadrícula de la sección.
 * @param {boolean} [props.autoEnfocar] Recibe el foco al abrir el diálogo (`data-enfoque-inicial` de DialogoBase).
 * @param {import('react').ReactNode} [props.prefijo] Contenido fijo a la izquierda del campo (p. ej. "+51").
 * @param {Object} [props.resto] El resto de atributos (`type`, `placeholder`, `maxLength`, `autoComplete`...) pasa al `<input>`.
 */
export default function CampoUsuario({
  etiqueta,
  valor,
  alCambiar,
  error = '',
  ayuda = '',
  requerido = false,
  anchoCompleto = false,
  autoEnfocar = false,
  prefijo = null,
  ...resto
}) {
  const id = useId();
  const idMensaje = `${id}-mensaje`;
  const textoApoyo = error || ayuda;

  return (
    <div className={`${estilos.campo} ${anchoCompleto ? estilos.anchoCompleto : ''}`}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
        {requerido && <span className={estilos.asterisco} aria-hidden="true"> *</span>}
      </label>
      <div className={estilos.fila}>
        {prefijo && <div className={`${estilos.prefijo} ${error ? estilos.prefijoError : ''}`}>{prefijo}</div>}
        <input
          id={id}
          className={estilos.entrada}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          required={requerido}
          aria-invalid={error ? true : undefined}
          aria-describedby={textoApoyo ? idMensaje : undefined}
          data-enfoque-inicial={autoEnfocar ? '' : undefined}
          {...resto}
        />
      </div>
      {error ? (
        <p id={idMensaje} className={estilos.error}>
          <Icono nombre="alerta" tamano={14} />
          <span>{error}</span>
        </p>
      ) : (
        ayuda && <p id={idMensaje} className={estilos.ayuda}>{ayuda}</p>
      )}
    </div>
  );
}
