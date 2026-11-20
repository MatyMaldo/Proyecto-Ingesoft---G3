import { useCallback, useEffect, useState } from 'react';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import useAuth from '../../../shared/auth/useAuth.js';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import {
  generarLibretaTutor,
  listarOpcionesLibretaTutor,
  listarLibretasDelEstudiante,
  obtenerDetalleLibreta,
  obtenerPdfLibreta,
  obtenerVistaPreviaLibretaTutor,
  esBimestreFinalizado
} from '../services/libretasService.js';
import DetalleLibreta from '../components/DetalleLibreta.jsx';
import { etiquetaBimestre } from '../utils/formatoLibreta.js';
import estilos from './PaginaLibretasTutor.module.css';

const etiquetaEstudiante = (estudiante) => estudiante?.nombre ?? estudiante?.nombreCompleto ?? estudiante?.id ?? 'Estudiante';
const NUMERO_BIMESTRE = {
  PRIMER_BIMESTRE: 1,
  SEGUNDO_BIMESTRE: 2,
  TERCER_BIMESTRE: 3,
  CUARTO_BIMESTRE: 4
};
const numeroBimestre = (nombre) => Number(String(nombre ?? '').match(/\d+/)?.[0])
  || NUMERO_BIMESTRE[String(nombre ?? '').toUpperCase()]
  || 0;
