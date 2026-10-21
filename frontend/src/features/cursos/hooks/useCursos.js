import { useEffect, useRef, useState } from 'react';

import useAuth from '../../../shared/auth/useAuth.js';
import { GRADOS_ACADEMICOS, GRADO_INICIAL, obtenerEtiquetaGrado } from '../constants/gradosAcademicos.js';
import { obtenerIconoCurso } from '../constants/iconosCurso.js';
import { MENSAJE_ERROR_INESPERADO } from '../constants/mensajesCursos.js';
import { puedeGestionarCursos } from '../constants/permisosCursos.js';
import {
  listarCursosPorGrado,
  crearCurso,
  guardarCompetenciasCurso
} from '../services/cursosService.js';

/**
 * @param {number} cantidad
 * @returns {string}
 */
function formatearCantidadCompetencias(cantidad) {
  return cantidad === 1 ? '1 competencia' : `${cantidad} competencias`;
}

/**
 * Transforma un curso de la API en el modelo de vista que consumen los componentes.
 * Los componentes no formatean nada.
 *
 * @param {Object} cursoApi
 * @returns {Object} CursoVista
 */
function transformarCurso(cursoApi) {
  const idsAsignados = cursoApi.competenciasAsignadas ?? [];

  return {
    id: cursoApi.id,
    nombre: cursoApi.nombre,
    descripcion: cursoApi.descripcion,
    icono: obtenerIconoCurso(cursoApi.nombre),
    competenciasDisponibles: cursoApi.competenciasDisponibles ?? [],
    idsAsignados,
    textoAsignadas: idsAsignados.length > 0 ? formatearCantidadCompetencias(idsAsignados.length) : ''
  };
}

/**
 * Datos y comportamiento de la pantalla Cursos (HU-EVAL-08): carga los cursos del grado
 * seleccionado, crea cursos y guarda las competencias asignadas a cada uno.
 *
 * Qué puede hacer cada rol se decide en `constants/permisosCursos.js`.
 *
 * @returns {{
 *   grados: ReadonlyArray<{ valor: string, etiqueta: string }>,
 *   grado: string,
 *   etiquetaGrado: string,
 *   establecerGrado: (valor: string) => void,
 *   cursos: Array,
 *   estado: 'cargando'|'listo'|'error',
 *   reintentar: () => void,
 *   puedeGestionar: boolean,
 *   aviso: string,
 *   dialogoCompetencias: {
 *     curso: Object|null, guardando: boolean, error: string|null,
 *     abrir: (idCurso: string, elementoOrigen?: HTMLElement) => void,
 *     cerrar: () => void,
 *     guardar: (idsCompetencias: string[]) => Promise<void>
 *   },
 *   dialogoCrear: {
 *     abierto: boolean, enviando: boolean, error: string|null,
 *     abrir: (elementoOrigen?: HTMLElement) => void,
 *     cerrar: () => void,
 *     crear: (datos: { nombre: string, descripcion: string }) => Promise<void>
 *   }
 * }}
 */
