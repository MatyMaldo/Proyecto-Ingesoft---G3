import estilos from './SelectorFilasPagina.module.css';

/**
 * Selector «Filas por página» del pie de un listado (10 / 25 / 50 / 100). Una opción mayor que el total de
 * resultados se deshabilita: no cambiaría nada. Es el mismo control que usan Usuarios, Matrículas y Pagos.
 *
 * @param {Object} props
 * @param {number[]} props.opciones Tamaños que se pueden elegir.
 * @param {number} props.valor Tamaño vigente.
 * @param {number} props.totalElementos Total de resultados (con los filtros aplicados).
 * @param {(tamanio: number) => void} props.alCambiar
 */
export default function SelectorFilasPagina({ opciones, valor, totalElementos, alCambiar }) {
  return (
    <div className={estilos.selector} role="group" aria-label="Filas por página">
      <span>Filas por página</span>
      {opciones.map((opcion) => (
        <button
          key={opcion}
          type="button"
          className={`${estilos.opcion} ${opcion === valor ? estilos.activa : ''}`}
          aria-pressed={opcion === valor}
          disabled={opcion !== valor && totalElementos < opcion}
          onClick={() => alCambiar(opcion)}
        >
          {opcion}
        </button>
      ))}
    </div>
  );
}
