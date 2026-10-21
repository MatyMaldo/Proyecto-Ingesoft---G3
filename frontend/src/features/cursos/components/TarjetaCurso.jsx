import Insignia from '../../../shared/components/Insignia.jsx';
import estilos from './TarjetaCurso.module.css';

/**
 * Tarjeta de un curso: nombre, descripción y, si la persona puede gestionar, el botón
 * "Añadir competencias". Solo pinta: no formatea ni llama servicios.
 *
 * @param {Object} props
 * @param {Object} props.curso CursoVista.
 * @param {boolean} props.puedeGestionar
 * @param {(idCurso: string, elementoOrigen: HTMLElement) => void} props.alAnadirCompetencias
 */
export default function TarjetaCurso({ curso, puedeGestionar, alAnadirCompetencias }) {
  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <span className={estilos.recuadroIcono} aria-hidden="true">
          {curso.icono}
        </span>
        <div className={estilos.contenido}>
          <div className={estilos.filaNombre}>
            <h3 className={estilos.nombre}>{curso.nombre}</h3>
            {curso.textoAsignadas && <Insignia tono="verde">{curso.textoAsignadas}</Insignia>}
          </div>
          <p className={estilos.descripcion}>{curso.descripcion}</p>
        </div>
      </div>

      {puedeGestionar && (
        <div className={estilos.pie}>
          <button
            type="button"
            className={estilos.botonCompetencias}
            aria-label={`Añadir competencias a ${curso.nombre}`}
            onClick={(evento) => alAnadirCompetencias(curso.id, evento.currentTarget)}
          >
            Añadir competencias
          </button>
        </div>
      )}
    </article>
  );
}
