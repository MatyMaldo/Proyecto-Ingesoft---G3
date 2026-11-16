import { useEffect, useState } from 'react';

import Avatar, { obtenerInicialesDeNombre } from '../../../shared/components/Avatar.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import {
  guardarNotaEvaluacion,
  listarEstudiantesEvaluacion,
  listarNotasEvaluacion
} from '../services/evaluacionesService.js';
import NotaSegmentada from './NotaSegmentada.jsx';
import estilos from './DialogosEvaluacion.module.css';

/** Estudiantes por pantalla: una sección llega a 30, así que se pagina para que la minipantalla no se desplace. */
const ESTUDIANTES_POR_PAGINA = 6;

export const MENSAJE_ANIO_NO_VIGENTE = 'Las notas de las evaluaciones solo se registran con el año académico vigente';

/**
 * Minipantalla «Notas de la evaluación»: los estudiantes de la sección, 6 por página, cada uno con su nota AD / A / B / C
 * a la vista. Las notas elegidas quedan como cambios sin guardar y se guardan todas juntas con «Guardar notas».
 * El servicio guarda una nota por estudiante, así que al guardar se envía una petición por cada nota cambiada.
 *
 * @param {Object} props
 * @param {Object} props.evaluacion
 * @param {Object|null} props.usuario Docente autenticado.
 * @param {Object} props.anioVigente
 * @param {boolean} props.vigente `true` si la evaluación es del año académico vigente.
 * @param {() => void} props.alCerrar
 * @param {(cantidad: number) => void} props.alGuardar Se llama cuando todas las notas cambiadas ya se guardaron.
 */
