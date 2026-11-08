import { useEffect, useRef, useState } from 'react';

import {
  obtenerAlumnosMatriculados,
  obtenerAnioAcademico
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
 * La tabla se llena con alumnas y alumnos que tienen matrícula confirmada en el
 * año académico actual, porque los pagos requieren grado y sección.
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

    const resultado = await obtenerAlumnosMatriculados(anioId);

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
  }, [anioId, intentoClave]);

  // Carga años académicos y deja seleccionado el año actual.
  useEffect(() => {
    let cancelado = false;
    establecerEstadoEstructura('cargando');

    obtenerAnioAcademico().then((respuesta) => {
      if (cancelado) return;

      if (!respuesta.exitoso) {
        establecerErrorEstructura(respuesta.mensaje);
        establecerEstadoEstructura('error');
        return;
      }

      if (!Array.isArray(respuesta.datos?.anios)) {
        establecerErrorEstructura('No se recibió una lista válida de años académicos.');
        establecerEstadoEstructura('error');
        return;
      }

      const anioInicial = elegirAnioInicial(respuesta.datos.anios);
      if (!anioInicial) {
        establecerErrorEstructura('No hay años académicos configurados.');
        establecerEstadoEstructura('error');
        return;
      }
      establecerAnios(respuesta.datos.anios);
      establecerAnioId((actual) => actual ?? Number(anioInicial.id));
      establecerErrorEstructura('');
      establecerEstadoEstructura('listo');
    });

    return () => {
      cancelado = true;
    };
  }, [intentoClave]);

  const seleccionarAnio = (valor) => {
    establecerAnioId(valor === '' ? null : Number(valor));
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
    mes,
    seleccionarMes,
    reintentar: () => establecerIntentoClave((valor) => valor + 1)
  };
}
