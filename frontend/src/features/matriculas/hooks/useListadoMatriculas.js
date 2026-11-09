import { useEffect, useState } from 'react';

import {
  listarMatriculas,
  obtenerEstructuraListadoMatriculas,
  obtenerSeccionesMatricula
} from '../services/matriculasService.js';

const TAMANIO_PAGINA = 15;
const FILTROS_INICIALES = { anioId: '', gradoId: '', seccionId: '', estado: '' };

function elegirAnioInicial(anios) {
  const lista = [...(anios ?? [])].sort((a, b) => Number(b.anio) - Number(a.anio));
  // En matrículas interesa abrir el año más reciente: normalmente es el año
  // para el que se está gestionando el proceso de admisión y matrícula.
  return lista[0] ?? null;
}

/**
 * Listado administrativo de matrículas con filtros y paginación.
 * No modifica el hook de los modales de asignación.
 */
export default function useListadoMatriculas() {
  const [estructura, establecerEstructura] = useState(null);
  const [estadoEstructura, establecerEstadoEstructura] = useState('cargando');
  const [errorEstructura, establecerErrorEstructura] = useState('');
  const [secciones, establecerSecciones] = useState([]);

  const [filtros, establecerFiltros] = useState(FILTROS_INICIALES);
  const [pagina, establecerPagina] = useState(0);
  const [matriculas, establecerMatriculas] = useState([]);
  const [totalElementos, establecerTotalElementos] = useState(0);
  const [totalPaginas, establecerTotalPaginas] = useState(0);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [recargando, establecerRecargando] = useState(false);
  const [intento, establecerIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    establecerEstadoEstructura('cargando');

    obtenerEstructuraListadoMatriculas().then((respuesta) => {
      if (cancelado) return;
      if (!respuesta.exitoso) {
        establecerErrorEstructura(respuesta.mensaje);
        establecerEstadoEstructura('error');
        return;
      }
      const anio = elegirAnioInicial(respuesta.datos.anios);
      establecerEstructura(respuesta.datos);
      establecerFiltros((actuales) => ({
        ...actuales,
        anioId: actuales.anioId || (anio?.id != null ? String(anio.id) : '')
      }));
      establecerErrorEstructura('');
      establecerEstadoEstructura('listo');
    });

    return () => { cancelado = true; };
  }, [intento]);

  useEffect(() => {
    let cancelado = false;
    establecerSecciones([]);

    if (!filtros.anioId || !filtros.gradoId) return undefined;

    obtenerSeccionesMatricula(filtros.gradoId, filtros.anioId).then((respuesta) => {
      if (cancelado) return;
      if (respuesta.exitoso && Array.isArray(respuesta.datos)) {
        establecerSecciones(
          [...respuesta.datos].sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
      }
    });

    return () => { cancelado = true; };
  }, [filtros.anioId, filtros.gradoId]);

  useEffect(() => {
    if (estadoEstructura !== 'listo') return undefined;
    let cancelado = false;
    const hayDatos = matriculas.length > 0;

    if (hayDatos) establecerRecargando(true);
    else establecerEstado('cargando');
    establecerError('');

    listarMatriculas({
      anioId: filtros.anioId,
      gradoId: filtros.gradoId,
      seccionId: filtros.seccionId,
      estado: filtros.estado,
      page: pagina,
      size: TAMANIO_PAGINA
    }).then((respuesta) => {
      if (cancelado) return;
      if (!respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudo cargar el listado de matrículas.');
        establecerEstado('error');
        establecerRecargando(false);
        return;
      }
      establecerMatriculas(respuesta.datos.content);
      establecerTotalElementos(respuesta.datos.totalElements);
      establecerTotalPaginas(respuesta.datos.totalPages);
      establecerEstado('listo');
      establecerRecargando(false);
    });

    return () => { cancelado = true; };
  }, [estadoEstructura, filtros.anioId, filtros.gradoId, filtros.seccionId, filtros.estado, pagina, intento]);

  const cambiarFiltro = (campo, valor) => {
    establecerPagina(0);
    establecerFiltros((actuales) => ({
      ...actuales,
      [campo]: valor,
      ...(campo === 'gradoId' || campo === 'anioId' ? { seccionId: '' } : {})
    }));
  };

  const limpiarFiltros = () => {
    establecerPagina(0);
    establecerFiltros((actuales) => ({
      ...FILTROS_INICIALES,
      anioId: actuales.anioId
    }));
  };

  return {
    estructura,
    estadoEstructura,
    errorEstructura,
    secciones,
    filtros,
    cambiarFiltro,
    limpiarFiltros,
    pagina,
    totalElementos,
    totalPaginas,
    tamanioPagina: TAMANIO_PAGINA,
    matriculas,
    estado,
    error,
    recargando,
    irAPagina: establecerPagina,
    recargar: () => establecerIntento((actual) => actual + 1),
    reintentarEstructura: () => establecerIntento((actual) => actual + 1)
  };
}
