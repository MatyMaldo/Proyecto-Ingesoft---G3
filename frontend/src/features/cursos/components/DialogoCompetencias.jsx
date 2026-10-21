import { useState } from 'react';

import estilosUtil from '../../../shared/styles/utilidades.module.css';
import { MENSAJE_SIN_COMPETENCIAS_DISPONIBLES } from '../constants/mensajesCursos.js';
import DialogoBase from './DialogoBase.jsx';
import estilos from './DialogoCompetencias.module.css';

const ID_TITULO = 'dialogo-competencias-titulo';

/**
 * Diálogo "Competencias de [curso]": lista de competencias disponibles con casillas.
 * Trabaja sobre una copia (borrador): si se cancela o se cierra, no se guarda nada.
 *
 * @param {Object} props
 * @param {Object} props.curso CursoVista.
 * @param {string} props.etiquetaGrado
 * @param {boolean} props.guardando
 * @param {string|null} props.error
 * @param {() => void} props.alCancelar
 * @param {(idsCompetencias: string[]) => void} props.alGuardar
 */
export default function DialogoCompetencias({ curso, etiquetaGrado, guardando, error, alCancelar, alGuardar }) {
  const [seleccion, establecerSeleccion] = useState(curso.idsAsignados);

  const disponibles = curso.competenciasDisponibles;
  const sinCompetencias = disponibles.length === 0;

  function alternar(idCompetencia) {
    establecerSeleccion((anteriores) =>
      anteriores.includes(idCompetencia)
        ? anteriores.filter((id) => id !== idCompetencia)
        : [...anteriores, idCompetencia]
    );
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (!sinCompetencias) {
      alGuardar(seleccion);
    }
  }

  return (
    <DialogoBase
      idTitulo={ID_TITULO}
      titulo={`Competencias de ${curso.nombre}`}
      subtitulo={`${etiquetaGrado} — Selecciona las competencias a asignar`}
      textoConfirmar="Guardar competencias"
      textoEnviando="Guardando…"
      enviando={guardando}
      confirmarDeshabilitado={sinCompetencias}
      error={error}
      notaPie={sinCompetencias ? undefined : `${seleccion.length} de ${disponibles.length} seleccionadas`}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      {sinCompetencias ? (
        <p className={estilos.mensajeVacio}>{MENSAJE_SIN_COMPETENCIAS_DISPONIBLES}</p>
      ) : (
        <fieldset className={estilos.grupo}>
          <legend className={estilosUtil.ocultoVisualmente}>Competencias disponibles</legend>
          {disponibles.map((competencia, indice) => {
            const marcada = seleccion.includes(competencia.id);
            return (
              <label key={competencia.id} className={marcada ? estilos.opcionMarcada : estilos.opcion}>
                <input
                  type="checkbox"
                  className={estilos.casilla}
                  checked={marcada}
                  data-enfoque-inicial={indice === 0 ? '' : undefined}
                  onChange={() => alternar(competencia.id)}
                />
                <span>{competencia.nombre}</span>
              </label>
            );
          })}
        </fieldset>
      )}
    </DialogoBase>
  );
}
