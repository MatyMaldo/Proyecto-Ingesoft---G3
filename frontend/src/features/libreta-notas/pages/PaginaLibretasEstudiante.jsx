import { useEffect, useState } from 'react';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import useAuth from '../../../shared/auth/useAuth.js';
import { ROLES } from '../../../shared/auth/roles.js';
import { listarEstudiantesConsulta } from '../../../features/evaluaciones/services/consultaNotasService.js';
import {
  listarAniosAcademicosLibretas,
  listarLibretasDelEstudiante,
  obtenerDetalleLibreta,
  obtenerPdfLibreta
} from '../services/libretasService.js';
import estilos from './PaginaLibretasEstudiante.module.css';

function elegirAnioInicial(anios) {
  const ordenados = [...anios].sort((a, b) => Number(b.anio) - Number(a.anio));
  return ordenados.find((anio) => Number(anio.anio) === new Date().getFullYear())
    ?? ordenados[0]
    ?? null;
}

function nombreEstudiante(estudiante) {
  return estudiante?.nombreCompleto
    ?? [estudiante?.nombre, estudiante?.apellidoPaterno, estudiante?.apellidoMaterno].filter(Boolean).join(' ')
    ?? estudiante?.codigo
    ?? String(estudiante?.id ?? '');
}

function formatearFecha(fecha) {
  return fecha ? fecha.split('-').reverse().join('/') : 'Fecha no disponible';
}

function agruparNotasPorCurso(notas = []) {
  const cursos = new Map();
  notas.forEach((nota) => {
    const competencias = cursos.get(nota.nombreCurso) ?? [];
    competencias.push(nota);
    cursos.set(nota.nombreCurso, competencias);
  });
  return [...cursos.entries()];
}

