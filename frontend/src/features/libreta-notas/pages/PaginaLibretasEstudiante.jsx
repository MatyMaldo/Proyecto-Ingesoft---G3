import { useEffect, useState } from 'react';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import useAuth from '../../../shared/auth/useAuth.js';
import { ROLES } from '../../../shared/auth/roles.js';
import { listarEstudiantesConsulta } from '../../../features/evaluaciones/services/consultaNotasService.js';
import { listarLibretasDelEstudiante } from '../services/libretasService.js';
import { descargarLibretaPdf } from '../utils/generarLibretaPdf.js';
import estilos from './PaginaLibretasEstudiante.module.css';

function ordenarLibretas(libretas) {
  return [...libretas].sort((a, b) => Number(b.anioAcademico) - Number(a.anioAcademico)
    || Number(String(b.bimestreId).replace(/\D/g, '')) - Number(String(a.bimestreId).replace(/\D/g, '')));
}

export default function PaginaLibretasEstudiante() {
  const { usuario } = useAuth();
  const esEstudiante = usuario?.rol === ROLES.ESTUDIANTE;
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteId, setEstudianteId] = useState(esEstudiante ? String(usuario?.id ?? '') : '');
  const [libretas, setLibretas] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [error, setError] = useState('');

  useEffect(() => {
    let activa = true;
    async function cargarEstudiantes() {
      setEstado('cargando');
      const respuesta = await listarEstudiantesConsulta(usuario);
      if (!activa) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setError(respuesta.mensaje || 'No se pudo cargar la lista de estudiantes.');
        setEstado('error');
        return;
      }
      setEstudiantes(respuesta.datos);
      const idInicial = esEstudiante ? String(usuario.id) : String(respuesta.datos[0]?.id ?? '');
      setEstudianteId(idInicial);
      if (!idInicial) {
        setLibretas([]);
        setEstado('listo');
      }
    }
    cargarEstudiantes();
    return () => { activa = false; };
  }, [usuario?.id, usuario?.rol]);

  useEffect(() => {
    let activa = true;
    async function cargarLibretas() {
      if (!estudianteId) return;
      setEstado('cargando');
      setError('');
      const respuesta = await listarLibretasDelEstudiante(usuario, estudianteId);
      if (!activa) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setError(respuesta.mensaje || 'No se pudieron cargar las libretas de notas.');
        setEstado('error');
        return;
      }
      setLibretas(ordenarLibretas(respuesta.datos));
      setEstado('listo');
    }
    cargarLibretas();
    return () => { activa = false; };
  }, [estudianteId, usuario?.id, usuario?.rol]);

  const estudianteSeleccionado = estudiantes.find((item) => String(item.id) === estudianteId);

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.sobretitulo}>Seguimiento académico</p>
        <h1 className={estilos.titulo}>Libreta de notas</h1>
        <p className={estilos.descripcion}>{esEstudiante ? 'Consulta y descarga tus libretas generadas del año académico de consulta.' : 'Selecciona un estudiante bajo tu cargo para consultar sus libretas generadas.'}</p>
      </header>

      {!esEstudiante && estado !== 'error' && estudiantes.length > 0 && (
        <div className={estilos.selectorEstudiante}>
          <label htmlFor="estudiante-libreta">Estudiante</label>
          <select id="estudiante-libreta" value={estudianteId} onChange={(evento) => setEstudianteId(evento.target.value)}>
            {estudiantes.map((item) => <option key={item.id} value={item.id}>{item.nombre} · {item.codigo}</option>)}
          </select>
        </div>
      )}

      {estado === 'cargando' && <div className={estilos.estado}><EstadoConsulta tipo="carga" /></div>}
      {estado === 'error' && <p className={estilos.error} role="alert">{error}</p>}
      {estado === 'listo' && !esEstudiante && !estudiantes.length && <p className={estilos.vacio}>No hay estudiantes asociados a tu cuenta de apoderado.</p>}
      {estado === 'listo' && estudianteId && !libretas.length && <p className={estilos.vacio}>Aún no se ha generado ninguna libreta de notas del estudiante</p>}
      {estado === 'listo' && libretas.length > 0 && (
        <section className={estilos.lista} aria-label="Libretas de notas generadas">
          {libretas.map((libreta) => (
            <article className={estilos.libreta} key={libreta.id}>
              <header className={estilos.encabezadoLibreta}>
                <div><p className={estilos.periodo}>{libreta.bimestre} · {libreta.anioAcademico}</p><h2>{libreta.estudiante.nombre}</h2><p>Código: {libreta.estudiante.codigo}</p></div>
                <button type="button" className={estilos.botonDescarga} onClick={() => descargarLibretaPdf(libreta)}>Descargar PDF</button>
              </header>
              <div className={estilos.cursos}>
                {libreta.cursos.map((curso, indice) => <section className={estilos.curso} key={`${curso.nombre}-${indice}`}>
                  <div className={estilos.encabezadoCurso}><h3>{curso.nombre}</h3><span>{curso.grado} · Sección {curso.seccion}</span></div>
                  <p className={estilos.docente}>Docente: {curso.docente}</p>
                  <ul>{curso.competencias.map((competencia) => <li key={competencia.nombre}><div><strong>{competencia.nombre}</strong><p>{competencia.conclusionDescriptiva}</p></div><span className={estilos.nota}>{competencia.nota}</span></li>)}</ul>
                </section>)}
              </div>
              <div className={estilos.pieLibreta}>
                <section aria-label="Asistencia del bimestre"><h3>Asistencia</h3><p>Inasistencias: <strong>{libreta.asistencia.inasistencias}</strong> · Tardanzas: <strong>{libreta.asistencia.tardanzas}</strong></p></section>
                <section aria-label="Comentarios finales del tutor"><h3>Comentarios del tutor</h3><p>{libreta.comentariosTutor}</p></section>
              </div>
            </article>
          ))}
        </section>
      )}
      {estudianteSeleccionado && estado === 'listo' && !libretas.length && null}
    </main>
  );
}
