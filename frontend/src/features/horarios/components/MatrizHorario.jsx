import { useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { DIAS, FRANJAS, claveBloque } from '../constants/horarios.js';
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

/**
 * Matriz semanal: días en columnas, bloques horarios en filas (EAC-16). Cada celda muestra curso,
 * aula y docente; las vacías ofrecen "Asignar". Cada curso tiene su propio tono, los bloques sin
 * guardar se marcan y un docente o aula ocupados en otra sección a la misma hora se señalan en rojo.
 * Los bloques se pueden arrastrar a otra celda (si está ocupada, se intercambian). En pantallas
 * angostas se muestra un día a la vez, con pestañas.
 *
 * @param {Object} props
 * @param {string} props.titulo Por ejemplo "4to Secundaria B".
 * @param {Object<string, { asignacionId: string, aulaId: string }>} props.bloques Borrador actual.
 * @param {Object<string, { asignacionId: string, aulaId: string }>} props.bloquesGuardados
 * @param {Array<Object>} props.asignaciones
 * @param {Array<{ id: string, nombre: string }>} props.aulas
 * @param {Array<{ dia: string, franjaId: string, docenteId: string, aulaId: string, seccionNombre: string }>} props.ocupaciones
 *   Bloques de las demás secciones.
 * @param {boolean} props.deshabilitada Sin relaciones curso-docente no se puede asignar nada.
 * @param {(dia: string, franjaId: string) => void} props.alElegirBloque
 * @param {(dia: string, franjaId: string) => void} props.alQuitarBloque
 * @param {(origen: { dia: string, franjaId: string }, destino: { dia: string, franjaId: string }) => void} props.alMoverBloque
 */
export default function MatrizHorario({
  titulo,
  bloques,
  bloquesGuardados,
  asignaciones,
  aulas,
  ocupaciones,
  deshabilitada,
  alElegirBloque,
  alQuitarBloque,
  alMoverBloque
}) {
  const [diaActivo, establecerDiaActivo] = useState(DIAS[0].id);
  const [origenArrastre, establecerOrigenArrastre] = useState(null);
  const [claveSobre, establecerClaveSobre] = useState(null);

  const asignacionPorId = new Map(asignaciones.map((asignacion) => [asignacion.id, asignacion]));
  const aulaPorId = new Map(aulas.map((aula) => [aula.id, aula.nombre]));
  const cursosOrdenados = [...new Set(asignaciones.map((asignacion) => asignacion.cursoId))].sort();
  const claseTono = (cursoId) =>
    CLASES_TONO_CURSO[cursosOrdenados.indexOf(cursoId) % CLASES_TONO_CURSO.length];

  const claseDia = (diaId) =>
    `${estilos.dia} ${diaId === diaActivo ? estilos.diaActivo : ''}`;

  /** Eventos de una celda como destino de un bloque arrastrado. */
  const propsDestino = (dia, franjaId) => {
    const clave = claveBloque(dia, franjaId);
    return {
      onDragOver: (evento) => {
        if (origenArrastre) {
          evento.preventDefault();
          establecerClaveSobre(clave);
        }
      },
      onDragLeave: () => establecerClaveSobre((actual) => (actual === clave ? null : actual)),
      onDrop: (evento) => {
        evento.preventDefault();
        if (origenArrastre) {
          alMoverBloque(origenArrastre, { dia, franjaId });
        }
        establecerOrigenArrastre(null);
        establecerClaveSobre(null);
      }
    };
  };

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
            {FRANJAS.map((franja) =>
              franja.tipo === 'recreo' ? (
                <tr key={franja.id}>
                  <th scope="row" className={estilos.hora}>
                    <span className={estilos.horaRango}>{franja.inicio} – {franja.fin}</span>
                  </th>
                  <td colSpan={DIAS.length} className={estilos.recreo}>
                    Recreo
                  </td>
                </tr>
              ) : (
                <tr key={franja.id}>
                  <th scope="row" className={estilos.hora}>
                    <span className={estilos.horaRango}>{franja.inicio} – {franja.fin}</span>
                  </th>
                  {DIAS.map((dia) => {
                    const clave = claveBloque(dia.id, franja.id);
                    const bloque = bloques[clave];
                    const guardado = bloquesGuardados[clave];
                    const asignacion = bloque ? asignacionPorId.get(bloque.asignacionId) : null;
                    const cambiado =
                      bloque?.asignacionId !== guardado?.asignacionId || bloque?.aulaId !== guardado?.aulaId;
                    const etiquetaCelda = `${dia.etiqueta} ${franja.inicio}`;

                    if (asignacion) {
                      const enEstaHora = ocupaciones.filter(
                        (ocupacion) => ocupacion.dia === dia.id && ocupacion.franjaId === franja.id
                      );
                      const choqueDocente = enEstaHora.find((o) => o.docenteId === asignacion.docenteId);
                      const choqueAula = enEstaHora.find((o) => o.aulaId === bloque.aulaId);
                      const choque = choqueDocente ?? choqueAula;
                      const textoChoque = choqueDocente
                        ? `Docente ocupado en ${choqueDocente.seccionNombre}`
                        : choqueAula
                          ? `Aula ocupada en ${choqueAula.seccionNombre}`
                          : '';
                      const clases = [
                        estilos.bloque,
                        claseTono(asignacion.cursoId),
                        choque ? estilos.choque : '',
                        cambiado ? estilos.cambiado : ''
                      ].join(' ');

                      return (
                        <td
                          key={dia.id}
                          className={`${estilos.celda} ${claseDia(dia.id)} ${clave === claveSobre ? estilos.destino : ''}`}
                          {...propsDestino(dia.id, franja.id)}
                        >
                          <div className={estilos.envoltura}>
                            <button
                              type="button"
                              className={clases}
                              draggable
                              title={`${asignacion.cursoNombre} · ${aulaPorId.get(bloque.aulaId) ?? bloque.aulaId} · ${asignacion.docenteNombre}`}
                              onDragStart={(evento) => {
                                evento.dataTransfer.effectAllowed = 'move';
                                establecerOrigenArrastre({ dia: dia.id, franjaId: franja.id });
                              }}
                              onDragEnd={() => {
                                establecerOrigenArrastre(null);
                                establecerClaveSobre(null);
                              }}
                              aria-label={`Editar ${etiquetaCelda}: ${asignacion.cursoNombre}${
                                cambiado ? ' (sin guardar)' : ''
                              }${choque ? `. ${textoChoque}` : ''}`}
                              onClick={() => alElegirBloque(dia.id, franja.id)}
                            >
                              <span className={estilos.curso}>{asignacion.cursoNombre}</span>
                              <span className={estilos.detalle}>{aulaPorId.get(bloque.aulaId) ?? bloque.aulaId}</span>
                              <span className={estilos.detalle}>
                                <Icono nombre="usuario" tamano={12} />
                                {asignacion.docenteNombre}
                              </span>
                              {choque && (
                                <span className={estilos.avisoChoque}>
                                  <Icono nombre="alerta" tamano={12} />
                                  {textoChoque}
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              className={estilos.botonQuitar}
                              aria-label={`Quitar ${asignacion.cursoNombre} de ${etiquetaCelda}`}
                              onClick={() => alQuitarBloque(dia.id, franja.id)}
                            >
                              <Icono nombre="papelera" tamano={14} />
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={dia.id}
                        className={`${estilos.celda} ${claseDia(dia.id)} ${clave === claveSobre ? estilos.destino : ''}`}
                        {...propsDestino(dia.id, franja.id)}
                      >
                        <button
                          type="button"
                          className={estilos.vacio}
                          disabled={deshabilitada}
                          aria-label={`Asignar ${etiquetaCelda}`}
                          onClick={() => alElegirBloque(dia.id, franja.id)}
                        >
                          <Icono nombre="agregar" tamano={18} />
                          Asignar
                        </button>
                      </td>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
