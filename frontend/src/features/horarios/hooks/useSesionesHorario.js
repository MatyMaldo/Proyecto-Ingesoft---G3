import { useState } from 'react';

import {
  generarSesiones,
  listarSesiones,
  previsualizarSesiones
} from '../services/horariosService.js';
import { formatearFecha, sumarDias } from '../utils/tiempo.js';

const MENSAJE_ERROR_GENERICO = 'Se registró un error inesperado';

function fechaCorta(valor) {
  return valor ? String(valor).slice(0, 10) : null;
}

function mayor(fechas) {
  const validas = fechas.filter(Boolean).sort();
  return validas.at(-1) ?? null;
}

function menor(fechas) {
  const validas = fechas.filter(Boolean).sort();
  return validas[0] ?? null;
}

/**
 * Calcula el rango permitido para generar sesiones.
 *
 * Prioridad del inicio:
 * 1. Inicio del primer bimestre, cuando backend lo expone.
 * 2. Día siguiente al fin del periodo de matrícula, sin salir del año académico.
 * 3. Inicio del año académico o, como último respaldo, el 1 de marzo.
 *
 * El fin nunca supera el 20 de diciembre.
 */
export function calcularRangoSesiones({
  anio,
  fechaInicioAnio,
  fechaFinAnio,
  fechaInicioPrimerBimestre,
  fechaFinPeriodo
} = {}) {
  const anioNumerico = Number(anio) || new Date().getFullYear();
  const inicioAnio = fechaCorta(fechaInicioAnio);
  const finAnio = fechaCorta(fechaFinAnio);
  const inicioBimestre = fechaCorta(fechaInicioPrimerBimestre);
  const finPeriodo = fechaCorta(fechaFinPeriodo);

  const topeDiciembre = `${anioNumerico}-12-20`;
  const fechaMaxima = menor([finAnio, topeDiciembre]) ?? topeDiciembre;
  const marzo = `${anioNumerico}-03-01`;
  const respaldo = mayor([inicioAnio, marzo]) ?? marzo;
  const trasPeriodo = finPeriodo ? sumarDias(finPeriodo, 1) : null;

  let fechaMinima = inicioBimestre
    ?? (trasPeriodo ? mayor([trasPeriodo, respaldo]) : respaldo);

  if (!fechaMinima || fechaMinima > fechaMaxima) {
    fechaMinima = respaldo <= fechaMaxima ? respaldo : fechaMaxima;
  }

  return { fechaMinima, fechaMaxima };
}

function claveSesion(sesion) {
  return `${sesion.bloqueHorarioId}|${sesion.fecha}`;
}

