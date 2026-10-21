import PanelGradosSecciones from '../components/PanelGradosSecciones.jsx';
import estilos from './PaginaAnioEscolar.module.css';

/** Contenedor provisional: Matías podrá integrar aquí la configuración del año. */
export default function PaginaAnioEscolar() {
  return (
    <div className={estilos.pagina}>
      <header><p className={estilos.sobretitulo}>Administración</p><h1>Año escolar</h1>
        <p className={estilos.subtitulo}>Organiza los grados y las secciones de cada año académico.</p>
      </header>
      <div className={estilos.encabezadoBloque}><h2>Grados y secciones</h2></div>
      <PanelGradosSecciones />
    </div>
  );
}
