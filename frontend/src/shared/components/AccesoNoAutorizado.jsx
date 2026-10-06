import { Link } from 'react-router-dom';

import Icono from './Icono.jsx';
import estilos from './AvisoPagina.module.css';

const TEXTOS = {
  'sin-permiso': 'No tienes permisos para acceder a esta sección.',
  'sin-sesion': 'Debes iniciar sesión para acceder al sistema.'
};

/**
 * Aviso de acceso no autorizado, por falta de sesión o de permiso.
 *
 * @param {Object} props
 * @param {'sin-permiso'|'sin-sesion'} [props.motivo]
 */
export default function AccesoNoAutorizado({ motivo = 'sin-permiso' }) {
  const Raiz = motivo === 'sin-sesion' ? 'main' : 'section';

  return (
    <Raiz className={estilos.contenedor}>
      <div className={estilos.tarjeta}>
        <Icono nombre="candado" tamano={40} className={estilos.icono} />
        <h1 className={estilos.titulo}>Acceso no autorizado</h1>
        <p className={estilos.texto}>{TEXTOS[motivo]}</p>
        {motivo === 'sin-permiso' && (
          <Link to="/" className={estilos.enlace}>
            Ir al inicio
          </Link>
        )}
        {/* TODO(backend): con "sin-sesion", enlazar a /login cuando exista LoginView. */}
      </div>
    </Raiz>
  );
}
