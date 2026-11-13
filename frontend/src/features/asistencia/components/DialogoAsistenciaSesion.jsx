import { useEffect, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import {
  ESTADOS_ASISTENCIA,
  etiquetaEstadoAsistencia,
  normalizarEstadoAsistencia
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
  const completo = filas.length > 0 && sinMarcar === 0;

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
        <span>{sesion?.gradoNombre}</span>
        <span>{sesion?.fecha}</span>
        <span>{String(sesion?.horaInicio ?? '').slice(0, 5)} – {String(sesion?.horaFin ?? '').slice(0, 5)}</span>
        <span>{sesion?.docenteNombre}</span>
      </div>

      <div className={estilos.tablaContenedor}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col">Estudiante</th>
              <th scope="col">Código</th>
              <th scope="col">Asistencia</th>
              <th scope="col">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.estudianteId}>
                <td className={estilos.nombre}>{fila.nombreCompleto}</td>
                <td>{fila.codigo}</td>
                <td>
                  <select
                    className={estilos.selectorEstado}
                    value={fila.estado}
                    aria-label={`Asistencia de ${fila.nombreCompleto}`}
                    onChange={(evento) => cambiarEstado(fila.estudianteId, evento.target.value)}
                  >
                    <option value="">Sin marcar</option>
                    {ESTADOS_ASISTENCIA.map((estado) => (
                      <option key={estado} value={estado}>
                        {etiquetaEstadoAsistencia(estado)}
                      </option>
                    ))}
                  </select>
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
