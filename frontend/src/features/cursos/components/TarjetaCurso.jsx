import Insignia from '../../../shared/components/Insignia.jsx';
import estilos from './TarjetaCurso.module.css';

/**
 * Tarjeta de consulta de curso: nombre, descripción y cantidad de competencias.
 *
 * @param {Object} props
 * @param {Object} props.curso CursoVista.
 * @param {(idCurso: string) => void} props.alAgregarCompetencia
 * @param {(idCurso: string) => void} props.alVerCompetencias
 */
export default function TarjetaCurso({ curso, alAgregarCompetencia, alVerCompetencias }) {
  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <span className={estilos.recuadroIcono} aria-hidden="true">
          {curso.icono}
        </span>
        <div className={estilos.contenido}>
          <div className={estilos.filaNombre}>
            <h3 className={estilos.nombre}>{curso.nombre}</h3>
            {curso.textoCompetencias && <Insignia tono="verde">{curso.textoCompetencias}</Insignia>}
          </div>
          <p className={estilos.descripcion}>{curso.descripcion}</p>
        </div>
      </div>
      <div className={estilos.pie}>
        <button
          type="button"
          className={estilos.botonCompetencias}
          aria-label={`Ver competencias de ${curso.nombre}`}
          onClick={() => alVerCompetencias(curso.id)}
        >
          Ver competencias
        </button>
        <button
          type="button"
          className={estilos.botonCompetencias}
          aria-label={`Agregar competencia a ${curso.nombre}`}
          onClick={() => alAgregarCompetencia(curso.id)}
        >
          Agregar competencia
        </button>
      </div>
    </article>
  );
}
