import { useState } from 'react';

import BarraBusquedaListado from '../../../shared/components/BarraBusquedaListado.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import DialogoCrearCompetencia from '../components/DialogoCrearCompetencia.jsx';
import DialogoCrearCurso from '../components/DialogoCrearCurso.jsx';
import DialogoEliminarCurso from '../components/DialogoEliminarCurso.jsx';
import DialogoVerCompetencias from '../components/DialogoVerCompetencias.jsx';
import TarjetaCurso from '../components/TarjetaCurso.jsx';
import useAuth from '../../../shared/auth/useAuth.js';
import { ROLES } from '../../../shared/auth/roles.js';
import ConsultaNotasFamilia from '../../evaluaciones/components/ConsultaNotasFamilia.jsx';
import { puedeGestionarCursos } from '../constants/permisosCursos.js';
import useCursos from '../hooks/useCursos.js';
import PaginaCursosEstudiante from './PaginaCursosEstudiante.jsx';
import estilos from './PaginaCursos.module.css';

/** Tarjetas por página: 6 (2 filas de 3), que caben sin scroll. */
const TARJETAS_POR_PAGINA = 6;

/**
 * Página de consulta de cursos. Carga todos los registros sin filtrarlos por grado.
 * El breadcrumb lo pinta el shell a partir de `migas` en `routes.jsx`.
 */
export default function PaginaCursos() {
  const { usuario } = useAuth();

  if (usuario?.rol === ROLES.ESTUDIANTE) {
    return <PaginaCursosEstudiante />;
  }

  if (usuario?.rol === ROLES.APODERADO) {
    return <ConsultaNotasFamilia />;
  }

  return <ContenidoCursos usuario={usuario} />;
}

