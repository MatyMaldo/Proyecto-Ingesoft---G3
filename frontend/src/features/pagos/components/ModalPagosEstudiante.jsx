import { useEffect, useId, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import {
  listarPagosAgrupados,
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
import ModalDetallePago from './ModalDetallePago.jsx';
import ModalRechazarPago from './ModalRechazarPago.jsx';
import estilosModal from './Modal.module.css';
import estilos from './ModalPagos.module.css';

const TAMANIO_PAGINA = 10;

export default function ModalPagosEstudiante({ alumno, onCerrar, alNotificar }) {
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
  const idTitulo = useId();

  const tieneContexto = Boolean(
    alumno?.anioAcademicoId && alumno?.gradoId && alumno?.seccionId
  );

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

  return (
    <>
      <div
        className={estilosModal.fondo}
        onMouseDown={(evento) => {
          if (evento.target === evento.currentTarget) onCerrar();
        }}
      >
        <div
          className={`${estilosModal.caja} ${estilos.cajaAncha}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTitulo}
        >
          <header className={estilosModal.cabecera}>
            <div>
              <p className={estilosModal.sobretitulo}>Pagos del estudiante</p>
              <h2 id={idTitulo} className={estilosModal.titulo}>
                {alumno?.nombre ?? 'Pagos'}
              </h2>
              <p className={estilos.metaAlumno}>
                {[alumno?.gradoNombre, alumno?.seccionNombre, alumno?.anioAcademico]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <button type="button" className={estilosModal.cerrar} onClick={onCerrar} aria-label="Cerrar">
              <Icono nombre="cerrar" tamano={16} />
            </button>
          </header>

          <div className={estilosModal.cuerpo}>
            {aviso && (
              <p className={aviso.error ? estilos.errorCampo : estilos.aviso} role="status">
                {aviso.texto}
              </p>
            )}

            {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}
            {estado === 'error' && (
              <div>
                <EstadoConsulta tipo="error" mensaje={error} />
                <button
                  type="button"
                  className={estilosModal.reintentar}
                  onClick={() => establecerIntento((actual) => actual + 1)}
                  disabled={!tieneContexto}
                >
                  Reintentar
                </button>
              </div>
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
                                  const pendiente = pago.estado === 'PENDIENTE';
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
                                            disabled={!pendiente || accionId === pago.id}
                                            title={pendiente ? 'Validar pago' : 'El pago ya fue procesado'}
                                            onClick={() => confirmarValidacion(pago)}
                                          >
                                            Validar
                                          </button>
                                          <button
                                            type="button"
                                            className={`${estilos.botonAccion} ${estilos.botonRechazar}`}
                                            disabled={!pendiente || accionId === pago.id}
                                            title={pendiente ? 'Rechazar pago' : 'El pago ya fue procesado'}
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
          </div>

          <footer className={estilosModal.pie}>
            <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar}>
              Cerrar
            </button>
          </footer>
        </div>
      </div>

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
