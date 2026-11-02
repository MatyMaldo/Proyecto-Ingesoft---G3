import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { claveBloque } from '../constants/horarios.js';
import {
  consultarCatalogos,
  crearAsignacion,
  eliminarAsignacion,
  guardarHorario,
  listarAsignaciones,
  listarOcupaciones,
  obtenerHorario
} from '../services/horariosService.js';

const MENSAJE_ERROR_GENERICO = 'Se registró un error inesperado';
const CATALOGOS_VACIOS = { grados: [], secciones: [], cursos: [], docentes: [], aulas: [], bimestres: [] };

/** Convierte la lista de bloques del backend en un mapa `dia|franja` → { asignacionId, aulaId }. */
function bloquesAMapa(lista) {
  const mapa = {};
  lista.forEach(({ dia, franjaId, asignacionId, aulaId }) => {
    mapa[claveBloque(dia, franjaId)] = { asignacionId, aulaId };
  });
  return mapa;
}

function mapaABloques(mapa) {
  return Object.entries(mapa).map(([clave, { asignacionId, aulaId }]) => {
    const [dia, franjaId] = clave.split('|');
    return { dia, franjaId, asignacionId, aulaId };
  });
}

function serializarBloques(mapa) {
  return JSON.stringify(
    Object.entries(mapa)
      .map(([clave, { asignacionId, aulaId }]) => [clave, asignacionId, aulaId])
      .sort(([a], [b]) => a.localeCompare(b))
  );
}

/**
 * Estado de la pantalla de Horarios: filtros obligatorios (grado y sección), relaciones
 * curso-docente y matriz semanal editable.
 *
 * @returns {Object}
 */
