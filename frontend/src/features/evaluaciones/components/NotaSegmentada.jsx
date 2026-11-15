import { ESCALA_NOTAS_EVALUACION } from '../services/evaluacionesService.js';
import estilos from './NotaSegmentada.module.css';

/**
 * Selector de nota de la escala AD / A / B / C con las cuatro opciones a la vista (grupo de opciones de selección
 * única). Se usa en las minipantallas de notas para no abrir un desplegable por cada estudiante o competencia.
 *
 * @param {Object} props
 * @param {string} props.etiqueta Nombre accesible del grupo (p. ej. «Nota de María López»).
 * @param {string} props.valor Nota elegida; vacío si no hay.
 * @param {(nota: string) => void} props.alCambiar
 * @param {boolean} [props.deshabilitado]
 */
export default function NotaSegmentada({ etiqueta, valor, alCambiar, deshabilitado = false }) {
  return (
    <div className={estilos.grupo} role="radiogroup" aria-label={etiqueta}>
      {ESCALA_NOTAS_EVALUACION.map((nota) => {
        const activa = nota === valor;
        return (
          <button
            key={nota}
            type="button"
            role="radio"
            aria-checked={activa}
            disabled={deshabilitado}
            className={activa ? `${estilos.opcion} ${estilos.activa}` : estilos.opcion}
            onClick={() => alCambiar(nota)}
          >
            {nota}
          </button>
        );
      })}
    </div>
  );
}
