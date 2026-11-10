import { useEffect, useMemo, useRef, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { DIAS } from '../constants/horarios.js';
import {
  aMinutos,
  bloqueCruzaReceso,
  construirEjeTemporal,
  finSugerido,
  seSolapan
} from '../utils/tiempo.js';
import estilos from './MatrizHorario.module.css';

/** Tonos neutros de módulo (verde, ámbar y rojo quedan reservados para estados de negocio). */
const CLASES_TONO_CURSO = [
  estilos.tonoMarino,
  estilos.tonoAcero,
  estilos.tonoCiruela,
  estilos.tonoTurquesa,
  estilos.tonoIndigo,
  estilos.tonoCian,
  estilos.tonoRosa,
  estilos.tonoVioleta
];

const ETIQUETA_CONFLICTO = {
  CONFLICTO_DOCENTE: 'Choque de docente',
  CONFLICTO_SECCION: 'Choque de sección',
  CONFLICTO_AULA: 'Choque de aula',
  DUPLICADO: 'Duplicado',
  HORARIO_INVALIDO: 'Horario inválido',
  REFERENCIA_INVALIDA: 'Dato inválido'
};

function indiceTono(valor) {
  const texto = String(valor ?? '');
  let hash = 0;
  for (let indice = 0; indice < texto.length; indice += 1) {
    hash = (hash * 31 + texto.charCodeAt(indice)) | 0;
  }
  return Math.abs(hash) % CLASES_TONO_CURSO.length;
}

function mismoBloque(a, b) {
  if (!a || !b) return false;
  return String(a.dia) === String(b.dia)
    && String(a.horaInicio).slice(0, 5) === String(b.horaInicio).slice(0, 5)
    && String(a.horaFin).slice(0, 5) === String(b.horaFin).slice(0, 5)
    && String(a.asignacionId) === String(b.asignacionId)
    && String(a.aulaId) === String(b.aulaId);
}

/**
 * Matriz semanal con filas dinámicas según las horas reales de los bloques.
 * Soporta bloques de una o varias horas y marca el recreo de 11:00 a 11:30.
 */
export default function MatrizHorario({
  titulo,
  bloques,
  bloquesGuardados,
  asignaciones,
  aulas,
  ocupaciones,
  conflictos = [],
  bloqueResaltado = null,
  versionResaltado = 0,
  deshabilitada,
  soloLectura = false,
  alElegirBloque,
  alQuitarBloque,
  alMoverBloque
}) {
  const [diaActivo, establecerDiaActivo] = useState(DIAS[0].id);
  const [origenArrastre, establecerOrigenArrastre] = useState(null);
  const [claveSobre, establecerClaveSobre] = useState(null);
  const refsBloques = useRef(new Map());

  const puedeEditar = !deshabilitada && !soloLectura;
  const listaBloques = Object.entries(bloques).map(([clave, bloque]) => ({ ...bloque, clave }));
  const eje = construirEjeTemporal(listaBloques);
  const asignacionPorId = new Map(
    asignaciones.map((asignacion) => [String(asignacion.id), asignacion])
  );
  const aulaPorId = new Map(aulas.map((aula) => [String(aula.id), aula.nombre]));
  const claseTono = (cursoId) => CLASES_TONO_CURSO[indiceTono(cursoId)];

  // Errores del guardado agrupados por bloque. `claveConflicto` permite marcar
  // también el otro bloque cuando el choque es interno del payload.
  const conflictosPorClave = useMemo(() => {
    const mapa = new Map();
    (conflictos ?? []).forEach((conflicto) => {
      if (conflicto.clave) {
        if (!mapa.has(conflicto.clave)) mapa.set(conflicto.clave, []);
        mapa.get(conflicto.clave).push(conflicto);
      }
      if (conflicto.claveConflicto && conflicto.claveConflicto !== conflicto.clave) {
        if (!mapa.has(conflicto.claveConflicto)) mapa.set(conflicto.claveConflicto, []);
        mapa.get(conflicto.claveConflicto).push({ ...conflicto, relacionado: true });
      }
    });
    return mapa;
  }, [conflictos]);

  useEffect(() => {
    if (!bloqueResaltado) return;
    const bloque = bloques[bloqueResaltado];
    if (bloque?.dia) establecerDiaActivo(bloque.dia);
    refsBloques.current.get(bloqueResaltado)?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'center'
    });
  }, [bloqueResaltado, versionResaltado, bloques]);

  const claseDia = (diaId) =>
    `${estilos.dia} ${diaId === diaActivo ? estilos.diaActivo : ''}`;

  const bloquesDelDia = (diaId) => listaBloques.filter((bloque) => bloque.dia === diaId);

  const propsDestino = (dia, horaInicio) => {
    if (!puedeEditar) return {};
    return {
      onDragOver: (evento) => {
        if (origenArrastre) {
          evento.preventDefault();
          establecerClaveSobre(`${dia}|${horaInicio}`);
        }
      },
      onDragLeave: () => establecerClaveSobre((actual) =>
        actual === `${dia}|${horaInicio}` ? null : actual
      ),
      onDrop: (evento) => {
        evento.preventDefault();
        if (origenArrastre) {
          alMoverBloque(origenArrastre, { dia, horaInicio });
        }
        establecerOrigenArrastre(null);
        establecerClaveSobre(null);
      }
    };
  };

  function bloqueQueEmpiezaEn(dia, segmento) {
    return bloquesDelDia(dia).find(
      (bloque) => aMinutos(bloque.horaInicio) === aMinutos(segmento.inicio)
    );
  }

  function bloqueCubreSegmento(dia, segmento) {
    return bloquesDelDia(dia).some((bloque) =>
      aMinutos(bloque.horaInicio) < aMinutos(segmento.inicio)
      && aMinutos(bloque.horaFin) > aMinutos(segmento.inicio)
    );
  }

  function filasQueOcupa(bloque) {
    const inicio = aMinutos(bloque.horaInicio);
    const fin = aMinutos(bloque.horaFin);
    if (inicio === null || fin === null || fin <= inicio) return 1;
    const cantidad = eje.filter((segmento) =>
      aMinutos(segmento.inicio) >= inicio && aMinutos(segmento.fin) <= fin
    ).length;
    return cantidad > 0 ? cantidad : 1;
  }

  return (
    <div className={estilos.envoltorio}>
      <div className={estilos.pestanas} role="group" aria-label="Día de la semana">
        {DIAS.map((dia) => (
          <button
            key={dia.id}
            type="button"
            className={estilos.pestana}
            aria-pressed={dia.id === diaActivo}
            onClick={() => establecerDiaActivo(dia.id)}
          >
            {dia.etiqueta}
          </button>
        ))}
      </div>

      <div className={estilos.contenedor} tabIndex={0} role="region" aria-label={`Matriz de horarios de ${titulo}`}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col" className={estilos.cabeceraHora}>Hora</th>
              {DIAS.map((dia) => (
                <th key={dia.id} scope="col" className={`${estilos.cabeceraDia} ${claseDia(dia.id)}`}>
                  {dia.etiqueta}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eje.map((segmento) => (
              <tr key={segmento.inicio}>
                <th scope="row" className={estilos.hora}>
                  <span className={estilos.horaRango}>{segmento.inicio} – {segmento.fin}</span>
                  {segmento.esReceso && <span className={estilos.etiquetaReceso}>Receso</span>}
                </th>
                {DIAS.map((dia) => {
                  const bloque = bloqueQueEmpiezaEn(dia.id, segmento);
                  const cubierto = bloqueCubreSegmento(dia.id, segmento);
                  const clave = bloque?.clave;
                  const claveCelda = `${dia.id}|${segmento.inicio}`;
                  const props = propsDestino(dia.id, segmento.inicio);

                  if (bloque) {
                    const asignacion = asignacionPorId.get(String(bloque.asignacionId));
                    const cambiado = !mismoBloque(bloque, bloquesGuardados[clave]);
                    const erroresBloque = conflictosPorClave.get(clave) ?? [];
                    const mensajesConflicto = erroresBloque
                      .map((error) => error.mensaje)
                      .filter(Boolean);
                    const resaltado = clave === bloqueResaltado;
                    const enEstaHora = ocupaciones.filter((ocupacion) =>
                      ocupacion.dia === dia.id
                      && seSolapan(segmento.inicio, segmento.fin, ocupacion.horaInicio, ocupacion.horaFin)
                    );
                    const choqueDocente = enEstaHora.find(
                      (ocupacion) => String(ocupacion.docenteId) === String(asignacion?.docenteId)
                    );
                    const choqueAula = enEstaHora.find(
                      (ocupacion) => String(ocupacion.aulaId) === String(bloque.aulaId)
                    );
                    const choque = choqueDocente ?? choqueAula;
                    const textoChoque = choqueDocente
                      ? `Docente ocupado en ${choqueDocente.seccionNombre}`
                      : choqueAula
                        ? `Aula ocupada en ${choqueAula.seccionNombre}`
                        : '';
                    const clases = [
                      estilos.bloque,
                      claseTono(asignacion?.cursoId),
                      choque ? estilos.choque : '',
                      cambiado ? estilos.cambiado : '',
                      erroresBloque.length > 0 ? estilos.conflicto : '',
                      resaltado ? estilos.conflictoResaltado : '',
                      bloqueCruzaReceso(bloque) ? estilos.choque : ''
                    ].join(' ');

                    return (
                      <td
                        key={claveCelda}
                        rowSpan={filasQueOcupa(bloque)}
                        className={`${estilos.celda} ${claseDia(dia.id)} ${claveSobre === claveCelda ? estilos.destino : ''}`}
                        {...props}
                      >
                        <div className={estilos.envoltura}>
                          <button
                            ref={(elemento) => {
                              if (elemento) refsBloques.current.set(clave, elemento);
                              else refsBloques.current.delete(clave);
                            }}
                            type="button"
                            className={clases}
                            draggable={puedeEditar}
                            title={[
                              `${asignacion?.cursoNombre ?? ''} · ${aulaPorId.get(String(bloque.aulaId)) ?? bloque.aulaId} · ${asignacion?.docenteNombre ?? ''}`,
                              ...mensajesConflicto
                            ].filter(Boolean).join('\n')}
                            onDragStart={(evento) => {
                              if (!puedeEditar) return;
                              evento.dataTransfer.effectAllowed = 'move';
                              establecerOrigenArrastre(clave);
                            }}
                            onDragEnd={() => {
                              establecerOrigenArrastre(null);
                              establecerClaveSobre(null);
                            }}
                            aria-label={`Editar ${dia.etiqueta} ${bloque.horaInicio} a ${bloque.horaFin}: ${asignacion?.cursoNombre ?? ''}${
                              cambiado ? ' (sin guardar)' : ''
                            }${choque ? `. ${textoChoque}` : ''}${
                              mensajesConflicto.length > 0
                                ? `. Conflictos: ${mensajesConflicto.join(' ')}`
                                : ''
                            }`}
                            onClick={() => {
                              if (!puedeEditar) return;
                              alElegirBloque({
                                clave,
                                dia: dia.id,
                                horaInicio: bloque.horaInicio,
                                horaFin: bloque.horaFin,
                                bloque
                              });
                            }}
                          >
                            <span className={estilos.curso}>{asignacion?.cursoNombre ?? 'Curso'}</span>
                            <span className={estilos.detalle}>
                              {aulaPorId.get(String(bloque.aulaId)) ?? bloque.aulaId}
                            </span>
                            <span className={estilos.detalle}>
                              <Icono nombre="usuario" tamano={12} />
                              {asignacion?.docenteNombre ?? ''}
                            </span>
                            <span className={estilos.detalle}>
                              {bloque.horaInicio} – {bloque.horaFin}
                            </span>
                            {choque && (
                              <span className={estilos.avisoChoque}>
                                <Icono nombre="alerta" tamano={12} />
                                {textoChoque}
                              </span>
                            )}
                            {erroresBloque.length > 0 && (
                              <span className={estilos.etiquetaConflicto}>
                                <Icono nombre="alerta" tamano={12} />
                                {ETIQUETA_CONFLICTO[erroresBloque[0].tipo] ?? 'Conflicto'}
                                {erroresBloque.length > 1
                                  ? ` (+${erroresBloque.length - 1})`
                                  : ''}
                              </span>
                            )}
                          </button>
                          {puedeEditar && (
                            <button
                              type="button"
                              className={estilos.botonQuitar}
                              aria-label={`Quitar ${asignacion?.cursoNombre ?? 'bloque'} de ${dia.etiqueta} ${bloque.horaInicio}`}
                              onClick={() => alQuitarBloque(clave)}
                            >
                              <Icono nombre="papelera" tamano={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  }

                  if (cubierto) return null;

                  if (segmento.esReceso) {
                    return (
                      <td
                        key={claveCelda}
                        className={`${estilos.celda} ${estilos.recessoCelda} ${claseDia(dia.id)}`}
                        aria-label="Receso"
                      >
                        <span className={estilos.recessoTexto}>Receso</span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={claveCelda}
                      className={`${estilos.celda} ${claseDia(dia.id)} ${claveSobre === claveCelda ? estilos.destino : ''}`}
                      {...props}
                    >
                      <button
                        type="button"
                        className={estilos.vacio}
                        disabled={!puedeEditar}
                        aria-label={`Asignar ${dia.etiqueta} ${segmento.inicio}`}
                        onClick={() => alElegirBloque({
                          clave: null,
                          dia: dia.id,
                          horaInicio: segmento.inicio,
                          horaFin: finSugerido(segmento.inicio, segmento.fin)
                        })}
                      >
                        <Icono nombre="agregar" tamano={18} />
                        Asignar
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
