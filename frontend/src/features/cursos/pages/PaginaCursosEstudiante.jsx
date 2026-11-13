import useAuth from '../../../shared/auth/useAuth.js';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import DetalleCursoEstudiante from '../components/DetalleCursoEstudiante.jsx';
import TarjetaCursoEstudiante from '../components/TarjetaCursoEstudiante.jsx';
import useCursosEstudiante from '../hooks/useCursosEstudiante.js';
import { abreviarGrado } from '../utils/formatoCursoEstudiante.js';
import estilos from './PaginaCursosEstudiante.module.css';

const MENSAJE_SIN_MATRICULA = 'No hay cursos con matrícula confirmada para el año académico de consulta.';
const MENSAJE_SIN_CURSOS = 'Aún no hay cursos asignados a tu sección en el año académico de consulta.';

/**
 * "Mis cursos" del estudiante (HU-EVAL-03): los cursos del año académico de consulta y, al abrir uno, sus
 * evaluaciones y notas. El breadcrumb lo pinta el shell.
 */
export default function PaginaCursosEstudiante() {
  const { usuario } = useAuth();
  const { estado, error, contexto, cursos, reintentar, detalle } = useCursosEstudiante(usuario);

  const grupo = contexto && !contexto.sinMatricula
    ? [abreviarGrado(contexto.gradoNombre), contexto.seccionNombre].filter(Boolean).join(' ')
    : '';

  if (detalle.curso) {
    return (
      <div className={estilos.pagina}>
        <DetalleCursoEstudiante
          curso={detalle.curso}
          grupo={grupo}
          gradoNombre={contexto?.gradoNombre ?? ''}
          datos={detalle.datos}
          cargando={detalle.cargando}
          error={detalle.error}
          alVolver={detalle.cerrar}
          alReintentar={detalle.reintentar}
        />
      </div>
    );
  }

  const textoCantidad = cursos.length === 1 ? '1 curso' : `${cursos.length} cursos`;

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Portal del estudiante</p>
          <h1 className={estilos.titulo}>Mis Cursos</h1>
          <p className={estilos.descripcion}>Haz clic en un curso para ver sus evaluaciones y notas.</p>
        </div>
        {estado === 'listo' && cursos.length > 0 && (
          <div className={estilos.resumen}>
            <Insignia tono="azul" className={estilos.insigniaIcono}>
              <Icono nombre="escudo" tamano={14} />
              {contexto.estudiante.nombre}{grupo && ` — ${grupo}`}
            </Insignia>
            <Insignia tono="gris">{textoCantidad}</Insignia>
          </div>
        )}
      </header>

      {estado === 'cargando' && (
        <div className={estilos.contenedorEstado}>
          <EstadoConsulta tipo="carga" mensaje="Cargando tus cursos…" filasEsqueleto={3} />
        </div>
      )}

      {estado === 'error' && (
        <div className={estilos.contenedorEstado}>
          <EstadoConsulta tipo="error" mensaje={error || undefined} alReintentar={reintentar} />
        </div>
      )}

      {estado === 'listo' && cursos.length === 0 && (
        <div className={estilos.contenedorEstado}>
          <EstadoConsulta tipo="vacio" mensaje={contexto?.sinMatricula ? MENSAJE_SIN_MATRICULA : MENSAJE_SIN_CURSOS} />
        </div>
      )}

      {estado === 'listo' && cursos.length > 0 && (
        <ul className={estilos.rejilla} aria-label="Mis cursos">
          {cursos.map((curso) => (
            <li key={curso.id}>
              <TarjetaCursoEstudiante curso={curso} alVerDetalle={detalle.abrir} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
