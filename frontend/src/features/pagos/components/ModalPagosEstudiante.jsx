import { useEffect, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import {
  listarPagosAgrupados,
  obtenerPeriodoMatricula,
  rechazarPagoAdmin,
  validarPagoAdmin
} from '../services/pagosService.js';
import {
  etiquetaCompromiso,
  etiquetaEstadoCompromiso,
  etiquetaEstadoPago,
  formatearMonto,
  tonoEstadoCompromiso,
  tonoEstadoPago
} from '../utils/formatoPago.js';
import { anioEstaVigente } from '../utils/periodo.js';
import ModalDetallePago from './ModalDetallePago.jsx';
import ModalRechazarPago from './ModalRechazarPago.jsx';
import estilos from './ModalPagos.module.css';

const TAMANIO_PAGINA = 10;
const evitarEnvio = (evento) => evento.preventDefault();

/**
 * Compromisos y pagos de un estudiante, con las acciones del administrador: validar, rechazar y ver el detalle de
 * cada pago.
 *
 * @param {Object} props
 * @param {Object} props.alumno Alumno con su año, grado y sección.
 * @param {Object} [props.anio] Año académico elegido en la pantalla (para saber si está vigente).
 * @param {() => void} props.onCerrar
 * @param {(mensaje: string, error?: boolean) => void} [props.alNotificar] Avisa del resultado en la notificación de
 *   la página, que sigue visible aunque este diálogo se cierre.
 */
export default function ModalPagosEstudiante({ alumno, anio, onCerrar, alNotificar }) {
  const [compromisos, establecerCompromisos] = useState([]);
  const [pagina, establecerPagina] = useState(0);
  const [totalElementos, establecerTotalElementos] = useState(0);
  const [totalPaginas, establecerTotalPaginas] = useState(0);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);
  const [detalleId, establecerDetalleId] = useState(null);
  const [pagoARechazar, establecerPagoARechazar] = useState(null);
  const [accionId, establecerAccionId] = useState(null);
  const [rechazando, establecerRechazando] = useState(false);
  const [aviso, establecerAviso] = useState(null);
  const [errorRechazo, establecerErrorRechazo] = useState('');
  const [periodoMatricula, establecerPeriodoMatricula] = useState(null);
  const [estadoPeriodo, establecerEstadoPeriodo] = useState('inactivo');
  const [errorPeriodo, establecerErrorPeriodo] = useState('');

  const tieneContexto = Boolean(
    alumno?.anioAcademicoId && alumno?.gradoId && alumno?.seccionId
  );

  useEffect(() => {
    const anioId = alumno?.anioAcademicoId;
    if (!anioId) {
      establecerPeriodoMatricula(null);
      establecerEstadoPeriodo('inactivo');
      establecerErrorPeriodo('');
      return undefined;
    }

    let activo = true;
    establecerEstadoPeriodo('cargando');
    establecerErrorPeriodo('');

    obtenerPeriodoMatricula(anioId).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !respuesta.datos) {
        establecerPeriodoMatricula(null);
        establecerErrorPeriodo(
          respuesta.mensaje || 'No se pudo verificar el período de matrícula.'
        );
        establecerEstadoPeriodo('error');
        return;
      }
      establecerPeriodoMatricula(respuesta.datos);
      establecerEstadoPeriodo('listo');
    });

    return () => { activo = false; };
  }, [alumno?.anioAcademicoId]);

  const permiteAcciones = (compromiso) => {
    if (compromiso?.tipoCompromiso === 'MATRICULA') {
      if (estadoPeriodo === 'cargando') return false;
      if (estadoPeriodo === 'listo') return periodoMatricula?.estado === 'VIGENTE';
      return true;
    }
    return anioEstaVigente(anio) !== false;
  };

  const motivoBloqueo = (compromiso) => {
    if (compromiso?.tipoCompromiso === 'MATRICULA') {
      if (estadoPeriodo === 'cargando') return 'Verificando el período de matrícula…';
      if (periodoMatricula?.estado === 'FINALIZADO') {
        return 'El período de matrícula finalizó; no se pueden modificar pagos de matrícula.';
      }
      if (periodoMatricula?.estado === 'SIN_INICIAR') {
        return 'El período de matrícula aún no inicia; no se pueden modificar pagos de matrícula.';
      }
      if (estadoPeriodo === 'error') return errorPeriodo;
      return '';
    }
    if (anioEstaVigente(anio) === false) {
      return 'El año académico no está vigente; no se pueden modificar pagos de pensión.';
    }
    return '';
  };

  useEffect(() => {
    if (!tieneContexto) {
      establecerError('El alumno no tiene una matrícula confirmada con grado y sección.');
      establecerEstado('error');
      return undefined;
    }

    let activo = true;
    establecerEstado('cargando');
    establecerError('');

    listarPagosAgrupados({
      anioAcademicoId: alumno.anioAcademicoId,
      gradoId: alumno.gradoId,
      seccionId: alumno.seccionId,
      estudianteId: alumno.id,
      page: pagina,
      size: TAMANIO_PAGINA
    }).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudieron cargar los pagos del estudiante.');
        establecerEstado('error');
        return;
      }
      establecerCompromisos(respuesta.datos.content);
      establecerTotalElementos(respuesta.datos.totalElements);
      establecerTotalPaginas(respuesta.datos.totalPages);
      establecerEstado('listo');
    });

    return () => { activo = false; };
  }, [alumno, pagina, intento, tieneContexto]);

  const confirmarValidacion = async (pago) => {
    establecerAccionId(pago.id);
    establecerAviso(null);
    const respuesta = await validarPagoAdmin(pago.id);
    establecerAccionId(null);
    if (!respuesta.exitoso) {
      const mensaje = respuesta.mensaje || 'No se pudo validar el pago.';
      establecerAviso({ texto: mensaje, error: true });
      alNotificar?.(mensaje, true);
      return;
    }
    establecerAviso({ texto: `Pago #${pago.id} validado correctamente.`, error: false });
    alNotificar?.(`Pago #${pago.id} validado correctamente.`);
    establecerIntento((actual) => actual + 1);
  };

  const confirmarRechazo = async (motivo) => {
    if (!pagoARechazar) return;
    establecerRechazando(true);
    establecerErrorRechazo('');
    const respuesta = await rechazarPagoAdmin(pagoARechazar.id, motivo);
    establecerRechazando(false);
    if (!respuesta.exitoso) {
      const mensaje = respuesta.mensaje || 'No se pudo rechazar el pago.';
      establecerErrorRechazo(mensaje);
      alNotificar?.(mensaje, true);
      return;
    }
    establecerAviso({ texto: `Pago #${pagoARechazar.id} rechazado.`, error: false });
    alNotificar?.(`Pago #${pagoARechazar.id} rechazado.`);
    establecerPagoARechazar(null);
    establecerErrorRechazo('');
    establecerIntento((actual) => actual + 1);
  };

  const meta = [alumno?.gradoNombre, alumno?.seccionNombre, alumno?.anioAcademico]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <DialogoBase
        idTitulo="dialogo-pagos-estudiante"
        titulo={alumno?.nombre ?? 'Pagos'}
        subtitulo={meta ? `Pagos del estudiante · ${meta}` : 'Pagos del estudiante'}
        textoConfirmar=""
        textoEnviando=""
        textoCancelar="Cerrar"
        sinConfirmar
        anchoMaximo="64rem"
        botonesExpandidos
        alCancelar={onCerrar}
        alConfirmar={evitarEnvio}
      >
        {aviso && (
          <p className={aviso.error ? estilos.avisoError : estilos.avisoOk} role="status">
            {aviso.texto}
          </p>
        )}

        {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}
        {estado === 'error' && (
          <EstadoConsulta
            tipo="error"
            mensaje={error}
            alReintentar={tieneContexto ? () => establecerIntento((actual) => actual + 1) : undefined}
          />
        )}
        {estado === 'listo' && compromisos.length === 0 && (
          <EstadoConsulta
            tipo="vacio"
            mensaje="No hay compromisos de pago registrados para este estudiante."
          />
        )}

        {estado === 'listo' && compromisos.length > 0 && (
          <>
            <div className={estilos.listaCompromisos}>
              {compromisos.map((compromiso) => (
                <section key={compromiso.compromisoId} className={estilos.compromisoCard}>
                  <header className={estilos.compromisoCabecera}>
                    <div>
                      <p className={estilos.compromisoEtiqueta}>
                        Compromiso #{compromiso.compromisoId}
                      </p>
                      <h3 className={estilos.compromisoTitulo}>
                        {etiquetaCompromiso(compromiso)}
                      </h3>
                      <p className={estilos.compromisoMeta}>
                        Emitido: {formatearFechaVisible(compromiso.fechaEmision)}
                        {' · '}
                        Total: {formatearMonto(compromiso.montoTotal)}
                      </p>
                      {Number(compromiso.montoMora) > 0 && (
                        <p className={estilos.compromisoMeta}>
                          Original: {formatearMonto(compromiso.montoOriginal)}
                          {' · '}
                          Mora: {formatearMonto(compromiso.montoMora)}
                        </p>
                      )}
                    </div>
                    <Insignia tono={tonoEstadoCompromiso(compromiso.estadoCompromiso)}>
                      {etiquetaEstadoCompromiso(compromiso.estadoCompromiso)}
                    </Insignia>
                  </header>

                  <div className={estilos.compromisoCuerpo}>
                    {compromiso.pagos.length > 0 && !permiteAcciones(compromiso) && (
                      <p className={estilos.notaBloqueo}>{motivoBloqueo(compromiso)}</p>
                    )}
                    {compromiso.pagos.length === 0 ? (
                      <p className={estilos.sinPagos}>
                        Sin pagos registrados para este compromiso.
                      </p>
                    ) : (
                      <div className={estilos.tablaContenedor}>
                        <table className={estilos.tabla}>
                          <caption hidden>Pagos del compromiso</caption>
                          <thead>
                            <tr>
                              <th scope="col">Fecha</th>
                              <th scope="col">Monto</th>
                              <th scope="col">Estado</th>
                              <th scope="col">Comprobante</th>
                              <th scope="col">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {compromiso.pagos.map((pago) => {
                              const accionesPermitidas = permiteAcciones(compromiso);
                              const motivo = accionesPermitidas ? '' : motivoBloqueo(compromiso);
                              const puedeValidar = accionesPermitidas
                                && (pago.estado === 'PENDIENTE' || pago.estado === 'RECHAZADO');
                              const puedeRechazar = accionesPermitidas
                                && (pago.estado === 'PENDIENTE' || pago.estado === 'VALIDADO');
                              return (
                                <tr key={pago.id}>
                                  <td>{formatearFechaVisible(pago.fechaRegistro)}</td>
                                  <td className={estilos.monto}>{formatearMonto(pago.montoPagado)}</td>
                                  <td>
                                    <Insignia tono={tonoEstadoPago(pago.estado)}>
                                      {etiquetaEstadoPago(pago.estado)}
                                    </Insignia>
                                  </td>
                                  <td>
                                    {pago.evidenciaUrl ? (
                                      <a
                                        className={estilos.evidencia}
                                        href={pago.evidenciaUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Ver comprobante
                                      </a>
                                    ) : '—'}
                                  </td>
                                  <td>
                                    <div className={estilos.acciones}>
                                      <button
                                        type="button"
                                        className={`${estilos.botonAccion} ${estilos.botonValidar}`}
                                        disabled={!puedeValidar || accionId === pago.id}
                                        aria-label={`Validar pago #${pago.id}`}
                                        title={puedeValidar
                                          ? (pago.estado === 'RECHAZADO'
                                            ? 'Corregir rechazo y validar el pago'
                                            : 'Validar pago')
                                          : (motivo || 'El pago no admite esta acción')}
                                        onClick={() => confirmarValidacion(pago)}
                                      >
                                        {accionId === pago.id ? 'Validando…' : 'Validar'}
                                      </button>
                                      <button
                                        type="button"
                                        className={`${estilos.botonAccion} ${estilos.botonRechazar}`}
                                        disabled={!puedeRechazar || accionId === pago.id}
                                        aria-label={`Rechazar pago #${pago.id}`}
                                        title={puedeRechazar
                                          ? (pago.estado === 'VALIDADO'
                                            ? 'Corregir validación y rechazar el pago'
                                            : 'Rechazar pago')
                                          : (motivo || 'El pago no admite esta acción')}
                                        onClick={() => {
                                          establecerErrorRechazo('');
                                          establecerPagoARechazar(pago);
                                        }}
                                      >
                                        Rechazar
                                      </button>
                                      <button
                                        type="button"
                                        className={estilos.botonDetalle}
                                        aria-label={`Ver detalle del pago #${pago.id}`}
                                        onClick={() => establecerDetalleId(pago.id)}
                                      >
                                        Detalle
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>

            {totalElementos > 0 && (
              <div className={estilos.paginacion}>
                <Paginacion
                  pagina={pagina}
                  totalPaginas={totalPaginas}
                  totalElementos={totalElementos}
                  tamanioPagina={TAMANIO_PAGINA}
                  cantidadEnPagina={compromisos.length}
                  alCambiarPagina={establecerPagina}
                  etiqueta="Paginación de compromisos de pago"
                  unidadSingular="compromiso"
                  unidadPlural="compromisos"
                />
              </div>
            )}
          </>
        )}
      </DialogoBase>

      {detalleId && (
        <ModalDetallePago pagoId={detalleId} onCerrar={() => establecerDetalleId(null)} />
      )}

      {pagoARechazar && (
        <ModalRechazarPago
          pago={pagoARechazar}
          enviando={rechazando}
          errorServicio={errorRechazo}
          onCerrar={() => establecerPagoARechazar(null)}
          onConfirmar={confirmarRechazo}
        />
      )}
    </>
  );
}
