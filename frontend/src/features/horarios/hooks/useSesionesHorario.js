import { useState } from 'react';

import {
  generarSesiones,
  listarSesiones,
  previsualizarSesiones
} from '../services/horariosService.js';

const MENSAJE_ERROR_GENERICO = 'Se registró un error inesperado';

export default function useSesionesHorario(consulta) {
  const anio = consulta?.anioAcademico ?? new Date().getFullYear();
  const [fechaInicio, establecerFechaInicio] = useState(`${anio}-01-01`);
  const [fechaFin, establecerFechaFin] = useState(`${anio}-12-31`);
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

  const previsualizar = async () => {
    const datos = parametros();
    if (!Number.isSafeInteger(Number(datos.anioAcademicoId)) || !Number.isSafeInteger(Number(datos.seccionId))) {
      return 'Falta el identificador de año académico o sección.';
    }
    if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) {
      return 'Selecciona un rango de fechas válido.';
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

  const alternarOmitida = (fecha, motivo = '') => {
    establecerSesionesOmitidas((actuales) => {
      const siguientes = { ...actuales };
      if (Object.hasOwn(siguientes, fecha)) {
        delete siguientes[fecha];
      } else {
        siguientes[fecha] = motivo;
      }
      return siguientes;
    });
  };

  const actualizarMotivo = (fecha, motivo) => {
    establecerSesionesOmitidas((actuales) => ({ ...actuales, [fecha]: motivo }));
  };

  const generar = async () => {
    const datos = parametros();
    if (!Number.isSafeInteger(Number(datos.anioAcademicoId)) || !Number.isSafeInteger(Number(datos.seccionId))) {
      return 'Falta el identificador de año académico o sección.';
    }
    if (Object.values(sesionesOmitidas).some((motivo) => !motivo.trim())) {
      return 'Escribe un motivo para cada fecha omitida.';
    }
    establecerGenerando(true);
    const resultado = await generarSesiones({
      ...datos,
      gradoId: consulta.gradoId,
      seccion: consulta.seccion,
      sesionesOmitidas: Object.entries(sesionesOmitidas).map(([fecha, motivo]) => ({ fecha, motivo }))
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
    sesionesPreview,
    sesiones,
    totalPreview,
    estadoPreview,
    sesionesOmitidas,
    alternarOmitida,
    actualizarMotivo,
    generando,
    previsualizar,
    generar
  };
}
