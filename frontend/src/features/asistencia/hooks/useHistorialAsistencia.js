import { useCallback, useEffect, useState } from 'react';

import { ROLES } from '../../../shared/auth/roles.js';
import {
  consultarHistorialAsistencia,
  listarEstudiantesACargo
} from '../services/asistenciaService.js';
import { resumirAsistencia } from '../utils/estadosAsistencia.js';

const TAMANO_PAGINA = 10;

function rangoAnioActual() {
  const anio = new Date().getFullYear();
  return {
    desde: `${anio}-01-01`,
    hasta: `${anio}-12-31`
  };
}

export default function useHistorialAsistencia(usuario) {
  const rol = usuario?.rol;
  const esApoderado = rol === ROLES.APODERADO;
  const rango = rangoAnioActual();

  const [estudiantes, establecerEstudiantes] = useState([]);
  const [estudianteId, fijarEstudianteId] = useState(
    rol === ROLES.ESTUDIANTE ? String(usuario?.id ?? '') : ''
  );
  const [cursos, establecerCursos] = useState([]);
  const [cursoId, fijarCursoId] = useState('');
  const [fechaInicio, fijarFechaInicio] = useState(rango.desde);
  const [fechaFin, fijarFechaFin] = useState(rango.hasta);
  const [registros, establecerRegistros] = useState([]);
  const [resumen, establecerResumen] = useState({ ...resumirAsistencia([]), total: 0 });
  const [pagina, establecerPagina] = useState(0);
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
    fijarFechaInicio(valor);
    establecerPagina(0);
  }, []);

  const establecerFechaFin = useCallback((valor) => {
    fijarFechaFin(valor);
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
        return;
      }
      const lista = Array.isArray(respuesta.datos) ? respuesta.datos : [];
      establecerEstudiantes(lista);
      fijarEstudianteId((actual) => actual || String(lista[0]?.id ?? ''));
    }
    cargarEstudiantes();
    return () => {
      activo = false;
    };
  }, [esApoderado]);

  useEffect(() => {
    if (esApoderado && !estudianteId) {
      establecerRegistros([]);
      establecerResumen(resumirAsistencia([]));
      establecerCargando(false);
      return undefined;
    }
    if (!rol || !fechaInicio || !fechaFin || fechaFin < fechaInicio) {
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
        desde: fechaInicio,
        hasta: fechaFin,
        page: pagina,
        size: TAMANO_PAGINA
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
  }, [rol, esApoderado, estudianteId, cursoId, fechaInicio, fechaFin, pagina, intento]);

  const recargar = useCallback(() => establecerIntento((valor) => valor + 1), []);

  return {
    esApoderado,
    estudiantes,
    estudianteId,
    establecerEstudianteId,
    cursos,
    cursoId,
    establecerCursoId,
    fechaInicio,
    establecerFechaInicio,
    fechaFin,
    establecerFechaFin,
    registros,
    resumen,
    pagina,
    totalPaginas,
    totalRegistros,
    tamanoPagina: TAMANO_PAGINA,
    cambiarPagina,
    cargando,
    error,
    recargar
  };
}
