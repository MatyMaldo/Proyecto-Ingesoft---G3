import { Navigate } from 'react-router-dom';

import AccesoNoAutorizado from '../components/AccesoNoAutorizado.jsx';
import useAuth from './useAuth.js';
import { RUTA_LOGIN } from './constantesSesion.js';

/**
 * Protege su contenido según la sesión y, opcionalmente, el rol.
 * Sin sesión, redirige a `/iniciar-sesion` (ya no muestra un aviso: existe login).
 *
 * Mejora de UX: oculta pantallas que el rol no puede usar. No es la autorización:
 * el backend valida el rol en cada solicitud y rechaza sin devolver datos
 * (HU-SAT-07, lista de verificación).
 *
 * @param {Object} props
 * @param {string[]} [props.rolesPermitidos] Omitida o vacía: solo exige sesión.
 * @param {import('react').ReactNode} props.children
 */
export default function RutaProtegida({ rolesPermitidos, children }) {
  const { usuario, tieneAcceso } = useAuth();

  if (!usuario) {
    return <Navigate to={RUTA_LOGIN} replace />;
  }

  if (!tieneAcceso(rolesPermitidos)) {
    return <AccesoNoAutorizado />;
  }

  return children;
}
