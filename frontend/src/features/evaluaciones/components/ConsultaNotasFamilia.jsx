import { useEffect, useState } from 'react';
import { ROLES } from '../../../shared/auth/roles.js';
import useAuth from '../../../shared/auth/useAuth.js';
import BotonActualizar from '../../../shared/components/BotonActualizar.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import {
  consultarNotasCurso,
  listarCursosConsulta,
  listarEstudiantesConsulta
} from '../services/consultaNotasService.js';
import estilos from './ConsultaNotasFamilia.module.css';
import DetalleCursoFamilia from './DetalleCursoFamilia.jsx';
import TarjetaCursoFamilia from './TarjetaCursoFamilia.jsx';

const evitarEnvio = (evento) => evento.preventDefault();

/**
 * Consulta de cursos, evaluaciones y notas para apoderado/estudiante. Misma estructura que los módulos del admin:
 * cabecera en una línea, filtros, tarjetas que se desplazan por dentro y el detalle del curso en un diálogo.
 */
export default function ConsultaNotasFamilia() {
  const { usuario } = useAuth();
  const esEstudiante = usuario?.rol === ROLES.ESTUDIANTE;
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteId, setEstudianteId] = useState(esEstudiante ? String(usuario?.id ?? '') : '');
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);
  const [cargandoCursos, setCargandoCursos] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargarEstudiantes() {
      setCargandoEstudiantes(true);
      const respuesta = await listarEstudiantesConsulta(usuario);
      if (!activo) return;
      setCargandoEstudiantes(false);
      if (!respuesta.exitoso) {
        setError(respuesta.mensaje || 'No se pudo identificar al estudiante.');
        return;
      }
      const lista = Array.isArray(respuesta.datos) ? respuesta.datos : [];
      setEstudiantes(lista);
      if (esEstudiante) setEstudianteId(String(usuario.id));
      else setEstudianteId((actual) => actual || String(lista[0]?.id ?? ''));
    }
    cargarEstudiantes();
    return () => { activo = false; };
  }, [usuario?.id, usuario?.rol]);

  useEffect(() => {
    let activo = true;
    async function cargarCursos() {
      setDetalle(null);
      setCursoSeleccionado(null);
      setCursos([]);
      setError('');
      if (!estudianteId) return;
      setCargandoCursos(true);
      const respuesta = await listarCursosConsulta(usuario, estudianteId);
      if (!activo) return;
      setCargandoCursos(false);
      if (!respuesta.exitoso) {
        setError(respuesta.mensaje || 'No se pudieron cargar los cursos del año de consulta.');
        return;
      }
      setCursos(Array.isArray(respuesta.datos) ? respuesta.datos : []);
    }
    cargarCursos();
    return () => { activo = false; };
  }, [estudianteId, recarga, usuario?.id, usuario?.rol]);

  const estudiante = estudiantes.find((item) => String(item.id) === estudianteId);
  const nombreEstudiante = estudiante?.nombre ?? usuario?.nombre;
  const anioConsulta = cursos[0]?.anioAcademico?.anio;

  function cerrarDetalle() {
    setDetalle(null);
    setCursoSeleccionado(null);
    setError('');
  }

  async function abrirNotas(curso) {
    setCursoSeleccionado(curso);
    setDetalle(null);
    setError('');
    setCargandoDetalle(true);
    const respuesta = await consultarNotasCurso(usuario, estudianteId, curso.id);
    setCargandoDetalle(false);
    if (!respuesta.exitoso) {
      setError(respuesta.mensaje || 'No se pudieron consultar las notas del curso.');
      return;
    }
    setDetalle(respuesta.datos);
  }

  const hayCursos = !cargandoCursos && cursos.length > 0;
  const mostrarEstados = !hayCursos;

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Cursos</h1>
          <p className={estilos.descripcion}>
            Consulta las evaluaciones, notas y resultados por competencia del año académico de consulta.
          </p>
        </div>
      </header>

      {!cargandoEstudiantes && (
        <section className={estilos.filtros} aria-label="Filtros de cursos">
          {!esEstudiante && estudiantes.length > 0 && (
            <SelectFiltro
              apilado
              id="estudiante-consulta"
              etiqueta="Estudiante"
              valor={estudianteId}
              opciones={estudiantes.map((item) => ({
                valor: String(item.id),
                etiqueta: `${item.nombre} · ${item.codigo}`
              }))}
              alCambiar={setEstudianteId}
            />
          )}
          {esEstudiante && (
            <p className={estilos.estudianteActual}>Estudiante: <strong>{usuario?.nombre}</strong></p>
          )}
          <BotonActualizar
            alActualizar={() => setRecarga((n) => n + 1)}
            actualizando={cargandoCursos}
            deshabilitado={!estudianteId}
          />
        </section>
      )}

      {hayCursos && (
        <section className={estilos.zonaCursos} aria-labelledby="cursos-consulta-titulo">
          <div className={estilos.encabezadoLista}>
            <h2 id="cursos-consulta-titulo">Cursos de {nombreEstudiante}</h2>
            <p>Año académico de consulta: <strong>{anioConsulta ?? '—'}</strong></p>
          </div>
          <ul className={estilos.rejilla}>
            {cursos.map((curso) => (
              <li key={`${curso.id}-${curso.seccionId}`}>
                <TarjetaCursoFamilia curso={curso} anio={anioConsulta} alVerDetalle={abrirNotas} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {mostrarEstados && (
        <section className={estilos.tarjetaResultados} aria-label="Cursos" aria-busy={cargandoCursos || undefined}>
          {cargandoEstudiantes && (
            <EstadoConsulta tipo="carga" mensaje="Cargando información…" filasEsqueleto={3} />
          )}

          {!cargandoEstudiantes && !esEstudiante && !estudiantes.length && !error && (
            <EstadoConsulta tipo="vacio" mensaje="No hay estudiantes asociados a tu cuenta de apoderado." />
          )}

          {!cargandoEstudiantes && error && !cursoSeleccionado && (
            <EstadoConsulta tipo="error" mensaje={error} alReintentar={() => setRecarga((n) => n + 1)} />
          )}

          {cargandoCursos && (
            <EstadoConsulta tipo="carga" mensaje="Cargando cursos del año de consulta…" filasEsqueleto={3} />
          )}

          {!cargandoCursos && !cargandoEstudiantes && estudianteId && !error && cursos.length === 0 && (
            <EstadoConsulta
              tipo="vacio"
              mensaje="No hay cursos con matrícula confirmada para el año académico de consulta."
            />
          )}
        </section>
      )}

      {cursoSeleccionado && (
        <DialogoBase
          idTitulo="dialogo-notas-curso"
          titulo={detalle
            ? `${detalle.curso.nombre} · ${detalle.gradoNombre} ${detalle.seccionNombre}`
            : cursoSeleccionado.nombre}
          subtitulo={detalle
            ? `Evaluaciones y notas · Año académico ${detalle.anioConsulta.anio}`
            : 'Evaluaciones y notas'}
          textoConfirmar=""
          textoEnviando=""
          textoCancelar="Cerrar"
          sinConfirmar
          anchoMaximo="52rem"
          cerrarAlClicFuera={false}
          botonesExpandidos
          error={detalle ? null : error || null}
          alCancelar={cerrarDetalle}
          alConfirmar={evitarEnvio}
        >
          {cargandoDetalle && (
            <EstadoConsulta tipo="carga" mensaje="Cargando evaluaciones y notas…" filasEsqueleto={3} />
          )}
          {detalle && <DetalleCursoFamilia detalle={detalle} />}
        </DialogoBase>
      )}
    </div>
  );
}
