import { useEffect, useState } from 'react';

import { obtenerIconoCurso } from '../constants/iconosCurso.js';
import {
  actualizarCurso,
  actualizarCompetencia,
  crearCurso,
  crearCompetenciaCurso,
  eliminarCurso,
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
    gradoId: cursoApi.gradoId,
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
  const [dialogoCurso, establecerDialogoCurso] = useState(null);
  const [enviandoCurso, establecerEnviandoCurso] = useState(false);
  const [errorCurso, establecerErrorCurso] = useState(null);
  const [idEliminandoCurso, establecerIdEliminandoCurso] = useState(null);

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

  function abrirCrearCurso() {
    establecerErrorCurso(null);
    establecerDialogoCurso({ modo: 'crear', curso: null });
  }

  function abrirEditarCurso(idCurso) {
    const curso = cursos.find((elemento) => elemento.id === idCurso);
    if (!curso) {
      return;
    }

    establecerErrorCurso(null);
    establecerDialogoCurso({ modo: 'editar', curso });
  }

  function abrirEliminarCurso(idCurso) {
    const curso = cursos.find((elemento) => elemento.id === idCurso);
    if (!curso) {
      return;
    }

    establecerErrorCurso(null);
    establecerDialogoCurso({ modo: 'eliminar', curso });
  }

  function cerrarDialogoCurso() {
    if (!enviandoCurso && idEliminandoCurso === null) {
      establecerDialogoCurso(null);
      establecerErrorCurso(null);
    }
  }

  async function guardarCurso(datos) {
    if (!dialogoCurso || dialogoCurso.modo === 'eliminar' || enviandoCurso) {
      return;
    }

    establecerEnviandoCurso(true);
    establecerErrorCurso(null);
    const cursoRequest = {
      nombre: datos.nombre,
      descripcion: datos.descripcion
    };
    const resultado = dialogoCurso.modo === 'crear'
      ? await crearCurso(cursoRequest)
      : await actualizarCurso(dialogoCurso.curso.id, cursoRequest);
    establecerEnviandoCurso(false);

    if (!resultado.exitoso) {
      establecerErrorCurso(resultado.mensaje || 'No se pudo guardar el curso.');
      return;
    }

    if (dialogoCurso.modo === 'crear') {
      if (resultado.datos && typeof resultado.datos === 'object' && resultado.datos.id !== undefined) {
        establecerCursos((anteriores) => [
          ...anteriores,
          transformarCurso({ ...cursoRequest, ...resultado.datos })
        ]);
      } else {
        establecerIntento((valor) => valor + 1);
      }
    } else if (resultado.datos && typeof resultado.datos === 'object') {
      const cursoActualizado = transformarCurso({
        ...dialogoCurso.curso,
        ...resultado.datos,
        ...cursoRequest
      });
      establecerCursos((anteriores) => anteriores.map((curso) => (
        curso.id === dialogoCurso.curso.id ? cursoActualizado : curso
      )));
    } else {
      establecerCursos((anteriores) => anteriores.map((curso) => (
        curso.id === dialogoCurso.curso.id
          ? transformarCurso({ ...curso, ...cursoRequest })
          : curso
      )));
    }

    establecerDialogoCurso(null);
  }

  async function confirmarEliminarCurso() {
    if (!dialogoCurso || dialogoCurso.modo !== 'eliminar' || idEliminandoCurso !== null) {
      return;
    }

    const idCurso = dialogoCurso.curso.id;
    establecerIdEliminandoCurso(idCurso);
    establecerErrorCurso(null);
    const resultado = await eliminarCurso(idCurso);
    establecerIdEliminandoCurso(null);

    if (!resultado.exitoso) {
      establecerErrorCurso(resultado.mensaje || 'No se pudo eliminar el curso.');
      return;
    }

    establecerCursos((anteriores) => anteriores.filter((curso) => curso.id !== idCurso));
    establecerDialogoCurso(null);
  }

  function abrirAgregarCompetencia(idCurso) {
    establecerErrorCompetencia(null);
    establecerModalCompetencias('agregar');
    establecerIdCursoCompetencia(idCurso);
  }

  function volverAGestionarCompetencias() {
    if (!enviandoCompetencia) {
      establecerErrorCompetencia(null);
      establecerModalCompetencias(cursoCompetencia ? 'ver' : null);
      if (!cursoCompetencia) {
        establecerIdCursoCompetencia(null);
      }
    }
  }

  function cerrarDialogoCompetencias() {
    if (!enviandoCompetencia) {
      establecerIdCursoCompetencia(null);
      establecerErrorCompetencia(null);
      establecerErrorListadoCompetencias(null);
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

    const resultado = await actualizarCompetencia(
      cursoCompetencia.id,
      competenciaEditar.id,
      { nombre, descripcion }
    );

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
      const competenciasActualizadas = [...competenciasCurso, competenciaCreada];
      establecerCompetenciasCurso(competenciasActualizadas);
      establecerCursos((anteriores) => anteriores.map((curso) => (
        curso.id === cursoCompetencia.id
          ? transformarCurso({
            ...curso,
            competencias: competenciasActualizadas
          })
          : curso
      )));
    } else {
      const resultadoListado = await listarCompetenciasCurso(cursoCompetencia.id);
      if (resultadoListado.exitoso && Array.isArray(resultadoListado.datos)) {
        establecerCompetenciasCurso(resultadoListado.datos);
        establecerCursos((anteriores) => anteriores.map((curso) => (
          curso.id === cursoCompetencia.id
            ? transformarCurso({ ...curso, competencias: resultadoListado.datos })
            : curso
        )));
      } else {
        establecerErrorListadoCompetencias(
          resultadoListado.mensaje || 'No se pudieron actualizar las competencias.'
        );
      }
    }
    establecerModalCompetencias('ver');
  }

  return {
    cursos,
    estado,
    reintentar,
    dialogoCurso: {
      dialogo: dialogoCurso,
      enviando: enviandoCurso,
      error: errorCurso,
      idEliminando: idEliminandoCurso,
      abrirCrear: abrirCrearCurso,
      abrirEditar: abrirEditarCurso,
      abrirEliminar: abrirEliminarCurso,
      cerrar: cerrarDialogoCurso,
      guardar: guardarCurso,
      eliminar: confirmarEliminarCurso
    },
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
      cerrar: cerrarDialogoCompetencias,
      volverAGestionar: volverAGestionarCompetencias,
      agregar: agregarCompetencia,
      editar: abrirEditarCompetencia,
      competenciaEditar,
      guardarEdicion: guardarEdicionCompetencia,
      eliminar: eliminarCompetencia
    }
  };
}
