import { useEffect, useId, useState } from 'react';

import CampoBusquedaDesplegable from '../../../shared/components/CampoBusquedaDesplegable.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import useMatriculas from '../hooks/useMatriculas.js';
import estilos from '../../../shared/styles/camposDialogo.module.css';

/**
 * Diálogo "Asignar alumno a sección": busca un alumno, elige año, grado y sección y, al confirmar, entrega la
 * asignación a `onAceptar`. Se monta solo mientras está abierto, así su estado se descarta al cerrarlo.
 *
 * @param {{ onCerrar: () => void, onAceptar: (asignacion: Object) => (void|Promise<void>) }} props
 */
export default function ModalAsignarAlumno({ onCerrar, onAceptar }) {
  const {
    busqueda,
    establecerBusqueda,
    hayBusqueda,
    resultados,
    buscando,
    errorBusqueda,
    alumnoSeleccionado,
    seleccionarAlumno,
    quitarAlumno,
    grados,
    estadoEstructura,
    errorEstructura,
    reintentarEstructura,
    gradoId,
    seleccionarGrado,
    secciones,
    seccionId,
    seleccionarSeccion,
    anios,
    anioId,
    seleccionarAnio,
    asignacion
  } = useMatriculas();

  const [enviando, establecerEnviando] = useState(false);
  const idBusqueda = useId();
  const idAnio = useId();
  const idGrado = useId();
  const idSeccion = useId();

  // CampoBusquedaDesplegable no expone `ref`, así que el campo se enfoca por su id al abrir el diálogo.
  useEffect(() => {
    document.getElementById(idBusqueda)?.focus();
  }, [idBusqueda]);

  const confirmar = async (evento) => {
    evento.preventDefault();
    if (asignacion === null || enviando) return;
    establecerEnviando(true);
    try {
      await onAceptar(asignacion);
    } finally {
      establecerEnviando(false);
    }
  };

  const renderizarSecciones = () => {
    if (gradoId === null) {
      return <p className={estilos.ayuda}>Seleccione primero un grado.</p>;
    }

    if (secciones.length === 0) {
      return <p className={estilos.ayuda}>Este grado no tiene secciones en el año seleccionado.</p>;
    }

    return (
      <div className={estilos.opciones} role="radiogroup" aria-labelledby={idSeccion}>
        {secciones.map((seccion) => {
          const activa = seccion.id === seccionId;

          return (
            <button
              key={seccion.id}
              type="button"
              role="radio"
              aria-checked={activa}
              className={activa ? `${estilos.opcion} ${estilos.opcionActiva}` : estilos.opcion}
              onClick={() => seleccionarSeccion(seccion.id)}
            >
              {seccion.nombre}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <DialogoBase
      idTitulo="dialogo-asignar-alumno"
      titulo="Asignar alumno a sección"
      subtitulo="Gestión académica"
      textoConfirmar="Asignar"
      textoEnviando="Asignando..."
      enviando={enviando}
      confirmarDeshabilitado={asignacion === null}
      anchoMaximo="32rem"
      cerrarAlClicFuera={false}
      botonesExpandidos
      alCancelar={onCerrar}
      alConfirmar={confirmar}
    >
      <CampoBusquedaDesplegable
        id={idBusqueda}
        etiqueta="Buscar alumno"
        etiquetaVisible
        placeholder="Buscar por nombre, DNI o código..."
        variante="relleno"
        valor={busqueda}
        alCambiar={establecerBusqueda}
        abierto={hayBusqueda}
        buscando={buscando}
        error={errorBusqueda}
        resultados={resultados}
        mensajeSinResultados="No se encontraron alumnos."
        obtenerTitulo={(alumno) => alumno.nombre}
        obtenerDetalle={(alumno) => `DNI: ${alumno.dni} · ${alumno.codigo}`}
        alSeleccionar={seleccionarAlumno}
      />

      {alumnoSeleccionado && (
        <div className={estilos.tarjetaAlumno}>
          <div>
            <p className={estilos.tarjetaEtiqueta}>Alumno seleccionado</p>
            <p className={estilos.tarjetaNombre}>{alumnoSeleccionado.nombre}</p>
            <p className={estilos.tarjetaDni}>DNI: {alumnoSeleccionado.dni}</p>
          </div>
          <button
            type="button"
            className={estilos.quitar}
            onClick={quitarAlumno}
            aria-label="Quitar alumno seleccionado"
          >
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </div>
      )}

      <div className={estilos.campo}>
        <label htmlFor={idAnio} className={estilos.etiqueta}>Año académico</label>
        <select
          id={idAnio}
          className={estilos.selector}
          value={anioId ?? ''}
          disabled={estadoEstructura !== 'listo'}
          onChange={(evento) => seleccionarAnio(evento.target.value)}
        >
          <option value="">
            {estadoEstructura === 'cargando' ? 'Cargando años...' : 'Seleccionar año...'}
          </option>
          {anios.map((anioDisponible) => (
            <option key={anioDisponible.id} value={anioDisponible.id}>
              {anioDisponible.anio} · Período vigente
            </option>
          ))}
        </select>
        <p className={estilos.ayuda}>Solo se muestran años con período de matrícula vigente.</p>
      </div>

      <div className={estilos.campo}>
        <label htmlFor={idGrado} className={estilos.etiqueta}>Grado académico</label>
        <select
          id={idGrado}
          className={estilos.selector}
          value={gradoId ?? ''}
          disabled={estadoEstructura !== 'listo'}
          onChange={(evento) => seleccionarGrado(evento.target.value)}
        >
          <option value="">
            {estadoEstructura === 'cargando' ? 'Cargando grados...' : 'Seleccionar grado...'}
          </option>
          {grados.map((grado) => (
            <option key={grado.id} value={grado.id}>{grado.nombre}</option>
          ))}
        </select>
        {estadoEstructura === 'error' && (
          <>
            <p className={estilos.error} role="alert">
              <Icono nombre="alerta" tamano={14} />
              <span>{errorEstructura}</span>
            </p>
            <button type="button" className={estilos.reintentar} onClick={reintentarEstructura}>
              Reintentar
            </button>
          </>
        )}
      </div>

      <div className={estilos.campo}>
        <span id={idSeccion} className={estilos.etiqueta}>Sección</span>
        {renderizarSecciones()}
      </div>
    </DialogoBase>
  );
}
