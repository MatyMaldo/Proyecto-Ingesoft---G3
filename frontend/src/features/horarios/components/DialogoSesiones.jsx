import { useEffect, useMemo, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import useSesionesHorario from '../hooks/useSesionesHorario.js';
import { fechaISO, formatearFecha, lunesDeFecha } from '../utils/tiempo.js';
import SelectorFecha from './SelectorFecha.jsx';
import estilos from './DialogoSesiones.module.css';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

function claveSesion(sesion) {
  return `${sesion.bloqueHorarioId}|${sesion.fecha}`;
}

function etiquetaMes(claveMes) {
  const [anio, mes] = claveMes.split('-');
  return `${MESES[Number(mes) - 1] ?? mes} ${anio}`;
}

function construirGrupos(sesionesPreview) {
  const fechas = [...new Set(sesionesPreview.map((sesion) => sesion.fecha))]
    .filter(Boolean)
    .sort();
  const meses = [];

  fechas.forEach((fecha) => {
    const sesiones = sesionesPreview.filter((sesion) => sesion.fecha === fecha);
    if (sesiones.length === 0) return;

    const claveMes = fecha.slice(0, 7);
    let mes = meses.find((elemento) => elemento.clave === claveMes);
    if (!mes) {
      mes = { clave: claveMes, etiqueta: etiquetaMes(claveMes), semanas: [] };
      meses.push(mes);
    }

    const lunes = lunesDeFecha(fecha);
    const viernes = new Date(lunes);
    viernes.setDate(lunes.getDate() + 4);
    const claveSemana = fechaISO(lunes);

    let semana = mes.semanas.find((elemento) => elemento.clave === claveSemana);
    if (!semana) {
      semana = {
        clave: claveSemana,
        inicio: claveSemana,
        fin: fechaISO(viernes),
        fechas: []
      };
      mes.semanas.push(semana);
    }

    semana.fechas.push({ fecha, sesiones });
  });

  return meses;
}

export default function DialogoSesiones({ consulta, tituloSeccion, alCancelar, alNotificar }) {
  const sesiones = useSesionesHorario(consulta);
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [mesesAbiertos, establecerMesesAbiertos] = useState({});

  const grupos = useMemo(
    () => construirGrupos(sesiones.sesionesPreview),
    [sesiones.sesionesPreview]
  );

  useEffect(() => {
    if (sesiones.estadoPreview !== 'listo') return;
    establecerMesesAbiertos(grupos[0] ? { [grupos[0].clave]: true } : {});
  }, [sesiones.estadoPreview, grupos]);

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
    ? `${sesiones.totalPreview} sesiones previstas · ${Object.keys(sesiones.sesionesOmitidas).length} omitidas`
    : undefined;

  const expandirTodos = () => {
    establecerMesesAbiertos(
      Object.fromEntries(grupos.map((mes) => [mes.clave, true]))
    );
  };

  const contraerTodos = () => establecerMesesAbiertos({});

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
          <SelectorFecha
            id="sesiones-desde"
            etiqueta="Desde"
            valor={sesiones.fechaInicio}
            max={sesiones.fechaFin}
            alCambiar={(valor) => {
              sesiones.establecerFechaInicio(valor);
              sesiones.reiniciarPreview();
            }}
          />
        </label>
        <label className={estilos.campoFecha}>
          Hasta
          <SelectorFecha
            id="sesiones-hasta"
            etiqueta="Hasta"
            valor={sesiones.fechaFin}
            min={sesiones.fechaInicio}
            alCambiar={(valor) => {
              sesiones.establecerFechaFin(valor);
              sesiones.reiniciarPreview();
            }}
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
      {sesiones.estadoPreview === 'listo' && grupos.length === 0 && (
        <p className={estilos.vistaPrevia}>No hay sesiones en el rango seleccionado.</p>
      )}

      {sesiones.estadoPreview === 'listo' && grupos.length > 0 && (
        <>
          <div className={estilos.accionesMeses}>
            <p className={estilos.ayudaOmitir}>
              Marca la columna <strong>Omitir</strong> para las sesiones que no quieres generar.
            </p>
            <div className={estilos.botonesMeses}>
              <button type="button" className={estilos.botonRango} onClick={expandirTodos}>
                Expandir meses
              </button>
              <button type="button" className={estilos.botonRango} onClick={contraerTodos}>
                Contraer meses
              </button>
            </div>
          </div>

          {grupos.map((mes) => {
            const abierto = mesesAbiertos[mes.clave] === true;
            const totalMes = mes.semanas.reduce(
              (total, semana) => total + semana.fechas.reduce(
                (subtotal, grupo) => subtotal + grupo.sesiones.length,
                0
              ),
              0
            );

            return (
              <section key={mes.clave} className={estilos.grupoMes}>
                <button
                  type="button"
                  className={estilos.cabeceraMes}
                  aria-expanded={abierto}
                  onClick={() => establecerMesesAbiertos((actuales) => ({
                    ...actuales,
                    [mes.clave]: !abierto
                  }))}
                >
                  <span className={estilos.tituloMes}>{mes.etiqueta}</span>
                  <span className={estilos.metaMes}>
                    {totalMes} sesiones
                    <Icono nombre={abierto ? 'chevron-arriba' : 'chevron-abajo'} tamano={16} />
                  </span>
                </button>

                {abierto && (
                  <div className={estilos.contenidoMes}>
                    {mes.semanas.map((semana) => (
                      <section key={semana.clave} className={estilos.grupoSemana}>
                        <h4 className={estilos.cabeceraSemana}>
                          Semana del {formatearFecha(semana.inicio)} al {formatearFecha(semana.fin)}
                        </h4>

                        {semana.fechas.map((grupo) => (
                          <section
                            key={grupo.fecha}
                            className={estilos.grupoFecha}
                            aria-label={`Sesiones del ${formatearFecha(grupo.fecha)}`}
                          >
                            <div className={estilos.cabeceraFecha}>
                              <h5 className={estilos.fecha}>{formatearFecha(grupo.fecha)}</h5>
                              <button
                                type="button"
                                className={estilos.botonOmitirFecha}
                                onClick={() => sesiones.omitirTodasDeFecha(grupo.fecha)}
                              >
                                Omitir todas las de esta fecha
                              </button>
                            </div>

                            <div className={estilos.contenedorLista}>
                              <table className={estilos.tabla}>
                                <thead>
                                  <tr>
                                    <th scope="col">Hora</th>
                                    <th scope="col">Curso</th>
                                    <th scope="col">Docente</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Omitir</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {grupo.sesiones.map((sesion) => {
                                    const clave = claveSesion(sesion);
                                    const omitida = Object.hasOwn(sesiones.sesionesOmitidas, clave);
                                    return (
                                      <tr key={clave} className={omitida ? estilos.filaOmitida : undefined}>
                                        <td className={estilos.celdaHora}>
                                          {sesion.horaInicio?.slice(0, 5)} – {sesion.horaFin?.slice(0, 5)}
                                        </td>
                                        <td className={estilos.celdaCurso}>{sesion.cursoNombre}</td>
                                        <td>{sesion.docenteNombre}</td>
                                        <td>
                                          {omitida
                                            ? <span className={estilos.estadoOmitida}>Omitida</span>
                                            : sesion.yaExiste ? 'Ya existe' : 'Por crear'}
                                        </td>
                                        <td className={estilos.columnaOmitir}>
                                          <label className={estilos.omitirEtiqueta}>
                                            <input
                                              type="checkbox"
                                              className={estilos.casillaOmitir}
                                              checked={omitida}
                                              aria-label={`Omitir ${sesion.cursoNombre} del ${formatearFecha(sesion.fecha)}`}
                                              onChange={() => sesiones.alternarOmitida(sesion)}
                                            />
                                            Omitir
                                          </label>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </section>
                        ))}
                      </section>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}
    </DialogoBase>
  );
}
