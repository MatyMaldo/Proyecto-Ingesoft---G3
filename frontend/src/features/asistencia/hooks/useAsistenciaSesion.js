import { useCallback, useEffect, useState } from 'react';

import {
  guardarAsistenciaEstudiantes,
  obtenerAsistenciaSesion,
  registrarAsistenciaDocente
} from '../services/asistenciaService.js';

const ESTADO_INICIAL = {
  detalle: null,
  cargando: false,
  error: '',
  guardando: false,
  errorGuardado: ''
};

export default function useAsistenciaSesion(sesion) {
  const [estado, establecerEstado] = useState(ESTADO_INICIAL);
  const sesionId = sesion?.id ?? null;

  const cargar = useCallback(async (activo = () => true) => {
    if (!sesion?.id) {
      establecerEstado(ESTADO_INICIAL);
      return;
    }
    establecerEstado((actual) => ({ ...actual, cargando: true, error: '' }));
    const respuesta = await obtenerAsistenciaSesion(sesion);
    if (!activo()) return;
    if (!respuesta.exitoso) {
      establecerEstado({
        ...ESTADO_INICIAL,
        cargando: false,
        error: respuesta.mensaje || 'No se pudo consultar la asistencia de la sesión.'
      });
      return;
    }
    establecerEstado({
      ...ESTADO_INICIAL,
      detalle: respuesta.datos ?? null
    });
  }, [sesion?.id]);

  useEffect(() => {
    let activo = true;
    cargar(() => activo);
    return () => {
      activo = false;
    };
  }, [cargar, sesionId]);

  const guardarEstudiantes = useCallback(async (asistencias) => {
    if (!sesionId) {
      return { exitoso: false, datos: null, mensaje: 'No se identificó la sesión.' };
    }
    establecerEstado((actual) => ({
      ...actual,
      guardando: true,
      errorGuardado: ''
    }));
    const respuesta = await guardarAsistenciaEstudiantes(sesionId, asistencias);
    establecerEstado((actual) => ({
      ...actual,
      guardando: false,
      detalle: respuesta.exitoso ? (respuesta.datos ?? actual.detalle) : actual.detalle,
      errorGuardado: respuesta.exitoso
        ? ''
        : (respuesta.mensaje || 'No se pudo guardar la asistencia.')
    }));
    return respuesta;
  }, [sesionId]);

  const registrarDocente = useCallback(async () => {
    if (!sesionId) {
      return { exitoso: false, datos: null, mensaje: 'No se identificó la sesión.' };
    }
    establecerEstado((actual) => ({
      ...actual,
      guardando: true,
      errorGuardado: ''
    }));
    const respuesta = await registrarAsistenciaDocente(sesionId);
    establecerEstado((actual) => ({
      ...actual,
      guardando: false,
      detalle: respuesta.exitoso && actual.detalle
        ? {
          ...actual.detalle,
          asistenciaDocente: respuesta.datos ?? actual.detalle.asistenciaDocente,
          puedeRegistrarDocente: false,
          motivoDocente: null
        }
        : actual.detalle,
      errorGuardado: respuesta.exitoso
        ? ''
        : (respuesta.mensaje || 'No se pudo registrar la asistencia del docente.')
    }));
    return respuesta;
  }, [sesionId]);

  return {
    ...estado,
    guardarEstudiantes,
    registrarDocente,
    recargar: () => cargar()
  };
}
