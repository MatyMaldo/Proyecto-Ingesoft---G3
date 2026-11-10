import { useId, useRef, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import ProgresoOperacionMasiva from '../../../shared/components/ProgresoOperacionMasiva.jsx';
import { crearClaveIdempotencia } from '../../../shared/api/operacionesMasivasService.js';
import { iniciarEmisionPensionLoteAsync } from '../services/pagosService.js';
import estilos from '../../../shared/styles/camposDialogo.module.css';
import { MESES_PENSION, anioEstaVigente, mesActual } from '../utils/periodo.js';

/**
 * Emisión masiva de compromisos de pensión por año y mes: uno por cada matrícula confirmada del año que aún no lo
 * tenga.
 *
 * @param {Object} props
 * @param {Array} props.anios Años académicos disponibles.
 * @param {string|number} [props.anioInicialId] Año que aparece elegido al abrir (el de la pantalla).
 * @param {() => void} props.onCerrar
 * @param {Object} props.operacion Hook `useOperacionMasiva` de la página.
 */
export default function ModalEmitirPensionesMasivo({
  anios,
  anioInicialId,
  onCerrar,
  operacion
}) {
  const [anioId, establecerAnioId] = useState(() => (
    anioInicialId || anios?.[0]?.id || ''
  ));
  const [mes, establecerMes] = useState(mesActual);
  const [error, establecerError] = useState('');
  const claveRef = useRef(null);

  const idAnio = useId();
  const idMes = useId();

  const anioSeleccionado = (anios ?? []).find(
    (anio) => String(anio.id) === String(anioId)
  );
  const vigente = anioEstaVigente(anioSeleccionado);
  const numeroMes = MESES_PENSION.indexOf(mes) + 3;
  const mesEsFuturo = Boolean(mes) && numeroMes > new Date().getMonth() + 1;
  const puedeEmitir = Boolean(anioId)
    && Boolean(mes)
    && vigente !== false
    && !mesEsFuturo
    && !operacion?.enCurso
    && !operacion?.job;

  // Por qué no se puede emitir, dicho en el propio diálogo (un `title` no se lee con teclado ni en táctil).
  const motivoBloqueo = (() => {
    if (!anioId) return 'Selecciona un año académico.';
    if (!mes) return 'Selecciona un mes.';
    if (vigente === false) return 'El año académico seleccionado no está vigente.';
    if (mesEsFuturo) return 'No se pueden emitir compromisos de meses futuros.';
    return '';
  })();

  const ejecutar = async (evento) => {
    evento.preventDefault();
    if (!puedeEmitir) return;

    establecerError('');
    if (!claveRef.current || operacion?.job) {
      claveRef.current = crearClaveIdempotencia('pension-lote');
    }

    const respuesta = await operacion.iniciar(() => (
      iniciarEmisionPensionLoteAsync({ anioId, mes }, claveRef.current)
    ));
    if (respuesta && !respuesta.exitoso) {
      establecerError(
        respuesta.mensaje || 'No fue posible iniciar la emisión masiva de pensión.'
      );
    }
  };

  return (
    <DialogoBase
      idTitulo="dialogo-emitir-pensiones"
      titulo="Emitir compromisos de pensión"
      subtitulo="Emisión masiva por año y mes"
      textoConfirmar="Emitir pensiones del mes"
      textoEnviando="Iniciando..."
      textoCancelar="Cerrar"
      enviando={operacion?.iniciando ?? false}
      confirmarDeshabilitado={!puedeEmitir}
      error={error || operacion?.error || null}
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
          disabled={operacion?.enCurso || Boolean(operacion?.job)}
          onChange={(evento) => {
            establecerAnioId(evento.target.value);
            claveRef.current = null;
            operacion?.reiniciar();
            establecerError('');
          }}
        >
          {(anios ?? []).map((anio) => (
            <option key={anio.id} value={anio.id}>{anio.anio}</option>
          ))}
        </select>
      </div>

      <div className={estilos.campo}>
        <label htmlFor={idMes} className={estilos.etiqueta}>Mes</label>
        <select
          id={idMes}
          className={estilos.selector}
          value={mes}
          disabled={operacion?.enCurso || Boolean(operacion?.job)}
          onChange={(evento) => {
            establecerMes(evento.target.value);
            claveRef.current = null;
            operacion?.reiniciar();
            establecerError('');
          }}
        >
          <option value="">Seleccionar mes...</option>
          {MESES_PENSION.map((nombreMes) => (
            <option key={nombreMes} value={nombreMes}>{nombreMes}</option>
          ))}
        </select>
      </div>

      <p className={estilos.ayuda}>
        Se emitirá un compromiso de pensión del mes seleccionado para cada
        matrícula confirmada del año que aún no lo tenga.
      </p>

      {motivoBloqueo && <p className={estilos.resumen}>{motivoBloqueo}</p>}

      {operacion?.job && (
        <ProgresoOperacionMasiva
          job={operacion.job}
          error={operacion.error}
          titulo="Emisión masiva de pensión"
        />
      )}
    </DialogoBase>
  );
}
