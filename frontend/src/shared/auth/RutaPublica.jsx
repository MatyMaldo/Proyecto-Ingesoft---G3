import { Navigate } from 'react-router-dom';

import useAuth from './useAuth.js';

/**
 * Guard inverso de `RutaProtegida`, para pantallas públicas (hoy, solo
 * `/iniciar-sesion`). Con sesión, redirige a `/`, que a su vez lleva a la
 * pantalla principal del rol. Es el único mecanismo de navegación tras un
 * login correcto: al llamar `establecerSesion`, este componente se vuelve a
 * renderizar y redirige, sin que compitan dos navegaciones.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 */
export default function RutaPublica({ children }) {
  const { estaAutenticado } = useAuth();

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}
