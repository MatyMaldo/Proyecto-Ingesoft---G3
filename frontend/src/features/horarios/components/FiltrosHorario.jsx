import Icono from '../../../shared/components/Icono.jsx';
import CampoSelect from './CampoSelect.jsx';
import estilos from './FiltrosHorario.module.css';

/**
 * Filtros obligatorios de la pantalla: año académico, grado y sección. Sin los tres no se muestra nada más.
 *
 * @param {Object} props
 * @param {Array<{ id: string|number, anio: string|number }>} props.anios
 * @param {Array<{ id: string, nombre: string }>} props.grados
 * @param {Array<{ id: string, nombre: string }>} props.secciones
 * @param {{ anioId: string, gradoId: string, seccion: string, completos: boolean }} props.filtros
 * @param {boolean} props.deshabilitado
 * @param {boolean} [props.seccionesCargando]
 * @param {(valor: string) => void} props.alCambiarAnio
 * @param {(valor: string) => void} props.alCambiarGrado
 * @param {(valor: string) => void} props.alCambiarSeccion
 * @param {() => void} props.alVerHorario
 */
export default function FiltrosHorario({
  anios = [],
  grados,
  secciones,
  filtros,
  deshabilitado,
  seccionesCargando = false,
  alCambiarAnio,
  alCambiarGrado,
  alCambiarSeccion,
  alVerHorario
}) {
  const opcionesAnio = [...anios]
    .sort((a, b) => Number(b.anio) - Number(a.anio))
    .map((anio) => ({ valor: String(anio.id), etiqueta: String(anio.anio) }));

  return (
    <form
      className={estilos.filtros}
      onSubmit={(evento) => {
        evento.preventDefault();
        alVerHorario();
      }}
    >
      <div className={estilos.campoAnio}>
        <CampoSelect
          id="horarios-anio"
          etiqueta="Año académico"
          requerido
          placeholder="Seleccionar año..."
          valor={filtros.anioId}
          deshabilitado={deshabilitado}
          opciones={opcionesAnio}
          alCambiar={alCambiarAnio}
        />
      </div>
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
          placeholder={seccionesCargando ? 'Cargando secciones...' : 'Sección...'}
          valor={filtros.seccion}
          deshabilitado={deshabilitado || seccionesCargando || filtros.gradoId === ''}
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
