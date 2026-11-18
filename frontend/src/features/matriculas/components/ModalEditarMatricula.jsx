import { useId, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import useMatriculas from '../hooks/useMatriculas.js';
import estilos from '../../../shared/styles/camposDialogo.module.css';
import estilosPropios from './ModalEditarMatricula.module.css';

/**
 * Edita el grado y la sección de una matrícula pendiente. El estudiante y el
 * año académico permanecen fijos: cambiar cualquiera de ellos implicaría otra
 * matrícula o un proceso distinto.
 */
export default function ModalEditarMatricula({ matricula, alCerrar, alGuardar }) {
  const {
    anio,
    grados,
    estadoEstructura,
    errorEstructura,
    gradoId,
    seleccionarGrado,
    secciones,
    seccionId,
    seleccionarSeccion
  } = useMatriculas({ matriculaInicial: matricula });
  const [enviando, establecerEnviando] = useState(false);
  const [error, establecerError] = useState(null);
  const idGrado = useId();
  const idSeccion = useId();

  const seccion = secciones.find((item) => String(item.id) === String(seccionId));
  const sinCambios = seccionId == null || String(seccionId) === String(matricula.seccionId);
  const confirmar = async (evento) => {
    evento.preventDefault();
    if (enviando || sinCambios) return;
    establecerEnviando(true);
    establecerError(null);
    try {
      const respuesta = await alGuardar({ seccionId, seccion });
      if (respuesta && !respuesta.exitoso) {
        establecerError(respuesta.mensaje || 'No se pudo actualizar la matrícula.');
      }
    } finally {
      establecerEnviando(false);
    }
  };

  return (
    <DialogoBase
      idTitulo="dialogo-editar-matricula"
      titulo="Editar matrícula"
      subtitulo="Cambiar grado y sección"
      textoConfirmar="Guardar cambios"
      textoEnviando="Guardando..."
      enviando={enviando}
      confirmarDeshabilitado={sinCambios || estadoEstructura !== 'listo'}
      error={error}
      anchoMaximo="34rem"
      cerrarAlClicFuera={false}
      alCancelar={alCerrar}
      alConfirmar={confirmar}
    >
      <div className={estilosPropios.estudiante}>
        <p className={estilos.tarjetaEtiqueta}>Estudiante</p>
        <p className={estilos.tarjetaNombre}>{matricula.nombreCompletoEstudiante}</p>
        <p className={estilos.tarjetaDni}>
          {matricula.codigoEstudiante ? `Código: ${matricula.codigoEstudiante}` : ''}
        </p>
      </div>

      <div className={estilos.filaDoble}>
        <div className={estilos.campo}>
          <label className={estilos.etiqueta} htmlFor="editar-matricula-anio">
            Año académico
          </label>
          <select
            id="editar-matricula-anio"
            className={estilos.selector}
            value={matricula.anioAcademicoId}
            disabled
          >
            <option value={matricula.anioAcademicoId}>
              {matricula.anioAcademico ?? anio?.anio ?? ''}
            </option>
          </select>
        </div>

        <div className={estilos.campo}>
          <label className={estilos.etiqueta} htmlFor={idGrado}>
            Grado académico
          </label>
          <select
            id={idGrado}
            className={estilos.selector}
            value={gradoId ?? ''}
            disabled={estadoEstructura !== 'listo'}
            onChange={(evento) => seleccionarGrado(evento.target.value)}
          >
            <option value="">Seleccionar grado...</option>
            {grados.map((grado) => (
              <option key={grado.id} value={grado.id}>{grado.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {estadoEstructura === 'error' && (
        <p className={estilos.error} role="alert">
          <Icono nombre="alerta" tamano={14} />
          <span>{errorEstructura}</span>
        </p>
      )}

      <div className={estilos.campo}>
        <span id={idSeccion} className={estilos.etiqueta}>Sección</span>
        {secciones.length === 0 ? (
          <p className={estilos.ayuda}>Este grado no tiene secciones en el año seleccionado.</p>
        ) : (
          <div className={estilos.opciones} role="radiogroup" aria-labelledby={idSeccion}>
            {secciones.map((opcion) => {
              const activa = String(opcion.id) === String(seccionId);
              const vacantes = typeof opcion.vacantesDisponibles === 'number'
                ? opcion.vacantesDisponibles
                : null;
              const sinVacantes = vacantes === 0;
              return (
                <button
                  key={opcion.id}
                  type="button"
                  role="radio"
                  aria-checked={activa}
                  disabled={sinVacantes}
                  className={[
                    estilos.opcion,
                    activa ? estilos.opcionActiva : '',
                    vacantes === null ? '' : estilos.opcionConSubtexto
                  ].filter(Boolean).join(' ')}
                  onClick={() => seleccionarSeccion(opcion.id)}
                >
                  {opcion.nombre}
                  {vacantes !== null && (
                    <span className={estilos.opcionSubtexto}>
                      {sinVacantes ? 'Sin vacantes' : vacantes === 1 ? '1 vacante' : `${vacantes} vacantes`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className={estilos.ayuda}>
        Se revalidarán el periodo, la capacidad y que el estudiante no tenga otra matrícula en el año.
      </p>
    </DialogoBase>
  );
}
