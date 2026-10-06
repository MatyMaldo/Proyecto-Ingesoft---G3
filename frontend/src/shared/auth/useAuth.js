import { useContext } from 'react';

import { AuthContext } from './AuthContext.jsx';

/**
 * Lee el contexto de autenticación.
 *
 * @returns {{
 *   usuario: { nombre: string, nombreCompleto: string, rol: string, etiquetaRol: string, correo: string }|null,
 *   estaAutenticado: boolean,
 *   tieneAcceso: (rolesPermitidos?: string[]) => boolean
 * }}
 */
export default function useAuth() {
  const contexto = useContext(AuthContext);

  if (contexto === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return contexto;
}
