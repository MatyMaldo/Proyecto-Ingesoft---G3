import { useCallback, useEffect, useRef, useState } from 'react';

import {
  consultarOperacionMasiva,
  esEstadoTerminal
} from '../api/operacionesMasivasService.js';

const INTERVALO_DEFECTO_MS = 2500;
const MAX_FALLOS_CONSECUTIVOS = 3;

function jobInicial(datos) {
  return {
    jobId: datos.jobId,
    tipo: datos.tipo,
    estado: datos.estado ?? 'EN_COLA',
    total: datos.total ?? 0,
    procesados: datos.procesados ?? 0,
    exitosos: datos.exitosos ?? 0,
    omitidos: datos.omitidos ?? 0,
    errores: datos.errores ?? 0,
    porcentaje: datos.porcentaje ?? 0,
    fase: datos.fase ?? null,
    detalleErrores: datos.detalleErrores ?? [],
    creadoEn: datos.creadoEn ?? null,
    iniciadoEn: datos.iniciadoEn ?? null,
    finalizadoEn: datos.finalizadoEn ?? null
  };
}

/**
 * Inicia y sigue una operación masiva asíncrona.
 * El hook debe vivir en la página, no dentro del modal, para que el seguimiento
 * continúe aunque el usuario cierre el diálogo.
 */
export default function useOperacionMasiva({
  intervaloMs = INTERVALO_DEFECTO_MS,
  alTerminar
} = {}) {
  const [job, establecerJob] = useState(null);
  const [jobId, establecerJobId] = useState(null);
  const [iniciando, establecerIniciando] = useState(false);
  const [error, establecerError] = useState('');
  const alTerminarRef = useRef(alTerminar);
  const notificadoRef = useRef(false);
  const fallosRef = useRef(0);
  const montadoRef = useRef(true);

  useEffect(() => {
    alTerminarRef.current = alTerminar;
  }, [alTerminar]);

  useEffect(() => () => {
    montadoRef.current = false;
  }, []);

  useEffect(() => {
    if (!jobId) return undefined;

    let cancelado = false;
    let temporizador;

    const consultar = async () => {
      const respuesta = await consultarOperacionMasiva(jobId);
      if (cancelado) return;

      if (!respuesta.exitoso) {
        fallosRef.current += 1;
        establecerError(respuesta.mensaje || 'No se pudo consultar el estado de la operación.');

        if (respuesta.estado === 404 || fallosRef.current >= MAX_FALLOS_CONSECUTIVOS) {
          establecerJob((actual) => (
            actual
              ? {
                ...actual,
                estado: 'FALLIDO',
                fase: respuesta.estado === 404 ? 'JOB_NO_DISPONIBLE' : 'SIN_CONEXION'
              }
              : actual
          ));
          return;
        }
        temporizador = setTimeout(consultar, intervaloMs);
        return;
      }

      fallosRef.current = 0;
      establecerError('');
      const actualizado = { ...jobInicial(respuesta.datos) };
      establecerJob(actualizado);

      if (esEstadoTerminal(actualizado.estado)) {
        if (!notificadoRef.current) {
          notificadoRef.current = true;
          alTerminarRef.current?.(actualizado);
        }
        return;
      }

      temporizador = setTimeout(consultar, intervaloMs);
    };

    temporizador = setTimeout(consultar, intervaloMs);
    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [jobId, intervaloMs]);

  const iniciar = useCallback(async (solicitarInicio) => {
    if (iniciando || (jobId && !esEstadoTerminal(job?.estado))) {
      return null;
    }

    montadoRef.current = true;
    establecerIniciando(true);
    establecerError('');
    establecerJob(null);
    establecerJobId(null);
    notificadoRef.current = false;
    fallosRef.current = 0;

    const respuesta = await solicitarInicio();
    if (!montadoRef.current) return respuesta;

    if (!respuesta?.exitoso || !respuesta.datos?.jobId) {
      establecerIniciando(false);
      establecerError(
        respuesta?.mensaje || 'No fue posible iniciar la operación masiva.'
      );
      return respuesta;
    }

    establecerJob(jobInicial(respuesta.datos));
    establecerJobId(respuesta.datos.jobId);
    establecerIniciando(false);
    return respuesta;
  }, [iniciando, jobId, job?.estado]);

  const reiniciar = useCallback(() => {
    establecerJob(null);
    establecerJobId(null);
    establecerIniciando(false);
    establecerError('');
    notificadoRef.current = false;
    fallosRef.current = 0;
  }, []);

  const enCurso = iniciando || Boolean(jobId && !esEstadoTerminal(job?.estado));

  return {
    job,
    jobId,
    iniciando,
    error,
    enCurso,
    iniciar,
    reiniciar
  };
}
