import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import BarraBusquedaListado from '../../../shared/components/BarraBusquedaListado.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import MenuDesplegable from '../../../shared/components/MenuDesplegable.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import DialogoCambiarEstado from '../components/DialogoCambiarEstado.jsx';
import DialogoCargaCsv from '../components/DialogoCargaCsv.jsx';
import DialogoEditarUsuario from '../components/DialogoEditarUsuario.jsx';
import DialogoRegistroUsuario from '../components/DialogoRegistroUsuario.jsx';
import TablaUsuarios from '../components/TablaUsuarios.jsx';
import {
    OPCIONES_FILTRO_ESTADO,
    OPCIONES_FILTRO_ROL,
    TAMANIO_PAGINA_USUARIOS
} from '../constants/rolesUsuario.js';
import { USUARIOS_INICIAL, listarUsuarios } from '../services/usuariosService.js';
import esAdministrador from '../utils/esAdministrador.js';
import { ORDEN_INICIAL, ordenarUsuarios } from '../utils/ordenarUsuarios.js';
import estilos from './PaginaUsuarios.module.css';

const TIPOS_REGISTRO = ['apoderado', 'estudiante', 'docente'];

/** Valor de la URL si es una de las opciones del filtro; si no, `'Todos'` (sin filtro). */
function valorValido(valor, opciones) {
    return opciones.some(opcion => opcion.valor === valor) ? valor : 'Todos';
}

