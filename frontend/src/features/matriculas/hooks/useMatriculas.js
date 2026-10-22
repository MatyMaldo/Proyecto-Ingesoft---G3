import { useEffect, useRef, useState } from 'react';

// Ajustar la ruta si la carpeta de la feature de grados y secciones tiene otro nombre.
import { consultarEstructura } from '../../grados-secciones/services/gradosSeccionesService.js';
import { obtenerAlumnos } from '../services/matriculasService.js';

const DEBOUNCE_BUSQUEDA_MS = 300;
const MIN_CARACTERES_BUSQUEDA = 2;

/**
 * Elige el año académico vigente: el más reciente que aún no finalizó.
 * Si todos ya finalizaron, devuelve el más reciente.
 *
 * @param {Array} anios - años académicos con `anio`, `fechaInicio` y `fechaFin` (AAAA-MM-DD).
 * @returns {Object|null}
 */
function obtenerAnioVigente(anios) {
  const hoy = new Date().toLocaleDateString('en-CA');
  const ordenados = [...(anios ?? [])].sort((a, b) => b.anio - a.anio);

  return ordenados.find((anio) => anio.fechaFin >= hoy) ?? ordenados[0] ?? null;
}

/**
 * Secciones del grado indicado que pertenecen al año académico vigente, ordenadas por nombre.
 *
 * @param {Object|null} estructura - respuesta de `consultarEstructura`.
 * @param {number|null} gradoId
 * @returns {Array}
 */
function obtenerSeccionesDisponibles(estructura, gradoId) {
  const anio = obtenerAnioVigente(estructura?.anios);

  if (!anio || gradoId === null) {
    return [];
  }

  return estructura.secciones
    .filter((seccion) => seccion.gradoId === gradoId && seccion.anioAcademicoId === anio.id)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Datos y comportamiento del modal "Asignar alumno a sección".
 * La búsqueda de alumnos se filtra en el servicio (hoy, en el mock) con debounce;
 * grados y secciones se obtienen del servicio de grados y secciones.
 *
 * @returns {{
 *   busqueda: string, establecerBusqueda: (valor: string) => void,
 *   hayBusqueda: boolean, resultados: Array, buscando: boolean, errorBusqueda: string,
 *   alumnoSeleccionado: Object|null,
 *   seleccionarAlumno: (alumno: Object) => void, quitarAlumno: () => void,
 *   grados: Array, estadoEstructura: 'cargando'|'listo'|'error', errorEstructura: string,
 *   reintentarEstructura: () => void,
 *   gradoId: number|null, seleccionarGrado: (valor: string) => void,
 *   secciones: Array, seccionId: number|null, seleccionarSeccion: (id: number) => void,
 *   asignacion: { alumno: Object, grado: Object, seccion: Object }|null
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

  // Carga la estructura escolar (grados, secciones y años) al abrir y en cada reintento.
  useEffect(() => {
    let cancelado = false;
    establecerEstadoEstructura('cargando');

    consultarEstructura().then((respuesta) => {
      if (cancelado) {
        return;
      }

      if (!respuesta.exitoso) {
        establecerErrorEstructura(respuesta.mensaje);
        establecerEstadoEstructura('error');
        return;
      }

      establecerEstructura(respuesta.datos);
      establecerErrorEstructura('');
      establecerEstadoEstructura('listo');
    });

    return () => {
      cancelado = true;
    };
  }, [intentoClave]);

  const seleccionarAlumno = (alumno) => {
    establecerAlumnoSeleccionado(alumno);
    establecerBusqueda('');
    establecerBusquedaDebounced('');
  };

  const quitarAlumno = () => establecerAlumnoSeleccionado(null);

  // Cambiar de grado invalida la sección elegida, porque cada grado tiene las suyas.
  const seleccionarGrado = (valor) => {
    establecerGradoId(valor === '' ? null : Number(valor));
    establecerSeccionId(null);
  };

  const seleccionarSeccion = (id) => establecerSeccionId(id);

  const reintentarEstructura = () => establecerIntentoClave((valor) => valor + 1);

  const grados = estructura?.grados ?? [];
  const secciones = obtenerSeccionesDisponibles(estructura, gradoId);
  const grado = grados.find((item) => item.id === gradoId);
  const seccion = secciones.find((item) => item.id === seccionId);

  // Solo existe cuando alumno, grado y sección están elegidos: habilita "Aceptar".
  const asignacion = alumnoSeleccionado && grado && seccion
    ? { alumno: alumnoSeleccionado, grado, seccion }
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
    grados,
    estadoEstructura,
    errorEstructura,
    reintentarEstructura,
    gradoId,
    seleccionarGrado,
    secciones,
    seccionId,
    seleccionarSeccion,
    asignacion
  };
}
