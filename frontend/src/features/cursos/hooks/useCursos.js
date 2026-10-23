import { useEffect, useState } from 'react';

import { obtenerIconoCurso } from '../constants/iconosCurso.js';
import {
  actualizarCompetencia,
  crearCompetenciaCurso,
  eliminarCompetenciaCurso,
  listarCompetenciasCurso,
  listarCursos
} from '../services/cursosService.js';

/**
 * Transforma el contrato de la API al modelo de vista de las tarjetas.
 *
 * @param {Object} cursoApi
 * @returns {Object} CursoVista
 */
function transformarCurso(cursoApi) {
  const competencias = Array.isArray(cursoApi.competencias) ? cursoApi.competencias : [];

  return {
    id: String(cursoApi.id),
    nombre: cursoApi.nombre,
    descripcion: cursoApi.descripcion,
    icono: obtenerIconoCurso(cursoApi.nombre),
    competencias,
    cantidadCompetencias: competencias.length,
    textoCompetencias: competencias.length === 1
      ? '1 competencia'
      : competencias.length > 1
        ? `${competencias.length} competencias`
        : ''
  };
}

/**
 * Carga todos los cursos de forma independiente del grado.
 *
 * @returns {{
 *   cursos: Array,
 *   estado: 'cargando'|'listo'|'error',
 *   reintentar: () => void
 * }}
 */
