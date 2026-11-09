/**
 * Bandera de Perú (franjas verticales rojo, blanco y rojo) dibujada como SVG. Se usa en lugar del emoji 🇵🇪
 * porque Windows no tiene glifos de banderas y muestra las letras "PE".
 * Es decorativa: el prefijo "+51" que la acompaña ya dice el país.
 *
 * @param {Object} props
 * @param {number} [props.ancho] Ancho en px; el alto mantiene la proporción 3:2.
 */
export default function BanderaPeru({ ancho = 22 }) {
  return (
    <svg
      width={ancho}
      height={Math.round((ancho * 2) / 3)}
      viewBox="0 0 30 20"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, borderRadius: 3, boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.12)' }}
    >
      <rect width="30" height="20" fill="#fff" />
      <rect width="10" height="20" fill="#d91023" />
      <rect x="20" width="10" height="20" fill="#d91023" />
    </svg>
  );
}