function ContenidoCursos({ usuario }) {
  const { cursos, estado, reintentar, dialogoCurso, dialogoCompetencia } = useCursos();
  const puedeGestionar = puedeGestionarCursos(usuario?.rol);
  const [busqueda, establecerBusqueda] = useState('');
  const [pagina, establecerPagina] = useState(0);

  const normalizar = (texto) => String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const consulta = normalizar(busqueda.trim());
  const cursosVisibles = consulta
    ? cursos.filter((curso) => normalizar(`${curso.nombre} ${curso.descripcion}`).includes(consulta))
    : cursos;

  const textoCantidad = cursosVisibles.length === 1 ? '1 curso' : `${cursosVisibles.length} cursos`;

  // Paginación en el cliente: la búsqueda filtra primero y después se pagina. El pie solo aparece si hay más
  // cursos que los de una página; con pocos cursos no hace falta.
  const totalPaginas = Math.max(1, Math.ceil(cursosVisibles.length / TARJETAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const cursosPagina = cursosVisibles.slice(paginaActual * TARJETAS_POR_PAGINA, (paginaActual + 1) * TARJETAS_POR_PAGINA);
  const hayPie = cursosVisibles.length > TARJETAS_POR_PAGINA;
  const cambiarBusqueda = (valor) => {
    establecerBusqueda(valor);
    establecerPagina(0);
  };

  return (
    <div className={estilos.pagina}>
      {/* Barra de título (GUI §6): título y descripción (gris, pequeña) en la misma línea y la acción principal a la
          derecha, igual que Usuarios y Matrículas. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Cursos</h1>
          <p className={estilos.descripcion}>Consulta los cursos registrados.</p>
        </div>
        {puedeGestionar && (
          <div className={estilos.acciones}>
            <button
              type="button"
              className={estilos.botonAgregarCurso}
              disabled={estado !== 'listo'}
              onClick={dialogoCurso.abrirCrear}
            >
              <Icono nombre="agregar" tamano={16} />
              Agregar curso
            </button>
          </div>
        )}
      </header>

      {estado === 'listo' && cursos.length > 0 && (
        <div className={estilos.filaBusqueda}>
          <BarraBusquedaListado
            alActualizar={reintentar}
            hayFiltros={Boolean(busqueda.trim())}
            alLimpiar={() => cambiarBusqueda('')}
          >
            <CampoBusqueda
              id="busqueda-cursos"
              etiqueta="Buscar cursos por nombre o descripción"
              placeholder="Buscar por nombre o descripción"
              valor={busqueda}
              alCambiar={cambiarBusqueda}
            />
          </BarraBusquedaListado>
          {/* Con pie, el total ya lo dice el paginador: no se repite aquí. */}
          {!hayPie && <span className={estilos.contador}>{textoCantidad}</span>}
        </div>
      )}

      <section className={estilos.seccionLista} aria-label="Listado de cursos">
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

        {estado === 'listo' && cursos.length > 0 && cursosVisibles.length === 0 && (
          <div className={estilos.contenedorEstado}>
            <EstadoConsulta tipo="vacio" mensaje="No se encontraron cursos con los criterios indicados" />
          </div>
        )}

        {estado === 'listo' && cursosVisibles.length > 0 && (
          // `key` por página: al cambiar de página el desplazamiento de la rejilla vuelve al inicio.
          <div className={estilos.zonaRejilla} key={paginaActual}>
            {/* Una página completa reparte todo el alto disponible entre sus filas; una parcial no se estira. */}
            <ul className={cursosPagina.length === TARJETAS_POR_PAGINA ? `${estilos.rejilla} ${estilos.rejillaLlena}` : estilos.rejilla}>
              {cursosPagina.map((curso) => (
                <li key={curso.id}>
                  <TarjetaCurso
                    curso={curso}
                    alVerCompetencias={dialogoCompetencia.ver}
                    puedeGestionar={puedeGestionar}
                    alEditar={dialogoCurso.abrirEditar}
                    alEliminar={dialogoCurso.abrirEliminar}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {estado === 'listo' && hayPie && (
          <div className={estilos.pie}>
            <Paginacion
              pagina={paginaActual}
              totalPaginas={totalPaginas}
              totalElementos={cursosVisibles.length}
              tamanioPagina={TARJETAS_POR_PAGINA}
              cantidadEnPagina={cursosPagina.length}
              alCambiarPagina={establecerPagina}
              etiqueta="Paginación de cursos"
              unidadSingular="curso"
              unidadPlural="cursos"
            />
          </div>
        )}

      </section>

      <p role="status" aria-live="polite" className={estilosUtil.ocultoVisualmente}>
        {estado === 'listo' ? `Mostrando ${textoCantidad}` : ''}
      </p>

      {dialogoCurso.dialogo?.modo === 'crear' && (
        <DialogoCrearCurso
          key="crear-curso"
          enviando={dialogoCurso.enviando}
          error={dialogoCurso.error}
          alCancelar={dialogoCurso.cerrar}
          alGuardar={dialogoCurso.guardar}
        />
      )}

      {dialogoCurso.dialogo?.modo === 'editar' && (
        <DialogoCrearCurso
          key={`editar-curso-${dialogoCurso.dialogo.curso.id}`}
          cursoInicial={dialogoCurso.dialogo.curso}
          titulo="Modificar curso"
          textoConfirmar="Guardar cambios"
          textoEnviando="Guardando…"
          enviando={dialogoCurso.enviando}
          error={dialogoCurso.error}
          alCancelar={dialogoCurso.cerrar}
          alGuardar={dialogoCurso.guardar}
        />
      )}

      {dialogoCurso.dialogo?.modo === 'eliminar' && (
        <DialogoEliminarCurso
          nombreCurso={dialogoCurso.dialogo.curso.nombre}
          enviando={dialogoCurso.idEliminando !== null}
          error={dialogoCurso.error}
          alCancelar={dialogoCurso.cerrar}
          alConfirmar={dialogoCurso.eliminar}
        />
      )}

      {dialogoCompetencia.curso && dialogoCompetencia.modo === 'agregar' && (
        <DialogoCrearCompetencia
          key={dialogoCompetencia.curso.id}
          nombreCurso={dialogoCompetencia.curso.nombre}
          enviando={dialogoCompetencia.enviando}
          error={dialogoCompetencia.error}
          alCancelar={dialogoCompetencia.volverAGestionar}
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
          alAgregar={() => dialogoCompetencia.abrir(dialogoCompetencia.curso.id)}
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
          alCancelar={dialogoCompetencia.volverAGestionar}
          alGuardar={dialogoCompetencia.guardarEdicion}
        />
      )}
    </div>
  );
}
