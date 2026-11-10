import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  aHora,
  aMinutos,
  HORA_FIN_JORNADA,
  bloqueCruzaReceso,
  seSolapan
} from '../utils/tiempo.js';
import {
  actualizarAsignacion,
  consultarCatalogos,
  crearAsignacion,
  eliminarAsignacion,
  guardarHorario,
  listarAsignaciones,
  listarOcupaciones,
  listarSeccionesHorario,
  obtenerHorario,
  obtenerPeriodoMatricula
} from '../services/horariosService.js';

const MENSAJE_ERROR_GENERICO = 'Se registró un error inesperado';
const CATALOGOS_VACIOS = {
  grados: [],
  secciones: [],
  cursos: [],
  docentes: [],
  aulas: [],
  anios: [],
  bimestres: []
};

export function buscarAnioAcademicoVigente(anios, anioVigente = new Date().getFullYear()) {
  return anios.find((anio) => Number(anio.anio) === Number(anioVigente));
}

function horaComparable(hora) {
  return String(hora ?? '').slice(0, 5);
}

function bloqueNormalizado(bloque) {
  const dia = bloque.diaSemana ?? bloque.dia;
  const horaInicio = horaComparable(bloque.horaInicio);
  const horaFin = horaComparable(bloque.horaFin);
  const asignacionId = bloque.asignacionCursoId ?? bloque.asignacionId;
  if (!dia || !horaInicio || !horaFin || asignacionId == null || bloque.aulaId == null) {
    return null;
  }
  return {
    id: bloque.id,
    dia,
    horaInicio,
    horaFin,
    asignacionId,
    aulaId: bloque.aulaId
  };
}

/** Convierte la lista de bloques del backend en un mapa con clave estable. */
function bloquesAMapa(lista) {
  const mapa = {};
  (lista ?? []).forEach((bloque) => {
    const normalizado = bloqueNormalizado(bloque);
    if (!normalizado) return;
    const clave = normalizado.id != null ? `bloque-${normalizado.id}` : bloque.clave;
    if (clave) mapa[clave] = normalizado;
  });
  return mapa;
}

/**
 * Asocia cada error del backend con la clave del bloque dentro del borrador.
 * El `indice` corresponde al orden enviado en `request.bloques`, por eso se
 * resuelve contra la lista de claves capturada al iniciar el guardado.
 */
function conflictoConClaves(error, claves) {
  const indice = Number.isInteger(error?.indice) ? error.indice : null;
  const indiceConflicto = Number.isInteger(error?.indiceConflicto)
    ? error.indiceConflicto
    : null;
  return {
    ...error,
    clave: indice != null && claves[indice] != null ? claves[indice] : null,
    claveConflicto: indiceConflicto != null && claves[indiceConflicto] != null
      ? claves[indiceConflicto]
      : null
  };
}

function serializarBloques(mapa) {
  return JSON.stringify(
    Object.values(mapa)
      .map((bloque) => [
        bloque.id ?? '',
        bloque.dia,
        bloque.horaInicio,
        bloque.horaFin,
        bloque.asignacionId,
        bloque.aulaId
      ].join('|'))
      .sort()
  );
}

function mismoBloque(a, b) {
  if (!a || !b) return false;
  return String(a.dia) === String(b.dia)
    && horaComparable(a.horaInicio) === horaComparable(b.horaInicio)
    && horaComparable(a.horaFin) === horaComparable(b.horaFin)
    && String(a.asignacionId) === String(b.asignacionId)
    && String(a.aulaId) === String(b.aulaId);
}

/**
 * Estado de la pantalla de Horarios: filtros obligatorios (grado y sección),
 * relaciones curso-docente, estado del periodo y matriz semanal editable.
 */
