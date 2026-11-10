import { useEffect, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import MatrizSesiones from './MatrizSesiones.jsx';
import { listarBloquesDocente } from '../services/horariosService.js';
import { aMinutos } from '../utils/tiempo.js';
import estilos from './DialogoCargaDocente.module.css';

function normalizarBloque(bloque) {
  return {
    id: bloque.id,
    diaSemana: bloque.diaSemana,
    horaInicio: String(bloque.horaInicio ?? '').slice(0, 5),
    horaFin: String(bloque.horaFin ?? '').slice(0, 5),
    cursoId: bloque.cursoId,
    cursoNombre: bloque.cursoNombre,
    docenteNombre: bloque.docenteNombre,
    aulaNombre: bloque.aulaNombre,
    gradoNombre: bloque.gradoNombre,
    seccionNombre: bloque.seccionNombre
  };
}

function minutosDeBloque(bloque) {
  const inicio = aMinutos(bloque.horaInicio);
  const fin = aMinutos(bloque.horaFin);
  return inicio !== null && fin !== null && fin > inicio ? fin - inicio : 0;
}

function formatearHoras(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (resto === 0) return `${horas} h`;
  return `${horas} h ${resto} min`;
}

/**
 * Vista previa de la carga semanal planificada de un docente.
 * Usa los bloques horarios del año vigente, no las sesiones generadas.
 */
export default function DialogoCargaDocente({
  docentes,
  anioId,
  anio,
  docenteInicialId,
  onCerrar
}) {
  const [docenteId, establecerDocenteId] = useState(() => (
    docenteInicialId || docentes?.[0]?.id || ''
  ));
  const [bloques, establecerBloques] = useState([]);
  const [estado, establecerEstado] = useState('inactivo');
  const [error, establecerError] = useState('');
  const [intento, establecerIntento] = useState(0);

  useEffect(() => {
    if (!anioId || !docenteId) {
      establecerBloques([]);
      establecerEstado('inactivo');
      establecerError(
        !anioId
          ? 'No hay un año académico vigente para consultar la carga docente.'
          : ''
      );
      return undefined;
    }

    let activo = true;
    establecerEstado('cargando');
    establecerError('');

    listarBloquesDocente({ docenteId, anioId }).then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso) {
        establecerBloques([]);
        establecerError(respuesta.mensaje || 'No se pudo cargar la carga docente.');
        establecerEstado('error');
        return;
      }
      if (!Array.isArray(respuesta.datos)) {
        establecerBloques([]);
        establecerError('El backend devolvió un formato de carga docente no válido.');
        establecerEstado('error');
        return;
      }
      establecerBloques(respuesta.datos.map(normalizarBloque));
      establecerEstado('listo');
    });

    return () => { activo = false; };
  }, [anioId, docenteId, intento]);

  const sesiones = bloques;
  const minutosSemanales = bloques.reduce(
    (total, bloque) => total + minutosDeBloque(bloque),
    0
  );
  const cursos = new Set(bloques.map((bloque) => bloque.cursoId ?? bloque.cursoNombre));
  const secciones = new Set(
    bloques.map((bloque) => `${bloque.gradoNombre ?? ''}|${bloque.seccionNombre ?? ''}`)
  );
  const dias = new Set(bloques.map((bloque) => bloque.diaSemana).filter(Boolean));
  const docenteSeleccionado = (docentes ?? []).find(
    (docente) => String(docente.id) === String(docenteId)
  );

  return (
    <DialogoBase
      idTitulo="carga-docente-titulo"
      titulo="Carga horaria docente"
      subtitulo={anio ? `Semana planificada · Año ${anio}` : 'Semana planificada'}
      anchoMaximo="64rem"
      textoConfirmar="Cerrar"
      sinCancelar
      alCancelar={onCerrar}
      alConfirmar={(evento) => {
        evento.preventDefault();
        onCerrar();
      }}
    >
      <div className={estilos.contenido}>
        <div className={estilos.campo}>
          <label htmlFor="carga-docente-docente" className={estilos.etiqueta}>
            Docente
          </label>
          <select
            id="carga-docente-docente"
            className={estilos.select}
            value={docenteId}
            disabled={(docentes ?? []).length === 0}
            onChange={(evento) => establecerDocenteId(evento.target.value)}
          >
            {(docentes ?? []).length === 0 && (
              <option value="">No hay docentes activos disponibles.</option>
            )}
            {(docentes ?? []).map((docente) => (
              <option key={docente.id} value={docente.id}>{docente.nombre}</option>
            ))}
          </select>
        </div>

        {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={3} />}

        {estado === 'error' && (
          <div>
            <EstadoConsulta tipo="error" mensaje={error} />
            <button
              type="button"
              className={estilos.reintentar}
              onClick={() => establecerIntento((actual) => actual + 1)}
            >
              Reintentar
            </button>
          </div>
        )}

        {estado === 'inactivo' && error && (
          <p className={estilos.aviso} role="alert">{error}</p>
        )}

        {estado === 'listo' && bloques.length === 0 && (
          <EstadoConsulta
            tipo="vacio"
            mensaje={`El docente ${docenteSeleccionado?.nombre ?? 'seleccionado'} no tiene bloques horarios planificados en este año.`}
          />
        )}

        {estado === 'listo' && bloques.length > 0 && (
          <>
            <dl className={estilos.resumen} aria-label="Resumen de carga docente">
              <div className={estilos.resumenItem}>
                <dt>Bloques</dt>
                <dd>{bloques.length}</dd>
              </div>
              <div className={estilos.resumenItem}>
                <dt>Carga semanal</dt>
                <dd>{formatearHoras(minutosSemanales)}</dd>
              </div>
              <div className={estilos.resumenItem}>
                <dt>Cursos</dt>
                <dd>{cursos.size}</dd>
              </div>
              <div className={estilos.resumenItem}>
                <dt>Grados / secciones</dt>
                <dd>{secciones.size}</dd>
              </div>
              <div className={estilos.resumenItem}>
                <dt>Días con clase</dt>
                <dd>{dias.size}</dd>
              </div>
            </dl>

            <MatrizSesiones
              titulo={docenteSeleccionado?.nombre ?? 'docente seleccionado'}
              sesiones={sesiones}
              mostrarSeccion
            />
          </>
        )}
      </div>
    </DialogoBase>
  );
}
