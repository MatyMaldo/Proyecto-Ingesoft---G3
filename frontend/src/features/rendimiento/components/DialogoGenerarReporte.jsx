import { useEffect, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import SelectorFecha from '../../horarios/components/SelectorFecha.jsx';
import { fechaISO } from '../../horarios/utils/tiempo.js';
import {
  generarReporteInasistencia,
  obtenerAsignacionesDocente,
  obtenerEstudiantesAsignacion
} from '../services/rendimientoService.js';
import estilos from './DialogoGenerarReporte.module.css';

const MAX_COMENTARIOS = 2000;
const ID_ASIGNACION = 'reporte-asignacion';
const ID_ESTUDIANTE = 'reporte-estudiante';
const ID_COMENTARIOS = 'reporte-comentarios';

const etiquetaAsignacion = (asignacion) => [
  asignacion.curso,
  [asignacion.grado, asignacion.seccion ? `Sección ${asignacion.seccion}` : ''].filter(Boolean).join(' '),
  asignacion.anio
].filter(Boolean).join(' · ');

/** Rango inicial: del inicio del año académico hasta hoy (sin salir del año). */
function rangoInicial(anio) {
  const hoy = fechaISO(new Date());
  const inicio = anio?.fechaInicio ?? hoy;
  const fin = anio?.fechaFin ?? hoy;
  const hasta = hoy < inicio ? inicio : hoy > fin ? fin : hoy;
  return { desde: inicio, hasta };
}

/**
 * Formulario del docente para emitir un reporte de inasistencia de un estudiante de una de sus asignaciones.
 * Las validaciones de negocio (que haya faltas o tardanzas en el rango y que no se repita el reporte) las hace el
 * backend: si las rechaza, el mensaje se muestra como notificación dentro del diálogo y el formulario se conserva.
 *
 * @param {Object} props
 * @param {() => void} props.onCerrar
 * @param {(mensaje: string) => void} props.alGenerar Se llama tras crear el reporte (la página muestra el éxito).
 */
export default function DialogoGenerarReporte({ onCerrar, alGenerar }) {
  const { notificacion, mostrarNotificacion } = useNotificacion();

  const [contexto, establecerContexto] = useState(null);
  const [estadoContexto, establecerEstadoContexto] = useState('cargando');
  const [errorContexto, establecerErrorContexto] = useState('');
  const [intentoContexto, establecerIntentoContexto] = useState(0);

  const [asignacionId, establecerAsignacionId] = useState('');
  const [estudiantes, establecerEstudiantes] = useState([]);
  const [cargandoEstudiantes, establecerCargandoEstudiantes] = useState(false);
  const [errorEstudiantes, establecerErrorEstudiantes] = useState('');
  const [estudianteId, establecerEstudianteId] = useState('');

  const [desde, establecerDesde] = useState('');
  const [hasta, establecerHasta] = useState('');
  const [comentarios, establecerComentarios] = useState('');
  const [comentariosTocados, establecerComentariosTocados] = useState(false);
  const [enviando, establecerEnviando] = useState(false);

  // Asignaciones del docente y año académico (define el rango de fechas permitido).
  useEffect(() => {
    let activo = true;
    establecerEstadoContexto('cargando');
    establecerErrorContexto('');

    obtenerAsignacionesDocente().then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso) {
        establecerErrorContexto(respuesta.mensaje || 'No se pudieron cargar tus asignaciones.');
        establecerEstadoContexto('error');
        return;
      }
      establecerContexto(respuesta.datos);
      const rango = rangoInicial(respuesta.datos.anioAcademico);
      establecerDesde(rango.desde);
      establecerHasta(rango.hasta);
      if (respuesta.datos.asignaciones.length === 1) {
        establecerAsignacionId(String(respuesta.datos.asignaciones[0].id));
      }
      establecerEstadoContexto('listo');
    });

    return () => { activo = false; };
  }, [intentoContexto]);

  // Estudiantes de la asignación elegida.
  useEffect(() => {
    establecerEstudiantes([]);
    establecerEstudianteId('');
    establecerErrorEstudiantes('');
    if (!asignacionId) return undefined;

    let activo = true;
    establecerCargandoEstudiantes(true);
    obtenerEstudiantesAsignacion(asignacionId).then((respuesta) => {
      if (!activo) return;
      establecerCargandoEstudiantes(false);
      if (!respuesta.exitoso) {
        establecerErrorEstudiantes(respuesta.mensaje || 'No se pudieron cargar los estudiantes.');
        return;
      }
      establecerEstudiantes(respuesta.datos);
    });

    return () => { activo = false; };
  }, [asignacionId]);

  const anio = contexto?.anioAcademico;
  const comentariosLimpios = comentarios.trim();
  const errorComentarios = comentariosTocados && !comentariosLimpios ? 'Los comentarios son obligatorios.' : '';
  const rangoValido = Boolean(desde && hasta && desde <= hasta);
  const formularioCompleto = Boolean(
    asignacionId && estudianteId && rangoValido && comentariosLimpios && comentarios.length <= MAX_COMENTARIOS
  );

  const emitir = async (evento) => {
    evento.preventDefault();
    establecerComentariosTocados(true);
    if (!formularioCompleto || enviando) {
      if (!formularioCompleto) mostrarNotificacion('Completa todos los campos para emitir el reporte.', true);
      return;
    }

    establecerEnviando(true);
    const respuesta = await generarReporteInasistencia({
      asignacionId: Number(asignacionId),
      estudianteId: Number(estudianteId),
      desde,
      hasta,
      comentarios
    });
    establecerEnviando(false);

    if (!respuesta.exitoso) {
      mostrarNotificacion(respuesta.mensaje, true);
      return;
    }

    const estudiante = estudiantes.find((item) => String(item.id) === estudianteId);
    alGenerar(`Reporte de inasistencia emitido${estudiante ? ` para ${estudiante.nombre}` : ''}.`);
  };

  return (
    <DialogoBase
      idTitulo="dialogo-generar-reporte"
      titulo="Generar Reporte de Asistencia"
      subtitulo="Control disciplinario"
      textoConfirmar="Emitir Reporte"
      textoEnviando="Emitiendo…"
      enviando={enviando}
      confirmarDeshabilitado={estadoContexto !== 'listo' || !formularioCompleto}
      anchoMaximo="40rem"
      cerrarAlClicFuera={false}
      alCancelar={onCerrar}
      alConfirmar={emitir}
    >
      {estadoContexto === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}
      {estadoContexto === 'error' && (
        <EstadoConsulta
          tipo="error"
          mensaje={errorContexto}
          alReintentar={() => establecerIntentoContexto((valor) => valor + 1)}
        />
      )}
      {estadoContexto === 'listo' && contexto.asignaciones.length === 0 && (
        <EstadoConsulta tipo="vacio" icono="libro" mensaje="No tienes asignaciones de curso en el año académico vigente." />
      )}

      {estadoContexto === 'listo' && contexto.asignaciones.length > 0 && (
        <div className={estilos.formulario}>
          <div className={estilos.campo}>
            <label htmlFor={ID_ASIGNACION} className={estilos.etiqueta}>
              Asignación de curso<span className={estilos.asterisco} aria-hidden="true"> *</span>
            </label>
            <select
              id={ID_ASIGNACION}
              className={estilos.control}
              value={asignacionId}
              disabled={enviando}
              required
              onChange={(evento) => establecerAsignacionId(evento.target.value)}
            >
              <option value="">Selecciona un curso</option>
              {contexto.asignaciones.map((asignacion) => (
                <option key={asignacion.id} value={String(asignacion.id)}>{etiquetaAsignacion(asignacion)}</option>
              ))}
            </select>
          </div>

          <div className={estilos.campo}>
            <label htmlFor={ID_ESTUDIANTE} className={estilos.etiqueta}>
              Seleccionar Estudiante<span className={estilos.asterisco} aria-hidden="true"> *</span>
            </label>
            <select
              id={ID_ESTUDIANTE}
              className={estilos.control}
              value={estudianteId}
              disabled={enviando || !asignacionId || cargandoEstudiantes || estudiantes.length === 0}
              required
              aria-describedby={errorEstudiantes ? `${ID_ESTUDIANTE}-error` : undefined}
              onChange={(evento) => establecerEstudianteId(evento.target.value)}
            >
              <option value="">
                {!asignacionId && 'Primero selecciona un curso'}
                {asignacionId && cargandoEstudiantes && 'Cargando estudiantes…'}
                {asignacionId && !cargandoEstudiantes && estudiantes.length === 0 && 'La asignación no tiene estudiantes'}
                {asignacionId && !cargandoEstudiantes && estudiantes.length > 0 && 'Selecciona un estudiante'}
              </option>
              {estudiantes.map((estudiante) => (
                <option key={estudiante.id} value={String(estudiante.id)}>
                  {estudiante.codigo ? `${estudiante.nombre} (${estudiante.codigo})` : estudiante.nombre}
                </option>
              ))}
            </select>
            {errorEstudiantes && (
              <p id={`${ID_ESTUDIANTE}-error`} className={estilos.mensajeError}>
                <Icono nombre="alerta" tamano={14} />
                {errorEstudiantes}
              </p>
            )}
          </div>

          <fieldset className={estilos.grupoFechas}>
            <legend className={estilos.etiqueta}>
              Rango de fechas<span className={estilos.asterisco} aria-hidden="true"> *</span>
            </legend>
            <div className={estilos.filaFechas}>
              <div className={estilos.campo}>
                <span className={estilos.etiquetaFecha}>Desde</span>
                <SelectorFecha
                  id="reporte-desde"
                  etiqueta="Desde"
                  valor={desde}
                  min={anio?.fechaInicio ?? undefined}
                  max={hasta || anio?.fechaFin || undefined}
                  alCambiar={establecerDesde}
                  enDialogo
                />
              </div>
              <div className={estilos.campo}>
                <span className={estilos.etiquetaFecha}>Hasta</span>
                <SelectorFecha
                  id="reporte-hasta"
                  etiqueta="Hasta"
                  valor={hasta}
                  min={desde || anio?.fechaInicio || undefined}
                  max={anio?.fechaFin ?? undefined}
                  alCambiar={establecerHasta}
                  enDialogo
                />
              </div>
            </div>
            {anio && (
              <p className={estilos.ayuda}>
                Año académico {anio.anio}: las fechas deben estar dentro del año de la asignación.
              </p>
            )}
          </fieldset>

          <div className={estilos.aviso} role="note">
            <Icono nombre="alerta" tamano={20} className={estilos.iconoAviso} />
            <div>
              <p className={estilos.tituloAviso}>Incidencias de Asistencia</p>
              <p className={estilos.textoAviso}>
                Se incluirán las faltas y tardanzas registradas en el periodo. Este reporte será notificado
                directamente al portal del apoderado.
              </p>
            </div>
          </div>

          <div className={estilos.campo}>
            <label htmlFor={ID_COMENTARIOS} className={estilos.etiqueta}>
              Observaciones y Justificación del Docente
              <span className={estilos.asterisco} aria-hidden="true"> *</span>
            </label>
            <textarea
              id={ID_COMENTARIOS}
              className={`${estilos.control} ${estilos.areaTexto}`}
              value={comentarios}
              maxLength={MAX_COMENTARIOS}
              placeholder="Ingrese las recomendaciones o motivos para el apoderado..."
              disabled={enviando}
              required
              aria-invalid={errorComentarios ? 'true' : undefined}
              aria-describedby={`${ID_COMENTARIOS}-contador${errorComentarios ? ` ${ID_COMENTARIOS}-error` : ''}`}
              onChange={(evento) => establecerComentarios(evento.target.value)}
              onBlur={() => establecerComentariosTocados(true)}
            />
            <div className={estilos.pieCampo}>
              {errorComentarios ? (
                <p id={`${ID_COMENTARIOS}-error`} className={estilos.mensajeError}>
                  <Icono nombre="alerta" tamano={14} />
                  {errorComentarios}
                </p>
              ) : <span />}
              <span id={`${ID_COMENTARIOS}-contador`} className={estilos.contador}>
                {comentarios.length}/{MAX_COMENTARIOS}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Un <dialog> modal queda por encima de la página: los errores se notifican dentro del propio diálogo. */}
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}
    </DialogoBase>
  );
}