export default function useHorarios() {
  const [catalogos, establecerCatalogos] = useState(CATALOGOS_VACIOS);
  const [estadoCatalogos, establecerEstadoCatalogos] = useState('cargando');
  const [intento, establecerIntento] = useState(0);

  // Grado y sección consultados viajan en la URL (`?grado=4&seccion=B`) para poder recargar o compartir.
  const [parametros, establecerParametros] = useSearchParams();
  const [gradoId, establecerGradoId] = useState(parametros.get('grado') ?? '');
  const [seccion, establecerSeccion] = useState(parametros.get('seccion') ?? '');
  const urlRestaurada = useRef(false);
  // Sección consultada con "Ver horario"; los filtros del formulario no la cambian hasta pulsarlo.
  const [consulta, establecerConsulta] = useState(null);
  const [version, establecerVersion] = useState(0);

  const [listaAsignaciones, establecerListaAsignaciones] = useState([]);
  const [ocupaciones, establecerOcupaciones] = useState([]);

  const [bloques, establecerBloques] = useState({});
  const [bloquesGuardados, establecerBloquesGuardados] = useState({});
  const [estadoHorario, establecerEstadoHorario] = useState('cargando');
  const [guardando, establecerGuardando] = useState(false);

  const hayCambios = useMemo(
    () => serializarBloques(bloques) !== serializarBloques(bloquesGuardados),
    [bloques, bloquesGuardados]
  );

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      establecerEstadoCatalogos('cargando');
      const resultado = await consultarCatalogos();
      if (cancelado) {
        return;
      }
      if (!resultado.exitoso) {
        establecerEstadoCatalogos('error');
        return;
      }
      establecerCatalogos({ ...CATALOGOS_VACIOS, ...resultado.datos });
      establecerEstadoCatalogos('listo');
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [intento]);

  useEffect(() => {
    if (!consulta) {
      return undefined;
    }
    let cancelado = false;

    async function cargar() {
      establecerEstadoHorario('cargando');
      const [respuestaAsignaciones, respuestaHorario, respuestaOcupaciones] = await Promise.all([
        listarAsignaciones(consulta),
        obtenerHorario(consulta),
        listarOcupaciones(consulta)
      ]);
      if (cancelado) {
        return;
      }
      if (!respuestaAsignaciones.exitoso || !respuestaHorario.exitoso || !respuestaOcupaciones.exitoso) {
        establecerEstadoHorario('error');
        return;
      }
      const asignaciones = respuestaAsignaciones.datos ?? [];
      const ids = new Set(asignaciones.map((asignacion) => asignacion.id));
      establecerListaAsignaciones(asignaciones);
      establecerOcupaciones(respuestaOcupaciones.datos ?? []);
      establecerBloquesGuardados(bloquesAMapa(respuestaHorario.datos ?? []));
      // Tras agregar o quitar una relación se conserva el borrador de la matriz, descartando los
      // bloques cuya relación ya no existe. Al consultar una sección se parte de lo guardado.
      establecerBloques((anteriores) =>
        Object.fromEntries(
          Object.entries(version === 0 ? bloquesAMapa(respuestaHorario.datos ?? []) : anteriores).filter(
            ([, bloque]) => ids.has(bloque.asignacionId)
          )
        )
      );
      establecerEstadoHorario('listo');
    }

    cargar();
    return () => {
      cancelado = true;
    };
    // `version` solo refresca las relaciones; el borrador de la matriz se conserva.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta, version]);

  // Al cargar los catálogos, si la URL trae un grado y una sección válidos, se consulta de inmediato.
  useEffect(() => {
    if (estadoCatalogos !== 'listo' || urlRestaurada.current) {
      return;
    }
    urlRestaurada.current = true;
    const valido =
      catalogos.grados.some((grado) => grado.id === gradoId) &&
      catalogos.secciones.some((elemento) => elemento.id === seccion);
    if (valido) {
      establecerConsulta({ gradoId, seccion });
    } else {
      establecerGradoId('');
      establecerSeccion('');
    }
  }, [estadoCatalogos, catalogos, gradoId, seccion]);

  // Con cambios sin guardar, el navegador pide confirmar antes de recargar o cerrar la pestaña.
  useEffect(() => {
    if (!hayCambios) {
      return undefined;
    }
    const avisar = (evento) => {
      evento.preventDefault();
      evento.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [hayCambios]);

  const filtrosCompletos = gradoId !== '' && seccion !== '';

  const seleccionarGrado = (valor) => {
    establecerGradoId(valor);
    establecerSeccion('');
  };

  const verHorario = () => {
    if (!filtrosCompletos) {
      return;
    }
    establecerBloques({});
    establecerBloquesGuardados({});
    establecerVersion(0);
    establecerParametros({ grado: gradoId, seccion });
    establecerConsulta({ gradoId, seccion });
  };

  const agregarAsignacion = useCallback(
    async ({ cursoId, docenteId }) => {
      const resultado = await crearAsignacion({ ...consulta, cursoId, docenteId });
      if (resultado.exitoso) {
        establecerVersion((actual) => actual + 1);
      }
      return resultado.exitoso ? null : resultado.mensaje || MENSAJE_ERROR_GENERICO;
    },
    [consulta]
  );

  const quitarAsignacion = useCallback(async (idAsignacion) => {
    const resultado = await eliminarAsignacion(idAsignacion);
    if (resultado.exitoso) {
      // El backend borra también los bloques de esa relación: se reflejan en el estado guardado.
      establecerBloquesGuardados((anteriores) =>
        Object.fromEntries(Object.entries(anteriores).filter(([, b]) => b.asignacionId !== idAsignacion))
      );
      establecerVersion((actual) => actual + 1);
    }
    return resultado.exitoso ? null : resultado.mensaje || MENSAJE_ERROR_GENERICO;
  }, []);

  const asignarBloque = (dia, franjaId, bloque) => {
    establecerBloques((anteriores) => ({ ...anteriores, [claveBloque(dia, franjaId)]: bloque }));
  };

  const quitarBloque = (dia, franjaId) => {
    establecerBloques((anteriores) => {
      const siguientes = { ...anteriores };
      delete siguientes[claveBloque(dia, franjaId)];
      return siguientes;
    });
  };

  const descartarCambios = () => establecerBloques(bloquesGuardados);

  /** Mueve un bloque a otra celda; si la celda destino está ocupada, ambos bloques se intercambian. */
  const moverBloque = (origen, destino) => {
    const claveOrigen = claveBloque(origen.dia, origen.franjaId);
    const claveDestino = claveBloque(destino.dia, destino.franjaId);
    if (claveOrigen === claveDestino) {
      return;
    }
    establecerBloques((anteriores) => {
      const bloqueOrigen = anteriores[claveOrigen];
      if (!bloqueOrigen) {
        return anteriores;
      }
      const siguientes = { ...anteriores, [claveDestino]: bloqueOrigen };
      if (anteriores[claveDestino]) {
        siguientes[claveOrigen] = anteriores[claveDestino];
      } else {
        delete siguientes[claveOrigen];
      }
      return siguientes;
    });
  };

  const guardar = async () => {
    establecerGuardando(true);
    const resultado = await guardarHorario({ ...consulta, bloques: mapaABloques(bloques) });
    establecerGuardando(false);
    if (resultado.exitoso) {
      establecerBloquesGuardados(bloques);
    }
    return resultado.exitoso ? null : resultado.mensaje || MENSAJE_ERROR_GENERICO;
  };

  const gradoConsultado = catalogos.grados.find((grado) => grado.id === consulta?.gradoId);

  return {
    catalogos,
    estadoCatalogos,
    reintentarCatalogos: () => establecerIntento((actual) => actual + 1),
    filtros: { gradoId, seccion, completos: filtrosCompletos },
    seleccionarGrado,
    seleccionarSeccion: establecerSeccion,
    verHorario,
    consulta,
    tituloConsulta: consulta ? `${gradoConsultado?.nombre ?? consulta.gradoId} ${consulta.seccion}` : '',
    asignaciones: {
      lista: listaAsignaciones,
      estado: estadoHorario,
      reintentar: () => establecerVersion((actual) => actual + 1),
      agregar: agregarAsignacion,
      quitar: quitarAsignacion
    },
    horario: {
      estado: estadoHorario,
      bloques,
      bloquesGuardados,
      ocupaciones,
      hayCambios,
      guardando,
      asignarBloque,
      quitarBloque,
      moverBloque,
      descartarCambios,
      guardar
    }
  };
}
