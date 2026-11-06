import { useEffect, useRef, useState } from 'react';

import { obtenerAlumnos, obtenerAnioAcademico } from '../services/pagosService.js';

/**
 * Datos y comportamiento de la pantalla de Pagos.
 * El backend pagina y solo filtra por rango de fechas, según su contrato.
 */
export default function usePagos() {
  const [alumnos, establecerAlumnos] = useState([]);
  const [estado, establecerEstado] = useState('cargando');
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
    const idActual = ++idSolicitudRef.current;
    const esCargaInicial = estado === 'cargando' || estado === 'error';

    if (esCargaInicial) {
      establecerEstado('cargando');
    } else {
      establecerRecargando(true);
    }

    const resultado = await obtenerAlumnos();

    if (idActual !== idSolicitudRef.current) {
      return;
    }

    if (!resultado.exitoso) {
      establecerEstado('error');
      establecerRecargando(false);
      return;
    }

    establecerAlumnos((resultado.datos.estudiantes ?? []));
    establecerEstado('listo');
    establecerRecargando(false);
  }

  useEffect(() => {
    cargarLista();
    return () => {
      idSolicitudRef.current += 1;
    };
    // cargarLista captura el estado de la consulta actual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga año académico
  useEffect(() => {
    let cancelado = false;
    establecerEstadoEstructura('cargando');

    obtenerAnioAcademico().then((respuesta) => {
      if (cancelado) {
        return;
      }

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

      establecerAnios(respuesta.datos?.anios);
      establecerErrorEstructura('');
      establecerEstadoEstructura('listo');
    });

    return () => {
      cancelado = true;
    };
  }, [intentoClave]);

  // Seleccionar anio académico
  const seleccionarAnio = (valor) => {
    establecerAnioId(valor === '' ? null : Number(valor));
  };

  const seleccionarMes = (valor) => {
    establecerMes(valor === '' ? null : valor);
  };

  return {
    alumnos,
    estado,
    recargando,
    anios,
    estadoEstructura,
    errorEstructura,
    anioId,
    seleccionarAnio,
    mes,
    seleccionarMes
  };
}
