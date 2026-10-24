import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import DialogoCrearCompetencia from '../components/DialogoCrearCompetencia.jsx';
import DialogoVerCompetencias from '../components/DialogoVerCompetencias.jsx';
import TarjetaCurso from '../components/TarjetaCurso.jsx';
import useCursos from '../hooks/useCursos.js';
import estilos from './PaginaCursos.module.css';

const ID_TITULO_LISTA = 'cursos-titulo-lista';

/**
 * Página de consulta de cursos. Carga todos los registros sin filtrarlos por grado.
 * El breadcrumb lo pinta el shell a partir de `migas` en `routes.jsx`.
 */
export default function PaginaCursos() {
  const { cursos, estado, reintentar, dialogoCompetencia } = useCursos();

  const textoCantidad = cursos.length === 1 ? '1 curso' : `${cursos.length} cursos`;

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.sobretitulo}>Módulo de gestión</p>
        <h1 className={estilos.titulo}>Cursos</h1>
        <p className={estilos.descripcion}>Consulta los cursos registrados.</p>
      </header>

      <section className={estilos.seccionLista} aria-labelledby={ID_TITULO_LISTA}>
        <div className={estilos.encabezadoLista}>
          <h2 id={ID_TITULO_LISTA} className={estilos.tituloLista}>Todos los cursos</h2>
          <span className={estilos.lineaEncabezado} aria-hidden="true" />
          {estado === 'listo' && <span className={estilos.contador}>{textoCantidad}</span>}
        </div>

        {estado === 'cargando' && (
          <div className={estilos.contenedorEstado}>
            <EstadoConsulta tipo="carga" />
          </div>
        )}

        {estado === 'error' && (
          <div className={estilos.contenedorEstado}>
            <EstadoConsulta tipo="error" alReintentar={reintentar} />
          </div>
        )}

        {estado === 'listo' && cursos.length === 0 && (
          <div className={estilos.contenedorEstado}>
            <EstadoConsulta tipo="vacio" mensaje="No hay cursos registrados." />
          </div>
        )}

        {estado === 'listo' && cursos.length > 0 && (
          <ul className={estilos.rejilla}>
            {cursos.map((curso) => (
              <li key={curso.id}>
                <TarjetaCurso
                  curso={curso}
                  alAgregarCompetencia={dialogoCompetencia.abrir}
                  alVerCompetencias={dialogoCompetencia.ver}
                />
              </li>
            ))}
          </ul>
        )}

      </section>

      <p role="status" aria-live="polite" className={estilosUtil.ocultoVisualmente}>
        {estado === 'listo' ? `Mostrando ${textoCantidad}` : ''}
      </p>

      {dialogoCompetencia.curso && dialogoCompetencia.modo === 'agregar' && (
        <DialogoCrearCompetencia
          key={dialogoCompetencia.curso.id}
          nombreCurso={dialogoCompetencia.curso.nombre}
          enviando={dialogoCompetencia.enviando}
          error={dialogoCompetencia.error}
          alCancelar={dialogoCompetencia.cerrar}
          alGuardar={dialogoCompetencia.agregar}
        />
      )}

      {dialogoCompetencia.curso && dialogoCompetencia.modo === 'ver' && (
        <DialogoVerCompetencias
          key={`ver-${dialogoCompetencia.curso.id}`}
          nombreCurso={dialogoCompetencia.curso.nombre}
          competencias={dialogoCompetencia.competencias}
          cargando={dialogoCompetencia.cargandoCompetencias}
          error={dialogoCompetencia.errorListado}
          errorEliminar={dialogoCompetencia.errorEliminar}
          idEliminando={dialogoCompetencia.idEliminando}
          alCerrar={dialogoCompetencia.cerrar}
          alEditar={dialogoCompetencia.editar}
          alEliminar={dialogoCompetencia.eliminar}
        />
      )}

      {dialogoCompetencia.curso && dialogoCompetencia.modo === 'editar' && dialogoCompetencia.competenciaEditar && (
        <DialogoCrearCompetencia
          key={`editar-${dialogoCompetencia.competenciaEditar.id}`}
          nombreCurso={dialogoCompetencia.curso.nombre}
          competenciaInicial={dialogoCompetencia.competenciaEditar}
          titulo="Editar competencia"
          textoConfirmar="Guardar cambios"
          textoEnviando="Guardando…"
          enviando={dialogoCompetencia.enviando}
          error={dialogoCompetencia.error}
          alCancelar={dialogoCompetencia.cerrar}
          alGuardar={dialogoCompetencia.guardarEdicion}
        />
      )}
    </div>
  );
}
