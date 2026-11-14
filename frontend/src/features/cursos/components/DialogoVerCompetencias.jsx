import { useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilos from './DialogoVerCompetencias.module.css';

const ID_TITULO = 'dialogo-ver-competencias-titulo';
const ID_TITULO_CONFIRMAR = 'dialogo-confirmar-eliminar-competencia-titulo';

/**
 * Diálogo con las competencias de un curso y acceso a su alta, edición y eliminación.
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

  const cantidad = competencias.length;

  return (
    <>
      <DialogoBase
        idTitulo={ID_TITULO}
        titulo="Gestionar competencias"
        subtitulo={`Curso: ${nombreCurso}`}
        anchoMaximo="36rem"
        sinConfirmar
        textoCancelar="Cerrar"
        cerrarAlClicFuera={false}
        error={error}
        alCancelar={alCerrar}
        alConfirmar={(evento) => evento.preventDefault()}
      >
        {/* Cabecera de la lista: cuántas hay y la acción de agregar, siempre a la vista. */}
        <div className={estilos.cabecera}>
          <p className={estilos.conteo} aria-live="polite">
            {cargando
              ? 'Cargando competencias…'
              : `${cantidad} ${cantidad === 1 ? 'competencia' : 'competencias'}`}
          </p>
          <button
            type="button"
            className={estilos.botonAgregar}
            disabled={cargando}
            onClick={alAgregar}
          >
            <Icono nombre="agregar" tamano={18} />
            Agregar competencia
          </button>
        </div>

        {cargando ? (
          <EstadoConsulta tipo="carga" filasEsqueleto={3} />
        ) : cantidad === 0 ? (
          <EstadoConsulta
            tipo="vacio"
            icono="libro"
            mensaje="Este curso todavía no tiene competencias."
          />
        ) : (
          <ol className={estilos.lista}>
            {competencias.map((competencia, indice) => (
              <li key={competencia.id} className={estilos.item}>
                <span className={estilos.numero} aria-hidden="true">{indice + 1}</span>
                <div className={estilos.detalle}>
                  <h3 className={estilos.nombre}>{competencia.nombre}</h3>
                  <p className={estilos.descripcion}>{competencia.descripcion || 'Sin descripción.'}</p>
                </div>
                <div className={estilos.acciones}>
                  <button
                    type="button"
                    className={estilos.botonEditar}
                    title="Editar"
                    aria-label={`Editar ${competencia.nombre}`}
                    onClick={() => alEditar(competencia)}
                  >
                    <Icono nombre="editar" tamano={18} />
                  </button>
                  <button
                    type="button"
                    className={estilos.botonEliminar}
                    title="Eliminar"
                    aria-label={`Eliminar ${competencia.nombre}`}
                    onClick={() => establecerCompetenciaEliminar(competencia)}
                  >
                    <Icono nombre="papelera" tamano={18} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </DialogoBase>

      {competenciaEliminar && (
        <DialogoBase
          idTitulo={ID_TITULO_CONFIRMAR}
          titulo="Eliminar competencia"
          subtitulo={`Curso: ${nombreCurso}`}
          textoConfirmar="Eliminar"
          textoEnviando="Eliminando…"
          enviando={eliminando}
          confirmarPeligro
          enfocarCancelar
          cerrarAlClicFuera={false}
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