export default function useHorarios() {
  const [catalogos, establecerCatalogos] = useState(CATALOGOS_VACIOS);
  const [estadoCatalogos, establecerEstadoCatalogos] = useState('cargando');
  const [errorCatalogos, establecerErrorCatalogos] = useState('');
  const [estadoSecciones, establecerEstadoSecciones] = useState('inactivo');
  const [errorSecciones, establecerErrorSecciones] = useState('');
  const [intento, establecerIntento] = useState(0);

  const [parametros, establecerParametros] = useSearchParams();
  const [gradoId, establecerGradoId] = useState(parametros.get('grado') ?? '');
  const [seccion, establecerSeccion] = useState(parametros.get('seccion') ?? '');
  const urlRestaurada = useRef(false);
  const seccionDeUrl = useRef(Boolean(parametros.get('seccion')));
  const [consulta, establecerConsulta] = useState(null);
  const [version, establecerVersion] = useState(0);

  const [listaAsignaciones, establecerListaAsignaciones] = useState([]);
  const [ocupaciones, establecerOcupaciones] = useState([]);

  const [bloques, establecerBloques] = useState({});
  const [bloquesGuardados, establecerBloquesGuardados] = useState({});
  const [conflictos, establecerConflictos] = useState([]);
  const [estadoHorario, establecerEstadoHorario] = useState('cargando');
  const [errorHorario, establecerErrorHorario] = useState('');
  const [guardando, establecerGuardando] = useState(false);
  const contadorNuevos = useRef(0);

  const [periodo, establecerPeriodo] = useState(null);
  const [estadoPeriodo, establecerEstadoPeriodo] = useState('inactivo');
  const [errorPeriodo, establecerErrorPeriodo] = useState('');

  const hayCambios = useMemo(
    () => serializarBloques(bloques) !== serializarBloques(bloquesGuardados),
    [bloques, bloquesGuardados]
  );

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      establecerEstadoCatalogos('cargando');
      const resultado = await consultarCatalogos();
      if (cancelado) return;
      if (!resultado.exitoso) {
        establecerErrorCatalogos(resultado.mensaje || 'No se pudieron cargar los catálogos de horarios.');
        establecerEstadoCatalogos('error');
        return;
      }
      establecerErrorCatalogos('');
      establecerCatalogos({ ...CATALOGOS_VACIOS, ...resultado.datos });
      establecerEstadoCatalogos('listo');
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [intento]);

  // Estado del periodo del año académico actual. Solo afecta a la pantalla de horarios.
  useEffect(() => {
    if (estadoCatalogos !== 'listo') return undefined;
    const anioVigente = buscarAnioAcademicoVigente(catalogos.anios);
    if (!anioVigente?.id) {
      establecerPeriodo(null);
      establecerErrorPeriodo(
        `No se encontró el año académico vigente (${new Date().getFullYear()}).`
      );
      establecerEstadoPeriodo('error');
      return undefined;
    }

    let cancelado = false;
    async function cargarPeriodo() {
      establecerEstadoPeriodo('cargando');
      establecerErrorPeriodo('');
      const resultado = await obtenerPeriodoMatricula(anioVigente.id);
      if (cancelado) return;
      if (!resultado.exitoso) {
        establecerPeriodo(null);
        establecerErrorPeriodo(
          resultado.mensaje || 'No se pudo consultar el periodo de matrícula.'
        );
        establecerEstadoPeriodo('error');
        return;
      }
      establecerPeriodo(resultado.datos ?? null);
      establecerEstadoPeriodo('listo');
    }

    cargarPeriodo();
    return () => {
      cancelado = true;
    };
  }, [estadoCatalogos, catalogos.anios]);

  useEffect(() => {
    if (estadoCatalogos !== 'listo') return undefined;
    if (!gradoId) {
      establecerCatalogos((anteriores) => ({ ...anteriores, secciones: [] }));
      establecerEstadoSecciones('inactivo');
      establecerErrorSecciones('');
      return undefined;
    }

    const anioVigente = buscarAnioAcademicoVigente(catalogos.anios);
    if (!anioVigente?.id) {
      establecerCatalogos((anteriores) => ({ ...anteriores, secciones: [] }));
      establecerErrorSecciones(
        `No se encontró el año académico vigente (${new Date().getFullYear()}).`
      );
      establecerEstadoSecciones('error');
      return undefined;
    }

    let cancelado = false;
    async function cargarSecciones() {
      establecerEstadoSecciones('cargando');
      establecerErrorSecciones('');
      establecerCatalogos((anteriores) => ({ ...anteriores, secciones: [] }));
      const resultado = await listarSeccionesHorario({
        gradoId,
        anioId: anioVigente.id,
        anio: anioVigente.anio
      });
      if (cancelado) return;
      if (!resultado.exitoso) {
        establecerErrorSecciones(resultado.mensaje || 'No se pudieron cargar las secciones del año vigente.');
        establecerEstadoSecciones('error');
        return;
      }
      if (!Array.isArray(resultado.datos)) {
        establecerErrorSecciones('El backend devolvió un listado de secciones no válido.');
        establecerEstadoSecciones('error');
        return;
      }
      establecerCatalogos((anteriores) => ({ ...anteriores, secciones: resultado.datos }));
      establecerEstadoSecciones('listo');
    }

    cargarSecciones();
    return () => {
      cancelado = true;
    };
  }, [estadoCatalogos, gradoId, catalogos.anios]);

  useEffect(() => {
    if (!consulta) return undefined;
    let cancelado = false;

    async function cargar() {
      establecerEstadoHorario('cargando');
      establecerErrorHorario('');
      const [respuestaAsignaciones, respuestaHorario, respuestaOcupaciones] = await Promise.all([
        listarAsignaciones(consulta),
        obtenerHorario(consulta),
        listarOcupaciones(consulta)
      ]);
      if (cancelado) return;
      if (!respuestaAsignaciones.exitoso || !respuestaHorario.exitoso || !respuestaOcupaciones.exitoso) {
        const respuestaFallida = [respuestaAsignaciones, respuestaHorario, respuestaOcupaciones]
          .find((respuesta) => !respuesta.exitoso);
        establecerErrorHorario(respuestaFallida?.mensaje || 'No se pudo cargar el horario.');
        establecerEstadoHorario('error');
        return;
      }
      if (
        !Array.isArray(respuestaAsignaciones.datos) ||
        !Array.isArray(respuestaHorario.datos) ||
        !Array.isArray(respuestaOcupaciones.datos)
      ) {
        establecerErrorHorario('El backend devolvió un listado de horarios con formato no válido.');
        establecerEstadoHorario('error');
        return;
      }
      const asignaciones = respuestaAsignaciones.datos ?? [];
      const ids = new Set(asignaciones.map((asignacion) => String(asignacion.id)));
      establecerListaAsignaciones(asignaciones);
      establecerOcupaciones(respuestaOcupaciones.datos ?? []);
      const bloquesCargados = bloquesAMapa(respuestaHorario.datos ?? []);
      establecerBloquesGuardados(bloquesCargados);
      // Tras agregar o quitar una relación se conserva el borrador de la matriz,
      // descartando los bloques cuya relación ya no existe.
      establecerBloques((anteriores) =>
        Object.fromEntries(
          Object.entries(version === 0 ? bloquesCargados : anteriores).filter(
            ([, bloque]) => ids.has(String(bloque.asignacionId))
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

  useEffect(() => {
    if (estadoCatalogos !== 'listo' || urlRestaurada.current) {
      return;
    }
    urlRestaurada.current = true;
    if (!catalogos.grados.some((grado) => String(grado.id) === String(gradoId))) {
      establecerGradoId('');
      establecerSeccion('');
      seccionDeUrl.current = false;
    }
  }, [estadoCatalogos, catalogos.grados, gradoId]);

  useEffect(() => {
    if (
      estadoSecciones !== 'listo' ||
      !urlRestaurada.current ||
      !seccionDeUrl.current
    ) return;

    seccionDeUrl.current = false;
    const seccionSeleccionada = catalogos.secciones.find(
      (elemento) => String(elemento.id) === String(seccion)
    );
    if (!seccionSeleccionada) {
      establecerSeccion('');
      return;
    }
    establecerConsulta({
      gradoId,
      seccion,
      seccionId: seccion,
      anioAcademicoId: seccionSeleccionada.anioAcademicoId,
      anioId: seccionSeleccionada.anioAcademicoId,
      anioAcademico: seccionSeleccionada.anioAcademico
    });
  }, [estadoSecciones, catalogos.secciones, gradoId, seccion]);

  useEffect(() => {
    if (!hayCambios) return undefined;
    const avisar = (evento) => {
      evento.preventDefault();
      evento.returnValue = '';
    };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [hayCambios]);

  const anioVigente = buscarAnioAcademicoVigente(catalogos.anios);
  const puedeEditarAsignaciones = periodo?.asignacionCursoDocenteAbierta === true;
  const puedeEditarBloques = periodo?.crudBloquesHorarioAbierta === true;
  const puedeGenerarSesiones = periodo?.generacionSesionesAbierta === true;

  const filtrosCompletos = gradoId !== '' && seccion !== '';

  const seleccionarGrado = (valor) => {
    establecerGradoId(valor);
    establecerSeccion('');
    establecerCatalogos((anteriores) => ({ ...anteriores, secciones: [] }));
  };

  const verHorario = () => {
    if (!filtrosCompletos) return;
    const seccionSeleccionada = catalogos.secciones.find(
      (elemento) => String(elemento.id) === String(seccion)
    );
    establecerBloques({});
    establecerBloquesGuardados({});
    establecerConflictos([]);
    establecerVersion(0);
    establecerParametros({ grado: gradoId, seccion });
    establecerConsulta({
      gradoId,
      seccion,
      seccionId: seccion,
      anioAcademicoId: seccionSeleccionada?.anioAcademicoId ?? seccionSeleccionada?.anioId,
      anioId: seccionSeleccionada?.anioAcademicoId ?? seccionSeleccionada?.anioId,
      anioAcademico: seccionSeleccionada?.anioAcademico
    });
  };

  const recargarConsulta = () => {
    if (!consulta) return;
    establecerBloques({});
    establecerBloquesGuardados({});
    establecerConflictos([]);
    establecerVersion(0);
    establecerConsulta({ ...consulta });
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

  const editarAsignacion = useCallback(
    async (idAsignacion, { cursoId, docenteId }) => {
      const resultado = await actualizarAsignacion(idAsignacion, {
        cursoId,
        docenteId,
        seccionId: consulta?.seccionId ?? consulta?.seccion
      });
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
      establecerConflictos([]);
      establecerBloquesGuardados((anteriores) =>
        Object.fromEntries(
          Object.entries(anteriores).filter(([, bloque]) => String(bloque.asignacionId) !== String(idAsignacion))
        )
      );
      establecerVersion((actual) => actual + 1);
    }
    return resultado.exitoso ? null : resultado.mensaje || MENSAJE_ERROR_GENERICO;
  }, []);

  const guardarBloque = useCallback(({ clave, bloque }) => {
    establecerConflictos([]);
    establecerBloques((anteriores) => {
      const claveFinal = clave ?? `nuevo-${++contadorNuevos.current}`;
      const anterior = anteriores[claveFinal];
      return {
        ...anteriores,
        [claveFinal]: {
          ...anterior,
          ...bloque,
          horaInicio: horaComparable(bloque.horaInicio),
          horaFin: horaComparable(bloque.horaFin),
          id: anterior?.id
        }
      };
    });
  }, []);

  const quitarBloque = useCallback((clave) => {
    establecerConflictos([]);
    establecerBloques((anteriores) => {
      const siguientes = { ...anteriores };
      delete siguientes[clave];
      return siguientes;
    });
  }, []);

  /**
   * Mueve un bloque a otro día/hora conservando su duración. Si el destino es el
   * inicio de otro bloque de la misma duración, se intercambian.
   */
  const moverBloque = useCallback((clave, destino) => {
    const origen = bloques[clave];
    if (!origen) return 'No se encontró el bloque.';
    if (origen.dia === destino.dia && origen.horaInicio === destino.horaInicio) {
      return null;
    }

    const duracion = aMinutos(origen.horaFin) - aMinutos(origen.horaInicio);
    const horaFin = aHora(aMinutos(destino.horaInicio) + duracion);
    const bloqueMovido = {
      ...origen,
      dia: destino.dia,
      horaInicio: destino.horaInicio,
      horaFin
    };
    if (aMinutos(horaFin) > aMinutos(HORA_FIN_JORNADA)) {
      return 'El bloque se saldría de la jornada.';
    }
    if (bloqueCruzaReceso(bloqueMovido)) {
      return 'El bloque no puede ocupar el recreo de 11:00 a 11:30.';
    }

    const claveDestino = Object.keys(bloques).find(
      (otraClave) => otraClave !== clave
        && bloques[otraClave].dia === destino.dia
        && bloques[otraClave].horaInicio === destino.horaInicio
    );

    if (claveDestino) {
      const destinoBloque = bloques[claveDestino];
      const duracionDestino = aMinutos(destinoBloque.horaFin) - aMinutos(destinoBloque.horaInicio);
      if (duracionDestino !== duracion) {
        return 'Solo se pueden intercambiar bloques de la misma duración.';
      }
      const destinoMovido = {
        ...destinoBloque,
        dia: origen.dia,
        horaInicio: origen.horaInicio,
        horaFin: origen.horaFin
      };
      const colision = Object.entries(bloques).some(([otraClave, otroBloque]) =>
        otraClave !== clave
        && otraClave !== claveDestino
        && otroBloque.dia === destino.dia
        && seSolapan(bloqueMovido.horaInicio, bloqueMovido.horaFin, otroBloque.horaInicio, otroBloque.horaFin)
      );
      if (colision) return 'El bloque se solapa con otro de la misma sección.';
      establecerConflictos([]);
      establecerBloques({
        ...bloques,
        [clave]: bloqueMovido,
        [claveDestino]: destinoMovido
      });
      return null;
    }

    const colision = Object.entries(bloques).some(([otraClave, otroBloque]) =>
      otraClave !== clave
      && otroBloque.dia === destino.dia
      && seSolapan(bloqueMovido.horaInicio, bloqueMovido.horaFin, otroBloque.horaInicio, otroBloque.horaFin)
    );
    if (colision) return 'El bloque se solapa con otro de la misma sección.';

    establecerConflictos([]);
    establecerBloques({ ...bloques, [clave]: bloqueMovido });
    return null;
  }, [bloques]);

  const descartarCambios = () => {
    establecerConflictos([]);
    establecerBloques(bloquesGuardados);
  };

  const guardar = async () => {
    if (!puedeEditarBloques) {
      return {
        error: 'El periodo actual no permite modificar bloques horarios.',
        resumen: null,
        errores: []
      };
    }
    establecerGuardando(true);
    establecerConflictos([]);
    const entradas = Object.entries(bloques);
    const resultado = await guardarHorario({
      ...consulta,
      bloques: entradas.map(([, bloque]) => bloque)
    });
    establecerGuardando(false);

    // El backend no guardó nada: se conserva el borrador y se exponen los
    // conflictos por bloque para señalarlos en la matriz.
    if (!resultado.exitoso) {
      const claves = entradas.map(([clave]) => clave);
      const errores = (Array.isArray(resultado.datos?.errores) ? resultado.datos.errores : [])
        .map((error) => conflictoConClaves(error, claves));
      establecerConflictos(errores);
      return {
        error: resultado.mensaje || MENSAJE_ERROR_GENERICO,
        resumen: null,
        errores
      };
    }

    // Solo se recarga cuando el guardado fue exitoso.
    const respuestaActualizada = await obtenerHorario(consulta);
    if (respuestaActualizada.exitoso) {
      const guardados = bloquesAMapa(respuestaActualizada.datos ?? []);
      establecerBloquesGuardados(guardados);
      establecerBloques(guardados);
    }
    return { error: null, resumen: resultado.datos ?? null, errores: [] };
  };

  const gradoConsultado = catalogos.grados.find(
    (grado) => String(grado.id) === String(consulta?.gradoId)
  );
  const seccionConsultada = catalogos.secciones.find(
    (elemento) => String(elemento.id) === String(consulta?.seccionId ?? consulta?.seccion)
  );

  return {
    catalogos,
    estadoCatalogos,
    reintentarCatalogos: () => establecerIntento((actual) => actual + 1),
    errorCatalogos,
    estadoSecciones,
    errorSecciones,
    errorHorario,
    periodo,
    estadoPeriodo,
    errorPeriodo,
    anioVigente,
    puedeEditarAsignaciones,
    puedeEditarBloques,
    puedeGenerarSesiones,
    filtros: { gradoId, seccion, completos: filtrosCompletos },
    seccionesFiltradas: catalogos.secciones,
    seleccionarGrado,
    seleccionarSeccion: establecerSeccion,
    verHorario,
    recargarConsulta,
    consulta,
    tituloConsulta: consulta
      ? `${gradoConsultado?.nombre ?? consulta.gradoId} ${seccionConsultada?.nombre ?? consulta.seccion}`
      : '',
    asignaciones: {
      lista: listaAsignaciones,
      estado: estadoHorario,
      soloLectura: !puedeEditarAsignaciones,
      agregarDeshabilitado: catalogos.docentes.length === 0 || !puedeEditarAsignaciones,
      reintentar: () => establecerVersion((actual) => actual + 1),
      agregar: agregarAsignacion,
      editar: editarAsignacion,
      quitar: quitarAsignacion
    },
    horario: {
      estado: estadoHorario,
      bloques,
      bloquesGuardados,
      ocupaciones,
      conflictos,
      hayCambios,
      guardando,
      soloLectura: !puedeEditarBloques,
      asignarBloque: guardarBloque,
      guardarBloque,
      quitarBloque,
      moverBloque,
      descartarCambios,
      descartarConflictos: () => establecerConflictos([]),
      guardar
    }
  };
}
