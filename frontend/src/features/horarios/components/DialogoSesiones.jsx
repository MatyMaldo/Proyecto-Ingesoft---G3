import { useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from '../../cursos/components/DialogoBase.jsx';
import { obtenerEtiquetaDia } from '../constants/horarios.js';
import useSesionesHorario from '../hooks/useSesionesHorario.js';
import CampoSelect from './CampoSelect.jsx';
import estilos from './DialogoSesiones.module.css';

/** `2026-03-09` → `09/03/2026`. */
function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

const OPCIONES_DISPONIBILIDAD = [
  { valor: 'no-disponible', etiqueta: 'No disponible' },
  { valor: 'disponible', etiqueta: 'Disponible' }
];

/**
 * Ventana "Generar sesiones": a partir de los bloques guardados del horario crea las sesiones con
 * fecha de un bimestre, las lista y permite marcar como no disponibles las de feriados o vacaciones,
 * una por una o por rango de fechas. No se cierra al pulsar fuera: hay que usar Cancelar o Guardar.
 *
 * @param {Object} props
 * @param {{ gradoId: string, seccion: string }} props.consulta
 * @param {string} props.tituloSeccion Por ejemplo "4to Secundaria B".
 * @param {Array<{ id: string, nombre: string, inicio: string, fin: string }>} props.bimestres
 * @param {() => void} props.alCancelar
 * @param {(mensaje: string) => void} props.alNotificar Se llama tras generar o guardar, con el mensaje de éxito.
 */
export default function DialogoSesiones({ consulta, tituloSeccion, bimestres, alCancelar, alNotificar }) {
  const sesiones = useSesionesHorario(consulta);
  const [desde, establecerDesde] = useState('');
  const [hasta, establecerHasta] = useState('');
  const [aplicarComo, establecerAplicarComo] = useState('no-disponible');
  const [errorGeneral, establecerErrorGeneral] = useState(null);

  const bimestre = bimestres.find((elemento) => elemento.id === sesiones.bimestreId);
  const hayCambios = sesiones.cantidadCambios > 0;
  const hayRegistros = sesiones.estado === 'listo' && sesiones.sesiones.length > 0;

  const rangoCompleto = desde !== '' && hasta !== '';
  const rangoInvertido = rangoCompleto && hasta < desde;
  const afectadas =
    rangoCompleto && !rangoInvertido
      ? sesiones.sesiones.filter((sesion) => sesion.fecha >= desde && sesion.fecha <= hasta).length
      : 0;

  let vistaPrevia = 'Elige un rango de fechas.';
  if (rangoInvertido) {
    vistaPrevia = 'La fecha de fin no puede ser anterior a la de inicio.';
  } else if (rangoCompleto) {
    vistaPrevia =
      afectadas === 0
        ? 'No hay sesiones en ese rango.'
        : `Se aplicará a ${afectadas} ${afectadas === 1 ? 'sesión' : 'sesiones'}.`;
  }

  function cambiarBimestre(valor) {
    sesiones.seleccionarBimestre(valor);
    establecerDesde('');
    establecerHasta('');
    establecerErrorGeneral(null);
  }

  /** Al elegir el inicio, el fin se iguala si está vacío o quedaría antes (caso de un solo día). */
  function cambiarDesde(valor) {
    establecerDesde(valor);
    if (valor && (!hasta || hasta < valor)) {
      establecerHasta(valor);
    }
  }

  async function generar() {
    establecerErrorGeneral(null);
    const error = await sesiones.generar();
    if (error) {
      establecerErrorGeneral(error);
      return;
    }
    alNotificar(`Sesiones de ${bimestre.nombre} generadas.`);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    establecerErrorGeneral(null);
    const error = await sesiones.guardar();
    if (error) {
      establecerErrorGeneral(error);
      return;
    }
    alNotificar('Disponibilidad de las sesiones guardada.');
    alCancelar();
  }

  const resumen = hayRegistros ? (
    <span role="status">
      {sesiones.sesiones.length} sesiones · {sesiones.noDisponibles} no disponibles
      {hayCambios &&
        ` · ${sesiones.cantidadCambios} ${sesiones.cantidadCambios === 1 ? 'cambio' : 'cambios'} sin guardar`}
    </span>
  ) : undefined;

  return (
    <DialogoBase
      idTitulo="dialogo-sesiones-titulo"
      titulo="Generar sesiones"
      subtitulo={tituloSeccion}
      anchoMaximo="56rem"
      textoConfirmar="Guardar"
      textoEnviando="Guardando…"
      enviando={sesiones.guardando}
      confirmarDeshabilitado={!hayCambios || sesiones.generando}
      error={errorGeneral}
      notaPie={resumen}
      cerrarAlClicFuera={false}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      <div className={estilos.filtros}>
        <div className={estilos.campoBimestre}>
          <CampoSelect
            id="sesiones-bimestre"
            etiqueta="Bimestre"
            requerido
            enfoqueInicial
            placeholder="Seleccionar bimestre..."
            valor={sesiones.bimestreId}
            deshabilitado={sesiones.generando || sesiones.guardando}
            opciones={bimestres.map((elemento) => ({
              valor: elemento.id,
              etiqueta: `${elemento.nombre} (${formatearFecha(elemento.inicio)} – ${formatearFecha(elemento.fin)})`
            }))}
            alCambiar={cambiarBimestre}
          />
        </div>
        <button
          type="button"
          className={estilos.botonGenerar}
          disabled={!sesiones.bimestreId || sesiones.generando || hayCambios || sesiones.estado === 'cargando'}
          title={hayCambios ? 'Guarda o cancela los cambios de disponibilidad antes de regenerar.' : undefined}
          onClick={generar}
        >
          <Icono nombre={sesiones.generando ? 'cargando' : 'reintentar'} tamano={18} />
          {sesiones.generando ? 'Generando…' : hayRegistros ? 'Regenerar sesiones' : 'Generar sesiones'}
        </button>
      </div>

      {hayRegistros && sesiones.desactualizada && (
        <p className={estilos.avisoDesactualizada} role="status">
          <Icono nombre="alerta" tamano={18} />
          El horario cambió desde la última generación. Regenera las sesiones para que reflejen los bloques actuales.
        </p>
      )}

      {hayRegistros && (
        <fieldset className={estilos.rango}>
          <legend className={estilos.leyenda}>Días no disponibles</legend>
          <div className={estilos.camposRango}>
            <label className={estilos.campoFecha}>
              Desde
              <input
                type="date"
                className={estilos.entradaFecha}
                value={desde}
                min={bimestre?.inicio}
                max={bimestre?.fin}
                onChange={(evento) => cambiarDesde(evento.target.value)}
              />
            </label>
            <label className={estilos.campoFecha}>
              Hasta
              <input
                type="date"
                className={estilos.entradaFecha}
                value={hasta}
                min={desde || bimestre?.inicio}
                max={bimestre?.fin}
                onChange={(evento) => establecerHasta(evento.target.value)}
              />
            </label>
            <div className={estilos.grupoDisponibilidad} role="radiogroup" aria-label="Marcar las sesiones como">
              {OPCIONES_DISPONIBILIDAD.map((opcion) => (
                <label key={opcion.valor} className={estilos.opcionDisponibilidad}>
                  <input
                    type="radio"
                    name="aplicar-como"
                    className={estilos.radio}
                    value={opcion.valor}
                    checked={aplicarComo === opcion.valor}
                    onChange={() => establecerAplicarComo(opcion.valor)}
                  />
                  <span className={estilos.textoOpcion}>{opcion.etiqueta}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className={estilos.botonRango}
              disabled={afectadas === 0}
              onClick={() => sesiones.marcarRango(desde, hasta, aplicarComo === 'disponible')}
            >
              Aplicar
            </button>
          </div>
          <p className={rangoInvertido ? estilos.errorRango : estilos.vistaPrevia} role="status">
            {rangoInvertido && <Icono nombre="alerta" tamano={14} />}
            {vistaPrevia}
          </p>
        </fieldset>
      )}

      {sesiones.estado === 'inactivo' && (
        <EstadoConsulta tipo="vacio" mensaje="Elige un bimestre para ver sus sesiones." />
      )}
      {sesiones.estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}
      {sesiones.estado === 'error' && <EstadoConsulta tipo="error" alReintentar={sesiones.reintentar} />}
      {sesiones.estado === 'listo' && sesiones.sesiones.length === 0 && (
        <EstadoConsulta
          tipo="vacio"
          mensaje={`Aún no hay sesiones en ${bimestre?.nombre ?? 'este bimestre'}. Pulsa «Generar sesiones».`}
        />
      )}

      {hayRegistros && (
        <div className={estilos.contenedorLista} tabIndex={0} role="region" aria-label="Sesiones generadas">
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Hora</th>
                <th scope="col">Curso</th>
                <th scope="col">Docente</th>
                <th scope="col">Aula</th>
                <th scope="col" className={estilos.columnaDisponible}>Disponible</th>
              </tr>
            </thead>
            <tbody>
              {sesiones.sesiones.map((sesion) => {
                const disponible = sesiones.disponibleDe(sesion);
                const descripcion = `${obtenerEtiquetaDia(sesion.dia)} ${formatearFecha(sesion.fecha)}, ${sesion.inicio}`;
                return (
                  <tr key={sesion.id} className={disponible ? undefined : estilos.filaNoDisponible}>
                    <td className={estilos.celdaFecha}>{formatearFecha(sesion.fecha)}</td>
                    <td className={estilos.noPartir}>{sesion.inicio} – {sesion.fin}</td>
                    <td className={estilos.celdaCurso}>{sesion.cursoNombre}</td>
                    <td className={estilos.noPartir}>{sesion.docenteNombre}</td>
                    <td className={estilos.noPartir}>{sesion.aulaNombre}</td>
                    <td className={estilos.columnaDisponible}>
                      <label className={estilos.interruptor}>
                        <input
                          type="checkbox"
                          role="switch"
                          className={estilos.casilla}
                          checked={disponible}
                          aria-label={`Disponible: ${descripcion}`}
                          onChange={() => sesiones.alternar(sesion)}
                        />
                        <span className={estilos.pista} aria-hidden="true" />
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DialogoBase>
  );
}
