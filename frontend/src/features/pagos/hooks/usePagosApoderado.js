import { useEffect, useState } from 'react';

import {
  listarAniosAcademicos,
  listarCompromisosApoderado,
  listarEstudiantesApoderado,
  listarPagosCompromiso,
  registrarPagoApoderado
} from '../services/pagosApoderadoService.js';

const MENSAJE_ERROR = 'No se pudo cargar la información de pagos.';

function elegirAnioInicial(anios) {
  const lista = [...(anios ?? [])].sort((a, b) => Number(b.anio) - Number(a.anio));
  const hoy = new Date().toLocaleDateString('en-CA');
  return lista.find((anio) => Number(anio.anio) === new Date().getFullYear())
    ?? lista.find((anio) => !anio.fechaFin || anio.fechaFin >= hoy)
    ?? lista[0]
    ?? null;
}

/** Estado de la pantalla de pagos del apoderado. */
export default function usePagosApoderado() {
  const [anios, establecerAnios] = useState([]);
  const [anioId, establecerAnioId] = useState('');
  const [estadoAnios, establecerEstadoAnios] = useState('cargando');
  const [errorAnios, establecerErrorAnios] = useState('');
  const [intentoAnios, establecerIntentoAnios] = useState(0);

  const [estudiantes, establecerEstudiantes] = useState([]);
  const [estudianteId, establecerEstudianteId] = useState('');
  const [estadoEstudiantes, establecerEstadoEstudiantes] = useState('inactivo');
  const [errorEstudiantes, establecerErrorEstudiantes] = useState('');

  const [compromisos, establecerCompromisos] = useState([]);
  const [pagosPorCompromiso, establecerPagosPorCompromiso] = useState({});
  const [estadoCompromisos, establecerEstadoCompromisos] = useState('inactivo');
  const [errorCompromisos, establecerErrorCompromisos] = useState('');
  const [cargandoPagos, establecerCargandoPagos] = useState(false);
  const [recarga, establecerRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    establecerEstadoAnios('cargando');
    establecerErrorAnios('');

    listarAniosAcademicos().then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        establecerErrorAnios(respuesta.mensaje || 'No se pudieron cargar los años académicos.');
        establecerEstadoAnios('error');
        return;
      }
      const inicial = elegirAnioInicial(respuesta.datos);
      if (!inicial) {
        establecerErrorAnios('No hay años académicos configurados.');
        establecerEstadoAnios('error');
        return;
      }
      establecerAnios(respuesta.datos);
      establecerAnioId(String(inicial.id));
      establecerEstadoAnios('listo');
    });

    return () => { activo = false; };
  }, [intentoAnios]);

  // Al cambiar de año se descarta el estudiante y sus datos.
  useEffect(() => {
    establecerEstudianteId('');
    establecerCompromisos([]);
    establecerPagosPorCompromiso({});
    establecerEstadoCompromisos('inactivo');
    establecerErrorCompromisos('');
  }, [anioId]);

  useEffect(() => {
    if (!anioId) return undefined;
    let activo = true;
    establecerEstadoEstudiantes('cargando');
    establecerErrorEstudiantes('');

    listarEstudiantesApoderado(anioId).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        establecerEstudiantes([]);
        establecerErrorEstudiantes(respuesta.mensaje || 'No se pudieron cargar los estudiantes.');
        establecerEstadoEstudiantes('error');
        return;
      }
      establecerEstudiantes(respuesta.datos);
      establecerEstudianteId((actual) => (
        actual && respuesta.datos.some((item) => String(item.id) === String(actual))
          ? actual
          : String(respuesta.datos[0]?.id ?? '')
      ));
      establecerEstadoEstudiantes('listo');
    });

    return () => { activo = false; };
  }, [anioId, recarga]);

  useEffect(() => {
    if (!anioId || !estudianteId) {
      establecerCompromisos([]);
      establecerPagosPorCompromiso({});
      establecerEstadoCompromisos('inactivo');
      return undefined;
    }

    const anio = anios.find((item) => String(item.id) === String(anioId));
    if (!anio) return undefined;

    let activo = true;
    establecerEstadoCompromisos('cargando');
    establecerErrorCompromisos('');
    establecerCompromisos([]);
    establecerPagosPorCompromiso({});
    establecerCargandoPagos(false);

    listarCompromisosApoderado(estudianteId, anio.anio).then(async (respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        establecerErrorCompromisos(respuesta.mensaje || MENSAJE_ERROR);
        establecerEstadoCompromisos('error');
        return;
      }

      establecerCompromisos(respuesta.datos);
      establecerEstadoCompromisos('listo');

      if (respuesta.datos.length === 0) return;
      establecerCargandoPagos(true);

      const resultados = await Promise.all(
        respuesta.datos.map(async (compromiso) => {
          const pagos = await listarPagosCompromiso(compromiso.id);
          return [compromiso.id, {
            pagos: pagos.exitoso && Array.isArray(pagos.datos) ? pagos.datos : [],
            error: pagos.exitoso ? '' : pagos.mensaje || 'No se pudieron cargar los pagos.'
          }];
        })
      );

      if (!activo) return;
      establecerPagosPorCompromiso(Object.fromEntries(resultados));
      establecerCargandoPagos(false);
    });

    return () => { activo = false; };
  }, [anioId, estudianteId, anios, recarga]);

  const registrarPago = async (datos) => {
    const respuesta = await registrarPagoApoderado(datos);
    if (!respuesta.exitoso) {
      return respuesta.mensaje || 'No se pudo registrar el pago.';
    }
    establecerRecarga((actual) => actual + 1);
    return null;
  };

  return {
    anios,
    anioId,
    seleccionarAnio: establecerAnioId,
    estadoAnios,
    errorAnios,
    reintentarAnios: () => establecerIntentoAnios((actual) => actual + 1),
    estudiantes,
    estudianteId,
    seleccionarEstudiante: establecerEstudianteId,
    estadoEstudiantes,
    errorEstudiantes,
    compromisos,
    pagosPorCompromiso,
    estadoCompromisos,
    errorCompromisos,
    cargandoPagos,
    recargar: () => establecerRecarga((actual) => actual + 1),
    registrarPago
  };
}
