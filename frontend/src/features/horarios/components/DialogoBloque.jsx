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
  const asignacionInicial = asignaciones.find((asignacion) => asignacion.id === bloque?.asignacionId);
  const [cursoId, establecerCursoId] = useState(asignacionInicial?.cursoId ?? '');
  const [docenteId, establecerDocenteId] = useState(asignacionInicial?.docenteId ?? '');
  const [aulaId, establecerAulaId] = useState(bloque?.aulaId ?? '');
  const [errores, establecerErrores] = useState({});

  const sinRelaciones = asignaciones.length === 0;
  const ocupacionDeAula = (id) => ocupaciones.find((ocupacion) => ocupacion.aulaId === id);
  const ocupacionDe = (id) => ocupaciones.find((ocupacion) => ocupacion.docenteId === id);

  const cursos = useMemo(() => {
    const vistos = new Map();
    asignaciones.forEach(({ cursoId: id, cursoNombre }) => vistos.set(id, cursoNombre));
    return [...vistos].map(([valor, etiqueta]) => ({ valor, etiqueta }));
  }, [asignaciones]);

  const docentes = useMemo(
    () =>
      asignaciones
        .filter((asignacion) => asignacion.cursoId === cursoId)
        .map(({ docenteId: id, docenteNombre }) => ({
          valor: id,
          etiqueta: ocupacionDe(id) ? `${docenteNombre} (ocupado)` : docenteNombre
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asignaciones, cursoId, ocupaciones]
  );

  function mensajeAulaOcupada(id) {
    const ocupacion = ocupacionDeAula(id);
    const nombre = aulas.find((aula) => aula.id === id)?.nombre;
    return ocupacion ? `${nombre} ya está ocupada por ${ocupacion.seccionNombre} a esta hora.` : undefined;
  }

  function mensajeOcupado(id) {
    const ocupacion = ocupacionDe(id);
    const nombre = asignaciones.find((asignacion) => asignacion.docenteId === id)?.docenteNombre;
    return ocupacion ? `${nombre} ya tiene clase en ${ocupacion.seccionNombre} a esta hora.` : undefined;
  }

  function limpiarError(campo) {
    establecerErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function cambiarCurso(valor) {
    establecerCursoId(valor);
    // Si el curso solo tiene un docente, queda elegido; si no, se vuelve a pedir.
    const delCurso = asignaciones.filter((asignacion) => asignacion.cursoId === valor);
    establecerDocenteId(delCurso.length === 1 ? delCurso[0].docenteId : '');
    limpiarError('curso');
    limpiarError('docente');
  }

  function manejarEnvio(evento) {
    evento.preventDefault();

    const encontrados = {};
    if (!cursoId) {
      encontrados.curso = 'Selecciona un curso.';
    }
    if (cursoId && !docenteId) {
      encontrados.docente = 'Selecciona un docente.';
    } else if (docenteId && ocupacionDe(docenteId)) {
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

    const asignacion = asignaciones.find((a) => a.cursoId === cursoId && a.docenteId === docenteId);
    alGuardar({ asignacionId: asignacion.id, aulaId });
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
              etiqueta="Curso"
              requerido
              enfoqueInicial
              placeholder="Seleccionar curso..."
              valor={cursoId}
              opciones={cursos}
              error={errores.curso}
              alCambiar={cambiarCurso}
            />
            <CampoSelect
              id="bloque-docente"
              etiqueta="Docente"
              requerido
              placeholder={cursoId ? 'Seleccionar docente...' : 'Primero elige un curso'}
              valor={docenteId}
              opciones={docentes}
              deshabilitado={!cursoId}
              error={errores.docente ?? mensajeOcupado(docenteId)}
              alCambiar={(valor) => {
                establecerDocenteId(valor);
                limpiarError('docente');
              }}
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
