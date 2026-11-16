import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import estilos from './TarjetaEvaluacion.module.css';

/**
 * Tarjeta de una evaluación: nombre, bimestre, competencia, fecha y descripción, con «Registrar notas» al pie
 * (mismo patrón que las tarjetas de Cursos). Las notas solo se registran con el año académico vigente.
 *
 * @param {Object} props
 * @param {Object} props.evaluacion
 * @param {boolean} props.vigente `true` si la evaluación es del año académico vigente.
 * @param {(evaluacion: Object) => void} props.alRegistrarNotas
 */
export default function TarjetaEvaluacion({ evaluacion, vigente, alRegistrarNotas }) {
  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <h3 className={estilos.nombre}>{evaluacion.nombre}</h3>
        {evaluacion.bimestreNombre && <Insignia tono="azul">{evaluacion.bimestreNombre}</Insignia>}
      </div>

      {evaluacion.descripcion && <p className={estilos.descripcion}>{evaluacion.descripcion}</p>}

      <p className={estilos.datos}>
        <span className={estilos.dato}>
          <Icono nombre="calendario" tamano={14} />
          {formatearFechaVisible(evaluacion.fecha)}
        </span>
        {evaluacion.competenciaNombre && (
          <span className={estilos.dato} title="Competencia que mide la evaluación">
            <Icono nombre="libro" tamano={14} />
            {evaluacion.competenciaNombre}
          </span>
        )}
      </p>

      <div className={estilos.pie}>
        <span className={estilos.autor}>Creada por {evaluacion.docenteCreadorNombre ?? 'Docente'}</span>
        <button
          type="button"
          className={estilos.botonNotas}
          disabled={!vigente}
          title={vigente ? undefined : 'Las notas solo se registran con el año académico vigente.'}
          aria-label={`Registrar notas de ${evaluacion.nombre}`}
          onClick={() => alRegistrarNotas(evaluacion)}
        >
          {vigente ? 'Registrar notas' : 'Notas bloqueadas'}
        </button>
      </div>
    </article>
  );
}
