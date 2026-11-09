import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  listarMatriculas,
  obtenerEstructuraListadoMatriculas,
  obtenerSeccionesMatricula
} from '../services/matriculasService.js';

/** Matrículas por página del listado (antes 15; bajado a 10 para evitar el scroll de página, igual que Usuarios). */
const TAMANIO_PAGINA = 10;
const FILTROS_INICIALES = { anioId: '', gradoId: '', seccionId: '', estado: '' };
const ESTADOS_VALIDOS = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'];

const idValido = (valor) => (/^\d+$/.test(valor ?? '') ? valor : '');

/**
 * Filtros guardados en la URL (?anio=&grado=&seccion=&estado=). `anio=todos` es "Todos los años"; sin `anio` se
 * usa el año más reciente. Lo que no es válido se ignora.
 */
function filtrosDesdeUrl(parametros) {
  const anio = parametros.get('anio');
  const estado = parametros.get('estado');
  return {
    anioId: anio === 'todos' ? '' : idValido(anio),
    gradoId: idValido(parametros.get('grado')),
    seccionId: idValido(parametros.get('seccion')),
    estado: ESTADOS_VALIDOS.includes(estado) ? estado : ''
  };
}

function elegirAnioInicial(anios) {
  const lista = [...(anios ?? [])].sort((a, b) => Number(b.anio) - Number(a.anio));
  // En matrículas interesa abrir el año más reciente: normalmente es el año
  // para el que se está gestionando el proceso de admisión y matrícula.
  return lista[0] ?? null;
}

/**
 * Listado administrativo de matrículas con filtros y paginación. Los filtros y la página viven también en la URL
 * (?anio=&grado=&seccion=&estado=&pagina=), así sobreviven a recargar la página.
 * No modifica el hook de los modales de asignación.
 */
export default function useListadoMatriculas() {
  const [parametros, establecerParametros] = useSearchParams();
  // Si la URL ya trae el año (incluido "todos"), no se reemplaza por el más reciente al cargar la estructura.
  const [anioEnUrl] = useState(() => parametros.has('anio'));
  const [estructura, establecerEstructura] = useState(null);
  const [estadoEstructura, establecerEstadoEstructura] = useState('cargando');
  const [errorEstructura, establecerErrorEstructura] = useState('');
  const [secciones, establecerSecciones] = useState([]);

  const [filtros, establecerFiltros] = useState(() => filtrosDesdeUrl(parametros));
  const [pagina, establecerPagina] = useState(
    () => Math.max(0, (Number.parseInt(parametros.get('pagina'), 10) || 1) - 1)
  );
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
        anioId: anioEnUrl ? actuales.anioId : actuales.anioId || (anio?.id != null ? String(anio.id) : '')
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

  // Refleja en la URL los filtros y la página, cuando ya se cargó la estructura (antes el año aún no está elegido).
  useEffect(() => {
    if (estadoEstructura !== 'listo') return;
    const siguientes = new URLSearchParams(parametros);
    const fijar = (clave, valor) => (valor ? siguientes.set(clave, valor) : siguientes.delete(clave));
    fijar('anio', filtros.anioId || 'todos');
    fijar('grado', filtros.gradoId);
    fijar('seccion', filtros.seccionId);
    fijar('estado', filtros.estado);
    fijar('pagina', pagina > 0 ? String(pagina + 1) : '');
    if (siguientes.toString() !== parametros.toString()) {
      establecerParametros(siguientes, { replace: true });
    }
  }, [estadoEstructura, filtros, pagina, parametros, establecerParametros]);

  // Una página de la URL que ya no existe (p. ej. se quitaron matrículas) vuelve a la última que sí existe.
  useEffect(() => {
    if (estado === 'listo' && totalPaginas > 0 && pagina >= totalPaginas) {
      establecerPagina(totalPaginas - 1);
    }
  }, [estado, totalPaginas, pagina]);

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
