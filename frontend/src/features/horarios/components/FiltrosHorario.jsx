import Icono from '../../../shared/components/Icono.jsx';
import CampoSelect from './CampoSelect.jsx';
import estilos from './FiltrosHorario.module.css';

/**
 * Filtros obligatorios de la pantalla: grado y sección. Sin ambos no se muestra nada más.
 *
 * @param {Object} props
 * @param {Array<{ id: string, nombre: string }>} props.grados
 * @param {Array<{ id: string, nombre: string }>} props.secciones
 * @param {{ gradoId: string, seccion: string, completos: boolean }} props.filtros
 * @param {boolean} props.deshabilitado
 * @param {(valor: string) => void} props.alCambiarGrado
 * @param {(valor: string) => void} props.alCambiarSeccion
 * @param {() => void} props.alVerHorario
 */
export default function FiltrosHorario({
  grados,
  secciones,
  filtros,
  deshabilitado,
  alCambiarGrado,
  alCambiarSeccion,
  alVerHorario
}) {
  return (
    <form
      className={estilos.filtros}
      onSubmit={(evento) => {
        evento.preventDefault();
        alVerHorario();
      }}
    >
      <div className={estilos.campoGrado}>
        <CampoSelect
          id="horarios-grado"
          etiqueta="Grado"
          requerido
          placeholder="Seleccionar grado..."
          valor={filtros.gradoId}
          deshabilitado={deshabilitado}
          opciones={grados.map((grado) => ({ valor: grado.id, etiqueta: grado.nombre }))}
          alCambiar={alCambiarGrado}
        />
      </div>
      <div className={estilos.campoSeccion}>
        <CampoSelect
          id="horarios-seccion"
          etiqueta="Sección"
          requerido
          placeholder="Sección..."
          valor={filtros.seccion}
          deshabilitado={deshabilitado || filtros.gradoId === ''}
          opciones={secciones.map((seccion) => ({ valor: seccion.id, etiqueta: seccion.nombre }))}
          alCambiar={alCambiarSeccion}
        />
      </div>
      <button type="submit" className={estilos.boton} disabled={deshabilitado || !filtros.completos}>
        <Icono nombre="buscar" tamano={18} />
        Ver horario
      </button>
    </form>
  );
}
