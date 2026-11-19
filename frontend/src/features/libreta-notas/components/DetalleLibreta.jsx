import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { TONO_NOTA } from '../../cursos/utils/formatoCursoEstudiante.js';
import { agruparNotasPorCurso, etiquetaBimestre, formatearFechaLibreta } from '../utils/formatoLibreta.js';
import estilos from './DetalleLibreta.module.css';

const ESCALA = Object.keys(TONO_NOTA);

/**
 * Contenido del diálogo de una libreta: datos generales, comentario final del tutor y, por curso, las notas de sus
 * competencias. El PDF se abre desde el pie del diálogo. No calcula promedios: muestra lo que entrega el backend.
 *
 * @param {Object} props
 * @param {Object} props.detalle Respuesta de `obtenerDetalleLibreta`.
 * @param {string} props.estudiante Nombre del estudiante.
 */
export default function DetalleLibreta({ detalle, estudiante }) {
  const cursos = agruparNotasPorCurso(detalle.notasCompetencias);

  return (
    <div className={estilos.detalle}>
      <dl className={estilos.resumen}>
        <div>
          <dt><Icono nombre="birrete" tamano={16} /> Estudiante</dt>
          <dd>{estudiante || '—'}</dd>
        </div>
        <div>
          <dt><Icono nombre="calendario" tamano={16} /> Periodo</dt>
          <dd>{etiquetaBimestre(detalle.nombreBimestre)} · {detalle.anioAcademico}</dd>
        </div>
        <div>
          <dt><Icono nombre="archivo" tamano={16} /> Generada el</dt>
          <dd>{formatearFechaLibreta(detalle.fechaGeneracion)}</dd>
        </div>
      </dl>

      <section className={estilos.comentarios} aria-label="Comentarios finales del tutor">
        <h3><Icono nombre="informacion" tamano={16} /> Comentario final del tutor</h3>
        <p>{detalle.comentariosFinalesTutor || 'Sin comentarios finales del tutor.'}</p>
      </section>

      {cursos.length === 0 ? (
        <p className={estilos.vacio}>La libreta parcial no tiene notas de competencias.</p>
      ) : (
        <div className={estilos.cursos}>
          {cursos.map(([nombreCurso, competencias]) => (
            <section key={nombreCurso} className={estilos.curso} aria-label={nombreCurso}>
              <h3 className={estilos.tituloCurso}>
                <span className={estilos.iconoCurso} aria-hidden="true"><Icono nombre="libro" tamano={16} /></span>
                {nombreCurso}
              </h3>
              <ul className={estilos.lista}>
                {competencias.map((competencia) => (
                  <li key={competencia.nombreCompetencia} className={estilos.competencia}>
                    <div className={estilos.texto}>
                      <strong>{competencia.nombreCompetencia}</strong>
                      {competencia.descripcion && <span className={estilos.desempeno}>{competencia.descripcion}</span>}
                      {competencia.conclusionDescriptiva && <p>{competencia.conclusionDescriptiva}</p>}
                    </div>
                    <Insignia tono={TONO_NOTA[competencia.valorNota]} className={estilos.nota}>
                      {competencia.valorNota}
                    </Insignia>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className={estilos.leyenda}>
        Escala de calificación:
        {ESCALA.map((nota) => <Insignia key={nota} tono={TONO_NOTA[nota]} className={estilos.notaLeyenda}>{nota}</Insignia>)}
      </p>
    </div>
  );
}
