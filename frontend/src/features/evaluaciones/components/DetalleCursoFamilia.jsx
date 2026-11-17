import { useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import PestanasCurso from '../../cursos/components/PestanasCurso.jsx';
import { abreviarGrado, formatearFecha, TONO_NOTA } from '../../cursos/utils/formatoCursoEstudiante.js';
import estilos from './DetalleCursoFamilia.module.css';

const ESCALA = Object.keys(TONO_NOTA);
const ID_BASE = 'detalle-curso-familia';

/** "BIM_1" → "Bimestre 1". Si el nombre no tiene ese formato, se muestra tal cual. */
function etiquetaBimestre(nombre) {
  const coincidencia = /^BIM_(\d+)$/.exec(String(nombre ?? ''));
  return coincidencia ? `Bimestre ${coincidencia[1]}` : String(nombre ?? '');
}

/** Nota de la escala AD / A / B / C como insignia de color (la letra siempre se ve, no solo el color). */
function NotaInsignia({ nota }) {
  if (!nota) {
    return <span className={estilos.sinNota} title="Sin nota registrada">Sin nota</span>;
  }
  return <Insignia tono={TONO_NOTA[nota]} className={estilos.nota}>{nota}</Insignia>;
}

/** Agrupa las evaluaciones por bimestre, en el orden en que el backend entrega los bimestres. */
function agruparPorBimestre(evaluaciones, bimestres) {
  const grupos = bimestres.map((bimestre) => ({ nombre: bimestre.nombre, evaluaciones: [] }));
  evaluaciones.forEach((evaluacion) => {
    let grupo = grupos.find((item) => item.nombre === evaluacion.bimestreNombre);
    if (!grupo) {
      grupo = { nombre: evaluacion.bimestreNombre, evaluaciones: [] };
      grupos.push(grupo);
    }
    grupo.evaluaciones.push(evaluacion);
  });
  return grupos
    .filter((grupo) => grupo.evaluaciones.length > 0)
    .map((grupo) => ({
      ...grupo,
      evaluaciones: [...grupo.evaluaciones].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
    }));
}

/**
 * Contenido del diálogo de un curso: datos del curso, y en pestañas las evaluaciones (por bimestre) y las notas de
 * competencias. Solo muestra lo que entrega el backend; no calcula promedios.
 *
 * @param {Object} props
 * @param {Object} props.detalle Respuesta de `consultarNotasCurso`.
 */
export default function DetalleCursoFamilia({ detalle }) {
  const [pestana, establecerPestana] = useState('evaluaciones');
  const grupos = agruparPorBimestre(detalle.evaluaciones, detalle.bimestres);

  return (
    <div className={estilos.detalle}>
      <dl className={estilos.resumen}>
        <div>
          <dt><Icono nombre="usuario" tamano={16} /> Docente</dt>
          <dd>{detalle.docenteNombre || '—'}</dd>
        </div>
        <div>
          <dt><Icono nombre="aula" tamano={16} /> Grado y sección</dt>
          <dd>{abreviarGrado(detalle.gradoNombre)} · Sección {detalle.seccionNombre}</dd>
        </div>
        <div>
          <dt><Icono nombre="birrete" tamano={16} /> Estudiante</dt>
          <dd>{detalle.estudiante.nombre}</dd>
        </div>
      </dl>

      <PestanasCurso
        idBase={ID_BASE}
        etiqueta="Secciones del curso"
        activa={pestana}
        alCambiar={establecerPestana}
        pestanas={[
          { id: 'evaluaciones', etiqueta: 'Evaluaciones', insignia: String(detalle.evaluaciones.length) },
          { id: 'competencias', etiqueta: 'Competencias', insignia: String(detalle.competencias.length) }
        ]}
      />

      <div
        role="tabpanel"
        id={`${ID_BASE}-panel`}
        aria-labelledby={`${ID_BASE}-${pestana}`}
        className={estilos.panel}
      >
        {pestana === 'evaluaciones' && (
          grupos.length === 0 ? (
            <p className={estilos.vacio}>No hay evaluaciones registradas para este curso.</p>
          ) : grupos.map((grupo) => (
            <section key={grupo.nombre} className={estilos.grupo} aria-label={`Evaluaciones de ${etiquetaBimestre(grupo.nombre)}`}>
              <h3 className={estilos.tituloGrupo}>
                {etiquetaBimestre(grupo.nombre)}
                <span>{grupo.evaluaciones.length === 1 ? '1 evaluación' : `${grupo.evaluaciones.length} evaluaciones`}</span>
              </h3>
              <ul className={estilos.lista}>
                {grupo.evaluaciones.map((evaluacion) => (
                  <li key={evaluacion.id} className={estilos.evaluacion}>
                    <div className={estilos.textoEvaluacion}>
                      <strong>{evaluacion.nombre}</strong>
                      {evaluacion.descripcion && <p>{evaluacion.descripcion}</p>}
                      <div className={estilos.meta}>
                        <span className={estilos.fecha}>
                          <Icono nombre="calendario" tamano={14} />
                          {formatearFecha(evaluacion.fecha)}
                        </span>
                      </div>
                    </div>
                    <div className={estilos.notaBloque}>
                      <span className={estilos.etiquetaNota}>Nota</span>
                      <NotaInsignia nota={evaluacion.nota} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        {pestana === 'competencias' && (
          detalle.competencias.length === 0 ? (
            <p className={estilos.vacio}>El curso aún no tiene competencias establecidas.</p>
          ) : (
            <ul className={estilos.lista}>
              {detalle.competencias.map((competencia) => (
                <li key={competencia.id} className={estilos.competencia}>
                  <strong>{competencia.nombre}</strong>
                  <div className={estilos.bimestres}>
                    {detalle.bimestres.map((bimestre) => (
                      <div key={bimestre.id} className={estilos.celdaBimestre}>
                        <span className={estilos.etiquetaNota}>{etiquetaBimestre(bimestre.nombre)}</span>
                        <NotaInsignia nota={competencia.notasPorBimestre[bimestre.nombre]} />
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      <p className={estilos.leyenda}>
        Escala de calificación:
        {ESCALA.map((nota) => <Insignia key={nota} tono={TONO_NOTA[nota]} className={estilos.nota}>{nota}</Insignia>)}
      </p>
    </div>
  );
}
