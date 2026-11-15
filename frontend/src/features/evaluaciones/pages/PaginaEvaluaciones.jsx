import { useState } from 'react';

import useAuth from '../../../shared/auth/useAuth.js';
import BotonActualizar from '../../../shared/components/BotonActualizar.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import DialogoNotasCompetencias from '../components/DialogoNotasCompetencias.jsx';
import DialogoNotasEvaluacion from '../components/DialogoNotasEvaluacion.jsx';
import DialogoNuevaEvaluacion from '../components/DialogoNuevaEvaluacion.jsx';
import TarjetaEvaluacion from '../components/TarjetaEvaluacion.jsx';
import useEvaluaciones from '../hooks/useEvaluaciones.js';
import { etiquetaGradoSeccion, opcionesCurso } from '../utils/etiquetas.js';
import estilos from './PaginaEvaluaciones.module.css';

/** Tarjetas por página: 4 (2 filas de 2), que caben sin desplazamiento; con más, se pagina. */
const TARJETAS_POR_PAGINA = 4;

const MOTIVO_ANIO_NO_VIGENTE = 'El año académico no está vigente.';

/**
 * Evaluaciones del docente: elige curso y sección, consulta sus evaluaciones como tarjetas y registra evaluaciones y
 * notas en minipantallas (diálogos), de modo que la página nunca crece con formularios.
 */