const esSinTutoria = (respuesta) => {
  const mensaje = String(respuesta.mensaje ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return respuesta.estado === 403
    || (mensaje.includes('tutor')
      && (mensaje.includes('seccion') || mensaje.includes('asignad')));
};

const estudiantesUnicos = (estudiantes) => [...new Map(
  (Array.isArray(estudiantes) ? estudiantes : [])
    .filter((estudiante) => estudiante?.idEstudiante != null)
    .map((estudiante) => [String(estudiante.idEstudiante), estudiante])
).values()];

export default function PaginaLibretasTutor() {
  const { usuario } = useAuth();
  const { notificacion, mostrarNotificacion } = useNotificacion();
  const [contexto, setContexto] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [errorCarga, setErrorCarga] = useState('');
  const [mostrarReintentar, setMostrarReintentar] = useState(true);
  const [intento, setIntento] = useState(0);
  const [estudianteId, setEstudianteId] = useState('');
  const [bimestreId, setBimestreId] = useState('');
  const [dialogo, setDialogo] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [detalleEstudianteId, setDetalleEstudianteId] = useState('');
  const [errorDetalle, setErrorDetalle] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [cargandoVistaPrevia, setCargandoVistaPrevia] = useState(false);
  const [errorVistaPrevia, setErrorVistaPrevia] = useState('');
  const [cargandoPdf, setCargandoPdf] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    setErrorCarga('');
    setMostrarReintentar(true);
    const respuesta = await listarOpcionesLibretaTutor(usuario);
    if (!respuesta.exitoso || !respuesta.datos) {
      setErrorCarga(respuesta.mensaje || 'No se pudo cargar la información de tutoría.');
      setMostrarReintentar(!esSinTutoria(respuesta));
      setEstado('error');
      return;
    }
    setContexto(respuesta.datos);
    const estudiantes = estudiantesUnicos(respuesta.datos.estudiantes);
    setEstudianteId((actual) => actual || String(estudiantes[0]?.idEstudiante ?? ''));
    setBimestreId((actual) => actual
      || String(respuesta.datos.bimestres?.find(esBimestreFinalizado)?.id ?? ''));
    setEstado('listo');
  }, [usuario, intento]);

  useEffect(() => { cargar(); }, [cargar]);

  const estudiantes = estudiantesUnicos(contexto?.estudiantes);
  const estudianteSeleccionado = estudiantes.find(
    (item) => String(item.idEstudiante) === estudianteId
  );
  const bimestreSeleccionado = contexto?.bimestres?.find(
    (item) => String(item.id) === bimestreId
  );
  const estadoLibretaSeleccionada = estudianteSeleccionado?.estadoLibretas?.find(
    (item) => String(item.idBimestre) === bimestreId
  );
  const bimestresFinalizados = contexto?.bimestres?.filter(esBimestreFinalizado) ?? [];
  const sinBimestres = estado === 'listo' && !bimestresFinalizados.length;

  useEffect(() => {
    if (!dialogo || !estudianteId || !bimestreId) {
      setVistaPrevia(null);
      setCargandoVistaPrevia(false);
      setErrorVistaPrevia('');
      return undefined;
    }
    let activa = true;
    setVistaPrevia(null);
    setCargandoVistaPrevia(true);
    setErrorVistaPrevia('');
    obtenerVistaPreviaLibretaTutor(usuario, estudianteId, bimestreId).then((respuesta) => {
      if (!activa) return;
      setCargandoVistaPrevia(false);
      if (!respuesta.exitoso || !respuesta.datos) {
        setErrorVistaPrevia(respuesta.mensaje || 'No se pudo cargar la vista previa.');
        return;
      }
      setVistaPrevia(respuesta.datos);
    });
    return () => { activa = false; };
  }, [dialogo, estudianteId, bimestreId, usuario?.id, usuario?.rol]);

  async function generar(evento) {
    evento?.preventDefault();
    setGuardando(true);
    try {
      const respuesta = await generarLibretaTutor({
        usuario,
        estudianteId,
        bimestreId,
        comentariosFinalesTutor: comentarios
      });
      if (!respuesta.exitoso || !respuesta.datos) {
        mostrarNotificacion(respuesta.mensaje || 'No se pudo generar la libreta.', true);
        return;
      }
      setDialogo(false);
      setComentarios('');
      setDetalleEstudianteId(String(estudianteId));
      const detalleRespuesta = await obtenerDetalleLibreta(
        usuario,
        estudianteId,
        respuesta.datos.idLibreta
      );
      if (!detalleRespuesta.exitoso || !detalleRespuesta.datos) {
        const mensaje = detalleRespuesta.mensaje || 'La libreta se generó, pero no se pudo cargar su detalle.';
        setErrorDetalle(mensaje);
        setDetalle(null);
        mostrarNotificacion(`La libreta se generó, pero no se pudo cargar su detalle: ${mensaje}`, true);
        await cargar();
        return;
      }
      setErrorDetalle('');
      setDetalle(detalleRespuesta.datos);
      mostrarNotificacion('La libreta parcial se generó correctamente.');
      await cargar();
    } catch (errorGeneracion) {
      mostrarNotificacion(errorGeneracion?.message || 'No se pudo generar la libreta.', true);
    } finally {
      setGuardando(false);
    }
  }

  async function obtenerResumenGenerado(estudiante, bimestre) {
    const respuesta = await listarLibretasDelEstudiante(
      usuario,
      estudiante.idEstudiante,
      contexto.anioAcademico.id
    );
    if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
      return { exitoso: false, mensaje: respuesta.mensaje || 'No se pudo localizar la libreta generada.' };
    }
    const numero = numeroBimestre(bimestre.nombre);
    const libreta = respuesta.datos.find((item) => numeroBimestre(item.nombreBimestre) === numero);
    return libreta
      ? { exitoso: true, datos: libreta }
      : { exitoso: false, mensaje: 'El contexto indica que la libreta fue generada, pero no aparece en el listado.' };
  }

  async function verLibretaGenerada(estudiante, bimestre) {
    setErrorDetalle('');
    setDetalle(null);
    const resumen = await obtenerResumenGenerado(estudiante, bimestre);
    if (!resumen.exitoso) {
      setErrorDetalle(resumen.mensaje);
      return;
    }
    setDetalleEstudianteId(String(estudiante.idEstudiante));
    const respuesta = await obtenerDetalleLibreta(
      usuario,
      estudiante.idEstudiante,
      resumen.datos.idLibreta
    );
    if (!respuesta.exitoso || !respuesta.datos) {
      setErrorDetalle(respuesta.mensaje || 'No se pudo cargar el detalle de la libreta.');
      return;
    }
    setDetalle(respuesta.datos);
  }

  async function visualizarPdf(libreta = detalle, estudianteIdPdf = detalleEstudianteId, bimestre) {
    if (!estudianteIdPdf) return;
    const ventana = window.open('', '_blank');
    if (!ventana) {
      setErrorDetalle('Permite las ventanas emergentes para visualizar el PDF.');
      return;
    }
    ventana.opener = null;
    setCargandoPdf(true);
    setErrorDetalle('');
    let resumen = libreta;
    if (!resumen?.idLibreta && estudianteSeleccionado && bimestre) {
      const resultado = await obtenerResumenGenerado(estudianteSeleccionado, bimestre);
      if (!resultado.exitoso) {
        ventana.close();
        setCargandoPdf(false);
        setErrorDetalle(resultado.mensaje);
        return;
      }
      resumen = resultado.datos;
    }
    if (!resumen?.idLibreta) {
      ventana.close();
      setCargandoPdf(false);
      setErrorDetalle('No se pudo identificar la libreta que se va a visualizar.');
      return;
    }
    const respuesta = await obtenerPdfLibreta(usuario, estudianteIdPdf, resumen.idLibreta);
    setCargandoPdf(false);
    if (!respuesta.exitoso || !(respuesta.datos instanceof Blob)) {
      ventana.close();
      setErrorDetalle(respuesta.mensaje || 'No se pudo generar el PDF de la libreta.');
      return;
    }
    const url = URL.createObjectURL(respuesta.datos);
    ventana.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <h1>Libretas de notas</h1>
          <p>Consolida el desempeño bimestral de los estudiantes de tu sección como tutor.</p>
        </div>
        {estudianteSeleccionado?.nombreSeccion && (
          <span className={estilos.seccion}>{estudianteSeleccionado.nombreSeccion}</span>
        )}
      </header>

      {estado === 'cargando' && <EstadoConsulta tipo="carga" mensaje="Cargando sección, estudiantes y bimestres…" filasEsqueleto={3} />}
      {estado === 'error' && (
        <EstadoConsulta
          tipo="error"
          mensaje={errorCarga}
          alReintentar={mostrarReintentar ? () => setIntento((n) => n + 1) : undefined}
        />
      )}
      {estado === 'listo' && (
        <>
          <section className={estilos.filtros} aria-label="Elegir estudiante y bimestre">
            <label>
              Estudiante
              <select value={estudianteId} onChange={(evento) => setEstudianteId(evento.target.value)}>
                {estudiantes.map((estudiante) => (
                  <option key={estudiante.idEstudiante} value={estudiante.idEstudiante}>
                    {etiquetaEstudiante(estudiante)}{estudiante.codigo ? ` · ${estudiante.codigo}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Bimestre finalizado
              <select value={bimestreId} onChange={(evento) => setBimestreId(evento.target.value)} disabled={sinBimestres}>
                {bimestresFinalizados.map((bimestre) => (
                  <option key={bimestre.id} value={bimestre.id}>{etiquetaBimestre(bimestre.nombre)}</option>
                ))}
              </select>
            </label>
          </section>

          {!estudiantes.length ? (
            <EstadoConsulta tipo="vacio" mensaje="No tienes estudiantes asignados como tutor en el año académico vigente." />
          ) : sinBimestres ? (
            <EstadoConsulta tipo="vacio" mensaje="La libreta solo puede generarse al finalizar un bimestre." />
          ) : (
            <section className={estilos.tarjeta} aria-live="polite">
              <div>
                <h2>{bimestreSeleccionado ? etiquetaBimestre(bimestreSeleccionado.nombre) : 'Bimestre'}</h2>
                <p>{etiquetaEstudiante(estudianteSeleccionado)}</p>
              </div>
              {estadoLibretaSeleccionada?.libretaGenerada ? (
                <div className={estilos.estadoGenerada}>
                  <span>Libreta parcial generada</span>
                  <button type="button" onClick={() => verLibretaGenerada(estudianteSeleccionado, bimestreSeleccionado)}>Ver libreta</button>
                  <button
                    type="button"
                    onClick={() => visualizarPdf(null, estudianteSeleccionado.idEstudiante, bimestreSeleccionado)}
                  >
                    Visualizar PDF
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={estilos.botonPrincipal}
                  disabled={!estudianteSeleccionado || !bimestreSeleccionado}
                  onClick={() => { setComentarios(''); setDialogo(true); }}
                >
                  Generar libreta parcial
                </button>
              )}
            </section>
          )}
        </>
      )}

      {dialogo && estudianteSeleccionado && bimestreSeleccionado && (
        <DialogoBase
          idTitulo="dialogo-generar-libreta-tutor"
          titulo="Generar libreta parcial"
          subtitulo={`${etiquetaEstudiante(estudianteSeleccionado)} · ${etiquetaBimestre(bimestreSeleccionado.nombre)}`}
          textoConfirmar="Generar libreta"
          textoEnviando="Generando…"
          textoCancelar="Cancelar"
          enviando={guardando}
          confirmarDeshabilitado={!comentarios.trim() || comentarios.length > 2000 || !vistaPrevia || cargandoVistaPrevia}
          anchoMaximo="52rem"
          cerrarAlClicFuera={false}
          botonesExpandidos
          alCancelar={() => setDialogo(false)}
          alConfirmar={generar}
        >
          {notificacion && (
            <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />
          )}
          {cargandoVistaPrevia && <EstadoConsulta tipo="carga" mensaje="Cargando vista previa…" filasEsqueleto={3} />}
          {errorVistaPrevia && <p className={estilos.incompleta} role="alert">{errorVistaPrevia}</p>}
          {vistaPrevia && (
            <div className={estilos.vistaPrevia}>
              <p><strong>Institución:</strong> {vistaPrevia.nombreInstitucion}</p>
              <p><strong>Estudiante:</strong> {vistaPrevia.nombreEstudiante}</p>
              <p><strong>Grado y sección:</strong> {vistaPrevia.nombreSeccion}</p>
              <p><strong>Tutor:</strong> {vistaPrevia.nombreTutor}</p>
              <p><strong>Año académico:</strong> {vistaPrevia.anioAcademico} · <strong>Bimestre:</strong> {vistaPrevia.nombreBimestre}</p>
              <p><strong>Inasistencias:</strong> {vistaPrevia.inasistencias} · <strong>Tardanzas:</strong> {vistaPrevia.tardanzas}</p>
              <h3>Competencias de todos los cursos</h3>
              <ul>{vistaPrevia.notasCompetencias.map((item) => (
              <li key={`${item.nombreCurso}-${item.nombreCompetencia}`}><strong>{item.nombreCurso} · {item.nombreCompetencia}</strong>: {item.valorNota} — {item.conclusionDescriptiva}</li>
            ))}</ul>
            </div>
          )}
          <label className={estilos.campoComentario}>
            Comentarios finales del tutor <span aria-hidden="true">*</span>
            <textarea rows="4" value={comentarios} onChange={(evento) => setComentarios(evento.target.value)} maxLength={2000} required />
            <small>{comentarios.length}/2000</small>
          </label>
        </DialogoBase>
      )}

      {detalle && (
        <DialogoBase
          idTitulo="dialogo-detalle-libreta-tutor"
          titulo={`Libreta parcial · ${etiquetaBimestre(detalle.nombreBimestre)} ${detalle.anioAcademico}`}
          subtitulo={detalle.nombreEstudiante ?? detalle.codigoEstudiante ?? detalle.idEstudiante}
          textoConfirmar={cargandoPdf ? 'Abriendo PDF…' : 'Visualizar PDF'}
          textoCancelar="Cerrar"
          anchoMaximo="60rem"
          enviando={cargandoPdf}
          botonesExpandidos
          alCancelar={() => setDetalle(null)}
          alConfirmar={() => visualizarPdf()}
          error={errorDetalle || null}
        >
          {notificacion && (
            <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />
          )}
          <DetalleLibreta detalle={detalle} estudiante={detalle.nombreEstudiante} />
        </DialogoBase>
      )}
      {!dialogo && !detalle && notificacion && (
        <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />
      )}
      {!detalle && errorDetalle && <p className={estilos.incompleta} role="alert">{errorDetalle}</p>}
    </main>
  );
}
