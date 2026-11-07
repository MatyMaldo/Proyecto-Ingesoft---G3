import { useMemo, useState } from 'react';

import DialogoBase from '../../cursos/components/DialogoBase.jsx';
import { obtenerEtiquetaDia } from '../constants/horarios.js';
import {
  bloqueCruzaReceso,
  HORA_FIN_JORNADA,
  HORA_INICIO_JORNADA,
  rangoHorarioValido,
  seSolapan
} from '../utils/tiempo.js';
import CampoSelect from './CampoSelect.jsx';
import estilos from './DialogoBloque.module.css';

/**
 * Modal para asignar o editar un bloque: curso, docente, aula y rango de horas.
 * El bloque puede durar una o varias horas.
 */
export default function DialogoBloque({
  dia,
  horaInicioInicial,
  horaFinInicial,
  asignaciones,
  aulas,
  bloque,
  bloquesSeccion = [],
  ocupaciones = [],
  alCancelar,
  alGuardar
}) {
  const asignacionInicial = asignaciones.find(
    (asignacion) => String(asignacion.id) === String(bloque?.asignacionId)
  );
  const [asignacionId, establecerAsignacionId] = useState(
    asignacionInicial ? String(asignacionInicial.id) : ''
  );
  const [aulaId, establecerAulaId] = useState(bloque?.aulaId ?? '');
  const [horaInicio, establecerHoraInicio] = useState(
    bloque?.horaInicio ?? horaInicioInicial ?? HORA_INICIO_JORNADA
  );
  const [horaFin, establecerHoraFin] = useState(
    bloque?.horaFin ?? horaFinInicial ?? HORA_FIN_JORNADA
  );
  const [errores, establecerErrores] = useState({});

  const sinRelaciones = asignaciones.length === 0;
  const asignacionSeleccionada = asignaciones.find(
    (asignacion) => String(asignacion.id) === asignacionId
  );
  const docenteId = asignacionSeleccionada?.docenteId;

  const ocupacionesDelDia = useMemo(
    () => ocupaciones.filter((ocupacion) => ocupacion.dia === dia),
    [ocupaciones, dia]
  );
  const bloquesDelDia = useMemo(
    () => bloquesSeccion.filter((elemento) => elemento.dia === dia),
    [bloquesSeccion, dia]
  );

  const ocupacionDeAula = (id) => ocupacionesDelDia.find(
    (ocupacion) => String(ocupacion.aulaId) === String(id)
      && seSolapan(horaInicio, horaFin, ocupacion.horaInicio, ocupacion.horaFin)
  );
  const ocupacionDe = (id) => ocupacionesDelDia.find(
    (ocupacion) => String(ocupacion.docenteId) === String(id)
      && seSolapan(horaInicio, horaFin, ocupacion.horaInicio, ocupacion.horaFin)
  );
  const solapeSeccion = bloquesDelDia.find(
    (elemento) => seSolapan(horaInicio, horaFin, elemento.horaInicio, elemento.horaFin)
  );

  const cursos = useMemo(() => {
    const cantidadPorCurso = new Map();
    asignaciones.forEach((asignacion) => {
      const cursoId = String(asignacion.cursoId);
      cantidadPorCurso.set(cursoId, (cantidadPorCurso.get(cursoId) ?? 0) + 1);
    });
    return asignaciones.map((asignacion) => ({
      valor: String(asignacion.id),
      etiqueta: cantidadPorCurso.get(String(asignacion.cursoId)) > 1
        ? `${asignacion.cursoNombre} — ${asignacion.docenteNombre}`
        : asignacion.cursoNombre
    }));
  }, [asignaciones]);

  function mensajeAulaOcupada(id) {
    const ocupacion = ocupacionDeAula(id);
    const nombre = aulas.find((aula) => String(aula.id) === String(id))?.nombre;
    return ocupacion
      ? `${nombre} ya está ocupada por ${ocupacion.seccionNombre} en ese horario.`
      : undefined;
  }

  function mensajeOcupado(id) {
    const ocupacion = ocupacionDe(id);
    const nombre = asignaciones.find(
      (asignacion) => String(asignacion.docenteId) === String(id)
    )?.docenteNombre;
    return ocupacion
      ? `${nombre} ya tiene clase en ${ocupacion.seccionNombre} en ese horario.`
      : undefined;
  }

  function limpiarError(campo) {
    establecerErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function cambiarAsignacion(valor) {
    establecerAsignacionId(valor);
    limpiarError('asignacion');
    limpiarError('docente');
  }

  function manejarEnvio(evento) {
    evento.preventDefault();

    const encontrados = {};
    if (!asignacionSeleccionada) {
      encontrados.asignacion = 'Selecciona una asignación de curso.';
    } else if (ocupacionDe(docenteId)) {
      encontrados.docente = mensajeOcupado(docenteId);
    }

    if (!aulaId) {
      encontrados.aula = 'Selecciona un aula.';
    } else if (ocupacionDeAula(aulaId)) {
      encontrados.aula = mensajeAulaOcupada(aulaId);
    }

    if (!horaInicio || !horaFin || !rangoHorarioValido(horaInicio, horaFin)) {
      encontrados.horaFin = `La hora de fin debe ser posterior al inicio y estar entre ${HORA_INICIO_JORNADA} y ${HORA_FIN_JORNADA}.`;
    } else if (bloqueCruzaReceso({ horaInicio, horaFin })) {
      encontrados.horaFin = 'El bloque no puede ocupar el recreo de 11:00 a 11:30.';
    } else if (solapeSeccion) {
      encontrados.horaFin = 'El bloque se solapa con otro bloque de esta sección.';
    }

    establecerErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      return;
    }

    alGuardar({
      dia,
      asignacionId: asignacionSeleccionada.id,
      aulaId,
      horaInicio,
      horaFin
    });
  }

  return (
    <DialogoBase
      idTitulo="dialogo-bloque-titulo"
      titulo={bloque ? 'Editar horario' : 'Asignar horario'}
      subtitulo={`${obtenerEtiquetaDia(dia)} · ${horaInicio} – ${horaFin}`}
      textoConfirmar={bloque ? 'Guardar cambios' : 'Agregar bloque'}
      textoEnviando="Guardando…"
      cerrarAlClicFuera={false}
      sinConfirmar={sinRelaciones}
      textoCancelar={sinRelaciones ? 'Cerrar' : 'Cancelar'}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      {sinRelaciones ? (
        <p className={estilos.aviso}>
          La sección no tiene relaciones curso-docente. Agrégalas en la tabla de arriba para poder
          asignar bloques.
        </p>
      ) : (
        <>
          <fieldset className={estilos.selector}>
            <legend className={estilos.leyenda}>Selector</legend>
            <CampoSelect
              id="bloque-curso"
              etiqueta="Curso asignado"
              requerido
              enfoqueInicial
              placeholder="Seleccionar curso asignado..."
              valor={asignacionId}
              opciones={cursos}
              error={errores.asignacion}
              alCambiar={cambiarAsignacion}
            />
            <CampoSelect
              id="bloque-docente"
              etiqueta="Docente"
              placeholder={asignacionSeleccionada ? 'Docente asignado' : 'Primero elige un curso'}
              valor={docenteId == null ? '' : String(docenteId)}
              opciones={asignacionSeleccionada
                ? [{
                    valor: String(docenteId),
                    etiqueta: ocupacionDe(docenteId)
                      ? `${asignacionSeleccionada.docenteNombre} (ocupado)`
                      : asignacionSeleccionada.docenteNombre
                  }]
                : []}
              deshabilitado
              error={errores.docente ?? mensajeOcupado(docenteId)}
            />
          </fieldset>

          <div className={estilos.fila}>
            <label className={estilos.campo}>
              Hora de inicio
              <input
                type="time"
                className={estilos.entrada}
                value={horaInicio}
                min={HORA_INICIO_JORNADA}
                max={HORA_FIN_JORNADA}
                step="300"
                onChange={(evento) => {
                  establecerHoraInicio(evento.target.value);
                  limpiarError('horaFin');
                }}
              />
            </label>
            <label className={estilos.campo}>
              Hora de fin
              <input
                type="time"
                className={estilos.entrada}
                value={horaFin}
                min={HORA_INICIO_JORNADA}
                max={HORA_FIN_JORNADA}
                step="300"
                onChange={(evento) => {
                  establecerHoraFin(evento.target.value);
                  limpiarError('horaFin');
                }}
              />
            </label>
          </div>
          {errores.horaFin && <p className={estilos.mensajeError}>{errores.horaFin}</p>}

          <CampoSelect
            id="bloque-aula"
            etiqueta="Aula"
            requerido
            placeholder="Seleccionar aula..."
            valor={aulaId}
            opciones={aulas.map((aula) => ({
              valor: aula.id,
              etiqueta: ocupacionDeAula(aula.id) ? `${aula.nombre} (ocupada)` : aula.nombre
            }))}
            error={errores.aula ?? mensajeAulaOcupada(aulaId)}
            alCambiar={(valor) => {
              establecerAulaId(valor);
              limpiarError('aula');
            }}
          />
          {solapeSeccion && !errores.horaFin && (
            <p className={estilos.nota} role="note">
              Hay otro bloque de esta sección en ese rango de horas.
            </p>
          )}
        </>
      )}
    </DialogoBase>
  );
}
