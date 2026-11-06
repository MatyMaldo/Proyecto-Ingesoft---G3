import { useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import DialogoBase from '../../cursos/components/DialogoBase.jsx';
import useSesionesHorario from '../hooks/useSesionesHorario.js';
import estilos from './DialogoSesiones.module.css';

function formatearFecha(iso) {
  if (!iso) return '';
  const [anio, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

export default function DialogoSesiones({ consulta, tituloSeccion, alCancelar, alNotificar }) {
  const sesiones = useSesionesHorario(consulta);
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const fechasPreview = [...new Set(sesiones.sesionesPreview.map((sesion) => sesion.fecha))].filter(Boolean);

  async function previsualizar() {
    establecerErrorGeneral(null);
    const error = await sesiones.previsualizar();
    if (error) establecerErrorGeneral(error);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    establecerErrorGeneral(null);
    const resultado = await sesiones.generar();
    if (typeof resultado === 'string') {
      establecerErrorGeneral(resultado);
      return;
    }
    alNotificar(`Se generaron ${resultado} sesiones.`);
    alCancelar();
  }

  const faltaAnio = !consulta?.anioAcademicoId && !consulta?.anioId;
  const resumen = sesiones.estadoPreview === 'listo'
    ? `${sesiones.totalPreview} sesiones previstas · ${Object.keys(sesiones.sesionesOmitidas).length} fechas omitidas`
    : undefined;

  return (
    <DialogoBase
      idTitulo="dialogo-sesiones-titulo"
      titulo="Generar sesiones"
      subtitulo={tituloSeccion}
      anchoMaximo="56rem"
      textoConfirmar="Generar sesiones"
      textoEnviando="Generando…"
      enviando={sesiones.generando}
      confirmarDeshabilitado={sesiones.estadoPreview !== 'listo' || faltaAnio}
      error={errorGeneral}
      notaPie={resumen}
      cerrarAlClicFuera={false}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      <div className={estilos.filtros}>
        <label className={estilos.campoFecha}>
          Desde
          <input
            type="date"
            className={estilos.entradaFecha}
            value={sesiones.fechaInicio}
            max={sesiones.fechaFin}
            onChange={(evento) => sesiones.establecerFechaInicio(evento.target.value)}
          />
        </label>
        <label className={estilos.campoFecha}>
          Hasta
          <input
            type="date"
            className={estilos.entradaFecha}
            value={sesiones.fechaFin}
            min={sesiones.fechaInicio}
            onChange={(evento) => sesiones.establecerFechaFin(evento.target.value)}
          />
        </label>
        <button
          type="button"
          className={estilos.botonGenerar}
          disabled={sesiones.generando || faltaAnio}
          onClick={previsualizar}
        >
          Previsualizar
        </button>
      </div>

      {faltaAnio && (
        <p role="alert">La sección seleccionada no tiene un año académico asociado.</p>
      )}
      {sesiones.estadoPreview === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={2} />}
      {sesiones.estadoPreview === 'listo' && (
        <fieldset className={estilos.rango}>
          <legend className={estilos.leyenda}>Fechas que se omitirán</legend>
          {fechasPreview.length === 0 ? (
            <p className={estilos.vistaPrevia}>No hay sesiones en el rango seleccionado.</p>
          ) : (
            <div className={estilos.contenedorLista}>
              {fechasPreview.map((fecha) => {
                const seleccionada = Object.hasOwn(sesiones.sesionesOmitidas, fecha);
                return (
                  <label key={fecha} className={estilos.campoFecha}>
                    <span>
                      <input
                        type="checkbox"
                        checked={seleccionada}
                        onChange={() => sesiones.alternarOmitida(fecha, 'No laborable')}
                      />
                      {' '}{formatearFecha(fecha)}
                    </span>
                    {seleccionada && (
                      <input
                        type="text"
                        className={estilos.entradaFecha}
                        aria-label={`Motivo para omitir ${formatearFecha(fecha)}`}
                        value={sesiones.sesionesOmitidas[fecha]}
                        onChange={(evento) => sesiones.actualizarMotivo(fecha, evento.target.value)}
                        maxLength={200}
                        required
                      />
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>
      )}
    </DialogoBase>
  );
}
