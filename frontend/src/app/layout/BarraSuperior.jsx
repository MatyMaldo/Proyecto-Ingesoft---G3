import Icono from '../../shared/components/Icono.jsx';
import CampoBusqueda from '../../shared/components/CampoBusqueda.jsx';
import useAuth from '../../shared/auth/useAuth.js';
import estilos from './BarraSuperior.module.css';

/**
 * Barra superior: botón de menú (móvil/tableta), contexto de marca, búsqueda,
 * notificaciones, menú de usuario y "Salir". Búsqueda, notificaciones y menú
 * de usuario son visibles pero no disponibles (ver `docs/planes/shell.md`
 * §6.4); "Salir" cierra la sesión real (docs/planes/login.md §4.7).
 *
 * @param {Object} props
 * @param {boolean} props.cajonAbierto Para `aria-expanded` del botón de menú.
 * @param {() => void} props.alAlternarCajon Abre/cierra el cajón.
 * @param {import('react').RefObject<HTMLButtonElement>} props.refBotonMenu
 */
export default function BarraSuperior({ cajonAbierto, alAlternarCajon, refBotonMenu }) {
  const { usuario, cerrarSesion } = useAuth();
  const inicial = usuario?.nombre?.charAt(0)?.toUpperCase() ?? '';

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

      <div className={estilos.busqueda}>
        <CampoBusqueda
          id="busqueda-global"
          etiqueta="Buscar estudiante"
          placeholder="Buscar estudiante..."
          variante="relleno"
          noDisponible
        />
      </div>
      {/* TODO(pregunta): búsqueda global fuera de alcance del shell */}

      <span className={estilos.separador} aria-hidden="true" />

      {/* TODO(pregunta): notificaciones fuera de alcance del shell */}
      <button
        type="button"
        className={estilos.campana}
        aria-label="Notificaciones"
        aria-disabled="true"
        aria-describedby="aviso-no-disponible"
        title="Función no disponible por ahora"
      >
        <Icono nombre="campana" tamano={20} />
        <span className={estilos.puntoNotificacion} aria-hidden="true" />
      </button>

      <span className={estilos.separador} aria-hidden="true" />

      {/* TODO(pregunta): menú de usuario fuera de alcance del shell */}
      <button
        type="button"
        className={estilos.menuUsuario}
        aria-label={`Menú de usuario: ${usuario?.nombre}, ${usuario?.etiquetaRol}`}
        aria-disabled="true"
        aria-describedby="aviso-no-disponible"
        title="Función no disponible por ahora"
      >
        <span className={estilos.avatar} aria-hidden="true">
          {inicial}
        </span>
        <span className={estilos.datosUsuario}>
          <p className={estilos.nombreUsuario}>{usuario?.nombre}</p>
          <p className={estilos.rolUsuario}>{usuario?.etiquetaRol}</p>
        </span>
        <Icono nombre="chevron-abajo" tamano={16} />
      </button>

      <button type="button" className={estilos.botonSalir} aria-label="Salir" onClick={cerrarSesion}>
        <Icono nombre="salir" tamano={18} />
        <span className={estilos.textoSalir}>Salir</span>
      </button>
    </header>
  );
}
