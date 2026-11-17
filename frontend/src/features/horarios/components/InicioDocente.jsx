import AccionesAsistenciaDocente from '../../asistencia/components/AccionesAsistenciaDocente.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import {
  etiquetaEstadoSesion,
  tonoEstadoSesion
} from '../utils/estadosSesion.js';
import { acortarGrado, indicadoresAsistencia } from '../utils/sesionesDocente.js';
import estilos from './InicioDocente.module.css';

const ETIQUETAS_DESTACADA = Object.freeze({
  ahora: 'Ahora',
  hoy: 'Siguiente clase de hoy',
  proxima: 'Próxima clase'
});

const hora = (valor) => String(valor ?? '').slice(0, 5);

/** «Martes 17/11»: día de la semana y fecha corta. */
function etiquetaDia(fecha) {
  const fechaLocal = new Date(`${fecha}T00:00:00`);
  const dia = fechaLocal.toLocaleDateString('es-PE', { weekday: 'long' });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${fecha.slice(8)}/${fecha.slice(5, 7)}`;
}

function Indicadores({ sesion }) {
  const indicadores = indicadoresAsistencia(sesion);
  if (indicadores.length === 0) return null;
  return (
    <>
      {indicadores.map((indicador) => (
        <Insignia key={indicador.id} tono={indicador.tono}>{indicador.texto}</Insignia>
      ))}
    </>
  );
}

/**
 * Lo primero que ve el docente: la clase que tiene ahora (o la siguiente), con las acciones de asistencia a un clic,
 * y la lista de sus clases de hoy. El horario completo de la semana se abre desde «Ver horario».
 *
 * @param {Object} props
 * @param {{ sesion: Object, tipo: 'ahora'|'hoy'|'proxima' }|null} props.destacada
 * @param {Array} props.sesionesHoy Sesiones de hoy, sin las omitidas.
 * @param {number} props.omitidasHoy
 * @param {string} props.hoy Fecha de hoy (`YYYY-MM-DD`).
 * @param {Object} props.asistencia Estado de `useAsistenciaSesion` de la sesión destacada.
 * @param {(sesion: Object) => void} props.alAbrirSesion
 * @param {() => void} props.alAbrirModal Abre el registro de asistencia de la sesión destacada.
 * @param {(mensaje: string, error?: boolean) => void} props.alNotificar
 */
export default function InicioDocente({
  destacada,
  sesionesHoy,
  omitidasHoy,
  hoy,
  asistencia,
  alAbrirSesion,
  alAbrirModal,
  alNotificar
}) {
  const sesion = destacada?.sesion;
  const conAcciones = destacada && destacada.tipo !== 'proxima';

  return (
    <section className={estilos.inicio} aria-label="Tus clases">
      <article className={estilos.destacada} aria-labelledby="inicio-destacada-titulo">
        {sesion ? (
          <>
            <p className={estilos.etiqueta}>{ETIQUETAS_DESTACADA[destacada.tipo]}</p>
            <h2 id="inicio-destacada-titulo" className={estilos.tituloDestacada}>
              {sesion.cursoNombre} · {[acortarGrado(sesion.gradoNombre), sesion.seccionNombre].filter(Boolean).join(' ')}
            </h2>
            <p className={estilos.meta}>
              {destacada.tipo === 'proxima' ? `${etiquetaDia(sesion.fecha)} · ` : ''}
              {hora(sesion.horaInicio)} – {hora(sesion.horaFin)}
              {sesion.aulaNombre ? ` · ${sesion.aulaNombre}` : ''}
            </p>
            <div className={estilos.chips}>
              <Insignia tono={tonoEstadoSesion(sesion.estado)}>{etiquetaEstadoSesion(sesion.estado)}</Insignia>
              <Indicadores sesion={sesion} />
            </div>

            {conAcciones && (
              <AccionesAsistenciaDocente
                sesion={sesion}
                asistencia={asistencia}
                alAbrirModal={alAbrirModal}
                alNotificar={alNotificar}
              />
            )}

            <button type="button" className={estilos.botonSecundario} onClick={() => alAbrirSesion(sesion)}>
              Ver detalle de la sesión
            </button>
          </>
        ) : (
          <>
            <h2 id="inicio-destacada-titulo" className={estilos.tituloDestacada}>Sin clases próximas</h2>
            <p className={estilos.meta}>No tienes más clases programadas en el rango de fechas elegido.</p>
          </>
        )}
      </article>

      <div className={estilos.hoy}>
        <h2 className={estilos.tituloHoy}>Hoy · {etiquetaDia(hoy)}</h2>
        {sesionesHoy.length === 0 ? (
          <p className={estilos.vacio}>Hoy no tienes clases.</p>
        ) : (
          <ul className={estilos.lista}>
            {sesionesHoy.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={estilos.fila}
                  onClick={() => alAbrirSesion(item)}
                  aria-label={`Abrir ${item.cursoNombre} de ${hora(item.horaInicio)} a ${hora(item.horaFin)}`}
                >
                  <span className={estilos.horaFila}>{hora(item.horaInicio)} – {hora(item.horaFin)}</span>
                  <span className={estilos.textoFila}>
                    <span className={estilos.cursoFila}>{item.cursoNombre}</span>
                    <span className={estilos.detalleFila}>
                      {[acortarGrado(item.gradoNombre), item.seccionNombre].filter(Boolean).join(' ')}
                      {item.aulaNombre ? ` · ${item.aulaNombre}` : ''}
                    </span>
                  </span>
                  <span className={estilos.chips}>
                    <Insignia tono={tonoEstadoSesion(item.estado)}>{etiquetaEstadoSesion(item.estado)}</Insignia>
                    <Indicadores sesion={item} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {omitidasHoy > 0 && (
          <p className={estilos.nota}>
            {omitidasHoy === 1 ? '1 sesión omitida hoy no se muestra.' : `${omitidasHoy} sesiones omitidas hoy no se muestran.`}
          </p>
        )}
      </div>
    </section>
  );
}
