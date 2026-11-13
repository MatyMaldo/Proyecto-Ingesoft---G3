import Icono from '../../../shared/components/Icono.jsx';
import { obtenerIconoCurso } from '../constants/iconosCurso.js';
import { textoDocente } from '../utils/formatoCursoEstudiante.js';
import estilos from './TarjetaCursoEstudiante.module.css';

/**
 * Tarjeta de un curso del estudiante: nombre, docente, descripción y aula. Toda la tarjeta abre el detalle
 * (el botón "Ver detalle" se extiende sobre ella con CSS, así que hay un solo control para teclado y lector de pantalla).
 *
 * @param {Object} props
 * @param {{ id: string, nombre: string, descripcion: string, docenteNombre: string, aulas: string[] }} props.curso
 * @param {(curso: Object) => void} props.alVerDetalle
 */
export default function TarjetaCursoEstudiante({ curso, alVerDetalle }) {
  const docente = textoDocente(curso.docenteNombre);
  const [aula, ...otrasAulas] = curso.aulas ?? [];

  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <span className={estilos.recuadroIcono} aria-hidden="true">{obtenerIconoCurso(curso.nombre)}</span>
        <div className={estilos.contenido}>
          <h3 className={estilos.nombre}>{curso.nombre}</h3>
          {docente && <p className={estilos.docente}>{docente}</p>}
          {curso.descripcion && <p className={estilos.descripcion}>{curso.descripcion}</p>}
        </div>
      </div>
      <div className={estilos.pie}>
        {aula ? (
          <span className={estilos.aula} title={curso.aulas.join(', ')}>
            <Icono nombre="aula" tamano={16} />
            <span>{aula}{otrasAulas.length > 0 && ` +${otrasAulas.length}`}</span>
          </span>
        ) : <span />}
        <button
          type="button"
          className={estilos.botonDetalle}
          aria-label={`Ver detalle de ${curso.nombre}`}
          onClick={() => alVerDetalle(curso)}
        >
          Ver detalle
          <Icono nombre="chevron-derecha" tamano={16} />
        </button>
      </div>
    </article>
  );
}
