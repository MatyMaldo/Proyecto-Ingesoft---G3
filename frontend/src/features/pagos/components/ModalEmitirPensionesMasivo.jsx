import { useId, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
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
 * @param {(datos: { anioId: string|number, mes: string }) => Promise<Object>} props.onEjecutar
 *   Devuelve la respuesta del servicio (`exitoso`, `datos`, `mensaje`).
 */
export default function ModalEmitirPensionesMasivo({
  anios,
  anioInicialId,
  onCerrar,
  onEjecutar
}) {
  const [anioId, establecerAnioId] = useState(() => (
    anioInicialId || anios?.[0]?.id || ''
  ));
  const [mes, establecerMes] = useState(mesActual);
  const [ejecutando, establecerEjecutando] = useState(false);
  const [error, establecerError] = useState('');
  const [resultado, establecerResultado] = useState(null);

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
    && !ejecutando;

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

    establecerEjecutando(true);
    establecerError('');
    establecerResultado(null);

    const respuesta = await onEjecutar({ anioId, mes });
    establecerEjecutando(false);

    if (!respuesta.exitoso) {
      establecerError(respuesta.mensaje || 'No fue posible emitir los compromisos de pensión.');
      return;
    }

    establecerResultado(respuesta.datos);
  };

  return (
    <DialogoBase
      idTitulo="dialogo-emitir-pensiones"
      titulo="Emitir compromisos de pensión"
      subtitulo="Emisión masiva por año y mes"
      textoConfirmar="Emitir pensiones del mes"
      textoEnviando="Emitiendo..."
      textoCancelar="Cerrar"
      enviando={ejecutando}
      confirmarDeshabilitado={!puedeEmitir}
      error={error || null}
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
            establecerResultado(null);
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
          onChange={(evento) => {
            establecerMes(evento.target.value);
            establecerResultado(null);
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

      {resultado && (
        <div className={estilos.aviso} role="status">
          <p className={estilos.avisoTitulo}>Resultado de la emisión</p>
          <p className={estilos.avisoTexto}>
            Emitidos: <strong>{resultado.emitidos}</strong>
            {' · '}
            Omitidos: <strong>{resultado.omitidos}</strong>
            {' · '}
            Errores: <strong>{resultado.errores.length}</strong>
          </p>
          {resultado.errores.length > 0 && (
            <ul className={estilos.avisoErrores}>
              {resultado.errores.map((errorMatricula) => (
                <li key={errorMatricula.matriculaId}>
                  Matrícula #{errorMatricula.matriculaId}: {errorMatricula.mensaje}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </DialogoBase>
  );
}
