import { useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import { TONO_NOTA, formatearFecha } from '../utils/formatoCursoEstudiante.js';
import { armarMatrizBimestre, bimestreInicial } from '../utils/matrizNotas.js';
import estilos from './PanelEvaluacionesCurso.module.css';

function Nota({ valor }) {
  return <Insignia tono={TONO_NOTA[valor] ?? 'gris'}>{valor}</Insignia>;
}

/** Celda sin dato: una raya a la vista y la explicación para lectores de pantalla. */
function SinDato({ texto }) {
  return (
    <>
      <span aria-hidden="true" className={estilos.sinDato}>—</span>
      <span className={estilosUtil.ocultoVisualmente}>{texto}</span>
    </>
  );
}

function ContenidoEvaluaciones({ datos }) {
  const [bimestreId, establecerBimestreId] = useState(() => bimestreInicial(datos));
  const bimestre = datos.bimestres.find((actual) => actual.id === bimestreId);
  const matriz = armarMatrizBimestre(datos, bimestreId);

  return (
    <div className={estilos.panel}>
      <div className={estilos.controles}>
        <SelectFiltro
          id="bimestre-curso"
          etiqueta="Bimestre"
          valor={bimestreId}
          opciones={datos.bimestres.map((actual) => ({ valor: actual.id, etiqueta: actual.nombre }))}
          alCambiar={establecerBimestreId}
        />
        <Insignia tono="azul" className={estilos.insigniaIcono}>
          <Icono nombre="escudo" tamano={14} />
          Solo lectura — Notas oficiales MINEDU
        </Insignia>
      </div>

      {matriz.filas.length === 0 ? (
        <p className={estilos.vacio}>El curso aún no tiene competencias establecidas.</p>
      ) : (
        <div className={estilos.tablaDesbordable}>
          <table className={estilos.tabla}>
            <caption className={estilosUtil.ocultoVisualmente}>
              Notas por competencia del {bimestre?.nombre ?? 'bimestre'}
            </caption>
            <thead>
              <tr>
                <th scope="col" rowSpan={2} className={estilos.colCompetencia}>Competencia</th>
                {matriz.columnas > 0 && (
                  <th scope="colgroup" colSpan={matriz.columnas} className={estilos.grupoEvaluaciones}>
                    Evaluaciones del periodo
                  </th>
                )}
                <th scope="colgroup" colSpan={datos.bimestres.length} className={estilos.grupoLogro}>
                  Logro por competencia
                </th>
              </tr>
              <tr>
                {Array.from({ length: matriz.columnas }, (_, indice) => (
                  <th scope="col" key={indice} className={estilos.colEvaluacion}>Ev. {indice + 1}</th>
                ))}
                {datos.bimestres.map((actual) => (
                  <th scope="col" key={actual.id} className={estilos.colBimestre}>{actual.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matriz.filas.map((fila) => (
                <tr key={fila.id}>
                  <th scope="row" className={estilos.colCompetencia}>{fila.nombre}</th>
                  {fila.evaluaciones.map((evaluacion, indice) => (
                    <td key={indice} className={estilos.colEvaluacion}>
                      {!evaluacion && <SinDato texto="sin evaluación" />}
                      {evaluacion && (evaluacion.nota
                        ? <Nota valor={evaluacion.nota} />
                        : <SinDato texto="no hay nota registrada" />)}
                    </td>
                  ))}
                  {datos.bimestres.map((actual) => (
                    <td key={actual.id} className={estilos.colBimestre}>
                      {fila.notasPorBimestre[actual.id]
                        ? <Nota valor={fila.notasPorBimestre[actual.id]} />
                        : <SinDato texto="no hay nota de competencia registrada" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className={estilos.bloque} aria-labelledby="evaluaciones-periodo-titulo">
        <h3 id="evaluaciones-periodo-titulo" className={estilos.tituloBloque}>
          Evaluaciones · {bimestre?.nombre ?? 'periodo'}
        </h3>
        {matriz.evaluaciones.length === 0 ? (
          <p className={estilos.vacio}>No hay evaluaciones registradas en este bimestre.</p>
        ) : (
          <ul className={estilos.listaEvaluaciones}>
            {matriz.evaluaciones.map((evaluacion) => (
              <li key={evaluacion.id} className={estilos.evaluacion}>
                <div className={estilos.resumenEvaluacion}>
                  <div>
                    <strong className={estilos.nombreEvaluacion}>{evaluacion.nombre}</strong>
                    <span className={estilos.fechaEvaluacion}>
                      {evaluacion.competenciaNombre} · Ev. {evaluacion.numero} · {formatearFecha(evaluacion.fecha)}
                    </span>
                  </div>
                  {evaluacion.nota
                    ? <Nota valor={evaluacion.nota} />
                    : <span className={estilos.sinNota}>no hay nota registrada</span>}
                </div>
                <details className={estilos.desplegable}>
                  <summary>Ver detalle</summary>
                  <dl className={estilos.datosEvaluacion}>
                    <div><dt>Curso</dt><dd>{evaluacion.cursoNombre}</dd></div>
                    <div><dt>Grado y sección</dt><dd>{evaluacion.gradoNombre} · Sección {evaluacion.seccionNombre}</dd></div>
                    <div><dt>Docente</dt><dd>{evaluacion.docenteNombre || '—'}</dd></div>
                    <div><dt>Evaluación</dt><dd>{evaluacion.nombre}</dd></div>
                    <div><dt>Descripción</dt><dd>{evaluacion.descripcion || '—'}</dd></div>
                    <div><dt>Fecha</dt><dd>{formatearFecha(evaluacion.fecha)}</dd></div>
                    <div><dt>Bimestre</dt><dd>{evaluacion.bimestreNombre}</dd></div>
                    <div><dt>Competencia</dt><dd>{evaluacion.competenciaNombre}</dd></div>
                    <div><dt>Estudiante</dt><dd>{evaluacion.estudianteNombre}</dd></div>
                    <div>
                      <dt>Nota</dt>
                      <dd>{evaluacion.nota ?? <span className={estilos.sinNota}>no hay nota registrada</span>}</dd>
                    </div>
                  </dl>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * Pestaña "Evaluaciones y Notas" del detalle de un curso (HU-EVAL-03): una matriz de competencias con la nota de
 * cada evaluación del bimestre elegido y la nota de la competencia en cada bimestre, y debajo la lista de
 * evaluaciones del bimestre con su detalle. El curso no tiene nota final. Solo lectura.
 *
 * @param {Object} props
 * @param {Object|null} props.datos Respuesta de `consultarNotasCursoEstudiante`; `null` mientras carga o si falló.
 * @param {boolean} props.cargando
 * @param {string|null} props.error `null` si no hubo error; texto del backend, o cadena vacía para el mensaje genérico.
 * @param {() => void} props.alReintentar
 */
export default function PanelEvaluacionesCurso({ datos, cargando, error, alReintentar }) {
  if (cargando) {
    return <EstadoConsulta tipo="carga" mensaje="Cargando evaluaciones y notas…" filasEsqueleto={3} />;
  }
  if (error !== null) {
    return <EstadoConsulta tipo="error" mensaje={error || undefined} alReintentar={alReintentar} />;
  }
  return datos ? <ContenidoEvaluaciones datos={datos} /> : null;
}
