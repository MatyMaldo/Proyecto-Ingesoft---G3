import Icono from '../../../shared/components/Icono.jsx';
import estilos from './PanelInstitucional.module.css';

/**
 * Columna de marca del prototipo de inicio de sesión. Solo presentación, sin
 * controles interactivos. No incluye la lista de funcionalidades del
 * prototipo (error de prototipado, ver docs/planes/login.md §4.2, O1) ni los
 * perfiles de acceso: el rol lo determina la cuenta, no se elige en el login.
 */
export default function PanelInstitucional() {
  return (
    <aside aria-label="Información institucional" className={estilos.panel}>
      <div className={estilos.logo}>
        <Icono nombre="capas" tamano={48} />
      </div>

      <p className={estilos.sobretitulo}>República del Perú — 2026</p>
      <p className={estilos.titulo}>Colegio de Educación Secundaria</p>

      <span className={estilos.acento} aria-hidden="true" />

      <p className={estilos.lema}>Plataforma Integral de Gestión Académica y Administrativa</p>
    </aside>
  );
}
