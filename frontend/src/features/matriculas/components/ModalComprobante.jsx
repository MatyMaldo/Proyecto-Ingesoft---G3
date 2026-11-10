import { useEffect, useId, useRef, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import ProgresoOperacionMasiva from '../../../shared/components/ProgresoOperacionMasiva.jsx';
import { crearClaveIdempotencia } from '../../../shared/api/operacionesMasivasService.js';
import {
  iniciarEmisionMatriculasLoteAsync,
  listarMatriculas,
  obtenerPeriodoMatricula
} from '../services/matriculasService.js';
import estilos from '../../../shared/styles/camposDialogo.module.css';

/**
 * Emisión masiva de compromisos de matrícula.
 * La emisión individual vive en cada fila de la tabla de matrículas.
 */
export default function ModalComprobante({ anios, anioInicialId, onCerrar, operacion }) {
  const [anioId, establecerAnioId] = useState(() => (
    anioInicialId || anios?.[0]?.id || ''
  ));
  const [cantidadPendientes, establecerCantidadPendientes] = useState(null);
  const [periodo, establecerPeriodo] = useState(null);
  const [estado, establecerEstado] = useState('cargando');
  const [errorCarga, establecerErrorCarga] = useState('');
  const [errorEmision, establecerErrorEmision] = useState('');
  const [intento, establecerIntento] = useState(0);
  const claveRef = useRef(null);

  const idAnio = useId();

  useEffect(() => {
    if (!anioId) {
      establecerEstado('error');
      establecerErrorCarga('Selecciona un año académico.');
      return undefined;
    }

    let activo = true;
    establecerEstado('cargando');
    establecerErrorCarga('');

    Promise.all([
      listarMatriculas({ anioId, estado: 'PENDIENTE', page: 0, size: 1 }),
      obtenerPeriodoMatricula(anioId)
    ]).then(([respuestaMatriculas, respuestaPeriodo]) => {
      if (!activo) return;

      if (!respuestaMatriculas.exitoso) {
        establecerErrorCarga(
          respuestaMatriculas.mensaje || 'No se pudieron cargar las matrículas pendientes.'
        );
        establecerEstado('error');
        return;
      }

      establecerCantidadPendientes(respuestaMatriculas.datos.totalElements);
      establecerPeriodo(respuestaPeriodo.exitoso ? respuestaPeriodo.datos : null);
      establecerEstado('listo');
    });

    return () => { activo = false; };
  }, [anioId, intento]);

  const periodoVigente = periodo?.estado === 'VIGENTE';
  const hayPendientes = (cantidadPendientes ?? 0) > 0;
  const puedeEmitir = estado === 'listo'
    && periodoVigente
    && hayPendientes
    && !operacion?.enCurso
    && !operacion?.job;

  const mensajePeriodo = (() => {
    if (!periodo) return 'No se pudo verificar el período de matrícula.';
    if (periodo.estado === 'VIGENTE') return 'Período de matrícula vigente.';
    if (periodo.estado === 'FINALIZADO') {
      return 'El período de matrícula finalizó; no se pueden emitir compromisos.';
    }
    if (periodo.estado === 'SIN_INICIAR') {
      return 'El período de matrícula aún no inicia.';
    }
    return 'Estado de período no reconocido.';
  })();

  const ejecutar = async (evento) => {
    evento.preventDefault();
    if (!puedeEmitir) return;

    establecerErrorEmision('');
    if (!claveRef.current || operacion?.job) {
      claveRef.current = crearClaveIdempotencia('matricula-lote');
    }

    const respuesta = await operacion.iniciar(() => (
      iniciarEmisionMatriculasLoteAsync(anioId, claveRef.current)
    ));
    if (respuesta && !respuesta.exitoso) {
      establecerErrorEmision(
        respuesta.mensaje || 'No fue posible iniciar la emisión masiva.'
      );
    }
  };

  return (
    <DialogoBase
      idTitulo="dialogo-emitir-compromisos"
      titulo="Emitir compromisos de matrícula"
      subtitulo="Emisión masiva por año académico"
      textoConfirmar="Emitir todos"
      textoEnviando="Iniciando..."
      textoCancelar="Cerrar"
      enviando={operacion?.iniciando ?? false}
      confirmarDeshabilitado={!puedeEmitir}
      error={errorEmision || operacion?.error || null}
      anchoMaximo="32rem"
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={ejecutar}
    >
      <div className={estilos.campo}>
        <label htmlFor={idAnio} className={estilos.etiqueta}>Año académico</label>
        <select
          id={idAnio}
          className={estilos.selector}
          value={anioId}
          disabled={operacion?.enCurso || Boolean(operacion?.job)}
          onChange={(evento) => {
            establecerAnioId(evento.target.value);
            claveRef.current = null;
            operacion?.reiniciar();
            establecerErrorEmision('');
          }}
        >
          {(anios ?? []).map((anio) => (
            <option key={anio.id} value={anio.id}>{anio.anio}</option>
          ))}
        </select>
      </div>

      <p className={estilos.ayuda}>
        Se emitirá un compromiso de pago de matrícula para cada matrícula
        pendiente del año que aún no tenga uno.
      </p>

      {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={2} />}

      {estado === 'error' && (
        <div className={estilos.campo}>
          <p className={estilos.error} role="alert">
            <Icono nombre="alerta" tamano={14} />
            <span>{errorCarga}</span>
          </p>
          <button
            type="button"
            className={estilos.reintentar}
            onClick={() => establecerIntento((actual) => actual + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {estado === 'listo' && (
        <>
          <p className={estilos.resumen}>
            Matrículas pendientes: <strong>{cantidadPendientes ?? 0}</strong>
          </p>
          <p className={estilos.resumen}>{mensajePeriodo}</p>
          {!hayPendientes && (
            <p className={estilos.resumen}>No hay matrículas pendientes para emitir.</p>
          )}
        </>
      )}

      {operacion?.job && (
        <ProgresoOperacionMasiva
          job={operacion.job}
          error={operacion.error}
          titulo="Emisión masiva de matrícula"
        />
      )}
    </DialogoBase>
  );
}
