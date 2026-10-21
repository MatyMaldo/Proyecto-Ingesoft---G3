import { Link } from 'react-router-dom';

import Icono from './Icono.jsx';
import estilos from './AvisoPagina.module.css';

/**
 * Aviso de acceso no autorizado por falta de permiso (sesión con un rol que no
 * puede usar la pantalla). La falta de sesión ya no se avisa aquí: la redirige
 * `RutaProtegida` a `/iniciar-sesion`.
 */
export default function AccesoNoAutorizado() {
  return (
    <section className={estilos.contenedor}>
      <div className={estilos.tarjeta}>
        <Icono nombre="candado" tamano={40} className={estilos.icono} />
        <h1 className={estilos.titulo}>Acceso no autorizado</h1>
        <p className={estilos.texto}>No tienes permisos para acceder a esta sección.</p>
        <Link to="/" className={estilos.enlace}>
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