export default function DialogoNotasEvaluacion({ evaluacion, usuario, anioVigente, vigente, alCerrar, alGuardar }) {
  const [estado, establecerEstado] = useState(vigente ? 'cargando' : 'bloqueado');
  const [errorCarga, establecerErrorCarga] = useState('');
  const [estudiantes, establecerEstudiantes] = useState([]);
  const [guardadas, establecerGuardadas] = useState({});
  const [pendientes, establecerPendientes] = useState({});
  const [erroresFila, establecerErroresFila] = useState({});
  const [pagina, establecerPagina] = useState(0);
  const [guardando, establecerGuardando] = useState(false);
  const [errorGuardado, establecerErrorGuardado] = useState('');
  const [confirmandoCierre, establecerConfirmandoCierre] = useState(false);
  const [intento, establecerIntento] = useState(0);

  useEffect(() => {
    if (!vigente) return undefined;
    let cancelado = false;
    establecerEstado('cargando');
    Promise.all([listarEstudiantesEvaluacion(evaluacion), listarNotasEvaluacion(evaluacion)]).then(
      ([respuestaEstudiantes, respuestaNotas]) => {
        if (cancelado) return;
        const error = [respuestaEstudiantes, respuestaNotas].find((respuesta) => !respuesta.exitoso);
        if (error) {
          establecerErrorCarga(error.mensaje || 'No se pudieron cargar los estudiantes y sus notas.');
          establecerEstado('error');
          return;
        }
        establecerEstudiantes(Array.isArray(respuestaEstudiantes.datos) ? respuestaEstudiantes.datos : []);
        establecerGuardadas(Object.fromEntries(
          (Array.isArray(respuestaNotas.datos) ? respuestaNotas.datos : []).map((nota) => [String(nota.estudianteId), nota.nota])
        ));
        establecerEstado('listo');
      }
    );
    return () => {
      cancelado = true;
    };
  }, [evaluacion, vigente, intento]);

  const notaDe = (id) => pendientes[id] ?? guardadas[id] ?? '';
  const cantidadPendientes = Object.keys(pendientes).length;
  const conNota = estudiantes.filter((item) => notaDe(String(item.id))).length;

  const elegirNota = (estudiante, nota) => {
    const id = String(estudiante.id);
    establecerErrorGuardado('');
    establecerConfirmandoCierre(false);
    establecerErroresFila((actuales) => {
      const { [id]: _quitado, ...resto } = actuales;
      return resto;
    });
    establecerPendientes((actuales) => {
      const { [id]: _anterior, ...resto } = actuales;
      // Volver a la nota ya guardada deja de ser un cambio.
      return guardadas[id] === nota ? resto : { ...resto, [id]: nota };
    });
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardando || cantidadPendientes === 0) return;
    establecerErrorGuardado('');
    establecerConfirmandoCierre(false);
    establecerGuardando(true);
    const cambios = Object.entries(pendientes);
    const resultados = await Promise.all(cambios.map(async ([id, nota]) => {
      const estudiante = estudiantes.find((item) => String(item.id) === id);
      const respuesta = await guardarNotaEvaluacion(evaluacion, estudiante, nota, usuario, anioVigente);
      return { id, nota, respuesta };
    }));
    establecerGuardando(false);

    const fallidas = resultados.filter((resultado) => !resultado.respuesta.exitoso);
    const correctas = resultados.filter((resultado) => resultado.respuesta.exitoso);
    establecerGuardadas((actuales) => ({
      ...actuales,
      ...Object.fromEntries(correctas.map((resultado) => [resultado.id, resultado.respuesta.datos?.nota ?? resultado.nota]))
    }));

    if (fallidas.length === 0) {
      alGuardar(correctas.length);
      return;
    }
    // Las que fallaron siguen como cambios sin guardar, marcadas en su fila, para reintentarlas.
    establecerPendientes(Object.fromEntries(fallidas.map((resultado) => [resultado.id, resultado.nota])));
    establecerErroresFila(Object.fromEntries(
      fallidas.map((resultado) => [resultado.id, resultado.respuesta.mensaje || 'No se pudo guardar la nota.'])
    ));
    establecerErrorGuardado(
      fallidas.length === 1
        ? 'No se pudo guardar 1 nota. Revisa la fila marcada.'
        : `No se pudieron guardar ${fallidas.length} notas. Revisa las filas marcadas.`
    );
  };

  // Con cambios sin guardar, cerrar pide confirmación antes de descartarlos.
  const solicitarCierre = () => {
    if (cantidadPendientes > 0 && !confirmandoCierre) {
      establecerConfirmandoCierre(true);
      return;
    }
    alCerrar();
  };

  const totalPaginas = Math.max(1, Math.ceil(estudiantes.length / ESTUDIANTES_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const visibles = estudiantes.slice(paginaActual * ESTUDIANTES_POR_PAGINA, (paginaActual + 1) * ESTUDIANTES_POR_PAGINA);
  const sePuedeEditar = estado === 'listo' && estudiantes.length > 0;
  const porcentaje = estudiantes.length > 0 ? Math.round((conNota / estudiantes.length) * 100) : 0;

  return (
    <DialogoBase
      idTitulo="dialogo-notas-evaluacion"
      titulo={`Notas · ${evaluacion.nombre}`}
      subtitulo={[evaluacion.cursoNombre, evaluacion.seccionNombre && `Sección ${evaluacion.seccionNombre}`].filter(Boolean).join(' · ')}
      textoConfirmar="Guardar notas"
      textoEnviando="Guardando…"
      textoCancelar={sePuedeEditar ? 'Cancelar' : 'Cerrar'}
      enviando={guardando}
      sinConfirmar={!sePuedeEditar}
      confirmarDeshabilitado={cantidadPendientes === 0}
      error={errorGuardado || null}
      anchoMaximo="38rem"
      cerrarAlClicFuera={false}
      botonesExpandidos
      alSolicitarCierre={solicitarCierre}
      alCancelar={alCerrar}
      alConfirmar={guardar}
    >
      <dl className={estilos.datosEvaluacion}>
        <div className={estilos.datoEvaluacion}>
          <dt>Bimestre</dt>
          <dd>{evaluacion.bimestreNombre || '—'}</dd>
        </div>
        <div className={estilos.datoEvaluacion}>
          <dt>Fecha</dt>
          <dd>{formatearFechaVisible(evaluacion.fecha)}</dd>
        </div>
      </dl>

      {sePuedeEditar && (
        <div className={estilos.avance}>
          <div className={estilos.avanceTexto} aria-live="polite">
            <span><strong>{conNota}</strong> de {estudiantes.length} con nota</span>
            {cantidadPendientes > 0 && (
              <span className={estilos.sinGuardar}>
                {cantidadPendientes === 1 ? '1 sin guardar' : `${cantidadPendientes} sin guardar`}
              </span>
            )}
          </div>
          <progress
            className={estilos.progreso}
            value={conNota}
            max={estudiantes.length}
            aria-label={`${conNota} de ${estudiantes.length} estudiantes con nota (${porcentaje}%)`}
          />
        </div>
      )}

      {estado === 'bloqueado' && (
        <p className={estilos.aviso} role="alert">
          <Icono nombre="alerta" tamano={16} />
          <span>{MENSAJE_ANIO_NO_VIGENTE}</span>
        </p>
      )}

      {estado === 'cargando' && <EstadoConsulta tipo="carga" mensaje="Cargando estudiantes…" filasEsqueleto={ESTUDIANTES_POR_PAGINA} />}

      {estado === 'error' && (
        <EstadoConsulta tipo="error" mensaje={errorCarga} alReintentar={() => establecerIntento((valor) => valor + 1)} />
      )}

      {estado === 'listo' && estudiantes.length === 0 && (
        <EstadoConsulta tipo="vacio" icono="usuarios" mensaje="No hay estudiantes activos con matrícula confirmada en esta sección." />
      )}

      {sePuedeEditar && (
        <>
          <ul className={estilos.listaEstudiantes} aria-label="Estudiantes de la sección">
            {visibles.map((estudiante) => {
              const id = String(estudiante.id);
              const sinGuardar = id in pendientes;
              const error = erroresFila[id];
              return (
                <li key={id} className={sinGuardar ? `${estilos.filaEstudiante} ${estilos.filaPendiente}` : estilos.filaEstudiante}>
                  <div className={estilos.estudiante}>
                    <Avatar iniciales={obtenerInicialesDeNombre(estudiante.nombre)} />
                    <div className={estilos.textoEstudiante}>
                      <span className={estilos.nombreEstudiante}>{estudiante.nombre}</span>
                      <span className={estilos.codigoEstudiante}>
                        {estudiante.codigo || '—'}
                        {sinGuardar && <span className={estilos.sinGuardar}> · sin guardar</span>}
                      </span>
                    </div>
                  </div>
                  <NotaSegmentada
                    etiqueta={`Nota de ${estudiante.nombre}`}
                    valor={notaDe(id)}
                    deshabilitado={guardando}
                    alCambiar={(nota) => elegirNota(estudiante, nota)}
                  />
                  {error && (
                    <p className={estilos.errorFila} role="alert">
                      <Icono nombre="alerta" tamano={14} />
                      <span>{error}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          {estudiantes.length > ESTUDIANTES_POR_PAGINA && (
            <Paginacion
              pagina={paginaActual}
              totalPaginas={totalPaginas}
              totalElementos={estudiantes.length}
              tamanioPagina={ESTUDIANTES_POR_PAGINA}
              cantidadEnPagina={visibles.length}
              alCambiarPagina={establecerPagina}
              etiqueta="Paginación de estudiantes"
              unidadSingular="estudiante"
              unidadPlural="estudiantes"
            />
          )}
        </>
      )}

      {confirmandoCierre && (
        <div className={`${estilos.aviso} ${estilos.avisoCierre}`} role="alert">
          <Icono nombre="alerta" tamano={16} />
          <span className={estilos.textoAviso}>
            Hay {cantidadPendientes === 1 ? '1 nota' : `${cantidadPendientes} notas`} sin guardar. Si cierras, se perderán.
          </span>
          <span className={estilos.accionesAviso}>
            <button type="button" className={estilos.botonAviso} onClick={() => establecerConfirmandoCierre(false)}>
              Seguir editando
            </button>
            <button type="button" className={estilos.botonAviso} onClick={alCerrar}>
              Descartar y cerrar
            </button>
          </span>
        </div>
      )}
    </DialogoBase>
  );
}
