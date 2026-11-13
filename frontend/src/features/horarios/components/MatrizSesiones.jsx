import { useState } from 'react';

import Insignia from '../../../shared/components/Insignia.jsx';
import { DIAS } from '../constants/horarios.js';
import {
  etiquetaEstadoSesion,
  normalizarEstadoSesion,
  tonoEstadoSesion
} from '../utils/estadosSesion.js';
import {
  aMinutos,
  construirEjeTemporal,
  fechaISO,
  formatearFecha,
  sumarDias
} from '../utils/tiempo.js';
import estilos from './MatrizHorario.module.css';

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

function indiceTono(valor) {
  const texto = String(valor ?? '');
  let hash = 0;
  for (let indice = 0; indice < texto.length; indice += 1) {
    hash = (hash * 31 + texto.charCodeAt(indice)) | 0;
  }
  return Math.abs(hash) % CLASES_TONO_CURSO.length;
}

/** Día y mes de una fecha `YYYY-MM-DD`: "02/11". */
function diaYMes(fecha) {
  return `${fecha.slice(8)}/${fecha.slice(5, 7)}`;
}

/** "1er Grado de Secundaria" → "1er Grado"; el nombre completo queda en el title. */
function acortarGrado(grado) {
  return String(grado ?? '')
    .replace(/\s+de\s+(Secundaria|Primaria|Inicial)$/i, '')
    .replace(/\s+(Secundaria|Primaria|Inicial)$/i, '')
    .trim();
}

/**
 * Matriz de solo lectura para las sesiones generadas. Se usa una matriz por
 * semana; las filas se construyen con las horas reales de las sesiones.
 * En pantallas angostas muestra un solo día a la vez, con pestañas por día.
 *
 * @param {Object} props
 * @param {string} props.titulo
 * @param {Array} props.sesiones Sesiones de la semana.
 * @param {boolean} [props.mostrarSeccion] Muestra grado y sección en cada bloque.
 * @param {string} [props.lunes] Fecha `YYYY-MM-DD` del lunes de la semana: pone la fecha en cada columna y
 *   marca la de hoy. Si cambia la semana, quien la usa debe darle otra `key` para reiniciar el día activo.
 */
