import estilos from './BarraResumen.module.css';

const COLORES_VALIDOS = new Set(['azul-marino', 'azul', 'violeta', 'verde', 'roja', 'naranja']);

/**
 * Tarjeta horizontal de métricas resumen.
 *
 * @param {Object} props
 * @param {string} props.etiqueta `aria-label` de la lista.
 * @param {Array<{ id: string, valor: number|string, etiqueta: string, color: string }>} props.metricas
 */
export default function BarraResumen({ etiqueta, metricas }) {
  return (
    <ul className={estilos.tarjeta} aria-label={etiqueta}>
      {metricas.map((metrica) => {
        const color = COLORES_VALIDOS.has(metrica.color) ? metrica.color : 'azul-marino';

        return (
          <li key={metrica.id} className={estilos.metrica}>
            <span className={estilos.cifra} style={{ color: `var(--color-cifra-${color})` }}>
              {metrica.valor}
            </span>
            <span className={estilos.rotulo}>{metrica.etiqueta}</span>
          </li>
        );
      })}
    </ul>
  );
}
