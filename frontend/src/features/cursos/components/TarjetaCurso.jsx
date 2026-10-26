import Insignia from '../../../shared/components/Insignia.jsx';
import estilos from './TarjetaCurso.module.css';

/**
 * Tarjeta de consulta de curso: nombre, descripción y cantidad de competencias.
 *
 * @param {Object} props
 * @param {Object} props.curso CursoVista.
 * @param {(idCurso: string) => void} props.alVerCompetencias
 * @param {boolean} props.puedeGestionar
 * @param {(idCurso: string) => void} props.alEditar
 * @param {(idCurso: string) => void} props.alEliminar
 */
export default function TarjetaCurso({
  curso,
  alVerCompetencias,
  puedeGestionar,
  alEditar,
  alEliminar
}) {
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
          aria-label={`Gestionar competencias de ${curso.nombre}`}
          onClick={() => alVerCompetencias(curso.id)}
        >
          Gestionar Competencias
        </button>
        {puedeGestionar && (
          <>
            <button
              type="button"
              className={estilos.botonCompetencias}
              aria-label={`Modificar ${curso.nombre}`}
              onClick={() => alEditar(curso.id)}
            >
              Modificar
            </button>
            <button
              type="button"
              className={`${estilos.botonCompetencias} ${estilos.botonEliminar}`}
              aria-label={`Eliminar ${curso.nombre}`}
              onClick={() => alEliminar(curso.id)}
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </article>
  );
}
