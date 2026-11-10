import { useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import DialogoAsignacion from '../components/DialogoAsignacion.jsx';
import DialogoBloque from '../components/DialogoBloque.jsx';
import DialogoCargaMasiva from '../components/DialogoCargaMasiva.jsx';
import DialogoCargaDocente from '../components/DialogoCargaDocente.jsx';
import DialogoDescartarCambios from '../components/DialogoDescartarCambios.jsx';
import DialogoSesiones from '../components/DialogoSesiones.jsx';
import DialogoEliminarAsignacion from '../components/DialogoEliminarAsignacion.jsx';
import FiltrosHorario from '../components/FiltrosHorario.jsx';
import MatrizHorario from '../components/MatrizHorario.jsx';
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
  const [dialogoCargaDocente, establecerDialogoCargaDocente] = useState(false);

  const sinRelaciones = asignaciones.lista.length === 0;
  const sinBloquesGuardados = Object.keys(horario.bloquesGuardados).length === 0;

  function solicitarVerHorario() {
    if (consulta && horario.hayCambios) {
      establecerConfirmacion('cambiar');
      return;
    }
    verHorario();
  }

  async function guardarHorario() {
    const { error, resumen } = await horario.guardar();
    if (error) {
      mostrarNotificacion(error, true);
      return;
    }
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

  function completarCargaMasiva({ bloquesCreados }) {    establecerDialogoCargaMasiva(false);
    if (consulta && horario.hayCambios) {
      // No se pisa el borrador de la matriz: el usuario decide cuándo volver a consultar.
      mostrarNotificacion(
        `Se crearon ${bloquesCreados} bloques. Vuelve a consultar la sección para verlos; tienes cambios sin guardar.`
      );
      return;
    }
    recargarConsulta();
    mostrarNotificacion(`Carga masiva completada: se crearon ${bloquesCreados} bloques horarios.`);
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

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.sobretitulo}>Módulo de gestión</p>
        <h1 className={estilos.titulo}>Horarios</h1>
        <p className={estilos.descripcion}>
          Elige el grado y la sección para definir sus cursos y docentes, y armar el horario semanal.
        </p>
      </header>

      {estadoPeriodo === 'cargando' && (
        <p className={estilos.periodoCargando}>Consultando el estado del periodo de matrícula…</p>
      )}
      {estadoPeriodo === 'error' && (
        <p className={estilos.periodoError} role="alert">
          {errorPeriodo} Las acciones de horario quedan deshabilitadas.
        </p>
      )}
      {estadoPeriodo === 'listo' && periodo && (
        <section className={estilos.periodo} aria-label="Estado del periodo de matrícula">
          <div>
            <p className={estilos.periodoEtiqueta}>Periodo de matrícula</p>
            <p className={estilos.periodoEstado}>{periodo.estado}</p>
          </div>
          <p className={estilos.periodoDetalle}>
            Asignaciones {puedeEditarAsignaciones ? 'abiertas' : 'cerradas'} ·{' '}
            Bloques {puedeEditarBloques ? 'abiertos' : 'cerrados'} ·{' '}
            Sesiones {puedeGenerarSesiones ? 'abiertas' : 'cerradas'}
          </p>
        </section>
      )}

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
          acciones={(
            <>
              <button
                type="button"
                className={estilos.botonCargaMasiva}
                disabled={
                  estadoCatalogos !== 'listo'
                  || !anioVigente?.id
                  || (catalogos.docentes ?? []).length === 0
                }
                title={
                  !anioVigente?.id
                    ? 'No hay un año académico vigente para consultar la carga docente.'
                    : (catalogos.docentes ?? []).length === 0
                      ? 'No hay docentes activos disponibles.'
                      : undefined
                }
                onClick={() => establecerDialogoCargaDocente(true)}
              >
                <Icono nombre="reloj" tamano={18} />
                Carga docente
              </button>
              <button
                type="button"
                className={estilos.botonCargaMasiva}
                disabled={estadoCatalogos !== 'listo' || !puedeEditarBloques}
                title={
                  !puedeEditarBloques
                    ? 'La carga masiva solo está disponible con el periodo en VIGENTE.'
                    : undefined
                }
                onClick={() => establecerDialogoCargaMasiva(true)}
              >
                <Icono nombre="subir" tamano={18} />
                Carga masiva
              </button>
            </>
          )}
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
          mensaje="Selecciona un grado y una sección, y pulsa «Ver horario»."
        />
      )}

      {consulta && (
        <>
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
          />

          <section className={estilos.seccionMatriz} aria-labelledby={ID_TITULO_MATRIZ}>
            <h2 id={ID_TITULO_MATRIZ} className={estilos.tituloMatriz}>
              Matriz de Horarios — <span className={estilos.seccionActual}>{tituloConsulta}</span>
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
                    Agrega al menos una relación curso-docente en la tabla de arriba para poder asignar bloques.
                  </p>
                )}

                <MatrizHorario
                  titulo={tituloConsulta}
                  bloques={horario.bloques}
                  bloquesGuardados={horario.bloquesGuardados}
                  asignaciones={asignaciones.lista}
                  aulas={catalogos.aulas}
                  ocupaciones={horario.ocupaciones}
                  deshabilitada={sinRelaciones}
                  soloLectura={horario.soloLectura}
                  alElegirBloque={establecerBloqueElegido}
                  alQuitarBloque={horario.quitarBloque}
                  alMoverBloque={moverBloque}
                />

                <div className={estilos.pieMatriz}>
                  <button
                    type="button"
                    className={estilos.botonExportar}
                    disabled={!consulta || Object.keys(horario.bloques).length === 0}
                    title={
                      !consulta
                        ? 'Selecciona una sección para exportar su borrador.'
                        : Object.keys(horario.bloques).length === 0
                          ? 'No hay bloques en la grilla para exportar.'
                          : 'Exporta la grilla actual, incluso si tiene cambios sin guardar.'
                    }
                    onClick={exportarBorradorActual}
                  >
                    <Icono nombre="archivo" tamano={18} />
                    Exportar borrador
                  </button>
                  <button
                    type="button"
                    className={estilos.botonSesiones}
                    disabled={sinBloquesGuardados || horario.hayCambios || !puedeGenerarSesiones}
                    title={
                      !puedeGenerarSesiones
                        ? 'La generación de sesiones solo está disponible con el periodo FINALIZADO.'
                        : horario.hayCambios
                          ? 'Guarda el horario antes de generar sesiones.'
                          : sinBloquesGuardados
                            ? 'Asigna y guarda al menos un bloque para generar sesiones.'
                            : undefined
                    }
                    onClick={() => establecerDialogoSesiones(true)}
                  >
                    <Icono nombre="reloj" tamano={18} />
                    Generar sesiones
                  </button>
                  {horario.hayCambios && (
                    <span className={estilos.avisoCambios}>Tienes cambios sin guardar.</span>
                  )}
                  <button
                    type="button"
                    className={estilos.botonDescartar}
                    disabled={!horario.hayCambios || horario.guardando}
                    onClick={() => establecerConfirmacion('descartar')}
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    className={estilos.botonGuardar}
                    disabled={!horario.hayCambios || horario.guardando || !puedeEditarBloques}
                    onClick={guardarHorario}
                  >
                    {horario.guardando ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </>
            )}
          </section>
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
          tituloSeccion={tituloConsulta}
          alCancelar={() => establecerDialogoSesiones(false)}
          alNotificar={mostrarNotificacion}
        />
      )}

      {dialogoCargaMasiva && (
        <DialogoCargaMasiva
          anios={catalogos.anios}
          aulas={catalogos.aulas}
          anioIdInicial={anioVigente?.id}
          alCompletar={completarCargaMasiva}
          alCancelar={() => establecerDialogoCargaMasiva(false)}
        />
      )}

      {dialogoCargaDocente && (
        <DialogoCargaDocente
          docentes={catalogos.docentes}
          anioId={anioVigente?.id}
          anio={anioVigente?.anio}
          docenteInicialId={asignaciones.lista[0]?.docenteId}
          onCerrar={() => establecerDialogoCargaDocente(false)}
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
          alConfirmar={confirmacion === 'cambiar' ? verHorario : horario.descartarCambios}
        />
      )}

      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}
    </div>
  );
}
