import { useId, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import campos from '../../../shared/styles/camposDialogo.module.css';
import { crearEvaluacion } from '../services/evaluacionesService.js';
import estilos from './DialogosEvaluacion.module.css';

const FORMULARIO_VACIO = { nombre: '', descripcion: '', fecha: '' };

function encontrarBimestre(fecha, bimestres = []) {
  return bimestres.find((bimestre) => fecha >= bimestre.inicio && fecha <= bimestre.fin);
}

function MensajeError({ id, texto }) {
  if (!texto) return null;
  return (
    <p id={id} className={campos.error} role="alert">
      <Icono nombre="alerta" tamano={14} />
      <span>{texto}</span>
    </p>
  );
}

/**
 * Minipantalla «Nueva evaluación»: nombre, fecha y descripción en una sola vista, con el curso, la
 * sección y el año como contexto fijo. El bimestre lo determina la fecha. Se monta solo mientras está abierta.
 *
 * @param {Object} props
 * @param {Object} props.contexto Contexto del docente (año vigente, bimestres y docente).
 * @param {Object} props.asignacion Curso elegido.
 * @param {Object} props.seccion Sección elegida.
 * @param {Object} props.asignacionSeleccionada Curso, sección y año tal como los pide el servicio.
 * @param {() => void} props.alCerrar
 * @param {(evaluacion: Object, bimestreNombre: string) => void} props.alCrear Recibe la evaluación ya registrada.
 */
export default function DialogoNuevaEvaluacion({
  contexto,
  asignacion,
  seccion,
  asignacionSeleccionada,
  alCerrar,
  alCrear
}) {
  const [formulario, establecerFormulario] = useState(FORMULARIO_VACIO);
  const [errores, establecerErrores] = useState({});
  const [errorGuardado, establecerErrorGuardado] = useState('');
  const [guardando, establecerGuardando] = useState(false);
  const idNombre = useId();
  const idFecha = useId();
  const idDescripcion = useId();

  const anio = contexto?.anioAcademico?.anio;
  const bimestreFecha = encontrarBimestre(formulario.fecha, contexto?.bimestres);
  const cambiar = (campo) => (evento) => establecerFormulario({ ...formulario, [campo]: evento.target.value });

  const validar = () => {
    const nuevos = {};
    if (!formulario.nombre.trim()) nuevos.nombre = 'Ingresa el nombre de la evaluación.';
    else if (formulario.nombre.trim().length > 160) nuevos.nombre = 'El nombre no puede superar los 160 caracteres.';
    if (!formulario.descripcion.trim()) nuevos.descripcion = 'Ingresa una descripción.';
    else if (formulario.descripcion.trim().length > 1000) nuevos.descripcion = 'La descripción no puede superar los 1000 caracteres.';
    if (!formulario.fecha) nuevos.fecha = 'Selecciona la fecha de la evaluación.';
    else if (!formulario.fecha.startsWith(`${anio}-`)) nuevos.fecha = `La fecha debe estar dentro del año académico ${anio}.`;
    else if (!bimestreFecha) nuevos.fecha = 'La fecha debe estar dentro de uno de los bimestres del año académico.';
    establecerErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardando || !validar()) return;
    establecerErrorGuardado('');
    establecerGuardando(true);
    const respuesta = await crearEvaluacion({
      nombre: formulario.nombre,
      descripcion: formulario.descripcion,
      fecha: formulario.fecha,
      idAsignacionCurso: asignacionSeleccionada.idAsignacionCurso
    }, asignacionSeleccionada, contexto.docente);
    establecerGuardando(false);
    if (!respuesta.exitoso) {
      establecerErrorGuardado(respuesta.mensaje || 'No se pudo registrar la evaluación.');
      return;
    }
    alCrear(respuesta.datos, bimestreFecha.nombre);
  };

  return (
    <DialogoBase
      idTitulo="dialogo-nueva-evaluacion"
      titulo="Nueva evaluación"
      subtitulo={`${asignacion.cursoNombre} · ${seccion.gradoNombre} ${seccion.nombre} · ${anio}`}
      textoConfirmar="Guardar evaluación"
      textoEnviando="Guardando…"
      enviando={guardando}
      error={errorGuardado || null}
      anchoMaximo="36rem"
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={alCerrar}
      alConfirmar={guardar}
    >
      <div className={campos.campo}>
        <label htmlFor={idNombre} className={campos.etiqueta}>Nombre de la evaluación *</label>
        <input
          id={idNombre}
          className={campos.entrada}
          maxLength={160}
          value={formulario.nombre}
          onChange={cambiar('nombre')}
          aria-invalid={Boolean(errores.nombre) || undefined}
          aria-describedby={errores.nombre ? `${idNombre}-error` : undefined}
          data-enfoque-inicial=""
        />
        <MensajeError id={`${idNombre}-error`} texto={errores.nombre} />
      </div>

      <div className={campos.campo}>
        <label htmlFor={idFecha} className={campos.etiqueta}>Fecha *</label>
        <input
          id={idFecha}
          type="date"
          className={campos.entrada}
          value={formulario.fecha}
          onChange={cambiar('fecha')}
          aria-invalid={Boolean(errores.fecha) || undefined}
          aria-describedby={errores.fecha ? `${idFecha}-error` : undefined}
        />
        <MensajeError id={`${idFecha}-error`} texto={errores.fecha} />
      </div>

      <div className={campos.campo}>
        <label htmlFor={idDescripcion} className={campos.etiqueta}>Descripción *</label>
        <textarea
          id={idDescripcion}
          className={campos.areaTexto}
          maxLength={1000}
          rows={3}
          value={formulario.descripcion}
          onChange={cambiar('descripcion')}
          aria-invalid={Boolean(errores.descripcion) || undefined}
          aria-describedby={errores.descripcion ? `${idDescripcion}-error` : undefined}
        />
        <MensajeError id={`${idDescripcion}-error`} texto={errores.descripcion} />
      </div>

      <p className={campos.ayuda}>
        Bimestre asignado: <strong>{bimestreFecha?.nombre ?? 'se determinará según la fecha'}</strong>
      </p>
    </DialogoBase>
  );
}
