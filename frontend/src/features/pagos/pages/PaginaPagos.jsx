import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import BarraBusquedaListado from '../../../shared/components/BarraBusquedaListado.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import ModalEmitirPension from '../components/ModalEmitirPension.jsx';
import ModalEmitirPensionesMasivo from '../components/ModalEmitirPensionesMasivo.jsx';
import ModalPagosEstudiante from '../components/ModalPagosEstudiante.jsx';
import TablaPagos from '../components/TablaPagos.jsx';
import usePagos from '../hooks/usePagos.js';
import { emitirCompromisoPension, emitirCompromisosPensionLote } from '../services/pagosService.js';
import estilos from './PaginaPagos.module.css';

/** Alumnos por página del listado (igual que Usuarios y Matrículas). La lista completa se carga una vez y se pagina aquí. */
const TAMANIO_PAGINA_PAGOS = 10;

const MENSAJE_VACIO = 'No hay alumnos con matrícula pendiente o confirmada en el año seleccionado.';
const MENSAJE_SIN_RESULTADOS = 'No se encontraron alumnos con los criterios indicados';

const OPCIONES_MATRICULA = [
  { valor: 'Todos', etiqueta: 'Todos', tono: 'gris' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada', tono: 'verde' },
  { valor: 'PENDIENTE', etiqueta: 'Pendiente', tono: 'ambar' }
];

const normalizar = (texto) => String(texto ?? '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLocaleLowerCase('es')
  .trim();

const esConfirmada = (alumno) => String(alumno.estadoMatricula ?? '').toUpperCase() === 'CONFIRMADA';
const idDeUrl = (valor) => (/^\d+$/.test(valor ?? '') ? Number(valor) : null);

export default function PaginaPagos() {
  // Año, grado, sección, búsqueda, estado de la matrícula y página viven también en la URL (?anio=&grado=&seccion=&q=
  // &matricula=&pagina=): sobreviven a recargar la página. Se leen una sola vez al montar y después se reflejan.
  const [parametros, establecerParametros] = useSearchParams();
  const { notificacion, mostrarNotificacion } = useNotificacion();
  const {
    alumnos,
    estado,
    error,
    recargando,
    estadoEstructura,
    errorEstructura,
    anios,
    anioId,
    seleccionarAnio,
    grados,
    gradoId,
    seleccionarGrado,
    secciones,
    seccionId,
    seleccionarSeccion,
    cargandoSecciones,
    limpiarFiltros: limpiarFiltrosEstructura,
    recargar,
    reintentar
  } = usePagos({
    anioId: idDeUrl(parametros.get('anio')),
    gradoId: idDeUrl(parametros.get('grado')),
    seccionId: idDeUrl(parametros.get('seccion'))
  });

  const [query, establecerQuery] = useState(() => parametros.get('q') ?? '');
  const [matricula, establecerMatricula] = useState(() => {
    const valor = parametros.get('matricula');
    return OPCIONES_MATRICULA.some((opcion) => opcion.valor === valor) ? valor : 'Todos';
  });
  const [pagina, establecerPagina] = useState(
    () => Math.max(0, (Number.parseInt(parametros.get('pagina'), 10) || 1) - 1)
  );

  const [modalPensionesAbierto, establecerModalPensionesAbierto] = useState(false);
  const [alumnoPension, establecerAlumnoPension] = useState(null);
  const [emitiendoPension, establecerEmitiendoPension] = useState(false);
  const [alumnoPagos, establecerAlumnoPagos] = useState(null);
  const refInicioListado = useRef(null);

  // Refleja en la URL los filtros y la página, cuando ya se cargó la estructura (antes el año aún no está elegido).
  useEffect(() => {
    if (estadoEstructura !== 'listo') return;
    const siguientes = new URLSearchParams(parametros);
    const fijar = (clave, valor) => (valor ? siguientes.set(clave, valor) : siguientes.delete(clave));
    fijar('anio', anioId != null ? String(anioId) : '');
    fijar('grado', gradoId != null ? String(gradoId) : '');
    fijar('seccion', seccionId != null ? String(seccionId) : '');
    fijar('q', query.trim());
    fijar('matricula', matricula !== 'Todos' ? matricula : '');
    fijar('pagina', pagina > 0 ? String(pagina + 1) : '');
    if (siguientes.toString() !== parametros.toString()) {
      establecerParametros(siguientes, { replace: true });
    }
  }, [estadoEstructura, anioId, gradoId, seccionId, query, matricula, pagina, parametros, establecerParametros]);

  const anioSeleccionado = anios.find((anio) => String(anio.id) === String(anioId));

  // Búsqueda y estado de la matrícula se aplican sobre la lista ya cargada. Con el estado en "Todos" cada chip
  // muestra su cantidad; al elegir uno, solo ese la muestra (el resultado filtrado).
  const termino = normalizar(query);
  const coincideBusqueda = (alumno) => !termino
    || normalizar(`${alumno.nombre} ${alumno.codigo ?? ''} ${alumno.dni ?? ''}`).includes(termino);
  const coincideMatricula = (alumno) => matricula === 'Todos' || (matricula === 'CONFIRMADA') === esConfirmada(alumno);
  const filtrados = alumnos.filter((alumno) => coincideBusqueda(alumno) && coincideMatricula(alumno));
  const opcionesMatricula = OPCIONES_MATRICULA.map((opcion) => ({
    ...opcion,
    conteo: matricula === 'Todos' || opcion.valor === matricula
      ? alumnos.filter((alumno) => coincideBusqueda(alumno)
        && (opcion.valor === 'Todos' || (opcion.valor === 'CONFIRMADA') === esConfirmada(alumno))).length
      : undefined
  }));

  const hayFiltros = Boolean(gradoId || seccionId || termino || matricula !== 'Todos');
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANIO_PAGINA_PAGOS));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const alumnosPagina = filtrados.slice(
    paginaActual * TAMANIO_PAGINA_PAGOS,
    (paginaActual + 1) * TAMANIO_PAGINA_PAGOS
  );
  const estructuraLista = estadoEstructura === 'listo';
  const hayResultados = estructuraLista && estado === 'listo' && filtrados.length > 0;

  // Cambiar un criterio de búsqueda o de filtro vuelve a la primera página.
  const cambiarBusqueda = (valor) => { establecerQuery(valor); establecerPagina(0); };
  const cambiarMatricula = (valor) => { establecerMatricula(valor); establecerPagina(0); };
  const cambiarAnio = (valor) => { seleccionarAnio(valor); establecerPagina(0); };
  const cambiarGrado = (valor) => { seleccionarGrado(valor); establecerPagina(0); };
  const cambiarSeccion = (valor) => { seleccionarSeccion(valor); establecerPagina(0); };
  const limpiarFiltros = () => {
    limpiarFiltrosEstructura();
    establecerQuery('');
    establecerMatricula('Todos');
    establecerPagina(0);
  };

  // Al cambiar de página (sobre todo desde el paginador inferior), devuelve la vista al inicio del listado.
  const cambiarPagina = (nuevaPagina) => {
    establecerPagina(nuevaPagina);
    const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    refInicioListado.current?.scrollIntoView?.({ block: 'start', behavior: reducirMovimiento ? 'auto' : 'smooth' });
  };

  // El mismo paginador (con el total y el campo de página) va arriba y abajo del listado, como en Usuarios.
  const paginador = (posicion) => (
    <Paginacion
      pagina={paginaActual}
      totalPaginas={totalPaginas}
      totalElementos={filtrados.length}
      tamanioPagina={TAMANIO_PAGINA_PAGOS}
      cantidadEnPagina={alumnosPagina.length}
      alCambiarPagina={cambiarPagina}
      etiqueta={`Paginación de alumnos (${posicion})`}
      unidadSingular="alumno"
      unidadPlural="alumnos"
      anunciarTotal={posicion === 'superior'}
    />
  );

  const emitirPensionesMasivo = async ({ anioId: anioElegidoId, mes }) => {
    const respuesta = await emitirCompromisosPensionLote({ anioId: anioElegidoId, mes });
    if (respuesta.exitoso) {
      reintentar();
    }
    return respuesta;
  };

  // La notificación se muestra desde la página para que siga visible cuando el diálogo se cierra.
  const confirmarPension = async ({ estudianteId, anioId: anioElegidoId, mes }) => {
    if (emitiendoPension) return;

    establecerEmitiendoPension(true);
    const respuesta = await emitirCompromisoPension({ estudianteId, anioId: anioElegidoId, mes });
    establecerEmitiendoPension(false);

    if (!respuesta.exitoso) {
      mostrarNotificacion(respuesta.mensaje || 'No fue posible emitir el compromiso de pensión.', true);
      return;
    }

    establecerAlumnoPension(null);
    mostrarNotificacion(`Se emitió el compromiso de pensión de ${mes}.`);
  };

  const opcionesAnio = anios.map((anio) => ({ valor: String(anio.id), etiqueta: String(anio.anio) }));
  const opcionesGrado = [
    { valor: '', etiqueta: 'Todos los grados' },
    ...grados.map((grado) => ({ valor: String(grado.id), etiqueta: grado.nombre }))
  ];
  const opcionesSeccion = [
    { valor: '', etiqueta: 'Todas las secciones' },
    ...secciones.map((seccion) => ({ valor: String(seccion.id), etiqueta: seccion.nombre }))
  ];

  return (
    <div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      {/* Barra de título (GUI §6): título a la izquierda y la acción global a la derecha. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Pagos</h1>
          <p className={estilos.descripcion}>
            Gestiona los pagos y compromisos de matrícula de los estudiantes.
          </p>
        </div>
        <div className={estilos.acciones}>
          <button
            type="button"
            className={`${estilos.boton} ${estilos.botonPrimario}`}
            disabled={!estructuraLista}
            onClick={() => establecerModalPensionesAbierto(true)}
          >
            <Icono nombre="archivo" tamano={16} />
            Emitir compromisos de pensión
          </button>
        </div>
      </header>

      {/* El buscador va solo en una línea, con "Limpiar filtros" a su lado; debajo, año, grado y sección como
          selectores y el estado de la matrícula como chips con su subtítulo (mismo patrón que Usuarios y Matrículas). */}
      <section className={estilos.filtros} aria-label="Búsqueda y filtros de pagos">
        <BarraBusquedaListado
          alActualizar={recargar}
          actualizando={recargando}
          hayFiltros={hayFiltros}
          alLimpiar={limpiarFiltros}
        >
          <CampoBusqueda
            id="busqueda-pagos"
            etiqueta="Buscar alumnos por nombre o código"
            placeholder="Buscar por nombre o código"
            valor={query}
            alCambiar={cambiarBusqueda}
          />
        </BarraBusquedaListado>

        <div className={estilos.filaFiltros}>
          <SelectFiltro
            apilado
            id="filtro-anio-pagos"
            etiqueta="Año académico"
            valor={anioId != null ? String(anioId) : ''}
            opciones={opcionesAnio}
            alCambiar={cambiarAnio}
            deshabilitado={!estructuraLista}
          />
          <SelectFiltro
            apilado
            id="filtro-grado-pagos"
            etiqueta="Grado"
            valor={gradoId != null ? String(gradoId) : ''}
            opciones={opcionesGrado}
            alCambiar={cambiarGrado}
            deshabilitado={!estructuraLista}
          />
          <SelectFiltro
            apilado
            id="filtro-seccion-pagos"
            etiqueta="Sección"
            valor={seccionId != null ? String(seccionId) : ''}
            opciones={opcionesSeccion}
            alCambiar={cambiarSeccion}
            deshabilitado={!estructuraLista || !gradoId || cargandoSecciones}
          />
        </div>

        <div className={estilos.grupoFiltro}>
          {/* El subtítulo es visual: el grupo ya tiene su nombre accesible en `etiquetaGrupo`. */}
          <span className={estilos.rotuloFiltro} aria-hidden="true">Matrícula</span>
          <FiltroChips
            etiquetaGrupo="Filtrar alumnos por estado de la matrícula"
            opciones={opcionesMatricula}
            valorSeleccionado={matricula}
            alSeleccionar={cambiarMatricula}
          />
        </div>
      </section>

      {/* Total y paginación arriba del listado: el total queda a la vista sin bajar hasta el final. */}
      {hayResultados && <div ref={refInicioListado} className={estilos.barraPaginacion}>{paginador('superior')}</div>}

      <section className={estilos.tarjetaResultados} aria-busy={estado === 'cargando' || undefined}>
        {estadoEstructura === 'error' && (
          <EstadoConsulta
            tipo="error"
            mensaje={errorEstructura}
            alReintentar={reintentar}
          />
        )}

        {estadoEstructura !== 'error' && estado === 'cargando' && (
          <EstadoConsulta tipo="carga" filasEsqueleto={5} />
        )}

        {estadoEstructura !== 'error' && estado === 'error' && (
          <EstadoConsulta tipo="error" mensaje={error} alReintentar={reintentar} />
        )}

        {estadoEstructura !== 'error' && estado === 'listo' && filtrados.length === 0 && (
          <EstadoConsulta
            tipo="vacio"
            mensaje={alumnos.length === 0 && !hayFiltros ? MENSAJE_VACIO : MENSAJE_SIN_RESULTADOS}
          />
        )}

        {hayResultados && (
          <>
            {recargando && <p className={estilos.actualizando}>Actualizando resultados…</p>}
            <TablaPagos
              alumnos={alumnosPagina}
              ocupado={recargando}
              alEmitirPension={establecerAlumnoPension}
              alVerPagos={establecerAlumnoPagos}
            />
            {/* Con una sola página el total ya está arriba: no se repite abajo. */}
            {totalPaginas > 1 && <div className={estilos.pie}>{paginador('inferior')}</div>}
          </>
        )}
      </section>

      {modalPensionesAbierto && (
        <ModalEmitirPensionesMasivo
          anios={anios}
          anioInicialId={anioId != null ? String(anioId) : ''}
          onCerrar={() => establecerModalPensionesAbierto(false)}
          onEjecutar={emitirPensionesMasivo}
        />
      )}

      {alumnoPension && (
        <ModalEmitirPension
          alumno={alumnoPension}
          anios={anios}
          anioInicialId={anioId != null ? String(anioId) : ''}
          enviando={emitiendoPension}
          onCerrar={() => establecerAlumnoPension(null)}
          onAceptar={confirmarPension}
        />
      )}

      {alumnoPagos && (
        <ModalPagosEstudiante
          alumno={alumnoPagos}
          anio={anioSeleccionado}
          onCerrar={() => establecerAlumnoPagos(null)}
          alNotificar={mostrarNotificacion}
        />
      )}
    </div>
  );
}
