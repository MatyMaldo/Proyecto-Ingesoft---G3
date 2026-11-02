import Icono from '../../shared/components/Icono.jsx';
import estilos from './BarraSuperior.module.css';

/**
 * Barra superior de móvil y tableta: botón de menú y contexto de marca. En
 * escritorio no se muestra: la barra lateral ya trae la marca, el usuario y
 * "Cerrar sesión". Se retiraron la búsqueda global, las notificaciones y el
 * menú de usuario, que no estaban disponibles.
 *
 * @param {Object} props
 * @param {boolean} props.cajonAbierto Para `aria-expanded` del botón de menú.
 * @param {() => void} props.alAlternarCajon Abre/cierra el cajón.
 * @param {import('react').RefObject<HTMLButtonElement>} props.refBotonMenu
 */
export default function BarraSuperior({ cajonAbierto, alAlternarCajon, refBotonMenu }) {
  return (
    <header className={estilos.header}>
      <button
        ref={refBotonMenu}
        type="button"
        className={estilos.botonMenu}
        aria-label={cajonAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        aria-expanded={cajonAbierto}
        aria-controls="barra-lateral"
        onClick={alAlternarCajon}
      >
        <Icono nombre="menu" tamano={22} />
      </button>

      <p className={estilos.contexto}>
        <span className={estilos.prefijoContexto}>Sistema de Gestión</span>
        <span className={estilos.separadorContexto} aria-hidden="true">
          {' '}
          /{' '}
        </span>
        <span className={estilos.nombreColegio}>Colegio San Marcos</span>
      </p>
    </header>
  );
}
