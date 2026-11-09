import { useEffect, useRef, useState } from 'react';
import {
  obtenerAlumnos,
  obtenerEstructuraMatriculaVigente,
  obtenerSeccionesMatricula
} from '../services/matriculasService.js';

const DEBOUNCE_BUSQUEDA_MS = 300;
const MIN_CARACTERES_BUSQUEDA = 2;

/**
 * Elige el año inicial: el año actual si tiene período vigente; si no,
 * el año vigente más reciente.
 *
 * @param {Array} anios - años académicos con período de matrícula vigente.
 * @returns {Object|null}
 */
function elegirAnioInicial(anios) {
  const ordenados = [...(anios ?? [])].sort((a, b) => Number(b.anio) - Number(a.anio));
  const anioActual = new Date().getFullYear();
  return ordenados.find((anio) => Number(anio.anio) === anioActual)
    ?? ordenados[0]
    ?? null;
}

/**
 * Datos y comportamiento del modal "Asignar alumno a sección".
 * La búsqueda y los selectores consumen los endpoints del backend.
 *
 * @returns {{
 *   busqueda: string, establecerBusqueda: (valor: string) => void,
 *   hayBusqueda: boolean, resultados: Array, buscando: boolean, errorBusqueda: string,
 *   alumnoSeleccionado: Object|null,
 *   seleccionarAlumno: (alumno: Object) => void, quitarAlumno: () => void,
 *   anios: Array, anioId: number|null, seleccionarAnio: (valor: string) => void,
 *   grados: Array, estadoEstructura: 'cargando'|'listo'|'error', errorEstructura: string,
 *   reintentarEstructura: () => void,
 *   gradoId: number|null, seleccionarGrado: (valor: string) => void,
 *   secciones: Array, seccionId: number|null, seleccionarSeccion: (id: number) => void,
 *   anio: Object|null,
 *   asignacion: { alumno: Object, anio: Object, grado: Object, seccion: Object }|null
 * }}
 */
export default function useMatriculas() {
  const [busqueda, establecerBusqueda] = useState('');
  const [busquedaDebounced, establecerBusquedaDebounced] = useState('');
  const [resultados, establecerResultados] = useState([]);
  const [buscando, establecerBuscando] = useState(false);
  const [errorBusqueda, establecerErrorBusqueda] = useState('');
  const [alumnoSeleccionado, establecerAlumnoSeleccionado] = useState(null);

  const [estructura, establecerEstructura] = useState(null);
  const [estadoEstructura, establecerEstadoEstructura] = useState('cargando');
  const [errorEstructura, establecerErrorEstructura] = useState('');
  const [secciones, establecerSecciones] = useState([]);
  const [anioId, establecerAnioId] = useState(null);
  const [gradoId, establecerGradoId] = useState(null);
  const [seccionId, establecerSeccionId] = useState(null);
  const [intentoClave, establecerIntentoClave] = useState(0);

  // Descarta la respuesta de una búsqueda si ya se lanzó otra más reciente.
  const idBusquedaRef = useRef(0);

  // Búsqueda con debounce de 300 ms.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      establecerBusquedaDebounced(busqueda.trim());
    }, DEBOUNCE_BUSQUEDA_MS);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const hayBusqueda = busquedaDebounced.length >= MIN_CARACTERES_BUSQUEDA;

  // Consulta alumnos cuando cambia el texto buscado (ya con debounce).
  useEffect(() => {
    const idActual = ++idBusquedaRef.current;

    if (!hayBusqueda) {
      return;
    }

    establecerBuscando(true);

    obtenerAlumnos({ busqueda: busquedaDebounced }).then((respuesta) => {
      if (idActual !== idBusquedaRef.current) {
        return;
      }

      establecerResultados(respuesta.exitoso ? respuesta.datos : []);
      establecerErrorBusqueda(respuesta.exitoso ? '' : respuesta.mensaje);
      establecerBuscando(false);
    });
  }, [busquedaDebounced, hayBusqueda]);

  // Carga años y grados sin depender del listado de docentes.
  useEffect(() => {
    let cancelado = false;
    establecerEstadoEstructura('cargando');

    obtenerEstructuraMatriculaVigente().then((respuesta) => {
      if (cancelado) {
        return;
      }

      if (!respuesta.exitoso) {
        establecerErrorEstructura(respuesta.mensaje);
        establecerEstadoEstructura('error');
        return;
      }

      const anioInicial = elegirAnioInicial(respuesta.datos.anios);
      establecerEstructura(respuesta.datos);
      establecerAnioId(anioInicial?.id != null ? Number(anioInicial.id) : null);
      establecerErrorEstructura('');
      establecerEstadoEstructura('listo');
    });

    return () => {
      cancelado = true;
    };
  }, [intentoClave]);

  const anio = (estructura?.anios ?? []).find(
    (item) => String(item.id) === String(anioId)
  ) ?? null;

  useEffect(() => {
    let cancelado = false;
    establecerSecciones([]);
    establecerErrorEstructura('');
    if (!estructura || gradoId === null || !anio) return undefined;

    obtenerSeccionesMatricula(gradoId, anio.id).then((respuesta) => {
      if (cancelado) return;
      if (!respuesta.exitoso) {
        establecerErrorEstructura(respuesta.mensaje);
        establecerEstadoEstructura('error');
        return;
      }
      establecerSecciones(respuesta.datos.sort((a, b) => a.nombre.localeCompare(b.nombre)));
    });

    return () => {
      cancelado = true;
    };
  }, [estructura, gradoId, anio?.id]);

  const seleccionarAlumno = (alumno) => {    establecerAlumnoSeleccionado(alumno);
    establecerBusqueda('');
    establecerBusquedaDebounced('');
  };

  const quitarAlumno = () => establecerAlumnoSeleccionado(null);

  const seleccionarAnio = (valor) => {
    establecerAnioId(valor === '' ? null : Number(valor));
    establecerSeccionId(null);
  };

  // Cambiar de grado invalida la sección elegida, porque cada grado tiene las suyas.
  const seleccionarGrado = (valor) => {
    establecerGradoId(valor === '' ? null : Number(valor));
    establecerSeccionId(null);
  };

  const seleccionarSeccion = (id) => establecerSeccionId(id);

  const reintentarEstructura = () => establecerIntentoClave((valor) => valor + 1);

  const grados = estructura?.grados ?? [];
  const grado = grados.find((item) => String(item.id) === String(gradoId));
  const seccion = secciones.find((item) => String(item.id) === String(seccionId));

  // Solo existe cuando alumno, año, grado y sección están elegidos.
  const asignacion = alumnoSeleccionado && anio && grado && seccion
    ? { alumno: alumnoSeleccionado, anio, grado, seccion }
    : null;

  return {
    busqueda,
    establecerBusqueda,
    hayBusqueda,
    resultados,
    buscando,
    errorBusqueda,
    alumnoSeleccionado,
    seleccionarAlumno,
    quitarAlumno,
    anios: estructura?.anios ?? [],
    anioId,
    seleccionarAnio,
    grados,
    estadoEstructura,
    errorEstructura,
    reintentarEstructura,
    gradoId,
    seleccionarGrado,
    secciones,
    seccionId,
    seleccionarSeccion,
    anio,
    asignacion
  };
}
