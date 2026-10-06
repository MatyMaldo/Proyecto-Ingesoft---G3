import Icono from './Icono.jsx';
import estilos from './AvisoPagina.module.css';

/**
 * Aviso genérico para ítems de navegación que aún no tienen una página real.
 *
 * @param {Object} props
 * @param {string} props.nombre Nombre del módulo (título de la pantalla).
 */
export default function ModuloEnConstruccion({ nombre }) {
  return (
    <section className={estilos.contenedor}>
      <div className={estilos.tarjeta}>
        <Icono nombre="construccion" tamano={40} className={estilos.icono} />
        <h1 className={estilos.titulo}>{nombre}</h1>
        <p className={estilos.texto}>Módulo en construcción.</p>
      </div>
    </section>
  );
}
