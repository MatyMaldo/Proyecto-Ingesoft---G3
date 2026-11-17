import { useEffect, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import {
  ESTADOS_ASISTENCIA,
  etiquetaEstadoAsistencia,
  normalizarEstadoAsistencia,
  tonoEstadoAsistencia
} from '../utils/estadosAsistencia.js';
import estilos from './DialogoAsistenciaSesion.module.css';

function filasDesdeDetalle(detalle) {
  return (detalle?.estudiantes ?? []).map((estudiante) => ({
    estudianteId: estudiante.estudianteId,
    codigo: estudiante.codigo,
    nombreCompleto: estudiante.nombreCompleto,
    estado: normalizarEstadoAsistencia(estudiante.estado) || '',
    observaciones: estudiante.observaciones ?? ''
  }));
}

/**
 * Minipantalla «Registrar asistencia»: una fila por estudiante con los cuatro estados a la vista (como las notas), un
 * atajo para marcar «Asistió» a quienes aún no tienen estado y el avance de la lista. Solo se guarda con todos marcados.
 *
 * @param {Object} props
 * @param {Object} props.sesion Sesión de clase.
 * @param {{ estudiantes: Array }} props.detalle Estudiantes de la sesión con su estado actual.
 * @param {boolean} [props.guardando]
 * @param {string|null} [props.error]
 * @param {() => void} props.alCerrar
 * @param {(filas: Array) => void} props.alGuardar
 */
export default function DialogoAsistenciaSesion({
  sesion,
  detalle,
  guardando = false,
  error = null,
  alCerrar,
  alGuardar
}) {
  const [filas, establecerFilas] = useState(() => filasDesdeDetalle(detalle));

  useEffect(() => {
    establecerFilas(filasDesdeDetalle(detalle));
  }, [detalle]);

  const sinMarcar = filas.filter((fila) => !fila.estado).length;
  const marcados = filas.length - sinMarcar;
  const completo = filas.length > 0 && sinMarcar === 0;
  const cuentas = ESTADOS_ASISTENCIA
    .map((estado) => [estado, filas.filter((fila) => fila.estado === estado).length])
    .filter(([, cantidad]) => cantidad > 0);

  const cambiarEstado = (estudianteId, estado) => {
    establecerFilas((actuales) => actuales.map((fila) => (
      String(fila.estudianteId) === String(estudianteId)
        ? { ...fila, estado }
        : fila
    )));
  };

  const cambiarObservaciones = (estudianteId, observaciones) => {
    establecerFilas((actuales) => actuales.map((fila) => (
      String(fila.estudianteId) === String(estudianteId)
        ? { ...fila, observaciones }
        : fila
    )));
  };

  // Solo a quienes no tienen estado: no pisa lo que el docente ya marcó.
  const marcarPendientesPresentes = () => {
    establecerFilas((actuales) => actuales.map((fila) => (
      fila.estado ? fila : { ...fila, estado: 'PRESENTE' }
    )));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    if (!completo || guardando) return;
    alGuardar(filas);
  };

  return (
    <DialogoBase
      idTitulo="dialogo-asistencia-titulo"
      titulo="Registrar asistencia"
      subtitulo={[sesion?.cursoNombre, sesion?.seccionNombre]
        .filter(Boolean)
        .join(' · ')}
      anchoMaximo="58rem"
      textoConfirmar="Guardar asistencia"
      textoEnviando="Guardando…"
      enviando={guardando}
      confirmarDeshabilitado={!completo}
      error={error}
      notaPie={completo
        ? `${filas.length} estudiantes listos para guardar.`
        : `Faltan ${sinMarcar} estudiante${sinMarcar === 1 ? '' : 's'} por marcar.`}
      cerrarAlClicFuera={false}
      alCancelar={alCerrar}
      alConfirmar={enviar}
    >
      <div className={estilos.resumenSesion}>
        <span><Icono nombre="aula" tamano={14} /> {sesion?.gradoNombre}</span>
        <span><Icono nombre="calendario" tamano={14} /> {sesion?.fecha}</span>
        <span>
          <Icono nombre="reloj" tamano={14} />
          {' '}{String(sesion?.horaInicio ?? '').slice(0, 5)} – {String(sesion?.horaFin ?? '').slice(0, 5)}
        </span>
        <span><Icono nombre="usuario" tamano={14} /> {sesion?.docenteNombre}</span>
      </div>

      {filas.length > 0 && (
        <div className={estilos.avance}>
          <div className={estilos.avanceTexto} aria-live="polite">
            <span><strong>{marcados}</strong> de {filas.length} marcados</span>
            <div className={estilos.cuentas}>
              {cuentas.map(([estado, cantidad]) => (
                <Insignia key={estado} tono={tonoEstadoAsistencia(estado)}>
                  {cantidad} {etiquetaEstadoAsistencia(estado).toLowerCase()}
                </Insignia>
              ))}
            </div>
          </div>
          <progress
            className={estilos.progreso}
            value={marcados}
            max={filas.length}
            aria-label={`${marcados} de ${filas.length} estudiantes con asistencia marcada`}
          />
          {sinMarcar > 0 && (
            <button type="button" className={estilos.botonTodos} onClick={marcarPendientesPresentes}>
              <Icono nombre="verificar" tamano={16} />
              Marcar a los {sinMarcar === 1 ? 'pendiente' : `${sinMarcar} pendientes`} como Asistió
            </button>
          )}
        </div>
      )}

      <div className={estilos.tablaContenedor}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col">Estudiante</th>
              <th scope="col">Asistencia</th>
              <th scope="col">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.estudianteId} className={fila.estado ? undefined : estilos.filaSinMarcar}>
                <td>
                  <span className={estilos.nombre}>{fila.nombreCompleto}</span>
                  <span className={estilos.codigo}>{fila.codigo}</span>
                </td>
                <td>
                  <div
                    className={estilos.estados}
                    role="radiogroup"
                    aria-label={`Asistencia de ${fila.nombreCompleto}`}
                  >
                    {ESTADOS_ASISTENCIA.map((estado) => {
                      const activo = fila.estado === estado;
                      return (
                        <button
                          key={estado}
                          type="button"
                          role="radio"
                          aria-checked={activo}
                          data-tono={tonoEstadoAsistencia(estado)}
                          className={activo ? `${estilos.estado} ${estilos.estadoActivo}` : estilos.estado}
                          onClick={() => cambiarEstado(fila.estudianteId, estado)}
                        >
                          {etiquetaEstadoAsistencia(estado)}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <input
                    className={estilos.observaciones}
                    type="text"
                    value={fila.observaciones}
                    placeholder="Opcional"
                    aria-label={`Observaciones de ${fila.nombreCompleto}`}
                    onChange={(evento) => cambiarObservaciones(fila.estudianteId, evento.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filas.length === 0 && (
        <p className={estilos.vacio}>No hay estudiantes registrados para esta sesión.</p>
      )}
    </DialogoBase>
  );
}
