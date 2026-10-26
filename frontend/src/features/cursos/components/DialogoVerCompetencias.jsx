import { useState } from 'react';

import DialogoBase from './DialogoBase.jsx';
import estilos from './DialogoVerCompetencias.module.css';

const ID_TITULO = 'dialogo-ver-competencias-titulo';
const ID_TITULO_CONFIRMAR = 'dialogo-confirmar-eliminar-competencia-titulo';

/**
 * Diálogo con las competencias de un curso y acceso a su edición.
 *
 * @param {Object} props
 * @param {string} props.nombreCurso
 * @param {Array<{id: number|string, nombre: string, descripcion: string}>} props.competencias
 * @param {boolean} props.cargando
 * @param {string|null} props.error
 * @param {string|null} props.errorEliminar
 * @param {string|null} props.idEliminando
 * @param {() => void} props.alCerrar
 * @param {() => void} props.alAgregar
 * @param {(competencia: Object) => void} props.alEditar
 * @param {(competencia: Object) => Promise<boolean>} props.alEliminar
 */
export default function DialogoVerCompetencias({
  nombreCurso,
  competencias,
  cargando,
  error,
  errorEliminar,
  idEliminando,
  alCerrar,
  alAgregar,
  alEditar,
  alEliminar
}) {
  const [competenciaEliminar, establecerCompetenciaEliminar] = useState(null);
  const eliminando = competenciaEliminar !== null
    && idEliminando === String(competenciaEliminar.id);

  async function confirmarEliminacion(evento) {
    evento.preventDefault();
    if (!competenciaEliminar || idEliminando !== null) {
      return;
    }

    if (await alEliminar(competenciaEliminar)) {
      establecerCompetenciaEliminar(null);
    }
  }

  return (
    <>
    <DialogoBase
      idTitulo={ID_TITULO}
      titulo="Gestionar competencias"
      subtitulo={`Curso: ${nombreCurso}`}
      textoConfirmar="Listo"
      textoEnviando="Cargando…"
      enviando={false}
      error={error}
      alCancelar={alCerrar}
      alConfirmar={(evento) => {
        evento.preventDefault();
        alCerrar();
      }}
    >
      {cargando ? (
        <p className={estilos.estado}>Cargando competencias…</p>
      ) : competencias.length === 0 ? (
        <p className={estilos.estado}>Este curso todavía no tiene competencias.</p>
      ) : (
        <ul className={estilos.lista}>
          {competencias.map((competencia) => (
            <li key={competencia.id} className={estilos.item}>
              <div className={estilos.detalle}>
                <h3 className={estilos.nombre}>{competencia.nombre}</h3>
                <p className={estilos.descripcion}>{competencia.descripcion || 'Sin descripción.'}</p>
              </div>
              <button
                type="button"
                className={estilos.botonEditar}
                aria-label={`Editar ${competencia.nombre}`}
                onClick={() => alEditar(competencia)}
              >
                Editar
              </button>
              <button
                type="button"
                className={estilos.botonEliminar}
                aria-label={`Eliminar ${competencia.nombre}`}
                onClick={() => establecerCompetenciaEliminar(competencia)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className={estilos.botonAgregar}
        disabled={cargando}
        onClick={alAgregar}
      >
        Agregar
      </button>
    </DialogoBase>
    {competenciaEliminar && (
      <DialogoBase
        idTitulo={ID_TITULO_CONFIRMAR}
        titulo="Eliminar competencia"
        subtitulo={`Curso: ${nombreCurso}`}
        textoConfirmar="Eliminar"
        textoEnviando="Eliminando…"
        enviando={eliminando}
        error={errorEliminar}
        alCancelar={() => {
          if (!eliminando) {
            establecerCompetenciaEliminar(null);
          }
        }}
        alConfirmar={confirmarEliminacion}
      >
        <p className={estilos.confirmacion}>
          ¿Está seguro de que desea eliminar «{competenciaEliminar.nombre}»? Esta acción solo
          se completará si la ventana académica está abierta y la competencia no tiene notas
          registradas.
        </p>
      </DialogoBase>
    )}
    </>
  );
}
