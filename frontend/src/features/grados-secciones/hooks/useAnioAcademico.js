import { useEffect, useRef, useState } from 'react';

import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import { consultarAniosAcademicos, crearAnioAcademico } from '../services/gradosSeccionesService.js';
import { ordenarAnios, validarAnioAcademico } from '../utils/validacionesAnioAcademico.js';

const FORMULARIO_VACIO = { anio: '', bimestre: '', inicioMatricula: '', finMatricula: '' };

/**
 * Datos y comportamiento del panel de años académicos, que tiene dos pasos:
 * la tabla de años (`formulario === null`) y el formulario de creación (`formulario !== null`).
 * Al guardar no se crea el año de inmediato: primero se abre una confirmación (`confirmando`)
 * y, al aceptarla, se registra y se muestra la notificación de éxito.
 *
 * @param {Object} [opciones]
 * @param {(anio: Object) => void} [opciones.alCrearAnio] Se llama tras crear un año, para que la
 *   pantalla pueda refrescar otros bloques que lo listan (por ejemplo, el de grados y secciones).
 * @returns {{
 *   datos: { anios: Array, bimestres: string[] },
 *   estado: 'cargando'|'listo'|'error', errorCarga: string, reintentar: () => void,
 *   formulario: { anio: string, bimestre: string, inicioMatricula: string, finMatricula: string }|null,
 *   errores: Object, errorGuardado: string,
 *   abrirCreacion: () => void, cancelarCreacion: () => void,
 *   cambiarCampo: (nombre: string, valor: string) => void,
 *   confirmando: boolean, guardando: boolean,
 *   solicitarConfirmacion: (evento: Event) => void,
 *   cancelarConfirmacion: () => void, confirmarCreacion: () => Promise<void>,
 *   notificacion: { mensaje: string, error: boolean }|null
 * }}
 */
export default function useAnioAcademico({ alCrearAnio } = {}) {
  const [datos, establecerDatos] = useState({ anios: [], bimestres: [] });
  const [estado, establecerEstado] = useState('cargando');
  const [errorCarga, establecerErrorCarga] = useState('');
  const [intento, establecerIntento] = useState(0);
  const [formulario, establecerFormulario] = useState(null);
  const [errores, establecerErrores] = useState({});
  const [errorGuardado, establecerErrorGuardado] = useState('');
  const [confirmando, establecerConfirmando] = useState(false);
  const [guardando, establecerGuardando] = useState(false);
  const bloqueo = useRef(false);
  const { notificacion, mostrarNotificacion } = useNotificacion();

  useEffect(() => {
    let vigente = true;
    establecerEstado('cargando');

    consultarAniosAcademicos().then((resultado) => {
      if (!vigente) {
        return;
      }

      if (!resultado.exitoso) {
        establecerErrorCarga(resultado.mensaje);
        establecerEstado('error');
        return;
      }

      establecerDatos({ anios: ordenarAnios(resultado.datos.anios), bimestres: resultado.datos.bimestres });
      establecerEstado('listo');
    });

    return () => {
      vigente = false;
    };
  }, [intento]);

  const reintentar = () => establecerIntento((actual) => actual + 1);

  function abrirCreacion() {
    establecerErrores({});
    establecerErrorGuardado('');
    establecerFormulario(FORMULARIO_VACIO);
  }

  function cancelarCreacion() {
    establecerFormulario(null);
    establecerErrores({});
    establecerErrorGuardado('');
  }

  // El año solo admite dígitos; al editar un campo se limpia su error para no mostrar uno ya corregido.
  // El error de período repetido depende de año y bimestre a la vez, así que lo limpia cualquiera de los dos;
  // el del período de matrícula, cualquiera de sus dos fechas.
  function cambiarCampo(nombre, valor) {
    const valorLimpio = nombre === 'anio' ? valor.replace(/\D/g, '') : valor;
    const erroresRelacionados = {
      anio: ['anio', 'periodo'],
      bimestre: ['bimestre', 'periodo'],
      inicioMatricula: ['periodoMatricula'],
      finMatricula: ['periodoMatricula']
    }[nombre] ?? [nombre];

    establecerFormulario((actual) => ({ ...actual, [nombre]: valorLimpio }));
    establecerErrores((actual) => Object.fromEntries(
      Object.entries(actual).filter(([clave]) => !erroresRelacionados.includes(clave))
    ));
  }

  // "Guardar": valida y, si todo está bien, pide confirmación antes de crear el año.
  function solicitarConfirmacion(evento) {
    evento.preventDefault();

    if (bloqueo.current) {
      return;
    }

    const validacion = validarAnioAcademico(formulario, { anios: datos.anios, bimestres: datos.bimestres });
    establecerErrores(validacion);
    establecerErrorGuardado('');

    if (Object.keys(validacion).length) {
      return;
    }

    establecerConfirmando(true);
  }

  const cancelarConfirmacion = () => establecerConfirmando(false);

  async function confirmarCreacion() {
    if (bloqueo.current || formulario === null) {
      return;
    }

    bloqueo.current = true;
    establecerGuardando(true);

    try {
      const resultado = await crearAnioAcademico(formulario);

      if (!resultado.exitoso) {
        establecerErrores(resultado.errores ?? {});
        establecerErrorGuardado(resultado.mensaje);
        establecerConfirmando(false);
        return;
      }

      establecerDatos((actual) => ({ ...actual, anios: ordenarAnios([...actual.anios, resultado.datos]) }));
      establecerFormulario(null);
      establecerConfirmando(false);
      mostrarNotificacion(`Año académico ${resultado.datos.anio} (${resultado.datos.bimestre}) creado correctamente.`);
      alCrearAnio?.(resultado.datos);
    } catch {
      establecerErrorGuardado('No fue posible guardar. Conservamos los datos para que puedas reintentar.');
      establecerConfirmando(false);
    } finally {
      bloqueo.current = false;
      establecerGuardando(false);
    }
  }

  return {
    datos,
    estado,
    errorCarga,
    reintentar,
    formulario,
    errores,
    errorGuardado,
    abrirCreacion,
    cancelarCreacion,
    cambiarCampo,
    confirmando,
    guardando,
    solicitarConfirmacion,
    cancelarConfirmacion,
    confirmarCreacion,
    notificacion
  };
}
