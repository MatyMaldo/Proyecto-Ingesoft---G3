import { useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import DialogoAsignacion from '../components/DialogoAsignacion.jsx';
import DialogoBloque from '../components/DialogoBloque.jsx';
import DialogoCargaMasiva from '../components/DialogoCargaMasiva.jsx';
import DialogoDescartarCambios from '../components/DialogoDescartarCambios.jsx';
import DialogoSesiones from '../components/DialogoSesiones.jsx';
import DialogoEliminarAsignacion from '../components/DialogoEliminarAsignacion.jsx';
import FiltrosHorario from '../components/FiltrosHorario.jsx';
import MatrizHorario from '../components/MatrizHorario.jsx';
import TablaAsignaciones from '../components/TablaAsignaciones.jsx';
import { FRANJAS } from '../constants/horarios.js';
import useHorarios from '../hooks/useHorarios.js';
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
    reintentarCatalogos,
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
  const [asignacionAEliminar, establecerAsignacionAEliminar] = useState(null);
  const [bloqueElegido, establecerBloqueElegido] = useState(null);
  // 'cambiar' (otra sección) o 'descartar' (volver a lo guardado), cuando hay cambios sin guardar.
  const [confirmacion, establecerConfirmacion] = useState(null);
  const [dialogoSesiones, establecerDialogoSesiones] = useState(false);
  const [dialogoCargaMasiva, establecerDialogoCargaMasiva] = useState(false);

  const sinRelaciones = asignaciones.lista.length === 0;
  const sinBloquesGuardados = Object.keys(horario.bloquesGuardados).length === 0;
  const franjaElegida = FRANJAS.find((franja) => franja.id === bloqueElegido?.franjaId);

  function solicitarVerHorario() {
    if (consulta && horario.hayCambios) {
      establecerConfirmacion('cambiar');
      return;
    }
    verHorario();
  }

  async function guardarHorario() {
    const error = await horario.guardar();
    mostrarNotificacion(error ?? 'Horario guardado correctamente.', Boolean(error));
  }

  function completarCargaMasiva({ bloquesCreados }) {
    establecerDialogoCargaMasiva(false);
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

  async function agregarAsignacion(datos) {
    const error = await asignaciones.agregar(datos);
    if (!error) {
      mostrarNotificacion('Relación curso-docente agregada.');
    }
    return error;
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
          alCambiarGrado={seleccionarGrado}
          alCambiarSeccion={seleccionarSeccion}
          alVerHorario={solicitarVerHorario}
          acciones={(
            <button
              type="button"
              className={estilos.botonCargaMasiva}
              disabled={estadoCatalogos !== 'listo'}
              onClick={() => establecerDialogoCargaMasiva(true)}
            >
              <Icono nombre="subir" tamano={18} />
              Carga masiva
            </button>
          )}
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
                  alElegirBloque={(dia, franjaId) => establecerBloqueElegido({ dia, franjaId })}
                  alQuitarBloque={horario.quitarBloque}
                  alMoverBloque={horario.moverBloque}
                />

                <div className={estilos.pieMatriz}>
                  <button
                    type="button"
                    className={estilos.botonSesiones}
                    disabled={sinBloquesGuardados || horario.hayCambios}
                    title={
                      horario.hayCambios
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
                    disabled={!horario.hayCambios || horario.guardando}
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

      {dialogoAsignacion && (
        <DialogoAsignacion
          tituloSeccion={tituloConsulta}
          cursos={catalogos.cursos}
          docentes={catalogos.docentes}
          alCancelar={() => establecerDialogoAsignacion(false)}
          alGuardar={agregarAsignacion}
        />
      )}

      {asignacionAEliminar && (
        <DialogoEliminarAsignacion
          asignacion={asignacionAEliminar}
          alCancelar={() => establecerAsignacionAEliminar(null)}
          alConfirmar={eliminarAsignacion}
        />
      )}

      {bloqueElegido && franjaElegida && (
        <DialogoBloque
          key={`${bloqueElegido.dia}-${bloqueElegido.franjaId}`}
          dia={bloqueElegido.dia}
          franja={franjaElegida}
          asignaciones={asignaciones.lista}
          aulas={catalogos.aulas}
          ocupaciones={horario.ocupaciones.filter(
            (ocupacion) => ocupacion.dia === bloqueElegido.dia && ocupacion.franjaId === bloqueElegido.franjaId
          )}
          bloque={horario.bloques[`${bloqueElegido.dia}|${bloqueElegido.franjaId}`]}
          alCancelar={() => establecerBloqueElegido(null)}
          alGuardar={(bloque) => {
            horario.asignarBloque(bloqueElegido.dia, bloqueElegido.franjaId, bloque);
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
          alCompletar={completarCargaMasiva}
          alCancelar={() => establecerDialogoCargaMasiva(false)}
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
