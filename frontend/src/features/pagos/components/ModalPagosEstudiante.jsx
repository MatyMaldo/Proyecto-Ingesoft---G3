import { useEffect, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
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
import estilosCampos from '../../../shared/styles/camposDialogo.module.css';

// Un año trae como máximo 1 compromiso de matrícula y 10 de pensión: con 12 caben todos en una sola página.
const TAMANIO_PAGINA = 12;
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
  // Compromisos que el usuario abrió o cerró a mano; sin elección, se abren solo los que requieren atención.
  const [expandidos, establecerExpandidos] = useState({});

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

  // Un compromiso pagado y sin pagos por validar no requiere atención: aparece plegado.
  const requiereAtencion = (compromiso) => compromiso.estadoCompromiso !== 'PAGADO'
    || compromiso.pagos.some((pago) => pago.estado === 'PENDIENTE')
    || compromiso.pagos.length === 0;
  const estaExpandido = (compromiso) => expandidos[compromiso.compromisoId] ?? requiereAtencion(compromiso);
  const alternarCompromiso = (compromiso) => establecerExpandidos((actuales) => ({
    ...actuales,
    [compromiso.compromisoId]: !estaExpandido(compromiso)
  }));

  const totalPorValidar = compromisos.reduce(
    (suma, compromiso) => suma + compromiso.pagos.filter((pago) => pago.estado === 'PENDIENTE').length,
    0
  );
  const deudaPendiente = compromisos
    .filter((compromiso) => compromiso.estadoCompromiso === 'PENDIENTE')
    .reduce((suma, compromiso) => suma + (Number(compromiso.montoTotal) || 0), 0);

  // Pago cuyo detalle está abierto y qué se puede hacer con él (las mismas reglas que los botones de la tabla).
  const compromisoDetalle = detalleId
    ? compromisos.find((compromiso) => compromiso.pagos.some((pago) => pago.id === detalleId))
    : null;
  const pagoDetalle = compromisoDetalle?.pagos.find((pago) => pago.id === detalleId) ?? null;
  const accionesDetalle = pagoDetalle ? (() => {
    const permitidas = permiteAcciones(compromisoDetalle);
    return {
      puedeValidar: permitidas && (pagoDetalle.estado === 'PENDIENTE' || pagoDetalle.estado === 'RECHAZADO'),
      puedeRechazar: permitidas && (pagoDetalle.estado === 'PENDIENTE' || pagoDetalle.estado === 'VALIDADO'),
      motivoBloqueo: permitidas ? '' : motivoBloqueo(compromisoDetalle),
      validando: accionId === pagoDetalle.id,
      alValidar: async () => {
        await confirmarValidacion(pagoDetalle);
        establecerDetalleId(null);
      },
      alRechazar: () => {
        establecerErrorRechazo('');
        establecerPagoARechazar(pagoDetalle);
        establecerDetalleId(null);
      }
    };
  })() : undefined;

  const meta = [alumno?.gradoNombre, alumno?.seccionNombre, alumno?.anioAcademico]
    .filter(Boolean)
    .join(' · ');

  // El detalle de un pago reemplaza a la lista (no se apila otro diálogo encima) y "Volver a los pagos" regresa a ella.
  if (detalleId) {
    return (
      <ModalDetallePago
        pagoId={detalleId}
        acciones={accionesDetalle}
        onCerrar={() => establecerDetalleId(null)}
      />
    );
  }

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
        cerrarAlClicFuera={false}
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
            {/* Lo primero que se necesita saber: cuántos pagos esperan validación y cuánto se adeuda. */}
            <div className={estilosCampos.datos}>
              <div className={estilosCampos.dato}>
                <span className={estilosCampos.datoRotulo}>Pagos por validar</span>
                <span className={estilosCampos.datoValor}>{totalPorValidar}</span>
              </div>
              <div className={estilosCampos.dato}>
                <span className={estilosCampos.datoRotulo}>Deuda pendiente</span>
                <span className={estilosCampos.datoValor}>{formatearMonto(deudaPendiente)}</span>
              </div>
            </div>

            <div className={estilos.listaCompromisos}>
              {compromisos.map((compromiso) => {
                const cantidadPagos = compromiso.pagos.length;
                const tienePagos = cantidadPagos > 0;
                const abierto = tienePagos && estaExpandido(compromiso);
                const textoCantidad = `${cantidadPagos} ${cantidadPagos === 1 ? 'pago' : 'pagos'}`;
                return (
                <section key={compromiso.compromisoId} className={estilos.compromisoCard}>
                  {/* Con pagos, tocar la cabecera abre o cierra la tabla; el contador y la flecha de la derecha lo indican.
                      Sin pagos no hay nada que desplegar. */}
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
                  <header
                    className={tienePagos
                      ? `${estilos.compromisoCabecera} ${estilos.compromisoDesplegable}`
                      : estilos.compromisoCabecera}
                    onClick={tienePagos ? () => alternarCompromiso(compromiso) : undefined}
                  >
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
                    <div className={estilos.compromisoLado}>
                      <Insignia tono={tonoEstadoCompromiso(compromiso.estadoCompromiso)}>
                        {etiquetaEstadoCompromiso(compromiso.estadoCompromiso)}
                      </Insignia>
                      {tienePagos ? (
                        // Sin `onClick` propio: el clic llega a la cabecera, que es quien alterna. Con teclado,
                        // Enter y Espacio generan ese mismo clic.
                        <button
                          type="button"
                          className={estilos.contadorPagos}
                          aria-expanded={abierto}
                          aria-label={`${abierto ? 'Ocultar' : 'Mostrar'} los pagos de ${etiquetaCompromiso(compromiso)} (${textoCantidad})`}
                        >
                          {textoCantidad}
                          <Icono nombre={abierto ? 'chevron-arriba' : 'chevron-abajo'} tamano={16} />
                        </button>
                      ) : (
                        <span className={estilos.sinPagosLado}>Sin pagos</span>
                      )}
                    </div>
                  </header>

                  {abierto && (
                  <div className={estilos.compromisoCuerpo}>
                    {!permiteAcciones(compromiso) && (
                      <p className={estilos.notaBloqueo}>{motivoBloqueo(compromiso)}</p>
                    )}
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
                                <tr key={pago.id} className={pago.estado === 'PENDIENTE' ? estilos.filaPorValidar : undefined}>
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
                  </div>
                  )}
                </section>
                );
              })}
            </div>

            {/* Con una sola página el total no aporta nada: el paginador solo aparece si hay más. */}
            {totalPaginas > 1 && (
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
