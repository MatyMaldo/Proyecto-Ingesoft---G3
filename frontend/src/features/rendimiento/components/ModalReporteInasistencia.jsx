import { useEffect, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFecha } from '../../horarios/utils/tiempo.js';
import { obtenerDetalleReporte } from '../services/rendimientoService.js';
import estilos from './ModalReporteInasistencia.module.css';

const evitarEnvio = (evento) => evento.preventDefault();
const textoOGuion = (valor) => (valor ? valor : '—');

const TIPOS_FALTA = {
  FALTA: { etiqueta: 'Falta', tono: 'rojo' },
  TARDANZA: { etiqueta: 'Tardanza', tono: 'ambar' },
  JUSTIFICADA: { etiqueta: 'Justificada', tono: 'azul' }
};

function InsigniaTipo({ estado }) {
  const clave = String(estado ?? '').toUpperCase();
  const tipo = TIPOS_FALTA[clave] ?? { etiqueta: textoOGuion(estado), tono: 'gris' };
  return <Insignia tono={tipo.tono}>{tipo.etiqueta}</Insignia>;
}

/**
 * Detalle de un reporte de inasistencia del estudiante: datos generales, faltas cometidas y comentarios del docente.
 *
 * @param {Object} props
 * @param {number|string} props.reporteId
 * @param {Object|null} [props.detalleInicial] Detalle ya cargado (evita una segunda llamada).
 * @param {string} [props.nombreAlumno] Nombre a mostrar si el reporte no lo trae.
 * @param {number|string|null} [props.estudianteId] Solo para el apoderado: estudiante dueño del reporte.
 * @param {() => void} props.onCerrar
 */
export default function ModalReporteInasistencia({
  reporteId,
  estudianteId = null,
  detalleInicial = null,
  nombreAlumno = '',
  onCerrar
}) {
  const [reporte, establecerReporte] = useState(detalleInicial);
  const [estado, establecerEstado] = useState(detalleInicial ? 'listo' : 'cargando');
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);

  useEffect(() => {
    if (detalleInicial && intento === 0) return undefined;
    let activo = true;
    establecerEstado('cargando');
    establecerError('');

    obtenerDetalleReporte(reporteId, estudianteId).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudo cargar el detalle del reporte.');
        establecerEstado('error');
        return;
      }
      establecerReporte(respuesta.datos);
      establecerEstado('listo');
    });

    return () => { activo = false; };
    // detalleInicial solo se usa en la primera apertura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reporteId, estudianteId, intento]);

  const datosEstudiante = reporte ? [
    ['Alumno', reporte.estudiante || nombreAlumno],
    ['Grado', reporte.grado],
    ['Sección', reporte.seccion],
    ['Fecha de emisión', formatearFecha(reporte.fechaEmision)],
    ['Profesor', reporte.docente],
    ['Curso', reporte.curso]
  ] : [];

  return (
    <DialogoBase
      idTitulo="dialogo-reporte-inasistencia"
      titulo="Reporte de Inasistencia"
      subtitulo="Colegio San Marcos"
      textoCancelar="Cerrar"
      sinConfirmar
      anchoMaximo="42rem"
      alCancelar={onCerrar}
      alConfirmar={evitarEnvio}
    >
      {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}
      {estado === 'error' && (
        <EstadoConsulta
          tipo="error"
          mensaje={error}
          alReintentar={() => establecerIntento((actual) => actual + 1)}
        />
      )}

      {estado === 'listo' && reporte && (
        <>
          <section className={estilos.tarjetaInfo} aria-labelledby="reporte-info-estudiante">
            <h3 id="reporte-info-estudiante" className={estilos.subtituloSeccion}>Información del estudiante</h3>
            <dl className={estilos.grillaDatos}>
              {datosEstudiante.map(([etiqueta, valor]) => (
                <div key={etiqueta} className={estilos.dato}>
                  <dt>{etiqueta}</dt>
                  <dd>{textoOGuion(valor)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="reporte-faltas">
            <h3 id="reporte-faltas" className={`${estilos.subtituloSeccion} ${estilos.subtituloFaltas}`}>
              <Icono nombre="alerta-circulo" tamano={16} />
              Faltas cometidas ({reporte.faltas.length})
            </h3>
            {reporte.faltas.length === 0 ? (
              <p className={estilos.sinFaltas}>El reporte no tiene faltas registradas.</p>
            ) : (
              <div className={estilos.marcoTabla}>
                <table className={estilos.tabla}>
                  <thead>
                    <tr>
                      <th scope="col">Fecha</th>
                      <th scope="col">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.faltas.map((falta, indice) => (
                      <tr key={`${falta.fecha}-${falta.horaInicio ?? indice}`}>
                        <td>
                          {textoOGuion(formatearFecha(falta.fecha))}
                          {falta.observaciones && (
                            <span className={estilos.observacion}>{falta.observaciones}</span>
                          )}
                        </td>
                        <td><InsigniaTipo estado={falta.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={estilos.tarjetaComentarios} aria-labelledby="reporte-comentarios">
            <h3 id="reporte-comentarios" className={`${estilos.subtituloSeccion} ${estilos.subtituloComentarios}`}>
              <Icono nombre="mensaje" tamano={16} />
              Comentarios del docente
            </h3>
            <p className={estilos.comentario}>
              {reporte.comentarios ? `"${reporte.comentarios}"` : 'Sin comentarios.'}
            </p>
          </section>
        </>
      )}
    </DialogoBase>
  );
}