export default function useCursos() {
  // TODO(pregunta): confirmar que `useAuth()` expone la sesión como `usuario` con el campo `rol`.
  const { usuario } = useAuth();
  const puedeGestionar = puedeGestionarCursos(usuario?.rol);

  const [grado, establecerGradoEstado] = useState(GRADO_INICIAL);
  const [cursos, establecerCursos] = useState([]);
  const [estado, establecerEstado] = useState('cargando');
  const [intento, establecerIntento] = useState(0);
  const [aviso, establecerAviso] = useState('');

  const [idCursoCompetencias, establecerIdCursoCompetencias] = useState(null);
  const [guardando, establecerGuardando] = useState(false);
  const [errorCompetencias, establecerErrorCompetencias] = useState(null);

  const [crearAbierto, establecerCrearAbierto] = useState(false);
  const [enviando, establecerEnviando] = useState(false);
  const [errorCrear, establecerErrorCrear] = useState(null);

  const secuenciaRef = useRef(0);
  const elementoOrigenRef = useRef(null);
  const devolverFocoRef = useRef(false);

  const etiquetaGrado = obtenerEtiquetaGrado(grado);
  const cursoCompetencias = cursos.find((curso) => curso.id === idCursoCompetencias) ?? null;

  // Carga (y recarga) los cursos del grado seleccionado. Descarta respuestas de solicitudes viejas.
  useEffect(() => {
    let cancelado = false;
    const idSolicitud = (secuenciaRef.current += 1);

    async function cargar() {
      establecerEstado('cargando');

      const resultado = await listarCursosPorGrado(grado);

      if (cancelado || idSolicitud !== secuenciaRef.current) {
        return;
      }

      if (!resultado.exitoso) {
        establecerEstado('error');
        return;
      }

      establecerCursos((resultado.datos ?? []).map(transformarCurso));
      establecerEstado('listo');
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [grado, intento]);

  // Devuelve el foco al botón que abrió un diálogo, una vez que el diálogo ya se desmontó.
  useEffect(() => {
    if (idCursoCompetencias !== null || crearAbierto || !devolverFocoRef.current) {
      return;
    }

    devolverFocoRef.current = false;
    const elementoOrigen = elementoOrigenRef.current;
    elementoOrigenRef.current = null;

    if (elementoOrigen && document.contains(elementoOrigen)) {
      elementoOrigen.focus();
    }
  }, [idCursoCompetencias, crearAbierto]);

  function establecerGrado(valor) {
    establecerAviso('');
    establecerGradoEstado(valor);
  }

  function reintentar() {
    establecerIntento((valor) => valor + 1);
  }

  // ── Diálogo de competencias ─────────────────────────────────────────────
  function abrirCompetencias(idCurso, elementoOrigen) {
    elementoOrigenRef.current = elementoOrigen ?? null;
    devolverFocoRef.current = false;
    establecerAviso('');
    establecerErrorCompetencias(null);
    establecerIdCursoCompetencias(idCurso);
  }

  function cerrarCompetencias() {
    devolverFocoRef.current = true;
    establecerIdCursoCompetencias(null);
    establecerErrorCompetencias(null);
  }

  async function guardarCompetencias(idsCompetencias) {
    if (guardando || !cursoCompetencias) {
      return;
    }

    establecerGuardando(true);
    establecerErrorCompetencias(null);

    const resultado = await guardarCompetenciasCurso(cursoCompetencias.id, idsCompetencias);

    establecerGuardando(false);

    if (!resultado.exitoso || !resultado.datos) {
      establecerErrorCompetencias(resultado.mensaje || MENSAJE_ERROR_INESPERADO);
      return;
    }

    const cursoActualizado = transformarCurso(resultado.datos);
    establecerCursos((anteriores) =>
      anteriores.map((curso) => (curso.id === cursoActualizado.id ? cursoActualizado : curso))
    );
    establecerAviso(`Competencias de ${cursoActualizado.nombre} guardadas.`);
    cerrarCompetencias();
  }

  // ── Diálogo de crear curso ──────────────────────────────────────────────
  function abrirCrear(elementoOrigen) {
    elementoOrigenRef.current = elementoOrigen ?? null;
    devolverFocoRef.current = false;
    establecerAviso('');
    establecerErrorCrear(null);
    establecerCrearAbierto(true);
  }

  function cerrarCrear() {
    devolverFocoRef.current = true;
    establecerCrearAbierto(false);
    establecerErrorCrear(null);
  }

  async function crear({ nombre, descripcion }) {
    if (enviando) {
      return;
    }

    establecerEnviando(true);
    establecerErrorCrear(null);

    const resultado = await crearCurso({ nombre, descripcion, grado });

    establecerEnviando(false);

    if (!resultado.exitoso || !resultado.datos) {
      establecerErrorCrear(resultado.mensaje || MENSAJE_ERROR_INESPERADO);
      return;
    }

    const cursoNuevo = transformarCurso(resultado.datos);
    establecerCursos((anteriores) => [...anteriores, cursoNuevo]);
    establecerAviso(`Curso «${cursoNuevo.nombre}» creado en ${etiquetaGrado}.`);
    cerrarCrear();
  }

  return {
    grados: GRADOS_ACADEMICOS,
    grado,
    etiquetaGrado,
    establecerGrado,
    cursos,
    estado,
    reintentar,
    puedeGestionar,
    aviso,
    dialogoCompetencias: {
      curso: cursoCompetencias,
      guardando,
      error: errorCompetencias,
      abrir: abrirCompetencias,
      cerrar: cerrarCompetencias,
      guardar: guardarCompetencias
    },
    dialogoCrear: {
      abierto: crearAbierto,
      enviando,
      error: errorCrear,
      abrir: abrirCrear,
      cerrar: cerrarCrear,
      crear
    }
  };
}
