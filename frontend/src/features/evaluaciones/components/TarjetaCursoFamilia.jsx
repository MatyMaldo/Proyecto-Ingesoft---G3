import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilos from './TarjetaCursoFamilia.module.css';

/**
 * Tarjeta de un curso del estudiante, para apoderado: icono, nombre, grado y sección. Toda la tarjeta abre el detalle
 * (el botón se extiende sobre ella con CSS, así hay un solo control para teclado y lector de pantalla).
 *
 * @param {Object} props
 * @param {{ id: number|string, nombre: string, gradoNombre: string, seccionNombre: string }} props.curso
 * @param {number|string} [props.anio] Año académico de consulta.
 * @param {(curso: Object) => void} props.alVerDetalle
 */
export default function TarjetaCursoFamilia({ curso, anio, alVerDetalle }) {
  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <span className={estilos.recuadroIcono} aria-hidden="true">
          <Icono nombre="libro" tamano={22} />
        </span>
        <div className={estilos.contenido}>
          <h3 className={estilos.nombre}>{curso.nombre}</h3>
          <p className={estilos.grupo}>{curso.gradoNombre}</p>
        </div>
      </div>

      <div className={estilos.insignias}>
        <Insignia tono="azul">Sección {curso.seccionNombre}</Insignia>
        {anio && <Insignia tono="gris">{anio}</Insignia>}
      </div>

      <div className={estilos.pie}>
        <button
          type="button"
          className={estilos.botonDetalle}
          aria-label={`Ver evaluaciones y notas de ${curso.nombre}`}
          onClick={() => alVerDetalle(curso)}
        >
          Ver evaluaciones y notas
          <Icono nombre="chevron-derecha" tamano={16} />
        </button>
      </div>
    </article>
  );
}
