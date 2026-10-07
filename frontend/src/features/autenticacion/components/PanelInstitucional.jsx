import Icono from '../../../shared/components/Icono.jsx';
import estilos from './PanelInstitucional.module.css';

const PERFILES = ['Administrador', 'Docente', 'Estudiante', 'Apoderado'];

/**
 * Columna de marca del prototipo de inicio de sesión. Solo presentación, sin
 * controles interactivos. No incluye la lista de funcionalidades del
 * prototipo (error de prototipado, ver docs/planes/login.md §4.2, O1).
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

      <p className={estilos.rotuloPerfiles}>Perfiles de acceso del sistema</p>
      <ul className={estilos.listaPerfiles}>
        {PERFILES.map((perfil) => (
          <li key={perfil} className={estilos.pildora}>
            {perfil}
          </li>
        ))}
      </ul>
    </aside>
  );
}
