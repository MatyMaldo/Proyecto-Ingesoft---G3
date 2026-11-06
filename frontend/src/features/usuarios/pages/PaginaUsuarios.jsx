import { useEffect, useRef, useState } from 'react';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import FiltrosActivos from '../../../shared/components/FiltrosActivos.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import MenuDesplegable from '../../../shared/components/MenuDesplegable.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import useCoincideMedia from '../../../shared/hooks/useCoincideMedia.js';
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

function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState(() => USAR_MOCK ? USUARIOS_INICIAL : []);
    const [cargando, setCargando] = useState(!USAR_MOCK);
    const [errorCarga, setErrorCarga] = useState('');
    const [intentoCarga, setIntentoCarga] = useState(0);
    const [query, setQuery] = useState('');
    const [rolFiltro, setRolFiltro] = useState('Todos');
    const [estadoFiltro, setEstadoFiltro] = useState('Todos');
    const [pagina, setPagina] = useState(0);
    const [orden, setOrden] = useState(ORDEN_INICIAL);
    const esMovil = useCoincideMedia('(max-width: 767px)');
    const { notificacion, mostrarNotificacion } = useNotificacion();
    // Diálogo abierto: un tipo de registro, 'cargaCsv', 'editar' o 'toggle'; `usuarioActivo` es el usuario de los dos últimos.
    const [modal, setModal] = useState(null);
    const [usuarioActivo, setUsuarioActivo] = useState(null);
    useEffect(() => {
        if (USAR_MOCK) return undefined;
        let vigente = true;
        setCargando(true);
        setErrorCarga('');
        listarUsuarios().then(resultado => {
            if (!vigente) return;
            if (!resultado.exitoso) {
                setErrorCarga(resultado.mensaje);
            } else {
                setUsuarios(resultado.datos);
            }
            setCargando(false);
        });
        return () => { vigente = false; };
    }, [intentoCarga]);
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
    // Filtros aplicados que no se ven como chip (el rol ya se ve en sus chips): el estado, que está en un selector.
    const chipsActivos = estadoFiltro === 'Todos'
        ? []
        : [{
            id: 'estado',
            etiqueta: `Estado: ${OPCIONES_FILTRO_ESTADO.find(opcion => opcion.valor === estadoFiltro)?.etiqueta ?? estadoFiltro}`,
            alQuitar: () => cambiarEstado('Todos')
        }];
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

      {/* Barra de título (GUI §6): título a la izquierda y acciones globales a la derecha, secundaria y luego primaria. */}
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Usuarios</h1>
          <p className={estilos.descripcion}>Gestiona los usuarios registrados en el sistema.</p>
        </div>
        <div className={estilos.acciones}>
          {/* En móvil la carga masiva pasa al menú "Nuevo usuario" para no apilar dos botones a ancho completo. */}
          {!esMovil && (
            <button type="button" className={`${estilos.boton} ${estilos.botonSecundario}`} disabled={cargando} onClick={abrirCargaCsv}>
              <Icono nombre="subir" tamano={16} />
              Carga masiva CSV
            </button>
          )}
          <MenuDesplegable
            etiquetaBoton="Nuevo usuario"
            claseBoton={`${estilos.boton} ${estilos.botonPrimario}`}
            alineacion="fin"
            contenidoBoton={<>
              <Icono nombre="agregar" tamano={16} />
              Nuevo usuario
              <Icono nombre="chevron-abajo" tamano={16} />
            </>}
            items={[
              { id: 'apoderado', etiqueta: 'Apoderado', ariaLabel: 'Registrar apoderado', icono: 'usuarios', alSeleccionar: () => openRegister('apoderado') },
              { id: 'estudiante', etiqueta: 'Estudiante', ariaLabel: 'Registrar estudiante', icono: 'birrete', alSeleccionar: () => openRegister('estudiante') },
              { id: 'docente', etiqueta: 'Docente', ariaLabel: 'Registrar docente', icono: 'libro', alSeleccionar: () => openRegister('docente') },
              ...(esMovil && !cargando
                ? [{ id: 'csv', etiqueta: 'Carga masiva CSV', icono: 'subir', separadorAntes: true, alSeleccionar: abrirCargaCsv }]
                : [])
            ]}
          />
        </div>
      </header>

      {/* Búsqueda, chips de rol (con conteo) y estado en una sola fila; debajo, los filtros aplicados y "Limpiar filtros"
          (mismo patrón que Auditorías). */}
      <section className={estilos.filtros} aria-label="Búsqueda y filtros de usuarios">
        <div className={estilos.filaFiltros}>
          <div className={estilos.campoBusqueda}>
            <CampoBusqueda
              id="busqueda-usuarios"
              etiqueta="Buscar usuarios por nombre, DNI o correo"
              placeholder="Buscar por nombre, DNI o correo"
              valor={query}
              alCambiar={cambiarBusqueda}
            />
          </div>
          <FiltroChips
            etiquetaGrupo="Filtrar usuarios por rol"
            opciones={opcionesRol}
            valorSeleccionado={rolFiltro}
            alSeleccionar={cambiarRol}
          />
          <SelectFiltro
            id="filtro-estado-usuarios"
            etiqueta="Estado"
            valor={estadoFiltro}
            opciones={OPCIONES_FILTRO_ESTADO}
            alCambiar={cambiarEstado}
          />
        </div>
        <FiltrosActivos filtros={chipsActivos} hayFiltros={hayFiltros} alLimpiar={limpiarFiltros} />
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
            mensaje="No se encontraron usuarios."
            etiquetaAccion={hayFiltros ? 'Limpiar filtros' : undefined}
            alAccion={hayFiltros ? limpiarFiltros : undefined}
          />
        ) : (
          <>
            <TablaUsuarios usuarios={usuariosPagina} esProtegido={esAdministrador} alEditar={openEdit} alCambiarEstado={openToggle} orden={orden} alOrdenar={ordenarPor} />
            <div className={estilos.pie}>{paginador('inferior')}</div>
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
          alImportacionCompleta={importados => {
            closeModal();
            mostrarNotificacion(`Se importaron correctamente ${importados} usuarios.`);
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
