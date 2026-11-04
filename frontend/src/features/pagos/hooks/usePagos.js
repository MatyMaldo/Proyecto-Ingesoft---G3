import { useEffect, useRef, useState } from 'react';

import { obtenerAlumnos } from '../services/pagosService.js';

/**
 * Datos y comportamiento de la pantalla de Pagos.
 * El backend pagina y solo filtra por rango de fechas, según su contrato.
 */
export default function usePagos() {
  const [alumnos, establecerAlumnos] = useState([]);
  const [estado, establecerEstado] = useState('cargando');
  const [recargando, establecerRecargando] = useState(false);
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

  return {
    alumnos,
    estado,
    recargando
  };
}
