import { useId, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import estilos from '../../../shared/styles/camposDialogo.module.css';
import { MESES_PENSION } from '../utils/periodo.js';

/**
 * Diálogo para elegir año y mes y emitir el compromiso de pensión de un alumno. Al confirmar entrega
 * `{ estudianteId, anioId, mes }` a `onAceptar`.
 *
 * @param {Object} props
 * @param {Object} props.alumno Alumno al que se emite el compromiso.
 * @param {Array<{ id: number|string, anio: number|string }>} props.anios Años académicos disponibles.
 * @param {string|number} [props.anioInicialId] Año que aparece elegido al abrir (el de la pantalla).
 * @param {boolean} [props.enviando] `true` mientras se espera al servidor.
 * @param {() => void} props.onCerrar
 * @param {(datos: { estudianteId: number, anioId: number|string, mes: string }) => void} props.onAceptar
 */
export default function ModalEmitirPension({ alumno, anios, anioInicialId = '', enviando = false, onCerrar, onAceptar }) {
  const [anioId, establecerAnioId] = useState(() => (anioInicialId === null ? '' : String(anioInicialId)));
  const [mes, establecerMes] = useState('');
  const idAnio = useId();
  const idMes = useId();

  const puedeEmitir = Boolean(alumno && anioId && mes);

  const confirmar = (evento) => {
    evento.preventDefault();
    if (!puedeEmitir || enviando) return;
    onAceptar({ estudianteId: alumno.id, anioId, mes });
  };

  return (
    <DialogoBase
      idTitulo="dialogo-emitir-pension"
      titulo="Emitir compromiso de pensión"
      subtitulo="Pagos"
      textoConfirmar="Emitir compromiso"
      textoEnviando="Emitiendo..."
      enviando={enviando}
      confirmarDeshabilitado={!puedeEmitir}
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={confirmar}
    >
      {alumno && (
        <div className={estilos.tarjetaAlumno}>
          <div>
            <p className={estilos.tarjetaEtiqueta}>Alumno</p>
            <p className={estilos.tarjetaNombre}>{alumno.nombre}</p>
            <p className={estilos.tarjetaDni}>
              {alumno.dni ? `DNI: ${alumno.dni}` : `Código: ${alumno.codigo ?? '—'}`}
            </p>
          </div>
        </div>
      )}

      <div className={estilos.campo}>
        <label htmlFor={idAnio} className={estilos.etiqueta}>Año académico</label>
        <select
          id={idAnio}
          className={estilos.selector}
          value={anioId}
          data-enfoque-inicial=""
          onChange={(evento) => establecerAnioId(evento.target.value)}
        >
          <option value="">Seleccionar año...</option>
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
          onChange={(evento) => establecerMes(evento.target.value)}
        >
          <option value="">Seleccionar mes...</option>
          {MESES_PENSION.map((nombreMes) => (
            <option key={nombreMes} value={nombreMes}>{nombreMes}</option>
          ))}
        </select>
      </div>
    </DialogoBase>
  );
}
