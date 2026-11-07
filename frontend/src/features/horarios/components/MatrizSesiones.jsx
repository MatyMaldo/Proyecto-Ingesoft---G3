import { DIAS } from '../constants/horarios.js';
import {
  aMinutos,
  construirEjeTemporal,
  formatearFecha
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

const ETIQUETAS_ESTADO = {
  PROGRAMADA: 'Programada',
  REALIZADA: 'Realizada',
  COMPLETADA: 'Completada',
  DICTADA: 'Dictada',
  EN_CURSO: 'En curso',
  CANCELADA: 'Cancelada',
  SUSPENDIDA: 'Suspendida',
  OMITIDA: 'Omitida'
};

function etiquetaEstado(estado) {
  const normalizado = String(estado ?? '').toUpperCase();
  if (ETIQUETAS_ESTADO[normalizado]) return ETIQUETAS_ESTADO[normalizado];
  return normalizado
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letra) => letra.toUpperCase());
}

function claseEstado(estado) {
  const normalizado = String(estado ?? '').toUpperCase();
  if (normalizado === 'CANCELADA' || normalizado === 'SUSPENDIDA') {
    return estilos.estadoCancelada;
  }
  if (normalizado === 'OMITIDA') return estilos.estadoOmitida;
  if (['REALIZADA', 'COMPLETADA', 'DICTADA'].includes(normalizado)) {
    return estilos.estadoRealizada;
  }
  if (normalizado === 'PROGRAMADA' || normalizado === 'EN_CURSO') {
    return estilos.estadoProgramada;
  }
  return estilos.estadoNeutro;
}

/**
 * Matriz de solo lectura para las sesiones generadas. Se usa una matriz por
 * semana; las filas se construyen con las horas reales de las sesiones.
 */
export default function MatrizSesiones({ titulo, sesiones, mostrarSeccion = false }) {
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
      <div className={estilos.contenedor} tabIndex={0} role="region" aria-label={`Matriz de sesiones de ${titulo}`}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col" className={estilos.cabeceraHora}>Hora</th>
              {DIAS.map((dia) => (
                <th key={dia.id} scope="col" className={estilos.cabeceraDia}>
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
                  const sesion = sesionQueEmpiezaEn(dia.id, segmento);
                  const cubierto = sesionCubreSegmento(dia.id, segmento);
                  const clave = `${dia.id}|${segmento.inicio}`;

                  if (sesion) {
                    return (
                      <td
                        key={clave}
                        rowSpan={filasQueOcupa(sesion)}
                        className={estilos.celda}
                      >
                        <div className={estilos.envoltura}>
                          <div className={`${estilos.bloque} ${claseTono(sesion)}`}>
                            <span className={estilos.curso}>{sesion.cursoNombre}</span>
                            <span className={estilos.detalle}>{sesion.docenteNombre}</span>
                            <span className={estilos.detalle}>{sesion.aulaNombre}</span>
                            {mostrarSeccion && (
                              <span className={estilos.detalle}>
                                {sesion.gradoNombre} {sesion.seccionNombre}
                              </span>
                            )}
                            <span className={estilos.detalle}>
                              {String(sesion.horaInicio).slice(0, 5)} – {String(sesion.horaFin).slice(0, 5)}
                            </span>
                            <span className={estilos.detalle}>
                              {formatearFecha(sesion.fecha)}
                            </span>
                            {sesion.estado && (
                              <span className={`${estilos.estadoSesion} ${claseEstado(sesion.estado)}`}>
                                {etiquetaEstado(sesion.estado)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  }

                  if (cubierto) return null;

                  if (segmento.esReceso) {
                    return (
                      <td key={clave} className={`${estilos.celda} ${estilos.recessoCelda}`} aria-label="Receso">
                        <span className={estilos.recessoTexto}>Receso</span>
                      </td>
                    );
                  }

                  return <td key={clave} className={estilos.celda} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