export default function PaginaEvaluaciones() {
  const { usuario } = useAuth();
  const modelo = useEvaluaciones(usuario);
  const { notificacion, mostrarNotificacion } = useNotificacion();
  // Minipantalla abierta: { tipo: 'nueva' | 'notas' | 'competencias', evaluacion? } o null.
  const [dialogo, establecerDialogo] = useState(null);
  const [pagina, establecerPagina] = useState(0);

  const {
    estado, errorCarga, recargar, contexto, anioVigente, cursoId, seccionId, asignacion, seccion, competencias,
    asignacionSeleccionada, evaluacionesVisibles
  } = modelo;

  const anioNoVigente = anioVigente?.vigente === false;
  const totalPaginas = Math.max(1, Math.ceil(evaluacionesVisibles.length / TARJETAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const tarjetasPagina = evaluacionesVisibles.slice(
    paginaActual * TARJETAS_POR_PAGINA,
    (paginaActual + 1) * TARJETAS_POR_PAGINA
  );
  const hayPaginas = evaluacionesVisibles.length > TARJETAS_POR_PAGINA;
  const sinAsignaciones = estado === 'listo' && !contexto?.asignaciones?.length;

  // El curso se elige solo por su nombre; el grado y la sección van aparte, como chips cortos («1er Grado A»).
  const opcionesDeCurso = opcionesCurso(contexto?.asignaciones ?? []);
  const opcionesSeccion = (asignacion?.secciones ?? []).map((item) => ({
    valor: String(item.id),
    etiqueta: etiquetaGradoSeccion(item)
  }));

  const cambiarCurso = (valor) => {
    modelo.seleccionarCurso(valor);
    establecerPagina(0);
  };
  const cambiarSeccion = (valor) => {
    modelo.establecerSeccionId(valor);
    establecerPagina(0);
  };
  const cerrarDialogo = () => establecerDialogo(null);

  return (
    <div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      {/* Barra de título (GUI §6): título y descripción en la misma línea. Las acciones van al pie de las evaluaciones
          del curso y la sección elegidos, junto al paginador. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Evaluaciones</h1>
          <p className={estilos.descripcion}>Registra evaluaciones y notas de tus cursos del año académico vigente.</p>
        </div>
      </header>

      {estado === 'cargando' && (
        <div className={estilos.contenedorEstado}><EstadoConsulta tipo="carga" filasEsqueleto={4} /></div>
      )}

      {estado === 'error' && (
        <div className={estilos.contenedorEstado}>
          <EstadoConsulta tipo="error" mensaje={errorCarga} alReintentar={recargar} />
        </div>
      )}

      {sinAsignaciones && (
        <div className={estilos.contenedorEstado}>
          <EstadoConsulta
            tipo="vacio"
            icono="libro"
            mensaje="No tienes cursos y secciones asignados en el año académico vigente."
          />
        </div>
      )}

      {estado === 'listo' && !sinAsignaciones && (
        <>
          <section className={estilos.filtros} aria-label="Curso y sección">
            <SelectFiltro
              id="evaluaciones-curso"
              etiqueta="Curso"
              valor={cursoId}
              opciones={opcionesDeCurso}
              alCambiar={cambiarCurso}
              apilado
            />
            <div className={estilos.grupoSeccion}>
              {/* El subtítulo es visual: el grupo ya tiene su nombre accesible en `etiquetaGrupo`. */}
              <span className={estilos.rotulo} aria-hidden="true">Grado y sección</span>
              <FiltroChips
                etiquetaGrupo="Filtrar evaluaciones por grado y sección"
                opciones={opcionesSeccion}
                valorSeleccionado={seccionId}
                alSeleccionar={cambiarSeccion}
              />
            </div>
            <BotonActualizar alActualizar={recargar} />
            <div className={estilos.anio}>
              <span className={estilos.rotulo}>Año académico {anioVigente?.anio}</span>
              <Insignia tono={anioNoVigente ? 'gris' : 'verde'}>{anioNoVigente ? 'No vigente' : 'Vigente'}</Insignia>
            </div>
          </section>

          {asignacion && seccion && (
            <section className={estilos.zona} aria-label="Evaluaciones de la sección">
              <div className={estilos.encabezadoZona}>
                <div className={estilos.textoZona}>
                  <h2 className={estilos.tituloZona}>
                    Evaluaciones de {asignacion.cursoNombre} · {etiquetaGradoSeccion(seccion)}
                  </h2>
                  <p className={estilos.resumen}>
                    {evaluacionesVisibles.length === 1 ? '1 evaluación' : `${evaluacionesVisibles.length} evaluaciones`}
                  </p>
                </div>
              </div>

              {evaluacionesVisibles.length === 0 ? (
                <div className={estilos.contenedorEstado}>
                  <EstadoConsulta
                    tipo="vacio"
                    icono="archivo"
                    mensaje="Todavía no hay evaluaciones registradas para esta sección."
                    etiquetaAccion={anioNoVigente ? undefined : 'Crear la primera evaluación'}
                    alAccion={anioNoVigente ? undefined : () => establecerDialogo({ tipo: 'nueva' })}
                  />
                </div>
              ) : (
                // `key` por página: al cambiar de página el desplazamiento de la rejilla vuelve al inicio.
                <div className={estilos.zonaRejilla} key={`${cursoId}-${seccionId}-${paginaActual}`}>
                  {/* Una página completa reparte todo el alto disponible entre sus filas; una parcial no se estira. */}
                  <ul
                    className={tarjetasPagina.length === TARJETAS_POR_PAGINA ? `${estilos.rejilla} ${estilos.rejillaLlena}` : estilos.rejilla}
                    aria-label="Evaluaciones registradas"
                  >
                    {tarjetasPagina.map((evaluacion) => (
                      <li key={evaluacion.id}>
                        <TarjetaEvaluacion
                          evaluacion={evaluacion}
                          vigente={modelo.esAnioVigente(evaluacion)}
                          alRegistrarNotas={(item) => establecerDialogo({ tipo: 'notas', evaluacion: item })}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pie: las acciones de la sección a la izquierda y el paginador a la derecha. Siempre visible, así las
                  acciones no cambian de lugar según cuántas evaluaciones haya. */}
              <div className={estilos.pie}>
                <div className={estilos.acciones}>
                  <button
                    type="button"
                    className={estilos.botonPrimario}
                    disabled={anioNoVigente}
                    title={anioNoVigente ? MOTIVO_ANIO_NO_VIGENTE : undefined}
                    onClick={() => establecerDialogo({ tipo: 'nueva' })}
                  >
                    <Icono nombre="agregar" tamano={16} />
                    Crear evaluación
                  </button>
                  <button
                    type="button"
                    className={estilos.botonSecundario}
                    disabled={anioNoVigente}
                    title={anioNoVigente ? MOTIVO_ANIO_NO_VIGENTE : undefined}
                    onClick={() => establecerDialogo({ tipo: 'competencias' })}
                  >
                    Registrar notas de competencias
                  </button>
                </div>

                {hayPaginas && (
                  <Paginacion
                    pagina={paginaActual}
                    totalPaginas={totalPaginas}
                    totalElementos={evaluacionesVisibles.length}
                    tamanioPagina={TARJETAS_POR_PAGINA}
                    cantidadEnPagina={tarjetasPagina.length}
                    alCambiarPagina={establecerPagina}
                    etiqueta="Paginación de evaluaciones"
                    unidadSingular="evaluación"
                    unidadPlural="evaluaciones"
                  />
                )}
              </div>
            </section>
          )}
        </>
      )}

      {dialogo?.tipo === 'nueva' && asignacion && seccion && (
        <DialogoNuevaEvaluacion
          contexto={contexto}
          asignacion={asignacion}
          seccion={seccion}
          competencias={competencias}
          asignacionSeleccionada={asignacionSeleccionada}
          alCerrar={cerrarDialogo}
          alCrear={(evaluacion, bimestreNombre) => {
            modelo.agregarEvaluacion(evaluacion);
            cerrarDialogo();
            mostrarNotificacion(`La evaluación se registró correctamente en ${bimestreNombre}.`);
          }}
        />
      )}

      {dialogo?.tipo === 'notas' && (
        <DialogoNotasEvaluacion
          key={dialogo.evaluacion.id}
          evaluacion={dialogo.evaluacion}
          usuario={usuario}
          anioVigente={anioVigente}
          vigente={modelo.esAnioVigente(dialogo.evaluacion)}
          alCerrar={cerrarDialogo}
          alGuardar={(cantidad) => {
            cerrarDialogo();
            mostrarNotificacion(
              cantidad === 1
                ? `Se guardó 1 nota de «${dialogo.evaluacion.nombre}».`
                : `Se guardaron ${cantidad} notas de «${dialogo.evaluacion.nombre}».`
            );
          }}
        />
      )}

      {dialogo?.tipo === 'competencias' && asignacion && seccion && (
        <DialogoNotasCompetencias
          contexto={contexto}
          asignacion={asignacion}
          seccion={seccion}
          competencias={competencias}
          asignacionSeleccionada={asignacionSeleccionada}
          usuario={usuario}
          alCerrar={cerrarDialogo}
          alGuardar={() => {
            cerrarDialogo();
            mostrarNotificacion('Las notas de competencias y conclusiones se guardaron correctamente.');
          }}
        />
      )}
    </div>
  );
}
