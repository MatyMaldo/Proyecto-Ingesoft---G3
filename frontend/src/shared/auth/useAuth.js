import { useContext } from 'react';

import { AuthContext } from './AuthContext.jsx';

/**
 * Lee el contexto de autenticación (sesión real, JWT en `sessionStorage`).
 *
 * @returns {{
 *   usuario: { id: *, nombre: string, rol: string, etiquetaRol: string }|null,
 *   estaAutenticado: boolean,
 *   tieneAcceso: (rolesPermitidos?: string[]) => boolean,
 *   establecerSesion: (resultado: { token: string, usuario: { id: *, nombre: string, rol: string } }) => void,
 *   cerrarSesion: () => void
 * }}
 */
export default function useAuth() {
  const contexto = useContext(AuthContext);

  if (contexto === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return contexto;
}
