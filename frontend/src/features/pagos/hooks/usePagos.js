import { useEffect, useRef, useState } from 'react';

import {
  obtenerAlumnosMatriculados,
  obtenerAnioAcademico,
  obtenerGrados,
  obtenerSecciones
} from '../services/pagosService.js';

function elegirAnioInicial(anios) {
  const lista = [...(anios ?? [])].sort((a, b) => Number(b.anio) - Number(a.anio));
  const hoy = new Date().toLocaleDateString('en-CA');
  return lista.find((anio) => Number(anio.anio) === new Date().getFullYear())
    ?? lista.find((anio) => !anio.fechaFin || anio.fechaFin >= hoy)
    ?? lista[0]
    ?? null;
}

/**
 * Datos y comportamiento de la pantalla de Pagos.
 * La tabla se llena con alumnos que tienen matrícula pendiente o confirmada en
 * el año seleccionado, porque los pagos requieren grado y sección.
 */
export default function usePagos() {
  const [alumnos, establecerAlumnos] = useState([]);
  const [estado, establecerEstado] = useState('cargando');
  const [error, establecerError] = useState('');
  const [recargando, establecerRecargando] = useState(false);
  const [alumnoSeleccionado, establecerAlumnoSeleccionado] = useState(null);

  const [anios, establecerAnios] = useState([]);
  const [estadoEstructura, establecerEstadoEstructura] = useState('cargando');
  const [errorEstructura, establecerErrorEstructura] = useState('');
  const [anioId, establecerAnioId] = useState(null);
  const [grados, establecerGrados] = useState([]);
  const [gradoId, establecerGradoId] = useState(null);
  const [secciones, establecerSecciones] = useState([]);
  const [seccionId, establecerSeccionId] = useState(null);
  const [cargandoSecciones, establecerCargandoSecciones] = useState(false);
  const [mes, establecerMes] = useState(null);
  const [intentoClave, establecerIntentoClave] = useState(0);

  const idSolicitudRef = useRef(0);

  async function cargarLista() {
    if (!anioId) return;
    const idActual = ++idSolicitudRef.current;
    const esCargaInicial = estado === 'cargando' || estado === 'error';

    if (esCargaInicial) {
      establecerEstado('cargando');
    } else {
      establecerRecargando(true);
    }
    establecerError('');

    const resultado = await obtenerAlumnosMatriculados(anioId, { gradoId, seccionId });

    if (idActual !== idSolicitudRef.current) {
      return;
    }

    if (!resultado.exitoso) {
      establecerError(resultado.mensaje || 'No se pudo cargar la lista de alumnos.');
      establecerEstado('error');
      establecerRecargando(false);
      return;
    }

    establecerAlumnos(resultado.datos.estudiantes ?? []);
    establecerEstado('listo');
    establecerRecargando(false);
  }

  useEffect(() => {
    if (!anioId) return undefined;
    cargarLista();
    return () => {
      idSolicitudRef.current += 1;
    };
    // cargarLista captura el estado de la consulta actual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anioId, gradoId, seccionId, intentoClave]);

  // Carga años académicos, grados y deja seleccionado el año actual.
  useEffect(() => {
    let cancelado = false;
    establecerEstadoEstructura('cargando');

    Promise.all([
      obtenerAnioAcademico(),
      obtenerGrados()
    ]).then(([respuestaAnios, respuestaGrados]) => {
      if (cancelado) return;

      if (!respuestaAnios.exitoso) {
        establecerErrorEstructura(respuestaAnios.mensaje);
        establecerEstadoEstructura('error');
        return;
      }

      if (!Array.isArray(respuestaAnios.datos?.anios)) {
        establecerErrorEstructura('No se recibió una lista válida de años académicos.');
        establecerEstadoEstructura('error');
        return;
      }

      const anioInicial = elegirAnioInicial(respuestaAnios.datos.anios);
      if (!anioInicial) {
        establecerErrorEstructura('No hay años académicos configurados.');
        establecerEstadoEstructura('error');
        return;
      }
      establecerAnios(respuestaAnios.datos.anios);
      establecerGrados(
        respuestaGrados.exitoso && Array.isArray(respuestaGrados.datos)
          ? respuestaGrados.datos
          : []
      );
      establecerAnioId((actual) => actual ?? Number(anioInicial.id));
      establecerErrorEstructura('');
      establecerEstadoEstructura('listo');
    });

    return () => {
      cancelado = true;
    };
  }, [intentoClave]);

  // Carga las secciones cuando cambia el año o el grado.
  useEffect(() => {
    let cancelado = false;
    establecerSecciones([]);

    if (!anioId || !gradoId) {
      establecerCargandoSecciones(false);
      return undefined;
    }

    establecerCargandoSecciones(true);

    obtenerSecciones(gradoId, anioId).then((respuesta) => {
      if (cancelado) return;
      if (respuesta.exitoso && Array.isArray(respuesta.datos)) {
        establecerSecciones(
          [...respuesta.datos].sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
      } else {
        establecerSecciones([]);
      }
      establecerCargandoSecciones(false);
    });

    return () => {
      cancelado = true;
    };
  }, [anioId, gradoId]);

  const seleccionarAnio = (valor) => {
    establecerAnioId(valor === '' ? null : Number(valor));
    establecerSeccionId(null);
  };

  const seleccionarGrado = (valor) => {
    establecerGradoId(valor === '' ? null : Number(valor));
    establecerSeccionId(null);
  };

  const seleccionarSeccion = (valor) => {
    establecerSeccionId(valor === '' ? null : Number(valor));
  };

  const limpiarFiltros = () => {
    establecerGradoId(null);
    establecerSeccionId(null);
  };

  const seleccionarMes = (valor) => {
    establecerMes(valor === '' ? null : valor);
  };

  return {
    alumnos,
    estado,
    error,
    recargando,
    alumnoSeleccionado,
    establecerAlumnoSeleccionado,
    anios,
    estadoEstructura,
    errorEstructura,
    anioId,
    seleccionarAnio,
    grados,
    gradoId,
    seleccionarGrado,
    secciones,
    seccionId,
    seleccionarSeccion,
    cargandoSecciones,
    limpiarFiltros,
    mes,
    seleccionarMes,
    reintentar: () => establecerIntentoClave((valor) => valor + 1)
  };
}
