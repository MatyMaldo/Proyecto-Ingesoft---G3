import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import TarjetaCurso from '../components/TarjetaCurso.jsx';
import DialogoCompetencias from '../components/DialogoCompetencias.jsx';
import DialogoCrearCurso from '../components/DialogoCrearCurso.jsx';
import { MENSAJE_VACIO_CON_PERMISO, MENSAJE_VACIO_SIN_PERMISO } from '../constants/mensajesCursos.js';
import useCursos from '../hooks/useCursos.js';
import estilos from './PaginaCursos.module.css';

const ID_SELECTOR_GRADO = 'cursos-grado';
const ID_TITULO_LISTA = 'cursos-titulo-lista';

/**
 * Página "Cursos" (HU-EVAL-08): cursos de cada grado académico y asignación de competencias.
 * Todos los roles autorizados la ven; solo quienes tienen permiso de gestión (hoy, el administrador)
 * ven "Crear curso" y "Añadir competencias" (`constants/permisosCursos.js`).
 * Compone la pantalla a partir de `useCursos`; no llama a servicios ni filtra datos por su cuenta.
 * El breadcrumb lo pinta el shell a partir de `migas` en `routes.jsx`.
 */
export default function PaginaCursos() {
  const {
    grados,
    grado,
    etiquetaGrado,
    establecerGrado,
    cursos,
    estado,
    reintentar,
    puedeGestionar,
    aviso,
    dialogoCompetencias,
    dialogoCrear
  } = useCursos();

  const textoCantidad = cursos.length === 1 ? '1 curso' : `${cursos.length} cursos`;

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.sobretitulo}>Módulo de gestión</p>
        <h1 className={estilos.titulo}>Cursos</h1>
        <p className={estilos.descripcion}>Consulta y gestiona los cursos asociados a cada grado académico.</p>
      </header>

      <section className={estilos.panelGrado} aria-label="Selección de grado">
        <label htmlFor={ID_SELECTOR_GRADO} className={estilos.etiquetaCampo}>
          Grado académico
        </label>
        <select
          id={ID_SELECTOR_GRADO}
          className={estilos.selectorGrado}
          value={grado}
          onChange={(evento) => establecerGrado(evento.target.value)}
        >
          {grados.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </section>

      <section className={estilos.seccionLista} aria-labelledby={ID_TITULO_LISTA}>
        <div className={estilos.encabezadoLista}>
          <h2 id={ID_TITULO_LISTA} className={estilos.tituloLista}>
            Cursos de {etiquetaGrado}
          </h2>
          <span className={estilos.lineaEncabezado} aria-hidden="true" />
          {estado === 'listo' && <span className={estilos.contador}>{textoCantidad}</span>}
        </div>

        {aviso && (
          <p role="status" className={estilos.aviso}>
            {aviso}
          </p>
        )}

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
            <EstadoConsulta
              tipo="vacio"
              mensaje={puedeGestionar ? MENSAJE_VACIO_CON_PERMISO : MENSAJE_VACIO_SIN_PERMISO}
            />
          </div>
        )}

        {estado === 'listo' && cursos.length > 0 && (
          <ul className={estilos.rejilla}>
            {cursos.map((curso) => (
              <li key={curso.id}>
                <TarjetaCurso
                  curso={curso}
                  puedeGestionar={puedeGestionar}
                  alAnadirCompetencias={dialogoCompetencias.abrir}
                />
              </li>
            ))}
          </ul>
        )}

        {estado === 'listo' && puedeGestionar && (
          <div className={estilos.acciones}>
            <button
              type="button"
              className={estilos.botonCrear}
              onClick={(evento) => dialogoCrear.abrir(evento.currentTarget)}
            >
              Crear curso
            </button>
          </div>
        )}
      </section>

      <p role="status" aria-live="polite" className={estilosUtil.ocultoVisualmente}>
        {estado === 'listo' ? `Mostrando ${textoCantidad} de ${etiquetaGrado}` : ''}
      </p>

      {dialogoCompetencias.curso && (
        <DialogoCompetencias
          key={dialogoCompetencias.curso.id}
          curso={dialogoCompetencias.curso}
          etiquetaGrado={etiquetaGrado}
          guardando={dialogoCompetencias.guardando}
          error={dialogoCompetencias.error}
          alCancelar={dialogoCompetencias.cerrar}
          alGuardar={dialogoCompetencias.guardar}
        />
      )}

      {dialogoCrear.abierto && (
        <DialogoCrearCurso
          nombresExistentes={cursos.map((curso) => curso.nombre)}
          etiquetaGrado={etiquetaGrado}
          enviando={dialogoCrear.enviando}
          error={dialogoCrear.error}
          alCancelar={dialogoCrear.cerrar}
          alCrear={dialogoCrear.crear}
        />
      )}
    </div>
  );
}