function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState(() => USAR_MOCK ? USUARIOS_INICIAL : []);
    const [cargando, setCargando] = useState(!USAR_MOCK);
    const [errorCarga, setErrorCarga] = useState('');
    const [intentoCarga, setIntentoCarga] = useState(0);
    // `true` mientras "Actualizar" vuelve a pedir la lista: la tabla sigue a la vista (no vuelve al esqueleto de carga).
    const [actualizando, setActualizando] = useState(false);
    // Búsqueda, filtros y página viven también en la URL (?q=&rol=&estado=&pagina=): sobreviven a recargar la
    // página y a volver desde otra pantalla. Se leen una sola vez al montar y después se reflejan en la URL.
    const [parametros, establecerParametros] = useSearchParams();
    const [query, setQuery] = useState(() => parametros.get('q') ?? '');
    const [rolFiltro, setRolFiltro] = useState(() => valorValido(parametros.get('rol'), OPCIONES_FILTRO_ROL));
    const [estadoFiltro, setEstadoFiltro] = useState(() => valorValido(parametros.get('estado'), OPCIONES_FILTRO_ESTADO));
    const [pagina, setPagina] = useState(() => Math.max(0, (Number.parseInt(parametros.get('pagina'), 10) || 1) - 1));
    const [orden, setOrden] = useState(ORDEN_INICIAL);
    const { notificacion, mostrarNotificacion } = useNotificacion();
    // Diálogo abierto: un tipo de registro, 'cargaCsv', 'editar' o 'toggle'; `usuarioActivo` es el usuario de los dos últimos.
    const [modal, setModal] = useState(null);
    const [usuarioActivo, setUsuarioActivo] = useState(null);
    useEffect(() => {
        if (USAR_MOCK) return undefined;
        let vigente = true;
        // Con la lista ya a la vista se actualiza en sitio; en la primera carga o tras un error, se muestra el esqueleto.
        if (usuarios.length > 0 && !errorCarga) {
            setActualizando(true);
        } else {
            setCargando(true);
        }
        setErrorCarga('');
        listarUsuarios().then(resultado => {
            if (!vigente) return;
            if (!resultado.exitoso) {
                setErrorCarga(resultado.mensaje);
            } else {
                setUsuarios(resultado.datos);
            }
            setCargando(false);
            setActualizando(false);
        });
        return () => { vigente = false; };
        // Solo se vuelve a pedir al reintentar o actualizar: `usuarios` y `errorCarga` se leen tal como están en ese momento.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intentoCarga]);
    useEffect(() => {
        const siguientes = new URLSearchParams(parametros);
        const fijar = (clave, valor) => (valor ? siguientes.set(clave, valor) : siguientes.delete(clave));
        fijar('q', query.trim());
        fijar('rol', rolFiltro !== 'Todos' ? rolFiltro : '');
        fijar('estado', estadoFiltro !== 'Todos' ? estadoFiltro : '');
        fijar('pagina', pagina > 0 ? String(pagina + 1) : '');
        if (siguientes.toString() !== parametros.toString()) {
            establecerParametros(siguientes, { replace: true });
        }
    }, [query, rolFiltro, estadoFiltro, pagina, parametros, establecerParametros]);
    const busqueda = query.trim().toLowerCase();
    const coincideBusqueda = u => !busqueda
        || `${u.nombre} ${u.apellido}`.toLowerCase().includes(busqueda)
        || u.dni.includes(query.trim())
        || (u.correo ?? '').toLowerCase().includes(busqueda);
    const coincideEstado = u => estadoFiltro === 'Todos' || (estadoFiltro === 'activo') === Boolean(u.activo);
    const coincideRol = u => rolFiltro === 'Todos' || u.rol === rolFiltro;
    const filtered = usuarios.filter(u => coincideBusqueda(u) && coincideRol(u) && coincideEstado(u));
    const hayFiltros = Boolean(busqueda) || rolFiltro !== 'Todos' || estadoFiltro !== 'Todos';
    // Conteo de los chips de rol: la búsqueda y el estado se aplican a cada chip. Con el rol en "Todos" todos
    // los chips muestran su cantidad; al elegir un rol solo ese chip la muestra (el resultado filtrado), porque
    // el conteo de los demás ya no corresponde a lo que se está viendo.
    const opcionesRol = OPCIONES_FILTRO_ROL.map(opcion => ({
        ...opcion,
        conteo: rolFiltro === 'Todos' || opcion.valor === rolFiltro
            ? usuarios.filter(u => coincideBusqueda(u) && coincideEstado(u) && (opcion.valor === 'Todos' || u.rol === opcion.valor)).length
            : undefined
    }));
    // Mismo criterio para los chips de estado: la búsqueda y el rol se aplican a cada chip. Con rol y estado elegidos
    // los dos chips seleccionados darían el mismo número que el paginador: el del estado se omite para que el total
    // se vea solo dos veces (en el chip del rol y en el paginador).
    const omitirConteoEstado = rolFiltro !== 'Todos' && estadoFiltro !== 'Todos';
    const opcionesEstado = OPCIONES_FILTRO_ESTADO.map(opcion => ({
        ...opcion,
        conteo: !omitirConteoEstado && (estadoFiltro === 'Todos' || opcion.valor === estadoFiltro)
            ? usuarios.filter(u => coincideBusqueda(u) && coincideRol(u)
                && (opcion.valor === 'Todos' || (opcion.valor === 'activo') === Boolean(u.activo))).length
            : undefined
    }));
    const ordenados = ordenarUsuarios(filtered, orden);
    const totalPaginas = Math.max(1, Math.ceil(ordenados.length / TAMANIO_PAGINA_USUARIOS));
    const paginaActual = Math.min(pagina, totalPaginas - 1);
    const usuariosPagina = ordenados.slice(paginaActual * TAMANIO_PAGINA_USUARIOS, (paginaActual + 1) * TAMANIO_PAGINA_USUARIOS);
    const refInicioListado = useRef(null);
    // Al cambiar de página (sobre todo desde el paginador inferior), devuelve la vista al inicio del listado.
    const cambiarPagina = nuevaPagina => {
        setPagina(nuevaPagina);
        const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        refInicioListado.current?.scrollIntoView?.({ block: 'start', behavior: reducirMovimiento ? 'auto' : 'smooth' });
    };
    // Sin ningún usuario y sin filtros: en vez de un vacío sin salida, se ofrece registrar el primero.
    const sinUsuarios = usuarios.length === 0 && !hayFiltros;
    const hayResultados = !cargando && !errorCarga && ordenados.length > 0;
    // El mismo paginador (con el total y el campo de página) va arriba y abajo del listado, como en Log de errores.
    const paginador = posicion => (
        <Paginacion
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          totalElementos={ordenados.length}
          tamanioPagina={TAMANIO_PAGINA_USUARIOS}
          cantidadEnPagina={usuariosPagina.length}
          alCambiarPagina={cambiarPagina}
          etiqueta={`Paginación de usuarios (${posicion})`}
          unidadSingular="usuario"
          unidadPlural="usuarios"
          anunciarTotal={posicion === 'superior'}
        />
    );
    // Cambiar un criterio de búsqueda o filtro vuelve a la primera página.
    const cambiarBusqueda = valor => { setQuery(valor); setPagina(0); };
    const cambiarRol = valor => { setRolFiltro(valor); setPagina(0); };
    const cambiarEstado = valor => { setEstadoFiltro(valor); setPagina(0); };
    const limpiarFiltros = () => { setQuery(''); setRolFiltro('Todos'); setEstadoFiltro('Todos'); setPagina(0); };
    const recargar = () => setIntentoCarga(actual => actual + 1);
    // Pulsar la misma columna invierte el sentido; otra columna empieza en ascendente.
    const ordenarPor = campo => {
        setOrden(actual => ({ campo, direccion: actual.campo === campo && actual.direccion === 'asc' ? 'desc' : 'asc' }));
        setPagina(0);
    };
    const closeModal = () => setModal(null);
    const abrirCargaCsv = () => setModal('cargaCsv');
    const openRegister = (tipo) => setModal(tipo);
    const openEdit = (u) => {
        if (esAdministrador(u)) return;
        setUsuarioActivo(u);
        setModal('editar');
    };
    const openToggle = (u) => {
        if (esAdministrador(u)) return;
        setUsuarioActivo(u);
        setModal('toggle');
    };
    return (<div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      {/* Barra de título (GUI §6): título a la izquierda y una sola acción global a la derecha: "Agregar usuarios" reúne
          el registro individual (por tipo) y la carga masiva por CSV. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Usuarios</h1>
          <p className={estilos.descripcion}>Gestiona los usuarios registrados en el sistema.</p>
        </div>
        <div className={estilos.acciones}>
          <MenuDesplegable
            etiquetaBoton="Agregar usuarios"
            claseBoton={`${estilos.boton} ${estilos.botonPrimario}`}
            alineacion="fin"
            contenidoBoton={<>
              <Icono nombre="agregar" tamano={16} />
              Agregar usuarios
              <Icono nombre="chevron-abajo" tamano={16} />
            </>}
            items={[
              { id: 'apoderado', etiqueta: 'Registrar apoderado', icono: 'usuarios', alSeleccionar: () => openRegister('apoderado') },
              { id: 'estudiante', etiqueta: 'Registrar estudiante', icono: 'birrete', alSeleccionar: () => openRegister('estudiante') },
              { id: 'docente', etiqueta: 'Registrar docente', icono: 'libro', alSeleccionar: () => openRegister('docente') },
              // La carga masiva espera a que termine de cargar el listado, porque valida contra los usuarios existentes.
              ...(!cargando
                ? [{ id: 'csv', etiqueta: 'Carga masiva (CSV)', icono: 'subir', separadorAntes: true, alSeleccionar: abrirCargaCsv }]
                : [])
            ]}
          />
        </div>
      </header>

      {/* Búsqueda arriba; debajo, los chips de rol y de estado (con conteo), cada grupo con su subtítulo; "Limpiar
          filtros" aparece junto al buscador cuando hay algún criterio activo. */}
      <section className={estilos.filtros} aria-label="Búsqueda y filtros de usuarios">
        {/* Junto al buscador: esa fila siempre tiene espacio, así "Limpiar filtros" aparece y desaparece sin mover lo
            que hay debajo. "Actualizar" vuelve a pedir la lista sin perder búsqueda, filtros ni página. */}
        <BarraBusquedaListado
          alActualizar={recargar}
          actualizando={actualizando}
          hayFiltros={hayFiltros}
          alLimpiar={limpiarFiltros}
        >
          <CampoBusqueda
            id="busqueda-usuarios"
            etiqueta="Buscar usuarios por nombre, DNI o correo"
            placeholder="Buscar por nombre, DNI o correo"
            valor={query}
            alCambiar={cambiarBusqueda}
          />
        </BarraBusquedaListado>
        <div className={estilos.filaChips}>
          {/* El subtítulo es visual: el grupo ya tiene su nombre accesible en `etiquetaGrupo`. */}
          <div className={estilos.grupoFiltro}>
            <span className={estilos.rotuloFiltro} aria-hidden="true">Rol</span>
            <FiltroChips
              etiquetaGrupo="Filtrar usuarios por rol"
              opciones={opcionesRol}
              valorSeleccionado={rolFiltro}
              alSeleccionar={cambiarRol}
            />
          </div>
          <div className={`${estilos.grupoFiltro} ${estilos.grupoEstado}`}>
            <span className={estilos.rotuloFiltro} aria-hidden="true">Estado</span>
            <FiltroChips
              etiquetaGrupo="Filtrar usuarios por estado"
              opciones={opcionesEstado}
              valorSeleccionado={estadoFiltro}
              alSeleccionar={cambiarEstado}
            />
          </div>
        </div>
      </section>

      {/* Total y paginación arriba del listado: el total queda a la vista sin bajar hasta el final. */}
      {hayResultados && <div ref={refInicioListado} className={estilos.barraPaginacion}>{paginador('superior')}</div>}

      {/* Listado de usuarios */}
      <section className={estilos.tarjetaResultados} aria-busy={cargando || undefined}>
        {cargando ? (
          <EstadoConsulta tipo="carga" mensaje="Cargando usuarios…" filasEsqueleto={5} />
        ) : errorCarga ? (
          <EstadoConsulta tipo="error" mensaje={errorCarga} alReintentar={() => setIntentoCarga(actual => actual + 1)} />
        ) : filtered.length === 0 ? (
          <EstadoConsulta
            tipo="vacio"
            mensaje={sinUsuarios ? 'Aún no hay usuarios registrados.' : 'No se encontraron usuarios con los criterios indicados'}
            etiquetaAccion={sinUsuarios ? 'Registrar apoderado' : undefined}
            alAccion={sinUsuarios ? () => openRegister('apoderado') : undefined}
          />
        ) : (
          <>
            <TablaUsuarios usuarios={usuariosPagina} esProtegido={esAdministrador} alEditar={openEdit} alCambiarEstado={openToggle} orden={orden} alOrdenar={ordenarPor} />
            {/* Con una sola página el total ya está arriba: no se repite abajo. */}
            {totalPaginas > 1 && <div className={estilos.pie}>{paginador('inferior')}</div>}
          </>
        )}
      </section>

      {/* ── Diálogos (cada uno se monta al abrirse, así empieza siempre con estado limpio) ── */}
      {TIPOS_REGISTRO.includes(modal) && (
        <DialogoRegistroUsuario
          key={modal}
          tipo={modal}
          usuarios={usuarios}
          alRegistrado={(nuevo, mensaje) => {
            setUsuarios(actuales => [...actuales, nuevo]);
            closeModal();
            mostrarNotificacion(mensaje);
          }}
          alCerrar={closeModal}
        />
      )}

      {modal === 'cargaCsv' && (
        <DialogoCargaCsv
          usuarios={usuarios}
          alImportar={setUsuarios}
          alRecargar={recargar}
          alImportacionCompleta={importados => {
            closeModal();
            mostrarNotificacion(importados === 1
                ? 'Se importó correctamente 1 usuario.'
                : `Se importaron correctamente ${importados} usuarios.`);
          }}
          alCerrar={closeModal}
        />
      )}

      {modal === 'editar' && usuarioActivo && (
        <DialogoEditarUsuario
          usuario={usuarioActivo}
          usuarios={usuarios}
          alGuardado={({ usuario, mensaje }) => {
            if (usuario) {
                setUsuarios(actuales => actuales.map(u => u.id === usuario.id ? usuario : u));
            }
            closeModal();
            mostrarNotificacion(mensaje);
          }}
          alCerrar={closeModal}
        />
      )}

      {modal === 'toggle' && usuarioActivo && (
        <DialogoCambiarEstado
          usuario={usuarioActivo}
          alCambiado={mensaje => {
            setUsuarios(actuales => actuales.map(u => u.id === usuarioActivo.id ? { ...u, activo: !u.activo } : u));
            closeModal();
            mostrarNotificacion(mensaje);
          }}
          alCerrar={closeModal}
        />
      )}
    </div>);
}

export default PaginaUsuarios;
