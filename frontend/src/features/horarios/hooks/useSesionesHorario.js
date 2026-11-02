import { useEffect, useState } from 'react';

import {
  generarSesiones,
  guardarDisponibilidadSesiones,
  listarSesiones
} from '../services/horariosService.js';

const MENSAJE_ERROR_GENERICO = 'Se registró un error inesperado';

/**
 * Sesiones con fecha de una sección: se consultan por bimestre, se generan a partir de los bloques
 * guardados y se marcan como disponibles o no disponibles (feriados, vacaciones). Los cambios de
 * disponibilidad son un borrador hasta llamar a `guardar`.
 *
 * @param {{ gradoId: string, seccion: string }} consulta
 * @returns {Object}
 */
export default function useSesionesHorario(consulta) {
  const [bimestreId, establecerBimestreId] = useState('');
  const [sesiones, establecerSesiones] = useState([]);
  const [desactualizada, establecerDesactualizada] = useState(false);
  const [estado, establecerEstado] = useState('inactivo');
  const [intento, establecerIntento] = useState(0);
  // id de sesión → disponibilidad elegida, solo cuando difiere de la guardada.
  const [cambios, establecerCambios] = useState({});
  const [generando, establecerGenerando] = useState(false);
  const [guardando, establecerGuardando] = useState(false);

  useEffect(() => {
    establecerCambios({});
    if (!bimestreId) {
      establecerSesiones([]);
      establecerDesactualizada(false);
      establecerEstado('inactivo');
      return undefined;
    }
    let cancelado = false;

    async function cargar() {
      establecerEstado('cargando');
      const resultado = await listarSesiones({ ...consulta, bimestreId });
      if (cancelado) {
        return;
      }
      if (!resultado.exitoso) {
        establecerEstado('error');
        return;
      }
      establecerSesiones(resultado.datos?.sesiones ?? []);
      establecerDesactualizada(Boolean(resultado.datos?.desactualizada));
      establecerEstado('listo');
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [consulta, bimestreId, intento]);

  const disponibleDe = (sesion) => cambios[sesion.id] ?? sesion.disponible;

  /** Fija la disponibilidad de una sesión; si coincide con lo guardado, el cambio se descarta. */
  const fijarDisponibilidad = (sesion, disponible) => {
    establecerCambios((anteriores) => {
      const siguientes = { ...anteriores };
      if (disponible === sesion.disponible) {
        delete siguientes[sesion.id];
      } else {
        siguientes[sesion.id] = disponible;
      }
      return siguientes;
    });
  };

  const alternar = (sesion) => fijarDisponibilidad(sesion, !disponibleDe(sesion));

  /** Aplica la disponibilidad a todas las sesiones cuya fecha cae en el rango (ambos extremos incluidos). */
  const marcarRango = (desde, hasta, disponible) => {
    establecerCambios((anteriores) => {
      const siguientes = { ...anteriores };
      sesiones
        .filter((sesion) => sesion.fecha >= desde && sesion.fecha <= hasta)
        .forEach((sesion) => {
          if (disponible === sesion.disponible) {
            delete siguientes[sesion.id];
          } else {
            siguientes[sesion.id] = disponible;
          }
        });
      return siguientes;
    });
  };

  const generar = async () => {
    establecerGenerando(true);
    const resultado = await generarSesiones({ ...consulta, bimestreId });
    establecerGenerando(false);
    if (!resultado.exitoso) {
      return resultado.mensaje || MENSAJE_ERROR_GENERICO;
    }
    establecerSesiones(resultado.datos?.sesiones ?? []);
    establecerDesactualizada(Boolean(resultado.datos?.desactualizada));
    establecerEstado('listo');
    establecerCambios({});
    return null;
  };

  const guardar = async () => {
    establecerGuardando(true);
    const resultado = await guardarDisponibilidadSesiones({
      ...consulta,
      bimestreId,
      cambios: Object.entries(cambios).map(([id, disponible]) => ({ id, disponible }))
    });
    establecerGuardando(false);
    if (!resultado.exitoso) {
      return resultado.mensaje || MENSAJE_ERROR_GENERICO;
    }
    establecerSesiones((anteriores) =>
      anteriores.map((sesion) => ({ ...sesion, disponible: disponibleDe(sesion) }))
    );
    establecerCambios({});
    return null;
  };

  return {
    bimestreId,
    seleccionarBimestre: establecerBimestreId,
    sesiones,
    desactualizada,
    estado,
    reintentar: () => establecerIntento((actual) => actual + 1),
    disponibleDe,
    alternar,
    marcarRango,
    cantidadCambios: Object.keys(cambios).length,
    noDisponibles: sesiones.filter((sesion) => !disponibleDe(sesion)).length,
    generando,
    guardando,
    generar,
    guardar
  };
}