export default function useCursos() {
  const [cursos, establecerCursos] = useState([]);
  const [estado, establecerEstado] = useState('cargando');
  const [intento, establecerIntento] = useState(0);
  const [idCursoCompetencia, establecerIdCursoCompetencia] = useState(null);
  const [enviandoCompetencia, establecerEnviandoCompetencia] = useState(false);
  const [errorCompetencia, establecerErrorCompetencia] = useState(null);
  const [modalCompetencias, establecerModalCompetencias] = useState(null);
  const [competenciasCurso, establecerCompetenciasCurso] = useState([]);
  const [cargandoCompetencias, establecerCargandoCompetencias] = useState(false);
  const [errorListadoCompetencias, establecerErrorListadoCompetencias] = useState(null);
  const [competenciaEditar, establecerCompetenciaEditar] = useState(null);
  const [idEliminandoCompetencia, establecerIdEliminandoCompetencia] = useState(null);
  const [errorEliminarCompetencia, establecerErrorEliminarCompetencia] = useState(null);

  const cursoCompetencia = cursos.find((curso) => curso.id === idCursoCompetencia) ?? null;

  useEffect(() => {
    const controlador = new AbortController();

    async function cargar() {
      establecerEstado('cargando');

      const resultado = await listarCursos({ signal: controlador.signal });

      if (!resultado.exitoso) {
        if (!resultado.cancelada) {
          establecerEstado('error');
        }
        return;
      }

      establecerCursos((resultado.datos ?? []).map(transformarCurso));
      establecerEstado('listo');
    }

    cargar();

    return () => controlador.abort();
  }, [intento]);

  function reintentar() {
    establecerIntento((valor) => valor + 1);
  }

  function abrirAgregarCompetencia(idCurso) {
    establecerErrorCompetencia(null);
    establecerModalCompetencias('agregar');
    establecerIdCursoCompetencia(idCurso);
  }

  function cerrarAgregarCompetencia() {
    if (!enviandoCompetencia) {
      establecerIdCursoCompetencia(null);
      establecerErrorCompetencia(null);
      establecerModalCompetencias(null);
    }
  }

  async function abrirVerCompetencias(idCurso) {
    const curso = cursos.find((elemento) => elemento.id === idCurso);
    if (!curso) {
      return;
    }

    establecerIdCursoCompetencia(idCurso);
    establecerModalCompetencias('ver');
    establecerCargandoCompetencias(true);
    establecerErrorListadoCompetencias(null);

    const resultado = await listarCompetenciasCurso(idCurso);
    establecerCargandoCompetencias(false);

    if (!resultado.exitoso) {
      establecerErrorListadoCompetencias(resultado.mensaje || 'No se pudieron cargar las competencias.');
      return;
    }

    if (!Array.isArray(resultado.datos)) {
      establecerErrorListadoCompetencias('El backend devolvió un formato de competencias no válido.');
      return;
    }

    establecerCompetenciasCurso(resultado.datos);
    establecerCursos((anteriores) => anteriores.map((actual) => (
      actual.id === idCurso ? transformarCurso({ ...actual, competencias: resultado.datos }) : actual
    )));
  }

  function abrirEditarCompetencia(competencia) {
    establecerCompetenciaEditar(competencia);
    establecerErrorCompetencia(null);
    establecerModalCompetencias('editar');
  }

  async function guardarEdicionCompetencia({ nombre, descripcion }) {
    if (!competenciaEditar || enviandoCompetencia) {
      return;
    }

    establecerEnviandoCompetencia(true);
    establecerErrorCompetencia(null);

    const resultado = await actualizarCompetencia(competenciaEditar.id, { nombre, descripcion });

    establecerEnviandoCompetencia(false);
    if (!resultado.exitoso) {
      establecerErrorCompetencia(resultado.mensaje || 'No se pudo actualizar la competencia.');
      return;
    }

    const competenciaActualizada = resultado.datos && typeof resultado.datos === 'object'
      ? { ...competenciaEditar, ...resultado.datos }
      : { ...competenciaEditar, nombre, descripcion };
    const competenciasActualizadas = competenciasCurso.map((actual) => (
      String(actual.id) === String(competenciaEditar.id) ? competenciaActualizada : actual
    ));

    establecerCompetenciasCurso(competenciasActualizadas);
    establecerCursos((anteriores) => anteriores.map((curso) => (
      curso.id === idCursoCompetencia
        ? transformarCurso({ ...curso, competencias: competenciasActualizadas })
        : curso
    )));
    establecerCompetenciaEditar(null);
    establecerModalCompetencias('ver');
  }

  async function eliminarCompetencia(competencia) {
    if (!cursoCompetencia || idEliminandoCompetencia !== null) {
      return false;
    }

    establecerIdEliminandoCompetencia(String(competencia.id));
    establecerErrorEliminarCompetencia(null);

    const resultado = await eliminarCompetenciaCurso(cursoCompetencia.id, String(competencia.id));
    establecerIdEliminandoCompetencia(null);

    if (!resultado.exitoso) {
      establecerErrorEliminarCompetencia(
        resultado.mensaje || 'No se pudo eliminar la competencia.'
      );
      return false;
    }

    const competenciasActualizadas = competenciasCurso.filter(
      (actual) => String(actual.id) !== String(competencia.id)
    );
    establecerCompetenciasCurso(competenciasActualizadas);
    establecerCursos((anteriores) => anteriores.map((curso) => (
      curso.id === cursoCompetencia.id
        ? transformarCurso({ ...curso, competencias: competenciasActualizadas })
        : curso
    )));
    return true;
  }

  async function agregarCompetencia({ nombre, descripcion }) {
    if (!cursoCompetencia || enviandoCompetencia) {
      return;
    }

    establecerEnviandoCompetencia(true);
    establecerErrorCompetencia(null);

    const resultado = await crearCompetenciaCurso(cursoCompetencia.id, { nombre, descripcion });

    establecerEnviandoCompetencia(false);
    if (!resultado.exitoso) {
      establecerErrorCompetencia(resultado.mensaje || 'No se pudo agregar la competencia.');
      return;
    }

    if (resultado.datos && typeof resultado.datos === 'object') {
      const competenciaCreada = resultado.datos;
      establecerCursos((anteriores) => anteriores.map((curso) => (
        curso.id === cursoCompetencia.id
          ? transformarCurso({
            ...curso,
            competencias: [
              ...(curso.competencias ?? []),
              competenciaCreada
            ]
          })
          : curso
      )));
    } else {
      establecerIntento((valor) => valor + 1);
    }
    establecerIdCursoCompetencia(null);
  }

  return {
    cursos,
    estado,
    reintentar,
    dialogoCompetencia: {
      curso: cursoCompetencia,
      modo: modalCompetencias,
      enviando: enviandoCompetencia,
      error: errorCompetencia,
      competencias: competenciasCurso,
      cargandoCompetencias,
      errorListado: errorListadoCompetencias,
      idEliminando: idEliminandoCompetencia,
      errorEliminar: errorEliminarCompetencia,
      abrir: abrirAgregarCompetencia,
      ver: abrirVerCompetencias,
      cerrar: cerrarAgregarCompetencia,
      agregar: agregarCompetencia,
      editar: abrirEditarCompetencia,
      competenciaEditar,
      guardarEdicion: guardarEdicionCompetencia,
      eliminar: eliminarCompetencia
    }
  };
}
