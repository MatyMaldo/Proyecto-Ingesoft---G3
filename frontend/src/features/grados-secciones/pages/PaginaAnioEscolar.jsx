import { useEffect } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import PanelGradosSecciones from '../components/PanelGradosSecciones.jsx';
import useGradosSecciones from '../hooks/useGradosSecciones.js';
import estilos from './PaginaAnioEscolar.module.css';

/**
 * Año escolar: grados y secciones de cada año académico. La acción principal de la cabecera es «Crear sección»;
 * «Crear grado» (el grado se comparte entre años) queda junto a los chips de grado.
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

  const motivoSinSeccion = modelo.finalizado
    ? 'Este año académico finalizó: se pueden consultar sus secciones, pero no crear nuevas.'
    : !modelo.anio || !modelo.grado
      ? 'Selecciona un año académico y un grado para crear una sección.'
      : undefined;

  return (
    <div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      {/* Barra de título (GUI §6): título y descripción en la misma línea y la acción principal a la derecha. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Año escolar</h1>
          <p className={estilos.descripcion}>Organiza los grados y las secciones de cada año académico.</p>
        </div>
        <div className={estilos.acciones}>
          <button
            type="button"
            className={estilos.botonPrimario}
            disabled={modelo.estado !== 'listo' || !modelo.puedeCrearSeccion}
            title={motivoSinSeccion}
            onClick={() => modelo.abrir('seccion')}
          >
            <Icono nombre="agregar" tamano={18} />
            Crear sección
          </button>
        </div>
      </header>

      <PanelGradosSecciones modelo={modelo} />
    </div>
  );
}
