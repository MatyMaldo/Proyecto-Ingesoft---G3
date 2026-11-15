import { useId } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilos from '../../../shared/styles/camposDialogo.module.css';
import { CAPACIDAD_MAXIMA_TECNICA } from '../utils/validacionesGradosSecciones.js';

/**
 * Diálogo para crear un grado, o crear o modificar una sección. El borrador del formulario y su validación viven en
 * `useGradosSecciones`; aquí solo se pintan los campos. Se monta mientras hay formulario abierto.
 *
 * @param {Object} props
 * @param {{ tipo: 'grado'|'seccion', accion: 'crear'|'editar', nombre: string, capacidadMaxima: string, tutorId: string }} props.formulario
 * @param {Object<string, string>} props.errores Mensajes de validación por campo.
 * @param {string} props.errorGuardado Error general devuelto al guardar.
 * @param {boolean} props.guardando
 * @param {Array<{ id: number|string, nombreCompleto: string }>} props.docentes
 * @param {{ anio?: string|number, grado?: string }} props.contexto Año y grado de la sección (solo secciones).
 * @param {(formulario: Object) => void} props.alCambiar
 * @param {(evento: Event) => void} props.alGuardar
 * @param {() => void} props.alCancelar
 */
export default function DialogoEstructuraEscolar({
  formulario,
  errores,
  errorGuardado,
  guardando,
  docentes,
  contexto,
  alCambiar,
  alGuardar,
  alCancelar
}) {
  const idNombre = useId();
  const idCapacidad = useId();
  const idTutor = useId();
  const esGrado = formulario.tipo === 'grado';
  const edita = formulario.accion === 'editar';

  const titulo = esGrado ? 'Crear grado' : edita ? 'Modificar sección' : 'Crear sección';

  function campoError(id, mensaje) {
    return mensaje ? (
      <span className={estilos.error} id={`${id}-error`}>
        <Icono nombre="alerta" tamano={14} />
        <span>{mensaje}</span>
      </span>
    ) : null;
  }

  function cambiar(campo, valor) {
    alCambiar({ ...formulario, [campo]: valor });
  }

  return (
    <DialogoBase
      idTitulo="dialogo-estructura-escolar"
      titulo={titulo}
      subtitulo="Año escolar"
      textoConfirmar={edita ? 'Guardar cambios' : 'Guardar'}
      textoEnviando="Guardando…"
      enviando={guardando}
      error={errorGuardado || null}
      anchoMaximo="30rem"
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={alCancelar}
      alConfirmar={alGuardar}
    >
      {!esGrado && (
        <p className={estilos.resumen}>
          Año académico: <strong>{contexto?.anio}</strong> · Grado: <strong>{contexto?.grado}</strong>
          {edita && ' · El grado y el año no se pueden modificar'}
        </p>
      )}

      <div className={estilos.campo}>
        <label htmlFor={idNombre} className={estilos.etiqueta}>
          {esGrado ? 'Nombre del grado' : 'Nombre de la sección'}
        </label>
        <input
          id={idNombre}
          className={estilos.entrada}
          type="text"
          value={formulario.nombre}
          maxLength={esGrado ? 60 : 1}
          disabled={guardando}
          data-enfoque-inicial=""
          aria-required="true"
          aria-invalid={Boolean(errores.nombre)}
          aria-describedby={errores.nombre ? `${idNombre}-error` : undefined}
          onChange={(evento) => cambiar('nombre', evento.target.value)}
        />
        {campoError(idNombre, errores.nombre)}
        {!esGrado && !errores.nombre && <span className={estilos.ayuda}>Una sola letra, de la A a la Z.</span>}
      </div>

      {!esGrado && (
        <>
          <div className={estilos.campo}>
            <label htmlFor={idCapacidad} className={estilos.etiqueta}>Capacidad máxima</label>
            <input
              id={idCapacidad}
              className={estilos.entrada}
              type="text"
              inputMode="numeric"
              value={formulario.capacidadMaxima}
              disabled={guardando}
              aria-required="true"
              aria-invalid={Boolean(errores.capacidadMaxima)}
              aria-describedby={errores.capacidadMaxima ? `${idCapacidad}-error` : undefined}
              onChange={(evento) => cambiar('capacidadMaxima', evento.target.value)}
            />
            {campoError(idCapacidad, errores.capacidadMaxima)}
            {!errores.capacidadMaxima && (
              <span className={estilos.ayuda}>Número entero entre 1 y {CAPACIDAD_MAXIMA_TECNICA}.</span>
            )}
          </div>

          <div className={estilos.campo}>
            <label htmlFor={idTutor} className={estilos.etiqueta}>Tutor{edita ? '' : ' *'}</label>
            <select
              id={idTutor}
              className={estilos.selector}
              value={formulario.tutorId}
              disabled={guardando}
              aria-required={!edita}
              aria-invalid={Boolean(errores.tutorId)}
              aria-describedby={errores.tutorId ? `${idTutor}-error` : undefined}
              onChange={(evento) => cambiar('tutorId', evento.target.value)}
            >
              <option value="">{edita ? 'Sin tutor asignado' : 'Seleccionar tutor...'}</option>
              {docentes.map((docente) => (
                <option key={docente.id} value={docente.id}>{docente.nombreCompleto}</option>
              ))}
            </select>
            {campoError(idTutor, errores.tutorId)}
          </div>
        </>
      )}
    </DialogoBase>
  );
}
