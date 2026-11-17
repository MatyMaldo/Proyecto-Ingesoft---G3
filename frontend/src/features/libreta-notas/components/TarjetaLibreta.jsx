import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { etiquetaBimestre, formatearFechaLibreta } from '../utils/formatoLibreta.js';
import estilos from './TarjetaLibreta.module.css';

/**
 * Tarjeta de una libreta generada: bimestre, año, fecha de generación y vista previa del comentario del tutor.
 * Toda la tarjeta abre el detalle (el botón se extiende sobre ella con CSS: un solo control para teclado y lector).
 *
 * @param {Object} props
 * @param {{ idLibreta: number|string, nombreBimestre: string, anioAcademico: number|string, fechaGeneracion?: string,
 *   comentariosFinalesTutor?: string }} props.libreta
 * @param {(libreta: Object) => void} props.alVerDetalle
 */
export default function TarjetaLibreta({ libreta, alVerDetalle }) {
  const titulo = `${etiquetaBimestre(libreta.nombreBimestre)} · ${libreta.anioAcademico}`;

  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <span className={estilos.recuadroIcono} aria-hidden="true">
          <Icono nombre="archivo" tamano={22} />
        </span>
        <div className={estilos.contenido}>
          <h3 className={estilos.titulo}>{etiquetaBimestre(libreta.nombreBimestre)}</h3>
          <p className={estilos.fecha}>Generada el {formatearFechaLibreta(libreta.fechaGeneracion)}</p>
        </div>
      </div>

      {libreta.comentariosFinalesTutor && (
        <p className={estilos.comentario}>
          <span>Comentario del tutor</span>
          {libreta.comentariosFinalesTutor}
        </p>
      )}

      <div className={estilos.pie}>
        <Insignia tono="verde">Generada</Insignia>
        <button
          type="button"
          className={estilos.botonDetalle}
          aria-label={`Ver libreta de ${titulo}`}
          onClick={() => alVerDetalle(libreta)}
        >
          Ver libreta
          <Icono nombre="chevron-derecha" tamano={16} />
        </button>
      </div>
    </article>
  );
}
