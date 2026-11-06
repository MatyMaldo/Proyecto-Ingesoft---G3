import { useMemo, useState } from 'react';

import DialogoBase from '../../cursos/components/DialogoBase.jsx';
import { obtenerEtiquetaDia } from '../constants/horarios.js';
import CampoSelect from './CampoSelect.jsx';
import estilos from './DialogoBloque.module.css';

/**
 * Minipantalla para asignar un bloque de la matriz: selector en cascada Curso → Docente
 * (sale de las relaciones curso-docente de la sección) y aula.
 *
 * @param {Object} props
 * @param {string} props.dia
 * @param {{ id: string, inicio: string, fin: string }} props.franja Se muestra como "Lunes · 09:00 – 10:00".
 * @param {Array<{ id: string, cursoId: string, cursoNombre: string, docenteId: string, docenteNombre: string }>} props.asignaciones
 * @param {Array<{ id: string, nombre: string }>} props.aulas
 * @param {{ asignacionId: string, aulaId: string }|undefined} props.bloque Bloque actual, si ya tenía uno.
 * @param {Array<{ docenteId: string, aulaId: string, seccionNombre: string }>} props.ocupaciones Docentes y
 *   aulas usados por otra sección a este mismo día y hora; no se pueden elegir.
 * @param {() => void} props.alCancelar
 * @param {(bloque: { asignacionId: string, aulaId: string }) => void} props.alGuardar
 */
export default function DialogoBloque({ dia, franja, asignaciones, aulas, bloque, ocupaciones, alCancelar, alGuardar }) {
  const asignacionInicial = asignaciones.find(
    (asignacion) => String(asignacion.id) === String(bloque?.asignacionId)
  );
  const [asignacionId, establecerAsignacionId] = useState(
    asignacionInicial ? String(asignacionInicial.id) : ''
  );
  const [aulaId, establecerAulaId] = useState(bloque?.aulaId ?? '');
  const [errores, establecerErrores] = useState({});

  const sinRelaciones = asignaciones.length === 0;
  const asignacionSeleccionada = asignaciones.find(
    (asignacion) => String(asignacion.id) === asignacionId
  );
  const docenteId = asignacionSeleccionada?.docenteId;
  const ocupacionDeAula = (id) => ocupaciones.find(
    (ocupacion) => String(ocupacion.aulaId) === String(id)
  );
  const ocupacionDe = (id) => ocupaciones.find(
    (ocupacion) => String(ocupacion.docenteId) === String(id)
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
    const nombre = aulas.find((aula) => aula.id === id)?.nombre;
    return ocupacion ? `${nombre} ya está ocupada por ${ocupacion.seccionNombre} a esta hora.` : undefined;
  }

  function mensajeOcupado(id) {
    const ocupacion = ocupacionDe(id);
    const nombre = asignaciones.find(
      (asignacion) => String(asignacion.docenteId) === String(id)
    )?.docenteNombre;
    return ocupacion ? `${nombre} ya tiene clase en ${ocupacion.seccionNombre} a esta hora.` : undefined;
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
    establecerErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      return;
    }

    alGuardar({ asignacionId: asignacionSeleccionada.id, aulaId });
  }

  return (
    <DialogoBase
      idTitulo="dialogo-bloque-titulo"
      titulo="Asignar horario"
      subtitulo={`${obtenerEtiquetaDia(dia)} · ${franja.inicio} – ${franja.fin}`}
      textoConfirmar="Guardar cambios"
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
        </>
      )}
    </DialogoBase>
  );
}
