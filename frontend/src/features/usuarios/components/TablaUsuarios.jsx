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
 */
function AccionesUsuario({ usuario, protegido, alEditar, alCambiarEstado }) {
  if (protegido) {
    return (
      <span className={estilos.protegida} title="Las cuentas de administrador no se pueden modificar desde esta pantalla.">
        <Icono nombre="candado" tamano={14} />
        Cuenta protegida
      </span>
    );
  }

  const nombre = nombreCompleto(usuario);

  return (
    <div className={estilos.acciones}>
      <button
        type="button"
        className={`${estilos.boton} ${estilos.botonEditar}`}
        onClick={() => alEditar(usuario)}
        aria-label={`Editar a ${nombre}`}
      >
        Editar
      </button>
      <button
        type="button"
        className={`${estilos.boton} ${usuario.activo ? estilos.botonDesactivar : estilos.botonActivar}`}
        onClick={() => alCambiarEstado(usuario)}
        aria-label={`${usuario.activo ? 'Desactivar' : 'Activar'} a ${nombre}`}
      >
        {usuario.activo ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  );
}

function InsigniaEstado({ activo }) {
  return <Insignia tono={activo ? 'verde' : 'gris'}>{activo ? 'Activo' : 'Desactivado'}</Insignia>;
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
 */
export default function TablaUsuarios({ usuarios, esProtegido, alEditar, alCambiarEstado }) {
  return (
    <div className={estilos.contenedor}>
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>Usuarios registrados en el sistema.</caption>
          <thead>
            <tr>
              <th scope="col" className={estilos.colNombre}>Nombre completo</th>
              <th scope="col">DNI</th>
              <th scope="col">Rol</th>
              <th scope="col">Correo</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className={estilos.fila}>
                <td>
                  <span className={estilos.nombre}>{nombreCompleto(usuario)}</span>
                  {usuario.rol === 'Estudiante' && usuario.codigoEstudiante && (
                    <span className={estilos.codigo}>Código: {usuario.codigoEstudiante}</span>
                  )}
                </td>
                <td className={estilos.dni}>{usuario.dni}</td>
                <td>
                  <Insignia tono={TONO_ROL[usuario.rol]}>{usuario.rol}</Insignia>
                </td>
                <td>
                  <span className={estilos.correo} title={usuario.correo}>{usuario.correo}</span>
                </td>
                <td>
                  <InsigniaEstado activo={usuario.activo} />
                </td>
                <td>
                  <AccionesUsuario
                    usuario={usuario}
                    protegido={esProtegido(usuario)}
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
              <div>
                <span className={estilos.nombre}>{nombreCompleto(usuario)}</span>
                {usuario.rol === 'Estudiante' && usuario.codigoEstudiante && (
                  <span className={estilos.codigo}>Código: {usuario.codigoEstudiante}</span>
                )}
              </div>
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
              alEditar={alEditar}
              alCambiarEstado={alCambiarEstado}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
