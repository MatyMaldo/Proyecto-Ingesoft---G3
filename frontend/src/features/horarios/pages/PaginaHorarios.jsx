import { useEffect, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import MenuDesplegable from '../../../shared/components/MenuDesplegable.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import useOperacionMasiva from '../../../shared/hooks/useOperacionMasiva.js';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import DialogoAsignacion from '../components/DialogoAsignacion.jsx';
import DialogoBloque from '../components/DialogoBloque.jsx';
import DialogoCargaMasiva from '../components/DialogoCargaMasiva.jsx';
import DialogoCargaDocente from '../components/DialogoCargaDocente.jsx';
import DialogoDescartarCambios from '../components/DialogoDescartarCambios.jsx';
import DialogoSesiones from '../components/DialogoSesiones.jsx';
import DialogoEliminarAsignacion from '../components/DialogoEliminarAsignacion.jsx';
import EstadoPeriodo from '../components/EstadoPeriodo.jsx';
import FiltrosHorario from '../components/FiltrosHorario.jsx';
import MatrizHorario from '../components/MatrizHorario.jsx';
import PanelConflictosHorario from '../components/PanelConflictosHorario.jsx';
import PestanasHorario from '../components/PestanasHorario.jsx';
import TablaAsignaciones from '../components/TablaAsignaciones.jsx';
import useHorarios from '../hooks/useHorarios.js';
import { exportarBorrador } from '../services/horariosService.js';
import { guardarArchivo } from '../utils/guardarArchivo.js';
import estilos from './PaginaHorarios.module.css';

const ID_TITULO_MATRIZ = 'horarios-titulo-matriz';
/**
 * Página de Horarios (HU de horarios, EAC-16). Tres partes: filtros obligatorios de grado y
 * sección, relaciones curso-docente de esa sección y matriz semanal para asignar cada bloque.
 * El breadcrumb lo pinta el shell a partir de `migas` en `routes.jsx`.
 */
export default function PaginaHorarios() {
  const { notificacion, mostrarNotificacion } = useNotificacion();
  const {
    catalogos,
    estadoCatalogos,
    errorCatalogos,
    errorHorario,
    estadoSecciones,
    errorSecciones,
    reintentarCatalogos,
    periodo,
    estadoPeriodo,
    errorPeriodo,
    anioVigente,
    primerBimestre,
    puedeEditarAsignaciones,
    puedeEditarBloques,
    puedeGenerarSesiones,
    filtros,
    seleccionarGrado,
    seleccionarSeccion,
    seccionesFiltradas,
    verHorario,
    recargarConsulta,
    consulta,
    tituloConsulta,
    asignaciones,
    horario
  } = useHorarios();

  const [dialogoAsignacion, establecerDialogoAsignacion] = useState(false);
  const [asignacionAEditar, establecerAsignacionAEditar] = useState(null);
  const [asignacionAEliminar, establecerAsignacionAEliminar] = useState(null);
  const [bloqueElegido, establecerBloqueElegido] = useState(null);
  // 'cambiar' (otra sección) o 'descartar' (volver a lo guardado), cuando hay cambios sin guardar.
  const [confirmacion, establecerConfirmacion] = useState(null);
  const [dialogoSesiones, establecerDialogoSesiones] = useState(false);
  const [dialogoCargaMasiva, establecerDialogoCargaMasiva] = useState(false);
  // Asignación cuya carga horaria docente se está viendo.
  const [docenteCarga, establecerDocenteCarga] = useState(null);
  // Pestaña elegida por la persona; sin elección (`null`) se decide según el periodo (ver `vistaActiva`).
  const [vista, establecerVista] = useState(null);
  const [bloqueResaltado, establecerBloqueResaltado] = useState(null);
  const [versionResaltado, establecerVersionResaltado] = useState(0);
  const [panelConflictosVisible, establecerPanelConflictosVisible] = useState(false);

  // Consulta el avance cada segundo, pero la primera vez a los 250 ms: crear unas decenas de bloques tarda décimas
  // de segundo y no debe esperar un segundo entero para mostrarse como terminado.
  const operacionCargaMasiva = useOperacionMasiva({
    intervaloMs: 1000,
    intervaloInicialMs: 250,
    alTerminar: (job) => completarCargaMasiva(job)
  });

  const operacionSesiones = useOperacionMasiva({
    alTerminar: (job) => {
      const resultado = job.resultado ?? {};
      const errores = resultado.errores?.length ?? job.errores ?? 0;
      const conError = errores > 0
        || job.estado === 'COMPLETADO_CON_ERRORES'
        || job.estado === 'FALLIDO';

      const creadas = resultado.sesionesCreadas ?? job.exitosos ?? 0;
      const omitidasCreadas = resultado.sesionesOmitidasCreadas ?? 0;
      const omitidasExistentes = resultado.sesionesOmitidasExistentes ?? 0;
      const yaExistian = resultado.sesionesYaExistentes ?? 0;

      const partes = [`${creadas} creadas`];
      if (omitidasCreadas > 0) partes.push(`${omitidasCreadas} omitidas`);
      if (yaExistian > 0) partes.push(`${yaExistian} ya existían`);
      if (omitidasExistentes > 0) partes.push(`${omitidasExistentes} ya estaban omitidas`);
      if (errores > 0) partes.push(`${errores} errores`);

      mostrarNotificacion(`Generación de sesiones: ${partes.join(', ')}.`, conError);
    }
  });

  const sinRelaciones = asignaciones.lista.length === 0;
  // Con las asignaciones cerradas por el periodo el trabajo está en la matriz, y se abre ahí.
  const vistaActiva = vista
    ?? (asignaciones.soloLectura && !sinRelaciones ? 'matriz' : 'asignaciones');

  // Al consultar otra sección vuelve a decidirse la pestaña inicial.
  useEffect(() => {
    establecerVista(null);
  }, [tituloConsulta]);
  const sinBloquesGuardados = Object.keys(horario.bloquesGuardados).length === 0;

  function solicitarVerHorario() {
    if (consulta && horario.hayCambios) {
      establecerConfirmacion('cambiar');
      return;
    }
    verHorario();
  }

  async function guardarHorario() {
    const { error, resumen, errores } = await horario.guardar();
    establecerBloqueResaltado(null);
    if (error) {
      establecerPanelConflictosVisible(Boolean(errores?.length));
      mostrarNotificacion(error, true);
      return;
    }
    establecerPanelConflictosVisible(false);
    if (!resumen) {
      mostrarNotificacion('Horario guardado correctamente.');
      return;
    }
    mostrarNotificacion(
      `Horario guardado. ${resumen.creados ?? 0} creados, `
      + `${resumen.actualizados ?? 0} actualizados, `
      + `${resumen.eliminados ?? 0} eliminados.`
    );
  }

  function seleccionarConflicto(conflicto) {
    if (!conflicto?.clave) return;
    establecerBloqueResaltado(conflicto.clave);
    establecerVersionResaltado((actual) => actual + 1);
  }

  function descartarCambios() {
    establecerBloqueResaltado(null);
    establecerPanelConflictosVisible(false);
    horario.descartarCambios();
  }

  function completarCargaMasiva(job = {}) {
    const bloquesCreados = job.exitosos ?? 0;
    // Con el diálogo abierto el resultado se muestra ahí; la notificación es para cuando se cerró.
    const avisar = !dialogoCargaMasiva;
    if (job.errores > 0 || job.estado === 'COMPLETADO_CON_ERRORES' || job.estado === 'FALLIDO') {
      if (avisar) {
        mostrarNotificacion(
          `Carga masiva: ${bloquesCreados} bloques creados, ${job.errores ?? 0} errores.`,
          true
        );
      }
      return;
    }
    if (consulta && horario.hayCambios) {
      // No se pisa el borrador de la matriz: el usuario decide cuándo volver a consultar.
      mostrarNotificacion(
        `Se crearon ${bloquesCreados} bloques. Vuelve a consultar la sección para verlos; tienes cambios sin guardar.`
      );
      return;
    }
    recargarConsulta();
    if (avisar) {
      mostrarNotificacion(`Carga masiva completada: se crearon ${bloquesCreados} bloques horarios.`);
    }
  }

  async function exportarBorradorActual() {
    const bloques = Object.values(horario.bloques);
    const anioAcademicoId = consulta?.anioAcademicoId ?? consulta?.anioId ?? anioVigente?.id;

    if (!anioAcademicoId || bloques.length === 0) {
      mostrarNotificacion(
        'Selecciona una sección con bloques para exportar el borrador.',
        true
      );
      return;
    }

    const bloqueIncompleto = bloques.find((bloque) =>
      bloque.asignacionId == null
      || bloque.aulaId == null
      || !bloque.dia
      || !bloque.horaInicio
      || !bloque.horaFin
    );
    if (bloqueIncompleto) {
      mostrarNotificacion(
        'Hay bloques incompletos en la grilla. Revisa que tengan curso, aula, día y horas.',
        true
      );
      return;
    }

    const respuesta = await exportarBorrador({
      anioAcademicoId,
      formato: 'csv',
      bloques
    });
    if (!respuesta.exitoso || !(respuesta.datos instanceof Blob)) {
      mostrarNotificacion(respuesta.mensaje || 'No se pudo exportar el borrador.', true);
      return;
    }
    guardarArchivo(respuesta.datos, 'horarios-borrador.csv');
  }

  async function agregarAsignacion(datos) {
    const error = await asignaciones.agregar(datos);
    if (!error) {
      establecerDialogoAsignacion(false);
      mostrarNotificacion('Relación curso-docente agregada.');
    }
    return error;
  }

  async function editarAsignacion(datos) {
    const error = await asignaciones.editar(asignacionAEditar.id, datos);
    if (!error) {
      establecerAsignacionAEditar(null);
      mostrarNotificacion('Relación curso-docente actualizada.');
    }
    return error;
  }

  function moverBloque(origen, destino) {
    const error = horario.moverBloque(origen, destino);
    if (error) {
      mostrarNotificacion(error, true);
    }
  }

  async function eliminarAsignacion() {
    const error = await asignaciones.quitar(asignacionAEliminar.id);
    if (!error) {
      mostrarNotificacion('Relación curso-docente eliminada.');
    }
    return error;
  }

  /** Acciones secundarias del pie de la matriz. Si no están disponibles se explica el motivo al elegirlas. */
  const accionesPie = [
    {
      id: 'exportar-borrador',
      etiqueta: 'Exportar borrador',
      icono: 'archivo',
      alSeleccionar: () => {
        if (Object.keys(horario.bloques).length === 0) {
          mostrarNotificacion('No hay bloques en la grilla para exportar.', true);
          return;
        }
        exportarBorradorActual();
      }
    }
  ];

  /** Por qué «Generar sesiones» no está disponible (vacío si lo está). */
  const motivoSinSesiones = !puedeGenerarSesiones
    ? 'La generación de sesiones se habilita desde el inicio del primer bimestre.'
    : horario.hayCambios
      ? 'Guarda el horario antes de generar sesiones.'
      : sinBloquesGuardados
        ? 'Asigna y guarda al menos un bloque para generar sesiones.'
        : undefined;

  const motivoSinCargaMasiva = !puedeEditarBloques
    ? 'La carga masiva solo está disponible mientras el periodo de matrícula está vigente.'
    : undefined;

  /** La misma matriz se pinta en la página (con scroll interno) y en el diálogo ampliado. */
  function pintarMatriz(ajustarAlto) {
    return (
      <MatrizHorario
        titulo={tituloConsulta}
        bloques={horario.bloques}
        bloquesGuardados={horario.bloquesGuardados}
        asignaciones={asignaciones.lista}
        aulas={catalogos.aulas}
        ocupaciones={horario.ocupaciones}
        conflictos={horario.conflictos}
        bloqueResaltado={horario.conflictos.length > 0 ? bloqueResaltado : null}
        versionResaltado={versionResaltado}
        deshabilitada={sinRelaciones}
        ajustarAlto={ajustarAlto}
        soloLectura={horario.soloLectura}
        alElegirBloque={establecerBloqueElegido}
        alQuitarBloque={horario.quitarBloque}
        alMoverBloque={moverBloque}
      />
    );
  }

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Horarios</h1>
          <p className={estilos.descripcion}>Define cursos, docentes y bloques por sección.</p>
        </div>
        <div className={estilos.acciones}>
          <button
            type="button"
            className={estilos.botonPrimario}
            disabled={estadoCatalogos !== 'listo' || !puedeEditarBloques}
            title={motivoSinCargaMasiva}
            onClick={() => establecerDialogoCargaMasiva(true)}
          >
            <Icono nombre="subir" tamano={18} />
            Carga masiva
          </button>
        </div>
      </header>

      <EstadoPeriodo
        estado={estadoPeriodo}
        periodo={periodo}
        error={errorPeriodo}
        asignacionesAbiertas={puedeEditarAsignaciones}
        bloquesAbiertos={puedeEditarBloques}
        sesionesAbiertas={puedeGenerarSesiones}
      />

      {estadoCatalogos === 'error' ? (
        <EstadoConsulta
          tipo="error"
          mensaje={errorCatalogos}
          alReintentar={reintentarCatalogos}
        />
      ) : (
        <FiltrosHorario
          grados={catalogos.grados}
          secciones={seccionesFiltradas}
          filtros={filtros}
          deshabilitado={estadoCatalogos === 'cargando'}
          seccionesCargando={estadoSecciones === 'cargando'}
          alCambiarGrado={seleccionarGrado}
          alCambiarSeccion={seleccionarSeccion}
          alVerHorario={solicitarVerHorario}
        />
      )}
      {estadoCatalogos === 'listo' && estadoSecciones === 'error' && (
        <EstadoConsulta
          tipo="error"
          mensaje={errorSecciones}
          alReintentar={reintentarCatalogos}
        />
      )}

      {!consulta && estadoCatalogos === 'listo' && (
        <EstadoConsulta
          tipo="vacio"
          icono="calendario"
          mensaje="Selecciona un grado y una sección, y pulsa «Ver horario»."
        />
      )}

      {consulta && (
        <>
          <PestanasHorario
            etiqueta="Contenido de Horarios"
            valor={vistaActiva}
            alCambiar={establecerVista}
            opciones={[
              { id: 'asignaciones', etiqueta: 'Asignaciones' },
              {
                id: 'matriz',
                etiqueta: 'Matriz de horarios',
                aviso: horario.hayCambios ? 'cambios sin guardar' : undefined
              }
            ]}
          />

          {vistaActiva === 'asignaciones' && (
            <div id="panel-asignaciones" role="tabpanel" aria-labelledby="pestana-asignaciones">
              <TablaAsignaciones
                key={tituloConsulta}
                estado={asignaciones.estado}
                asignaciones={asignaciones.lista}
                soloLectura={asignaciones.soloLectura}
                agregarDeshabilitado={asignaciones.agregarDeshabilitado}
                alReintentar={asignaciones.reintentar}
                alAgregar={() => establecerDialogoAsignacion(true)}
                alEditar={establecerAsignacionAEditar}
                alEliminar={establecerAsignacionAEliminar}
                alVerCarga={anioVigente?.id ? establecerDocenteCarga : undefined}
              />
            </div>
          )}

          {vistaActiva === 'matriz' && (
          <section
            id="panel-matriz"
            role="tabpanel"
            className={estilos.seccionMatriz}
            aria-labelledby={ID_TITULO_MATRIZ}
          >
            <h2 id={ID_TITULO_MATRIZ} className={estilosUtil.ocultoVisualmente}>
              Matriz de horarios de {tituloConsulta}
            </h2>

            {horario.estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}
            {horario.estado === 'error' && (
              <EstadoConsulta
                tipo="error"
                mensaje={errorHorario}
                alReintentar={asignaciones.reintentar}
              />
            )}
            {horario.estado === 'listo' && (
              <>
                {sinRelaciones && (
                  <p className={estilos.avisoVacio} role="status">
                    <Icono nombre="informacion" tamano={18} />
                    Agrega al menos una relación curso-docente en la pestaña «Asignaciones» para poder asignar bloques.
                  </p>
                )}

                {pintarMatriz(true)}

                {panelConflictosVisible && horario.conflictos.length > 0 && (
                  <PanelConflictosHorario
                    conflictos={horario.conflictos}
                    asignaciones={asignaciones.lista}
                    alSeleccionar={seleccionarConflicto}
                    alCerrar={() => establecerPanelConflictosVisible(false)}
                    alDescartar={() => establecerConfirmacion('descartar')}
                  />
                )}

                <div className={estilos.pieMatriz}>
                  <button
                    type="button"
                    className={estilos.botonSecundario}
                    disabled={Boolean(motivoSinSesiones)}
                    title={motivoSinSesiones}
                    onClick={() => establecerDialogoSesiones(true)}
                  >
                    <Icono nombre="reloj" tamano={18} />
                    Generar sesiones
                  </button>
                  <MenuDesplegable
                    etiquetaBoton="Más acciones del horario"
                    claseBoton={estilos.botonMas}
                    alineacion="inicio"
                    contenidoBoton={<Icono nombre="mas-opciones" tamano={20} />}
                    items={accionesPie}
                  />
                  {horario.hayCambios ? (
                    <span className={estilos.avisoCambios} role="status">Tienes cambios sin guardar.</span>
                  ) : (
                    motivoSinSesiones && (
                      <span className={estilos.avisoSesiones}>{motivoSinSesiones}</span>
                    )
                  )}
                  <button
                    type="button"
                    className={`${estilos.botonSecundario} ${estilos.empujarDerecha}`}
                    disabled={!horario.hayCambios || horario.guardando}
                    onClick={() => establecerConfirmacion('descartar')}
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    className={estilos.botonPrimario}
                    disabled={!horario.hayCambios || horario.guardando || !puedeEditarBloques}
                    onClick={guardarHorario}
                  >
                    {horario.guardando ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </>
            )}
          </section>
          )}
        </>
      )}

      {(dialogoAsignacion || asignacionAEditar) && (
        <DialogoAsignacion
          key={asignacionAEditar?.id ?? 'nueva-asignacion'}
          tituloSeccion={tituloConsulta}
          cursos={catalogos.cursos}
          docentes={catalogos.docentes}
          asignacion={asignacionAEditar}
          alCancelar={() => {
            establecerDialogoAsignacion(false);
            establecerAsignacionAEditar(null);
          }}
          alGuardar={asignacionAEditar ? editarAsignacion : agregarAsignacion}
        />
      )}

      {asignacionAEliminar && (
        <DialogoEliminarAsignacion
          asignacion={asignacionAEliminar}
          alCancelar={() => establecerAsignacionAEliminar(null)}
          alConfirmar={eliminarAsignacion}
        />
      )}

      {bloqueElegido && (
        <DialogoBloque
          key={bloqueElegido.clave ?? `${bloqueElegido.dia}-${bloqueElegido.horaInicio}`}
          dia={bloqueElegido.dia}
          horaInicioInicial={bloqueElegido.horaInicio}
          horaFinInicial={bloqueElegido.horaFin}
          asignaciones={asignaciones.lista}
          aulas={catalogos.aulas}
          ocupaciones={horario.ocupaciones}
          bloque={bloqueElegido.bloque}
          bloquesSeccion={Object.entries(horario.bloques)
            .filter(([clave]) => clave !== bloqueElegido.clave)
            .map(([, bloque]) => bloque)}
          alCancelar={() => establecerBloqueElegido(null)}
          alGuardar={(bloque) => {
            horario.guardarBloque({ clave: bloqueElegido.clave, bloque });
            establecerBloqueElegido(null);
          }}
        />
      )}

      {dialogoSesiones && (
        <DialogoSesiones
          consulta={consulta}
          periodo={periodo}
          primerBimestre={primerBimestre}
          tituloSeccion={tituloConsulta}
          alCancelar={() => establecerDialogoSesiones(false)}
          alNotificar={mostrarNotificacion}
          operacion={operacionSesiones}
        />
      )}

      {dialogoCargaMasiva && (
        <DialogoCargaMasiva
          anios={catalogos.anios}
          aulas={catalogos.aulas}
          anioIdInicial={anioVigente?.id}
          alCancelar={() => establecerDialogoCargaMasiva(false)}
          operacion={operacionCargaMasiva}
        />
      )}

      {docenteCarga && (
        <DialogoCargaDocente
          docente={{ id: docenteCarga.docenteId, nombre: docenteCarga.docenteNombre }}
          anioId={anioVigente?.id}
          anio={anioVigente?.anio}
          onCerrar={() => establecerDocenteCarga(null)}
        />
      )}

      {confirmacion && (
        <DialogoDescartarCambios
          mensaje={
            confirmacion === 'cambiar'
              ? 'Tienes cambios sin guardar en esta matriz. Si consultas otra sección, se perderán.'
              : 'Se perderán todos los cambios hechos desde el último guardado.'
          }
          textoConfirmar="Aceptar"
          alCancelar={() => establecerConfirmacion(null)}
          alConfirmar={confirmacion === 'cambiar' ? verHorario : descartarCambios}
        />
      )}

      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}
    </div>
  );
}