export default function useSesionesHorario(consulta, periodo, primerBimestre) {
  const anio = consulta?.anioAcademico ?? new Date().getFullYear();
  const { fechaMinima, fechaMaxima } = calcularRangoSesiones({
    anio,
    fechaInicioAnio: consulta?.fechaInicioAnio,
    fechaFinAnio: consulta?.fechaFinAnio,
    fechaInicioPrimerBimestre: primerBimestre?.fechaInicio,
    fechaFinPeriodo: periodo?.fechaFin
  });
  const [fechaInicio, establecerFechaInicio] = useState(fechaMinima);
  const [fechaFin, establecerFechaFin] = useState(fechaMaxima);
  const [sesionesPreview, establecerSesionesPreview] = useState([]);
  const [sesiones, establecerSesiones] = useState([]);
  const [totalPreview, establecerTotalPreview] = useState(0);
  const [estadoPreview, establecerEstadoPreview] = useState('inactivo');
  const [sesionesOmitidas, establecerSesionesOmitidas] = useState({});
  const [generando, establecerGenerando] = useState(false);

  const parametros = () => ({
    anioAcademicoId: consulta?.anioAcademicoId ?? consulta?.anioId,
    seccionId: consulta?.seccionId ?? consulta?.seccion,
    fechaInicio,
    fechaFin
  });

  const fueraDeRango = (datos) =>
    datos.fechaInicio < fechaMinima || datos.fechaFin > fechaMaxima;

  const MENSAJE_RANGO = `El rango debe estar entre ${formatearFecha(fechaMinima)} y ${formatearFecha(fechaMaxima)}.`;

  const previsualizar = async () => {
    const datos = parametros();
    if (!Number.isSafeInteger(Number(datos.anioAcademicoId)) || !Number.isSafeInteger(Number(datos.seccionId))) {
      return 'Falta el identificador de año académico o sección.';
    }
    if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) {
      return 'Selecciona un rango de fechas válido.';
    }
    if (fueraDeRango(datos)) {
      return MENSAJE_RANGO;
    }

    establecerEstadoPreview('cargando');
    establecerSesionesOmitidas({});
    const resultado = await previsualizarSesiones({
      ...datos,
      gradoId: consulta.gradoId,
      seccion: consulta.seccion
    });
    if (!resultado.exitoso) {
      establecerEstadoPreview('error');
      return resultado.mensaje || MENSAJE_ERROR_GENERICO;
    }
    if (
      !Array.isArray(resultado.datos?.sesiones) ||
      !Number.isFinite(resultado.datos?.total)
    ) {
      establecerEstadoPreview('error');
      return 'El backend devolvió una vista previa de sesiones no válida.';
    }
    establecerSesionesPreview(resultado.datos.sesiones);
    establecerTotalPreview(resultado.datos.total);
    establecerEstadoPreview('listo');
    return null;
  };

  const alternarOmitida = (sesion) => {
    if (sesion?.yaExiste) return;
    const clave = claveSesion(sesion);
    establecerSesionesOmitidas((actuales) => {
      const siguientes = { ...actuales };
      if (Object.hasOwn(siguientes, clave)) {
        delete siguientes[clave];
      } else {
        siguientes[clave] = { bloqueHorarioId: sesion.bloqueHorarioId, fecha: sesion.fecha };
      }
      return siguientes;
    });
  };

  const omitirTodasDeFecha = (fecha) => {
    establecerSesionesOmitidas((actuales) => {
      const siguientes = { ...actuales };
      const sesionesDeFecha = sesionesPreview.filter(
        (sesion) => sesion.fecha === fecha && !sesion.yaExiste
      );
      const todasOmitidas = sesionesDeFecha.every((sesion) => Object.hasOwn(siguientes, claveSesion(sesion)));
      sesionesDeFecha.forEach((sesion) => {
        const clave = claveSesion(sesion);
        if (todasOmitidas) {
          delete siguientes[clave];
        } else {
          siguientes[clave] = { bloqueHorarioId: sesion.bloqueHorarioId, fecha: sesion.fecha };
        }
      });
      return siguientes;
    });
  };

  const reiniciarPreview = () => {
    establecerSesionesPreview([]);
    establecerTotalPreview(0);
    establecerEstadoPreview('inactivo');
    establecerSesionesOmitidas({});
  };

  const omitidasSolicitadas = () => {
    const existentes = new Set(
      sesionesPreview.filter((sesion) => sesion.yaExiste).map(claveSesion)
    );
    return Object.entries(sesionesOmitidas)
      .filter(([clave]) => !existentes.has(clave))
      .map(([, omitida]) => omitida);
  };

  const construirSolicitud = () => ({
    ...parametros(),
    gradoId: consulta?.gradoId,
    seccion: consulta?.seccion,
    sesionesOmitidas: omitidasSolicitadas()
  });

  const generar = async () => {
    const datos = parametros();
    if (!Number.isSafeInteger(Number(datos.anioAcademicoId)) || !Number.isSafeInteger(Number(datos.seccionId))) {
      return 'Falta el identificador de año académico o sección.';
    }
    if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) {
      return 'Selecciona un rango de fechas válido.';
    }
    if (fueraDeRango(datos)) {
      return MENSAJE_RANGO;
    }

    establecerGenerando(true);
    const resultado = await generarSesiones({
      ...datos,
      gradoId: consulta.gradoId,
      seccion: consulta.seccion,
      sesionesOmitidas: omitidasSolicitadas()
    });
    establecerGenerando(false);
    if (!resultado.exitoso) return resultado.mensaje || MENSAJE_ERROR_GENERICO;

    const respuestaSesiones = await listarSesiones({
      seccionId: datos.seccionId,
      fechaInicio,
      fechaFin
    });
    if (!respuestaSesiones.exitoso) {
      return respuestaSesiones.mensaje || 'Las sesiones se generaron, pero no se pudieron volver a cargar.';
    }
    if (!Array.isArray(respuestaSesiones.datos)) {
      return 'El backend devolvió una lista de sesiones no válida.';
    }
    establecerSesiones(respuestaSesiones.datos);
    establecerSesionesOmitidas({});
    return resultado.datos?.sesionesCreadas ?? respuestaSesiones.datos?.length ?? 0;
  };

  return {
    fechaInicio,
    establecerFechaInicio,
    fechaFin,
    establecerFechaFin,
    fechaMinima,
    fechaMaxima,
    sesionesPreview,
    sesiones,
    totalPreview,
    estadoPreview,
    sesionesOmitidas,
    alternarOmitida,
    omitirTodasDeFecha,
    reiniciarPreview,
    generando,
    previsualizar,
    generar,
    construirSolicitud
  };
}
