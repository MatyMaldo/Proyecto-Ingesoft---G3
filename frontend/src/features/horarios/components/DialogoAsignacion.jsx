import { useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import CampoSelect from './CampoSelect.jsx';

/**
 * Diálogo para agregar una relación curso-docente a la sección consultada
 * (en el backend, AsignacionCurso: Curso, Docente, Sección).
 *
 * @param {Object} props
 * @param {string} props.tituloSeccion Por ejemplo "4to Secundaria B".
 * @param {Array<{ id: string, nombre: string }>} props.cursos
 * @param {Array<{ id: string, nombre: string }>} props.docentes
 * @param {() => void} props.alCancelar
 * @param {(datos: { cursoId: string, docenteId: string }) => Promise<string|null>} props.alGuardar
 *   Devuelve el mensaje de error, o `null` si se guardó.
 */
export default function DialogoAsignacion({ tituloSeccion, cursos, docentes, asignacion, alCancelar, alGuardar }) {
  const [cursoId, establecerCursoId] = useState(
    asignacion?.cursoId == null ? '' : String(asignacion.cursoId)
  );
  const [docenteId, establecerDocenteId] = useState(
    asignacion?.docenteId == null ? '' : String(asignacion.docenteId)
  );
  const [errores, establecerErrores] = useState({});
  const [errorServicio, establecerErrorServicio] = useState(null);
  const [enviando, establecerEnviando] = useState(false);
  const editando = Boolean(asignacion);

  async function manejarEnvio(evento) {
    evento.preventDefault();

    const encontrados = {};
    if (!cursoId) {
      encontrados.curso = 'Selecciona un curso.';
    }
    if (!docenteId) {
      encontrados.docente = 'Selecciona un docente.';
    }
    establecerErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      return;
    }

    establecerEnviando(true);
    establecerErrorServicio(null);
    const error = await alGuardar({ cursoId, docenteId });
    if (error) {
      establecerEnviando(false);
      establecerErrorServicio(error);
      return;
    }
    alCancelar();
  }

  return (
    <DialogoBase
      idTitulo="dialogo-asignacion-titulo"
      titulo={editando ? 'Editar curso y docente' : 'Agregar curso y docente'}
      subtitulo={tituloSeccion}
      textoConfirmar={editando ? 'Guardar cambios' : 'Agregar'}
      textoEnviando="Guardando…"
      enviando={enviando}
      error={errorServicio}
      cerrarAlClicFuera={false}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      <CampoSelect
        id="asignacion-curso"
        etiqueta="Curso"
        requerido
        enfoqueInicial
        placeholder="Seleccionar curso..."
        valor={cursoId}
        opciones={cursos.map((curso) => ({ valor: curso.id, etiqueta: curso.nombre }))}
        error={errores.curso}
        alCambiar={(valor) => {
          establecerCursoId(valor);
          establecerErrores((anteriores) => ({ ...anteriores, curso: undefined }));
        }}
      />
      <CampoSelect
        id="asignacion-docente"
        etiqueta="Docente"
        requerido
        placeholder="Seleccionar docente..."
        valor={docenteId}
        opciones={docentes.map((docente) => ({ valor: docente.id, etiqueta: docente.nombre }))}
        error={errores.docente}
        alCambiar={(valor) => {
          establecerDocenteId(valor);
          establecerErrores((anteriores) => ({ ...anteriores, docente: undefined }));
        }}
      />
    </DialogoBase>
  );
}
