import { useEffect, useId, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import { obtenerPeriodoMatricula } from '../services/matriculasService.js';
import estilos from '../../../shared/styles/camposDialogo.module.css';

/**
 * Actualización manual del estado de matrículas: cancela las pendientes de un período ya finalizado.
 * Solo se habilita cuando el período del año seleccionado ya finalizó. Es una acción crítica, así que el botón
 * de confirmar va en rojo (GUI §4).
 */
export default function ModalActualizarEstadosMatricula({
  anios,
  anioInicialId,
  onCerrar,
  onEjecutar
}) {
  const [anioId, establecerAnioId] = useState(() => (
    anioInicialId || anios?.[0]?.id || ''
  ));
  const [periodo, establecerPeriodo] = useState(null);
  const [estadoPeriodo, establecerEstadoPeriodo] = useState('cargando');
  const [errorPeriodo, establecerErrorPeriodo] = useState('');
  const [ejecutando, establecerEjecutando] = useState(false);
  const [errorEjecucion, establecerErrorEjecucion] = useState('');
  const [intento, establecerIntento] = useState(0);

  const idAnio = useId();

  useEffect(() => {
    if (!anioId) {
      establecerEstadoPeriodo('error');
      establecerErrorPeriodo('Selecciona un año académico.');
      return undefined;
    }

    let activo = true;
    establecerEstadoPeriodo('cargando');
    establecerErrorPeriodo('');

    obtenerPeriodoMatricula(anioId).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !respuesta.datos) {
        establecerPeriodo(null);
        establecerErrorPeriodo(
          respuesta.mensaje || 'No se pudo verificar el período de matrícula.'
        );
        establecerEstadoPeriodo('error');
        return;
      }
      establecerPeriodo(respuesta.datos);
      establecerEstadoPeriodo('listo');
    });

    return () => { activo = false; };
  }, [anioId, intento]);

  const puedeEjecutar = estadoPeriodo === 'listo'
    && periodo?.estado === 'FINALIZADO'
    && !ejecutando;

  const mensajePeriodo = (() => {
    if (estadoPeriodo === 'cargando') return 'Verificando el período de matrícula…';
    if (estadoPeriodo === 'error') {
      return errorPeriodo || 'No se pudo verificar el período de matrícula.';
    }
    if (periodo?.estado === 'VIGENTE') {
      return 'El período de matrícula está vigente. La actualización estará disponible cuando finalice.';
    }
    if (periodo?.estado === 'SIN_INICIAR') {
      return 'El período de matrícula aún no inicia.';
    }
    if (periodo?.estado === 'FINALIZADO') {
      return 'El período de matrícula finalizó. Puedes ejecutar la actualización.';
    }
    return 'Estado de período no reconocido.';
  })();

  const ejecutar = async (evento) => {
    evento.preventDefault();
    if (!puedeEjecutar) return;

    establecerEjecutando(true);
    establecerErrorEjecucion('');
    const resultado = await onEjecutar(anioId);
    establecerEjecutando(false);

    if (resultado && resultado.exitoso === false) {
      establecerErrorEjecucion(
        resultado.mensaje || 'No fue posible actualizar los estados de matrícula.'
      );
    }
  };

  return (
    <DialogoBase
      idTitulo="dialogo-actualizar-estados"
      titulo="Actualizar estados de matrícula"
      subtitulo="Gestión de matrículas"
      textoConfirmar="Ejecutar actualización"
      textoEnviando="Actualizando..."
      enviando={ejecutando}
      confirmarDeshabilitado={!puedeEjecutar}
      confirmarPeligro
      error={errorEjecucion || null}
      anchoMaximo="32rem"
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={ejecutar}
    >
      <div className={estilos.campo}>
        <label htmlFor={idAnio} className={estilos.etiqueta}>Año académico</label>
        <select
          id={idAnio}
          className={estilos.selector}
          value={anioId}
          onChange={(evento) => {
            establecerAnioId(evento.target.value);
            establecerErrorEjecucion('');
          }}
        >
          {(anios ?? []).map((anio) => (
            <option key={anio.id} value={anio.id}>{anio.anio}</option>
          ))}
        </select>
      </div>

      <div className={estilos.aviso}>
        <p className={estilos.avisoTitulo}>¿Qué hace esta acción?</p>
        <p className={estilos.avisoTexto}>
          Cancela las matrículas pendientes cuyo período ya finalizó y que
          no tienen un compromiso de matrícula pagado. No modifica
          matrículas confirmadas ni pagos.
        </p>
      </div>

      <p className={estilos.resumen}>{mensajePeriodo}</p>

      {estadoPeriodo === 'error' && (
        <button
          type="button"
          className={estilos.reintentar}
          onClick={() => establecerIntento((actual) => actual + 1)}
        >
          <Icono nombre="reintentar" tamano={14} /> Reintentar
        </button>
      )}
    </DialogoBase>
  );
}
