import { useEffect } from 'react';

import Notificacion from '../../../shared/components/Notificacion.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import PanelGradosSecciones from '../components/PanelGradosSecciones.jsx';
import useGradosSecciones from '../hooks/useGradosSecciones.js';
import estilos from './PaginaAnioEscolar.module.css';

/**
 * Año escolar: grados y secciones de cada año académico. La cabecera solo da contexto; cada acción vive junto a lo
 * que crea: «Crear grado» entre los chips de grado y «Crear sección» en el título de las secciones del grado elegido.
 */
export default function PaginaAnioEscolar() {
  const modelo = useGradosSecciones();
  const { notificacion, mostrarNotificacion } = useNotificacion();
  const { confirmacion } = modelo;

  // Los resultados del guardado se anuncian en la notificación flotante, que sigue visible tras cerrar el diálogo.
  useEffect(() => {
    if (confirmacion) {
      mostrarNotificacion(confirmacion);
    }
    // `mostrarNotificacion` cambia en cada render y solo importa cuándo aparece una confirmación nueva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmacion]);

  return (
    <div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      {/* Barra de título (GUI §6): título y descripción en la misma línea, sin acciones. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Año escolar</h1>
          <p className={estilos.descripcion}>Organiza los grados y las secciones de cada año académico.</p>
        </div>
      </header>

      <PanelGradosSecciones modelo={modelo} />
    </div>
  );
}