export default function MatrizSesiones({
  titulo,
  sesiones,
  mostrarSeccion = false,
  lunes,
  alSeleccionarSesion
}) {
  const hoy = fechaISO(new Date());
  const fechaDeDia = (indice) => (lunes ? sumarDias(lunes, indice) : null);
  const [diaActivo, establecerDiaActivo] = useState(() => {
    const dia = DIAS.find((_, indice) => fechaDeDia(indice) === hoy)
      ?? DIAS.find((elemento) => sesiones.some((sesion) => sesion.diaSemana === elemento.id));
    return (dia ?? DIAS[0]).id;
  });
  const claseDia = (diaId) => `${estilos.dia} ${diaId === diaActivo ? estilos.diaActivo : ''}`;

  const eje = construirEjeTemporal(sesiones);
  const claseTono = (sesion) => CLASES_TONO_CURSO[
    indiceTono(sesion.cursoId ?? sesion.cursoNombre)
  ];

  const sesionesDelDia = (diaId) => sesiones.filter((sesion) => sesion.diaSemana === diaId);

  const sesionQueEmpiezaEn = (dia, segmento) => sesionesDelDia(dia)
    .find((sesion) => aMinutos(sesion.horaInicio) === aMinutos(segmento.inicio));

  const sesionCubreSegmento = (dia, segmento) => sesionesDelDia(dia).some((sesion) =>
    aMinutos(sesion.horaInicio) < aMinutos(segmento.inicio)
    && aMinutos(sesion.horaFin) > aMinutos(segmento.inicio)
  );

  function filasQueOcupa(sesion) {
    const inicio = aMinutos(sesion.horaInicio);
    const fin = aMinutos(sesion.horaFin);
    if (inicio === null || fin === null || fin <= inicio) return 1;
    const cantidad = eje.filter((segmento) =>
      aMinutos(segmento.inicio) >= inicio && aMinutos(segmento.fin) <= fin
    ).length;
    return cantidad > 0 ? cantidad : 1;
  }

  return (
    <div className={estilos.envoltorio}>
      <div className={estilos.pestanas} role="group" aria-label="Día de la semana">
        {DIAS.map((dia, indice) => {
          const fecha = fechaDeDia(indice);
          return (
            <button
              key={dia.id}
              type="button"
              className={estilos.pestana}
              aria-pressed={dia.id === diaActivo}
              aria-label={fecha ? `${dia.etiqueta} ${formatearFecha(fecha)}` : dia.etiqueta}
              onClick={() => establecerDiaActivo(dia.id)}
            >
              {dia.etiqueta.slice(0, 3)}{fecha && ` ${fecha.slice(8)}`}
            </button>
          );
        })}
      </div>

      <div className={estilos.contenedor} tabIndex={0} role="region" aria-label={`Matriz de sesiones de ${titulo}`}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col" className={estilos.cabeceraHora}>Hora</th>
              {DIAS.map((dia, indice) => {
                const fecha = fechaDeDia(indice);
                const esHoy = fecha === hoy;
                return (
                  <th
                    key={dia.id}
                    scope="col"
                    className={`${estilos.cabeceraDia} ${claseDia(dia.id)} ${esHoy ? estilos.cabeceraHoy : ''}`}
                    aria-current={esHoy ? 'date' : undefined}
                  >
                    {dia.etiqueta}
                    {fecha && (
                      <span className={estilos.fechaDia}>{esHoy ? `Hoy · ${diaYMes(fecha)}` : diaYMes(fecha)}</span>
                    )}
                  </th>
                );
              })}
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
                  const sesion = sesionQueEmpiezaEn(dia.id, segmento);
                  const cubierto = sesionCubreSegmento(dia.id, segmento);
                  const clave = `${dia.id}|${segmento.inicio}`;

                  if (sesion) {
                    const filas = filasQueOcupa(sesion);
                    const bloqueCorto = filas === 1;
                    const gradoCorto = acortarGrado(sesion.gradoNombre);
                    const etiquetaSeccion = gradoCorto
                      ? `${gradoCorto} · ${sesion.seccionNombre ?? ''}`.trim()
                      : sesion.seccionNombre ? `Sección ${sesion.seccionNombre}` : '';
                    const descripcion = [
                      sesion.gradoNombre,
                      sesion.seccionNombre ? `Sección ${sesion.seccionNombre}` : null,
                      `${String(sesion.horaInicio).slice(0, 5)} – ${String(sesion.horaFin).slice(0, 5)}`,
                      formatearFecha(sesion.fecha)
                    ].filter(Boolean).join(' · ');
                    const estado = normalizarEstadoSesion(sesion.estado);
                    const omitida = estado === 'OMITIDA';
                    const seleccionable = Boolean(alSeleccionarSesion);
                    const contenidoBloque = (
                      <>
                        <span className={`${estilos.curso} ${estilos.cursoSesion}`}>
                          {sesion.cursoNombre}
                        </span>
                        <span className={estilos.detalle}>{sesion.docenteNombre}</span>
                        <span className={estilos.detalle}>{sesion.aulaNombre}</span>
                        {mostrarSeccion && etiquetaSeccion && (
                          <span className={`${estilos.detalle} ${estilos.detalleSeccion}`}>
                            {etiquetaSeccion}
                          </span>
                        )}
                        {!bloqueCorto && (
                          <span className={estilos.detalle}>
                            {String(sesion.horaInicio).slice(0, 5)} – {String(sesion.horaFin).slice(0, 5)}
                          </span>
                        )}
                        {sesion.estado && (
                          <Insignia tono={tonoEstadoSesion(sesion.estado)} className={estilos.estadoSesion}>
                            {etiquetaEstadoSesion(sesion.estado)}
                          </Insignia>
                        )}
                      </>
                    );
                    const clasesBloque = [
                      estilos.bloque,
                      estilos.bloqueSesion,
                      claseTono(sesion),
                      omitida ? estilos.sesionOmitida : '',
                      seleccionable ? estilos.sesionSeleccionable : ''
                    ].filter(Boolean).join(' ');

                    return (
                      <td
                        key={clave}
                        rowSpan={filas}
                        className={`${estilos.celda} ${claseDia(dia.id)}`}
                      >
                        <div className={estilos.envoltura}>
                          {seleccionable ? (
                            <button
                              type="button"
                              className={clasesBloque}
                              title={`${descripcion}. Ver detalle`}
                              aria-label={`Ver detalle de ${sesion.cursoNombre} del ${formatearFecha(sesion.fecha)}`}
                              onClick={() => alSeleccionarSesion(sesion)}
                            >
                              {contenidoBloque}
                            </button>
                          ) : (
                            <div className={clasesBloque} title={descripcion}>
                              {contenidoBloque}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  }

                  if (cubierto) return null;

                  if (segmento.esReceso) {
                    return (
                      <td key={clave} className={`${estilos.celda} ${estilos.recessoCelda} ${claseDia(dia.id)}`} aria-label="Receso">
                        <span className={estilos.recessoTexto}>Receso</span>
                      </td>
                    );
                  }

                  return <td key={clave} className={`${estilos.celda} ${claseDia(dia.id)}`} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
