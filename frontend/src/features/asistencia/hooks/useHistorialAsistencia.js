import { useCallback, useEffect, useState } from 'react';

import { ROLES } from '../../../shared/auth/roles.js';
import {
  consultarHistorialAsistencia,
  listarEstudiantesACargo
} from '../services/asistenciaService.js';
import { resumirAsistencia } from '../utils/estadosAsistencia.js';

/** Filas por página que se pueden elegir en el pie de la tabla (las mismas de Usuarios, Matrículas y Pagos). */
export const OPCIONES_TAMANO_PAGINA = Object.freeze([10, 25, 50, 100]);
const TAMANO_PAGINA_INICIAL = 10;

/**
 * Historial de asistencia del rol autenticado. El backend limita la consulta al año académico de consulta
 * (HU-GEMAP-11): mientras el usuario no elija fechas se muestra todo ese año, y las fechas que muestra el filtro
 * salen del año que devuelve la respuesta.
 */
export default function useHistorialAsistencia(usuario) {
  const rol = usuario?.rol;
  const esApoderado = rol === ROLES.APODERADO;

  const [estudiantes, establecerEstudiantes] = useState([]);
  // Un apoderado no sabe si tiene estudiantes hasta que llega la lista: hasta entonces no se muestra el aviso de «sin estudiantes».
  const [estudiantesListos, establecerEstudiantesListos] = useState(!esApoderado);
  const [estudianteId, fijarEstudianteId] = useState(
    rol === ROLES.ESTUDIANTE ? String(usuario?.id ?? '') : ''
  );
  const [cursos, establecerCursos] = useState([]);
  const [cursoId, fijarCursoId] = useState('');
  // `null` = sin elegir: se usa el año de consulta completo.
  const [desdeElegido, fijarDesdeElegido] = useState(null);
  const [hastaElegido, fijarHastaElegido] = useState(null);
  const [anioConsulta, establecerAnioConsulta] = useState(null);
  const [registros, establecerRegistros] = useState([]);
  const [resumen, establecerResumen] = useState({ ...resumirAsistencia([]), total: 0 });
  const [pagina, establecerPagina] = useState(0);
  const [tamanoPagina, fijarTamanoPagina] = useState(TAMANO_PAGINA_INICIAL);
  const [totalPaginas, establecerTotalPaginas] = useState(0);
  const [totalRegistros, establecerTotalRegistros] = useState(0);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);

  const establecerEstudianteId = useCallback((valor) => {
    fijarEstudianteId(valor);
    establecerPagina(0);
  }, []);

  const establecerCursoId = useCallback((valor) => {
    fijarCursoId(valor);
    establecerPagina(0);
  }, []);

  const establecerFechaInicio = useCallback((valor) => {
    fijarDesdeElegido(valor || null);
    establecerPagina(0);
  }, []);

  const establecerFechaFin = useCallback((valor) => {
    fijarHastaElegido(valor || null);
    establecerPagina(0);
  }, []);

  const cambiarTamanoPagina = useCallback((valor) => {
    if (!OPCIONES_TAMANO_PAGINA.includes(valor)) return;
    fijarTamanoPagina(valor);
    establecerPagina(0);
  }, []);

  const cambiarPagina = useCallback((valor) => {
    establecerPagina(Math.max(0, Number(valor) || 0));
  }, []);

  useEffect(() => {
    if (!esApoderado) return undefined;
    let activo = true;
    async function cargarEstudiantes() {
      const respuesta = await listarEstudiantesACargo();
      if (!activo) return;
      if (!respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudieron cargar los estudiantes a cargo.');
        establecerCargando(false);
        establecerEstudiantesListos(true);
        return;
      }
      const lista = Array.isArray(respuesta.datos) ? respuesta.datos : [];
      establecerEstudiantes(lista);
      fijarEstudianteId((actual) => actual || String(lista[0]?.id ?? ''));
      establecerEstudiantesListos(true);
    }
    cargarEstudiantes();
    return () => {
      activo = false;
    };
  }, [esApoderado]);

  useEffect(() => {
    if (esApoderado && !estudianteId) {
      // Sin estudiante elegido solo se deja de cargar cuando ya se sabe que no hay ninguno (o falló la lista).
      if (estudiantesListos) {
        establecerRegistros([]);
        establecerResumen(resumirAsistencia([]));
        establecerCargando(false);
      }
      return undefined;
    }
    if (!rol || (desdeElegido && hastaElegido && hastaElegido < desdeElegido)) {
      establecerRegistros([]);
      establecerResumen(resumirAsistencia([]));
      establecerCargando(false);
      return undefined;
    }

    let activo = true;
    async function cargar() {
      establecerCargando(true);
      establecerError('');
      const respuesta = await consultarHistorialAsistencia({
        rol,
        estudianteId,
        cursoId,
        desde: desdeElegido ?? undefined,
        hasta: hastaElegido ?? undefined,
        page: pagina,
        size: tamanoPagina
      });
      if (!activo) return;
      if (!respuesta.exitoso) {
        establecerRegistros([]);
        establecerResumen(resumirAsistencia([]));
        establecerTotalRegistros(0);
        establecerTotalPaginas(0);
        establecerError(respuesta.mensaje || 'No se pudo consultar el historial de asistencia.');
        establecerCargando(false);
        return;
      }
      const datos = respuesta.datos ?? {};
      const lista = Array.isArray(datos.registros) ? datos.registros : [];
      const resumenPagina = resumirAsistencia(lista);
      const numero = (valor, respaldo) => (
        Number.isFinite(Number(valor)) ? Number(valor) : respaldo
      );
      const totalRegistrosRespuesta = numero(datos.totalRegistros, lista.length);
      const totalPresentes = numero(datos.totalPresentes, resumenPagina.presentes);
      const totalTardanzas = numero(datos.totalTardanzas, resumenPagina.tardanzas);
      const totalFaltas = numero(datos.totalFaltas, resumenPagina.faltas);
      const totalJustificadas = numero(datos.totalJustificadas, resumenPagina.justificadas);

      establecerCursos(Array.isArray(datos.cursos) ? datos.cursos : []);
      establecerAnioConsulta(datos.anioAcademico ?? null);
      establecerRegistros(lista);
      establecerResumen({
        total: totalRegistrosRespuesta,
        presentes: totalPresentes,
        tardanzas: totalTardanzas,
        faltas: totalFaltas,
        justificadas: totalJustificadas,
        porcentaje: numero(datos.porcentajeAsistencia, resumenPagina.porcentaje)
      });
      establecerTotalRegistros(totalRegistrosRespuesta);
      establecerTotalPaginas(
        Number.isInteger(datos.totalPaginas) ? datos.totalPaginas : (lista.length ? 1 : 0)
      );
      establecerCargando(false);
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [
    rol,
    esApoderado,
    estudiantesListos,
    estudianteId,
    cursoId,
    desdeElegido,
    hastaElegido,
    pagina,
    tamanoPagina,
    intento
  ]);

  const recargar = useCallback(() => establecerIntento((valor) => valor + 1), []);

  // Filtros que el usuario cambió respecto a los iniciales (el estudiante de un apoderado no cuenta: siempre hay uno).
  const hayFiltros = cursoId !== '' || desdeElegido !== null || hastaElegido !== null;

  const limpiarFiltros = useCallback(() => {
    fijarCursoId('');
    fijarDesdeElegido(null);
    fijarHastaElegido(null);
    establecerPagina(0);
  }, []);

  return {
    esApoderado,
    estudiantes,
    estudiantesListos,
    estudianteId,
    establecerEstudianteId,
    cursos,
    cursoId,
    establecerCursoId,
    anioConsulta,
    fechaInicio: desdeElegido ?? anioConsulta?.fechaInicio ?? '',
    establecerFechaInicio,
    fechaFin: hastaElegido ?? anioConsulta?.fechaFin ?? '',
    establecerFechaFin,
    registros,
    resumen,
    pagina,
    totalPaginas,
    totalRegistros,
    tamanoPagina,
    cambiarTamanoPagina,
    cambiarPagina,
    hayFiltros,
    limpiarFiltros,
    cargando,
    error,
    recargar
  };
}
