import AccesoNoAutorizado from '../components/AccesoNoAutorizado.jsx';
import useAuth from './useAuth.js';

/**
 * Protege su contenido según la sesión y, opcionalmente, el rol.
 * Nunca redirige (no existe `/login`): muestra un aviso en su lugar.
 *
 * @param {Object} props
 * @param {string[]} [props.rolesPermitidos] Omitida o vacía: solo exige sesión.
 * @param {import('react').ReactNode} props.children
 */
export default function RutaProtegida({ rolesPermitidos, children }) {
  const { usuario, tieneAcceso } = useAuth();

  if (!usuario) {
    return <AccesoNoAutorizado motivo="sin-sesion" />;
  }

  if (!tieneAcceso(rolesPermitidos)) {
    return <AccesoNoAutorizado motivo="sin-permiso" />;
  }

  return children;
}
