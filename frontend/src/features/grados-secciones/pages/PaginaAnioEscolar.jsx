import PanelGradosSecciones from '../components/PanelGradosSecciones.jsx';
import PanelAnioAcademico from '../components/PanelAnioAcademico.jsx';
import estilos from './PaginaAnioEscolar.module.css';
import { useState } from 'react';

/** Contenedor provisional: Matías podrá integrar aquí la configuración del año. */
export default function PaginaAnioEscolar() {
  const [versionAnios, establecerVersionAnios] = useState(0);

  return (
    <div className={estilos.pagina}>
      <header><p className={estilos.sobretitulo}>Administración</p><h1>Año escolar</h1>
        <p className={estilos.subtitulo}>Organiza los grados y las secciones de cada año académico.</p>
      </header>
      <div className={estilos.encabezadoBloque}><h2>Año académico</h2></div>
      <PanelAnioAcademico alCrearAnio={() => establecerVersionAnios((valor) => valor + 1)} />
      <div className={estilos.encabezadoBloque}><h2>Grados y secciones</h2></div>
      <PanelGradosSecciones key={versionAnios}/>
    </div>
  );
}
