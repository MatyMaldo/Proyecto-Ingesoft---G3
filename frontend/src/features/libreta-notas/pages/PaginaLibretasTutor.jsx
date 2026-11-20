import { useCallback, useEffect, useState } from 'react';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import useAuth from '../../../shared/auth/useAuth.js';
import { generarLibretaPdf } from '../utils/generarLibretaPdf.js';
import { generarLibretaTutor, listarOpcionesLibretaTutor } from '../services/libretasService.js';
import DetalleLibreta from '../components/DetalleLibreta.jsx';
import { etiquetaBimestre } from '../utils/formatoLibreta.js';
import estilos from './PaginaLibretasTutor.module.css';

const etiquetaEstudiante = (estudiante) => estudiante?.nombre ?? estudiante?.nombreCompleto ?? estudiante?.id ?? 'Estudiante';

export default function PaginaLibretasTutor() {
  const { usuario } = useAuth();
  const [contexto, setContexto] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [errorCarga, setErrorCarga] = useState('');
  const [intento, setIntento] = useState(0);
  const [estudianteId, setEstudianteId] = useState('');
  const [bimestreId, setBimestreId] = useState('');
  const [dialogo, setDialogo] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    setErrorCarga('');
    const respuesta = await listarOpcionesLibretaTutor(usuario);
    if (!respuesta.exitoso || !respuesta.datos) {
      setErrorCarga(respuesta.mensaje || 'No se pudo cargar la información de tutoría.');
      setEstado('error');
      return;
    }
    setContexto(respuesta.datos);
    setEstudianteId((actual) => actual || String(respuesta.datos.estudiantes?.[0]?.id ?? ''));
    setBimestreId((actual) => actual || String(respuesta.datos.bimestresFinalizados?.[0]?.id ?? ''));
    setEstado('listo');
  }, [usuario, intento]);

  useEffect(() => { cargar(); }, [cargar]);

  const opciones = contexto?.opciones ?? [];
  const opcionSeleccionada = opciones.find((item) => String(item.estudiante.id) === estudianteId
    && String(item.bimestre.id) === bimestreId);
  const sinBimestres = estado === 'listo' && !(contexto?.bimestresFinalizados?.length);

  async function generar() {
    setError('');
    setGuardando(true);
    const respuesta = await generarLibretaTutor({
      usuario,
      estudianteId,
      bimestreId,
      comentariosFinalesTutor: comentarios
    });
    setGuardando(false);
    if (!respuesta.exitoso || !respuesta.datos) {
      setError(respuesta.mensaje || 'No se pudo generar la libreta.');
      return;
    }
    setDialogo(false);
    setComentarios('');
    setDetalle(respuesta.datos);
    await cargar();
  }

  function descargar(libreta) {
    const pdf = generarLibretaPdf(libreta);
    const url = URL.createObjectURL(pdf);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `libreta-${libreta.codigoEstudiante ?? libreta.idEstudiante}-${libreta.nombreBimestre}.pdf`;
    enlace.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <h1>Libretas de notas</h1>
          <p>Consolida el desempeño bimestral de los estudiantes de tu sección como tutor.</p>
        </div>
        {contexto?.seccion && <span className={estilos.seccion}>{contexto.seccion}</span>}
      </header>

      {estado === 'cargando' && <EstadoConsulta tipo="carga" mensaje="Cargando sección, estudiantes y bimestres…" filasEsqueleto={3} />}
      {estado === 'error' && <EstadoConsulta tipo="error" mensaje={errorCarga} alReintentar={() => setIntento((n) => n + 1)} />}
      {estado === 'listo' && !contexto?.seccion && (
        <EstadoConsulta tipo="vacio" mensaje="No tienes una sección asignada como tutor en el año académico vigente." />
      )}
      {estado === 'listo' && contexto?.seccion && (
        <>
          <section className={estilos.filtros} aria-label="Elegir estudiante y bimestre">
            <label>
              Estudiante
              <select value={estudianteId} onChange={(evento) => setEstudianteId(evento.target.value)}>
                {contexto.estudiantes?.map((estudiante) => <option key={estudiante.id} value={estudiante.id}>{etiquetaEstudiante(estudiante)}{estudiante.codigo ? ` · ${estudiante.codigo}` : ''}</option>)}
              </select>
            </label>
            <label>
              Bimestre finalizado
              <select value={bimestreId} onChange={(evento) => setBimestreId(evento.target.value)} disabled={sinBimestres}>
                {contexto.bimestresFinalizados?.map((bimestre) => <option key={bimestre.id} value={bimestre.id}>{bimestre.nombre}</option>)}
              </select>
            </label>
          </section>

          {sinBimestres ? (
            <EstadoConsulta tipo="vacio" mensaje="La libreta solo puede generarse al finalizar un bimestre." />
          ) : !contexto.estudiantes?.length ? (
            <EstadoConsulta tipo="vacio" mensaje="No hay estudiantes activos con matrícula confirmada en tu sección." />
          ) : (
            <section className={estilos.tarjeta} aria-live="polite">
              <div>
                <h2>{opcionSeleccionada?.bimestre?.nombre ?? 'Bimestre'}</h2>
                <p>{etiquetaEstudiante(opcionSeleccionada?.estudiante)}</p>
              </div>
              {opcionSeleccionada?.estado === 'GENERADA' ? (
                <div className={estilos.estadoGenerada}>
                  <span>Libreta parcial generada</span>
                  <button type="button" onClick={() => setDetalle(opcionSeleccionada.libreta)}>Ver libreta</button>
                  <button type="button" onClick={() => descargar(opcionSeleccionada.libreta)}>Descargar PDF</button>
                </div>
              ) : opcionSeleccionada?.estado === 'INCOMPLETA' ? (
                <div className={estilos.incompleta} role="alert">
                  <strong>Todavía no se han registrado todas las notas de competencias del curso del estudiante en este bimestre.</strong>
                  {opcionSeleccionada.faltantes?.length > 0 && (
                    <details><summary>Ver competencias pendientes ({opcionSeleccionada.faltantes.length})</summary>
                      <ul>{opcionSeleccionada.faltantes.map((item) => <li key={item}>{item}</li>)}</ul>
                    </details>
                  )}
                </div>
              ) : (
                <button type="button" className={estilos.botonPrincipal} onClick={() => { setError(''); setDialogo(true); }}>
                  Generar libreta parcial
                </button>
              )}
            </section>
          )}
        </>
      )}

      {dialogo && opcionSeleccionada?.datosGeneracion && (
        <DialogoBase
          idTitulo="dialogo-generar-libreta-tutor"
          titulo="Generar libreta parcial"
          subtitulo={`${etiquetaEstudiante(opcionSeleccionada.estudiante)} · ${opcionSeleccionada.bimestre.nombre}`}
          textoConfirmar="Generar libreta"
          textoEnviando="Generando…"
          textoCancelar="Cancelar"
          enviando={guardando}
          confirmarDeshabilitado={!comentarios.trim()}
          error={error || null}
          anchoMaximo="52rem"
          cerrarAlClicFuera={false}
          botonesExpandidos
          alCancelar={() => setDialogo(false)}
          alConfirmar={generar}
        >
          <div className={estilos.vistaPrevia}>
            <p><strong>Institución:</strong> {opcionSeleccionada.datosGeneracion.institucion}</p>
            <p><strong>Grado y sección:</strong> {opcionSeleccionada.datosGeneracion.gradoNombre} · {opcionSeleccionada.datosGeneracion.seccionNombre}</p>
            <p><strong>Tutor:</strong> {opcionSeleccionada.datosGeneracion.tutorNombre}</p>
            <p><strong>Inasistencias:</strong> {opcionSeleccionada.datosGeneracion.inasistencias} · <strong>Tardanzas:</strong> {opcionSeleccionada.datosGeneracion.tardanzas}</p>
            <h3>Competencias de todos los cursos</h3>
            <ul>{opcionSeleccionada.datosGeneracion.notasCompetencias.map((item) => (
              <li key={`${item.nombreCurso}-${item.nombreCompetencia}`}><strong>{item.nombreCurso} · {item.nombreCompetencia}</strong>: {item.valorNota} — {item.conclusionDescriptiva}</li>
            ))}</ul>
          </div>
          <label className={estilos.campoComentario}>
            Comentarios finales del tutor <span aria-hidden="true">*</span>
            <textarea rows="4" value={comentarios} onChange={(evento) => setComentarios(evento.target.value)} maxLength={1000} required />
            <small>{comentarios.length}/1000</small>
          </label>
        </DialogoBase>
      )}

      {detalle && (
        <DialogoBase
          idTitulo="dialogo-detalle-libreta-tutor"
          titulo={`Libreta parcial · ${etiquetaBimestre(detalle.nombreBimestre)} ${detalle.anioAcademico}`}
          subtitulo={detalle.nombreEstudiante ?? detalle.codigoEstudiante ?? detalle.idEstudiante}
          textoConfirmar="Descargar PDF"
          textoCancelar="Cerrar"
          anchoMaximo="60rem"
          botonesExpandidos
          alCancelar={() => setDetalle(null)}
          alConfirmar={() => descargar(detalle)}
        >
          <DetalleLibreta detalle={detalle} estudiante={detalle.nombreEstudiante} />
        </DialogoBase>
      )}
    </main>
  );
}
