import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroRangoFechas from '../../../shared/components/FiltroRangoFechas.jsx';
import ModalConfirmacion from '../../../shared/components/ModalConfirmacion.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import useAnioAcademico from '../hooks/useAnioAcademico.js';
import { obtenerMensajeRangoMatricula } from '../utils/validacionesAnioAcademico.js';
import estilos from '../pages/PaginaAnioEscolar.module.css';

/**
 * Convierte 'AAAA-MM-DD' en 'DD/MM/AAAA' sin pasar por `Date`, para evitar desfases de zona horaria.
 *
 * @param {string|undefined} fechaIso
 * @returns {string}
 */
function formatearFecha(fechaIso) {
  if (!fechaIso) {
    return '—';
  }

  const [anio, mes, dia] = fechaIso.split('-');

  return `${dia}/${mes}/${anio}`;
}

function describirPeriodo(inicio, fin) {
  if (!inicio && !fin) {
    return 'Sin período definido';
  }

  return `${formatearFecha(inicio)} – ${formatearFecha(fin)}`;
}

/**
 * Bloque independiente que se integrará en la pantalla de Año escolar compartida.
 * Paso 1: tabla de años académicos con su bimestre y período de matrícula.
 * Paso 2: formulario de creación; al guardar pide confirmación y, al aceptar, avisa con una notificación.
 *
 * @param {Object} [props]
 * @param {(anio: Object) => void} [props.alCrearAnio] Se llama tras crear un año; sirve para que la
 *   pantalla refresque los bloques que también listan años.
 */
export default function PanelAnioAcademico({ alCrearAnio }) {
  const modelo = useAnioAcademico({ alCrearAnio });
  const { datos, estado, formulario, errores, guardando, confirmando, notificacion } = modelo;

  if (estado === 'cargando') {
    return <EstadoConsulta tipo="carga" mensaje="Cargando años académicos…" />;
  }

  if (estado === 'error') {
    return <EstadoConsulta tipo="error" mensaje={modelo.errorCarga} alReintentar={modelo.reintentar} />;
  }

  const renderizarTabla = () => (
    <section className={estilos.tarjeta} aria-labelledby="titulo-anios">
      <div className={estilos.cabeceraTarjeta}>
        <div>
          <h2 id="titulo-anios">Años académicos</h2>
          <p>Consulta los años escolares registrados, su bimestre y su período de matrícula.</p>
        </div>
        <button type="button" className={estilos.primario} onClick={modelo.abrirCreacion}>+ Crear año escolar</button>
      </div>

      {datos.anios.length ? (
        <div className={`${estilos.tablaContenedor} ${estilos.tablaSeparada}`}>
          <table>
            <caption>Años académicos registrados</caption>
            <thead>
              <tr>
                <th scope="col">Año académico</th>
                <th scope="col">Bimestre</th>
                <th scope="col">Período de matrícula</th>
              </tr>
            </thead>
            <tbody>
              {datos.anios.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.anio}</strong></td>
                  <td>{item.bimestre ?? '—'}</td>
                  <td>{describirPeriodo(item.inicioMatricula, item.finMatricula)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EstadoConsulta tipo="vacio" mensaje="Aún no hay años académicos registrados. Crea el primero para configurar la matrícula." />
      )}

      <p className={estilos.pie}>{datos.anios.length} años académicos registrados</p>
    </section>
  );

  const renderizarFormulario = () => {
    const mensajeRango = obtenerMensajeRangoMatricula(formulario.inicioMatricula, formulario.finMatricula);
    // Un período repetido (mismo año y bimestre) se avisa junto al bimestre, que es lo que hay que cambiar.
    const errorBimestre = errores.bimestre || errores.periodo;

    return (
      <section className={estilos.tarjeta} aria-labelledby="titulo-formulario-anio">
        <h2 id="titulo-formulario-anio">Crear año escolar</h2>
        <form onSubmit={modelo.solicitarConfirmacion} noValidate aria-busy={guardando}>
          <div className={estilos.filtros}>
            <label className={estilos.campo} htmlFor="registro-anio">
              Año académico
              <input
                id="registro-anio"
                name="anio"
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={formulario.anio}
                autoFocus
                disabled={guardando}
                aria-required="true"
                aria-invalid={Boolean(errores.anio)}
                aria-describedby={errores.anio ? 'error-anio' : undefined}
                onChange={(evento) => modelo.cambiarCampo('anio', evento.target.value)}
              />
              {errores.anio && <span className={estilos.error} id="error-anio">{errores.anio}</span>}
            </label>

            <label className={estilos.campo} htmlFor="registro-bimestre">
              Bimestre
              <select
                id="registro-bimestre"
                name="bimestre"
                value={formulario.bimestre}
                disabled={guardando}
                aria-required="true"
                aria-invalid={Boolean(errorBimestre)}
                aria-describedby={errorBimestre ? 'error-bimestre' : undefined}
                onChange={(evento) => modelo.cambiarCampo('bimestre', evento.target.value)}
              >
                <option value="">Selecciona un bimestre</option>
                {datos.bimestres.map((bimestre) => <option key={bimestre} value={bimestre}>{bimestre}</option>)}
              </select>
              {errorBimestre && <span className={estilos.error} id="error-bimestre">{errorBimestre}</span>}
            </label>
          </div>

          <div className={estilos.campo}>
            <span>Período de matrícula</span>
            <FiltroRangoFechas
              fechaDesde={formulario.inicioMatricula}
              fechaHasta={formulario.finMatricula}
              alCambiarFechaDesde={(valor) => modelo.cambiarCampo('inicioMatricula', valor)}
              alCambiarFechaHasta={(valor) => modelo.cambiarCampo('finMatricula', valor)}
              mensajeError={errores.periodoMatricula || mensajeRango}
            />
          </div>

          {modelo.errorGuardado && <p className={estilos.error} role="alert">{modelo.errorGuardado}</p>}

          <div className={estilos.acciones}>
            <button type="button" className={estilos.secundario} disabled={guardando} onClick={modelo.cancelarCreacion}>
              Cancelar
            </button>
            <button type="submit" className={estilos.primario} disabled={guardando}>Guardar</button>
          </div>
        </form>
      </section>
    );
  };

  return (
    <div className={estilos.panel}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      {formulario ? renderizarFormulario() : renderizarTabla()}

      {confirmando && formulario && (
        <ModalConfirmacion
          titulo="Confirmar creación del año escolar"
          mensaje="¿Estás seguro de que los datos ingresados son correctos?"
          detalles={[
            { etiqueta: 'Año académico', valor: formulario.anio },
            { etiqueta: 'Bimestre', valor: formulario.bimestre },
            { etiqueta: 'Período de matrícula', valor: describirPeriodo(formulario.inicioMatricula, formulario.finMatricula) }
          ]}
          textoAceptar="Sí, crear año"
          textoCancelar="Revisar datos"
          procesando={guardando}
          alAceptar={modelo.confirmarCreacion}
          alCancelar={modelo.cancelarConfirmacion}
        />
      )}
    </div>
  );
}
