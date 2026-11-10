import { useMemo } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { DIAS } from '../constants/horarios.js';
import estilos from './PanelConflictosHorario.module.css';

const ETIQUETA_TIPO = {
  CONFLICTO_DOCENTE: 'Choque de docente',
  CONFLICTO_SECCION: 'Choque de sección',
  CONFLICTO_AULA: 'Choque de aula',
  DUPLICADO: 'Duplicado',
  HORARIO_INVALIDO: 'Horario inválido',
  REFERENCIA_INVALIDA: 'Dato inválido'
};

function etiquetaDia(dia) {
  return DIAS.find((elemento) => elemento.id === dia)?.etiqueta ?? dia ?? '';
}

function horaCorta(hora) {
  return String(hora ?? '').slice(0, 5);
}

/** Agrupa los conflictos del backend por bloque para no repetir la cabecera. */
function agruparConflictos(conflictos) {
  const grupos = new Map();
  conflictos.forEach((conflicto, posicion) => {
    const clave = conflicto.clave ?? `conflicto-${conflicto.indice ?? posicion}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(conflicto);
  });
  return [...grupos.entries()];
}

/**
 * Panel de conflictos mostrado cuando el backend rechaza el guardado de una
 * sección. Permite saltar al bloque afectado en la matriz.
 */
export default function PanelConflictosHorario({
  conflictos = [],
  asignaciones = [],
  alSeleccionar,
  alCerrar,
  alDescartar
}) {
  const grupos = useMemo(() => agruparConflictos(conflictos), [conflictos]);
  const asignacionPorId = useMemo(
    () => new Map(asignaciones.map((asignacion) => [String(asignacion.id), asignacion])),
    [asignaciones]
  );

  return (
    <aside
      className={estilos.panel}
      role="region"
      aria-labelledby="horarios-conflictos-titulo"
    >
      <header className={estilos.cabecera}>
        <div>
          <h3 id="horarios-conflictos-titulo" className={estilos.titulo}>
            <Icono nombre="alerta" tamano={18} />
            No se guardó el horario
          </h3>
          <p className={estilos.resumen}>
            {conflictos.length === 1
              ? 'Hay 1 conflicto que impide guardar. Corrige el bloque marcado.'
              : `Hay ${conflictos.length} conflictos que impiden guardar. Corrige los bloques marcados.`}
          </p>
        </div>
        <button
          type="button"
          className={estilos.botonCerrar}
          aria-label="Ocultar conflictos"
          onClick={alCerrar}
        >
          <Icono nombre="cerrar" tamano={18} />
        </button>
      </header>

      <ul className={estilos.lista}>
        {grupos.map(([clave, errores]) => {
          const primero = errores[0];
          const asignacion = asignacionPorId.get(String(primero.asignacionCursoId));
          const dia = etiquetaDia(primero.diaSemana);
          const horario = primero.horaInicio && primero.horaFin
            ? `${horaCorta(primero.horaInicio)}–${horaCorta(primero.horaFin)}`
            : null;
          return (
            <li key={clave} className={estilos.grupo}>
              <button
                type="button"
                className={estilos.botonGrupo}
                onClick={() => alSeleccionar?.({ ...primero, clave: primero.clave ?? null })}
              >
                <span className={estilos.curso}>
                  {asignacion?.cursoNombre ?? 'Bloque sin curso identificado'}
                </span>
                <span className={estilos.meta}>
                  {[dia, horario, ETIQUETA_TIPO[primero.tipo] ?? 'Conflicto']
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </button>
              <ul className={estilos.mensajes}>
                {errores.map((error, posicion) => (
                  <li key={`${clave}-${posicion}`}>{error.mensaje}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className={estilos.acciones}>
        <button type="button" className={estilos.botonSecundario} onClick={alDescartar}>
          Descartar cambios
        </button>
        <button type="button" className={estilos.botonPrimario} onClick={alCerrar}>
          Corregir
        </button>
      </div>
    </aside>
  );
}