export default function PaginaLibretasEstudiante() {
  const { usuario } = useAuth();
  const esEstudiante = usuario?.rol === ROLES.ESTUDIANTE;
  const [anios, setAnios] = useState([]);
  const [anioId, setAnioId] = useState('');
  const [estadoAnios, setEstadoAnios] = useState('cargando');
  const [errorAnios, setErrorAnios] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteId, setEstudianteId] = useState(esEstudiante ? String(usuario?.id ?? '') : '');
  const [estadoEstudiantes, setEstadoEstudiantes] = useState('cargando');
  const [errorEstudiantes, setErrorEstudiantes] = useState('');
  const [libretas, setLibretas] = useState([]);
  const [estadoLibretas, setEstadoLibretas] = useState('inactivo');
  const [errorLibretas, setErrorLibretas] = useState('');
  const [libretaId, setLibretaId] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [estadoDetalle, setEstadoDetalle] = useState('inactivo');
  const [errorDetalle, setErrorDetalle] = useState('');
  const [errorPdf, setErrorPdf] = useState('');
  const [pdfCargando, setPdfCargando] = useState(false);

  useEffect(() => {
    let activa = true;
    setEstadoAnios('cargando');
    setErrorAnios('');
    listarAniosAcademicosLibretas().then((respuesta) => {
      if (!activa) return;
      const datos = Array.isArray(respuesta.datos) ? respuesta.datos : respuesta.datos?.anios;
      if (!respuesta.exitoso || !Array.isArray(datos)) {
        setErrorAnios(respuesta.mensaje || 'No se pudieron cargar los años académicos.');
        setEstadoAnios('error');
        return;
      }
      if (!datos.length) {
        setErrorAnios('No hay años académicos configurados.');
        setEstadoAnios('error');
        return;
      }
      const inicial = elegirAnioInicial(datos);
      setAnios(datos);
      setAnioId(String(inicial?.id ?? ''));
      setEstadoAnios('listo');
    });
    return () => { activa = false; };
  }, []);

  useEffect(() => {
    let activa = true;
    setEstadoEstudiantes('cargando');
    setErrorEstudiantes('');
    listarEstudiantesConsulta(usuario).then((respuesta) => {
      if (!activa) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setEstudiantes([]);
        setErrorEstudiantes(respuesta.mensaje || 'No se pudo cargar la lista de estudiantes.');
        setEstadoEstudiantes('error');
        return;
      }
      const lista = respuesta.datos;
      setEstudiantes(lista);
      const idInicial = esEstudiante
        ? String(usuario?.id ?? '')
        : String(lista[0]?.id ?? '');
      setEstudianteId(idInicial);
      setEstadoEstudiantes('listo');
    });
    return () => { activa = false; };
  }, [usuario?.id, usuario?.rol]);

  useEffect(() => {
    setLibretaId('');
    setDetalle(null);
    setEstadoDetalle('inactivo');
    setErrorDetalle('');
    setErrorPdf('');
    if (!anioId || !estudianteId || estadoEstudiantes !== 'listo') {
      setLibretas([]);
      setEstadoLibretas('inactivo');
      return undefined;
    }

    let activa = true;
    setLibretas([]);
    setEstadoLibretas('cargando');
    setErrorLibretas('');
    listarLibretasDelEstudiante(usuario, estudianteId, anioId).then((respuesta) => {
      if (!activa) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setErrorLibretas(respuesta.mensaje || 'No se pudieron cargar las libretas de notas.');
        setEstadoLibretas('error');
        return;
      }
      const ordenadas = [...respuesta.datos].sort((a, b) => (
        Number(String(b.nombreBimestre).replace(/\D/g, ''))
        - Number(String(a.nombreBimestre).replace(/\D/g, ''))
      ));
      setLibretas(ordenadas);
      setEstadoLibretas('listo');
    });
    return () => { activa = false; };
  }, [anioId, estudianteId, estadoEstudiantes, usuario?.id, usuario?.rol]);

  useEffect(() => {
    if (!libretaId || !estudianteId) {
      setDetalle(null);
      setEstadoDetalle('inactivo');
      setErrorDetalle('');
      return undefined;
    }
    let activa = true;
    setDetalle(null);
    setEstadoDetalle('cargando');
    setErrorDetalle('');
    obtenerDetalleLibreta(usuario, estudianteId, libretaId).then((respuesta) => {
      if (!activa) return;
      if (!respuesta.exitoso || !respuesta.datos) {
        setErrorDetalle(respuesta.mensaje || 'No se pudo cargar el detalle de la libreta.');
        setEstadoDetalle('error');
        return;
      }
      setDetalle(respuesta.datos);
      setEstadoDetalle('listo');
    });
    return () => { activa = false; };
  }, [libretaId, estudianteId, usuario?.id, usuario?.rol]);

  async function visualizarPdf() {
    const ventana = window.open('', '_blank');
    if (!ventana) {
      setErrorPdf('Permite las ventanas emergentes para visualizar la libreta en PDF.');
      return;
    }
    ventana.opener = null;
    setErrorPdf('');
    setPdfCargando(true);
    const respuesta = await obtenerPdfLibreta(usuario, estudianteId, detalle.idLibreta);
    setPdfCargando(false);
    if (!respuesta.exitoso || !(respuesta.datos instanceof Blob)) {
      ventana.close();
      setErrorPdf(respuesta.mensaje || 'No se pudo abrir el PDF de la libreta.');
      return;
    }
    const url = URL.createObjectURL(respuesta.datos);
    ventana.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  const estudianteSeleccionado = estudiantes.find((item) => String(item.id) === estudianteId);
  const libretaSeleccionada = libretas.find((item) => String(item.idLibreta) === libretaId);

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.sobretitulo}>Seguimiento académico</p>
        <h1 className={estilos.titulo}>Libreta de notas</h1>
        <p className={estilos.descripcion}>
          {esEstudiante
            ? 'Consulta tus libretas generadas por año académico.'
            : 'Selecciona un estudiante bajo tu cargo y un año académico para consultar sus libretas.'}
        </p>
      </header>

      <section className={estilos.filtros} aria-label="Filtros de libretas">
        <SelectFiltro
          apilado
          id="filtro-anio-libretas"
          etiqueta="Año académico"
          valor={anioId}
          opciones={anios.length
            ? anios.map((anio) => ({ valor: String(anio.id), etiqueta: String(anio.anio ?? anio.nombre ?? anio.id) }))
            : [{ valor: '', etiqueta: 'Sin años académicos' }]}
          alCambiar={setAnioId}
          deshabilitado={estadoAnios !== 'listo'}
        />
        {!esEstudiante && (
          <SelectFiltro
            apilado
            id="filtro-estudiante-libretas"
            etiqueta="Estudiante"
            valor={estudianteId}
            opciones={estudiantes.length
              ? estudiantes.map((estudiante) => ({
                valor: String(estudiante.id),
                etiqueta: nombreEstudiante(estudiante)
              }))
              : [{ valor: '', etiqueta: 'Sin estudiantes vinculados' }]}
            alCambiar={setEstudianteId}
            deshabilitado={estadoEstudiantes !== 'listo' || estudiantes.length === 0}
          />
        )}
      </section>

      {estadoAnios === 'cargando' && <div className={estilos.estado}><EstadoConsulta tipo="carga" /></div>}
      {estadoAnios === 'error' && <p className={estilos.error} role="alert">{errorAnios}</p>}
      {!esEstudiante && estadoEstudiantes === 'cargando'
        && <div className={estilos.estado}><EstadoConsulta tipo="carga" /></div>}
      {estadoEstudiantes === 'error' && !esEstudiante
        && <p className={estilos.error} role="alert">{errorEstudiantes}</p>}
      {estadoEstudiantes === 'listo' && !esEstudiante && !estudiantes.length
        && <p className={estilos.vacio}>No hay estudiantes asociados a tu cuenta de apoderado.</p>}

      {estadoAnios === 'listo' && estadoEstudiantes === 'listo' && estudianteId && anioId && (
        <section className={estilos.resultados} aria-label="Libretas disponibles" aria-busy={estadoLibretas === 'cargando'}>
          {estadoLibretas === 'cargando' && <div className={estilos.estado}><EstadoConsulta tipo="carga" /></div>}
          {estadoLibretas === 'error' && <p className={estilos.error} role="alert">{errorLibretas}</p>}
          {estadoLibretas === 'listo' && !libretas.length
            && <p className={estilos.vacio}>No hay libretas generadas para este estudiante y año académico.</p>}
          {estadoLibretas === 'listo' && libretas.length > 0 && (
            <section className={estilos.lista} aria-label="Libretas de notas">
              {libretas.map((libreta) => {
                const id = String(libreta.idLibreta);
                const seleccionada = id === libretaId;
                return (
                  <article className={estilos.libreta} key={id}>
                    <div className={estilos.resumenLibreta}>
                      <div>
                        <h2>{libreta.nombreBimestre} · {libreta.anioAcademico}</h2>
                        <p>Generada el {formatearFecha(libreta.fechaGeneracion)}</p>
                        {libreta.comentariosFinalesTutor
                          && <p>{libreta.comentariosFinalesTutor}</p>}
                      </div>
                      <button
                        type="button"
                        className={estilos.botonDetalle}
                        aria-expanded={seleccionada}
                        onClick={() => setLibretaId(seleccionada ? '' : id)}
                      >
                        {seleccionada ? 'Cerrar detalle' : 'Ver detalle'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </section>
      )}

      {libretaSeleccionada && estadoDetalle === 'cargando'
        && <div className={estilos.estado}><EstadoConsulta tipo="carga" /></div>}
      {estadoDetalle === 'error' && <p className={estilos.error} role="alert">{errorDetalle}</p>}
      {detalle && estadoDetalle === 'listo' && (
        <section className={estilos.detalle} aria-label={`Detalle de ${detalle.nombreBimestre}`}>
          <header className={estilos.encabezadoDetalle}>
            <div>
              <h2>Detalle: {detalle.nombreBimestre} · {detalle.anioAcademico}</h2>
              <p>{nombreEstudiante(estudianteSeleccionado)} · Generada el {formatearFecha(detalle.fechaGeneracion)}</p>
            </div>
            <button type="button" className={estilos.botonDetalle} onClick={visualizarPdf} disabled={pdfCargando}>
              {pdfCargando ? 'Abriendo PDF…' : 'Visualizar PDF'}
            </button>
          </header>
          {errorPdf && <p className={estilos.error} role="alert">{errorPdf}</p>}
          <div className={estilos.cursos}>
            {agruparNotasPorCurso(detalle.notasCompetencias).map(([nombreCurso, competencias]) => (
              <section className={estilos.curso} key={nombreCurso}>
                <h3>{nombreCurso}</h3>
                <ul>
                  {competencias.map((competencia) => (
                    <li key={competencia.nombreCompetencia}>
                      <div>
                        <strong>{competencia.nombreCompetencia}</strong>
                        <p>{competencia.descripcion}</p>
                        <p>{competencia.conclusionDescriptiva}</p>
                      </div>
                      <span className={estilos.nota}>{competencia.valorNota}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {!detalle.notasCompetencias?.length
              && <p className={estilos.vacio}>La libreta no tiene notas de competencias.</p>}
          </div>
          <section className={estilos.comentarios} aria-label="Comentarios finales del tutor">
            <h3>Comentarios finales del tutor</h3>
            <p>{detalle.comentariosFinalesTutor || 'Sin comentarios finales del tutor.'}</p>
          </section>
        </section>
      )}
    </main>
  );
}
