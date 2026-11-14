import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import MenuDesplegable from '../../../shared/components/MenuDesplegable.jsx';
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
          <Icono nombre={curso.icono} tamano={20} />
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
          Gestionar competencias
        </button>
        {puedeGestionar && (
          <MenuDesplegable
            etiquetaBoton={`Más acciones de ${curso.nombre}`}
            claseBoton={estilos.botonMas}
            alineacion="fin"
            contenidoBoton={<Icono nombre="mas-opciones" tamano={20} />}
            items={[
              { id: 'editar', etiqueta: 'Modificar', ariaLabel: `Modificar ${curso.nombre}`, icono: 'editar', alSeleccionar: () => alEditar(curso.id) },
              { id: 'eliminar', etiqueta: 'Eliminar', ariaLabel: `Eliminar ${curso.nombre}`, icono: 'papelera', tono: 'peligro', alSeleccionar: () => alEliminar(curso.id) }
            ]}
          />
        )}
      </div>
    </article>
  );
}
