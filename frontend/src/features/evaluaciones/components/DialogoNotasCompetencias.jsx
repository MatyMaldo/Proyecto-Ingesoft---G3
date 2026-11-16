import { useEffect, useId, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import campos from '../../../shared/styles/camposDialogo.module.css';
import {
  ESCALA_NOTAS_EVALUACION,
  LONGITUD_MAXIMA_CONCLUSION_COMPETENCIA,
  guardarNotasCompetencias,
  listarBimestresAnio,
  listarEstudiantesSeccionCompetencias,
  listarNotasCompetencias
} from '../services/evaluacionesService.js';
import NotaSegmentada from './NotaSegmentada.jsx';
import estilos from './DialogosEvaluacion.module.css';

/**
 * Minipantalla por pasos «Notas de competencias»: el paso 1 elige el bimestre finalizado y el estudiante; cada paso
 * siguiente muestra UNA competencia (nota y conclusión descriptiva) y el último guarda todas juntas. Así nunca hay
 * desplazamiento, sin importar cuántas competencias tenga el curso.
 *
 * @param {Object} props
 * @param {Object} props.contexto Contexto del docente (año vigente y docente).
 * @param {Object} props.asignacion Curso elegido.
 * @param {Object} props.seccion Sección elegida.
 * @param {Array} props.competencias Competencias del curso.
 * @param {Object} props.asignacionSeleccionada Curso, sección y año tal como los pide el servicio.
 * @param {Object|null} props.usuario Docente autenticado.
 * @param {() => void} props.alCerrar
 * @param {() => void} props.alGuardar Se llama cuando las notas ya se guardaron.
 */
export default function DialogoNotasCompetencias({
  contexto,
  asignacion,
  seccion,
  competencias,
  asignacionSeleccionada,
  usuario,
  alCerrar,
  alGuardar
}) {
  const [estadoCarga, establecerEstadoCarga] = useState('cargando');
  const [errorCarga, establecerErrorCarga] = useState('');
  const [estudiantes, establecerEstudiantes] = useState([]);
  const [bimestres, establecerBimestres] = useState([]);
  const [bimestreId, establecerBimestreId] = useState('');
  const [estudianteId, establecerEstudianteId] = useState('');
  const [paso, establecerPaso] = useState(0);
  const [notasForm, establecerNotasForm] = useState([]);
  const [cargadoPara, establecerCargadoPara] = useState('');
  const [trabajando, establecerTrabajando] = useState(false);
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);
  const idBimestre = useId();
  const idEstudiante = useId();
  const idConclusion = useId();

  useEffect(() => {
    let cancelado = false;
    establecerEstadoCarga('cargando');
    Promise.all([
      listarEstudiantesSeccionCompetencias(asignacionSeleccionada?.idAsignacionCurso),
      listarBimestresAnio(contexto.anioAcademico.id)
    ]).then(([respuestaEstudiantes, respuestaBimestres]) => {
      if (cancelado) return;
      const falla = [respuestaEstudiantes, respuestaBimestres].find((respuesta) => !respuesta.exitoso);
      if (falla) {
        establecerErrorCarga(falla.mensaje || 'No se pudieron cargar los datos de notas de competencias.');
        establecerEstadoCarga('error');
        return;
      }
      // Se muestran los cuatro bimestres; solo se pueden elegir los ya finalizados.
      const primerFinalizado = respuestaBimestres.datos.find((item) => item.finalizado);
      establecerEstudiantes(respuestaEstudiantes.datos ?? []);
      establecerBimestres(respuestaBimestres.datos);
      establecerBimestreId(String(primerFinalizado?.id ?? ''));
      establecerEstadoCarga('listo');
    });
    return () => {
      cancelado = true;
    };
  }, [asignacionSeleccionada?.idAsignacionCurso, contexto.anioAcademico.id, intento]);

  const totalPasos = 1 + competencias.length;
  const enSeleccion = paso === 0;
  const esUltimo = paso === totalPasos - 1;
  const competenciaActual = enSeleccion ? null : notasForm[paso - 1];
  const bimestre = bimestres.find((item) => String(item.id) === String(bimestreId));
  const estudiante = estudiantes.find((item) => String(item.id) === String(estudianteId));

  const sinBimestres = estadoCarga === 'listo' && !bimestres.some((item) => item.finalizado);
  const sinCompetencias = competencias.length === 0;
  const sinEstudiantes = estadoCarga === 'listo' && estudiantes.length === 0;
  const seleccionBloqueada = estadoCarga !== 'listo' || sinBimestres || sinCompetencias || sinEstudiantes;

  const cambiarCompetencia = (cambios) => establecerNotasForm((actuales) => actuales.map(
    (item, indice) => (indice === paso - 1 ? { ...item, ...cambios } : item)
  ));

  const cargarNotas = async () => {
    const clave = `${bimestreId}-${estudianteId}`;
    if (clave === cargadoPara) return true;
    establecerTrabajando(true);
    const respuesta = await listarNotasCompetencias(asignacionSeleccionada.cursoId, bimestreId, estudianteId, competencias);
    establecerTrabajando(false);
    if (!respuesta.exitoso) {
      establecerError(respuesta.mensaje || 'No se pudieron cargar las notas de competencias.');
      return false;
    }
    const registradas = respuesta.datos ?? [];
    establecerNotasForm(competencias.map((competencia) => {
      const nota = registradas.find((item) => String(item.competenciaId) === String(competencia.id));
      return {
        competenciaId: competencia.id,
        nombre: competencia.nombre,
        descripcion: competencia.descripcion ?? '',
        nota: nota?.nota ?? '',
        conclusionDescriptiva: nota?.conclusionDescriptiva ?? ''
      };
    }));
    establecerCargadoPara(clave);
    return true;
  };

  const validarPaso = (item) => {
    if (!ESCALA_NOTAS_EVALUACION.includes(item.nota)) return `${item.nombre}: la nota debe ser AD, A, B o C.`;
    const conclusion = item.conclusionDescriptiva.trim();
    if (!conclusion) return `${item.nombre}: La conclusión descriptiva es obligatoria.`;
    if (conclusion.length > LONGITUD_MAXIMA_CONCLUSION_COMPETENCIA) {
      return `${item.nombre}: La conclusión descriptiva no puede superar los ${LONGITUD_MAXIMA_CONCLUSION_COMPETENCIA} caracteres.`;
    }
    return '';
  };

  const guardar = async () => {
    establecerTrabajando(true);
    const respuesta = await guardarNotasCompetencias(usuario, {
      idAsignacionCurso: asignacionSeleccionada?.idAsignacionCurso,
      idEstudiante: estudianteId,
      idBimestre: bimestreId,
      idCurso: asignacionSeleccionada.cursoId,
      idSeccion: asignacionSeleccionada.seccionId,
      estudianteNombre: estudiante?.nombre,
      bimestreNombre: bimestre?.nombre,
      cursoNombre: asignacion?.cursoNombre,
      calificaciones: notasForm.map((item) => ({
        idCompetencia: item.competenciaId,
        nombre: item.nombre,
        valorNota: item.nota,
        conclusionDescriptiva: item.conclusionDescriptiva
      }))
    });
    establecerTrabajando(false);
    if (!respuesta.exitoso) {
      establecerError(respuesta.mensaje || 'No se pudieron guardar las notas de competencias.');
      return;
    }
    alGuardar();
  };

  const avanzar = async (evento) => {
    evento.preventDefault();
    if (trabajando) return;
    establecerError('');

    if (enSeleccion) {
      if (!bimestreId || !estudianteId) {
        establecerError('Selecciona el bimestre y el estudiante.');
        return;
      }
      if (await cargarNotas()) establecerPaso(1);
      return;
    }

    const mensaje = validarPaso(competenciaActual);
    if (mensaje) {
      establecerError(mensaje);
      return;
    }
    if (esUltimo) {
      await guardar();
      return;
    }
    establecerPaso(paso + 1);
  };

  const retroceder = () => {
    establecerError('');
    establecerPaso(paso - 1);
  };

  const textoConfirmar = esUltimo && !enSeleccion ? 'Guardar notas' : 'Siguiente';

  return (
    <DialogoBase
      idTitulo="dialogo-notas-competencias"
      titulo="Notas de competencias"
      subtitulo={`${asignacion.cursoNombre} · ${seccion.gradoNombre} ${seccion.nombre}`}
      textoConfirmar={textoConfirmar}
      textoEnviando={textoConfirmar === 'Siguiente' ? 'Cargando…' : 'Guardando…'}
      enviando={trabajando}
      confirmarDeshabilitado={enSeleccion && seleccionBloqueada}
      error={error || null}
      anchoMaximo="36rem"
      cerrarAlClicFuera={false}
      botonesExpandidos
      accionesPie={!enSeleccion && (
        <button type="button" className={estilos.botonAtras} disabled={trabajando} onClick={retroceder}>
          Atrás
        </button>
      )}
      alCancelar={alCerrar}
      alConfirmar={avanzar}
    >
      <p className={estilos.pasos} aria-live="polite">
        <span>Paso {paso + 1} de {totalPasos}</span>
        <span className={estilos.tituloPaso}>{enSeleccion ? 'Bimestre y estudiante' : competenciaActual?.nombre}</span>
      </p>
      <progress className={estilos.progreso} value={paso + 1} max={totalPasos} aria-hidden="true" />

      {enSeleccion && (
        <>
          {estadoCarga === 'cargando' && <EstadoConsulta tipo="carga" mensaje="Cargando bimestres y estudiantes…" filasEsqueleto={2} />}
          {estadoCarga === 'error' && (
            <EstadoConsulta tipo="error" mensaje={errorCarga} alReintentar={() => establecerIntento((valor) => valor + 1)} />
          )}
          {sinBimestres && (
            <p className={estilos.aviso} role="alert">
              <Icono nombre="alerta" tamano={16} />
              <span>Las notas de competencias se registran una vez finalizado el bimestre</span>
            </p>
          )}
          {sinCompetencias && (
            <p className={estilos.aviso} role="alert">
              <Icono nombre="alerta" tamano={16} />
              <span>Este curso aún no tiene competencias establecidas.</span>
            </p>
          )}
          {sinEstudiantes && (
            <p className={estilos.aviso} role="alert">
              <Icono nombre="alerta" tamano={16} />
              <span>No hay estudiantes activos con matrícula confirmada en esta sección.</span>
            </p>
          )}

          {estadoCarga === 'listo' && (
            <>
              <div className={campos.campo}>
                <span id={idBimestre} className={campos.etiqueta}>Bimestre</span>
                <div className={estilos.chipsBimestre} role="radiogroup" aria-labelledby={idBimestre}>
                  {bimestres.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={String(item.id) === bimestreId}
                      disabled={!item.finalizado}
                      title={item.finalizado ? undefined : 'Disponible cuando finalice el bimestre'}
                      className={estilos.chipBimestre}
                      onClick={() => establecerBimestreId(String(item.id))}
                    >
                      {item.nombre}
                    </button>
                  ))}
                </div>
              </div>
              <div className={campos.campo}>
                <label htmlFor={idEstudiante} className={campos.etiqueta}>Estudiante</label>
                <select
                  id={idEstudiante}
                  className={campos.selector}
                  value={estudianteId}
                  disabled={sinEstudiantes}
                  onChange={(evento) => establecerEstudianteId(evento.target.value)}
                >
                  <option value="">Selecciona un estudiante</option>
                  {estudiantes.map((item) => (
                    <option key={item.id} value={item.id}>{item.nombre}{item.codigo ? ` · ${item.codigo}` : ''}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </>
      )}

      {!enSeleccion && competenciaActual && (
        <>
          <p className={campos.ayuda}>
            {estudiante?.nombre} · {bimestre?.nombre}
          </p>
          {competenciaActual.descripcion && <p className={estilos.descripcionCompetencia}>{competenciaActual.descripcion}</p>}

          <div className={campos.campo}>
            <span className={campos.etiqueta}>Nota</span>
            <NotaSegmentada
              etiqueta={`Nota de ${competenciaActual.nombre}`}
              valor={competenciaActual.nota}
              alCambiar={(nota) => cambiarCompetencia({ nota })}
            />
          </div>

          <div className={campos.campo}>
            <label htmlFor={idConclusion} className={campos.etiqueta}>Conclusión descriptiva</label>
            <textarea
              id={idConclusion}
              className={campos.areaTexto}
              maxLength={LONGITUD_MAXIMA_CONCLUSION_COMPETENCIA}
              rows={3}
              value={competenciaActual.conclusionDescriptiva}
              onChange={(evento) => cambiarCompetencia({ conclusionDescriptiva: evento.target.value })}
            />
            <p className={campos.ayuda}>
              {competenciaActual.conclusionDescriptiva.trim().length}/{LONGITUD_MAXIMA_CONCLUSION_COMPETENCIA} caracteres
            </p>
          </div>
        </>
      )}
    </DialogoBase>
  );
}
