import estilos from './Insignia.module.css';

const TONOS_VALIDOS = new Set([
  'verde', 'azul', 'violeta', 'ambar', 'turquesa', 'indigo', 'gris', 'rosa', 'rojo', 'cian',
  'marino', 'acero', 'ciruela'
]);

/**
 * Píldora de solo lectura (insignia de módulo, tipo de error, etc.).
 *
 * @param {Object} props
 * @param {string} props.tono Uno de los tonos de `tokens.css`; desconocido → `gris`.
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export default function Insignia({ tono, children, className }) {
  const tonoValido = TONOS_VALIDOS.has(tono) ? tono : 'gris';

  return (
    <span
      className={`${estilos.insignia} ${className ?? ''}`}
      style={{
        '--tono-fondo': `var(--tono-${tonoValido}-fondo)`,
        '--tono-borde': `var(--tono-${tonoValido}-borde)`,
        '--tono-texto': `var(--tono-${tonoValido}-texto)`
      }}
    >
      {children}
    </span>
  );
}
