import Avatar from '../../../shared/components/Avatar.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import { TONO_ROL } from '../constants/rolesUsuario.js';
import estilos from './TablaUsuarios.module.css';

function nombreCompleto(usuario) {
  return [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');
}

/**
 * Acciones de una fila ("Editar" y "Desactivar"/"Activar"). Las cuentas de administrador
 * son de solo lectura en esta pantalla.
 *
 * En la tabla (`variante="iconos"`) son dos botones de ícono con tooltip, para no repetir texto en cada fila;
 * en las tarjetas móviles (`variante="botones"`) llevan texto y áreas táctiles de 44 px.
 */
function AccionesUsuario({ usuario, protegido, variante, alEditar, alCambiarEstado }) {
  if (protegido) {
    return (
      <span className={estilos.protegida} title="Las cuentas de administrador no se pueden modificar desde esta pantalla.">
        <Icono nombre="candado" tamano={14} />
        Cuenta protegida
      </span>
    );
  }

  const nombre = nombreCompleto(usuario);
  const verbo = usuario.activo ? 'Desactivar' : 'Activar';

  if (variante === 'iconos') {
    return (
      <div className={estilos.acciones}>
        <button
          type="button"
          className={`${estilos.botonIcono} ${estilos.iconoEditar}`}
          onClick={() => alEditar(usuario)}
          aria-label={`Editar a ${nombre}`}
          title="Editar"
        >
          <Icono nombre="editar" tamano={18} />
        </button>
        <button
          type="button"
          className={`${estilos.botonIcono} ${usuario.activo ? estilos.iconoDesactivar : estilos.iconoActivar}`}
          onClick={() => alCambiarEstado(usuario)}
          aria-label={`${verbo} a ${nombre}`}
          title={verbo}
        >
          <Icono nombre={usuario.activo ? 'usuario-desactivar' : 'usuario-activar'} tamano={18} />
        </button>
      </div>
    );
  }

  return (
    <div className={estilos.acciones}>
      <button
        type="button"
        className={`${estilos.boton} ${estilos.botonEditar}`}
        onClick={() => alEditar(usuario)}
        aria-label={`Editar a ${nombre}`}
      >
        <Icono nombre="editar" tamano={16} />
        Editar
      </button>
      <button
        type="button"
        className={`${estilos.boton} ${usuario.activo ? estilos.botonDesactivar : estilos.botonActivar}`}
        onClick={() => alCambiarEstado(usuario)}
        aria-label={`${verbo} a ${nombre}`}
      >
        {verbo}
      </button>
    </div>
  );
}

function InsigniaEstado({ activo }) {
  return <Insignia tono={activo ? 'verde' : 'gris'}>{activo ? 'Activo' : 'Desactivado'}</Insignia>;
}

function CeldaNombre({ usuario }) {
  return (
    <div className={estilos.celdaNombre}>
      <Avatar nombre={usuario.nombre} apellido={usuario.apellido} atenuado={!usuario.activo} />
      <div>
        <span className={estilos.nombre}>{nombreCompleto(usuario)}</span>
        {usuario.rol === 'Estudiante' && usuario.codigoEstudiante && (
          <span className={estilos.codigo}>Código: {usuario.codigoEstudiante}</span>
        )}
      </div>
    </div>
  );
}

const ATRIBUTO_ARIA_SORT = { asc: 'ascending', desc: 'descending' };

/**
 * Encabezado de columna que se puede ordenar: un botón dentro del `<th>`, con `aria-sort` y una
 * flecha en la columna activa. Sin `alOrdenar` es un encabezado normal.
 */
function EncabezadoOrdenable({ campo, orden, alOrdenar, className, children }) {
  if (!alOrdenar) {
    return <th scope="col" className={className}>{children}</th>;
  }

  const activo = orden?.campo === campo;

  return (
    <th scope="col" className={className} aria-sort={activo ? ATRIBUTO_ARIA_SORT[orden.direccion] : 'none'}>
      <button type="button" className={estilos.botonOrden} onClick={() => alOrdenar(campo)}>
        {children}
        <span className={`${estilos.flechaOrden} ${activo ? estilos.flechaActiva : ''}`}>
          <Icono nombre={activo && orden.direccion === 'desc' ? 'chevron-arriba' : 'chevron-abajo'} tamano={14} />
        </span>
      </button>
    </th>
  );
}

/**
 * Listado de usuarios: tabla en escritorio y tarjetas por debajo de 768 px (GUI §11).
 * Solo pinta; el filtrado, los modales y las llamadas a la API viven en la página.
 *
 * @param {Object} props
 * @param {Array} props.usuarios Usuarios ya filtrados.
 * @param {(usuario: Object) => boolean} props.esProtegido `true` si la cuenta no se puede modificar.
 * @param {(usuario: Object) => void} props.alEditar
 * @param {(usuario: Object) => void} props.alCambiarEstado Abre la confirmación de activar/desactivar.
 * @param {{ campo: string, direccion: 'asc'|'desc' }} [props.orden] Orden vigente; marca la columna activa.
 * @param {(campo: string) => void} [props.alOrdenar] Si se pasa, Nombre y Estado se pueden ordenar desde el encabezado.
 */
export default function TablaUsuarios({ usuarios, esProtegido, alEditar, alCambiarEstado, orden, alOrdenar }) {
  return (
    <div className={estilos.contenedor}>
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>Usuarios registrados en el sistema.</caption>
          <thead>
            <tr>
              <EncabezadoOrdenable campo="nombre" orden={orden} alOrdenar={alOrdenar} className={estilos.colNombre}>
                Nombre completo
              </EncabezadoOrdenable>
              <th scope="col">DNI</th>
              <th scope="col">Correo</th>
              <th scope="col">Rol</th>
              <EncabezadoOrdenable campo="estado" orden={orden} alOrdenar={alOrdenar}>
                Estado
              </EncabezadoOrdenable>
              <th scope="col" className={estilos.colAcciones}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className={`${estilos.fila} ${usuario.activo ? '' : estilos.filaInactiva}`}>
                <td>
                  <CeldaNombre usuario={usuario} />
                </td>
                <td className={estilos.dni}>{usuario.dni}</td>
                <td>
                  <span className={estilos.correo}>{usuario.correo}</span>
                </td>
                <td>
                  <Insignia tono={TONO_ROL[usuario.rol]}>{usuario.rol}</Insignia>
                </td>
                <td>
                  <InsigniaEstado activo={usuario.activo} />
                </td>
                <td className={estilos.celdaAcciones}>
                  <AccionesUsuario
                    usuario={usuario}
                    protegido={esProtegido(usuario)}
                    variante="iconos"
                    alEditar={alEditar}
                    alCambiarEstado={alCambiarEstado}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={estilos.listaTarjetas} aria-label="Usuarios registrados">
        {usuarios.map((usuario) => (
          <li key={usuario.id} className={estilos.tarjeta}>
            <div className={estilos.filaSuperior}>
              <CeldaNombre usuario={usuario} />
              <InsigniaEstado activo={usuario.activo} />
            </div>

            <div className={estilos.insigniasTarjeta}>
              <Insignia tono={TONO_ROL[usuario.rol]}>{usuario.rol}</Insignia>
            </div>

            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>DNI:</span> <span className={estilos.dni}>{usuario.dni}</span>
            </p>
            <p className={estilos.campo}>
              <span className={estilos.rotuloCampo}>Correo:</span>{' '}
              <span className={estilos.correoTarjeta}>{usuario.correo}</span>
            </p>

            <AccionesUsuario
              usuario={usuario}
              protegido={esProtegido(usuario)}
              variante="botones"
              alEditar={alEditar}
              alCambiarEstado={alCambiarEstado}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
